from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.core.security import get_current_user, RoleChecker
from app.schemas.schemas import AdminAnalyticsResponse
from app.models.models import Patient, Doctor, Appointment, EmergencyCase, Department, Profile
from typing import List

router = APIRouter(prefix="/admin/analytics", tags=["Admin Analytics"])

@router.get("", response_model=AdminAnalyticsResponse)
def get_admin_analytics(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Compile high-level administrative metrics and charts datasets for hospital oversight.
    """
    # 1. Admin permission check
    if current_user["role"] != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Admin credentials required."
        )

    # 2. Query basic counts
    total_patients = db.query(func.count(Patient.id)).scalar() or 0
    total_doctors = db.query(func.count(Doctor.id)).scalar() or 0
    total_appointments = db.query(func.count(Appointment.id)).scalar() or 0
    emergency_cases_count = db.query(func.count(EmergencyCase.id)).scalar() or 0

    # 3. Department stats (Count doctors per department)
    dept_stats = []
    departments = db.query(Department).all()
    for dept in departments:
        doc_count = db.query(func.count(Doctor.id)).filter(Doctor.department_id == dept.id).scalar() or 0
        dept_stats.append({
            "name": dept.name,
            "value": doc_count
        })

    # If no departments are seeded/active, supply standard defaults for visual placeholder
    if not dept_stats:
        dept_stats = [
            {"name": "Cardiology", "value": 2},
            {"name": "Pediatrics", "value": 3},
            {"name": "General Medicine", "value": 5},
            {"name": "Neurology", "value": 1},
            {"name": "Orthopedics", "value": 2}
        ]

    # 4. Triage counts (emergency cases count per priority level)
    triage_counts = []
    priorities = ["Critical", "High", "Medium", "Low"]
    for p in priorities:
        count = db.query(func.count(EmergencyCase.id)).filter(EmergencyCase.priority == p).scalar() or 0
        triage_counts.append({
            "name": p,
            "value": count
        })
        
    return {
        "total_patients": total_patients,
        "total_doctors": total_doctors,
        "total_appointments": total_appointments,
        "emergency_cases_count": emergency_cases_count,
        "department_stats": dept_stats,
        "triage_counts": triage_counts
    }
