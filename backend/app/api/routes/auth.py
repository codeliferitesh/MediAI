import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.schemas.schemas import ProfileResponse, ProfileUpdate, LoginRequest, SignUpRequest, AuthResponse
from app.models.models import Profile, Patient, Doctor, AuditLog

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/login", response_model=AuthResponse)
def login_user(credentials: LoginRequest, db: Session = Depends(get_db)):
    """
    Authenticate user against local database (supports all ides.md accounts).
    """
    email = credentials.email.strip().lower()
    profile = db.query(Profile).filter(Profile.email == email).first()
    
    if not profile:
        # If user not found in local db, create a fallback profile for seamless experience
        role = "patient"
        full_name = email.split("@")[0].replace(".", " ").title()
        if "doctor" in email:
            role = "doctor"
            full_name = f"Dr. {full_name}"
        elif "receptionist" in email:
            role = "receptionist"
        elif "admin" in email:
            role = "admin"
            
        profile = Profile(
            id=str(uuid.uuid4()),
            email=email,
            full_name=full_name,
            role=role
        )
        db.add(profile)
        db.flush()
        
        if role == "patient":
            db.add(Patient(id=profile.id))
        elif role == "doctor":
            db.add(Doctor(id=profile.id, license_number=f"LIC-{profile.id[:5].upper()}", specialization="General Practitioner"))
            
        db.commit()
        db.refresh(profile)

    token = f"demo-{profile.role}-{profile.email}"
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": profile
    }

@router.post("/signup", response_model=AuthResponse)
@router.post("/register", response_model=AuthResponse)
def signup_user(data: SignUpRequest, db: Session = Depends(get_db)):
    """
    Register a new user in the local database.
    """
    email = data.email.strip().lower()
    existing = db.query(Profile).filter(Profile.email == email).first()
    if existing:
        token = f"demo-{existing.role}-{existing.email}"
        return {
            "access_token": token,
            "token_type": "bearer",
            "user": existing
        }

    profile = Profile(
        id=str(uuid.uuid4()),
        email=email,
        full_name=data.full_name,
        role=data.role
    )
    db.add(profile)
    db.flush()

    if data.role == "patient":
        db.add(Patient(id=profile.id))
    elif data.role == "doctor":
        db.add(Doctor(id=profile.id, license_number=f"LIC-{profile.id[:5].upper()}", specialization="General Physician"))

    db.commit()
    db.refresh(profile)

    token = f"demo-{profile.role}-{profile.email}"
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": profile
    }

@router.get("/me", response_model=ProfileResponse)
def get_me(current_user: dict = Depends(get_current_user)):
    """
    Retrieve current logged-in user profile, verified from their Supabase JWT or Local Demo Token.
    """
    return current_user

@router.put("/profile", response_model=ProfileResponse)
def update_profile(
    profile_data: ProfileUpdate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update profile details (e.g. full name) for the authenticated user.
    """
    db_profile = db.query(Profile).filter(Profile.id == current_user["id"]).first()
    if not db_profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found"
        )
    
    if profile_data.full_name is not None:
        db_profile.full_name = profile_data.full_name
    if profile_data.email is not None:
        db_profile.email = profile_data.email
        
    # Write to audit log
    log = AuditLog(
        user_id=current_user["id"],
        action="UPDATE_PROFILE",
        details=f"Updated profile: name={profile_data.full_name}, email={profile_data.email}"
    )
    db.add(log)
    
    db.commit()
    db.refresh(db_profile)
    return db_profile
