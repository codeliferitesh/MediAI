# MediAI — Hospital Management & Clinical Decision Support System

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/Frontend-React%20%2B%20Vite%20%2B%20TypeScript-61DAFB.svg?style=flat-square&logo=react)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/Styling-Tailwind%20CSS-38B2AC.svg?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Database-Supabase%20PostgreSQL-3ECF8E.svg?style=flat-square&logo=supabase)](https://supabase.com/)
[![Google Gemini](https://img.shields.io/badge/AI-Google%20Gemini-4285F4.svg?style=flat-square&logo=google)](https://ai.google.dev/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)

---

## What is MediAI?

MediAI is a full-stack hospital management platform with an integrated Clinical Decision Support System (CDSS). It was built to address a few real, recurring problems in hospital workflows — manual triage that ignores clinical urgency, prescription errors from unchecked drug interactions, and patients walking out of clinics with lab reports they can't understand.

The system is split into four role-based experiences: **Doctor**, **Receptionist**, **Patient**, and **Admin** — each with their own dashboard and permissions. Under the hood, a Python/FastAPI backend handles the clinical logic, with Google Gemini powering the AI features and Supabase managing the database and file storage.

This isn't a demo project. It's a working system — deployed on Vercel (frontend) and Render (backend) — with real auth, real data relationships, and real clinical rules.

---

## Core Features

### Emergency Triage Engine

When a patient arrives, the receptionist logs their vitals — heart rate, blood pressure, SpO2, respiratory rate, temperature, and pain score. MediAI runs these through a deterministic scoring algorithm that produces a risk score from 0 to 100 and assigns a priority class: **Critical**, **High**, **Medium**, or **Low**.

The doctor's queue updates in real time based on this score. A patient with an SpO2 of 88% and a heart rate of 140 will appear at the top of the queue — not buried behind someone who arrived earlier with a mild headache. That's the whole point.

### Drug Interaction Safety Guard

As a doctor types out a prescription, every drug combination is checked against a built-in clinical interaction database. If a dangerous pair is detected — say, Warfarin with Aspirin — a warning appears immediately with a clear explanation of the risk (severe bleeding). The prescription cannot be submitted until the doctor either removes the conflicting drug or explicitly acknowledges the warning.

This logic is fully deterministic. We intentionally did not use an LLM for this part because you cannot have a generative model hallucinating drug safety rules.

### Lab Report OCR + AI Summaries

Staff or patients can upload a photo or PDF scan of a lab report. Tesseract OCR extracts the text, and Google Gemini then processes it in two ways depending on who's viewing:

- **For clinicians** — abnormal values are flagged, parameters are indexed, and the report is formatted for quick review.
- **For patients** — the same data is rewritten in plain language. Instead of seeing `ALT: 89 U/L`, they see an explanation of what that means and whether they should discuss it with their doctor.

### Patient Symptom Checker

Patients can describe what they're experiencing in their own words. The AI reads the input, suggests which department they should visit (Cardiology, Orthopedics, General Medicine, etc.), and tells them whether it sounds like something that needs immediate attention or can wait for a scheduled appointment.

---

## Who Uses What

| Role | Access |
|:--|:--|
| **Doctor** | Triage queue, patient histories, prescription writer with drug interaction checks, lab report viewer |
| **Receptionist** | Patient registration, vitals entry and auto-triage, appointment management |
| **Patient** | Symptom checker, appointment booking, prescription downloads, lab report uploads |
| **Admin** | Analytics dashboard, department stats, doctor schedule overview, hospital-wide KPIs |

Access control is enforced at both the API level (JWT + role checks) and the database level (Supabase Row Level Security policies).

---

## Tech Stack

```
[ React 18 + Vite + TypeScript + Tailwind CSS v4 ]
                      |
              REST API + JWT Auth
                      |
       [ FastAPI (Python 3.12) + Uvicorn ]
          |               |              |
   [ Supabase ]    [ OCR + CDSS ]   [ Gemini AI ]
   PostgreSQL +    Tesseract OCR    Google Gemini
   RLS Policies    Pillow / PIL     1.5 Flash
   File Storage    Clinical Algos   Report & Triage
```

**Frontend**
- React 18, Vite, TypeScript
- Tailwind CSS v4
- React Router v6, TanStack Query
- Recharts, Lucide Icons

**Backend**
- FastAPI, Python 3.12, Uvicorn
- SQLAlchemy v2, Pydantic v2
- Tesseract OCR, Pillow

**Infrastructure**
- Supabase — PostgreSQL with RLS, Auth, and Storage Buckets
- Google Gemini API — AI summaries and symptom analysis
- Vercel — Frontend hosting
- Render — Backend hosting

**Local fallback**: If no environment keys are set, the backend automatically falls back to a local SQLite database (`mediai.db`) with mock AI responses so you can run the whole thing offline with zero configuration.

---

## Project Structure

```
MediAI/
├── frontend/
│   ├── src/
│   │   ├── components/layout/    # Sidebar, header, app shell
│   │   ├── hooks/                # Auth context, session management
│   │   ├── pages/
│   │   │   ├── admin/            # Analytics and hospital operations
│   │   │   ├── auth/             # Login, signup, landing page
│   │   │   ├── doctor/           # Triage queue, prescriptions, patient charts
│   │   │   ├── patient/          # Appointments, reports, symptom checker
│   │   │   └── receptionist/     # Patient intake, vitals, queue management
│   │   ├── services/             # Axios API client, Supabase client
│   │   └── routes/               # Role-based protected routing
│
├── backend/
│   ├── app/
│   │   ├── api/routes/           # REST endpoints — auth, triage, prescriptions, reports, etc.
│   │   ├── core/                 # Config, database session, JWT utilities
│   │   ├── models/               # SQLAlchemy ORM models
│   │   ├── schemas/              # Pydantic request/response schemas
│   │   └── services/             # CDSS logic — triage scoring, drug checks, OCR, AI
│   ├── requirements.txt
│   ├── schema.sql                # Full PostgreSQL schema for Supabase
│   └── seed_db.py                # Seeds the database with realistic demo data
│
├── render.yaml                   # Render deployment config (backend)
├── vercel.json                   # Vercel deployment config (frontend)
└── README.md
```

---

## Running Locally

### Option A — Zero Config (SQLite Fallback)

The easiest way to run MediAI. No Supabase account, no API keys required.

**1. Start the backend**

```bash
cd backend

# Create a virtual environment
python -m venv venv

# Activate it
# Windows:
.\venv\Scripts\activate
# macOS / Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the server
python -m uvicorn app.main:app --reload --port 8000
```

Visit `http://localhost:8000/` to confirm it's running.

**2. Start the frontend**

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173/` in your browser.

**3. Demo accounts**

Use any of these emails with any password in local mode:

| Role | Email |
|:--|:--|
| Doctor | `doctor@mediai.com` |
| Receptionist | `receptionist@mediai.com` |
| Patient | `patient@mediai.com` |
| Admin | `admin@mediai.com` |

Or sign up with a new account — it'll assign the Patient role by default.

---

### Option B — Full Cloud Setup (Supabase + Gemini)

**1. Set up Supabase**

- Create a free project at [supabase.com](https://supabase.com/)
- Go to the SQL Editor and run the entire contents of `backend/schema.sql`
- Under Storage, create a private bucket called `medical-reports`

**2. Configure environment variables**

In `backend/`, copy `.env.example` to `.env` and fill in:
```
SUPABASE_URL=...
SUPABASE_SERVICE_KEY=...
DATABASE_URL=...
GEMINI_API_KEY=...
SECRET_KEY=...
```

In `frontend/`, copy `.env.example` to `.env` and fill in:
```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
VITE_API_URL=...
```

**3. Seed the database (optional)**

```bash
cd backend
python seed_db.py
```

This populates the database with sample doctors, patients, appointments, and prescriptions for testing.

---

## Security Notes

**Row Level Security** — All database access goes through Supabase RLS policies. Doctors can only query records for patients assigned to them. Patients cannot see other patients' data. These policies are enforced at the database level, not just in application code.

**Deterministic clinical logic** — Drug interaction checks and triage scoring are written as hard-coded algorithms. We made a deliberate choice not to let an LLM decide whether a drug combination is dangerous. The rules are fixed, auditable, and cannot hallucinate.

**Secrets management** — No credentials are committed to the repository. All sensitive values live in `.env` files that are listed in `.gitignore`.

---

## API Overview

The backend exposes a RESTful API under `/api`. Key route groups:

| Prefix | Description |
|:--|:--|
| `/api/auth` | Login, signup, token refresh |
| `/api/patients` | Patient CRUD, medical history |
| `/api/appointments` | Booking, status updates |
| `/api/triage` | Vital signs intake, scoring, queue |
| `/api/prescriptions` | Create, view, download prescriptions |
| `/api/reports` | OCR upload, AI summary generation |
| `/api/ai` | Symptom checker, Gemini integration |
| `/api/analytics` | Admin stats, department metrics |
| `/api/departments` | Department listing and management |

Interactive API docs are available at `http://localhost:8000/docs` when running locally.

---

## Contributing

If you want to contribute, fix a bug, or suggest a feature — pull requests are open.

```bash
# Fork and clone the repo
git checkout -b feature/your-feature-name

# Make your changes, then
git commit -m "describe what you changed"
git push origin feature/your-feature-name
```

Open a pull request with a short description of what the change does and why.

---

## License

MIT — use it, build on it, ship it. See `LICENSE` for the full text.

---

<p align="center">Built to make hospitals a little less chaotic and patients a little less confused.</p>
