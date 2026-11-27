from datetime import timedelta

from sqlmodel import Session, select

from backend.models.auth import User, UserSession, utcnow
from backend.tests.conftest import CREDS


def test_status_requires_setup_on_fresh_install(client):
    assert client.get("/api/auth/status").json() == {"setup_required": True}


def test_setup_creates_owner_and_logs_in(client):
    r = client.post("/api/auth/setup", json=CREDS)
    assert r.status_code == 201
    assert r.json()["username"] == "shimu"
    assert client.get("/api/auth/me").json()["username"] == "shimu"
    assert client.get("/api/auth/status").json() == {"setup_required": False}


def test_setup_only_allowed_once(logged_in):
    r = logged_in.post("/api/auth/setup", json={"username": "other", "password": "another long pass"})
    assert r.status_code == 409


def test_password_is_hashed_never_stored_plain(logged_in):
    with Session(logged_in.app.state.engine) as db:
        user = db.exec(select(User)).one()
    assert user.password_hash.startswith("$argon2")
    assert CREDS["password"] not in user.password_hash


def test_session_token_is_hashed_in_db(logged_in):
    token = logged_in.cookies.get("atlas_session")
    with Session(logged_in.app.state.engine) as db:
        sess = db.exec(select(UserSession)).one()
    assert token and sess.token_hash != token


def test_weak_or_short_credentials_rejected(client):
    r = client.post("/api/auth/setup", json={"username": "ab", "password": "short"})
    assert r.status_code == 422


def test_me_requires_authentication(client):
    assert client.get("/api/auth/me").status_code == 401


def test_login_wrong_password_and_unknown_user(logged_in):
    logged_in.cookies.clear()
    bad = logged_in.post("/api/auth/login", json={**CREDS, "password": "wrong password!!"})
    ghost = logged_in.post("/api/auth/login", json={"username": "nobody", "password": "whatever long"})
    assert bad.status_code == 401 and ghost.status_code == 401
    assert bad.json()["detail"] == ghost.json()["detail"]


def test_login_sets_httponly_cookie(logged_in):
    logged_in.cookies.clear()
    r = logged_in.post("/api/auth/login", json=CREDS)
    assert r.status_code == 200
    assert "httponly" in r.headers["set-cookie"].lower()
    assert logged_in.get("/api/auth/me").status_code == 200


def test_logout_invalidates_session(logged_in):
    assert logged_in.post("/api/auth/logout").status_code == 204
    assert logged_in.get("/api/auth/me").status_code == 401


def test_expired_session_is_rejected(logged_in):
    with Session(logged_in.app.state.engine) as db:
        sess = db.exec(select(UserSession)).one()
        sess.expires_at = utcnow() - timedelta(seconds=1)
        db.add(sess)
        db.commit()
    assert logged_in.get("/api/auth/me").status_code == 401


def test_login_is_rate_limited(logged_in):
    logged_in.cookies.clear()
    bad = {**CREDS, "password": "wrong password!!"}
    for _ in range(logged_in.app.state.settings.login_max_failures):
        assert logged_in.post("/api/auth/login", json=bad).status_code == 401
    assert logged_in.post("/api/auth/login", json=bad).status_code == 429
    # Even the correct password is blocked during the lockout window.
    assert logged_in.post("/api/auth/login", json=CREDS).status_code == 429
