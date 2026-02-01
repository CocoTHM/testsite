import { Router, Response } from 'express';
import { AuthRequest } from '../types/auth';
import { isAuthenticated, isActive } from '../middleware/auth';
import prisma from '../config/database';

const router = Router();

// Get all badges
router.get('/all', isAuthenticated, isActive, async (req: AuthRequest, res: Response) => {
  try {
    const badges = await prisma.badge.findMany({
      orderBy: [
        { category: 'asc' },
        { rarity: 'desc' },
      ],
    });

    res.json({ badges });
  } catch (error) {
    console.error('Error fetching badges:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Get user badges
router.get('/me', isAuthenticated, isActive, async (req: AuthRequest, res: Response) => {
  try {
    const userBadges = await prisma.userBadge.findMany({
      where: { userId: req.user!.id },
      include: {
        badge: true,
      },
      orderBy: { earnedAt: 'desc' },
    });

    res.json({
      badges: userBadges.map(ub => ({
        ...ub.badge,
        earnedAt: ub.earnedAt,
      })),
    });
  } catch (error) {
    console.error('Error fetching user badges:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;
