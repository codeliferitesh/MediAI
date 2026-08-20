from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.schemas.schemas import AppointmentResponse, AppointmentCreate
from app.models.models import Appointment, Patient, Doctor, AuditLog, Profile
from uuid import UUID
from datetime import date
from typing import List

router = APIRouter(prefix="/appointments", tags=["Appointments"])

@router.post("", response_model=AppointmentResponse)
def create_appointment(
    data: AppointmentCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Book a new consultation, checking for time-slot double-bookings.
    """
    # 1. Determine target patient id
    if current_user["role"] == "patient":
        patient_id = current_user["id"]
    else:
        # Receptionists and admins can book on behalf of any patient
        patient_id = data.patient_id or current_user["id"]
        
    # Check for double booking conflicts on the same doctor, date, and slot
    conflict = db.query(Appointment).filter(
        Appointment.doctor_id == data.doctor_id,
        Appointment.appointment_date == data.appointment_date,
        Appointment.time_slot == data.time_slot,
        Appointment.status != "cancelled"
    ).first()
    
    if conflict:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="The requested time slot for this doctor is already booked."
        )
        
    # Check if patient exists in database (or create if profile exists)
    pat = db.query(Patient).filter(Patient.id == patient_id).first()
    if not pat:
        prof = db.query(Profile).filter(Profile.id == patient_id).first()
        if prof:
            pat = Patient(id=prof.id)
            db.add(pat)
            db.flush()
        else:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Patient profile not found. Please select a valid registered patient."
            )

    db_appt = Appointment(
        patient_id=patient_id,
        doctor_id=data.doctor_id,
        appointment_date=data.appointment_date,
        time_slot=data.time_slot,
        reason=data.reason,
        notes=data.notes,
        status="scheduled"
    )
    
    db.add(db_appt)
    
    # Audit logging
    log = AuditLog(
        user_id=current_user["id"],
        action="BOOK_APPOINTMENT",
        details=f"Booked appointment with Doctor ID {data.doctor_id} on {data.appointment_date} at {data.time_slot}"
    )
    db.add(log)
    
    db.commit()
    db.refresh(db_appt)
    return db_appt

@router.get("", response_model=List[AppointmentResponse])
def list_appointments(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    List appointments filtered by active role (Patient, Doctor, Receptionist, Admin).
    """
    role = current_user["role"]
    user_id = current_user["id"]
    
    if role == "patient":
        return db.query(Appointment).filter(Appointment.patient_id == user_id).all()
    elif role == "doctor":
        return db.query(Appointment).filter(Appointment.doctor_id == user_id).all()
    else:
        # Admins and Receptionists can see all appointments
        return db.query(Appointment).all()

@router.put("/{appt_id}", response_model=AppointmentResponse)
def update_appointment_status(
    appt_id: UUID,
    appt_status: str,  # 'scheduled', 'completed', 'cancelled'
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update appointment details or cancel/complete slots.
    """
    appt = db.query(Appointment).filter(Appointment.id == appt_id).first()
    if not appt:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Appointment record not found"
        )
        
    # Role checks
    role = current_user["role"]
    if role == "patient" and appt.patient_id != current_user["id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Cannot modify another patient's appointment"
        )
    elif role == "doctor" and appt.doctor_id != current_user["id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Cannot modify an unassigned appointment"
        )
        
    if appt_status not in ['scheduled', 'completed', 'cancelled']:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid status selection"
        )
        
    appt.status = appt_status
    
    log = AuditLog(
        user_id=current_user["id"],
        action="UPDATE_APPOINTMENT_STATUS",
        details=f"Appointment {appt_id} updated to {appt_status}"
    )
    db.add(log)
    db.commit()
    db.refresh(appt)
    return appt

@router.delete("/{appt_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_appointment(
    appt_id: UUID,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Physically delete an appointment slot.
    """
    appt = db.query(Appointment).filter(Appointment.id == appt_id).first()
    if not appt:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Appointment record not found"
        )
        
    # Permission Checks
    role = current_user["role"]
    if role == "patient" and appt.patient_id != current_user["id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Cannot delete another patient's appointment"
        )
    elif role == "doctor" and appt.doctor_id != current_user["id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Cannot delete an unassigned appointment"
        )
        
    db.delete(appt)
    
    log = AuditLog(
        user_id=current_user["id"],
        action="DELETE_APPOINTMENT",
        details=f"Appointment {appt_id} has been deleted."
    )
    db.add(log)
    db.commit()
    return
