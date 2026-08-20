import uuid
from sqlalchemy import Column, String, Integer, Boolean, DateTime, ForeignKey, Date, Numeric, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class Profile(Base):
    __tablename__ = "profiles"

    id = Column(String, primary_key=True, default=generate_uuid)
    email = Column(String, nullable=False, unique=True)
    full_name = Column(String, nullable=False)
    role = Column(String, nullable=False)  # 'patient', 'doctor', 'receptionist', 'admin'
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    patient = relationship("Patient", back_populates="profile", uselist=False, cascade="all, delete-orphan")
    doctor = relationship("Doctor", back_populates="profile", uselist=False, cascade="all, delete-orphan")

class Department(Base):
    __tablename__ = "departments"

    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, unique=True, nullable=False)
    description = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    doctors = relationship("Doctor", back_populates="department")

class Doctor(Base):
    __tablename__ = "doctors"

    id = Column(String, ForeignKey("profiles.id", ondelete="CASCADE"), primary_key=True)
    department_id = Column(String, ForeignKey("departments.id", ondelete="SET NULL"), nullable=True)

    license_number = Column(String, unique=True, nullable=False)
    specialization = Column(String, nullable=False)
    is_available = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    profile = relationship("Profile", back_populates="doctor")
    department = relationship("Department", back_populates="doctors")
    appointments = relationship("Appointment", back_populates="doctor")
    reports = relationship("MedicalReport", back_populates="doctor")
    prescriptions = relationship("Prescription", back_populates="doctor")

class Patient(Base):
    __tablename__ = "patients"

    id = Column(String, ForeignKey("profiles.id", ondelete="CASCADE"), primary_key=True)
    date_of_birth = Column(Date, nullable=True)
    gender = Column(String, nullable=True)
    phone_number = Column(String, nullable=True)
    blood_type = Column(String, nullable=True)
    emergency_contact = Column(JSON, nullable=True)
    medical_history = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    profile = relationship("Profile", back_populates="patient")
    appointments = relationship("Appointment", back_populates="patient")
    reports = relationship("MedicalReport", back_populates="patient")
    prescriptions = relationship("Prescription", back_populates="patient")
    emergency_cases = relationship("EmergencyCase", back_populates="patient")

class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(String, primary_key=True, default=generate_uuid)
    patient_id = Column(String, ForeignKey("patients.id", ondelete="CASCADE"), nullable=False)
    doctor_id = Column(String, ForeignKey("doctors.id", ondelete="CASCADE"), nullable=False)
    appointment_date = Column(Date, nullable=False)
    time_slot = Column(String, nullable=False)  # e.g. "09:00:00"
    status = Column(String, default="scheduled", nullable=False)  # 'scheduled', 'completed', 'cancelled'
    reason = Column(String, nullable=True)
    notes = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    patient = relationship("Patient", back_populates="appointments")
    doctor = relationship("Doctor", back_populates="appointments")

class MedicalReport(Base):
    __tablename__ = "medical_reports"

    id = Column(String, primary_key=True, default=generate_uuid)
    patient_id = Column(String, ForeignKey("patients.id", ondelete="CASCADE"), nullable=False)
    doctor_id = Column(String, ForeignKey("doctors.id", ondelete="SET NULL"), nullable=True)
    file_name = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    file_size = Column(Integer, nullable=False)
    mime_type = Column(String, nullable=False)
    extracted_text = Column(String, nullable=True)
    status = Column(String, default="pending", nullable=False)  # 'pending', 'processing', 'completed', 'failed'
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    patient = relationship("Patient", back_populates="reports")
    doctor = relationship("Doctor", back_populates="reports")
    ai_analysis = relationship("AIAnalysis", back_populates="report", uselist=False, cascade="all, delete-orphan")

class AIAnalysis(Base):
    __tablename__ = "ai_analysis"

    id = Column(String, primary_key=True, default=generate_uuid)
    report_id = Column(String, ForeignKey("medical_reports.id", ondelete="CASCADE"), unique=True, nullable=False)
    key_findings = Column(JSON, nullable=True)
    abnormal_values = Column(JSON, nullable=True)
    observations = Column(JSON, nullable=True)
    suggested_questions = Column(JSON, nullable=True)
    summary_text = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    report = relationship("MedicalReport", back_populates="ai_analysis")

class Medication(Base):
    __tablename__ = "medications"

    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, unique=True, nullable=False)
    generic_name = Column(String, nullable=True)
    category = Column(String, nullable=True)
    description = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    prescription_items = relationship("PrescriptionItem", back_populates="medication")

class Prescription(Base):
    __tablename__ = "prescriptions"

    id = Column(String, primary_key=True, default=generate_uuid)
    patient_id = Column(String, ForeignKey("patients.id", ondelete="CASCADE"), nullable=False)
    doctor_id = Column(String, ForeignKey("doctors.id", ondelete="CASCADE"), nullable=False)
    notes = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    patient = relationship("Patient", back_populates="prescriptions")
    doctor = relationship("Doctor", back_populates="prescriptions")
    items = relationship("PrescriptionItem", back_populates="prescription", cascade="all, delete-orphan")

class PrescriptionItem(Base):
    __tablename__ = "prescription_items"

    id = Column(String, primary_key=True, default=generate_uuid)
    prescription_id = Column(String, ForeignKey("prescriptions.id", ondelete="CASCADE"), nullable=False)
    medication_id = Column(String, ForeignKey("medications.id", ondelete="CASCADE"), nullable=False)
    dosage = Column(String, nullable=False)
    frequency = Column(String, nullable=False)
    duration = Column(String, nullable=False)
    instructions = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    prescription = relationship("Prescription", back_populates="items")
    medication = relationship("Medication", back_populates="prescription_items")

class EmergencyCase(Base):
    __tablename__ = "emergency_cases"

    id = Column(String, primary_key=True, default=generate_uuid)
    patient_id = Column(String, ForeignKey("patients.id", ondelete="SET NULL"), nullable=True)
    name = Column(String, nullable=False)
    age = Column(Integer, nullable=False)
    heart_rate = Column(Integer, nullable=False)
    blood_pressure = Column(String, nullable=False)
    spo2 = Column(Integer, nullable=False)
    temperature = Column(Numeric(4, 1), nullable=False)
    pain_level = Column(Integer, nullable=False)
    symptoms = Column(String, nullable=False)
    consciousness_status = Column(String, nullable=False)
    respiratory_difficulty = Column(Boolean, default=False, nullable=False)
    priority = Column(String, nullable=False)  # 'Critical', 'High', 'Medium', 'Low'
    risk_score = Column(Numeric(5, 2), nullable=False)
    reasoning = Column(String, nullable=True)
    status = Column(String, default="queued", nullable=False)  # 'queued', 'treating', 'discharged'
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    patient = relationship("Patient", back_populates="emergency_cases")

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("profiles.id", ondelete="SET NULL"), nullable=True)
    action = Column(String, nullable=False)
    details = Column(String, nullable=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

