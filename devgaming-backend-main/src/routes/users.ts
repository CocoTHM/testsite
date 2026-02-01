import { Router, Response } from 'express';
import { AuthRequest } from '../types/auth';
import { isAuthenticated, isActive } from '../middleware/auth';
import prisma from '../config/database';

const router = Router();

// Get user profile
router.get('/profile', isAuthenticated, isActive, async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
        xp: true,
        badges: {
          include: {
            badge: true,
          },
        },
        courseProgress: {
          include: {
            course: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    res.json({
      id: user.id,
      email: user.email,
      username: user.username,
      displayName: user.displayName,
      avatar: user.avatar,
      provider: user.provider,
      createdAt: user.createdAt,
      roles: user.roles.map(ur => ({
        name: ur.role.name,
        displayName: ur.role.displayName,
      })),
      xp: user.xp,
      badges: user.badges.map(ub => ({
        ...ub.badge,
        earnedAt: ub.earnedAt,
      })),
      coursesInProgress: user.courseProgress.filter(cp => !cp.isCompleted).length,
      coursesCompleted: user.courseProgress.filter(cp => cp.isCompleted).length,
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Update user profile
router.put('/profile', isAuthenticated, isActive, async (req: AuthRequest, res: Response) => {
  try {
    const { displayName, avatar } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: req.user!.id },
      data: {
        ...(displayName && { displayName }),
        ...(avatar && { avatar }),
      },
    });

    res.json({
      message: 'Profil mis à jour',
      user: {
        displayName: updatedUser.displayName,
        avatar: updatedUser.avatar,
      },
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Get user stats
router.get('/stats', isAuthenticated, isActive, async (req: AuthRequest, res: Response) => {
  try {
    const [xpStats, badgesCount, coursesCompleted, quizzesCompleted] = await Promise.all([
      prisma.userXP.findMany({
        where: { userId: req.user!.id },
      }),
      prisma.userBadge.count({
        where: { userId: req.user!.id },
      }),
      prisma.courseProgress.count({
        where: { userId: req.user!.id, isCompleted: true },
      }),
      prisma.quizResult.count({
        where: { userId: req.user!.id, isPassed: true },
      }),
    ]);

    res.json({
      xp: xpStats,
      badgesCount,
      coursesCompleted,
      quizzesCompleted,
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;
