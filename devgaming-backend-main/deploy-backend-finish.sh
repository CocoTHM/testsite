#!/bin/bash

# Script pour finaliser le déploiement (étapes 10, 11, 12)

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}"
echo "════════════════════════════════════════════════════"
echo "  🔧 FINALISATION DU DÉPLOIEMENT RAILWAY"
echo "  Étapes 10, 11 et 12"
echo "════════════════════════════════════════════════════"
echo -e "${NC}"
echo ""

# Demander l'URL Railway
echo -e "${YELLOW}Entrez l'URL de votre backend Railway :${NC}"
read -p "(ex: xxx.up.railway.app) : " RAILWAY_DOMAIN

if [[ -z "$RAILWAY_DOMAIN" ]]; then
    echo -e "${RED}❌ URL Railway requise !${NC}"
    exit 1
fi

RAILWAY_URL="https://${RAILWAY_DOMAIN}"

echo ""
echo -e "${GREEN}URL Backend : ${RAILWAY_URL}${NC}"
echo ""

# ÉTAPE 10
echo -e "${BLUE}"
echo "════════════════════════════════════════════════════"
echo "  🔄 ÉTAPE 10 : MISE À JOUR DES VARIABLES"
echo "════════════════════════════════════════════════════"
echo -e "${NC}"
echo ""

echo "Configuration des URLs dans Railway..."
echo ""

railway variables set BACKEND_URL="$RAILWAY_URL"
railway variables set GITHUB_CALLBACK_URL="${RAILWAY_URL}/api/auth/github/callback"
railway variables set GOOGLE_CALLBACK_URL="${RAILWAY_URL}/api/auth/google/callback"
railway variables set FRONTEND_URL="http://localhost:3000"

echo ""
echo -e "${GREEN}✅ URLs configurées${NC}"
echo ""
echo -e "${YELLOW}⏳ Le service va se redéployer automatiquement (1-2 minutes)...${NC}"
echo ""
sleep 3

# ÉTAPE 11
echo -e "${BLUE}"
echo "════════════════════════════════════════════════════"
echo "  🔐 ÉTAPE 11 : MISE À JOUR OAUTH CALLBACKS"
echo "════════════════════════════════════════════════════"
echo -e "${NC}"
echo ""

echo -e "${YELLOW}═══════════════════════════════════════${NC}"
echo -e "${YELLOW}  GITHUB OAUTH APP${NC}"
echo -e "${YELLOW}═══════════════════════════════════════${NC}"
echo ""
echo "1. Ouvrez : https://github.com/settings/developers"
echo "2. Cliquez sur votre application 'DevGaming Platform'"
echo "3. Modifiez 'Authorization callback URL' vers :"
echo ""
echo -e "   ${GREEN}${RAILWAY_URL}/api/auth/github/callback${NC}"
echo ""
echo "4. Cliquez 'Update application'"
echo ""
read -p "✓ GitHub OAuth mis à jour ? (Entrée pour continuer)"
echo ""

echo -e "${YELLOW}═══════════════════════════════════════${NC}"
echo -e "${YELLOW}  GOOGLE OAUTH APP${NC}"
echo -e "${YELLOW}═══════════════════════════════════════${NC}"
echo ""
echo "1. Ouvrez : https://console.cloud.google.com"
echo "2. Menu → 'APIs & Services' → 'Credentials'"
echo "3. Cliquez sur votre 'OAuth 2.0 Client ID'"
echo "4. Dans 'Authorized redirect URIs', remplacez par :"
echo ""
echo -e "   ${GREEN}${RAILWAY_URL}/api/auth/google/callback${NC}"
echo ""
echo "5. Ajoutez aussi dans 'Authorized JavaScript origins' :"
echo ""
echo -e "   ${GREEN}${RAILWAY_URL}${NC}"
echo ""
echo "6. Cliquez 'SAVE'"
echo ""
read -p "✓ Google OAuth mis à jour ? (Entrée pour continuer)"
echo ""

echo -e "${GREEN}✅ OAuth callbacks configurés${NC}"
echo ""

# ÉTAPE 12
echo -e "${BLUE}"
echo "════════════════════════════════════════════════════"
echo "  🌱 ÉTAPE 12 : SEED DE LA BASE DE DONNÉES"
echo "════════════════════════════════════════════════════"
echo -e "${NC}"
echo ""

echo -e "${YELLOW}Nous allons maintenant initialiser la base de données.${NC}"
echo ""
echo "Le dashboard Railway va s'ouvrir."
echo ""
echo -e "${BLUE}Instructions :${NC}"
echo "1. Cliquez sur votre service backend"
echo "2. Allez dans l'onglet 'Deployments'"
echo "3. Cliquez sur le dernier déploiement (le plus récent)"
echo "4. En haut à droite, cliquez sur l'icône 🖥️ (Shell/Terminal)"
echo "5. Dans le terminal qui s'ouvre, tapez :"
echo ""
echo -e "   ${GREEN}npx prisma db seed${NC}"
echo ""
echo "6. Appuyez sur Entrée et attendez la fin"
echo "7. Vous verrez : 'Database seeded successfully'"
echo ""

read -p "Voulez-vous ouvrir le dashboard ? (Y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]] || [[ -z $REPLY ]]; then
    railway open
fi

echo ""
read -p "✓ Base de données seedée ? (Entrée pour continuer)"
echo ""

echo -e "${GREEN}✅ Base de données initialisée${NC}"
echo ""

# RÉSUMÉ FINAL
echo ""
echo -e "${GREEN}"
echo "╔════════════════════════════════════════════════════╗"
echo "║                                                    ║"
echo "║     🎉 BACKEND COMPLÈTEMENT DÉPLOYÉ !             ║"
echo "║                                                    ║"
echo "╚════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}📋 INFORMATIONS DE VOTRE BACKEND${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "Backend URL     : ${GREEN}${RAILWAY_URL}${NC}"
echo -e "API Endpoint    : ${GREEN}${RAILWAY_URL}/api${NC}"
echo -e "Health Check    : ${GREEN}${RAILWAY_URL}/health${NC}"
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${YELLOW}🧪 TESTEZ VOTRE BACKEND MAINTENANT :${NC}"
echo ""
echo "Ouvrez cette URL dans votre navigateur :"
echo -e "${GREEN}${RAILWAY_URL}/health${NC}"
echo ""
echo "Vous devriez voir une réponse JSON."
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${YELLOW}🎯 PROCHAINE ÉTAPE : DÉPLOYER LE FRONTEND${NC}"
echo ""
echo "Utilisez cette URL pour le frontend :"
echo -e "${GREEN}${RAILWAY_URL}/api${NC}"
echo ""
echo "Commande pour déployer le frontend :"
echo -e "${GREEN}cd ../frontend && vercel${NC}"
echo ""
echo "Ou suivez le guide DEPLOY-STEP-BY-STEP.md (Partie B)"
echo ""
