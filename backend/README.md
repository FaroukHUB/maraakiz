# Maraakiz Backend (restore)

FastAPI backend with modules:
- Auth (JWT)
- Merkez
- Eleve
- Planning
- Abonnement
- Messagerie
- Statistiques
- Public Merkez (filtered listing)

Run:
```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 3001
```

Swagger:
http://127.0.0.1:3001/docs
