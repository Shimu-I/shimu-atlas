from sqlalchemy import Engine, event
from sqlmodel import create_engine


def make_engine(url: str) -> Engine:
    """Create a SQLite engine with foreign keys enforced and WAL journaling."""
    engine = create_engine(url, connect_args={"check_same_thread": False})

    @event.listens_for(engine, "connect")
    def _set_pragmas(dbapi_conn, _record):  # pragma: no cover - exercised via tests
        cur = dbapi_conn.cursor()
        cur.execute("PRAGMA foreign_keys=ON")
        cur.execute("PRAGMA journal_mode=WAL")
        cur.execute("PRAGMA synchronous=NORMAL")
        cur.close()

    return engine
