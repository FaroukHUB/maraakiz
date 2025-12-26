from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, desc
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

from app.database import get_db
from app.models.message import Message
from app.models.user import User
from app.routes.auth import oauth2_scheme
from jose import JWTError, jwt
import os

router = APIRouter()

SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = "HS256"


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
    contenu: str
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
    message_data: MessageCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Send a new message
    """
    # Verify destinataire exists
    destinataire = db.query(User).filter(User.id == message_data.destinataire_id).first()
    if not destinataire:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Destinataire non trouvé"
        )

    # Generate conversation ID
    conversation_id = generate_conversation_id(current_user.id, message_data.destinataire_id)

    # Create message
    new_message = Message(
        expediteur_id=current_user.id,
        destinataire_id=message_data.destinataire_id,
        expediteur_type=current_user.user_type,
        destinataire_type=destinataire.user_type,
        sujet=message_data.sujet,
        contenu=message_data.contenu,
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
