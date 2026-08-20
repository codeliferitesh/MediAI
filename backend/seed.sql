-- MediAI Database Seeding SQL Script - REVISED FOR DEMO CREDENTIALS
-- Copy and run this script inside your Supabase SQL Editor.

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
    -- Doctor 1 (Primary demo doctor)
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


    -- 4. Seed Patients (using the exact pre-filled patient@mediai.com email!)
    -- Patient 1 (Primary demo patient)
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


    -- 5. Seed Receptionists (using receptionist@mediai.com)
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'receptionist@mediai.com') THEN
        INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, role, aud)
        VALUES (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'receptionist@mediai.com', '$2a$10$7Z8l7u.oT.6NEXV/ZpExEeqY1u83tPpH6.1N78zUu8k/LqgN3C8aO', now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Priya Sen","role":"receptionist"}', false, 'authenticated', 'authenticated');
    END IF;

    -- 6. Seed Admin (using admin@mediai.com)
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@mediai.com') THEN
        INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, role, aud)
        VALUES (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'admin@mediai.com', '$2a$10$7Z8l7u.oT.6NEXV/ZpExEeqY1u83tPpH6.1N78zUu8k/LqgN3C8aO', now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Amit Sharma","role":"admin"}', false, 'authenticated', 'authenticated');
    END IF;

END $$;
