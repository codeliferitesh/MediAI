import uuid
from typing import List, Union
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.schemas.schemas import PatientResponse, PatientBase, PatientCreate
from app.models.models import Patient, Profile, AuditLog

router = APIRouter(prefix="/patients", tags=["Patients"])

@router.get("/directory", response_model=List[PatientResponse])
@router.get("", response_model=List[PatientResponse])
def get_patient_directory(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieve all registered patients directory with profile details.
    Accessible to all authenticated roles.
    """
    patients = db.query(Patient).all()
    return patients

@router.post("", response_model=PatientResponse, status_code=status.HTTP_201_CREATED)
@router.post("/register", response_model=PatientResponse, status_code=status.HTTP_201_CREATED)
def register_new_patient(
    patient_in: PatientCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Onboard and register a new patient account with medical details.
    Accessible by staff (receptionist, doctor, admin) or self-registration.
    """
    email = patient_in.email.strip().lower()
    profile = db.query(Profile).filter(Profile.email == email).first()
    
    if not profile:
        profile = Profile(
            id=str(uuid.uuid4()),
            email=email,
            full_name=patient_in.full_name,
            role="patient"
        )
        db.add(profile)
        db.flush()
    else:
        profile.full_name = patient_in.full_name
        db.flush()

    patient = db.query(Patient).filter(Patient.id == profile.id).first()
    if not patient:
        patient = Patient(id=profile.id)
        db.add(patient)
        db.flush()

    # Set metadata fields
    if patient_in.date_of_birth is not None:
        patient.date_of_birth = patient_in.date_of_birth
    if patient_in.gender is not None:
        patient.gender = patient_in.gender
    if patient_in.phone_number is not None:
        patient.phone_number = patient_in.phone_number
    if patient_in.blood_type is not None:
        patient.blood_type = patient_in.blood_type
    if patient_in.emergency_contact is not None:
        patient.emergency_contact = patient_in.emergency_contact
    if patient_in.medical_history is not None:
        patient.medical_history = patient_in.medical_history

    log = AuditLog(
        user_id=current_user["id"],
        action="REGISTER_PATIENT",
        details=f"Patient {patient_in.full_name} ({email}) onboarded by {current_user.get('email')}."
    )
    db.add(log)
    db.commit()
    db.refresh(patient)
    return patient

@router.get("/me", response_model=PatientResponse)
def get_my_patient_profile(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get the patient profile associated with the currently logged-in user.
    If the user doesn't have a patient record (e.g. staff profile), auto-create one for seamless experience.
    """
    patient = db.query(Patient).filter(Patient.id == current_user["id"]).first()
    if not patient:
        # Ensure patient record exists for this user profile
        patient = Patient(
            id=current_user["id"],
            medical_history="Baseline health profile."
        )
        db.add(patient)
        db.commit()
        db.refresh(patient)
    return patient

@router.put("/me", response_model=PatientResponse)
def update_my_patient_profile(
    patient_data: PatientBase,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update patient specific fields (e.g. date of birth, blood type, emergency contact) for the logged-in user.
    """
    patient = db.query(Patient).filter(Patient.id == current_user["id"]).first()
    if not patient:
        patient = Patient(id=current_user["id"])
        db.add(patient)
        db.flush()
        
    for key, value in patient_data.model_dump(exclude_unset=True).items():
        setattr(patient, key, value)
        
    log = AuditLog(
        user_id=current_user["id"],
        action="UPDATE_PATIENT_METADATA",
        details="Patient updated personal medical details."
    )
    db.add(log)
    db.commit()
    db.refresh(patient)
    return patient

@router.get("/{patient_id}", response_model=PatientResponse)
def get_patient_by_id(
    patient_id: str,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieve clinical patient details. Accessible by Doctors, Receptionists, Admins, and the Patient themselves.
    """
    # Role checker validation
    if current_user["role"] not in ["doctor", "receptionist", "admin"] and str(current_user["id"]) != str(patient_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: insufficient permissions"
        )
        
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        # Check if profile exists and create sub-record
        profile = db.query(Profile).filter(Profile.id == patient_id).first()
        if profile:
            patient = Patient(id=profile.id)
            db.add(patient)
            db.commit()
            db.refresh(patient)
        else:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Patient record not found"
            )
    return patient
