from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routes import public, auth, eleves, merkez

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

@app.get("/")
def read_root():
    return {"message": "Maraakiz API v1.0.0"}

@app.get("/health")
def health_check():
    return {"status": "ok"}
