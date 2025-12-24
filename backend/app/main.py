from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.database import Base, engine
from app.models import user, merkez, eleve, planning, abonnement, message  # noqa: F401

from app.api.auth_routes import router as auth_router
from app.api.merkez_routes import router as merkez_router
from app.api.eleve_routes import router as eleve_router
from app.api.planning_routes import router as planning_router
from app.api.abonnement_routes import router as abonnement_router
from app.api.message_routes import router as message_router
from app.api.stats_routes import router as stats_router
from app.api.public_merkez_routes import router as public_merkez_router

def create_app() -> FastAPI:
    app = FastAPI(title=settings.APP_NAME)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.get("/", tags=["Health"])
    def health():
        return {"status": "ok", "name": settings.APP_NAME}

    app.include_router(auth_router, prefix=settings.API_PREFIX)
    app.include_router(merkez_router, prefix=settings.API_PREFIX)
    app.include_router(eleve_router, prefix=settings.API_PREFIX)
    app.include_router(planning_router, prefix=settings.API_PREFIX)
    app.include_router(abonnement_router, prefix=settings.API_PREFIX)
    app.include_router(message_router, prefix=settings.API_PREFIX)
    app.include_router(stats_router, prefix=settings.API_PREFIX)
    app.include_router(public_merkez_router, prefix=settings.API_PREFIX)

    return app

app = create_app()

# Create tables (dev only). For prod, prefer Alembic migrations.
Base.metadata.create_all(bind=engine)
