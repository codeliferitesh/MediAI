# 🏥 MediAI — Intelligent Hospital Management & Clinical Decision Support System

> **A modern, AI-powered healthcare ecosystem built to save clinical hours, eliminate fatal medication errors, and make hospital visits seamless for both patients and healthcare providers.**

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/Frontend-React%20%2B%20Vite%20%2B%20TypeScript-61DAFB.svg?style=flat-square&logo=react)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/Styling-Tailwind%20CSS-38B2AC.svg?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Cloud%20Database-Supabase%20PostgreSQL-3ECF8E.svg?style=flat-square&logo=supabase)](https://supabase.com/)
[![Google Gemini](https://img.shields.io/badge/AI%20Engine-Google%20Gemini-4285F4.svg?style=flat-square&logo=google)](https://ai.google.dev/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)

---

## 📖 The Story Behind MediAI

Modern hospitals are fast-paced, high-pressure environments. Doctors juggle dozens of patients a day while reviewing complex lab sheets and typing out prescriptions. Receptionists struggle to prioritize crowded waiting rooms based on actual medical urgency. Patients often leave clinics holding cryptic laboratory reports they cannot interpret, feeling anxious and confused.

**MediAI was built to bridge this gap.**

MediAI is not just another hospital management database. It is a comprehensive **Clinical Decision Support System (CDSS)** designed to act as a second set of eyes for clinicians, a dynamic triage assistant for front-desk staff, and an empathetic medical companion for patients.

---

## ✨ Core Pillars & Superpowers

### 🚨 1. Real-Time Emergency Triage Scoring (CDSS Protocol)
When an emergency patient walks in, seconds count. Instead of a manual first-come, first-served queue:
* Front-desk or nursing staff log vital signs (Heart Rate, Blood Pressure, SpO2 Oxygen Saturation, Respiratory Rate, Core Temperature, and Pain Level).
* The **MediAI Triage Engine** dynamically calculates a composite clinical risk score ($0–100$) and categorizes patients into **Critical**, **High**, **Medium**, or **Low** priority classes.
* Patients suffering from severe hypoxia, hypertensive crises, or trauma are automatically highlighted and promoted to the top of the doctor's live emergency queue.

### 💊 2. Deterministic Drug Interaction Safety Lock
Adverse Drug Reactions (ADRs) are among the leading causes of preventable clinical complications. 
* As doctors prescribe medications, MediAI cross-references each drug pair against a built-in deterministic clinical interaction registry in real-time.
* If a hazardous or lethal combination is detected (such as *Aspirin + Warfarin* or *Ibuprofen + Methotrexate*):
  * A clear visual warning highlights the exact clinical hazard (e.g., severe bleeding risks or acute methotrexate toxicity).
  * The digital prescription sign-off button is locked until the doctor adjusts the medication or acknowledges the conflict.

### 📄 3. Intelligent Lab Report OCR & Plain-Language AI Summaries
Complex medical reports often take valuable time to manually transcribe and can cause panic for patients:
* Staff or patients can upload photos or scans of lab reports (Blood tests, Lipid panels, Liver function, Urinalysis, etc.).
* MediAI extracts text using optical character recognition (OCR) and feeds it into **Google Gemini AI**.
* **For Clinicians**: It indexes key medical parameters, highlights abnormal values, and formats them for immediate review.
* **For Patients**: It translates medical jargon into empathetic, plain-language summaries explaining what the numbers mean and suggesting smart questions to ask their doctor.

### 🤖 4. Patient AI Symptom Checker & Health Guide
* Patients can describe their symptoms in natural language.
* The AI analyzes the reported symptoms, recommends appropriate hospital departments (Cardiology, Orthopedics, Neurology, General Medicine, etc.), and advises whether the condition requires routine outpatient consultation or immediate emergency care.

---

## 👥 Role-Based Experience

MediAI features 4 tailored dashboards with strictly enforced role-based access control (RBAC):

```
                                  ┌────────────────────────┐
                                  │      MediAI Core       │
                                  └───────────┬────────────┘
                                              │
         ┌──────────────────┬─────────────────┼─────────────────┬──────────────────┐
         ▼                  ▼                 ▼                 ▼                  ▼
  ┌──────────────┐   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   ┌──────────────┐
  │   Patients   │   │   Doctors    │  │ Receptionist │  │    Admin     │   │     CDSS     │
  ├──────────────┤   ├──────────────┤  ├──────────────┤  ├──────────────┤   ├──────────────┤
  │• Symptoms AI │   │• Smart Queue │  │• Vital Intake│  │• Analytics   │   │• Triage Risk │
  │• Book Visits │   │• CDSS Rx     │  │• Appointments│  │• Departments│   │• Drug Alerts │
  │• OCR Reports │   │• Interactions│  │• Queue Admin │  │• Doctor Stats│   │• Gemini AI   │
  │• Prescriptions│  │• Patient Bio │  │• Patient Reg │  │• Hospital KPI│   │• OCR Engine  │
  └──────────────┘   └──────────────┘  └──────────────┘  └──────────────┘   └──────────────┘
```

| User Role | What they can do in MediAI |
| :--- | :--- |
| **👩‍⚕️ Doctor** | Review real-time prioritized triage queues, access full patient medical histories, write prescriptions with live drug interaction safety guards, and analyze lab diagnostics. |
| **🧑‍💼 Receptionist** | Fast patient registration, rapid vital signs recording with immediate auto-triage calculation, appointment scheduling, and outpatient flow management. |
| **🧑‍🦱 Patient** | Interactive AI symptom checker, book appointments with specialized doctors, view & download official digital prescriptions, and upload lab reports for AI translation. |
| **🛡️ Administrator** | Hospital-wide operational metrics, department load monitoring, doctor scheduling overview, and system analytics. |

---

## 🛠️ Architecture & Tech Stack

```
[ Frontend: React 18 + Vite + TypeScript + Tailwind CSS ]
                       │  ▲
              REST API │  │ JSON (JWT Auth)
                       ▼  │
      [ Backend: FastAPI (Python 3.12) + Uvicorn ]
          │                   │                 │
     (PostgreSQL)        (OCR & CDSS)      (Gemini AI)
          ▼                   ▼                 ▼
   [ Supabase Cloud ]   [ Tesseract ]   [ Google Gemini 1.5 ]
   - PostgreSQL RLS     - Image OCR     - Report Insights
   - Storage Buckets    - Data Parser   - Symptom Triage
```

* **Frontend**: React 18, Vite, TypeScript, Tailwind CSS v4, Lucide Icons, React Router v6, TanStack Query, Recharts.
* **Backend**: FastAPI, Python 3.12, Pydantic v2, SQLAlchemy v2, Uvicorn.
* **Database & Cloud**: Supabase (PostgreSQL with Row Level Security, Auth Services, Secure Storage Buckets).
* **Intelligence Layer**: Google Gemini API, Tesseract OCR / Pillow Image Processing, Deterministic Clinical Decision Algorithms.
* **Zero-Config Offline Support**: Built-in SQLite database fallback (`mediai.db`) for instant local demos without needing cloud keys.

---

## 📁 Repository Structure

```text
MediAI/
├── frontend/                     # Modern React client application
│   ├── src/
│   │   ├── components/layout/    # Responsive sidebar, header, and unified shell
│   │   ├── hooks/                # Authentication context & persistent session
│   │   ├── pages/
│   │   │   ├── admin/            # Hospital operations & analytics
│   │   │   ├── auth/             # Landing page, login & sign up workflows
│   │   │   ├── doctor/           # Clinical charts, triage queues & prescription writer
│   │   │   ├── patient/          # Appointments, reports OCR, & symptom checker
│   │   │   └── receptionist/     # Patient intake, vitals entry & appointment booking
│   │   ├── services/             # Axios API client & Supabase integrations
│   │   └── routes/               # Role-protected routing engine
├── backend/                      # High-performance FastAPI server
│   ├── app/
│   │   ├── api/routes/           # Modular REST API endpoints (Auth, Triage, Rx, etc.)
│   │   ├── core/                 # Config loader, database session, & JWT security
│   │   ├── models/               # Relational database models (SQLAlchemy)
│   │   ├── schemas/              # Pydantic validation schemas
│   │   └── services/             # CDSS engines: AI, OCR, Drug Interaction, Triage
│   ├── requirements.txt          # Python dependencies
│   ├── schema.sql                # Production PostgreSQL schema with Supabase triggers
│   └── seed_db.py                # Database population script with realistic demo data
├── README.md                     # Project documentation
└── .gitignore                    # Secrets and build artifact exclusions
```

---

## 🚀 Quick Start Guide

### Option 1: Local Demo Mode (Fastest — 0 Setup)
MediAI includes an automatic local fallback. If no cloud keys are configured, it runs on an embedded SQLite engine with mock AI/OCR fallbacks.

#### 1. Start the Backend
```bash
# Navigate to the backend
cd backend

# Create and activate a virtual environment
python -m venv venv

# On Windows:
.\venv\Scripts\activate
# On macOS / Linux:
# source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the development server
python -m uvicorn app.main:app --reload --port 8000
```
*Health Check: Open `http://localhost:8000/` in your browser.*

#### 2. Start the Frontend
```bash
# In a new terminal, navigate to the frontend
cd frontend

# Install Node dependencies
npm install

# Start the Vite development server
npm run dev
```
*Open `http://localhost:5173/` in your browser.*

#### 3. Instant Demo Accounts
In local fallback mode, you can log in with any password using these email prefixes:
* **Doctor**: `doctor@mediai.com`
* **Receptionist**: `receptionist@mediai.com`
* **Patient**: `patient@mediai.com`
* **Admin**: `admin@mediai.com`
*(Or click **Sign Up** to create a custom profile!)*

---

### Option 2: Full Cloud Setup (Supabase & Gemini AI)

1. **Supabase Setup**:
   * Create a free project at [Supabase](https://supabase.com/).
   * Open the **SQL Editor** in your Supabase dashboard, paste the contents of [`backend/schema.sql`](file:///c:/Users/VERMA'S/Desktop/Medical%20Project/backend/schema.sql), and click **Run**.
   * Under **Storage**, create a private bucket named `medical-reports`.

2. **Configure Environment Files**:
   * In `backend/`: Copy `.env.example` to `.env` and fill in your Supabase URL, Service Key, Postgres connection string, and Google Gemini API Key.
   * In `frontend/`: Copy `.env.example` to `.env` and fill in your `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.

3. **Seed Database** *(Optional)*:
   ```bash
   cd backend
   python seed_db.py
   ```

---

## 🔒 Security & Privacy Practices

* **Row Level Security (RLS)**: Enforced database-level authorization policies ensure doctors only access assigned patient records and patients cannot view other patients' data.
* **Deterministic Clinical Logic**: Critical medical rules (such as lethal drug interactions and triage thresholds) are hardcoded with deterministic safety algorithms rather than purely generative models to prevent AI hallucinations in high-stakes scenarios.
* **Zero Credential Leaks**: All keys, database passwords, and environment credentials are separated into `.env` files and excluded from version control.

---

## 🤝 Contributing & Feedback

Contributions, feature suggestions, and clinical feedback are always welcome!
1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License
Distributed under the MIT License. See `LICENSE` for more information.

---

<p align="center">
  Developed with ❤️ to make healthcare safer, smarter, and more accessible.
</p>
