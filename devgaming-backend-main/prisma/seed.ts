import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // ========================================
  // ROLES
  // ========================================
  console.log('Creating roles...');
  
  const adminRole = await prisma.role.upsert({
    where: { name: 'admin' },
    update: {},
    create: {
      name: 'admin',
      displayName: 'Administrateur',
      description: 'Accès complet à la plateforme',
    },
  });

  const moderatorRole = await prisma.role.upsert({
    where: { name: 'moderator' },
    update: {},
    create: {
      name: 'moderator',
      displayName: 'Modérateur',
      description: 'Modération des contenus et utilisateurs',
    },
  });

  const devProRole = await prisma.role.upsert({
    where: { name: 'dev_pro' },
    update: {},
    create: {
      name: 'dev_pro',
      displayName: 'PRO Dev',
      description: 'Accès zone PRO développement',
    },
  });

  const gamingProRole = await prisma.role.upsert({
    where: { name: 'gaming_pro' },
    update: {},
    create: {
      name: 'gaming_pro',
      displayName: 'PRO Gaming',
      description: 'Accès zone PRO gaming',
    },
  });

  await prisma.role.upsert({
    where: { name: 'user' },
    update: {},
    create: {
      name: 'user',
      displayName: 'Utilisateur',
      description: 'Utilisateur standard',
    },
  });

  // ========================================
  // PERMISSIONS
  // ========================================
  console.log('Creating permissions...');

  const permissions = [
    // Admin
    { name: 'admin.access', displayName: 'Accès Dashboard Admin', category: 'admin' },
    { name: 'admin.users', displayName: 'Gestion Utilisateurs', category: 'admin' },
    { name: 'admin.roles', displayName: 'Gestion Rôles', category: 'admin' },
    { name: 'admin.content', displayName: 'Gestion Contenus', category: 'admin' },
    { name: 'admin.stats', displayName: 'Statistiques', category: 'admin' },
    
    // PRO
    { name: 'pro.dev', displayName: 'Accès PRO Dev', category: 'pro' },
    { name: 'pro.gaming', displayName: 'Accès PRO Gaming', category: 'pro' },
    
    // CTF
    { name: 'ctf.access', displayName: 'Accès CTF', category: 'ctf' },
    { name: 'ctf.early', displayName: 'Tests CTF Anticipés', category: 'ctf' },
    
    // Moderation
    { name: 'moderate.content', displayName: 'Modérer Contenus', category: 'moderate' },
    { name: 'moderate.users', displayName: 'Modérer Utilisateurs', category: 'moderate' },
  ];

  const createdPermissions = await Promise.all(
    permissions.map(p => 
      prisma.permission.upsert({
        where: { name: p.name },
        update: {},
        create: p,
      })
    )
  );

  // ========================================
  // ROLE PERMISSIONS
  // ========================================
  console.log('Assigning permissions to roles...');

  // Admin - toutes les permissions
  for (const perm of createdPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: adminRole.id,
          permissionId: perm.id,
        },
      },
      update: {},
      create: {
        roleId: adminRole.id,
        permissionId: perm.id,
      },
    });
  }

  // Moderator - permissions de modération
  const modPerms = createdPermissions.filter(p => 
    p.category === 'moderate' || p.name === 'admin.access'
  );
  for (const perm of modPerms) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: moderatorRole.id,
          permissionId: perm.id,
        },
      },
      update: {},
      create: {
        roleId: moderatorRole.id,
        permissionId: perm.id,
      },
    });
  }

  // Dev PRO
  const devProPerms = createdPermissions.filter(p => 
    p.name === 'pro.dev' || p.name === 'ctf.access' || p.name === 'ctf.early'
  );
  for (const perm of devProPerms) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: devProRole.id,
          permissionId: perm.id,
        },
      },
      update: {},
      create: {
        roleId: devProRole.id,
        permissionId: perm.id,
      },
    });
  }

  // Gaming PRO
  const gamingProPerm = createdPermissions.find(p => p.name === 'pro.gaming');
  if (gamingProPerm) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: gamingProRole.id,
          permissionId: gamingProPerm.id,
        },
      },
      update: {},
      create: {
        roleId: gamingProRole.id,
        permissionId: gamingProPerm.id,
      },
    });
  }

  // ========================================
  // BADGES
  // ========================================
  console.log('Creating badges...');

  const badges = [
    { name: 'first_login', displayName: 'Premier Pas', description: 'Première connexion', icon: '👋', category: 'achievement', xpReward: 10, rarity: 'common' },
    { name: 'first_course', displayName: 'Étudiant', description: 'Premier cours complété', icon: '📚', category: 'course', xpReward: 50, rarity: 'common' },
    { name: 'python_master', displayName: 'Maître Python', description: 'Tous les cours Python complétés', icon: '🐍', category: 'course', xpReward: 500, rarity: 'epic' },
    { name: 'javascript_master', displayName: 'Maître JavaScript', description: 'Tous les cours JavaScript complétés', icon: '⚡', category: 'course', xpReward: 500, rarity: 'epic' },
    { name: 'quiz_champion', displayName: 'Champion des Quiz', description: '50 quiz réussis', icon: '🏆', category: 'achievement', xpReward: 200, rarity: 'rare' },
    { name: 'gaming_expert', displayName: 'Expert Gaming', description: 'Tous les quiz gaming complétés', icon: '🎮', category: 'gaming', xpReward: 300, rarity: 'rare' },
    { name: 'cyber_security', displayName: 'Cyber Défenseur', description: 'Parcours cybersécurité complété', icon: '🔒', category: 'cybersecurity', xpReward: 600, rarity: 'epic' },
    { name: 'pro_member', displayName: 'Membre PRO', description: 'Accès PRO activé', icon: '💎', category: 'achievement', xpReward: 100, rarity: 'legendary' },
    { name: 'streak_7', displayName: 'Semaine Parfaite', description: '7 jours consécutifs d\'activité', icon: '🔥', category: 'achievement', xpReward: 150, rarity: 'rare' },
    { name: 'level_10', displayName: 'Niveau 10', description: 'Atteindre le niveau 10', icon: '⭐', category: 'achievement', xpReward: 200, rarity: 'rare' },
  ];

  await Promise.all(
    badges.map(b => 
      prisma.badge.upsert({
        where: { name: b.name },
        update: {},
        create: b,
      })
    )
  );

  // ========================================
  // COURSES - DÉVELOPPEMENT
  // ========================================
  console.log('Creating courses...');

  // Python
  const pythonCourse = await prisma.course.upsert({
    where: { slug: 'python-fundamentals' },
    update: {},
    create: {
      slug: 'python-fundamentals',
      title: 'Python - Les Fondamentaux',
      description: 'Apprenez les bases de Python, le langage polyvalent et puissant',
      category: 'dev',
      language: 'python',
      difficulty: 'beginner',
      xpReward: 500,
      order: 1,
      isPublished: true,
      isPro: false,
    },
  });

  await prisma.lesson.createMany({
    data: [
      { courseId: pythonCourse.id, title: 'Introduction à Python', content: 'Découvrez Python et son écosystème...', order: 1, duration: 30, xpReward: 10 },
      { courseId: pythonCourse.id, title: 'Variables et Types de données', content: 'Apprenez les types de base...', order: 2, duration: 45, xpReward: 15 },
      { courseId: pythonCourse.id, title: 'Structures de contrôle', content: 'If, else, loops...', order: 3, duration: 60, xpReward: 20 },
      { courseId: pythonCourse.id, title: 'Fonctions', content: 'Créez vos propres fonctions...', order: 4, duration: 50, xpReward: 20 },
      { courseId: pythonCourse.id, title: 'Listes et Dictionnaires', content: 'Structures de données...', order: 5, duration: 55, xpReward: 25 },
    ],
    skipDuplicates: true,
  });

  // JavaScript
  const jsCourse = await prisma.course.upsert({
    where: { slug: 'javascript-essentials' },
    update: {},
    create: {
      slug: 'javascript-essentials',
      title: 'JavaScript Essentiel',
      description: 'Maîtrisez JavaScript, le langage du web',
      category: 'dev',
      language: 'javascript',
      difficulty: 'beginner',
      xpReward: 500,
      order: 2,
      isPublished: true,
      isPro: false,
    },
  });

  await prisma.lesson.createMany({
    data: [
      { courseId: jsCourse.id, title: 'Introduction à JavaScript', content: 'Découvrez JavaScript...', order: 1, duration: 30, xpReward: 10 },
      { courseId: jsCourse.id, title: 'Variables et Scope', content: 'var, let, const...', order: 2, duration: 40, xpReward: 15 },
      { courseId: jsCourse.id, title: 'Fonctions et Arrow Functions', content: 'Fonctions modernes...', order: 3, duration: 50, xpReward: 20 },
      { courseId: jsCourse.id, title: 'DOM Manipulation', content: 'Interagir avec la page...', order: 4, duration: 60, xpReward: 25 },
    ],
    skipDuplicates: true,
  });

  // C++
  await prisma.course.upsert({
    where: { slug: 'cpp-basics' },
    update: {},
    create: {
      slug: 'cpp-basics',
      title: 'C++ pour Débutants',
      description: 'Apprenez C++, langage performant pour le gaming et systèmes',
      category: 'dev',
      language: 'cpp',
      difficulty: 'intermediate',
      xpReward: 600,
      order: 3,
      isPublished: true,
      isPro: false,
    },
  });

  // Unity
  await prisma.course.upsert({
    where: { slug: 'unity-game-dev' },
    update: {},
    create: {
      slug: 'unity-game-dev',
      title: 'Développement de Jeux avec Unity',
      description: 'Créez vos premiers jeux avec Unity et C#',
      category: 'gaming',
      language: 'csharp',
      difficulty: 'intermediate',
      xpReward: 800,
      order: 1,
      isPublished: true,
      isPro: false,
    },
  });

  // ========================================
  // COURSES - CYBERSÉCURITÉ
  // ========================================
  const cyberBasics = await prisma.course.upsert({
    where: { slug: 'cybersecurity-basics' },
    update: {},
    create: {
      slug: 'cybersecurity-basics',
      title: 'Bases de la Cybersécurité',
      description: 'Introduction aux concepts fondamentaux de la sécurité informatique',
      category: 'cybersecurity',
      difficulty: 'beginner',
      xpReward: 400,
      order: 1,
      isPublished: true,
      isPro: false,
    },
  });

  await prisma.lesson.createMany({
    data: [
      { courseId: cyberBasics.id, title: 'Introduction à la Cybersécurité', content: 'Concepts de base...', order: 1, duration: 40, xpReward: 15 },
      { courseId: cyberBasics.id, title: 'Cryptographie Symétrique', content: 'AES, DES...', order: 2, duration: 50, xpReward: 20 },
      { courseId: cyberBasics.id, title: 'Cryptographie Asymétrique', content: 'RSA, ECC...', order: 3, duration: 55, xpReward: 25 },
      { courseId: cyberBasics.id, title: 'Sécurité des Réseaux', content: 'Firewalls, VPN...', order: 4, duration: 60, xpReward: 30 },
    ],
    skipDuplicates: true,
  });

  const webSecurity = await prisma.course.upsert({
    where: { slug: 'web-security' },
    update: {},
    create: {
      slug: 'web-security',
      title: 'Sécurité Web',
      description: 'Protégez vos applications web contre les attaques',
      category: 'cybersecurity',
      difficulty: 'intermediate',
      xpReward: 600,
      order: 2,
      isPublished: true,
      isPro: true, // PRO
    },
  });

  await prisma.lesson.createMany({
    data: [
      { courseId: webSecurity.id, title: 'XSS - Cross-Site Scripting', content: 'Comprendre et prévenir les XSS...', order: 1, duration: 45, xpReward: 25 },
      { courseId: webSecurity.id, title: 'SQL Injection', content: 'Protéger vos bases de données...', order: 2, duration: 50, xpReward: 30 },
      { courseId: webSecurity.id, title: 'CSRF et CORS', content: 'Attaques cross-origin...', order: 3, duration: 40, xpReward: 25 },
    ],
    skipDuplicates: true,
  });

  // ========================================
  // COURSES - SYSTÈMES & RÉSEAUX
  // ========================================
  await prisma.course.upsert({
    where: { slug: 'linux-fundamentals' },
    update: {},
    create: {
      slug: 'linux-fundamentals',
      title: 'Linux - Les Fondamentaux',
      description: 'Maîtrisez Linux pour le développement et l\'administration',
      category: 'systems',
      difficulty: 'beginner',
      xpReward: 500,
      order: 1,
      isPublished: true,
      isPro: false,
    },
  });

  await prisma.course.upsert({
    where: { slug: 'networking-basics' },
    update: {},
    create: {
      slug: 'networking-basics',
      title: 'Réseaux TCP/IP',
      description: 'Comprendre les réseaux et protocoles',
      category: 'systems',
      difficulty: 'intermediate',
      xpReward: 600,
      order: 2,
      isPublished: true,
      isPro: false,
    },
  });

  // ========================================
  // COURSES - GAMING
  // ========================================
  await prisma.course.upsert({
    where: { slug: 'gaming-culture' },
    update: {},
    create: {
      slug: 'gaming-culture',
      title: 'Culture Gaming & Esport',
      description: 'Histoire du jeu vidéo et culture esport',
      category: 'gaming',
      difficulty: 'beginner',
      xpReward: 300,
      order: 2,
      isPublished: true,
      isPro: false,
    },
  });

  console.log('✅ Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
