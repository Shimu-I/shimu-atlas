import sqlite3
from pathlib import Path

from alembic import command
from alembic.config import Config
from sqlalchemy import text

from backend.database.session import make_engine

ROOT = Path(__file__).resolve().parents[2]


def test_health_is_public_and_reports_ai_optional(client):
    r = client.get("/api/health")
    assert r.status_code == 200
    body = r.json()
    assert body["status"] == "ok" and body["database"] == "ok"
    assert body["ai"] == "not_configured"


def test_foreign_keys_and_wal_enabled(client):
    with client.app.state.engine.connect() as conn:
        assert conn.execute(text("PRAGMA foreign_keys")).scalar() == 1
        assert conn.execute(text("PRAGMA journal_mode")).scalar().lower() == "wal"


def test_migrations_create_schema_on_fresh_database(tmp_path):
    db_file = tmp_path / "fresh.db"
    cfg = Config(str(ROOT / "alembic.ini"))
    cfg.set_main_option("script_location", str(ROOT / "backend" / "migrations"))
    cfg.set_main_option("sqlalchemy.url", f"sqlite:///{db_file}")
    command.upgrade(cfg, "head")

    tables = {
        r[0]
        for r in sqlite3.connect(db_file).execute(
            "SELECT name FROM sqlite_master WHERE type='table'"
        )
    }
    assert {"users", "sessions", "alembic_version"} <= tables


def test_migrations_match_models(tmp_path):
    """No model change may be left without a migration."""
    from alembic.autogenerate import compare_metadata
    from alembic.migration import MigrationContext
    from sqlmodel import SQLModel

    db_file = tmp_path / "check.db"
    cfg = Config(str(ROOT / "alembic.ini"))
    cfg.set_main_option("script_location", str(ROOT / "backend" / "migrations"))
    cfg.set_main_option("sqlalchemy.url", f"sqlite:///{db_file}")
    command.upgrade(cfg, "head")

    engine = make_engine(f"sqlite:///{db_file}")
    with engine.connect() as conn:
        diff = compare_metadata(MigrationContext.configure(conn), SQLModel.metadata)
    assert diff == []
