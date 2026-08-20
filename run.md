# 🚀 MediAI — How to Run the Project

A complete, human-friendly guide to start both the **Backend API** and **Frontend Web Application** on your machine.

---

## 📋 Prerequisites

Make sure you have the following installed on your computer:
- **Node.js** (v18 or higher) — [Download Node.js](https://nodejs.org/)
- **Python** (v3.10 to v3.12) — [Download Python](https://www.python.org/)

---

## 🏃 Quick Start (2-Step Launch)

Open **two separate terminal / command prompt windows**:
- **Terminal 1**: To run the Python FastAPI Backend.
- **Terminal 2**: To run the React Vite Frontend.

---

### 🔹 Terminal 1: Start Backend Server

Navigate to the project root directory, then enter the `backend` folder:

#### For Windows (PowerShell / Command Prompt):
```powershell
# 1. Move into backend folder
cd backend

# 2. Create virtual environment (if doing first time)
python -m venv venv

# 3. Activate the virtual environment
.\venv\Scripts\activate

# 4. Install dependencies (if doing first time)
pip install -r requirements.txt

# 5. Start the FastAPI backend server
python -m uvicorn app.main:app --reload --port 8000
```

#### For macOS / Linux:
```bash
# 1. Move into backend folder
cd backend

# 2. Create virtual environment (if doing first time)
python3 -m venv venv

# 3. Activate virtual environment
source venv/bin/activate

# 4. Install dependencies (if doing first time)
pip install -r requirements.txt

# 5. Start the server
python -m uvicorn app.main:app --reload --port 8000
```

> **Backend Status Check**: Open [http://localhost:8000/](http://localhost:8000/) in your browser. You should see `{"status":"ok","app":"MediAI CDSS Backend"}`.  
> **Interactive Swagger API Docs**: Accessible at [http://localhost:8000/docs](http://localhost:8000/docs).

---

### 🔹 Terminal 2: Start Frontend Application

Open a second terminal window in the project root directory:

```bash
# 1. Move into frontend folder
cd frontend

# 2. Install npm dependencies (if doing first time)
npm install

# 3. Start the Vite development server
npm run dev
```

> **Frontend Access**: Open [http://localhost:5173/](http://localhost:5173/) in your web browser.

---

## 🔑 Ready-to-Use Test Accounts

The system comes pre-seeded with full accounts across all hospital roles. You can sign in immediately:

| Role | Portal / Email | Password | Access & Features |
| :--- | :--- | :--- | :--- |
| **Doctor** | `doctor@mediai.com` | `password123` | Patient medical charts, emergency triage queue, CDSS drug interaction prescription writer. |
| **Receptionist** | `receptionist@mediai.com` | `password123` | Outpatient onboarding, vital intake registration, master appointment schedulers. |
| **Administrator** | `admin@mediai.com` | `password123` | Hospital department analytics, system logs, staff management. |
| **Patient** | `patient@mediai.com` | `password123` | Symptom checker, lab report summaries, appointment booking, Rx viewer. |

*(In Local Demo Mode, any password entered for test accounts will be accepted).*

---

## 🛠️ Common Troubleshooting

### 1. PowerShell Script Execution Policy Error (Windows)
If activating `.\venv\Scripts\activate` shows a script execution permission error:
```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\venv\Scripts\activate
```

### 2. Port Already in Use
- If port `8000` is busy: Run backend on a different port:
  ```powershell
  python -m uvicorn app.main:app --reload --port 8080
  ```
  *(Remember to update `VITE_API_URL` in `frontend/.env` if you change the backend port).*
- If port `5173` is busy: Vite will automatically use the next available port (e.g. `5174`).

### 3. Missing Dependencies
If you encounter missing Python packages:
```powershell
pip install -r requirements.txt
```

---

## 🛑 Stopping the Servers

To stop running the servers at any time, press `Ctrl + C` in both terminal windows.
