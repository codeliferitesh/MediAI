from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.services.ai import analyze_symptoms_chat
from pydantic import BaseModel

router = APIRouter(prefix="/ai", tags=["AI Clinical Services"])

class SymptomRequest(BaseModel):
    symptoms: str

@router.post("/symptoms")
def analyze_symptoms(
    data: SymptomRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Symptom checker dialog assistant. Collects symptoms and generates safety triage guidance.
    """
    return analyze_symptoms_chat(data.symptoms)
