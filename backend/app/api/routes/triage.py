from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.schemas.schemas import EmergencyCaseResponse, EmergencyCaseCreate
from app.models.models import EmergencyCase, AuditLog, Patient
from app.services.triage import calculate_triage_priority
from uuid import UUID
from typing import List

router = APIRouter(prefix="/emergency", tags=["Emergency Triage"])

@router.post("/priority", response_model=EmergencyCaseResponse)
def register_emergency_case(
    data: EmergencyCaseCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Onboard an emergency case, calculate clinical priority, and place in triage queue.
    """
    # Verify authorization (Doctors, Receptionists, and Admins can register emergency vitals)
    if current_user["role"] not in ["doctor", "receptionist", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: clinical privilege required to perform triage registration."
        )

    # 1. Run clinical triage algorithm
    priority, risk_score, reasoning = calculate_triage_priority(
        age=data.age,
        heart_rate=data.heart_rate,
        blood_pressure=data.blood_pressure,
        spo2=data.spo2,
        temperature=data.temperature,
        pain_level=data.pain_level,
        consciousness_status=data.consciousness_status,
        respiratory_difficulty=data.respiratory_difficulty
    )

    # 2. Record to database
    db_case = EmergencyCase(
        patient_id=data.patient_id,
        name=data.name,
        age=data.age,
        heart_rate=data.heart_rate,
        blood_pressure=data.blood_pressure,
        spo2=data.spo2,
        temperature=data.temperature,
        pain_level=data.pain_level,
        symptoms=data.symptoms,
        consciousness_status=data.consciousness_status,
        respiratory_difficulty=data.respiratory_difficulty,
        priority=priority,
        risk_score=risk_score,
        reasoning=reasoning,
        status="queued"
    )

    db.add(db_case)
    
    # Audit log entry
    log = AuditLog(
        user_id=current_user["id"],
        action="TRIAGE_CASE_REGISTERED",
        details=f"Registered emergency patient {data.name}. Calculated priority: {priority} (Score: {risk_score:.1f})"
    )
    db.add(log)
    
    db.commit()
    db.refresh(db_case)
    return db_case

@router.get("/queue", response_model=List[EmergencyCaseResponse])
def get_emergency_queue(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieve active emergency queue (status is 'queued' or 'treating'),
    sorted by risk level (Critical -> High -> Medium -> Low) and risk score.
    """
    if current_user["role"] not in ["doctor", "receptionist", "admin"]:
        raise HTTPException(status_code=403, detail="Forbidden")

    # Order priority custom sort (Critical first)
    # Using SQL CASE expression to order priority levels
    from sqlalchemy import case
    priority_order = case(
        (EmergencyCase.priority == 'Critical', 1),
        (EmergencyCase.priority == 'High', 2),
        (EmergencyCase.priority == 'Medium', 3),
        (EmergencyCase.priority == 'Low', 4),
        else_=5
    )

    return db.query(EmergencyCase).filter(
        EmergencyCase.status.in_(["queued", "treating"])
    ).order_by(
        priority_order,
        EmergencyCase.risk_score.desc()
    ).all()

@router.put("/{case_id}/status", response_model=EmergencyCaseResponse)
def update_emergency_status(
    case_id: UUID,
    status_select: str = Query(..., description="New status: queued, treating, or discharged"),  # 'queued', 'treating', 'discharged'
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update triage treatment stages or discharge processed cases.
    """
    if current_user["role"] not in ["doctor", "receptionist", "admin"]:
        raise HTTPException(status_code=403, detail="Forbidden")

    case = db.query(EmergencyCase).filter(EmergencyCase.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Emergency case not found")

    if status_select not in ["queued", "treating", "discharged"]:
        raise HTTPException(status_code=400, detail="Invalid status choice")

    case.status = status_select
    
    log = AuditLog(
        user_id=current_user["id"],
        action="TRIAGE_CASE_STATUS_UPDATED",
        details=f"Case {case_id} status updated to {status_select}"
    )
    db.add(log)
    db.commit()
    db.refresh(case)
    return case
