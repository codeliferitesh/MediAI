import json
import base64
import uuid
from fastapi import HTTPException, Security, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from supabase import create_client, Client
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.database import get_db
from app.models.models import Profile, Patient, Doctor

# Initialize Supabase Client gracefully
supabase: Client = None
try:
    if settings.SUPABASE_URL and "placeholder" not in settings.SUPABASE_URL:
        supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_ANON_KEY)
except Exception as e:
    print(f"Supabase client initialization warning: {e}")

security = HTTPBearer(auto_error=False)

def ensure_user_record(db: Session, email: str, full_name: str, role: str, target_id: str = None) -> Profile:
    """Helper to ensure a Profile and role-specific record exist in the database."""
    profile = db.query(Profile).filter((Profile.email == email) | (Profile.id == target_id if target_id else False)).first()
    if not profile:
        profile = Profile(
            id=target_id or str(uuid.uuid4()),
            email=email,
            full_name=full_name,
            role=role
        )
        db.add(profile)
        db.flush()

    # Ensure role-specific sub-table
    if profile.role == "patient":
        pat = db.query(Patient).filter(Patient.id == profile.id).first()
        if not pat:
            db.add(Patient(id=profile.id))
            db.flush()
    elif profile.role == "doctor":
        doc = db.query(Doctor).filter(Doctor.id == profile.id).first()
        if not doc:
            db.add(Doctor(
                id=profile.id,
                license_number=f"LIC-{profile.id[:5].upper()}",
                specialization="General Practitioner"
            ))
            db.flush()

    db.commit()
    db.refresh(profile)
    return profile

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Security(security),
    db: Session = Depends(get_db)
):
    if not credentials or not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authentication credentials"
        )

    token = credentials.credentials

    # 1. Check for local demo / offline token
    if token.startswith("demo-") or token.startswith("local-") or token.startswith("mock-"):
        try:
            # token format: demo-<role>-<email-or-id>
            parts = token.split("-", 2)
            role = parts[1] if len(parts) > 1 else "patient"
            identifier = parts[2] if len(parts) > 2 else "demo-user"
            
            # Lookup in database
            profile = db.query(Profile).filter((Profile.email == identifier) | (Profile.id == identifier)).first()
            if profile:
                # Ensure patient/doctor sub-table entry exists
                if profile.role == "patient":
                    if not db.query(Patient).filter(Patient.id == profile.id).first():
                        db.add(Patient(id=profile.id))
                        db.commit()
                elif profile.role == "doctor":
                    if not db.query(Doctor).filter(Doctor.id == profile.id).first():
                        db.add(Doctor(id=profile.id, license_number=f"LIC-{profile.id[:5].upper()}", specialization="General Practitioner"))
                        db.commit()

                return {
                    "id": profile.id,
                    "email": profile.email,
                    "full_name": profile.full_name,
                    "role": profile.role
                }
            
            # If not in DB, create record so relations never break
            email = identifier if "@" in identifier else f"{identifier}@mediai.com"
            full_name = identifier.split("@")[0].replace(".", " ").title()
            if role == "doctor":
                full_name = f"Dr. {full_name}"
            
            created_profile = ensure_user_record(db, email, full_name, role)
            return {
                "id": created_profile.id,
                "email": created_profile.email,
                "full_name": created_profile.full_name,
                "role": created_profile.role
            }
        except Exception as e:
            print(f"[Auth] Demo token error: {e}")

    # 2. Check if token is a JSON base64 encoded string
    try:
        decoded_bytes = base64.b64decode(token)
        user_data = json.loads(decoded_bytes.decode('utf-8'))
        if isinstance(user_data, dict) and "email" in user_data:
            email = user_data["email"]
            role = user_data.get("role", "patient")
            full_name = user_data.get("full_name", email.split("@")[0].title())
            target_id = user_data.get("id")
            
            profile = ensure_user_record(db, email, full_name, role, target_id)
            return {
                "id": profile.id,
                "email": profile.email,
                "full_name": profile.full_name,
                "role": profile.role
            }
    except Exception:
        pass

    # 3. Validate JWT token with Supabase Auth if available
    if supabase:
        try:
            res = supabase.auth.get_user(token)
            if res and res.user:
                user_auth = res.user
                meta = user_auth.user_metadata or {}
                email = user_auth.email
                role = meta.get("role", "patient")
                full_name = meta.get("full_name", email.split("@")[0].title())
                
                profile = ensure_user_record(db, email, full_name, role, user_auth.id)
                return {
                    "id": profile.id,
                    "email": profile.email,
                    "full_name": profile.full_name,
                    "role": profile.role
                }
        except Exception as e:
            print(f"[Auth] Supabase token verification failed: {e}")

    # 4. Fallback if user profile exists in local DB with token as id/email
    profile = db.query(Profile).filter((Profile.id == token) | (Profile.email == token)).first()
    if profile:
        return {
            "id": profile.id,
            "email": profile.email,
            "full_name": profile.full_name,
            "role": profile.role
        }

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid credentials or session expired"
    )

class RoleChecker:
    def __init__(self, allowed_roles: list[str]):
        self.allowed_roles = allowed_roles

    def __call__(self, current_user: dict = Depends(get_current_user)):
        if current_user["role"] not in self.allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Operation not permitted for this user role"
            )
        return current_user
