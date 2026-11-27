from fastapi import APIRouter, Cookie, Depends, HTTPException, Request, Response
from pydantic import BaseModel, Field
from sqlmodel import Session

from backend.api.deps import COOKIE_NAME, get_db, require_user
from backend.models.auth import User
from backend.services import auth as auth_service

router = APIRouter(prefix="/api/auth", tags=["auth"])


class Credentials(BaseModel):
    username: str = Field(min_length=3, max_length=64)
    password: str = Field(min_length=10, max_length=256)


class UserOut(BaseModel):
    id: int
    username: str


def _set_cookie(request: Request, response: Response, token: str) -> None:
    settings = request.app.state.settings
    response.set_cookie(
        COOKIE_NAME,
        token,
        max_age=settings.session_days * 86400,
        httponly=True,
        secure=settings.cookie_secure,
        samesite="lax",
        path="/",
    )


@router.get("/status")
def status(db: Session = Depends(get_db)) -> dict:
    """Lets the UI decide between first-run setup and login."""
    return {"setup_required": auth_service.user_count(db) == 0}


@router.post("/setup", response_model=UserOut, status_code=201)
def setup(
    creds: Credentials, request: Request, response: Response, db: Session = Depends(get_db)
) -> UserOut:
    """Create the single owner account. Only allowed while no user exists."""
    if auth_service.user_count(db) > 0:
        raise HTTPException(status_code=409, detail="Account already exists")
    user = auth_service.create_user(db, creds.username, creds.password)
    token = auth_service.create_session(db, user, request.app.state.settings.session_days)
    _set_cookie(request, response, token)
    return UserOut(id=user.id, username=user.username)


@router.post("/login", response_model=UserOut)
def login(
    creds: Credentials, request: Request, response: Response, db: Session = Depends(get_db)
) -> UserOut:
    limiter = request.app.state.login_limiter
    key = request.client.host if request.client else "unknown"
    if limiter.blocked(key):
        raise HTTPException(status_code=429, detail="Too many failed attempts. Try again later.")
    user = auth_service.authenticate(db, creds.username, creds.password)
    if user is None:
        limiter.record_failure(key)
        raise HTTPException(status_code=401, detail="Invalid username or password")
    limiter.reset(key)
    token = auth_service.create_session(db, user, request.app.state.settings.session_days)
    _set_cookie(request, response, token)
    return UserOut(id=user.id, username=user.username)


@router.post("/logout", status_code=204)
def logout(
    response: Response,
    db: Session = Depends(get_db),
    token: str | None = Cookie(default=None, alias=COOKIE_NAME),
) -> None:
    auth_service.delete_session(db, token)
    response.delete_cookie(COOKIE_NAME, path="/")


@router.get("/me", response_model=UserOut)
def me(user: User = Depends(require_user)) -> UserOut:
    return UserOut(id=user.id, username=user.username)
