from contextlib import asynccontextmanager

from fastapi import FastAPI

from backend import __version__
from backend.api import auth, health
from backend.config import Settings, get_settings
from backend.database.session import make_engine
from backend.services.auth import LoginLimiter


def create_app(settings: Settings | None = None) -> FastAPI:
    settings = settings or get_settings()

    @asynccontextmanager
    async def lifespan(app: FastAPI):
        settings.ensure_dirs()
        app.state.engine = make_engine(settings.db_url)
        yield
        app.state.engine.dispose()

    app = FastAPI(title="Shimu Atlas", version=__version__, lifespan=lifespan)
    app.state.settings = settings
    app.state.login_limiter = LoginLimiter(
        settings.login_max_failures, settings.login_window_seconds
    )
    app.include_router(health.router)
    app.include_router(auth.router)
    return app


app = create_app()
