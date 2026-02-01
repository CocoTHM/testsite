-- ========================================
-- DONNÉES INITIALES (SEED)
-- ========================================
-- À exécuter APRÈS avoir créé les tables
-- Correspond à prisma/seed.ts

-- ========================================
-- 1. ROLES (5 rôles)
-- ========================================

INSERT INTO "roles" ("id", "name", "displayName", "description", "createdAt", "updatedAt")
VALUES 
    (gen_random_uuid()::text, 'admin', 'Administrateur', 'Accès complet à la plateforme', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (gen_random_uuid()::text, 'moderator', 'Modérateur', 'Modération des contenus et utilisateurs', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (gen_random_uuid()::text, 'dev_pro', 'PRO Dev', 'Accès zone PRO développement', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (gen_random_uuid()::text, 'gaming_pro', 'PRO Gaming', 'Accès zone PRO gaming', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (gen_random_uuid()::text, 'user', 'Utilisateur', 'Utilisateur standard', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("name") DO NOTHING;

-- ========================================
-- 2. PERMISSIONS (11 permissions)
-- ========================================

INSERT INTO "permissions" ("id", "name", "displayName", "description", "category", "createdAt")
VALUES 
    (gen_random_uuid()::text, 'admin.access', 'Accès Dashboard Admin', NULL, 'admin', CURRENT_TIMESTAMP),
    (gen_random_uuid()::text, 'admin.users', 'Gestion Utilisateurs', NULL, 'admin', CURRENT_TIMESTAMP),
    (gen_random_uuid()::text, 'admin.roles', 'Gestion Rôles', NULL, 'admin', CURRENT_TIMESTAMP),
    (gen_random_uuid()::text, 'admin.content', 'Gestion Contenus', NULL, 'admin', CURRENT_TIMESTAMP),
    (gen_random_uuid()::text, 'admin.stats', 'Statistiques', NULL, 'admin', CURRENT_TIMESTAMP),
    (gen_random_uuid()::text, 'pro.dev', 'Accès PRO Dev', NULL, 'pro', CURRENT_TIMESTAMP),
    (gen_random_uuid()::text, 'pro.gaming', 'Accès PRO Gaming', NULL, 'pro', CURRENT_TIMESTAMP),
    (gen_random_uuid()::text, 'ctf.access', 'Accès CTF', NULL, 'ctf', CURRENT_TIMESTAMP),
    (gen_random_uuid()::text, 'ctf.early', 'Tests CTF Anticipés', NULL, 'ctf', CURRENT_TIMESTAMP),
    (gen_random_uuid()::text, 'moderate.content', 'Modérer Contenus', NULL, 'moderate', CURRENT_TIMESTAMP),
    (gen_random_uuid()::text, 'moderate.users', 'Modérer Utilisateurs', NULL, 'moderate', CURRENT_TIMESTAMP)
ON CONFLICT ("name") DO NOTHING;

-- ========================================
-- 3. ROLE PERMISSIONS (ASSOCIATIONS)
-- ========================================

-- Admin: TOUTES les permissions
INSERT INTO "role_permissions" ("id", "roleId", "permissionId")
SELECT 
    gen_random_uuid()::text,
    r.id,
    p.id
FROM "roles" r
CROSS JOIN "permissions" p
WHERE r.name = 'admin'
ON CONFLICT ("roleId", "permissionId") DO NOTHING;

-- Moderator: permissions de modération + accès admin
INSERT INTO "role_permissions" ("id", "roleId", "permissionId")
SELECT 
    gen_random_uuid()::text,
    r.id,
    p.id
FROM "roles" r
CROSS JOIN "permissions" p
WHERE r.name = 'moderator'
  AND (p.category = 'moderate' OR p.name = 'admin.access')
ON CONFLICT ("roleId", "permissionId") DO NOTHING;

-- Dev PRO: pro.dev + CTF
INSERT INTO "role_permissions" ("id", "roleId", "permissionId")
SELECT 
    gen_random_uuid()::text,
    r.id,
    p.id
FROM "roles" r
CROSS JOIN "permissions" p
WHERE r.name = 'dev_pro'
  AND p.name IN ('pro.dev', 'ctf.access', 'ctf.early')
ON CONFLICT ("roleId", "permissionId") DO NOTHING;

-- Gaming PRO: pro.gaming
INSERT INTO "role_permissions" ("id", "roleId", "permissionId")
SELECT 
    gen_random_uuid()::text,
    r.id,
    p.id
FROM "roles" r
CROSS JOIN "permissions" p
WHERE r.name = 'gaming_pro'
  AND p.name = 'pro.gaming'
ON CONFLICT ("roleId", "permissionId") DO NOTHING;

-- ========================================
-- 4. BADGES (10 badges)
-- ========================================

INSERT INTO "badges" ("id", "name", "displayName", "description", "icon", "category", "xpReward", "rarity", "createdAt")
VALUES 
    (gen_random_uuid()::text, 'first_login', 'Premier Pas', 'Première connexion', '👋', 'achievement', 10, 'common', CURRENT_TIMESTAMP),
    (gen_random_uuid()::text, 'first_course', 'Étudiant', 'Premier cours complété', '📚', 'course', 50, 'common', CURRENT_TIMESTAMP),
    (gen_random_uuid()::text, 'python_master', 'Maître Python', 'Tous les cours Python complétés', '🐍', 'course', 500, 'epic', CURRENT_TIMESTAMP),
    (gen_random_uuid()::text, 'javascript_master', 'Maître JavaScript', 'Tous les cours JavaScript complétés', '⚡', 'course', 500, 'epic', CURRENT_TIMESTAMP),
    (gen_random_uuid()::text, 'quiz_champion', 'Champion des Quiz', '50 quiz réussis', '🏆', 'achievement', 200, 'rare', CURRENT_TIMESTAMP),
    (gen_random_uuid()::text, 'gaming_expert', 'Expert Gaming', 'Tous les quiz gaming complétés', '🎮', 'gaming', 300, 'rare', CURRENT_TIMESTAMP),
    (gen_random_uuid()::text, 'cyber_security', 'Cyber Défenseur', 'Parcours cybersécurité complété', '🔒', 'cybersecurity', 600, 'epic', CURRENT_TIMESTAMP),
    (gen_random_uuid()::text, 'pro_member', 'Membre PRO', 'Accès PRO activé', '💎', 'achievement', 100, 'legendary', CURRENT_TIMESTAMP),
    (gen_random_uuid()::text, 'streak_7', 'Semaine Parfaite', '7 jours consécutifs d''activité', '🔥', 'achievement', 150, 'rare', CURRENT_TIMESTAMP),
    (gen_random_uuid()::text, 'level_10', 'Niveau 10', 'Atteindre le niveau 10', '⭐', 'achievement', 200, 'rare', CURRENT_TIMESTAMP)
ON CONFLICT ("name") DO NOTHING;

-- ========================================
-- 5. COURSES (10 cours)
-- ========================================

-- Python
INSERT INTO "courses" ("id", "slug", "title", "description", "category", "language", "difficulty", "xpReward", "order", "isPublished", "isPro", "createdAt", "updatedAt")
VALUES 
    (gen_random_uuid()::text, 'python-fundamentals', 'Python - Les Fondamentaux', 'Apprenez les bases de Python, le langage polyvalent et puissant', 'dev', 'python', 'beginner', 500, 1, true, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (gen_random_uuid()::text, 'javascript-essentials', 'JavaScript Essentiel', 'Maîtrisez JavaScript, le langage du web', 'dev', 'javascript', 'beginner', 500, 2, true, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (gen_random_uuid()::text, 'cpp-basics', 'C++ pour Débutants', 'Apprenez C++, langage performant pour le gaming et systèmes', 'dev', 'cpp', 'intermediate', 600, 3, true, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (gen_random_uuid()::text, 'unity-game-dev', 'Développement de Jeux avec Unity', 'Créez vos premiers jeux avec Unity et C#', 'gaming', 'csharp', 'intermediate', 800, 1, true, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (gen_random_uuid()::text, 'cybersecurity-basics', 'Bases de la Cybersécurité', 'Introduction aux concepts fondamentaux de la sécurité informatique', 'cybersecurity', NULL, 'beginner', 400, 1, true, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (gen_random_uuid()::text, 'web-security', 'Sécurité Web', 'Protégez vos applications web contre les attaques', 'cybersecurity', NULL, 'intermediate', 600, 2, true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (gen_random_uuid()::text, 'linux-fundamentals', 'Linux - Les Fondamentaux', 'Maîtrisez Linux pour le développement et l''administration', 'systems', NULL, 'beginner', 500, 1, true, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (gen_random_uuid()::text, 'networking-basics', 'Réseaux TCP/IP', 'Comprendre les réseaux et protocoles', 'systems', NULL, 'intermediate', 600, 2, true, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (gen_random_uuid()::text, 'gaming-culture', 'Culture Gaming & Esport', 'Histoire du jeu vidéo et culture esport', 'gaming', NULL, 'beginner', 300, 2, true, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("slug") DO NOTHING;

-- ========================================
-- 6. LESSONS (Leçons pour les cours)
-- ========================================

-- Python Fundamentals
INSERT INTO "lessons" ("id", "courseId", "title", "content", "videoUrl", "order", "duration", "xpReward", "createdAt", "updatedAt")
SELECT 
    gen_random_uuid()::text,
    c.id,
    'Introduction à Python',
    'Découvrez Python et son écosystème...',
    NULL,
    1,
    30,
    10,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM "courses" c WHERE c.slug = 'python-fundamentals'
UNION ALL
SELECT 
    gen_random_uuid()::text,
    c.id,
    'Variables et Types de données',
    'Apprenez les types de base...',
    NULL,
    2,
    45,
    15,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM "courses" c WHERE c.slug = 'python-fundamentals'
UNION ALL
SELECT 
    gen_random_uuid()::text,
    c.id,
    'Structures de contrôle',
    'If, else, loops...',
    NULL,
    3,
    60,
    20,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM "courses" c WHERE c.slug = 'python-fundamentals'
UNION ALL
SELECT 
    gen_random_uuid()::text,
    c.id,
    'Fonctions',
    'Créez vos propres fonctions...',
    NULL,
    4,
    50,
    20,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM "courses" c WHERE c.slug = 'python-fundamentals'
UNION ALL
SELECT 
    gen_random_uuid()::text,
    c.id,
    'Listes et Dictionnaires',
    'Structures de données...',
    NULL,
    5,
    55,
    25,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM "courses" c WHERE c.slug = 'python-fundamentals';

-- JavaScript Essentials
INSERT INTO "lessons" ("id", "courseId", "title", "content", "videoUrl", "order", "duration", "xpReward", "createdAt", "updatedAt")
SELECT 
    gen_random_uuid()::text,
    c.id,
    'Introduction à JavaScript',
    'Découvrez JavaScript...',
    NULL,
    1,
    30,
    10,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM "courses" c WHERE c.slug = 'javascript-essentials'
UNION ALL
SELECT 
    gen_random_uuid()::text,
    c.id,
    'Variables et Scope',
    'var, let, const...',
    NULL,
    2,
    40,
    15,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM "courses" c WHERE c.slug = 'javascript-essentials'
UNION ALL
SELECT 
    gen_random_uuid()::text,
    c.id,
    'Fonctions et Arrow Functions',
    'Fonctions modernes...',
    NULL,
    3,
    50,
    20,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM "courses" c WHERE c.slug = 'javascript-essentials'
UNION ALL
SELECT 
    gen_random_uuid()::text,
    c.id,
    'DOM Manipulation',
    'Interagir avec la page...',
    NULL,
    4,
    60,
    25,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM "courses" c WHERE c.slug = 'javascript-essentials';

-- Cybersecurity Basics
INSERT INTO "lessons" ("id", "courseId", "title", "content", "videoUrl", "order", "duration", "xpReward", "createdAt", "updatedAt")
SELECT 
    gen_random_uuid()::text,
    c.id,
    'Introduction à la Cybersécurité',
    'Concepts de base...',
    NULL,
    1,
    40,
    15,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM "courses" c WHERE c.slug = 'cybersecurity-basics'
UNION ALL
SELECT 
    gen_random_uuid()::text,
    c.id,
    'Cryptographie Symétrique',
    'AES, DES...',
    NULL,
    2,
    50,
    20,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM "courses" c WHERE c.slug = 'cybersecurity-basics'
UNION ALL
SELECT 
    gen_random_uuid()::text,
    c.id,
    'Cryptographie Asymétrique',
    'RSA, ECC...',
    NULL,
    3,
    55,
    25,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM "courses" c WHERE c.slug = 'cybersecurity-basics'
UNION ALL
SELECT 
    gen_random_uuid()::text,
    c.id,
    'Sécurité des Réseaux',
    'Firewalls, VPN...',
    NULL,
    4,
    60,
    30,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM "courses" c WHERE c.slug = 'cybersecurity-basics';

-- Web Security (PRO)
INSERT INTO "lessons" ("id", "courseId", "title", "content", "videoUrl", "order", "duration", "xpReward", "createdAt", "updatedAt")
SELECT 
    gen_random_uuid()::text,
    c.id,
    'XSS - Cross-Site Scripting',
    'Comprendre et prévenir les XSS...',
    NULL,
    1,
    45,
    25,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM "courses" c WHERE c.slug = 'web-security'
UNION ALL
SELECT 
    gen_random_uuid()::text,
    c.id,
    'SQL Injection',
    'Protéger vos bases de données...',
    NULL,
    2,
    50,
    30,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM "courses" c WHERE c.slug = 'web-security'
UNION ALL
SELECT 
    gen_random_uuid()::text,
    c.id,
    'CSRF et CORS',
    'Attaques cross-origin...',
    NULL,
    3,
    40,
    25,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM "courses" c WHERE c.slug = 'web-security';

-- ========================================
-- ✅ DONNÉES INITIALES INSÉRÉES !
-- ========================================
-- Rôles: 5
-- Permissions: 11
-- Badges: 10
-- Cours: 9
-- Leçons: ~16
-- ========================================
