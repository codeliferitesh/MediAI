from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.models import Department, Doctor, Profile
from pydantic import BaseModel
from uuid import UUID
from typing import List

router = APIRouter(prefix="/departments", tags=["Departments & Doctors"])

class DoctorDirectoryResponse(BaseModel):
    id: UUID
    full_name: str
    specialization: str
    is_available: bool
    department_name: str

    class Config:
        from_attributes = True

@router.get("", response_model=List[dict])
def list_departments(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    List all active clinical departments.
    """
    depts = db.query(Department).all()
    return [{"id": d.id, "name": d.name, "description": d.description} for d in depts]

@router.get("/doctors", response_model=List[DoctorDirectoryResponse])
def get_doctors_directory(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieve clinical directory of doctors with availability markers.
    """
    results = db.query(
        Doctor.id,
        Profile.full_name,
        Doctor.specialization,
        Doctor.is_available,
        Department.name.label("department_name")
    ).join(
        Profile, Profile.id == Doctor.id
    ).outerjoin(
        Department, Department.id == Doctor.department_id
    ).all()
    
    # If no doctors exist in local SQLite yet, add a demo doctor so they can immediately book appointments in local demo mode!
    if not results:
        # Check if we have any doctor profile
        doc_prof = db.query(Profile).filter(Profile.role == "doctor").first()
        if doc_prof:
            # Check if department exists
            dept = db.query(Department).first()
            doc_record = db.query(Doctor).filter(Doctor.id == doc_prof.id).first()
            if doc_record and dept:
                doc_record.department_id = dept.id
                db.commit()
                results = db.query(
                    Doctor.id,
                    Profile.full_name,
                    Doctor.specialization,
                    Doctor.is_available,
                    Department.name.label("department_name")
                ).join(Profile, Profile.id == Doctor.id).outerjoin(Department, Department.id == Doctor.department_id).all()
                
    return [{
        "id": r.id,
        "full_name": r.full_name,
        "specialization": r.specialization,
        "is_available": r.is_available,
        "department_name": r.department_name or "General Outpatient"
    } for r in results]
