#!/bin/bash

# Script pour initialiser la base de données Railway
# Migrations Prisma + Seed

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}"
echo "════════════════════════════════════════════════════"
echo "  🗄️  INITIALISATION DE LA BASE DE DONNÉES"
echo "════════════════════════════════════════════════════"
echo -e "${NC}"
echo ""

echo -e "${YELLOW}Ce script va :${NC}"
echo "1. Exécuter les migrations Prisma (créer les tables)"
echo "2. Seed la base de données (données initiales)"
echo ""
echo -e "${RED}⚠️  IMPORTANT : Assurez-vous que PostgreSQL est bien déployé sur Railway !${NC}"
echo ""
read -p "Continuer ? (Y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]] && [[ ! -z $REPLY ]]; then
    exit 0
fi
echo ""

# OPTION 1 : Via Railway CLI (si connecté au projet)
echo -e "${BLUE}"
echo "════════════════════════════════════════════════════"
echo "  OPTION 1 : VIA RAILWAY CLI (Recommandé)"
echo "════════════════════════════════════════════════════"
echo -e "${NC}"
echo ""

echo -e "${YELLOW}Cette option exécute les commandes directement sur Railway.${NC}"
echo ""
read -p "Utiliser cette option ? (Y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]] || [[ -z $REPLY ]]; then
    echo ""
    echo -e "${BLUE}1️⃣  Exécution des migrations Prisma...${NC}"
    echo ""
    
    railway run npx prisma migrate deploy
    
    echo ""
    echo -e "${GREEN}✅ Migrations exécutées - Tables créées !${NC}"
    echo ""
    
    echo -e "${BLUE}2️⃣  Seed de la base de données...${NC}"
    echo ""
    
    railway run npx prisma db seed
    
    echo ""
    echo -e "${GREEN}✅ Base de données seedée !${NC}"
    echo ""
    
    echo -e "${GREEN}"
    echo "╔════════════════════════════════════════════════════╗"
    echo "║                                                    ║"
    echo "║     ✅ BASE DE DONNÉES INITIALISÉE !              ║"
    echo "║                                                    ║"
    echo "╚════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    echo ""
    
    echo -e "${BLUE}📋 Tables créées :${NC}"
    echo "  - users"
    echo "  - roles"
    echo "  - permissions"
    echo "  - user_roles"
    echo "  - role_permissions"
    echo "  - user_xp"
    echo "  - badges"
    echo "  - user_badges"
    echo "  - courses"
    echo "  - lessons"
    echo "  - quizzes"
    echo "  - activity_logs"
    echo "  - discord_notifications"
    echo "  - et plus..."
    echo ""
    
    echo -e "${BLUE}📦 Données initiales créées :${NC}"
    echo "  - 5 rôles (admin, moderator, user, dev_pro, gaming_pro)"
    echo "  - Permissions RBAC"
    echo "  - Badges système"
    echo "  - Cours de démonstration"
    echo ""
    
    exit 0
fi

# OPTION 2 : Via Dashboard Railway
echo ""
echo -e "${BLUE}"
echo "════════════════════════════════════════════════════"
echo "  OPTION 2 : VIA DASHBOARD RAILWAY (Manuel)"
echo "════════════════════════════════════════════════════"
echo -e "${NC}"
echo ""

echo -e "${YELLOW}Instructions pour utiliser le dashboard :${NC}"
echo ""
echo "1. Le dashboard Railway va s'ouvrir"
echo "2. Cliquez sur votre service backend"
echo "3. Allez dans 'Deployments'"
echo "4. Cliquez sur le dernier déploiement"
echo "5. En haut à droite, cliquez sur l'icône 🖥️ (Shell)"
echo "6. Dans le terminal, tapez ces commandes UNE PAR UNE :"
echo ""
echo -e "   ${GREEN}npx prisma migrate deploy${NC}"
echo "   (Attendez que ça se termine)"
echo ""
echo -e "   ${GREEN}npx prisma db seed${NC}"
echo "   (Attendez que ça se termine)"
echo ""
echo "7. Vous devriez voir : 'Database seeded successfully'"
echo ""

read -p "Ouvrir le dashboard maintenant ? (Y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]] || [[ -z $REPLY ]]; then
    railway open
fi

echo ""
echo -e "${YELLOW}Une fois les commandes exécutées dans le dashboard, revenez ici.${NC}"
echo ""
read -p "Migrations et seed terminés ? (Entrée pour continuer)"
echo ""

echo -e "${GREEN}✅ Base de données initialisée !${NC}"
echo ""

# OPTION 3 : Vérification
echo ""
echo -e "${BLUE}"
echo "════════════════════════════════════════════════════"
echo "  🔍 VÉRIFICATION (Optionnel)"
echo "════════════════════════════════════════════════════"
echo -e "${NC}"
echo ""

echo -e "${YELLOW}Voulez-vous vérifier que les tables ont bien été créées ?${NC}"
echo ""
read -p "Ouvrir Prisma Studio ? (y/N) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo -e "${BLUE}Ouverture de Prisma Studio...${NC}"
    echo ""
    railway run npx prisma studio
fi

echo ""
echo -e "${GREEN}Terminé !${NC}"
echo ""
