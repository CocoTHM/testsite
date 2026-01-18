# Hack Page - Structure Vercel

## Structure du projet

```
hack-page/
├── api/                    # Fonctions serverless
│   ├── command.js         # Gestion des commandes
│   ├── list.js           # Liste des données
│   ├── receive.js        # Réception des données
│   └── stats.js          # Statistiques
├── public/               # Fichiers statiques
│   ├── index.html       # Page client (cible)
│   └── admin.html       # Panneau de contrôle
├── vercel.json          # Configuration Vercel
├── package.json         # Dépendances
└── .gitignore          # Fichiers ignorés
```

## Déploiement Vercel

1. **Installer Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Se connecter:**
   ```bash
   vercel login
   ```

3. **Configurer Vercel KV:**
   - Dashboard Vercel → Storage → Create Database
   - Choisir "KV (Redis)"
   - Lier au projet

4. **Déployer:**
   ```bash
   vercel --prod
   ```

## URLs

- **Client:** `https://votre-projet.vercel.app/`
- **Admin:** `https://votre-projet.vercel.app/admin`
- **API Stats:** `https://votre-projet.vercel.app/api/stats`
- **API List:** `https://votre-projet.vercel.app/api/list`

## Variables d'environnement

Les variables KV sont automatiquement configurées par Vercel lors de la liaison de la base de données.
