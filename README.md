# 🕌 Maraakiz

**Plateforme de mise en relation entre instituts/professeurs et élèves pour l'enseignement de la langue arabe, du Coran et des sciences religieuses.**

## 🎯 Vue d'ensemble

Maraakiz permet aux élèves de :
- Rechercher des professeurs/instituts avec des **filtres puissants**
- Consulter des **fiches publiques détaillées**
- Contacter directement les enseignants

### Fonctionnalités Phase 1 (FRONTEND PUBLIC)

✅ Page d'accueil avec filtres combinables
✅ Grille de cartes professeurs/instituts
✅ Fiche publique détaillée
✅ Design moderne mobile-first

## 🛠 Stack technique

### Frontend
- React 19.1.0 + Vite 7.0.4
- Tailwind CSS 4.1.11
- React Router 7.7.1

### Backend
- FastAPI 0.115.6
- SQLAlchemy 2.0.36 + MySQL
- Pydantic 2.10.4

## 📁 Structure

maraakiz-clean/
├── frontend/ # React + Vite + Tailwind
├── backend/ # FastAPI + MySQL
└── docs/


## 🚀 Installation

### Frontend
```bash
cd frontend
npm install
npm run dev
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000


