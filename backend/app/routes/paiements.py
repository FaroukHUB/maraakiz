from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, extract
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime, date
from dateutil.relativedelta import relativedelta

from app.database import get_db
from app.models.paiement import Paiement
from app.models.eleve import Eleve
from app.models.user import User
from app.models.merkez import Merkez
from app.routes.auth import oauth2_scheme
from app.utils.email import send_student_credentials_email
from jose import JWTError, jwt
import os

router = APIRouter()

SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = "HS256"


# Pydantic schemas
class PaiementCreate(BaseModel):
    eleve_id: int
    mois: int  # 1-12
    annee: int
    montant_du: float
    montant_paye: float = 0.0
    date_echeance: date
    methode_paiement: Optional[str] = None
    notes: Optional[str] = None


class PaiementUpdate(BaseModel):
    montant_paye: Optional[float] = None
    statut: Optional[str] = None
    date_paiement: Optional[date] = None
    methode_paiement: Optional[str] = None
    notes: Optional[str] = None


class PaiementResponse(BaseModel):
    id: int
    eleve_id: int
    merkez_id: int
    mois: int
    annee: int
    montant_du: float
    montant_paye: float
    statut: str
    date_echeance: date
    date_paiement: Optional[date]
    methode_paiement: Optional[str]
    notes: Optional[str]
    rappel_envoye: bool
    date_rappel: Optional[datetime]
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


class PaiementWithEleveResponse(PaiementResponse):
    eleve_nom: str
    eleve_prenom: str


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


def calculate_statut(montant_du: float, montant_paye: float, date_echeance: date) -> str:
    """Calculate payment status based on amounts and deadline"""
    if montant_paye >= montant_du:
        return "paye"
    elif montant_paye > 0:
        return "partiel"
    elif date.today() > date_echeance:
        return "en_retard"
    else:
        return "impaye"


# Routes
@router.get("/", response_model=List[PaiementWithEleveResponse])
async def get_paiements(
    eleve_id: Optional[int] = Query(None),
    statut: Optional[str] = Query(None),
    mois: Optional[int] = Query(None),
    annee: Optional[int] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all payments for the current professor/institute
    """
    if not current_user.merkez_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vous devez être professeur ou institut"
        )

    # Base query
    query = db.query(Paiement).filter(Paiement.merkez_id == current_user.merkez_id)

    # Apply filters
    if eleve_id:
        query = query.filter(Paiement.eleve_id == eleve_id)
    if statut:
        query = query.filter(Paiement.statut == statut)
    if mois:
        query = query.filter(Paiement.mois == mois)
    if annee:
        query = query.filter(Paiement.annee == annee)

    paiements = query.order_by(Paiement.annee.desc(), Paiement.mois.desc()).all()

    # Enrich with student info
    result = []
    for p in paiements:
        eleve = db.query(Eleve).filter(Eleve.id == p.eleve_id).first()
        if eleve:
            paiement_dict = {
                **p.__dict__,
                "eleve_nom": eleve.nom,
                "eleve_prenom": eleve.prenom
            }
            result.append(paiement_dict)

    return result


@router.get("/student/{eleve_id}", response_model=List[PaiementResponse])
async def get_paiements_eleve(
    eleve_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all payments for a specific student
    """
    if not current_user.merkez_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vous devez être professeur ou institut"
        )

    # Verify student belongs to current professor
    eleve = db.query(Eleve).filter(
        Eleve.id == eleve_id,
        Eleve.merkez_id == current_user.merkez_id
    ).first()

    if not eleve:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Élève non trouvé"
        )

    paiements = db.query(Paiement).filter(
        Paiement.eleve_id == eleve_id
    ).order_by(Paiement.annee.desc(), Paiement.mois.desc()).all()

    return paiements


@router.post("/", response_model=PaiementResponse, status_code=status.HTTP_201_CREATED)
async def create_paiement(
    paiement_data: PaiementCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new payment record
    """
    if not current_user.merkez_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vous devez être professeur ou institut"
        )

    # Verify student belongs to current professor
    eleve = db.query(Eleve).filter(
        Eleve.id == paiement_data.eleve_id,
        Eleve.merkez_id == current_user.merkez_id
    ).first()

    if not eleve:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Élève non trouvé"
        )

    # Check if payment already exists for this month
    existing = db.query(Paiement).filter(
        Paiement.eleve_id == paiement_data.eleve_id,
        Paiement.mois == paiement_data.mois,
        Paiement.annee == paiement_data.annee
    ).first()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Un paiement existe déjà pour ce mois"
        )

    # Calculate status
    statut = calculate_statut(
        paiement_data.montant_du,
        paiement_data.montant_paye,
        paiement_data.date_echeance
    )

    new_paiement = Paiement(
        eleve_id=paiement_data.eleve_id,
        merkez_id=current_user.merkez_id,
        mois=paiement_data.mois,
        annee=paiement_data.annee,
        montant_du=paiement_data.montant_du,
        montant_paye=paiement_data.montant_paye,
        statut=statut,
        date_echeance=paiement_data.date_echeance,
        methode_paiement=paiement_data.methode_paiement,
        notes=paiement_data.notes,
        date_paiement=date.today() if paiement_data.montant_paye >= paiement_data.montant_du else None
    )

    db.add(new_paiement)
    db.commit()
    db.refresh(new_paiement)

    return new_paiement


@router.put("/{paiement_id}", response_model=PaiementResponse)
async def update_paiement(
    paiement_id: int,
    paiement_data: PaiementUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update a payment record
    """
    if not current_user.merkez_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vous devez être professeur ou institut"
        )

    paiement = db.query(Paiement).filter(
        Paiement.id == paiement_id,
        Paiement.merkez_id == current_user.merkez_id
    ).first()

    if not paiement:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Paiement non trouvé"
        )

    # Update fields
    update_data = paiement_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(paiement, field, value)

    # Recalculate status if amounts changed
    if paiement_data.montant_paye is not None:
        paiement.statut = calculate_statut(
            paiement.montant_du,
            paiement.montant_paye,
            paiement.date_echeance
        )

        # Set payment date if fully paid
        if paiement.montant_paye >= paiement.montant_du and not paiement.date_paiement:
            paiement.date_paiement = date.today()

    db.commit()
    db.refresh(paiement)

    return paiement


@router.post("/{paiement_id}/mark-paid", response_model=PaiementResponse)
async def mark_as_paid(
    paiement_id: int,
    methode_paiement: str = "especes",
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Mark a payment as fully paid
    """
    if not current_user.merkez_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vous devez être professeur ou institut"
        )

    paiement = db.query(Paiement).filter(
        Paiement.id == paiement_id,
        Paiement.merkez_id == current_user.merkez_id
    ).first()

    if not paiement:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Paiement non trouvé"
        )

    paiement.montant_paye = paiement.montant_du
    paiement.statut = "paye"
    paiement.date_paiement = date.today()
    paiement.methode_paiement = methode_paiement

    db.commit()
    db.refresh(paiement)

    return paiement


@router.delete("/{paiement_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_paiement(
    paiement_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a payment record
    """
    if not current_user.merkez_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vous devez être professeur ou institut"
        )

    paiement = db.query(Paiement).filter(
        Paiement.id == paiement_id,
        Paiement.merkez_id == current_user.merkez_id
    ).first()

    if not paiement:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Paiement non trouvé"
        )

    db.delete(paiement)
    db.commit()

    return None


@router.get("/stats/overview")
async def get_payment_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get payment statistics overview
    """
    if not current_user.merkez_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vous devez être professeur ou institut"
        )

    # Current month stats
    current_month = date.today().month
    current_year = date.today().year

    total_du = db.query(Paiement).filter(
        Paiement.merkez_id == current_user.merkez_id
    ).with_entities(
        db.func.sum(Paiement.montant_du)
    ).scalar() or 0

    total_paye = db.query(Paiement).filter(
        Paiement.merkez_id == current_user.merkez_id
    ).with_entities(
        db.func.sum(Paiement.montant_paye)
    ).scalar() or 0

    en_retard_count = db.query(Paiement).filter(
        Paiement.merkez_id == current_user.merkez_id,
        Paiement.statut == "en_retard"
    ).count()

    impaye_count = db.query(Paiement).filter(
        Paiement.merkez_id == current_user.merkez_id,
        or_(Paiement.statut == "impaye", Paiement.statut == "en_retard")
    ).count()

    return {
        "total_du": total_du,
        "total_paye": total_paye,
        "total_restant": total_du - total_paye,
        "en_retard_count": en_retard_count,
        "impaye_count": impaye_count
    }
