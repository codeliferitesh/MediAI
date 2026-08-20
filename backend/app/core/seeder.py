import uuid
import datetime
from sqlalchemy.orm import Session
from app.models.models import (
    Profile, Department, Doctor, Patient, Medication, 
    Appointment, Prescription, PrescriptionItem, EmergencyCase
)

def seed_database(db: Session):
    """
    Seeds the local database with all accounts, departments, doctors, patients,
    medications, and sample clinical triage cases from ides.md.
    """
    print("[Seeder] Checking and populating initial seed data...")

    # 1. Departments
    departments_data = [
        ("Cardiology", "Cardiovascular care, heart conditions, electrophysiology, and hypertension management."),
        ("Pediatrics", "Infant, child, and adolescent healthcare, neonatology, and vaccinations."),
        ("General Medicine", "Comprehensive adult primary healthcare, internal medicine, and chronic disease triage."),
        ("Neurology", "Brain, spinal cord, nervous system disorders, and neurosurgery."),
        ("Orthopedics", "Bones, joint replacements, musculoskeletal trauma, and sports medicine.")
    ]

    dept_map = {}
    for name, desc in departments_data:
        dept = db.query(Department).filter(Department.name == name).first()
        if not dept:
            dept = Department(
                id=str(uuid.uuid4()),
                name=name,
                description=desc
            )
            db.add(dept)
            db.flush()
        dept_map[name] = dept.id

    # 2. Doctors (from ides.md)
    doctors_data = [
        ("doctor@mediai.com", "Dr. Rajesh Kumar", "Cardiology", "Chief Cardiologist", "LIC-10001"),
        ("doctor.priya@mediai.com", "Dr. Priya Sharma", "Cardiology", "Electrophysiologist", "LIC-10006"),
        ("doctor.ananya@mediai.com", "Dr. Ananya Iyer", "Pediatrics", "Pediatric Specialist", "LIC-10002"),
        ("doctor.rohan@mediai.com", "Dr. Rohan Mehta", "Pediatrics", "Neonatal Specialist", "LIC-10007"),
        ("doctor.amit@mediai.com", "Dr. Amit Patel", "General Medicine", "Family Physician", "LIC-10003"),
        ("doctor.kavita@mediai.com", "Dr. Kavita Nair", "General Medicine", "Internal Medicine Specialist", "LIC-10008"),
        ("doctor.sunita@mediai.com", "Dr. Sunita Rao", "Neurology", "Neurologist", "LIC-10004"),
        ("doctor.sanjay@mediai.com", "Dr. Sanjay Dutt", "Neurology", "Neurosurgeon", "LIC-10009"),
        ("doctor.vikram@mediai.com", "Dr. Vikram Singh", "Orthopedics", "Orthopedic Surgeon", "LIC-10005"),
        ("doctor.divya@mediai.com", "Dr. Divya Joshi", "Orthopedics", "Sports Medicine Specialist", "LIC-10010"),
    ]

    doc_map = {}
    for email, full_name, dept_name, spec, lic in doctors_data:
        prof = db.query(Profile).filter(Profile.email == email).first()
        if not prof:
            prof = Profile(
                id=str(uuid.uuid4()),
                email=email,
                full_name=full_name,
                role="doctor"
            )
            db.add(prof)
            db.flush()
        else:
            prof.role = "doctor"
            prof.full_name = full_name
            db.flush()

        doc_map[email] = prof.id

        doc = db.query(Doctor).filter(Doctor.id == prof.id).first()
        if not doc:
            doc = Doctor(
                id=prof.id,
                department_id=dept_map.get(dept_name),
                license_number=lic,
                specialization=spec,
                is_available=True
            )
            db.add(doc)
            db.flush()
        else:
            doc.department_id = dept_map.get(dept_name)
            doc.license_number = lic
            doc.specialization = spec
            db.flush()

    # 3. Staff accounts (receptionist & admin)
    staff_data = [
        ("receptionist@mediai.com", "Priya Sen", "receptionist"),
        ("admin@mediai.com", "Amit Sharma", "admin")
    ]
    for email, full_name, role in staff_data:
        prof = db.query(Profile).filter(Profile.email == email).first()
        if not prof:
            prof = Profile(
                id=str(uuid.uuid4()),
                email=email,
                full_name=full_name,
                role=role
            )
            db.add(prof)
            db.flush()
        else:
            prof.role = role
            prof.full_name = full_name
            db.flush()

    # 4. Patients (from ides.md)
    patients_data = [
        ("patient@mediai.com", "Aarav Sharma", "1995-04-12", "Male", "9876543210", "A+", "No chronic diseases. Seasonal pollen allergy."),
        ("patient.priyan@mediai.com", "Priyan Patel", "1988-08-23", "Male", "9123456789", "O+", "Mild asthma managed with inhaler."),
        ("patient.vivaan@mediai.com", "Vivaan Shah", "2002-12-05", "Male", "9812763450", "B-", "Penicillin allergy."),
        ("patient.aditya@mediai.com", "Aditya Verma", "1978-01-30", "Male", "9772345100", "AB+", "Hypertension."),
        ("patient.sai@mediai.com", "Sai Prasad", "1991-10-15", "Male", "9554312780", "O-", "Healthy baseline."),
        ("patient.diya@mediai.com", "Diya Sen", "1999-07-08", "Female", "9443217800", "A-", "Lactose intolerance."),
        ("patient.ishan@mediai.com", "Ishan Gupta", "1985-03-25", "Male", "9224315780", "B+", "G6PD deficiency."),
        ("patient.ananya@mediai.com", "Ananya Reddy", "1993-09-17", "Female", "9881234509", "O+", "Regular checkup."),
        ("patient.kabir@mediai.com", "Kabir Kapoor", "2005-02-14", "Male", "9776543120", "A+", "Dust allergy."),
        ("patient.meera@mediai.com", "Meera Nair", "1965-11-11", "Female", "9112233445", "AB-", "Type 2 Diabetes. Managed with Metformin.")
    ]

    pat_map = {}
    for email, full_name, dob_str, gender, phone, blood, history in patients_data:
        prof = db.query(Profile).filter(Profile.email == email).first()
        if not prof:
            prof = Profile(
                id=str(uuid.uuid4()),
                email=email,
                full_name=full_name,
                role="patient"
            )
            db.add(prof)
            db.flush()
        else:
            prof.role = "patient"
            prof.full_name = full_name
            db.flush()

        pat_map[email] = prof.id

        dob = datetime.datetime.strptime(dob_str, "%Y-%m-%d").date() if dob_str else None
        pat = db.query(Patient).filter(Patient.id == prof.id).first()
        if not pat:
            pat = Patient(
                id=prof.id,
                date_of_birth=dob,
                gender=gender,
                phone_number=phone,
                blood_type=blood,
                medical_history=history
            )
            db.add(pat)
            db.flush()
        else:
            pat.date_of_birth = dob
            pat.gender = gender
            pat.phone_number = phone
            pat.blood_type = blood
            pat.medical_history = history
            db.flush()

    # 5. Medications
    medications_data = [
        ("Aspirin", "Acetylsalicylic acid", "NSAID", "Pain and clot prevention."),
        ("Warfarin", "Warfarin sodium", "Anticoagulant", "Blood thinner."),
        ("Ibuprofen", "Ibuprofen", "NSAID", "Pain reliever and inflammation reduction."),
        ("Methotrexate", "Methotrexate", "Immunosuppressant", "Arthritis and psoriasis management."),
        ("Amoxicillin", "Amoxicillin trihydrate", "Antibiotic", "Bacterial infections."),
        ("Lisinopril", "Lisinopril", "ACE inhibitor", "Blood pressure control and cardiovascular support."),
        ("Paracetamol", "Acetaminophen", "Analgesic", "Mild to moderate pain relief and fever reducer."),
        ("Metformin", "Metformin HCl", "Antidiabetic", "Type 2 diabetes glycemic control."),
        ("Atorvastatin", "Atorvastatin calcium", "Statin", "Cholesterol and lipid reduction."),
        ("Omeprazole", "Omeprazole", "Proton Pump Inhibitor", "Acid reflux and GERD treatment.")
    ]

    med_map = {}
    for name, gen, cat, desc in medications_data:
        med = db.query(Medication).filter(Medication.name == name).first()
        if not med:
            med = Medication(
                id=str(uuid.uuid4()),
                name=name,
                generic_name=gen,
                category=cat,
                description=desc
            )
            db.add(med)
            db.flush()
        med_map[name] = med.id

    # 6. Sample Emergency Cases (if table is empty)
    if db.query(EmergencyCase).count() == 0:
        sample_cases = [
            EmergencyCase(
                id=str(uuid.uuid4()),
                patient_id=pat_map.get("patient.aditya@mediai.com"),
                name="Aditya Verma",
                age=48,
                heart_rate=132,
                blood_pressure="175/110",
                spo2=91,
                temperature=38.7,
                pain_level=8,
                symptoms="Acute substernal chest pressure, diaphoresis, radiating left arm pain",
                consciousness_status="Alert",
                respiratory_difficulty=True,
                priority="Critical",
                risk_score=92.5,
                reasoning="High probability of acute coronary syndrome with hypertensive crisis.",
                status="queued"
            ),
            EmergencyCase(
                id=str(uuid.uuid4()),
                patient_id=pat_map.get("patient.priyan@mediai.com"),
                name="Priyan Patel",
                age=38,
                heart_rate=105,
                blood_pressure="128/82",
                spo2=93,
                temperature=37.1,
                pain_level=5,
                symptoms="Severe wheezing, shortness of breath unresponsive to rescue inhaler",
                consciousness_status="Alert",
                respiratory_difficulty=True,
                priority="High",
                risk_score=74.0,
                reasoning="Acute asthma exacerbation with moderate hypoxemia.",
                status="queued"
            ),
            EmergencyCase(
                id=str(uuid.uuid4()),
                patient_id=pat_map.get("patient.kabir@mediai.com"),
                name="Kabir Kapoor",
                age=21,
                heart_rate=78,
                blood_pressure="120/75",
                spo2=99,
                temperature=36.8,
                pain_level=6,
                symptoms="Right ankle inversion sprain during sports, localized edema",
                consciousness_status="Alert",
                respiratory_difficulty=False,
                priority="Medium",
                risk_score=38.0,
                reasoning="Soft tissue musculoskeletal trauma; stable vitals.",
                status="queued"
            ),
        ]
        db.add_all(sample_cases)
        db.flush()

    # 7. Sample Appointments (if empty)
    if db.query(Appointment).count() == 0:
        today = datetime.date.today()
        sample_appts = [
            Appointment(
                id=str(uuid.uuid4()),
                patient_id=pat_map.get("patient@mediai.com"),
                doctor_id=doc_map.get("doctor@mediai.com"),
                appointment_date=today + datetime.timedelta(days=1),
                time_slot="10:00:00",
                status="scheduled",
                reason="Routine cardiovascular health checkup and BP monitoring",
                notes="Patient requested morning slot"
            ),
            Appointment(
                id=str(uuid.uuid4()),
                patient_id=pat_map.get("patient.priyan@mediai.com"),
                doctor_id=doc_map.get("doctor.amit@mediai.com"),
                appointment_date=today + datetime.timedelta(days=2),
                time_slot="11:30:00",
                status="scheduled",
                reason="Follow-up on respiratory management",
                notes="Review inhaler frequency"
            ),
        ]
        db.add_all(sample_appts)
        db.flush()

    # 8. Sample Prescriptions (if empty)
    if db.query(Prescription).count() == 0 and pat_map.get("patient@mediai.com") and doc_map.get("doctor@mediai.com"):
        presc = Prescription(
            id=str(uuid.uuid4()),
            patient_id=pat_map.get("patient@mediai.com"),
            doctor_id=doc_map.get("doctor@mediai.com"),
            notes="Take with food. Monitor blood pressure weekly."
        )
        db.add(presc)
        db.flush()

        if med_map.get("Lisinopril"):
            item = PrescriptionItem(
                id=str(uuid.uuid4()),
                prescription_id=presc.id,
                medication_id=med_map.get("Lisinopril"),
                dosage="10mg",
                frequency="Once daily (Morning)",
                duration="30 days",
                instructions="Take with water before breakfast."
            )
            db.add(item)
            db.flush()

    db.commit()
    print("[Seeder] Database seeding completed successfully! All ides.md credentials ready.")
