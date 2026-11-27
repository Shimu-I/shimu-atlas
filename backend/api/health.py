from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlmodel import Session

from backend import __version__
from backend.api.deps import get_db

router = APIRouter(prefix="/api", tags=["health"])


@router.get("/health")
def health(db: Session = Depends(get_db)) -> dict:
    db.exec(text("SELECT 1"))
    # The AI layer is optional and not part of the core app yet.
    return {"status": "ok", "version": __version__, "database": "ok", "ai": "not_configured"}
