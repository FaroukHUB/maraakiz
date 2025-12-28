from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.database import engine, Base
from app.routes import public, auth, eleves, merkez, messages, paiements, notes_cours, calendrier, profile
from pathlib import Path

# Import all models to ensure tables are created
from app.models import (
    user as user_model,
    eleve as eleve_model,
    merkez as merkez_model,
    cours as cours_model,
    message as message_model,
    paiement as paiement_model,
    notes_cours as notes_cours_model
)

# Créer les tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Maraakiz API", version="1.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En prod, restreindre aux domaines autorisés
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(public.router, prefix="/api/public", tags=["Public"])
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(profile.router, prefix="/api/profile", tags=["Profile"])
app.include_router(eleves.router, prefix="/api/eleves", tags=["Eleves"])
app.include_router(merkez.router, prefix="/api/merkez", tags=["Merkez"])
app.include_router(calendrier.router, prefix="/api/calendrier", tags=["Calendrier"])
app.include_router(messages.router, prefix="/api/messages", tags=["Messages"])
app.include_router(paiements.router, prefix="/api/paiements", tags=["Paiements"])
app.include_router(notes_cours.router, prefix="/api/notes-cours", tags=["Notes de Cours"])

# Serve static files (avatars and uploads)
BASE_DIR = Path(__file__).resolve().parent.parent
PUBLIC_DIR = BASE_DIR.parent / "public"
UPLOADS_DIR = BASE_DIR / "uploads"

# Mount static directories
if PUBLIC_DIR.exists():
    app.mount("/avatars", StaticFiles(directory=str(PUBLIC_DIR / "avatars")), name="avatars")
if UPLOADS_DIR.exists():
    app.mount("/uploads", StaticFiles(directory=str(UPLOADS_DIR)), name="uploads")

@app.get("/")
def read_root():
    return {"message": "Maraakiz API v1.0.0"}

@app.get("/health")
def health_check():
    return {"status": "ok"}
