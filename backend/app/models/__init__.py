from app.database import Base
from .merkez import Merkez
from .user import User
from .eleve import Eleve
from .cours import Cours
from .message import Message

__all__ = ["Base", "Merkez", "User", "Eleve", "Cours", "Message"]
