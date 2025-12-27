from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, extract
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime, date, timedelta
import secrets
import json

from app.database import get_db
from app.models.cours import Cours, TrameCours, cours_eleves
from app.models.eleve import Eleve
from app.models.user import User
from app.models.notes_cours import NotesCours
from app.routes.auth import oauth2_scheme
from app.utils.google_calendar import (
    get_authorization_url,
    exchange_code_for_tokens,
    refresh_access_token,
    create_calendar_event,
    update_calendar_event,
    delete_calendar_event,
    sync_from_google_calendar
)
from jose import JWTError, jwt
import os

router = APIRouter()

SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = "HS256"


# Pydantic schemas
class CoursCreate(BaseModel):
    eleve_ids: List[int]  # Support multi-élèves
    titre: str
    matiere: Optional[str] = None
    description: Optional[str] = None
    date_debut: datetime
    date_fin: datetime
    type_cours: Optional[str] = "presentiel"
    lien_visio: Optional[str] = None
    trame_cours_id: Optional[int] = None
    sync_to_google: bool = True


class CoursUpdate(BaseModel):
    eleve_ids: Optional[List[int]] = None
    titre: Optional[str] = None
    matiere: Optional[str] = None
    description: Optional[str] = None
    date_debut: Optional[datetime] = None
    date_fin: Optional[datetime] = None
    type_cours: Optional[str] = None
    lien_visio: Optional[str] = None
    statut: Optional[str] = None
    notes_prof: Optional[str] = None
    devoirs: Optional[str] = None
    fichiers_urls: Optional[str] = None


class RecurrentCoursCreate(BaseModel):
    """Schéma pour créer des cours récurrents avec horaires personnalisés par jour"""
    eleve_ids: List[int]  # Élèves du groupe
    titre: str
    matiere: Optional[str] = None
    description: Optional[str] = None

    # Horaires par jour - dict avec jour (0-6) comme clé et {debut, fin} comme valeur
    # Ex: {"0": {"debut": "21:00", "fin": "22:00"}, "2": {"debut": "19:30", "fin": "20:30"}}
    recurrence_schedule: dict  # Format: {day_number: {"debut": "HH:MM", "fin": "HH:MM"}}

    # Récurrence
    recurrence_start_date: date  # Date de début de la récurrence
    recurrence_end_date: date    # Date de fin de la récurrence

    # Autres champs
    type_cours: Optional[str] = "en-ligne"
    lien_visio: Optional[str] = None
    trame_cours_id: Optional[int] = None
    sync_to_google: bool = True
    statut: Optional[str] = "planifie"


class CoursResponse(BaseModel):
    id: int
    merkez_id: int
    titre: str
    matiere: Optional[str]
    description: Optional[str]
    date_debut: datetime
    date_fin: datetime
    duree: Optional[int]
    type_cours: Optional[str]
    lien_visio: Optional[str]
    statut: str
    google_event_id: Optional[str]
    sync_to_google: bool
    is_recurrent: Optional[bool] = False
    recurrence_parent_id: Optional[int] = None
    recurrence_rule: Optional[dict] = None
    recurrence_exceptions: Optional[list] = None
    trame_cours_id: Optional[int]
    notes_prof: Optional[str]
    devoirs: Optional[str]
    fichiers_urls: Optional[str]
    created_at: datetime
    updated_at: Optional[datetime]
    eleves: List[dict]  # Liste des élèves

    class Config:
        from_attributes = True


class TrameCoursCreate(BaseModel):
    nom: str
    matiere: Optional[str] = None
    description: Optional[str] = None
    plan_cours: Optional[str] = None
    objectifs: Optional[str] = None
    duree_standard: Optional[int] = None
    ressources: Optional[str] = None
    devoirs_type: Optional[str] = None


class TrameCoursResponse(BaseModel):
    id: int
    merkez_id: int
    nom: str
    matiere: Optional[str]
    description: Optional[str]
    plan_cours: Optional[str]
    objectifs: Optional[str]
    duree_standard: Optional[int]
    ressources: Optional[str]
    devoirs_type: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


# Dependency to get current user
async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Impossible de valider les informations d'identification",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise credentials_exception

    return user


# Google Calendar Auth Routes
@router.get("/google/auth-url")
async def get_google_auth_url(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get Google OAuth authorization URL
    """
    if not current_user.merkez_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vous devez être professeur"
        )

    # Generate state token for security
    state = secrets.token_urlsafe(32)

    # Store state in session or database (simplified here)
    # In production, store this in Redis or database

    auth_url = get_authorization_url(state)

    return {
        "auth_url": auth_url,
        "state": state
    }


@router.post("/google/callback")
async def google_auth_callback(
    code: str,
    state: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Handle Google OAuth callback and store tokens
    """
    if not current_user.merkez_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vous devez être professeur"
        )

    try:
        tokens = exchange_code_for_tokens(code, state)

        # Update user with Google tokens
        current_user.google_access_token = tokens['access_token']
        current_user.google_refresh_token = tokens['refresh_token']
        current_user.google_token_expiry = tokens['token_expiry']
        current_user.google_calendar_connected = True

        db.commit()

        return {
            "message": "Google Calendar connecté avec succès",
            "connected": True
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Erreur lors de la connexion: {str(e)}"
        )


@router.post("/google/disconnect")
async def disconnect_google_calendar(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Disconnect Google Calendar
    """
    current_user.google_access_token = None
    current_user.google_refresh_token = None
    current_user.google_token_expiry = None
    current_user.google_calendar_connected = False

    db.commit()

    return {"message": "Google Calendar déconnecté", "connected": False}


@router.get("/google/status")
async def get_google_calendar_status(
    current_user: User = Depends(get_current_user)
):
    """
    Check if Google Calendar is connected
    """
    return {
        "connected": current_user.google_calendar_connected,
        "has_tokens": bool(current_user.google_access_token and current_user.google_refresh_token)
    }


# Cours CRUD Routes
@router.get("/cours", response_model=List[CoursResponse])
async def get_cours(
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    eleve_id: Optional[int] = Query(None),
    statut: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all cours for the current professor
    """
    if not current_user.merkez_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vous devez être professeur"
        )

    query = db.query(Cours).filter(Cours.merkez_id == current_user.merkez_id)

    if start_date and end_date:
        query = query.filter(
            Cours.date_debut >= datetime.combine(start_date, datetime.min.time()),
            Cours.date_debut <= datetime.combine(end_date, datetime.max.time())
        )

    if statut:
        query = query.filter(Cours.statut == statut)

    cours_list = query.order_by(Cours.date_debut.asc()).all()

    # Enrichir avec les élèves
    result = []
    for cours in cours_list:
        # Récupérer les élèves liés à ce cours
        eleves_data = db.execute(
            cours_eleves.select().where(cours_eleves.c.cours_id == cours.id)
        ).fetchall()

        eleves = []
        for eleve_assoc in eleves_data:
            eleve = db.query(Eleve).filter(Eleve.id == eleve_assoc.eleve_id).first()
            if eleve:
                eleves.append({
                    "id": eleve.id,
                    "nom": eleve.nom,
                    "prenom": eleve.prenom,
                    "presente": eleve_assoc.presente
                })

        # Filtrer par eleve_id si spécifié
        if eleve_id and not any(e["id"] == eleve_id for e in eleves):
            continue

        cours_dict = {
            **cours.__dict__,
            "eleves": eleves
        }
        result.append(cours_dict)

    return result


@router.post("/cours", response_model=CoursResponse, status_code=status.HTTP_201_CREATED)
async def create_cours(
    cours_data: CoursCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new cours (supports multiple students)
    """
    if not current_user.merkez_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vous devez être professeur"
        )

    # Vérifier que tous les élèves existent et appartiennent au prof
    eleves = []
    for eleve_id in cours_data.eleve_ids:
        eleve = db.query(Eleve).filter(
            Eleve.id == eleve_id,
            Eleve.merkez_id == current_user.merkez_id
        ).first()

        if not eleve:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Élève {eleve_id} non trouvé"
            )
        eleves.append(eleve)

    # Calculer la durée
    duree = int((cours_data.date_fin - cours_data.date_debut).total_seconds() / 60)

    # Créer le cours
    new_cours = Cours(
        merkez_id=current_user.merkez_id,
        titre=cours_data.titre,
        matiere=cours_data.matiere,
        description=cours_data.description,
        date_debut=cours_data.date_debut,
        date_fin=cours_data.date_fin,
        duree=duree,
        type_cours=cours_data.type_cours,
        lien_visio=cours_data.lien_visio,
        trame_cours_id=cours_data.trame_cours_id,
        sync_to_google=cours_data.sync_to_google,
        statut="planifie"
    )

    db.add(new_cours)
    db.flush()  # Get the ID without committing

    # Associer les élèves
    for eleve in eleves:
        db.execute(
            cours_eleves.insert().values(
                cours_id=new_cours.id,
                eleve_id=eleve.id,
                presente=False
            )
        )

    # Sync avec Google Calendar si activé
    google_event_id = None
    if cours_data.sync_to_google and current_user.google_calendar_connected:
        try:
            eleves_noms = [f"{e.prenom} {e.nom}" for e in eleves]
            google_event_id = create_calendar_event(
                current_user.google_access_token,
                current_user.google_refresh_token,
                cours_data.titre,
                cours_data.description or "",
                cours_data.date_debut,
                cours_data.date_fin,
                eleves_noms,
                cours_data.lien_visio
            )

            if google_event_id:
                new_cours.google_event_id = google_event_id

        except Exception as e:
            print(f"Error syncing to Google Calendar: {e}")
            # Continue without Google sync

    db.commit()
    db.refresh(new_cours)

    # Préparer la réponse
    eleves_data = [{"id": e.id, "nom": e.nom, "prenom": e.prenom, "presente": False} for e in eleves]

    return {
        **new_cours.__dict__,
        "eleves": eleves_data
    }


@router.post("/cours/recurrent", status_code=status.HTTP_201_CREATED)
async def create_recurrent_cours(
    recurrent_data: RecurrentCoursCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create recurrent cours (ex: Tous les lundis, jeudis et samedis de 20h à 21h pour janvier et février)
    Génère automatiquement tous les cours de la série
    """
    if not current_user.merkez_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vous devez être professeur"
        )

    # Vérifier que tous les élèves existent
    eleves = []
    for eleve_id in recurrent_data.eleve_ids:
        eleve = db.query(Eleve).filter(
            Eleve.id == eleve_id,
            Eleve.merkez_id == current_user.merkez_id
        ).first()
        if not eleve:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Élève {eleve_id} non trouvé"
            )
        eleves.append(eleve)

    # Générer toutes les occurrences
    cours_created = []
    current_date = recurrent_data.recurrence_start_date

    # Règle de récurrence à stocker
    recurrence_rule = {
        "schedule": recurrent_data.recurrence_schedule,
        "start_date": recurrent_data.recurrence_start_date.isoformat(),
        "end_date": recurrent_data.recurrence_end_date.isoformat()
    }

    # ID du cours parent (sera le premier cours créé)
    parent_cours_id = None

    while current_date <= recurrent_data.recurrence_end_date:
        # Vérifier si ce jour de la semaine a un horaire défini
        weekday = current_date.weekday()
        weekday_str = str(weekday)

        if weekday_str in recurrent_data.recurrence_schedule:
            # Récupérer les horaires pour ce jour
            schedule = recurrent_data.recurrence_schedule[weekday_str]
            heure_debut_parts = schedule["debut"].split(':')
            heure_fin_parts = schedule["fin"].split(':')

            date_debut = datetime.combine(
                current_date,
                datetime.min.time().replace(
                    hour=int(heure_debut_parts[0]),
                    minute=int(heure_debut_parts[1])
                )
            )
            date_fin = datetime.combine(
                current_date,
                datetime.min.time().replace(
                    hour=int(heure_fin_parts[0]),
                    minute=int(heure_fin_parts[1])
                )
            )

            # Calculer la durée
            duree = int((date_fin - date_debut).total_seconds() / 60)

            # Créer le cours
            new_cours = Cours(
                merkez_id=current_user.merkez_id,
                titre=recurrent_data.titre,
                matiere=recurrent_data.matiere,
                description=recurrent_data.description,
                date_debut=date_debut,
                date_fin=date_fin,
                duree=duree,
                type_cours=recurrent_data.type_cours,
                lien_visio=recurrent_data.lien_visio,
                trame_cours_id=recurrent_data.trame_cours_id,
                sync_to_google=recurrent_data.sync_to_google,
                statut=recurrent_data.statut,
                is_recurrent=True,
                recurrence_rule=recurrence_rule,
                recurrence_parent_id=parent_cours_id  # None pour le premier, ID du parent pour les suivants
            )

            db.add(new_cours)
            db.flush()  # Get the ID

            # Si c'est le premier cours, il devient le parent
            if parent_cours_id is None:
                parent_cours_id = new_cours.id
                new_cours.recurrence_parent_id = new_cours.id  # Le parent se référence lui-même

            # Associer les élèves
            for eleve in eleves:
                db.execute(
                    cours_eleves.insert().values(
                        cours_id=new_cours.id,
                        eleve_id=eleve.id,
                        presente=False
                    )
                )

            cours_created.append(new_cours.id)

        # Jour suivant
        current_date += timedelta(days=1)

    db.commit()

    return {
        "message": f"{len(cours_created)} cours créés avec succès",
        "cours_ids": cours_created,
        "parent_id": parent_cours_id,
        "recurrence_rule": recurrence_rule
    }


@router.put("/cours/{cours_id}", response_model=CoursResponse)
async def update_cours(
    cours_id: int,
    cours_data: CoursUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update a cours
    """
    if not current_user.merkez_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vous devez être professeur"
        )

    cours = db.query(Cours).filter(
        Cours.id == cours_id,
        Cours.merkez_id == current_user.merkez_id
    ).first()

    if not cours:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cours non trouvé"
        )

    # Update basic fields
    update_data = cours_data.model_dump(exclude_unset=True, exclude={"eleve_ids"})
    for field, value in update_data.items():
        setattr(cours, field, value)

    # Update eleves if provided
    if cours_data.eleve_ids is not None:
        # Remove old associations
        db.execute(
            cours_eleves.delete().where(cours_eleves.c.cours_id == cours_id)
        )

        # Add new associations
        for eleve_id in cours_data.eleve_ids:
            eleve = db.query(Eleve).filter(
                Eleve.id == eleve_id,
                Eleve.merkez_id == current_user.merkez_id
            ).first()

            if not eleve:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Élève {eleve_id} non trouvé"
                )

            db.execute(
                cours_eleves.insert().values(
                    cours_id=cours_id,
                    eleve_id=eleve_id,
                    presente=False
                )
            )

    # Recalculate duration if dates changed
    if cours_data.date_debut or cours_data.date_fin:
        cours.duree = int((cours.date_fin - cours.date_debut).total_seconds() / 60)

    # Sync with Google Calendar if needed
    if cours.sync_to_google and current_user.google_calendar_connected and cours.google_event_id:
        try:
            eleves_data = db.execute(
                cours_eleves.select().where(cours_eleves.c.cours_id == cours_id)
            ).fetchall()

            eleves = []
            for eleve_assoc in eleves_data:
                eleve = db.query(Eleve).filter(Eleve.id == eleve_assoc.eleve_id).first()
                if eleve:
                    eleves.append(f"{eleve.prenom} {eleve.nom}")

            update_calendar_event(
                current_user.google_access_token,
                current_user.google_refresh_token,
                cours.google_event_id,
                cours.titre,
                cours.description or "",
                cours.date_debut,
                cours.date_fin,
                eleves,
                cours.lien_visio
            )
        except Exception as e:
            print(f"Error updating Google Calendar: {e}")

    db.commit()
    db.refresh(cours)

    # Récupérer les élèves pour la réponse
    eleves_data = db.execute(
        cours_eleves.select().where(cours_eleves.c.cours_id == cours_id)
    ).fetchall()

    eleves = []
    for eleve_assoc in eleves_data:
        eleve = db.query(Eleve).filter(Eleve.id == eleve_assoc.eleve_id).first()
        if eleve:
            eleves.append({
                "id": eleve.id,
                "nom": eleve.nom,
                "prenom": eleve.prenom,
                "presente": eleve_assoc.presente
            })

    return {
        **cours.__dict__,
        "eleves": eleves
    }


@router.delete("/cours/{cours_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_cours(
    cours_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a cours
    """
    if not current_user.merkez_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vous devez être professeur"
        )

    cours = db.query(Cours).filter(
        Cours.id == cours_id,
        Cours.merkez_id == current_user.merkez_id
    ).first()

    if not cours:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cours non trouvé"
        )

    # Delete from Google Calendar if synced
    if cours.google_event_id and current_user.google_calendar_connected:
        try:
            delete_calendar_event(
                current_user.google_access_token,
                current_user.google_refresh_token,
                cours.google_event_id
            )
        except Exception as e:
            print(f"Error deleting from Google Calendar: {e}")

    db.delete(cours)
    db.commit()

    return None


# Trames de Cours Routes
@router.get("/trames", response_model=List[TrameCoursResponse])
async def get_trames_cours(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all course templates for the professor
    """
    if not current_user.merkez_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vous devez être professeur"
        )

    trames = db.query(TrameCours).filter(
        TrameCours.merkez_id == current_user.merkez_id
    ).order_by(TrameCours.nom.asc()).all()

    return trames


@router.post("/trames", response_model=TrameCoursResponse, status_code=status.HTTP_201_CREATED)
async def create_trame_cours(
    trame_data: TrameCoursCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new course template
    """
    if not current_user.merkez_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vous devez être professeur"
        )

    new_trame = TrameCours(
        merkez_id=current_user.merkez_id,
        **trame_data.model_dump()
    )

    db.add(new_trame)
    db.commit()
    db.refresh(new_trame)

    return new_trame


@router.delete("/trames/{trame_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_trame_cours(
    trame_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a course template
    """
    if not current_user.merkez_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vous devez être professeur"
        )

    trame = db.query(TrameCours).filter(
        TrameCours.id == trame_id,
        TrameCours.merkez_id == current_user.merkez_id
    ).first()

    if not trame:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Trame de cours non trouvée"
        )

    db.delete(trame)
    db.commit()

    return None
