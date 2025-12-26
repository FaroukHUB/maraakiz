from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routes import public, auth, eleves, merkez, cours, messages, paiements, notes_cours

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
app.include_router(eleves.router, prefix="/api/eleves", tags=["Eleves"])
app.include_router(merkez.router, prefix="/api/merkez", tags=["Merkez"])
app.include_router(cours.router, prefix="/api/cours", tags=["Cours"])
app.include_router(messages.router, prefix="/api/messages", tags=["Messages"])
app.include_router(paiements.router, prefix="/api/paiements", tags=["Paiements"])
app.include_router(notes_cours.router, prefix="/api/notes-cours", tags=["Notes de Cours"])

@app.get("/")
def read_root():
    return {"message": "Maraakiz API v1.0.0"}

@app.get("/health")
def health_check():
    return {"status": "ok"}
