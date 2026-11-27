from pathlib import Path

from alembic import context
from sqlalchemy import create_engine, pool
from sqlmodel import SQLModel

import backend.models  # noqa: F401  (registers tables on SQLModel.metadata)
from backend.config import get_settings

config = context.config
target_metadata = SQLModel.metadata


def _url() -> str:
    # A URL set programmatically (tests, scripts) wins over the environment.
    url = config.get_main_option("sqlalchemy.url")
    if url:
        return url
    settings = get_settings()
    (Path(settings.data_dir) / "database").mkdir(parents=True, exist_ok=True)
    return settings.db_url


def run_migrations_offline() -> None:
    context.configure(
        url=_url(),
        target_metadata=target_metadata,
        literal_binds=True,
        render_as_batch=True,
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    engine = create_engine(_url(), poolclass=pool.NullPool)
    with engine.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            render_as_batch=True,  # SQLite-safe ALTERs
        )
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
