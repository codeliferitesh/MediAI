from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user, supabase
from app.schemas.schemas import MedicalReportResponse, AIAnalysisResponse
from app.models.models import MedicalReport, AIAnalysis, AuditLog, Patient
from app.services.ocr import extract_text_from_file
from app.services.ai import summarize_medical_report, analyze_medical_image
from uuid import UUID
import os
import uuid
from typing import List

router = APIRouter(prefix="/reports", tags=["Medical Reports"])

UPLOAD_DIR = "./static/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

ALLOWED_MIME_TYPES = ["application/pdf", "image/png", "image/jpeg", "image/jpg"]
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB limit

@router.post("/upload", response_model=MedicalReportResponse)
async def upload_report(
    patient_id: UUID,
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Upload a patient report (PDF/Image), run OCR, and record details in database.
    """
    # 1. Validate role access
    if current_user["role"] == "patient" and current_user["id"] != patient_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Unauthorized: Patients can only upload their own reports"
        )
        
    # Check patient exists
    pat = db.query(Patient).filter(Patient.id == patient_id).first()
    if not pat:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Target patient profile not found in database"
        )

    # 2. Validate MIME type
    if file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file type. Only PDF and JPG/PNG images are allowed."
        )

    # Read bytes and check size
    file_bytes = await file.read()
    if len(file_bytes) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File is too large. Maximum allowed size is 5MB."
        )

    # 3. Save File (Required Supabase Storage upload)
    if not supabase:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Supabase service is not configured on the server."
        )

    unique_filename = f"{uuid.uuid4()}_{file.filename}"
    supabase_path = f"{patient_id}/{unique_filename}"
    
    try:
        # Upload to private bucket
        supabase.storage.from_("medical-reports").upload(
            path=supabase_path,
            file=file_bytes,
            file_options={"content-type": file.content_type}
        )
        file_url = f"medical-reports/{supabase_path}"
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Supabase storage upload failed: {str(e)}"
        )

    # 4. OCR text extraction
    extracted_text = extract_text_from_file(file_bytes, file.filename)

    # 5. Save to database
    report = MedicalReport(
        patient_id=patient_id,
        doctor_id=current_user["id"] if current_user["role"] == "doctor" else None,
        file_name=file.filename,
        file_path=file_url,
        file_size=len(file_bytes),
        mime_type=file.content_type,
        extracted_text=extracted_text,
        status="completed"
    )
    db.add(report)
    db.flush()

    # 6. AI Summary creation
    try:
        if file.content_type.startswith("image/"):
            summary_data = analyze_medical_image(file_bytes, file.content_type)
        else:
            summary_data = summarize_medical_report(extracted_text)

        analysis = AIAnalysis(
            report_id=report.id,
            key_findings=summary_data.get("key_findings"),
            abnormal_values=summary_data.get("abnormal_values"),
            observations=summary_data.get("observations"),
            suggested_questions=summary_data.get("suggested_questions"),
            summary_text=summary_data.get("summary_text")
        )
        db.add(analysis)
    except Exception as ai_err:
        print(f"AI summarization triggered warning: {ai_err}")

    # Audit logging
    log = AuditLog(
        user_id=current_user["id"],
        action="UPLOAD_REPORT",
        details=f"Uploaded report {file.filename} for Patient {patient_id}."
    )
    db.add(log)
    db.commit()
    db.refresh(report)

    return report

@router.get("/patient/{patient_id}", response_model=List[MedicalReportResponse])
def get_reports_by_patient(
    patient_id: UUID,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieve all reports for a specific patient.
    """
    if current_user["role"] == "patient" and current_user["id"] != patient_id:
        raise HTTPException(status_code=403, detail="Access denied")
        
    return db.query(MedicalReport).filter(MedicalReport.patient_id == patient_id).all()

@router.get("/{report_id}/analysis", response_model=AIAnalysisResponse)
def get_report_analysis(
    report_id: UUID,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieve the AI diagnostic summary analysis of a specific report.
    """
    report = db.query(MedicalReport).filter(MedicalReport.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
        
    if current_user["role"] == "patient" and report.patient_id != current_user["id"]:
        raise HTTPException(status_code=403, detail="Access denied")
        
    analysis = db.query(AIAnalysis).filter(AIAnalysis.report_id == report_id).first()
    if not analysis:
        raise HTTPException(status_code=404, detail="AI Analysis not generated for this report")
        
    return analysis
