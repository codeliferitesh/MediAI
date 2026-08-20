-- MediAI Database Schema SQL
-- Copy and execute this script inside the Supabase SQL Editor.

-- Disable triggers temporarily during setup if needed
SET statement_timeout = 0;
SET client_encoding = 'UTF8';

-- 1. Create custom tables
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('patient', 'doctor', 'receptionist', 'admin')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.doctors (
    id UUID REFERENCES public.profiles ON DELETE CASCADE PRIMARY KEY,
    department_id UUID REFERENCES public.departments ON DELETE SET NULL,
    license_number TEXT UNIQUE NOT NULL,
    specialization TEXT NOT NULL,
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.patients (
    id UUID REFERENCES public.profiles ON DELETE CASCADE PRIMARY KEY,
    date_of_birth DATE,
    gender TEXT,
    phone_number TEXT,
    blood_type TEXT,
    emergency_contact JSONB,
    medical_history TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES public.patients ON DELETE CASCADE NOT NULL,
    doctor_id UUID REFERENCES public.doctors ON DELETE CASCADE NOT NULL,
    appointment_date DATE NOT NULL,
    time_slot TIME NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('scheduled', 'completed', 'cancelled')) DEFAULT 'scheduled',
    reason TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_appointment_slot UNIQUE (doctor_id, appointment_date, time_slot)
);

CREATE TABLE IF NOT EXISTS public.medical_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES public.patients ON DELETE CASCADE NOT NULL,
    doctor_id UUID REFERENCES public.doctors ON DELETE SET NULL,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    mime_type TEXT NOT NULL,
    extracted_text TEXT,
    status TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'failed')) DEFAULT 'pending',
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.ai_analysis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID REFERENCES public.medical_reports ON DELETE CASCADE UNIQUE NOT NULL,
    key_findings JSONB,
    abnormal_values JSONB,
    observations JSONB,
    suggested_questions JSONB,
    summary_text TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.medications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    generic_name TEXT,
    category TEXT,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.prescriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES public.patients ON DELETE CASCADE NOT NULL,
    doctor_id UUID REFERENCES public.doctors ON DELETE CASCADE NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.prescription_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prescription_id UUID REFERENCES public.prescriptions ON DELETE CASCADE NOT NULL,
    medication_id UUID REFERENCES public.medications ON DELETE CASCADE NOT NULL,
    dosage TEXT NOT NULL,         -- e.g. "500mg"
    frequency TEXT NOT NULL,      -- e.g. "Twice daily"
    duration TEXT NOT NULL,       -- e.g. "7 days"
    instructions TEXT,            -- e.g. "Take after food"
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.emergency_cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES public.patients ON DELETE SET NULL,
    name TEXT NOT NULL,
    age INTEGER NOT NULL,
    heart_rate INTEGER NOT NULL,
    blood_pressure TEXT NOT NULL,
    spo2 INTEGER NOT NULL,
    temperature NUMERIC(4, 1) NOT NULL,
    pain_level INTEGER NOT NULL CHECK (pain_level BETWEEN 0 AND 10),
    symptoms TEXT NOT NULL,
    consciousness_status TEXT NOT NULL,
    respiratory_difficulty BOOLEAN NOT NULL DEFAULT FALSE,
    priority TEXT NOT NULL CHECK (priority IN ('Critical', 'High', 'Medium', 'Low')),
    risk_score NUMERIC(5, 2) NOT NULL,
    reasoning TEXT,
    status TEXT NOT NULL CHECK (status IN ('queued', 'treating', 'discharged')) DEFAULT 'queued',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles ON DELETE SET NULL,
    action TEXT NOT NULL,
    details TEXT,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Trigger Function for Auth Sync
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    user_role TEXT;
    full_name_val TEXT;
BEGIN
    user_role := COALESCE(new.raw_user_meta_data->>'role', 'patient');
    full_name_val := COALESCE(new.raw_user_meta_data->>'full_name', 'Medical User');
    
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (
        new.id,
        new.email,
        full_name_val,
        user_role
    );
    
    IF user_role = 'patient' THEN
        INSERT INTO public.patients (id, date_of_birth, gender, phone_number, blood_type)
        VALUES (new.id, '1990-01-01', 'Not Specified', '', 'O+');
    ELSIF user_role = 'doctor' THEN
        INSERT INTO public.doctors (id, department_id, license_number, specialization, is_available)
        VALUES (new.id, null, 'LIC-' || floor(random() * 90000 + 10000)::text, 'General Practitioner', true);
    END IF;

    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 3. Row Level Security Policies (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescription_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Profiles: Anyone authenticated can read profiles (to look up names)
CREATE POLICY "Allow read profiles" ON public.profiles
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow updates for owners or admins" ON public.profiles
    FOR UPDATE TO authenticated USING (auth.uid() = id OR EXISTS (
        SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
    ));

-- Departments: Authenticated can read, Admins can write
CREATE POLICY "Allow read departments" ON public.departments
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow write departments for admins" ON public.departments
    FOR ALL TO authenticated USING (EXISTS (
        SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
    ));

-- Doctors: Anyone authenticated can read
CREATE POLICY "Allow read doctors" ON public.doctors
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow update for doctors themselves or admins" ON public.doctors
    FOR UPDATE TO authenticated USING (auth.uid() = id OR EXISTS (
        SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
    ));

-- Patients: Patient themselves, Doctors, Receptionists, and Admins can read
CREATE POLICY "Allow read patients" ON public.patients
    FOR SELECT TO authenticated USING (
        auth.uid() = id OR EXISTS (
            SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('doctor', 'receptionist', 'admin')
        )
    );

CREATE POLICY "Allow patient to update own record" ON public.patients
    FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Appointments: Patients can view/create own, Doctors can view assigned, Receptionists/Admins full access
CREATE POLICY "Allow appointments select" ON public.appointments
    FOR SELECT TO authenticated USING (
        patient_id = auth.uid() OR doctor_id = auth.uid() OR EXISTS (
            SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('receptionist', 'admin')
        )
    );

CREATE POLICY "Allow appointments insert" ON public.appointments
    FOR INSERT TO authenticated WITH CHECK (
        patient_id = auth.uid() OR EXISTS (
            SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('receptionist', 'admin')
        )
    );

CREATE POLICY "Allow appointments update" ON public.appointments
    FOR UPDATE TO authenticated USING (
        patient_id = auth.uid() OR doctor_id = auth.uid() OR EXISTS (
            SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('receptionist', 'admin')
        )
    );

-- Medical Reports: Patients can view own, Doctors can view reports
CREATE POLICY "Allow reports select" ON public.medical_reports
    FOR SELECT TO authenticated USING (
        patient_id = auth.uid() OR EXISTS (
            SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('doctor', 'admin')
        )
    );

CREATE POLICY "Allow reports insert" ON public.medical_reports
    FOR INSERT TO authenticated WITH CHECK (
        patient_id = auth.uid() OR EXISTS (
            SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('doctor', 'admin')
        )
    );

-- AI Analysis: Matches Medical Reports access rules
CREATE POLICY "Allow ai select" ON public.ai_analysis
    FOR SELECT TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.medical_reports 
            WHERE medical_reports.id = report_id AND (
                medical_reports.patient_id = auth.uid() OR EXISTS (
                    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('doctor', 'admin')
                )
            )
        )
    );

-- Medications: Readable by all, writable by admins
CREATE POLICY "Allow read medications" ON public.medications
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow write medications for admins" ON public.medications
    FOR ALL TO authenticated USING (EXISTS (
        SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
    ));

-- Prescriptions & items: Patient reads own, Doctor manages, Admin/Receptionist view
CREATE POLICY "Allow select prescriptions" ON public.prescriptions
    FOR SELECT TO authenticated USING (
        patient_id = auth.uid() OR doctor_id = auth.uid() OR EXISTS (
            SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'receptionist')
        )
    );

CREATE POLICY "Allow insert prescriptions" ON public.prescriptions
    FOR INSERT TO authenticated WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'doctor'
        )
    );

CREATE POLICY "Allow select prescription items" ON public.prescription_items
    FOR SELECT TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.prescriptions 
            WHERE prescriptions.id = prescription_id AND (
                prescriptions.patient_id = auth.uid() OR prescriptions.doctor_id = auth.uid() OR EXISTS (
                    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'receptionist')
                )
            )
        )
    );

CREATE POLICY "Allow insert prescription items" ON public.prescription_items
    FOR INSERT TO authenticated WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'doctor'
        )
    );

-- Emergency Cases: Readable by Receptionists, Doctors, Admins. Writable by Receptionists/Admins/Doctors.
CREATE POLICY "Allow select emergency cases" ON public.emergency_cases
    FOR SELECT TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('doctor', 'receptionist', 'admin')
        )
    );

CREATE POLICY "Allow insert emergency cases" ON public.emergency_cases
    FOR INSERT TO authenticated WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('doctor', 'receptionist', 'admin')
        )
    );

CREATE POLICY "Allow update emergency cases" ON public.emergency_cases
    FOR UPDATE TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('doctor', 'receptionist', 'admin')
        )
    );

-- Audit Logs: Viewable by Admins, insertable by any actions
CREATE POLICY "Allow read audit logs for admins" ON public.audit_logs
    FOR SELECT TO authenticated USING (EXISTS (
        SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
    ));

CREATE POLICY "Allow system insertions" ON public.audit_logs
    FOR INSERT TO authenticated WITH CHECK (true);

-- 4. Seed Data
INSERT INTO public.departments (name, description) VALUES
('Cardiology', 'Treatment of heart-related conditions and vascular diseases.'),
('Pediatrics', 'Medical care for infants, children, and adolescents.'),
('General Medicine', 'Comprehensive adult healthcare and general diagnosis.'),
('Neurology', 'Diagnosis and treatment of brain and nervous system disorders.'),
('Orthopedics', 'Surgical and non-surgical treatment of bones, joints, and ligaments.')
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.medications (name, generic_name, category, description) VALUES
('Aspirin', 'Acetylsalicylic acid', 'Analgesics / NSAID', 'Used to reduce pain, fever, or inflammation.'),
('Warfarin', 'Warfarin sodium', 'Anticoagulant', 'Blood thinner used to prevent blood clots.'),
('Ibuprofen', 'Ibuprofen', 'Analgesics / NSAID', 'Common pain reliever and anti-inflammatory.'),
('Methotrexate', 'Methotrexate', 'Antimetabolite / Immunosuppressant', 'Used in cancer treatment, severe rheumatoid arthritis, and psoriasis.'),
('Amoxicillin', 'Amoxicillin trihydrate', 'Antibiotic', 'Penicillin antibiotic used to treat bacterial infections.'),
('Lisinopril', 'Lisinopril', 'ACE inhibitor', 'Used to treat high blood pressure and heart failure.')
ON CONFLICT (name) DO NOTHING;
