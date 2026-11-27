from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Configuration from environment variables (prefix ATLAS_) or a .env file."""

    model_config = SettingsConfigDict(env_prefix="ATLAS_", env_file=".env", extra="ignore")

    data_dir: Path = Path("data")
    database_url: str | None = None
    session_days: int = 30
    cookie_secure: bool = False
    login_max_failures: int = 5
    login_window_seconds: int = 300

    @property
    def db_url(self) -> str:
        if self.database_url:
            return self.database_url
        return f"sqlite:///{(self.data_dir / 'database' / 'atlas.db').resolve()}"

    def ensure_dirs(self) -> None:
        for sub in ("database", "books", "covers", "backups"):
            (self.data_dir / sub).mkdir(parents=True, exist_ok=True)


@lru_cache
def get_settings() -> Settings:
    return Settings()
