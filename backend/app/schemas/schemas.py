from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List, Any, Union
from datetime import date, time, datetime
from uuid import UUID

# User / Profile schemas
class ProfileBase(BaseModel):
    email: str
    full_name: str
    role: str

class ProfileResponse(ProfileBase):
    id: Union[UUID, str]
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class ProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[str] = None

class LoginRequest(BaseModel):
    email: str
    password: str

class SignUpRequest(BaseModel):
    full_name: str
    email: str
    password: str
    role: str = "patient"

class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: ProfileResponse

# Patient schemas
class PatientBase(BaseModel):
    date_of_birth: Optional[date] = None
    gender: Optional[str] = None
    phone_number: Optional[str] = None
    blood_type: Optional[str] = None
    emergency_contact: Optional[dict] = None
    medical_history: Optional[str] = None

class PatientCreate(PatientBase):
    full_name: str
    email: str
    password: Optional[str] = "PatientPass123!"

class PatientResponse(PatientBase):
    id: Union[UUID, str]
    profile: Optional[ProfileResponse] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Doctor schemas
class DoctorBase(BaseModel):
    department_id: Optional[Union[UUID, str]] = None
    license_number: str
    specialization: str
    is_available: bool = True

class DoctorCreate(DoctorBase):
    pass

class DoctorResponse(DoctorBase):
    id: Union[UUID, str]
    profile: Optional[ProfileResponse] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Appointment schemas
class AppointmentCreate(BaseModel):
    doctor_id: Union[UUID, str]
    appointment_date: date
    time_slot: str  # Format: "09:00:00"
    reason: Optional[str] = None
    notes: Optional[str] = None
    patient_id: Optional[Union[UUID, str]] = None

class AppointmentResponse(BaseModel):
    id: Union[UUID, str]
    patient_id: Union[UUID, str]
    doctor_id: Union[UUID, str]
    appointment_date: date
    time_slot: str
    status: str
    reason: Optional[str] = None
    notes: Optional[str] = None
    created_at: Optional[datetime] = None
    patient: Optional[PatientResponse] = None
    doctor: Optional[DoctorResponse] = None

    class Config:
        from_attributes = True

# Medical Report & AI schemas
class MedicalReportResponse(BaseModel):
    id: Union[UUID, str]
    patient_id: Union[UUID, str]
    doctor_id: Optional[Union[UUID, str]] = None
    file_name: str
    file_path: str
    file_size: int
    mime_type: str
    extracted_text: Optional[str] = None
    status: str
    uploaded_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class AIAnalysisResponse(BaseModel):
    id: Union[UUID, str]
    report_id: Union[UUID, str]
    key_findings: Optional[List[Any]] = None
    abnormal_values: Optional[Any] = None
    observations: Optional[List[Any]] = None
    suggested_questions: Optional[List[Any]] = None
    summary_text: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Medication & Prescription schemas
class MedicationBase(BaseModel):
    name: str
    generic_name: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None

class MedicationResponse(MedicationBase):
    id: Union[UUID, str]

    class Config:
        from_attributes = True

class PrescriptionItemCreate(BaseModel):
    medication_id: Union[UUID, str]
    dosage: str
    frequency: str
    duration: str
    instructions: Optional[str] = None

class PrescriptionItemResponse(BaseModel):
    id: Union[UUID, str]
    prescription_id: Union[UUID, str]
    medication_id: Union[UUID, str]
    dosage: str
    frequency: str
    duration: str
    instructions: Optional[str] = None
    medication: Optional[MedicationResponse] = None

    class Config:
        from_attributes = True

class PrescriptionCreate(BaseModel):
    patient_id: Union[UUID, str]
    notes: Optional[str] = None
    items: List[PrescriptionItemCreate]

class PrescriptionResponse(BaseModel):
    id: Union[UUID, str]
    patient_id: Union[UUID, str]
    doctor_id: Union[UUID, str]
    notes: Optional[str] = None
    created_at: Optional[datetime] = None
    items: List[PrescriptionItemResponse] = []
    patient: Optional[PatientResponse] = None
    doctor: Optional[DoctorResponse] = None

    class Config:
        from_attributes = True

# Emergency Case schemas
class EmergencyCaseCreate(BaseModel):
    patient_id: Optional[Union[UUID, str]] = None
    name: str
    age: int
    heart_rate: int
    blood_pressure: str
    spo2: int
    temperature: float
    pain_level: int = Field(..., ge=0, le=10)
    symptoms: str
    consciousness_status: str
    respiratory_difficulty: bool = False

class EmergencyCaseResponse(EmergencyCaseCreate):
    id: Union[UUID, str]
    priority: str
    risk_score: float
    reasoning: Optional[str] = None
    status: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Audit log schemas
class AuditLogResponse(BaseModel):
    id: Union[UUID, str]
    user_id: Optional[Union[UUID, str]] = None
    action: str
    details: Optional[str] = None
    timestamp: Optional[datetime] = None

    class Config:
        from_attributes = True

# Analytics Response schema
class AdminAnalyticsResponse(BaseModel):
    total_patients: int
    total_doctors: int
    total_appointments: int
    emergency_cases_count: int
    department_stats: List[dict]
    triage_counts: List[dict]
