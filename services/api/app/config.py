from __future__ import annotations

import os
import secrets
from pathlib import Path
from dotenv import load_dotenv

ROOT_DIR = Path(__file__).resolve().parents[3]
load_dotenv(ROOT_DIR / ".env")
DATA_DIR = Path(os.getenv("VERICARB_DATA_DIR", ROOT_DIR / "data")).resolve()
UPLOAD_DIR = DATA_DIR / "evidence"
DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{(DATA_DIR / 'vericarb.sqlite3').as_posix()}")
APP_ENV = os.getenv("APP_ENV", "development").lower()
TOKEN_SECRET = os.getenv("VERICARB_TOKEN_SECRET") or secrets.token_urlsafe(48)
TOKEN_TTL_SECONDS = int(os.getenv("TOKEN_TTL_SECONDS", "28800"))
MAX_UPLOAD_BYTES = int(os.getenv("MAX_UPLOAD_BYTES", str(10 * 1024 * 1024)))
ALLOWED_ORIGINS = [x.strip() for x in os.getenv("CORS_ORIGINS", "http://localhost:8000,http://127.0.0.1:8000").split(",") if x.strip()]

DATA_DIR.mkdir(parents=True, exist_ok=True)
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

