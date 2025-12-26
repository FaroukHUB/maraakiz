from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File, Form
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, desc
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
import shutil
from pathlib import Path
import uuid

from app.database import get_db
from app.models.message import Message
from app.models.user import User
from app.models.eleve import Eleve
from app.models.merkez import Merkez
from app.routes.auth import oauth2_scheme
from jose import JWTError, jwt
import os

router = APIRouter()

SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = "HS256"

# File upload configuration
UPLOAD_DIR = Path("uploads/messages")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
ALLOWED_EXTENSIONS = {
    # Images
    ".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg",
    # Documents
    ".pdf", ".doc", ".docx", ".txt", ".odt",
    # Archives
    ".zip", ".rar",
    # Audio
    ".mp3", ".wav", ".m4a",
    # Video (limité)
    ".mp4", ".mov"
}


# Pydantic schemas
class MessageCreate(BaseModel):
    destinataire_id: int
    sujet: Optional[str] = None
    contenu: str


class MessageResponse(BaseModel):
    id: int
    expediteur_id: int
    destinataire_id: int
    expediteur_type: str
    destinataire_type: str
    sujet: Optional[str]
    contenu: Optional[str]
    fichier_nom: Optional[str]
    fichier_type: Optional[str]
    fichier_taille: Optional[int]
    lu: bool
    archived: bool
    conversation_id: str
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


class ConversationResponse(BaseModel):
    conversation_id: str
    autre_user_id: int
    autre_user_nom: str
    autre_user_type: str
    dernier_message: str
    dernier_message_date: datetime
    non_lus: int


class ContactResponse(BaseModel):
    id: int
    nom: str
    email: str
    type: str

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


# Helper function to generate conversation ID
def generate_conversation_id(user1_id: int, user2_id: int) -> str:
    """Generate a consistent conversation ID for two users"""
    ids = sorted([user1_id, user2_id])
    return f"{ids[0]}_{ids[1]}"


# Routes
@router.get("/conversations", response_model=List[ConversationResponse])
async def get_conversations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all conversations for the current user
    """
    # Get all messages where user is involved
    messages = db.query(Message).filter(
        or_(
            Message.expediteur_id == current_user.id,
            Message.destinataire_id == current_user.id
        ),
        Message.archived == False
    ).order_by(desc(Message.created_at)).all()

    # Group by conversation
    conversations_dict = {}
    for msg in messages:
        conv_id = msg.conversation_id

        if conv_id not in conversations_dict:
            # Determine the other user
            autre_user_id = msg.destinataire_id if msg.expediteur_id == current_user.id else msg.expediteur_id
            autre_user = db.query(User).filter(User.id == autre_user_id).first()

            if autre_user:
                conversations_dict[conv_id] = {
                    "conversation_id": conv_id,
                    "autre_user_id": autre_user_id,
                    "autre_user_nom": autre_user.full_name or autre_user.email,
                    "autre_user_type": autre_user.user_type,
                    "dernier_message": msg.contenu[:100],
                    "dernier_message_date": msg.created_at,
                    "non_lus": 0
                }

    # Count unread messages for each conversation
    for conv_id in conversations_dict.keys():
        non_lus = db.query(Message).filter(
            Message.conversation_id == conv_id,
            Message.destinataire_id == current_user.id,
            Message.lu == False
        ).count()
        conversations_dict[conv_id]["non_lus"] = non_lus

    # Sort by last message date
    conversations = sorted(
        conversations_dict.values(),
        key=lambda x: x["dernier_message_date"],
        reverse=True
    )

    return conversations


@router.get("/conversation/{autre_user_id}", response_model=List[MessageResponse])
async def get_conversation(
    autre_user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all messages in a conversation with another user
    """
    conversation_id = generate_conversation_id(current_user.id, autre_user_id)

    messages = db.query(Message).filter(
        Message.conversation_id == conversation_id
    ).order_by(Message.created_at).all()

    # Mark messages as read
    db.query(Message).filter(
        Message.conversation_id == conversation_id,
        Message.destinataire_id == current_user.id,
        Message.lu == False
    ).update({"lu": True})
    db.commit()

    return messages


@router.post("/", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
async def send_message(
    destinataire_id: int = Form(...),
    contenu: Optional[str] = Form(None),
    sujet: Optional[str] = Form(None),
    fichier: Optional[UploadFile] = File(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Send a new message with optional file attachment
    """
    # Validate that at least content or file is provided
    if not contenu and not fichier:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Le message doit contenir du texte ou un fichier"
        )

    # Verify destinataire exists
    destinataire = db.query(User).filter(User.id == destinataire_id).first()
    if not destinataire:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Destinataire non trouvé"
        )

    # Generate conversation ID
    conversation_id = generate_conversation_id(current_user.id, destinataire_id)

    # Handle file upload if provided
    fichier_nom = None
    fichier_type = None
    fichier_taille = None

    if fichier:
        # Validate file extension
        file_ext = Path(fichier.filename).suffix.lower()
        if file_ext not in ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Type de fichier non autorisé. Extensions autorisées: {', '.join(ALLOWED_EXTENSIONS)}"
            )

        # Read file and check size
        file_content = await fichier.read()
        if len(file_content) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Fichier trop volumineux. Taille maximale: {MAX_FILE_SIZE / 1024 / 1024}MB"
            )

        # Generate unique filename
        unique_filename = f"{uuid.uuid4()}{file_ext}"
        file_path = UPLOAD_DIR / unique_filename

        # Save file
        with open(file_path, "wb") as f:
            f.write(file_content)

        fichier_nom = unique_filename
        fichier_type = fichier.content_type
        fichier_taille = len(file_content)

    # Create message
    new_message = Message(
        expediteur_id=current_user.id,
        destinataire_id=destinataire_id,
        expediteur_type=current_user.user_type,
        destinataire_type=destinataire.user_type,
        sujet=sujet,
        contenu=contenu,
        fichier_nom=fichier_nom,
        fichier_type=fichier_type,
        fichier_taille=fichier_taille,
        conversation_id=conversation_id
    )

    db.add(new_message)
    db.commit()
    db.refresh(new_message)

    return new_message


@router.put("/{message_id}/read", response_model=MessageResponse)
async def mark_as_read(
    message_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Mark a message as read
    """
    message = db.query(Message).filter(
        Message.id == message_id,
        Message.destinataire_id == current_user.id
    ).first()

    if not message:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Message non trouvé"
        )

    message.lu = True
    db.commit()
    db.refresh(message)

    return message


@router.delete("/{message_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_message(
    message_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a message (soft delete - archive)
    """
    message = db.query(Message).filter(
        Message.id == message_id,
        or_(
            Message.expediteur_id == current_user.id,
            Message.destinataire_id == current_user.id
        )
    ).first()

    if not message:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Message non trouvé"
        )

    message.archived = True
    db.commit()

    return None


@router.get("/unread/count")
async def get_unread_count(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get count of unread messages
    """
    count = db.query(Message).filter(
        Message.destinataire_id == current_user.id,
        Message.lu == False,
        Message.archived == False
    ).count()

    return {"count": count}


@router.get("/contacts", response_model=List[ContactResponse])
async def get_available_contacts(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get list of available contacts to start a conversation with
    - For professors/institutes: returns their students
    - For students: returns all professors/institutes
    """
    contacts = []

    if current_user.user_type == "prof":
        # Get all students of this professor/institute
        eleves = db.query(Eleve).filter(
            Eleve.merkez_id == current_user.merkez_id
        ).all()

        for eleve in eleves:
            contacts.append({
                "id": eleve.id,
                "nom": f"{eleve.prenom} {eleve.nom}",
                "email": eleve.email or "Non renseigné",
                "type": "eleve"
            })

    elif current_user.user_type == "eleve":
        # Get all professors/institutes (students can message any professor)
        all_merkezes = db.query(User).filter(
            User.user_type == "prof",
            User.merkez_id.isnot(None)  # Only users with a merkez
        ).all()

        for merkez_user in all_merkezes:
            # Get the merkez to determine if professeur or institut
            merkez = db.query(Merkez).filter(Merkez.id == merkez_user.merkez_id).first()
            if merkez:
                contacts.append({
                    "id": merkez_user.id,
                    "nom": merkez.nom,
                    "email": merkez.email,
                    "type": merkez.type  # "professeur" or "institut"
                })

    return contacts


@router.get("/fichier/{filename}")
async def get_fichier(
    filename: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get/download a message file
    """
    file_path = UPLOAD_DIR / filename

    if not file_path.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Fichier non trouvé"
        )

    # Verify that the user has access to this file
    # Check if the file belongs to a message in user's conversations
    message = db.query(Message).filter(
        Message.fichier_nom == filename,
        or_(
            Message.expediteur_id == current_user.id,
            Message.destinataire_id == current_user.id
        )
    ).first()

    if not message:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Accès non autorisé à ce fichier"
        )

    return FileResponse(
        path=file_path,
        filename=filename,
        media_type=message.fichier_type or "application/octet-stream"
    )
