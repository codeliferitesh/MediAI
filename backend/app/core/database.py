import os
from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker
from app.core.config import settings

db_url = settings.DATABASE_URL
engine = None

if db_url and "placeholder" not in db_url:
    if db_url.startswith("postgres://"):
        db_url = db_url.replace("postgres://", "postgresql://", 1)
    try:
        test_engine = create_engine(
            db_url,
            pool_size=5,
            max_overflow=10,
            pool_pre_ping=True
        )
        with test_engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        engine = test_engine
        print("[Database] Successfully connected to PostgreSQL Supabase database.")
    except Exception as e:
        print(f"[Database] PostgreSQL connection failed ({e}). Falling back to local SQLite database.")
        engine = None

if engine is None:
    sqlite_url = "sqlite:///./mediai.db"
    engine = create_engine(
        sqlite_url,
        connect_args={"check_same_thread": False}
    )
    print("[Database] Initialized local SQLite fallback engine (mediai.db).")

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

