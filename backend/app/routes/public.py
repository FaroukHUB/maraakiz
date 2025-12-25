from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models.merkez import Merkez

router = APIRouter()

@router.get("/merkez")
def get_public_merkez(
    type: Optional[List[str]] = Query(None),
    matiere: Optional[List[str]] = Query(None),
    format: Optional[List[str]] = Query(None),
    niveau: Optional[List[str]] = Query(None),
    db: Session = Depends(get_db)
):
    """
    Récupère la liste des professeurs/instituts avec filtres optionnels.

    Filtres:
    - type: professeur, institut
    - matiere: coran, arabe, tajwid, sciences
    - format: en-ligne, presentiel
    - niveau: debutant, intermediaire, avance
    """
    query = db.query(Merkez).filter(Merkez.actif == True)

    # Filtre par type (professeur ou institut)
    if type:
        query = query.filter(Merkez.type.in_(type))

    # Filtre par matière
    if matiere:
        for mat in matiere:
            query = query.filter(Merkez.matieres.contains([mat]))

    # Filtre par format
    if format:
        for fmt in format:
            query = query.filter(Merkez.formats.contains([fmt]))

    # Filtre par niveau
    if niveau:
        for niv in niveau:
            query = query.filter(Merkez.niveaux.contains([niv]))

    # Trier par note moyenne décroissante
    results = query.order_by(Merkez.note_moyenne.desc()).all()

    # Convertir en dict
    return [
        {
            "id": m.id,
            "type": m.type,
            "nom": m.nom,
            "image": m.image_url,
            "note": m.note_moyenne,
            "nbAvis": m.nombre_avis,
            "matieres": m.matieres or [],
            "format": ", ".join(m.formats or []),
            "langues": m.langues or [],
            "niveaux": m.niveaux or [],
            "prix": m.prix_min,
            "verifie": m.verifie,
            "badges": {
                "nouveauProf": m.nouveau,
                "premierCoursGratuit": m.premier_cours_gratuit
            },
            "bio": m.bio
        }
        for m in results
    ]

@router.get("/merkez/{merkez_id}")
def get_merkez_detail(merkez_id: int, db: Session = Depends(get_db)):
    """
    Récupère les détails complets d'un professeur/institut
    """
    merkez = db.query(Merkez).filter(Merkez.id == merkez_id, Merkez.actif == True).first()

    if not merkez:
        return {"error": "Merkez not found"}, 404

    return {
        "id": merkez.id,
        "type": merkez.type,
        "nom": merkez.nom,
        "email": merkez.email,
        "telephone": merkez.telephone,
        # Champs professeur
        "cursus": merkez.cursus,
        # Champs institut
        "presentationInstitut": merkez.presentation_institut,
        "nombreProfesseurs": merkez.nombre_professeurs,
        "nombreSecretaires": merkez.nombre_secretaires,
        "nombreSuperviseurs": merkez.nombre_superviseurs,
        "nombreResponsablesPedagogiques": merkez.nombre_responsables_pedagogiques,
        "nombreGestionnaires": merkez.nombre_gestionnaires,
        # Commun
        "programme": merkez.programme,
        "livres": merkez.livres,
        "methodologie": merkez.methodologie,
        "image": merkez.image_url,
        "videoUrl": merkez.presentation_video_url,
        "matieres": merkez.matieres or [],
        "formats": merkez.formats or [],
        "niveaux": merkez.niveaux or [],
        "langues": merkez.langues or [],
        "publicCible": merkez.public_cible or [],
        "prixMin": merkez.prix_min,
        "prixMax": merkez.prix_max,
        "premierCoursGratuit": merkez.premier_cours_gratuit,
        "ville": merkez.ville,
        "pays": merkez.pays,
        "noteMoyenne": merkez.note_moyenne,
        "nombreAvis": merkez.nombre_avis,
        "verifie": merkez.verifie,
        "nouveau": merkez.nouveau,
        "nombreEleves": merkez.nombre_eleves,
        "nombreCoursDonnes": merkez.nombre_cours_donnes
    }
