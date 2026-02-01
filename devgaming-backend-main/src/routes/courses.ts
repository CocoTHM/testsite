import { Router, Response } from 'express';
import { AuthRequest } from '../types/auth';
import { isAuthenticated, isActive } from '../middleware/auth';
import prisma from '../config/database';
import { XPService } from '../services/xpService';

const router = Router();

// Get all courses
router.get('/', isAuthenticated, isActive, async (req: AuthRequest, res: Response) => {
  try {
    const { category, language, difficulty, isPro } = req.query;

    const courses = await prisma.course.findMany({
      where: {
        isPublished: true,
        ...(category && { category: category as string }),
        ...(language && { language: language as string }),
        ...(difficulty && { difficulty: difficulty as string }),
        ...(isPro !== undefined && { isPro: isPro === 'true' }),
      },
      orderBy: { order: 'asc' },
      include: {
        lessons: {
          select: {
            id: true,
            title: true,
            order: true,
            duration: true,
            xpReward: true,
          },
          orderBy: { order: 'asc' },
        },
        quizzes: {
          select: {
            id: true,
            title: true,
            xpReward: true,
          },
        },
      },
    });

    // Get user progress
    const userProgress = await prisma.courseProgress.findMany({
      where: { userId: req.user!.id },
      include: {
        lessons: true,
      },
    });

    const coursesWithProgress = courses.map(course => {
      const progress = userProgress.find(p => p.courseId === course.id);
      return {
        ...course,
        progress: progress ? {
          isCompleted: progress.isCompleted,
          lessonsCompleted: progress.lessons.filter(l => l.isCompleted).length,
          totalLessons: course.lessons.length,
          startedAt: progress.startedAt,
        } : null,
      };
    });

    res.json({ courses: coursesWithProgress });
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Get single course
router.get('/:slug', isAuthenticated, isActive, async (req: AuthRequest, res: Response) => {
  try {
    const { slug } = req.params;

    const course = await prisma.course.findUnique({
      where: { slug },
      include: {
        lessons: {
          orderBy: { order: 'asc' },
        },
        quizzes: {
          include: {
            questions: {
              orderBy: { order: 'asc' },
            },
          },
        },
      },
    });

    if (!course) {
      return res.status(404).json({ error: 'Cours non trouvé' });
    }

    // Check if PRO course and user has access
    if (course.isPro) {
      const hasProAccess = req.user!.permissions.includes('pro.dev') || 
                          req.user!.permissions.includes('admin.access');
      if (!hasProAccess) {
        return res.status(403).json({ error: 'Accès PRO requis' });
      }
    }

    // Get user progress
    const progress = await prisma.courseProgress.findUnique({
      where: {
        userId_courseId: {
          userId: req.user!.id,
          courseId: course.id,
        },
      },
      include: {
        lessons: true,
      },
    });

    res.json({
      course,
      progress: progress ? {
        isCompleted: progress.isCompleted,
        lessonsCompleted: progress.lessons.filter(l => l.isCompleted).length,
        totalLessons: course.lessons.length,
        completedLessons: progress.lessons.filter(l => l.isCompleted).map(l => l.lessonId),
      } : null,
    });
  } catch (error) {
    console.error('Error fetching course:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Start/Update course progress
router.post('/:courseId/progress', isAuthenticated, isActive, async (req: AuthRequest, res: Response) => {
  try {
    const { courseId } = req.params;
    const { lessonId, isCompleted } = req.body;

    // Get or create course progress
    let courseProgress = await prisma.courseProgress.findUnique({
      where: {
        userId_courseId: {
          userId: req.user!.id,
          courseId,
        },
      },
      include: {
        lessons: true,
        course: {
          include: {
            lessons: true,
          },
        },
      },
    });

    if (!courseProgress) {
      courseProgress = await prisma.courseProgress.create({
        data: {
          userId: req.user!.id,
          courseId,
        },
        include: {
          lessons: true,
          course: {
            include: {
              lessons: true,
            },
          },
        },
      });
    }

    // Update lesson progress
    if (lessonId && isCompleted !== undefined) {
      const existingLessonProgress = await prisma.lessonProgress.findUnique({
        where: {
          courseProgressId_lessonId: {
            courseProgressId: courseProgress.id,
            lessonId,
          },
        },
      });

      if (existingLessonProgress) {
        await prisma.lessonProgress.update({
          where: { id: existingLessonProgress.id },
          data: {
            isCompleted,
            completedAt: isCompleted ? new Date() : null,
          },
        });
      } else {
        await prisma.lessonProgress.create({
          data: {
            courseProgressId: courseProgress.id,
            lessonId,
            isCompleted,
            completedAt: isCompleted ? new Date() : null,
          },
        });
      }

      // Award XP for lesson completion
      if (isCompleted) {
        const lesson = await prisma.lesson.findUnique({ where: { id: lessonId } });
        if (lesson) {
          await XPService.awardXP(req.user!.id, courseProgress.course.category, lesson.xpReward);
        }
      }
    }

    // Check if all lessons are completed
    const updatedProgress = await prisma.courseProgress.findUnique({
      where: { id: courseProgress.id },
      include: {
        lessons: true,
        course: {
          include: {
            lessons: true,
          },
        },
      },
    });

    const allLessonsCompleted = updatedProgress!.lessons.length === updatedProgress!.course.lessons.length &&
                                updatedProgress!.lessons.every(l => l.isCompleted);

    if (allLessonsCompleted && !updatedProgress!.isCompleted) {
      await prisma.courseProgress.update({
        where: { id: courseProgress.id },
        data: {
          isCompleted: true,
          completedAt: new Date(),
        },
      });

      // Award course XP
      await XPService.awardXP(req.user!.id, courseProgress.course.category, courseProgress.course.xpReward);

      // Check for course completion badge
      const firstCourseBadge = await prisma.badge.findUnique({ where: { name: 'first_course' } });
      if (firstCourseBadge) {
        const existingBadge = await prisma.userBadge.findUnique({
          where: {
            userId_badgeId: {
              userId: req.user!.id,
              badgeId: firstCourseBadge.id,
            },
          },
        });

        if (!existingBadge) {
          await prisma.userBadge.create({
            data: {
              userId: req.user!.id,
              badgeId: firstCourseBadge.id,
            },
          });
        }
      }
    }

    res.json({ message: 'Progression mise à jour', courseProgress: updatedProgress });
  } catch (error) {
    console.error('Error updating course progress:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;
