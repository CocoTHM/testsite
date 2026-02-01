#!/bin/bash

# Script de déploiement automatique du Backend sur Railway
# Étape par étape avec guidage

set -e

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}"
echo "╔══════════════════════════════════════════════════════════╗"
echo "║                                                          ║"
echo "║     🚂 DÉPLOIEMENT BACKEND SUR RAILWAY                  ║"
echo "║                                                          ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""

# Vérifier si on est dans le bon dossier
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Erreur: Ce script doit être exécuté depuis le dossier backend${NC}"
    echo "Utilisez: cd backend && ./deploy-backend.sh"
    exit 1
fi

# ÉTAPE 1: Vérifier Railway CLI
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📦 ÉTAPE 1/12 : Vérification de Railway CLI${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

if ! command -v railway &> /dev/null; then
    echo -e "${YELLOW}⚠️  Railway CLI non installé. Installation...${NC}"
    npm install -g @railway/cli
    echo -e "${GREEN}✅ Railway CLI installé${NC}"
else
    echo -e "${GREEN}✅ Railway CLI déjà installé${NC}"
fi
echo ""
read -p "Appuyez sur Entrée pour continuer..."
echo ""

# ÉTAPE 2: Login Railway
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🔐 ÉTAPE 2/12 : Connexion à Railway${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}Un lien va s'afficher. Copiez-le et ouvrez-le dans votre navigateur.${NC}"
echo ""
read -p "Appuyez sur Entrée pour ouvrir le lien de connexion..."

railway login --browserless

echo -e "${GREEN}✅ Connecté à Railway${NC}"
echo ""
read -p "Appuyez sur Entrée pour continuer..."
echo ""

# ÉTAPE 3: Créer le projet
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🆕 ÉTAPE 3/12 : Création du projet Railway${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}Entrez un nom pour votre projet (ex: devgaming-backend)${NC}"
echo ""

railway init

echo -e "${GREEN}✅ Projet créé${NC}"
echo ""
read -p "Appuyez sur Entrée pour continuer..."
echo ""

# ÉTAPE 4: Instructions pour PostgreSQL
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🗄️  ÉTAPE 4/12 : Ajout de PostgreSQL${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${YELLOW}⚠️  ACTION MANUELLE REQUISE :${NC}"
echo ""
echo "1. Ouvrez https://railway.app/dashboard"
echo "2. Cliquez sur votre projet"
echo "3. Cliquez sur '+ New'"
echo "4. Sélectionnez 'Database' → 'Add PostgreSQL'"
echo "5. Attendez que PostgreSQL soit déployé (statut vert)"
echo ""
railway open
echo ""
read -p "Une fois PostgreSQL ajouté, appuyez sur Entrée..."
echo -e "${GREEN}✅ PostgreSQL configuré${NC}"
echo ""

# ÉTAPE 5: Générer JWT Secret
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🔑 ÉTAPE 5/12 : Génération du JWT Secret${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
echo -e "${GREEN}JWT Secret généré :${NC}"
echo -e "${YELLOW}${JWT_SECRET}${NC}"
echo ""
echo -e "${YELLOW}⚠️  COPIEZ CE SECRET QUELQUE PART !${NC}"
echo ""
read -p "Appuyez sur Entrée pour continuer..."
echo ""

# ÉTAPE 6: Configuration OAuth
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🔐 ÉTAPE 6/12 : Configuration OAuth Apps${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${YELLOW}═══ GITHUB OAUTH ═══${NC}"
echo ""
echo "1. Ouvrez https://github.com/settings/developers"
echo "2. Cliquez 'New OAuth App'"
echo "3. Remplissez :"
echo "   - Application name: DevGaming Platform"
echo "   - Homepage URL: http://localhost:3000"
echo "   - Callback URL: http://localhost:5000/api/auth/github/callback"
echo "4. Cliquez 'Register application'"
echo "5. Copiez le Client ID"
echo "6. Générez et copiez le Client Secret"
echo ""
read -p "GitHub OAuth App créée ? (Entrée pour continuer)"
echo ""

read -p "Entrez votre GITHUB_CLIENT_ID : " GITHUB_CLIENT_ID
read -p "Entrez votre GITHUB_CLIENT_SECRET : " GITHUB_CLIENT_SECRET
echo ""

echo -e "${YELLOW}═══ GOOGLE OAUTH ═══${NC}"
echo ""
echo "1. Ouvrez https://console.cloud.google.com"
echo "2. Créez un nouveau projet (bouton en haut)"
echo "3. Allez dans 'APIs & Services' → 'Credentials'"
echo "4. Configurez l'écran de consentement OAuth (External)"
echo "5. Créez des identifiants OAuth 2.0 Client ID"
echo "6. Type : Application Web"
echo "7. Redirect URI: http://localhost:5000/api/auth/google/callback"
echo "8. Copiez le Client ID et Client Secret"
echo ""
read -p "Google OAuth App créée ? (Entrée pour continuer)"
echo ""

read -p "Entrez votre GOOGLE_CLIENT_ID : " GOOGLE_CLIENT_ID
read -p "Entrez votre GOOGLE_CLIENT_SECRET : " GOOGLE_CLIENT_SECRET
echo ""

echo -e "${GREEN}✅ Credentials OAuth collectés${NC}"
echo ""

# ÉTAPE 7: Configurer les variables d'environnement
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}⚙️  ÉTAPE 7/12 : Configuration des variables${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo "Configuration des variables d'environnement..."

railway variables set DATABASE_URL='${{Postgres.DATABASE_URL}}'
railway variables set JWT_SECRET="$JWT_SECRET"
railway variables set GITHUB_CLIENT_ID="$GITHUB_CLIENT_ID"
railway variables set GITHUB_CLIENT_SECRET="$GITHUB_CLIENT_SECRET"
railway variables set GOOGLE_CLIENT_ID="$GOOGLE_CLIENT_ID"
railway variables set GOOGLE_CLIENT_SECRET="$GOOGLE_CLIENT_SECRET"
railway variables set NODE_ENV="production"
railway variables set PORT="5000"

echo -e "${GREEN}✅ Variables de base configurées${NC}"
echo ""
read -p "Appuyez sur Entrée pour continuer..."
echo ""

# ÉTAPE 8: Déployer
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🚀 ÉTAPE 8/12 : Déploiement sur Railway${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${YELLOW}Déploiement en cours... Cela peut prendre 2-3 minutes${NC}"
echo ""

railway up

echo ""
echo -e "${GREEN}✅ Application déployée${NC}"
echo ""
read -p "Appuyez sur Entrée pour continuer..."
echo ""

# ÉTAPE 9: Générer le domaine
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🌐 ÉTAPE 9/12 : Génération du domaine${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${YELLOW}⚠️  ACTION MANUELLE REQUISE :${NC}"
echo ""
echo "1. Le dashboard Railway va s'ouvrir"
echo "2. Cliquez sur votre service backend"
echo "3. Allez dans 'Settings'"
echo "4. Scrollez jusqu'à 'Networking'"
echo "5. Cliquez 'Generate Domain'"
echo "6. Copiez l'URL générée (xxx.up.railway.app)"
echo ""

railway open

echo ""
read -p "Entrez l'URL Railway générée (sans https://) : " RAILWAY_DOMAIN
RAILWAY_URL="https://${RAILWAY_DOMAIN}"

echo ""
echo -e "${GREEN}URL Backend : ${RAILWAY_URL}${NC}"
echo ""

# ÉTAPE 10: Mettre à jour les variables avec les URLs
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🔄 ÉTAPE 10/12 : Mise à jour des URLs${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

railway variables set BACKEND_URL="$RAILWAY_URL"
railway variables set GITHUB_CALLBACK_URL="${RAILWAY_URL}/api/auth/github/callback"
railway variables set GOOGLE_CALLBACK_URL="${RAILWAY_URL}/api/auth/google/callback"
railway variables set FRONTEND_URL="http://localhost:3000"

echo -e "${GREEN}✅ URLs mises à jour${NC}"
echo ""
echo -e "${YELLOW}Le service va se redéployer automatiquement (1-2 min)...${NC}"
sleep 5
echo ""

# ÉTAPE 11: Mettre à jour OAuth
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🔐 ÉTAPE 11/12 : Mise à jour OAuth Callbacks${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${YELLOW}═══ GITHUB OAUTH ═══${NC}"
echo ""
echo "1. Retournez sur https://github.com/settings/developers"
echo "2. Cliquez sur votre application 'DevGaming Platform'"
echo "3. Modifiez Authorization callback URL vers :"
echo -e "   ${GREEN}${RAILWAY_URL}/api/auth/github/callback${NC}"
echo "4. Cliquez 'Update application'"
echo ""
read -p "GitHub OAuth mis à jour ? (Entrée pour continuer)"
echo ""

echo -e "${YELLOW}═══ GOOGLE OAUTH ═══${NC}"
echo ""
echo "1. Retournez sur https://console.cloud.google.com"
echo "2. APIs & Services → Credentials"
echo "3. Cliquez sur votre OAuth Client ID"
echo "4. Dans 'Authorized redirect URIs', remplacez par :"
echo -e "   ${GREEN}${RAILWAY_URL}/api/auth/google/callback${NC}"
echo "5. Ajoutez aussi dans 'Authorized JavaScript origins' :"
echo -e "   ${GREEN}${RAILWAY_URL}${NC}"
echo "6. Cliquez 'SAVE'"
echo ""
read -p "Google OAuth mis à jour ? (Entrée pour continuer)"
echo ""

echo -e "${GREEN}✅ OAuth callbacks mis à jour${NC}"
echo ""

# ÉTAPE 12: Seed la base de données
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🌱 ÉTAPE 12/12 : Seed de la base de données${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${YELLOW}⚠️  ACTION MANUELLE REQUISE :${NC}"
echo ""
echo "1. Le dashboard Railway va s'ouvrir"
echo "2. Cliquez sur votre service backend"
echo "3. Allez dans 'Deployments'"
echo "4. Cliquez sur le dernier déploiement"
echo "5. Cliquez sur l'icône de terminal (Shell) en haut à droite"
echo "6. Dans le terminal, tapez : npx prisma db seed"
echo "7. Attendez que ça se termine"
echo ""

railway open

echo ""
read -p "Base de données seedée ? (Entrée pour continuer)"
echo ""

echo -e "${GREEN}✅ Base de données initialisée${NC}"
echo ""

# Résumé final
echo -e "${GREEN}"
echo "╔══════════════════════════════════════════════════════════╗"
echo "║                                                          ║"
echo "║     ✅ BACKEND DÉPLOYÉ AVEC SUCCÈS !                    ║"
echo "║                                                          ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""
echo -e "${BLUE}📝 INFORMATIONS IMPORTANTES :${NC}"
echo ""
echo -e "Backend URL    : ${GREEN}${RAILWAY_URL}${NC}"
echo -e "API Endpoint   : ${GREEN}${RAILWAY_URL}/api${NC}"
echo -e "Health Check   : ${GREEN}${RAILWAY_URL}/health${NC}"
echo ""
echo -e "${YELLOW}🧪 TESTEZ LE BACKEND :${NC}"
echo ""
echo "Ouvrez dans votre navigateur :"
echo -e "${GREEN}${RAILWAY_URL}/health${NC}"
echo ""
echo "Vous devriez voir une réponse JSON."
echo ""
echo -e "${BLUE}📋 NOTEZ CES INFORMATIONS :${NC}"
echo ""
echo "Backend URL    : ${RAILWAY_URL}"
echo "JWT Secret     : ${JWT_SECRET}"
echo "GitHub ID      : ${GITHUB_CLIENT_ID}"
echo "Google ID      : ${GOOGLE_CLIENT_ID}"
echo ""
echo -e "${YELLOW}🎯 PROCHAINE ÉTAPE :${NC}"
echo ""
echo "Déployez maintenant le frontend sur Vercel avec :"
echo -e "${GREEN}cd ../frontend && ./deploy-frontend.sh${NC}"
echo ""
echo -e "${GREEN}Ou suivez le guide DEPLOY-STEP-BY-STEP.md (Partie B)${NC}"
echo ""
