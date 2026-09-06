"""
push_to_supabase.py
═══════════════════
Run this ONCE to create all MediAI demo accounts in Supabase Auth.

Usage:
    cd backend
    python push_to_supabase.py

What it does:
  - Creates all doctors, patients, receptionist and admin accounts
    in Supabase Auth using the Admin API (service_role key).
  - Sets each user's metadata (full_name, role) so the backend can
    read it from the JWT when Supabase tokens are used.
  - If an account already exists it prints a skip message (no error).

Requirements:
  - pip install supabase python-dotenv (already in requirements.txt)
  - .env file must have SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
"""

import os
import sys
from dotenv import load_dotenv

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), ".env"))

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")

if not SUPABASE_URL or "placeholder" in SUPABASE_URL:
    print("X  SUPABASE_URL is not set in backend/.env  -- aborting.")
    sys.exit(1)

if not SERVICE_ROLE_KEY or "placeholder" in SERVICE_ROLE_KEY:
    print("X  SUPABASE_SERVICE_ROLE_KEY is not set in backend/.env  -- aborting.")
    sys.exit(1)

try:
    from supabase import create_client
except ImportError:
    print("X  supabase package not installed. Run: pip install supabase")
    sys.exit(1)

# Use service role key so we can create users via Admin API
client = create_client(SUPABASE_URL, SERVICE_ROLE_KEY)

PASSWORD = "password123"

ACCOUNTS = [
    # Doctors
    {"email": "doctor@mediai.com",        "full_name": "Dr. Rajesh Kumar",   "role": "doctor"},
    {"email": "doctor.priya@mediai.com",   "full_name": "Dr. Priya Sharma",   "role": "doctor"},
    {"email": "doctor.ananya@mediai.com",  "full_name": "Dr. Ananya Iyer",    "role": "doctor"},
    {"email": "doctor.rohan@mediai.com",   "full_name": "Dr. Rohan Mehta",    "role": "doctor"},
    {"email": "doctor.amit@mediai.com",    "full_name": "Dr. Amit Patel",     "role": "doctor"},
    {"email": "doctor.kavita@mediai.com",  "full_name": "Dr. Kavita Nair",    "role": "doctor"},
    {"email": "doctor.sunita@mediai.com",  "full_name": "Dr. Sunita Rao",     "role": "doctor"},
    {"email": "doctor.sanjay@mediai.com",  "full_name": "Dr. Sanjay Dutt",    "role": "doctor"},
    {"email": "doctor.vikram@mediai.com",  "full_name": "Dr. Vikram Singh",   "role": "doctor"},
    {"email": "doctor.divya@mediai.com",   "full_name": "Dr. Divya Joshi",    "role": "doctor"},
    # Staff
    {"email": "receptionist@mediai.com",   "full_name": "Priya Sen",          "role": "receptionist"},
    {"email": "admin@mediai.com",          "full_name": "Amit Sharma",        "role": "admin"},
    # Patients
    {"email": "patient@mediai.com",        "full_name": "Aarav Sharma",       "role": "patient"},
    {"email": "patient.priyan@mediai.com", "full_name": "Priyan Patel",       "role": "patient"},
    {"email": "patient.vivaan@mediai.com", "full_name": "Vivaan Shah",        "role": "patient"},
    {"email": "patient.aditya@mediai.com", "full_name": "Aditya Verma",       "role": "patient"},
    {"email": "patient.sai@mediai.com",    "full_name": "Sai Prasad",         "role": "patient"},
    {"email": "patient.diya@mediai.com",   "full_name": "Diya Sen",           "role": "patient"},
    {"email": "patient.ishan@mediai.com",  "full_name": "Ishan Gupta",        "role": "patient"},
    {"email": "patient.ananya@mediai.com", "full_name": "Ananya Reddy",       "role": "patient"},
    {"email": "patient.kabir@mediai.com",  "full_name": "Kabir Kapoor",       "role": "patient"},
    {"email": "patient.meera@mediai.com",  "full_name": "Meera Nair",         "role": "patient"},
]

print(f"\nPushing {len(ACCOUNTS)} accounts to Supabase Auth...")
print(f"Project: {SUPABASE_URL}\n")

success = 0
skipped = 0
failed = 0

for account in ACCOUNTS:
    email = account["email"]
    try:
        response = client.auth.admin.create_user({
            "email": email,
            "password": PASSWORD,
            "email_confirm": True,           # auto-confirm so no email needed
            "user_metadata": {
                "full_name": account["full_name"],
                "role": account["role"],
            },
        })
        print(f"  OK  Created: {email}  ({account['role']})")
        success += 1
    except Exception as e:
        err_msg = str(e).lower()
        if "already been registered" in err_msg or "already exists" in err_msg or "duplicate" in err_msg:
            print(f"  --  Skipped (already exists): {email}")
            skipped += 1
        else:
            print(f"  XX  Failed: {email}  -- {e}")
            failed += 1

print(f"\n{'='*50}")
print(f"  Created : {success}")
print(f"  Skipped : {skipped}")
print(f"  Failed  : {failed}")
print(f"{'='*50}")
print("\nDone! All demo accounts are now in Supabase Auth.")
print("Users can now log in with any demo email + password123\n")
