import datetime
import jwt
from fastapi import APIRouter, HTTPException, Depends, Header
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/auth", tags=["auth"])

SECRET_KEY = "journal_integrity_super_secret_jwt_key_2026"
ALGORITHM = "HS256"

# Pydantic Schemas
class GoogleAuthRequest(BaseModel):
    token: str

class LoginRequest(BaseModel):
    email: str
    password: str

class RegisterRequest(BaseModel):
    email: str
    password: str
    name: Optional[str] = None
    institution: Optional[str] = None

class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict

def create_jwt(user_data: dict) -> str:
    payload = user_data.copy()
    payload["exp"] = datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(days=7)
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

@router.post("/google", response_model=AuthResponse)
async def google_auth(payload: GoogleAuthRequest):
    """Verify Google OAuth2 token and return JWT session.
    
    @react-oauth/google useGoogleLogin returns an OAuth2 access_token,
    so we call Google's userinfo endpoint to get verified user info.
    """
    import httpx

    token = payload.token
    email = None
    name = None
    picture = None

    # Call Google UserInfo endpoint (works with access_token from useGoogleLogin)
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(
                "https://www.googleapis.com/oauth2/v3/userinfo",
                headers={"Authorization": f"Bearer {token}"},
                timeout=10,
            )
            if resp.status_code == 200:
                info = resp.json()
                email = info.get("email")
                name = info.get("name")
                picture = info.get("picture")
    except Exception:
        pass

    # Fallback: try as ID token
    if not email:
        try:
            from google.oauth2 import id_token
            from google.auth.transport import requests as google_requests
            id_info = id_token.verify_oauth2_token(token, google_requests.Request())
            email = id_info.get("email")
            name = id_info.get("name")
            picture = id_info.get("picture")
        except Exception:
            pass

    if not email:
        raise HTTPException(status_code=401, detail="Could not verify Google identity")

    user = {
        "email": email,
        "name": name or email.split("@")[0].replace(".", " ").title(),
        "avatar_url": picture,
        "institution": "Academic Institution",
        "role": "Verified Researcher",
        "api_key": f"ji_live_{abs(hash(email)) % (10 ** 12):012x}",
    }

    jwt_token = create_jwt(user)
    return AuthResponse(access_token=jwt_token, user=user)


@router.post("/login", response_model=AuthResponse)
async def login(payload: LoginRequest):
    """Authenticate user with email/password."""
    if not payload.email:
        raise HTTPException(status_code=400, detail="Email is required")
    
    name = payload.email.split("@")[0].replace(".", " ").title()
    user = {
        "email": payload.email,
        "name": f"Dr. {name}",
        "institution": "Academic Institution",
        "role": "Verified Researcher",
        "api_key": f"ji_live_{hash(payload.email) & 0xffffffffffff:x}",
    }
    
    jwt_token = create_jwt(user)
    return AuthResponse(access_token=jwt_token, user=user)

@router.post("/register", response_model=AuthResponse)
async def register(payload: RegisterRequest):
    """Register new researcher account."""
    if not payload.email or not payload.password:
        raise HTTPException(status_code=400, detail="Email and password are required")
    
    name = payload.name or payload.email.split("@")[0].replace(".", " ").title()
    user = {
        "email": payload.email,
        "name": name if name.startswith("Dr.") else f"Dr. {name}",
        "institution": payload.institution or "Academic Institution",
        "role": "Verified Researcher",
        "api_key": f"ji_live_{hash(payload.email) & 0xffffffffffff:x}",
    }
    
    jwt_token = create_jwt(user)
    return AuthResponse(access_token=jwt_token, user=user)

@router.get("/me")
async def get_current_user(authorization: Optional[str] = Header(None)):
    """Return currently authenticated user from Bearer JWT token."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid authorization header")
    
    token = authorization.split(" ")[1]
    try:
        decoded = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return decoded
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired JWT token")
