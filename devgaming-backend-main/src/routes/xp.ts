import { Router, Response } from 'express';
import { AuthRequest } from '../types/auth';
import { isAuthenticated, isActive } from '../middleware/auth';
import { XPService } from '../services/xpService';
import prisma from '../config/database';

const router = Router();

// Get leaderboard
router.get('/leaderboard', isAuthenticated, isActive, async (req: AuthRequest, res: Response) => {
  try {
    const { category = 'global', limit = 100 } = req.query;
    
    const leaderboard = await XPService.getLeaderboard(
      category as string,
      parseInt(limit as string, 10)
    );

    res.json({ leaderboard });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Get user XP stats
router.get('/me', isAuthenticated, isActive, async (req: AuthRequest, res: Response) => {
  try {
    const xpStats = await prisma.userXP.findMany({
      where: { userId: req.user!.id },
    });

    const xpWithProgress = xpStats.map(stat => ({
      category: stat.category,
      xp: stat.xp,
      level: stat.level,
      nextLevelXP: XPService.calculateXPForLevel(stat.level + 1),
      progress: ((stat.xp - XPService.calculateXPForLevel(stat.level)) / 
                (XPService.calculateXPForLevel(stat.level + 1) - XPService.calculateXPForLevel(stat.level))) * 100,
    }));

    res.json({ xpStats: xpWithProgress });
  } catch (error) {
    console.error('Error fetching XP stats:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;
