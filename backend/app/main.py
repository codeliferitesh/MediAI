from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.core.config import settings
from app.core.database import engine, Base, SessionLocal
from app.core.seeder import seed_database
from app.api.routes import (
    auth,
    patients,
    appointments,
    reports,
    prescriptions,
    triage,
    analytics,
    departments,
    ai
)
import os

# Initialize database schemas and seed initial accounts
try:
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    seed_database(db)
    db.close()
except Exception as e:
    print(f"Database connection/seeding error during startup: {e}")

app = FastAPI(
    title="MediAI API",
    description="Intelligent Hospital Management & Clinical Decision Support System",
    version="1.0.0"
)

# CORS Policy - allows frontend to connect to the backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount local static files directory to serve laboratory uploads during fallback
os.makedirs("./static/uploads", exist_ok=True)
app.mount("/api/uploads", StaticFiles(directory="./static/uploads"), name="uploads")

# Include all modular routers
app.include_router(auth.router, prefix="/api")
app.include_router(patients.router, prefix="/api")
app.include_router(appointments.router, prefix="/api")
app.include_router(reports.router, prefix="/api")
app.include_router(prescriptions.router, prefix="/api")
app.include_router(triage.router, prefix="/api")
app.include_router(analytics.router, prefix="/api")
app.include_router(departments.router, prefix="/api")
app.include_router(ai.router, prefix="/api")

@app.get("/")
def read_root():
    return {"status": "ok", "app": "MediAI CDSS Backend"}
