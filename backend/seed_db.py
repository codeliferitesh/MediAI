import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text

# Load environment variables
load_dotenv()

db_url = os.getenv("DATABASE_URL")
if not db_url or "your-project-id" in db_url:
    print("Error: DATABASE_URL is not set or is using placeholder values.")
    exit(1)

print("Connecting to Supabase PostgreSQL database...")
engine = create_engine(db_url)

sql_block = """
DO $$
DECLARE
    doc_id UUID;
    pat_id UUID;
    dept_id UUID;
    med_id UUID;
    presc_id UUID;
BEGIN
    -- 1. Seed Departments
    INSERT INTO public.departments (name, description) VALUES
    ('Cardiology', 'Treatment of heart-related conditions.'),
    ('Pediatrics', 'Medical care for children.'),
    ('General Medicine', 'Comprehensive adult healthcare.'),
    ('Neurology', 'Brain and nervous system disorders.'),
    ('Orthopedics', 'Treatment of bones, joints, and ligaments.')
    ON CONFLICT (name) DO NOTHING;

    -- 2. Seed Medications
    INSERT INTO public.medications (name, generic_name, category, description) VALUES
    ('Aspirin', 'Acetylsalicylic acid', 'NSAID', 'Pain and clot prevention.'),
    ('Warfarin', 'Warfarin sodium', 'Anticoagulant', 'Blood thinner.'),
    ('Ibuprofen', 'Ibuprofen', 'NSAID', 'Pain reliever.'),
    ('Methotrexate', 'Methotrexate', 'Immunosuppressant', 'Arthritis/Psoriasis.'),
    ('Amoxicillin', 'Amoxicillin trihydrate', 'Antibiotic', 'Bacterial infections.'),
    ('Lisinopril', 'Lisinopril', 'ACE inhibitor', 'Blood pressure control.')
    ON CONFLICT (name) DO NOTHING;

    -- 3. Seed Doctors (using the exact pre-filled doctor@mediai.com email!)
    -- Doctor 1
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'doctor@mediai.com') THEN
        INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, role, aud)
        VALUES (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'doctor@mediai.com', '$2a$10$7Z8l7u.oT.6NEXV/ZpExEeqY1u83tPpH6.1N78zUu8k/LqgN3C8aO', now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Dr. Rajesh Kumar","role":"doctor"}', false, 'authenticated', 'authenticated')
        RETURNING id INTO doc_id;
        
        dept_id := (SELECT id FROM public.departments WHERE name = 'Cardiology' LIMIT 1);
        UPDATE public.doctors SET department_id = dept_id, specialization = 'Chief Cardiologist', license_number = 'LIC-10001' WHERE id = doc_id;
    END IF;

    -- Doctor 2
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'doctor.ananya@mediai.com') THEN
        INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, role, aud)
        VALUES (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'doctor.ananya@mediai.com', '$2a$10$7Z8l7u.oT.6NEXV/ZpExEeqY1u83tPpH6.1N78zUu8k/LqgN3C8aO', now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Dr. Ananya Iyer","role":"doctor"}', false, 'authenticated', 'authenticated')
        RETURNING id INTO doc_id;
        
        dept_id := (SELECT id FROM public.departments WHERE name = 'Pediatrics' LIMIT 1);
        UPDATE public.doctors SET department_id = dept_id, specialization = 'Pediatric Specialist', license_number = 'LIC-10002' WHERE id = doc_id;
    END IF;

    -- Doctor 3
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'doctor.amit@mediai.com') THEN
        INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, role, aud)
        VALUES (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'doctor.amit@mediai.com', '$2a$10$7Z8l7u.oT.6NEXV/ZpExEeqY1u83tPpH6.1N78zUu8k/LqgN3C8aO', now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Dr. Amit Patel","role":"doctor"}', false, 'authenticated', 'authenticated')
        RETURNING id INTO doc_id;
        
        dept_id := (SELECT id FROM public.departments WHERE name = 'General Medicine' LIMIT 1);
        UPDATE public.doctors SET department_id = dept_id, specialization = 'Family Physician', license_number = 'LIC-10003' WHERE id = doc_id;
    END IF;

    -- Doctor 4
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'doctor.sunita@mediai.com') THEN
        INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, role, aud)
        VALUES (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'doctor.sunita@mediai.com', '$2a$10$7Z8l7u.oT.6NEXV/ZpExEeqY1u83tPpH6.1N78zUu8k/LqgN3C8aO', now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Dr. Sunita Rao","role":"doctor"}', false, 'authenticated', 'authenticated')
        RETURNING id INTO doc_id;
        
        dept_id := (SELECT id FROM public.departments WHERE name = 'Neurology' LIMIT 1);
        UPDATE public.doctors SET department_id = dept_id, specialization = 'Neurologist', license_number = 'LIC-10004' WHERE id = doc_id;
    END IF;

    -- Doctor 5
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'doctor.vikram@mediai.com') THEN
        INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, role, aud)
        VALUES (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'doctor.vikram@mediai.com', '$2a$10$7Z8l7u.oT.6NEXV/ZpExEeqY1u83tPpH6.1N78zUu8k/LqgN3C8aO', now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Dr. Vikram Singh","role":"doctor"}', false, 'authenticated', 'authenticated')
        RETURNING id INTO doc_id;
        
        dept_id := (SELECT id FROM public.departments WHERE name = 'Orthopedics' LIMIT 1);
        UPDATE public.doctors SET department_id = dept_id, specialization = 'Orthopedic Surgeon', license_number = 'LIC-10005' WHERE id = doc_id;
    END IF;

    -- Doctor 6
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'doctor.priya@mediai.com') THEN
        INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, role, aud)
        VALUES (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'doctor.priya@mediai.com', '$2a$10$7Z8l7u.oT.6NEXV/ZpExEeqY1u83tPpH6.1N78zUu8k/LqgN3C8aO', now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Dr. Priya Sharma","role":"doctor"}', false, 'authenticated', 'authenticated')
        RETURNING id INTO doc_id;
        
        dept_id := (SELECT id FROM public.departments WHERE name = 'Cardiology' LIMIT 1);
        UPDATE public.doctors SET department_id = dept_id, specialization = 'Electrophysiologist', license_number = 'LIC-10006' WHERE id = doc_id;
    END IF;

    -- Doctor 7
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'doctor.rohan@mediai.com') THEN
        INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, role, aud)
        VALUES (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'doctor.rohan@mediai.com', '$2a$10$7Z8l7u.oT.6NEXV/ZpExEeqY1u83tPpH6.1N78zUu8k/LqgN3C8aO', now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Dr. Rohan Mehta","role":"doctor"}', false, 'authenticated', 'authenticated')
        RETURNING id INTO doc_id;
        
        dept_id := (SELECT id FROM public.departments WHERE name = 'Pediatrics' LIMIT 1);
        UPDATE public.doctors SET department_id = dept_id, specialization = 'Neonatal Specialist', license_number = 'LIC-10007' WHERE id = doc_id;
    END IF;

    -- Doctor 8
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'doctor.kavita@mediai.com') THEN
        INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, role, aud)
        VALUES (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'doctor.kavita@mediai.com', '$2a$10$7Z8l7u.oT.6NEXV/ZpExEeqY1u83tPpH6.1N78zUu8k/LqgN3C8aO', now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Dr. Kavita Nair","role":"doctor"}', false, 'authenticated', 'authenticated')
        RETURNING id INTO doc_id;
        
        dept_id := (SELECT id FROM public.departments WHERE name = 'General Medicine' LIMIT 1);
        UPDATE public.doctors SET department_id = dept_id, specialization = 'Internal Medicine Specialist', license_number = 'LIC-10008' WHERE id = doc_id;
    END IF;

    -- Doctor 9
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'doctor.sanjay@mediai.com') THEN
        INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, role, aud)
        VALUES (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'doctor.sanjay@mediai.com', '$2a$10$7Z8l7u.oT.6NEXV/ZpExEeqY1u83tPpH6.1N78zUu8k/LqgN3C8aO', now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Dr. Sanjay Dutt","role":"doctor"}', false, 'authenticated', 'authenticated')
        RETURNING id INTO doc_id;
        
        dept_id := (SELECT id FROM public.departments WHERE name = 'Neurology' LIMIT 1);
        UPDATE public.doctors SET department_id = dept_id, specialization = 'Neurosurgeon', license_number = 'LIC-10009' WHERE id = doc_id;
    END IF;

    -- Doctor 10
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'doctor.divya@mediai.com') THEN
        INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, role, aud)
        VALUES (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'doctor.divya@mediai.com', '$2a$10$7Z8l7u.oT.6NEXV/ZpExEeqY1u83tPpH6.1N78zUu8k/LqgN3C8aO', now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Dr. Divya Joshi","role":"doctor"}', false, 'authenticated', 'authenticated')
        RETURNING id INTO doc_id;
        
        dept_id := (SELECT id FROM public.departments WHERE name = 'Orthopedics' LIMIT 1);
        UPDATE public.doctors SET department_id = dept_id, specialization = 'Sports Medicine Specialist', license_number = 'LIC-10010' WHERE id = doc_id;
    END IF;


    -- 4. Seed Patients (using the exact pre-filled patient@mediai.com email!)
    -- Patient 1
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'patient@mediai.com') THEN
        INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, role, aud)
        VALUES (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'patient@mediai.com', '$2a$10$7Z8l7u.oT.6NEXV/ZpExEeqY1u83tPpH6.1N78zUu8k/LqgN3C8aO', now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Aarav Sharma","role":"patient"}', false, 'authenticated', 'authenticated')
        RETURNING id INTO pat_id;
        
        UPDATE public.patients SET date_of_birth = '1995-04-12', gender = 'Male', phone_number = '9876543210', blood_type = 'A+', medical_history = 'No chronic diseases. Seasonal pollen allergy.' WHERE id = pat_id;
    END IF;

    -- Patient 2
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'patient.priyan@mediai.com') THEN
        INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, role, aud)
        VALUES (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'patient.priyan@mediai.com', '$2a$10$7Z8l7u.oT.6NEXV/ZpExEeqY1u83tPpH6.1N78zUu8k/LqgN3C8aO', now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Priyan Patel","role":"patient"}', false, 'authenticated', 'authenticated')
        RETURNING id INTO pat_id;
        
        UPDATE public.patients SET date_of_birth = '1988-08-23', gender = 'Male', phone_number = '9123456789', blood_type = 'O+', medical_history = 'Mild asthma managed with inhaler.' WHERE id = pat_id;
    END IF;

    -- Patient 3
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'patient.vivaan@mediai.com') THEN
        INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, role, aud)
        VALUES (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'patient.vivaan@mediai.com', '$2a$10$7Z8l7u.oT.6NEXV/ZpExEeqY1u83tPpH6.1N78zUu8k/LqgN3C8aO', now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Vivaan Shah","role":"patient"}', false, 'authenticated', 'authenticated')
        RETURNING id INTO pat_id;
        
        UPDATE public.patients SET date_of_birth = '2002-12-05', gender = 'Male', phone_number = '9812763450', blood_type = 'B-', medical_history = 'Penicillin allergy.' WHERE id = pat_id;
    END IF;

    -- Patient 4
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'patient.aditya@mediai.com') THEN
        INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, role, aud)
        VALUES (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'patient.aditya@mediai.com', '$2a$10$7Z8l7u.oT.6NEXV/ZpExEeqY1u83tPpH6.1N78zUu8k/LqgN3C8aO', now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Aditya Verma","role":"patient"}', false, 'authenticated', 'authenticated')
        RETURNING id INTO pat_id;
        
        UPDATE public.patients SET date_of_birth = '1978-01-30', gender = 'Male', phone_number = '9772345100', blood_type = 'AB+', medical_history = 'Hypertension.' WHERE id = pat_id;
    END IF;

    -- Patient 5
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'patient.sai@mediai.com') THEN
        INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, role, aud)
        VALUES (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'patient.sai@mediai.com', '$2a$10$7Z8l7u.oT.6NEXV/ZpExEeqY1u83tPpH6.1N78zUu8k/LqgN3C8aO', now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Sai Prasad","role":"patient"}', false, 'authenticated', 'authenticated')
        RETURNING id INTO pat_id;
        
        UPDATE public.patients SET date_of_birth = '1991-10-15', gender = 'Male', phone_number = '9554312780', blood_type = 'O-', medical_history = 'Healthy baseline.' WHERE id = pat_id;
    END IF;

    -- Patient 6
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'patient.diya@mediai.com') THEN
        INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, role, aud)
        VALUES (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'patient.diya@mediai.com', '$2a$10$7Z8l7u.oT.6NEXV/ZpExEeqY1u83tPpH6.1N78zUu8k/LqgN3C8aO', now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Diya Sen","role":"patient"}', false, 'authenticated', 'authenticated')
        RETURNING id INTO pat_id;
        
        UPDATE public.patients SET date_of_birth = '1999-07-08', gender = 'Female', phone_number = '9443217800', blood_type = 'A-', medical_history = 'Lactose intolerance.' WHERE id = pat_id;
    END IF;

    -- Patient 7
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'patient.ishan@mediai.com') THEN
        INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, role, aud)
        VALUES (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'patient.ishan@mediai.com', '$2a$10$7Z8l7u.oT.6NEXV/ZpExEeqY1u83tPpH6.1N78zUu8k/LqgN3C8aO', now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Ishan Gupta","role":"patient"}', false, 'authenticated', 'authenticated')
        RETURNING id INTO pat_id;
        
        UPDATE public.patients SET date_of_birth = '1985-03-25', gender = 'Male', phone_number = '9224315780', blood_type = 'B+', medical_history = 'G6PD deficiency.' WHERE id = pat_id;
    END IF;

    -- Patient 8
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'patient.ananya@mediai.com') THEN
        INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, role, aud)
        VALUES (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'patient.ananya@mediai.com', '$2a$10$7Z8l7u.oT.6NEXV/ZpExEeqY1u83tPpH6.1N78zUu8k/LqgN3C8aO', now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Ananya Reddy","role":"patient"}', false, 'authenticated', 'authenticated')
        RETURNING id INTO pat_id;
        
        UPDATE public.patients SET date_of_birth = '1993-09-17', gender = 'Female', phone_number = '9881234509', blood_type = 'O+', medical_history = 'None.' WHERE id = pat_id;
    END IF;

    -- Patient 9
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'patient.kabir@mediai.com') THEN
        INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, role, aud)
        VALUES (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'patient.kabir@mediai.com', '$2a$10$7Z8l7u.oT.6NEXV/ZpExEeqY1u83tPpH6.1N78zUu8k/LqgN3C8aO', now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Kabir Kapoor","role":"patient"}', false, 'authenticated', 'authenticated')
        RETURNING id INTO pat_id;
        
        UPDATE public.patients SET date_of_birth = '2005-02-14', gender = 'Male', phone_number = '9776543120', blood_type = 'A+', medical_history = 'Dust allergy.' WHERE id = pat_id;
    END IF;

    -- Patient 10
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'patient.meera@mediai.com') THEN
        INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, role, aud)
        VALUES (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'patient.meera@mediai.com', '$2a$10$7Z8l7u.oT.6NEXV/ZpExEeqY1u83tPpH6.1N78zUu8k/LqgN3C8aO', now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Meera Nair","role":"patient"}', false, 'authenticated', 'authenticated')
        RETURNING id INTO pat_id;
        
        UPDATE public.patients SET date_of_birth = '1965-11-11', gender = 'Female', phone_number = '9112233445', blood_type = 'AB-', medical_history = 'Type 2 Diabetes. Managed with Metformin.' WHERE id = pat_id;
    END IF;


    -- 5. Seed Receptionists (receptionist@mediai.com)
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'receptionist@mediai.com') THEN
        INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, role, aud)
        VALUES (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'receptionist@mediai.com', '$2a$10$7Z8l7u.oT.6NEXV/ZpExEeqY1u83tPpH6.1N78zUu8k/LqgN3C8aO', now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Priya Sen","role":"receptionist"}', false, 'authenticated', 'authenticated');
    END IF;

    -- 6. Seed Admin (admin@mediai.com)
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@mediai.com') THEN
        INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, role, aud)
        VALUES (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'admin@mediai.com', '$2a$10$7Z8l7u.oT.6NEXV/ZpExEeqY1u83tPpH6.1N78zUu8k/LqgN3C8aO', now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Amit Sharma","role":"admin"}', false, 'authenticated', 'authenticated');
    END IF;

END $$;
"""

try:
    with engine.connect() as conn:
        conn.execute(text(sql_block))
        conn.commit()
        print("Database Seed executed successfully!")
        print("Seeded 10 Doctors, 10 Patients, and Staff credentials directly into your Supabase database.")
except Exception as e:
    print(f"Error seeding database: {e}")
