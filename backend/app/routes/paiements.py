from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, extract, func
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime, date, timedelta
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
import secrets

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
    date_paiement: Optional[date] = None
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
    include_archived: bool = Query(False),
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

    # Base query - exclude archived by default
    query = db.query(Paiement).filter(Paiement.merkez_id == current_user.merkez_id)

    if not include_archived:
        query = query.filter(Paiement.archived == False)

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
    print(f"[DEBUG] Creating payment for eleve_id={paiement_data.eleve_id}, mois={paiement_data.mois}, annee={paiement_data.annee}")

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
        print(f"[DEBUG] Student {paiement_data.eleve_id} not found for merkez {current_user.merkez_id}")
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
        print(f"[DEBUG] Payment already exists: id={existing.id}")
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

    print(f"[DEBUG] Creating payment with status: {statut}")

    # Set date_paiement: use provided value, or auto-set if fully paid
    date_paiement_final = paiement_data.date_paiement
    if date_paiement_final is None and paiement_data.montant_paye >= paiement_data.montant_du:
        date_paiement_final = date.today()

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
        date_paiement=date_paiement_final
    )

    db.add(new_paiement)
    db.commit()
    db.refresh(new_paiement)

    print(f"[DEBUG] Payment created successfully: id={new_paiement.id}, archived={new_paiement.archived}")

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


@router.post("/{paiement_id}/add-partial")
async def add_partial_payment(
    paiement_id: int,
    montant: float,
    methode_paiement: str = "especes",
    notes: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Add a partial payment to an existing payment record
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

    # Check if adding this amount would exceed the amount due
    new_total = paiement.montant_paye + montant
    if new_total > paiement.montant_du:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Le montant payé ({new_total}€) dépasserait le montant dû ({paiement.montant_du}€)"
        )

    # Add to montant_paye
    paiement.montant_paye = new_total
    paiement.methode_paiement = methode_paiement

    # Update notes
    if notes:
        existing_notes = paiement.notes or ""
        timestamp = datetime.now().strftime("%d/%m/%Y %H:%M")
        paiement.notes = f"{existing_notes}\n[{timestamp}] Paiement partiel de {montant}€ - {notes}".strip()

    # Recalculate status
    paiement.statut = calculate_statut(
        paiement.montant_du,
        paiement.montant_paye,
        paiement.date_echeance
    )

    # If fully paid now, set payment date
    if paiement.montant_paye >= paiement.montant_du:
        paiement.date_paiement = date.today()

    db.commit()
    db.refresh(paiement)

    return {
        "success": True,
        "paiement": paiement,
        "montant_ajoute": montant,
        "nouveau_total": paiement.montant_paye,
        "reste_a_payer": paiement.montant_du - paiement.montant_paye,
        "statut": paiement.statut
    }


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
    mois: Optional[int] = Query(None),
    annee: Optional[int] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get payment statistics overview, optionally filtered by month/year
    """
    if not current_user.merkez_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vous devez être professeur ou institut"
        )

    # If no month/year specified, use current
    if not mois:
        mois = date.today().month
    if not annee:
        annee = date.today().year

    # Base query - exclude archived by default
    base_query = db.query(Paiement).filter(
        Paiement.merkez_id == current_user.merkez_id,
        Paiement.archived == False
    )

    # Filter by month/year if specified
    if mois and annee:
        base_query = base_query.filter(
            Paiement.mois == mois,
            Paiement.annee == annee
        )

    total_du = base_query.with_entities(
        func.sum(Paiement.montant_du)
    ).scalar() or 0

    total_paye = base_query.with_entities(
        func.sum(Paiement.montant_paye)
    ).scalar() or 0

    en_retard_count = db.query(Paiement).filter(
        Paiement.merkez_id == current_user.merkez_id,
        Paiement.archived == False,
        Paiement.statut == "en_retard"
    )
    if mois and annee:
        en_retard_count = en_retard_count.filter(
            Paiement.mois == mois,
            Paiement.annee == annee
        )
    en_retard_count = en_retard_count.count()

    impaye_count = db.query(Paiement).filter(
        Paiement.merkez_id == current_user.merkez_id,
        Paiement.archived == False,
        or_(Paiement.statut == "impaye", Paiement.statut == "en_retard")
    )
    if mois and annee:
        impaye_count = impaye_count.filter(
            Paiement.mois == mois,
            Paiement.annee == annee
        )
    impaye_count = impaye_count.count()

    return {
        "total_du": total_du,
        "total_paye": total_paye,
        "total_restant": total_du - total_paye,
        "en_retard_count": en_retard_count,
        "impaye_count": impaye_count,
        "mois": mois,
        "annee": annee
    }


@router.post("/{paiement_id}/send-link")
async def send_payment_link(
    paiement_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Generate a unique payment link and send it to the student via email
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

    # Get student info
    eleve = db.query(Eleve).filter(Eleve.id == paiement.eleve_id).first()
    if not eleve:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Élève non trouvé"
        )

    # Get merkez info
    merkez = db.query(Merkez).filter(Merkez.id == current_user.merkez_id).first()

    # Generate unique token
    payment_token = secrets.token_urlsafe(32)

    # Set expiration to 30 days from now
    expiration = datetime.now() + timedelta(days=30)

    # Update payment with link info
    paiement.lien_paiement = payment_token
    paiement.lien_expiration = expiration
    paiement.email_envoye = True
    paiement.date_email = datetime.now()

    db.commit()

    # Send email
    try:
        await send_payment_request_email(
            student_email=eleve.email if eleve.email else eleve.email_parent,
            student_name=f"{eleve.prenom} {eleve.nom}",
            merkez_name=merkez.nom if merkez else "Votre professeur",
            montant=paiement.montant_du,
            mois=paiement.mois,
            annee=paiement.annee,
            payment_token=payment_token,
            date_echeance=paiement.date_echeance
        )
    except Exception as e:
        # Even if email fails, we still created the link
        print(f"Erreur lors de l'envoi de l'email: {e}")

    # Generate the full URL
    frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")
    payment_url = f"{frontend_url}/paiement/{payment_token}"

    return {
        "success": True,
        "payment_url": payment_url,
        "expiration": expiration,
        "email_sent": True
    }


@router.get("/pay/{token}")
async def get_payment_by_token(
    token: str,
    db: Session = Depends(get_db)
):
    """
    Get payment information by token (public endpoint, no auth required)
    """
    paiement = db.query(Paiement).filter(Paiement.lien_paiement == token).first()

    if not paiement:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lien de paiement invalide ou expiré"
        )

    # Check if link is expired
    if paiement.lien_expiration and datetime.now() > paiement.lien_expiration:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ce lien de paiement a expiré"
        )

    # Get student and merkez info
    eleve = db.query(Eleve).filter(Eleve.id == paiement.eleve_id).first()
    merkez = db.query(Merkez).filter(Merkez.id == paiement.merkez_id).first()

    return {
        "id": paiement.id,
        "mois": paiement.mois,
        "annee": paiement.annee,
        "montant_du": paiement.montant_du,
        "montant_paye": paiement.montant_paye,
        "montant_restant": paiement.montant_du - paiement.montant_paye,
        "statut": paiement.statut,
        "date_echeance": paiement.date_echeance,
        "eleve_nom": f"{eleve.prenom} {eleve.nom}" if eleve else "Élève",
        "merkez_nom": merkez.nom if merkez else "Professeur",
        "merkez_email": merkez.email if merkez else None,
        "merkez_telephone": merkez.telephone if merkez else None
    }


@router.post("/pay/{token}/confirm")
async def confirm_payment(
    token: str,
    methode_paiement: str = "virement",
    db: Session = Depends(get_db)
):
    """
    Confirm payment (called when student marks payment as done)
    This doesn't actually process payment, just notifies the professor
    """
    paiement = db.query(Paiement).filter(Paiement.lien_paiement == token).first()

    if not paiement:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lien de paiement invalide"
        )

    # Check if link is expired
    if paiement.lien_expiration and datetime.now() > paiement.lien_expiration:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ce lien de paiement a expiré"
        )

    # Mark as paid
    paiement.montant_paye = paiement.montant_du
    paiement.statut = "paye"
    paiement.date_paiement = date.today()
    paiement.methode_paiement = methode_paiement

    db.commit()

    # TODO: Send notification email to professor

    return {
        "success": True,
        "message": "Paiement confirmé avec succès"
    }


async def send_payment_request_email(
    student_email: str,
    student_name: str,
    merkez_name: str,
    montant: float,
    mois: int,
    annee: int,
    payment_token: str,
    date_echeance: date
):
    """
    Send payment request email to student
    """
    from app.utils.email import send_email

    mois_noms = [
        "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
        "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
    ]
    mois_nom = mois_noms[mois - 1] if 1 <= mois <= 12 else str(mois)

    frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")
    payment_url = f"{frontend_url}/paiement/{payment_token}"

    subject = f"💰 Demande de paiement - {mois_nom} {annee}"

    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            body {{
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
            }}
            .header {{
                background: linear-gradient(135deg, #3b82f6 0%, #10b981 100%);
                color: white;
                padding: 30px;
                border-radius: 10px 10px 0 0;
                text-align: center;
            }}
            .content {{
                background: white;
                padding: 30px;
                border: 1px solid #e5e7eb;
                border-top: none;
            }}
            .amount {{
                font-size: 36px;
                font-weight: bold;
                color: #3b82f6;
                text-align: center;
                margin: 20px 0;
            }}
            .details {{
                background: #f9fafb;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
            }}
            .details-row {{
                display: flex;
                justify-content: space-between;
                padding: 10px 0;
                border-bottom: 1px solid #e5e7eb;
            }}
            .details-row:last-child {{
                border-bottom: none;
            }}
            .cta-button {{
                display: inline-block;
                background: linear-gradient(135deg, #3b82f6 0%, #10b981 100%);
                color: white !important;
                padding: 15px 40px;
                text-decoration: none;
                border-radius: 8px;
                font-weight: bold;
                text-align: center;
                margin: 20px 0;
            }}
            .footer {{
                text-align: center;
                color: #6b7280;
                font-size: 14px;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #e5e7eb;
            }}
        </style>
    </head>
    <body>
        <div class="header">
            <h1>💰 Demande de paiement</h1>
            <p>{merkez_name}</p>
        </div>

        <div class="content">
            <p>Bonjour {student_name},</p>

            <p>Vous avez un paiement en attente pour le mois de <strong>{mois_nom} {annee}</strong>.</p>

            <div class="amount">
                {montant:.2f} €
            </div>

            <div class="details">
                <div class="details-row">
                    <span><strong>Période :</strong></span>
                    <span>{mois_nom} {annee}</span>
                </div>
                <div class="details-row">
                    <span><strong>Montant :</strong></span>
                    <span>{montant:.2f} €</span>
                </div>
                <div class="details-row">
                    <span><strong>Date d'échéance :</strong></span>
                    <span>{date_echeance.strftime('%d/%m/%Y')}</span>
                </div>
                <div class="details-row">
                    <span><strong>Professeur :</strong></span>
                    <span>{merkez_name}</span>
                </div>
            </div>

            <center>
                <a href="{payment_url}" class="cta-button">
                    Voir les détails et payer
                </a>
            </center>

            <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
                Ce lien est valable pendant 30 jours. Si vous avez des questions concernant ce paiement,
                contactez directement votre professeur.
            </p>
        </div>

        <div class="footer">
            <p>Maraakiz - Plateforme de gestion des cours</p>
            <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
        </div>
    </body>
    </html>
    """

    await send_email(
        to_email=student_email,
        subject=subject,
        html_content=html_content
    )


@router.post("/archive-month")
async def archive_month(
    mois: int = Query(...),
    annee: int = Query(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Archive all payments for a specific month/year
    """
    if not current_user.merkez_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vous devez être professeur ou institut"
        )

    # Get all payments for this month
    paiements = db.query(Paiement).filter(
        Paiement.merkez_id == current_user.merkez_id,
        Paiement.mois == mois,
        Paiement.annee == annee,
        Paiement.archived == False
    ).all()

    if not paiements:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Aucun paiement trouvé pour ce mois"
        )

    # Archive all payments
    for p in paiements:
        p.archived = True
        p.archived_at = datetime.now()

    db.commit()

    return {
        "success": True,
        "message": f"{len(paiements)} paiement(s) archivé(s)",
        "count": len(paiements)
    }


@router.post("/unarchive-month")
async def unarchive_month(
    mois: int = Query(...),
    annee: int = Query(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Unarchive all payments for a specific month/year
    """
    if not current_user.merkez_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vous devez être professeur ou institut"
        )

    # Get all archived payments for this month
    paiements = db.query(Paiement).filter(
        Paiement.merkez_id == current_user.merkez_id,
        Paiement.mois == mois,
        Paiement.annee == annee,
        Paiement.archived == True
    ).all()

    if not paiements:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Aucun paiement archivé trouvé pour ce mois"
        )

    # Unarchive all payments
    for p in paiements:
        p.archived = False
        p.archived_at = None

    db.commit()

    return {
        "success": True,
        "message": f"{len(paiements)} paiement(s) désarchivé(s)",
        "count": len(paiements)
    }


@router.get("/archived-months")
async def get_archived_months(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get list of archived months
    """
    if not current_user.merkez_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vous devez être professeur ou institut"
        )

    # Get distinct month/year combinations that have archived payments
    archived = db.query(
        Paiement.mois,
        Paiement.annee,
        func.count(Paiement.id).label('count'),
        func.sum(Paiement.montant_du).label('total_du'),
        func.sum(Paiement.montant_paye).label('total_paye')
    ).filter(
        Paiement.merkez_id == current_user.merkez_id,
        Paiement.archived == True
    ).group_by(
        Paiement.mois,
        Paiement.annee
    ).order_by(
        Paiement.annee.desc(),
        Paiement.mois.desc()
    ).all()

    return [
        {
            "mois": m.mois,
            "annee": m.annee,
            "count": m.count,
            "total_du": m.total_du or 0,
            "total_paye": m.total_paye or 0
        }
        for m in archived
    ]
