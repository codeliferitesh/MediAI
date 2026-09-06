from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.services.ai import analyze_symptoms_chat, has_gemini
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
    if not has_gemini:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AI Clinical Service is not available: Gemini API key is not configured on the server."
        )
    try:
        return analyze_symptoms_chat(data.symptoms)
    except RuntimeError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Unexpected AI service error: {str(e)}"
        )
