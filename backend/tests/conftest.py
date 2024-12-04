import pytest

import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from app.database import SessionLocal


@pytest.fixture(scope="function")
def db_session():
    db = SessionLocal()
    yield db
    db.close()
