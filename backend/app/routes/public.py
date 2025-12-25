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

    Filtres intelligents :
    - type: professeur, institut (OR entre eux)
    - matiere: coran, arabe, tajwid, sciences (OR entre eux)
    - format: en-ligne, presentiel (OR entre eux)
    - niveau: debutant, intermediaire, avance (OR entre eux)

    Logique GLOBALE :
    (type_prof OR type_inst) AND (mat_coran OR mat_arabe) AND (fmt_ligne OR fmt_pres) etc.
    """
    # Récupérer tous les merkez actifs
    all_merkez = db.query(Merkez).filter(Merkez.actif == True).all()

    # Filtrer en Python (plus fiable que SQLAlchemy pour les JSON dans SQLite)
    results = []

    for m in all_merkez:
        # Filtre TYPE : si des types sont sélectionnés, le merkez doit en faire partie
        if type and len(type) > 0:
            if m.type not in type:
                continue

        # Filtre MATIÈRE : si des matières sont sélectionnées, le merkez doit en enseigner AU MOINS UNE
        if matiere and len(matiere) > 0:
            if not m.matieres:  # Pas de matières définies
                continue
            # Vérifier si au moins UNE matière sélectionnée est dans les matières du merkez
            if not any(mat in m.matieres for mat in matiere):
                continue

        # Filtre FORMAT : si des formats sont sélectionnés, le merkez doit en proposer AU MOINS UN
        if format and len(format) > 0:
            if not m.formats:  # Pas de formats définis
                continue
            if not any(fmt in m.formats for fmt in format):
                continue

        # Filtre NIVEAU : si des niveaux sont sélectionnés, le merkez doit en accepter AU MOINS UN
        if niveau and len(niveau) > 0:
            if not m.niveaux:  # Pas de niveaux définis
                continue
            if not any(niv in m.niveaux for niv in niveau):
                continue

        # Si tous les filtres sont passés, on garde ce merkez
        results.append(m)

    # Trier par note moyenne décroissante
    results.sort(key=lambda x: x.note_moyenne or 0, reverse=True)

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
