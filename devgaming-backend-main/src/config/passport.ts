import passport from 'passport';
import { Strategy as GitHubStrategy } from 'passport-github2';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { config } from '../config';
import prisma from '../config/database';

// Serialize user
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

// Deserialize user
passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
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
      },
    });

    if (!user) {
      return done(null, false);
    }

    const roles = user.roles.map(ur => ur.role.name);
    const permissions = user.roles.flatMap(ur => 
      ur.role.permissions.map(rp => rp.permission.name)
    );

    const authUser = {
      id: user.id,
      email: user.email,
      username: user.username,
      displayName: user.displayName,
      avatar: user.avatar,
      provider: user.provider,
      isActive: user.isActive,
      roles: [...new Set(roles)],
      permissions: [...new Set(permissions)],
    };

    done(null, authUser);
  } catch (error) {
    done(error, false);
  }
});

// GitHub Strategy
passport.use(
  new GitHubStrategy(
    {
      clientID: config.github.clientId,
      clientSecret: config.github.clientSecret,
      callbackURL: config.github.callbackUrl,
    },
    async (accessToken: string, refreshToken: string, profile: any, done: any) => {
      try {
        const email = profile.emails?.[0]?.value || `${profile.username}@github.local`;
        const avatar = profile.photos?.[0]?.value || null;

        let user = await prisma.user.findUnique({
          where: {
            provider_providerId: {
              provider: 'github',
              providerId: profile.id,
            },
          },
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
          },
        });

        if (!user) {
          // Create new user
          const userRole = await prisma.role.findUnique({ where: { name: 'user' } });
          
          user = await prisma.user.create({
            data: {
              email,
              username: profile.username,
              displayName: profile.displayName || profile.username,
              avatar,
              provider: 'github',
              providerId: profile.id,
              isActive: true,
              lastLoginAt: new Date(),
              roles: userRole ? {
                create: {
                  roleId: userRole.id,
                },
              } : undefined,
            },
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
            },
          });

          // Initialize XP
          await prisma.userXP.create({
            data: {
              userId: user.id,
              category: 'global',
              xp: 0,
              level: 1,
            },
          });

          // Award first login badge
          const firstLoginBadge = await prisma.badge.findUnique({ where: { name: 'first_login' } });
          if (firstLoginBadge) {
            await prisma.userBadge.create({
              data: {
                userId: user.id,
                badgeId: firstLoginBadge.id,
              },
            });
          }

          // Log activity
          await prisma.activityLog.create({
            data: {
              userId: user.id,
              action: 'user_registered',
              category: 'auth',
              description: `New user registered via GitHub: ${user.username}`,
              metadata: { provider: 'github' },
            },
          });

          // Send Discord notification
          await prisma.discordNotification.create({
            data: {
              webhookType: 'general',
              event: 'new_user',
              payload: {
                username: user.username,
                email: user.email,
                provider: 'github',
              },
            },
          });
        } else {
          // Update last login
          user = await prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
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
            },
          });
        }

        const roles = user.roles.map(ur => ur.role.name);
        const permissions = user.roles.flatMap(ur => 
          ur.role.permissions.map(rp => rp.permission.name)
        );

        const authUser = {
          id: user.id,
          email: user.email,
          username: user.username,
          displayName: user.displayName,
          avatar: user.avatar,
          provider: user.provider,
          isActive: user.isActive,
          roles: [...new Set(roles)],
          permissions: [...new Set(permissions)],
        };

        return done(null, authUser);
      } catch (error) {
        return done(error, false);
      }
    }
  )
);

// Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: config.google.clientId,
      clientSecret: config.google.clientSecret,
      callbackURL: config.google.callbackUrl,
    },
    async (accessToken: string, refreshToken: string, profile: any, done: any) => {
      try {
        const email = profile.emails?.[0]?.value;
        const avatar = profile.photos?.[0]?.value || null;
        const username = email?.split('@')[0] || profile.id;

        let user = await prisma.user.findUnique({
          where: {
            provider_providerId: {
              provider: 'google',
              providerId: profile.id,
            },
          },
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
          },
        });

        if (!user) {
          const userRole = await prisma.role.findUnique({ where: { name: 'user' } });
          
          user = await prisma.user.create({
            data: {
              email: email!,
              username,
              displayName: profile.displayName || username,
              avatar,
              provider: 'google',
              providerId: profile.id,
              isActive: true,
              lastLoginAt: new Date(),
              roles: userRole ? {
                create: {
                  roleId: userRole.id,
                },
              } : undefined,
            },
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
            },
          });

          await prisma.userXP.create({
            data: {
              userId: user.id,
              category: 'global',
              xp: 0,
              level: 1,
            },
          });

          const firstLoginBadge = await prisma.badge.findUnique({ where: { name: 'first_login' } });
          if (firstLoginBadge) {
            await prisma.userBadge.create({
              data: {
                userId: user.id,
                badgeId: firstLoginBadge.id,
              },
            });
          }

          await prisma.activityLog.create({
            data: {
              userId: user.id,
              action: 'user_registered',
              category: 'auth',
              description: `New user registered via Google: ${user.username}`,
              metadata: { provider: 'google' },
            },
          });

          await prisma.discordNotification.create({
            data: {
              webhookType: 'general',
              event: 'new_user',
              payload: {
                username: user.username,
                email: user.email,
                provider: 'google',
              },
            },
          });
        } else {
          user = await prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
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
            },
          });
        }

        const roles = user.roles.map(ur => ur.role.name);
        const permissions = user.roles.flatMap(ur => 
          ur.role.permissions.map(rp => rp.permission.name)
        );

        const authUser = {
          id: user.id,
          email: user.email,
          username: user.username,
          displayName: user.displayName,
          avatar: user.avatar,
          provider: user.provider,
          isActive: user.isActive,
          roles: [...new Set(roles)],
          permissions: [...new Set(permissions)],
        };

        return done(null, authUser);
      } catch (error) {
        return done(error, false);
      }
    }
  )
);

export default passport;
