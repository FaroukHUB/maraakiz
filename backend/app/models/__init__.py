from app.database import Base
from .merkez import Merkez
from .user import User
from .eleve import Eleve
from .cours import Cours
from .message import Message
from .paiement import Paiement
from .notes_cours import NotesCours

__all__ = ["Base", "Merkez", "User", "Eleve", "Cours", "Message", "Paiement", "NotesCours"]
