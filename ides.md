# MediAI — System Login Credentials & Department Directory (`ides.md`)

This document lists all sign-in emails, passwords, departments, and roles configured for the **MediAI Hospital Management & Clinical Decision Support System**.

---

## 🔑 Master Password Note

- **Default Password for All Seeded Accounts**: `password123`
- **Local Demo Mode**: If running in offline/demo fallback mode without Supabase connection, any password string will be accepted.

---

## 🏥 Department-Wise Doctor Credentials

### 1. 🫀 Cardiology Department
*Department Focus: Cardiovascular care, heart conditions, electrophysiology, and hypertension management.*

| Doctor Name | Specialization | License # | Email Address | Password | Portal Role |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Dr. Rajesh Kumar** *(Lead)* | Chief Cardiologist | `LIC-10001` | `doctor@mediai.com` | `password123` | Doctor |
| **Dr. Priya Sharma** | Electrophysiologist | `LIC-10006` | `doctor.priya@mediai.com` | `password123` | Doctor |

---

### 2. 👶 Pediatrics Department
*Department Focus: Infant, child, and adolescent healthcare, neonatology, and vaccinations.*

| Doctor Name | Specialization | License # | Email Address | Password | Portal Role |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Dr. Ananya Iyer** *(Lead)* | Pediatric Specialist | `LIC-10002` | `doctor.ananya@mediai.com` | `password123` | Doctor |
| **Dr. Rohan Mehta** | Neonatal Specialist | `LIC-10007` | `doctor.rohan@mediai.com` | `password123` | Doctor |

---

### 3. 🩺 General Medicine Department
*Department Focus: Comprehensive adult primary healthcare, internal medicine, and chronic disease triage.*

| Doctor Name | Specialization | License # | Email Address | Password | Portal Role |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Dr. Amit Patel** *(Lead)* | Family Physician | `LIC-10003` | `doctor.amit@mediai.com` | `password123` | Doctor |
| **Dr. Kavita Nair** | Internal Medicine Specialist | `LIC-10008` | `doctor.kavita@mediai.com` | `password123` | Doctor |

---

### 4. 🧠 Neurology Department
*Department Focus: Brain, spinal cord, nervous system disorders, and neurosurgery.*

| Doctor Name | Specialization | License # | Email Address | Password | Portal Role |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Dr. Sunita Rao** *(Lead)* | Neurologist | `LIC-10004` | `doctor.sunita@mediai.com` | `password123` | Doctor |
| **Dr. Sanjay Dutt** | Neurosurgeon | `LIC-10009` | `doctor.sanjay@mediai.com` | `password123` | Doctor |

---

### 5. 🦴 Orthopedics Department
*Department Focus: Bones, joint replacements, musculoskeletal trauma, and sports medicine.*

| Doctor Name | Specialization | License # | Email Address | Password | Portal Role |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Dr. Vikram Singh** *(Lead)* | Orthopedic Surgeon | `LIC-10005` | `doctor.vikram@mediai.com` | `password123` | Doctor |
| **Dr. Divya Joshi** | Sports Medicine Specialist | `LIC-10010` | `doctor.divya@mediai.com` | `password123` | Doctor |

---

## 🏢 Reception & Administrative Staff

| Name | Role / Desk | Email Address | Password | Access Level |
| :--- | :--- | :--- | :--- | :--- |
| **Priya Sen** | Chief Receptionist | `receptionist@mediai.com` | `password123` | Patient Intake, Queue & Vitals |
| **Amit Sharma** | Hospital Administrator | `admin@mediai.com` | `password123` | Full System Administration |

---

## 👥 Sample Patient Accounts

| Patient Name | Age / Gender | Blood Group | Email Address | Password | Known Condition / Notes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Aarav Sharma** | 31 / Male | A+ | `patient@mediai.com` | `password123` | Seasonal pollen allergy |
| **Priyan Patel** | 38 / Male | O+ | `patient.priyan@mediai.com` | `password123` | Mild asthma managed with inhaler |
| **Vivaan Shah** | 24 / Male | B- | `patient.vivaan@mediai.com` | `password123` | Penicillin allergy |
| **Aditya Verma** | 48 / Male | AB+ | `patient.aditya@mediai.com` | `password123` | Hypertension |
| **Sai Prasad** | 35 / Male | O- | `patient.sai@mediai.com` | `password123` | Healthy baseline |
| **Diya Sen** | 27 / Female | A- | `patient.diya@mediai.com` | `password123` | Lactose intolerance |
| **Ishan Gupta** | 41 / Male | B+ | `patient.ishan@mediai.com` | `password123` | G6PD deficiency |
| **Ananya Reddy** | 33 / Female | O+ | `patient.ananya@mediai.com` | `password123` | Regular checkup |
| **Kabir Kapoor** | 21 / Male | A+ | `patient.kabir@mediai.com` | `password123` | Dust allergy |
| **Meera Nair** | 61 / Female | AB- | `patient.meera@mediai.com` | `password123` | Type 2 Diabetes (Metformin) |

---

## 🚀 How to Sign In

1. Navigate to the login portal (e.g., `http://localhost:5173/login`).
2. Select your desired role portal:
   - **Doctor Portal**: `/login/doctor`
   - **Receptionist Portal**: `/login/receptionist`
   - **Admin Portal**: `/login/admin`
   - **Patient Portal**: `/login/patient`
3. Enter any of the email addresses above with the password `password123`.
