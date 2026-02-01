🚀 CRÉER LES TABLES MANUELLEMENT - GUIDE COMPLET
================================================

MÉTHODE : Exécuter le SQL directement dans Railway PostgreSQL

## 📍 ÉTAPE 1 : Accéder au Query Editor Railway

1. Ouvrez https://railway.app/dashboard
2. Cliquez sur votre projet "app.shelve"
3. Cliquez sur le service **"Postgres"** (PAS backend)
4. Cliquez sur l'onglet **"Data"** (en haut)
5. Cliquez sur **"Query"** (sous-onglet)

Vous verrez un éditeur SQL avec un bouton "Run Query".

## 📍 ÉTAPE 2 : Créer les tables

1. **Ouvrez le fichier** : `backend/CREATE-TABLES.sql`
2. **Copiez TOUT le contenu** (Cmd+A puis Cmd+C)
3. **Collez dans le Query Editor Railway**
4. **Cliquez sur "Run Query"**

⏱️ Temps d'exécution : ~5 secondes

✅ Résultat attendu :
```
Query executed successfully
17 tables created
```

## 📍 ÉTAPE 3 : Insérer les données initiales

1. **Ouvrez le fichier** : `backend/INSERT-DATA.sql`
2. **Copiez TOUT le contenu** (Cmd+A puis Cmd+C)
3. **Collez dans le Query Editor Railway**
4. **Cliquez sur "Run Query"**

⏱️ Temps d'exécution : ~3 secondes

✅ Résultat attendu :
```
INSERT 0 5 (roles)
INSERT 0 11 (permissions)
INSERT 0 10 (badges)
INSERT 0 9 (courses)
INSERT 0 16 (lessons)
```

## 📍 ÉTAPE 4 : Vérifier les tables

Dans le Query Editor, tapez :

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

✅ Vous devriez voir 17 tables :
- _prisma_migrations
- activity_logs
- badges
- course_progress
- courses
- discord_notifications
- lesson_progress
- lessons
- permissions
- projects
- quiz_questions
- quiz_results
- quizzes
- role_permissions
- roles
- user_badges
- user_roles
- user_xp
- users

## 📍 ÉTAPE 5 : Vérifier les données

```sql
SELECT COUNT(*) as total FROM roles;
-- Résultat attendu : 5

SELECT COUNT(*) as total FROM permissions;
-- Résultat attendu : 11

SELECT COUNT(*) as total FROM badges;
-- Résultat attendu : 10

SELECT COUNT(*) as total FROM courses;
-- Résultat attendu : 9
```

## ✅ TERMINÉ !

Votre base de données est maintenant prête avec :
- ✅ 17 tables créées
- ✅ 14 foreign keys configurées
- ✅ 18 index pour les performances
- ✅ 5 rôles (admin, moderator, dev_pro, gaming_pro, user)
- ✅ 11 permissions
- ✅ 10 badges
- ✅ 9 cours avec ~16 leçons

## 🔄 PROCHAINES ÉTAPES

1. **Redémarrer le backend Railway** (pour recharger Prisma)
   ```bash
   railway up --detach
   ```

2. **Tester l'API** :
   ```bash
   curl https://votre-backend.railway.app/health
   ```

3. **Déployer le frontend Vercel** :
   ```bash
   cd frontend
   vercel --prod
   ```

## ⚠️ EN CAS D'ERREUR

Si une table existe déjà :
```sql
DROP TABLE IF EXISTS "nom_table" CASCADE;
```

Pour tout supprimer et recommencer :
```sql
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
```

Puis réexécutez CREATE-TABLES.sql et INSERT-DATA.sql.

## 📋 FICHIERS SQL CRÉÉS

1. **CREATE-TABLES.sql** - Création de toutes les tables (480 lignes)
2. **INSERT-DATA.sql** - Insertion des données initiales (420 lignes)

Ces fichiers sont dans : `backend/`
