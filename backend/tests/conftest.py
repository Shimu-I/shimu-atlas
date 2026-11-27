import pytest
from fastapi.testclient import TestClient
from sqlmodel import SQLModel

import backend.models  # noqa: F401
from backend.config import Settings
from backend.main import create_app

CREDS = {"username": "shimu", "password": "correct horse battery"}


@pytest.fixture
def settings(tmp_path) -> Settings:
    return Settings(data_dir=tmp_path / "data", _env_file=None)


@pytest.fixture
def client(settings):
    app = create_app(settings)
    with TestClient(app) as c:
        SQLModel.metadata.create_all(app.state.engine)
        yield c


@pytest.fixture
def logged_in(client):
    r = client.post("/api/auth/setup", json=CREDS)
    assert r.status_code == 201
    return client
