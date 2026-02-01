#!/bin/bash

# Script rapide pour les étapes 8 et 9 du déploiement Railway

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}"
echo "════════════════════════════════════════════════════"
echo "  🚀 ÉTAPE 8 : DÉPLOIEMENT SUR RAILWAY"
echo "════════════════════════════════════════════════════"
echo -e "${NC}"
echo ""

echo -e "${YELLOW}Cette commande va déployer votre backend sur Railway.${NC}"
echo -e "${YELLOW}Cela peut prendre 2-3 minutes.${NC}"
echo ""
read -p "Appuyez sur Entrée pour démarrer le déploiement..."
echo ""

# Déployer
railway up

echo ""
echo -e "${GREEN}✅ Application déployée sur Railway !${NC}"
echo ""
echo ""

# ÉTAPE 9
echo -e "${BLUE}"
echo "════════════════════════════════════════════════════"
echo "  🌐 ÉTAPE 9 : GÉNÉRATION DU DOMAINE"
echo "════════════════════════════════════════════════════"
echo -e "${NC}"
echo ""

echo -e "${YELLOW}Maintenant, nous devons générer un domaine public pour votre backend.${NC}"
echo ""
echo -e "${BLUE}Méthode 1 : Via le Dashboard (Recommandé)${NC}"
echo "----------------------------------------"
echo "1. Le dashboard Railway va s'ouvrir"
echo "2. Cliquez sur votre service backend"
echo "3. Allez dans l'onglet 'Settings'"
echo "4. Scrollez jusqu'à 'Networking'"
echo "5. Cliquez sur 'Generate Domain'"
echo "6. Copiez l'URL générée (xxx.up.railway.app)"
echo ""
echo -e "${BLUE}Méthode 2 : Via CLI${NC}"
echo "--------------------"
echo "Vous pouvez aussi essayer : railway domain"
echo ""

read -p "Voulez-vous ouvrir le dashboard maintenant ? (Y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]] || [[ -z $REPLY ]]; then
    railway open
fi

echo ""
echo -e "${YELLOW}Une fois le domaine généré, notez-le !${NC}"
echo ""
read -p "Entrez l'URL Railway générée (ex: xxx.up.railway.app) : " RAILWAY_DOMAIN

if [[ -z "$RAILWAY_DOMAIN" ]]; then
    echo -e "${YELLOW}⚠️  Aucune URL fournie. Vous devrez la configurer manuellement.${NC}"
    RAILWAY_URL="https://votre-backend.up.railway.app"
else
    RAILWAY_URL="https://${RAILWAY_DOMAIN}"
fi

echo ""
echo -e "${GREEN}✅ Domaine configuré !${NC}"
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}📝 VOTRE BACKEND EST ACCESSIBLE ICI :${NC}"
echo ""
echo -e "${GREEN}${RAILWAY_URL}${NC}"
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${YELLOW}🧪 TESTEZ VOTRE BACKEND :${NC}"
echo ""
echo "Ouvrez cette URL dans votre navigateur :"
echo -e "${GREEN}${RAILWAY_URL}/health${NC}"
echo ""
echo "Vous devriez voir une réponse JSON avec un statut 200."
echo ""
echo ""
echo -e "${BLUE}🎯 PROCHAINES ÉTAPES :${NC}"
echo ""
echo "10. Mettre à jour les variables d'environnement avec cette URL"
echo "11. Mettre à jour les OAuth callbacks (GitHub + Google)"
echo "12. Seed la base de données"
echo ""
echo -e "${YELLOW}Pour continuer, utilisez :${NC}"
echo -e "${GREEN}./deploy-backend-finish.sh${NC}"
echo ""
echo "Ou continuez manuellement avec le guide DEPLOY-STEP-BY-STEP.md"
echo ""
