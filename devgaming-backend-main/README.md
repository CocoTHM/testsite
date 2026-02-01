# Backend - DevGaming Platform

Backend API Node.js + Express + Prisma pour la plateforme DevGaming.

## 🚀 Démarrage Rapide

```bash
# Installation
npm install

# Configuration
cp .env.example .env
# Éditez .env avec vos credentials

# Base de données
npx prisma generate
npx prisma migrate dev
npx prisma db seed

# Lancement
npm run dev
```

L'API sera disponible sur http://localhost:5000

## 📊 Prisma Studio

Interface graphique pour gérer la base de données :

```bash
npx prisma studio
```

Accessible sur http://localhost:5555

## 🚢 Déploiement

### Railway

Le backend est configuré pour Railway :
- `railway.toml` - Configuration Railway
- `Procfile` - Commande de démarrage
- `nixpacks.toml` - Configuration du build

Variables d'environnement nécessaires :
- `DATABASE_URL` - Auto-configurée par Railway PostgreSQL
- `JWT_SECRET` - Secret pour JWT
- `GITHUB_CLIENT_ID` & `GITHUB_CLIENT_SECRET`
- `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET`
- `FRONTEND_URL` - URL de votre frontend Vercel
- `BACKEND_URL` - URL Railway de ce backend

## 📚 Documentation

- [Guide de déploiement complet](../DEPLOY.md)
- [Guide rapide](../DEPLOY-QUICK.md)
- [Architecture](../ARCHITECTURE.md)
