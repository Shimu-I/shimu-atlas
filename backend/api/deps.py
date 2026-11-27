from collections.abc import Iterator

from fastapi import Cookie, Depends, HTTPException, Request
from sqlmodel import Session

from backend.models.auth import User
from backend.services import auth as auth_service

COOKIE_NAME = "atlas_session"


def get_db(request: Request) -> Iterator[Session]:
    with Session(request.app.state.engine) as session:
        yield session


def require_user(
    db: Session = Depends(get_db),
    token: str | None = Cookie(default=None, alias=COOKIE_NAME),
) -> User:
    user = auth_service.user_for_token(db, token)
    if user is None:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return user
