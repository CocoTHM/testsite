import { Router, Response } from 'express';
import { AuthRequest } from '../types/auth';
import { isAuthenticated, isActive, hasPermission } from '../middleware/auth';
import prisma from '../config/database';
import { DiscordService } from '../services/discordService';

const router = Router();

// All admin routes require admin.access permission
router.use(isAuthenticated, isActive, hasPermission('admin.access'));

// ========================================
// DASHBOARD STATS
// ========================================
router.get('/stats', async (req: AuthRequest, res: Response) => {
  try {
    const [
      totalUsers,
      activeUsers,
      totalCourses,
      totalQuizzes,
      recentActivities,
      roleDistribution,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({
        where: {
          lastLoginAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
          },
        },
      }),
      prisma.course.count({ where: { isPublished: true } }),
      prisma.quiz.count(),
      prisma.activityLog.findMany({
        take: 50,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              username: true,
              avatar: true,
            },
          },
        },
      }),
      prisma.userRole.groupBy({
        by: ['roleId'],
        _count: true,
      }),
    ]);

    // Get role names
    const roles = await prisma.role.findMany();
    const roleDistributionWithNames = roleDistribution.map(rd => {
      const role = roles.find(r => r.id === rd.roleId);
      return {
        role: role?.displayName || 'Unknown',
        count: rd._count,
      };
    });

    res.json({
      totalUsers,
      activeUsers,
      totalCourses,
      totalQuizzes,
      recentActivities,
      roleDistribution: roleDistributionWithNames,
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ========================================
// USER MANAGEMENT
// ========================================

// Get all users
router.get('/users', async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 50, search, role, isActive } = req.query;
    
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const take = parseInt(limit as string);

    const where: any = {};
    
    if (search) {
      where.OR = [
        { username: { contains: search as string, mode: 'insensitive' } },
        { email: { contains: search as string, mode: 'insensitive' } },
        { displayName: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    if (role) {
      where.roles = {
        some: {
          role: {
            name: role as string,
          },
        },
      };
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          roles: {
            include: {
              role: true,
            },
          },
          xp: {
            where: { category: 'global' },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    res.json({
      users: users.map(user => ({
        id: user.id,
        username: user.username,
        email: user.email,
        displayName: user.displayName,
        avatar: user.avatar,
        provider: user.provider,
        isActive: user.isActive,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt,
        roles: user.roles.map(ur => ur.role),
        xp: user.xp[0]?.xp || 0,
        level: user.xp[0]?.level || 1,
      })),
      pagination: {
        total,
        page: parseInt(page as string),
        limit: take,
        totalPages: Math.ceil(total / take),
      },
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Get single user details
router.get('/users/:userId', async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        roles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
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
        activityLogs: {
          take: 100,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Update user status (activate/deactivate)
router.put('/users/:userId/status', hasPermission('admin.users'), async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const { isActive, reason } = req.body;

    const user = await prisma.user.update({
      where: { id: userId },
      data: { isActive },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: isActive ? 'user_activated' : 'user_deactivated',
        category: 'admin',
        description: `User ${isActive ? 'activated' : 'deactivated'} by ${req.user!.username}`,
        metadata: { reason, modifiedBy: req.user!.id },
      },
    });

    // Discord notification if deactivated
    if (!isActive) {
      await DiscordService.notifyUserDeactivated(user.username, reason || 'No reason provided', req.user!.username);
    }

    res.json({ message: 'Statut utilisateur mis à jour', user });
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Update user role
router.put('/users/:userId/role', hasPermission('admin.roles'), async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const { roleId, action } = req.body; // action: 'add' or 'remove'

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    const role = await prisma.role.findUnique({ where: { id: roleId } });
    if (!role) {
      return res.status(404).json({ error: 'Rôle non trouvé' });
    }

    if (action === 'add') {
      // Add role
      await prisma.userRole.create({
        data: {
          userId,
          roleId,
          grantedBy: req.user!.id,
        },
      });

      // Award PRO badge if applicable
      if (role.name === 'dev_pro' || role.name === 'gaming_pro') {
        const proType = role.name === 'dev_pro' ? 'dev' : 'gaming';
        await DiscordService.notifyProAccess(user.username, proType);

        const proBadge = await prisma.badge.findUnique({ where: { name: 'pro_member' } });
        if (proBadge) {
          const existingBadge = await prisma.userBadge.findUnique({
            where: {
              userId_badgeId: {
                userId: user.id,
                badgeId: proBadge.id,
              },
            },
          });

          if (!existingBadge) {
            await prisma.userBadge.create({
              data: {
                userId: user.id,
                badgeId: proBadge.id,
              },
            });
          }
        }
      }
    } else if (action === 'remove') {
      // Remove role
      await prisma.userRole.deleteMany({
        where: {
          userId,
          roleId,
        },
      });
    }

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: 'role_changed',
        category: 'admin',
        description: `Role ${action === 'add' ? 'added' : 'removed'}: ${role.displayName}`,
        metadata: {
          role: role.name,
          action,
          modifiedBy: req.user!.id,
        },
      },
    });

    // Discord notification
    const oldRoles = user.roles.map(ur => ur.role.displayName).join(', ');
    await DiscordService.notifyRoleChange(
      user.username,
      oldRoles,
      action === 'add' ? `${oldRoles}, ${role.displayName}` : oldRoles.replace(role.displayName, '').replace(', ,', ','),
      req.user!.username
    );

    res.json({ message: 'Rôle utilisateur mis à jour' });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ========================================
// ROLES & PERMISSIONS MANAGEMENT
// ========================================

// Get all roles with permissions
router.get('/roles', async (req: AuthRequest, res: Response) => {
  try {
    const roles = await prisma.role.findMany({
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
        users: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    res.json({
      roles: roles.map(role => ({
        ...role,
        permissions: role.permissions.map(rp => rp.permission),
        userCount: role.users.length,
      })),
    });
  } catch (error) {
    console.error('Error fetching roles:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Get all permissions
router.get('/permissions', async (req: AuthRequest, res: Response) => {
  try {
    const permissions = await prisma.permission.findMany({
      orderBy: [
        { category: 'asc' },
        { name: 'asc' },
      ],
    });

    // Group by category
    const grouped = permissions.reduce((acc: any, perm) => {
      if (!acc[perm.category]) {
        acc[perm.category] = [];
      }
      acc[perm.category].push(perm);
      return acc;
    }, {});

    res.json({ permissions: grouped });
  } catch (error) {
    console.error('Error fetching permissions:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ========================================
// CONTENT MANAGEMENT
// ========================================

// Get all courses (admin view)
router.get('/courses', hasPermission('admin.content'), async (req: AuthRequest, res: Response) => {
  try {
    const courses = await prisma.course.findMany({
      include: {
        lessons: true,
        quizzes: true,
        progress: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      courses: courses.map(course => ({
        ...course,
        lessonsCount: course.lessons.length,
        quizzesCount: course.quizzes.length,
        enrolledUsers: course.progress.length,
        completedUsers: course.progress.filter(p => p.isCompleted).length,
      })),
    });
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Toggle course published status
router.put('/courses/:courseId/publish', hasPermission('admin.content'), async (req: AuthRequest, res: Response) => {
  try {
    const { courseId } = req.params;
    const { isPublished } = req.body;

    const course = await prisma.course.update({
      where: { id: courseId },
      data: { isPublished },
    });

    res.json({ message: 'Statut du cours mis à jour', course });
  } catch (error) {
    console.error('Error updating course status:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ========================================
// ACTIVITY LOGS
// ========================================

// Get recent activity logs
router.get('/logs', async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 100, category, userId } = req.query;
    
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const take = parseInt(limit as string);

    const where: any = {};
    if (category) where.category = category as string;
    if (userId) where.userId = userId as string;

    const [logs, total] = await Promise.all([
      prisma.activityLog.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              username: true,
              avatar: true,
            },
          },
        },
      }),
      prisma.activityLog.count({ where }),
    ]);

    res.json({
      logs,
      pagination: {
        total,
        page: parseInt(page as string),
        limit: take,
        totalPages: Math.ceil(total / take),
      },
    });
  } catch (error) {
    console.error('Error fetching activity logs:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;
