from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user, RoleChecker
from app.schemas.schemas import PrescriptionResponse, PrescriptionCreate, MedicationResponse
from app.models.models import Prescription, PrescriptionItem, Medication, AuditLog, Patient, Doctor, Profile
from app.services.interaction import check_medication_interactions
from uuid import UUID
from typing import List

router = APIRouter(prefix="/prescriptions", tags=["Prescriptions"])

@router.post("/check-interactions", response_model=List[dict])
def check_interactions(
    med_ids: List[UUID],
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Check if a list of medication IDs have any known adverse drug interactions.
    """
    # Look up medication names from database
    meds = db.query(Medication).filter(Medication.id.in_(med_ids)).all()
    med_names = [med.name for med in meds]
    
    return check_medication_interactions(med_names)

@router.post("", response_model=PrescriptionResponse)
def create_prescription(
    data: PrescriptionCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Save a digital prescription. Only Doctors can create prescriptions.
    """
    if current_user["role"] != "doctor":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Only qualified doctors can write prescriptions"
        )
        
    # Check patient exists
    pat = db.query(Patient).filter(Patient.id == data.patient_id).first()
    if not pat:
        prof = db.query(Profile).filter(Profile.id == data.patient_id).first()
        if prof:
            pat = Patient(id=prof.id)
            db.add(pat)
            db.flush()
        else:
            raise HTTPException(status_code=404, detail="Patient profile not found. Please select a registered patient.")

    # Save prescription header
    db_presc = Prescription(
        patient_id=data.patient_id,
        doctor_id=current_user["id"],
        notes=data.notes
    )
    db.add(db_presc)
    db.flush() # Retrieve prescription ID

    # Save prescription items
    for item in data.items:
        db_item = PrescriptionItem(
            prescription_id=db_presc.id,
            medication_id=item.medication_id,
            dosage=item.dosage,
            frequency=item.frequency,
            duration=item.duration,
            instructions=item.instructions
        )
        db.add(db_item)

    # Log to audit trace
    log = AuditLog(
        user_id=current_user["id"],
        action="WRITE_PRESCRIPTION",
        details=f"Wrote prescription {db_presc.id} for Patient {data.patient_id}"
    )
    db.add(log)
    db.commit()
    db.refresh(db_presc)
    return db_presc

@router.get("/patient/{patient_id}", response_model=List[PrescriptionResponse])
def get_patient_prescriptions(
    patient_id: UUID,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieve clinical prescriptions written for a specific patient.
    """
    if current_user["role"] == "patient" and str(current_user["id"]) != str(patient_id):
        raise HTTPException(status_code=403, detail="Unauthorized access")
        
    return db.query(Prescription).filter(Prescription.patient_id == patient_id).all()

@router.get("/medications", response_model=List[MedicationResponse])
def list_medications(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieve list of available medications in the database.
    """
    return db.query(Medication).all()
