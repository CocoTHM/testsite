import { Router, Response } from 'express';
import { AuthRequest } from '../types/auth';
import { isAuthenticated, isActive } from '../middleware/auth';
import prisma from '../config/database';
import { XPService } from '../services/xpService';

const router = Router();

// Get quiz for a course
router.get('/:quizId', isAuthenticated, isActive, async (req: AuthRequest, res: Response) => {
  try {
    const { quizId } = req.params;

    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: {
          orderBy: { order: 'asc' },
          select: {
            id: true,
            question: true,
            questionType: true,
            options: true,
            order: true,
            points: true,
            // Don't send correct answers
          },
        },
        course: true,
      },
    });

    if (!quiz) {
      return res.status(404).json({ error: 'Quiz non trouvé' });
    }

    res.json({ quiz });
  } catch (error) {
    console.error('Error fetching quiz:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Submit quiz answers
router.post('/:quizId/submit', isAuthenticated, isActive, async (req: AuthRequest, res: Response) => {
  try {
    const { quizId } = req.params;
    const { answers } = req.body; // { questionId: answer }

    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: true,
        course: true,
      },
    });

    if (!quiz) {
      return res.status(404).json({ error: 'Quiz non trouvé' });
    }

    // Calculate score
    let totalPoints = 0;
    let earnedPoints = 0;
    const results: any = {};

    quiz.questions.forEach(question => {
      totalPoints += question.points;
      const userAnswer = answers[question.id];
      const isCorrect = userAnswer === question.correctAnswer;
      
      if (isCorrect) {
        earnedPoints += question.points;
      }

      results[question.id] = {
        userAnswer,
        isCorrect,
        correctAnswer: question.correctAnswer,
        explanation: question.explanation,
      };
    });

    const scorePercentage = Math.round((earnedPoints / totalPoints) * 100);
    const isPassed = scorePercentage >= quiz.passingScore;

    // Save result
    await prisma.quizResult.create({
      data: {
        userId: req.user!.id,
        quizId: quiz.id,
        score: scorePercentage,
        answers: results,
        isPassed,
      },
    });

    // Award XP if passed
    if (isPassed) {
      await XPService.awardXP(req.user!.id, quiz.course.category, quiz.xpReward);

      // Check for quiz champion badge
      const quizCount = await prisma.quizResult.count({
        where: {
          userId: req.user!.id,
          isPassed: true,
        },
      });

      if (quizCount >= 50) {
        const badge = await prisma.badge.findUnique({ where: { name: 'quiz_champion' } });
        if (badge) {
          const existingBadge = await prisma.userBadge.findUnique({
            where: {
              userId_badgeId: {
                userId: req.user!.id,
                badgeId: badge.id,
              },
            },
          });

          if (!existingBadge) {
            await prisma.userBadge.create({
              data: {
                userId: req.user!.id,
                badgeId: badge.id,
              },
            });
          }
        }
      }
    }

    res.json({
      score: scorePercentage,
      isPassed,
      results,
      xpEarned: isPassed ? quiz.xpReward : 0,
    });
  } catch (error) {
    console.error('Error submitting quiz:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Get user quiz results
router.get('/results/me', isAuthenticated, isActive, async (req: AuthRequest, res: Response) => {
  try {
    const results = await prisma.quizResult.findMany({
      where: { userId: req.user!.id },
      include: {
        quiz: {
          include: {
            course: true,
          },
        },
      },
      orderBy: { completedAt: 'desc' },
    });

    res.json({ results });
  } catch (error) {
    console.error('Error fetching quiz results:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;
