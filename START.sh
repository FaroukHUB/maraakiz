#!/bin/bash

# Script de démarrage rapide pour Maraakiz
# Usage: ./START.sh

echo "🚀 Démarrage de Maraakiz..."

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Trouver le répertoire du projet
PROJECT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

echo -e "${BLUE}📁 Projet: $PROJECT_DIR${NC}"

# 1. Appliquer les migrations si nécessaire
if [ -f "$PROJECT_DIR/backend/migrate_paiements.py" ]; then
    echo -e "${GREEN}🔄 Application des migrations...${NC}"
    cd "$PROJECT_DIR/backend"
    python3 migrate_paiements.py
fi

# 2. Démarrer le backend
echo -e "${GREEN}🔧 Démarrage du backend...${NC}"
cd "$PROJECT_DIR/backend"
python3 -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

echo -e "${GREEN}✅ Backend démarré (PID: $BACKEND_PID)${NC}"
echo -e "${BLUE}📡 API: http://localhost:8000${NC}"
echo -e "${BLUE}📖 Docs: http://localhost:8000/docs${NC}"

# 3. Démarrer le frontend
echo -e "${GREEN}🎨 Démarrage du frontend...${NC}"
cd "$PROJECT_DIR"
npm run dev &
FRONTEND_PID=$!

echo -e "${GREEN}✅ Frontend démarré (PID: $FRONTEND_PID)${NC}"
echo -e "${BLUE}🌐 App: http://localhost:5173${NC}"

echo ""
echo -e "${GREEN}✨ Maraakiz est prêt!${NC}"
echo ""
echo "Pour arrêter les serveurs:"
echo "  kill $BACKEND_PID $FRONTEND_PID"
echo ""

# Attendre
wait
