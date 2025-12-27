# 🚀 Commandes Maraakiz - À GARDER!

## Démarrage Rapide (1 commande!)

```bash
cd ~/Documents/mac/maraakizz && ./START.sh
```

---

## Commandes Manuel (si besoin)

### 1️⃣ Aller dans le projet
```bash
cd ~/Documents/mac/maraakizz
```

### 2️⃣ Pull les derniers changements
```bash
git pull origin claude/analyze-maraakiz-repo-UqAwy
```

### 3️⃣ Backend (Terminal 1)
```bash
cd ~/Documents/mac/maraakizz/maraakiz-clean/backend
python3 -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 4️⃣ Frontend (Terminal 2)
```bash
cd ~/Documents/mac/maraakizz
npm run dev
```

---

## 🔄 Migrations Base de Données

### Appliquer une migration
```bash
cd ~/Documents/mac/maraakizz/maraakiz-clean/backend
python3 migrate_paiements.py
```

### Recréer la BDD complète
```bash
cd ~/Documents/mac/maraakizz/maraakiz-clean/backend
rm maraakiz.db
python3 init_db.py
```

---

## 📦 URLs Importantes

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **Dashboard**: http://localhost:5173/dashboard
- **Paiements**: http://localhost:5173/dashboard/paiements
- **Calendrier**: http://localhost:5173/dashboard/calendrier

---

## 🛑 Arrêter les serveurs

### Trouver les processus
```bash
lsof -ti:8000  # Backend
lsof -ti:5173  # Frontend
```

### Tuer les processus
```bash
kill $(lsof -ti:8000)  # Backend
kill $(lsof -ti:5173)  # Frontend
```

Ou simplement: **Ctrl+C** dans chaque terminal

---

## 📋 Git - Voir les changements

```bash
cd ~/Documents/mac/maraakizz
git status
git log --oneline -5
```

---

## 🆘 En cas de problème

### Backend ne démarre pas
```bash
cd ~/Documents/mac/maraakizz/maraakiz-clean/backend
rm -rf __pycache__ app/__pycache__
python3 -m pip install -r requirements.txt
```

### Frontend ne démarre pas
```bash
cd ~/Documents/mac/maraakizz
rm -rf node_modules package-lock.json
npm install
```

### Base de données corrompue
```bash
cd ~/Documents/mac/maraakizz/maraakiz-clean/backend
rm maraakiz.db
python3 init_db.py
```

---

**💡 Astuce**: Ajoute ce fichier aux favoris ou fais un alias:

```bash
echo 'alias maraakiz="cd ~/Documents/mac/maraakizz && ./START.sh"' >> ~/.zshrc
source ~/.zshrc
```

Ensuite tape juste `maraakiz` pour tout démarrer! 🎉
