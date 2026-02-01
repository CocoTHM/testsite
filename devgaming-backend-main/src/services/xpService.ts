import prisma from '../config/database';

export class XPService {
  // Award XP to user
  static async awardXP(userId: string, category: string, xpAmount: number): Promise<void> {
    const userXP = await prisma.userXP.findUnique({
      where: {
        userId_category: {
          userId,
          category,
        },
      },
    });

    if (!userXP) {
      await prisma.userXP.create({
        data: {
          userId,
          category,
          xp: xpAmount,
          level: this.calculateLevel(xpAmount),
        },
      });
    } else {
      const newXP = userXP.xp + xpAmount;
      const newLevel = this.calculateLevel(newXP);
      const leveledUp = newLevel > userXP.level;

      await prisma.userXP.update({
        where: { id: userXP.id },
        data: {
          xp: newXP,
          level: newLevel,
          lastActivity: new Date(),
        },
      });

      // Check for level badges
      if (leveledUp && category === 'global') {
        await this.checkLevelBadges(userId, newLevel);
      }
    }

    // Also update global XP
    if (category !== 'global') {
      await this.awardXP(userId, 'global', Math.floor(xpAmount * 0.5));
    }
  }

  // Calculate level from XP
  static calculateLevel(xp: number): number {
    // Level formula: level = floor(sqrt(xp / 100))
    return Math.floor(Math.sqrt(xp / 100)) + 1;
  }

  // Calculate XP needed for next level
  static calculateXPForLevel(level: number): number {
    return Math.pow(level - 1, 2) * 100;
  }

  // Get leaderboard
  static async getLeaderboard(category: string = 'global', limit: number = 100) {
    const leaderboard = await prisma.userXP.findMany({
      where: { category },
      orderBy: { xp: 'desc' },
      take: limit,
      include: {
        user: {
          select: {
            username: true,
            displayName: true,
            avatar: true,
          },
        },
      },
    });

    return leaderboard.map((entry, index) => ({
      rank: index + 1,
      username: entry.user.username,
      displayName: entry.user.displayName,
      avatar: entry.user.avatar,
      xp: entry.xp,
      level: entry.level,
      nextLevelXP: this.calculateXPForLevel(entry.level + 1),
    }));
  }

  // Check and award level badges
  private static async checkLevelBadges(userId: string, level: number): Promise<void> {
    const levelMilestones = [5, 10, 25, 50, 100];
    
    for (const milestone of levelMilestones) {
      if (level === milestone) {
        const badgeName = `level_${milestone}`;
        const badge = await prisma.badge.findUnique({ where: { name: badgeName } });
        
        if (badge) {
          const existingBadge = await prisma.userBadge.findUnique({
            where: {
              userId_badgeId: {
                userId,
                badgeId: badge.id,
              },
            },
          });

          if (!existingBadge) {
            await prisma.userBadge.create({
              data: {
                userId,
                badgeId: badge.id,
              },
            });

            // Award badge XP
            if (badge.xpReward > 0) {
              await this.awardXP(userId, 'global', badge.xpReward);
            }
          }
        }
      }
    }
  }
}
