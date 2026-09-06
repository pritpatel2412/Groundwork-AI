import os
from typing import Optional
from fastapi import HTTPException, Security, Query
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "") or os.getenv("SUPABASE_ANON_KEY", "")

_supabase_client = None
if SUPABASE_URL and SUPABASE_KEY:
    try:
        from supabase import create_client
        _supabase_client = create_client(SUPABASE_URL, SUPABASE_KEY)
    except Exception as e:
        print(f"[Auth] Supabase init warning: {e}")

security = HTTPBearer(auto_error=False)

class AuthenticatedUser:
    def __init__(self, id: str, email: str = ""):
        self.id = id
        self.email = email

    def __repr__(self):
        return f"<AuthenticatedUser id={self.id} email={self.email}>"

def verify_jwt_token(token: str) -> AuthenticatedUser:
    if not token or not token.strip():
        raise HTTPException(
            status_code=401,
            detail="Missing session token.",
            headers={"WWW-Authenticate": "Bearer"}
        )

    if not _supabase_client:
        raise HTTPException(
            status_code=500,
            detail="Authentication service is not configured on the server."
        )

    try:
        user_res = _supabase_client.auth.get_user(token)
        if not user_res or not user_res.user:
            raise HTTPException(
                status_code=401,
                detail="Invalid session token: user not found.",
                headers={"WWW-Authenticate": "Bearer"}
            )
        return AuthenticatedUser(
            id=user_res.user.id,
            email=user_res.user.email or ""
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=401,
            detail=f"Invalid or expired authentication session: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"}
        )

async def get_current_user(
    creds: Optional[HTTPAuthorizationCredentials] = Security(security)
) -> AuthenticatedUser:
    """
    FastAPI dependency that validates Supabase JWT from 'Authorization: Bearer <token>'.
    Rejects with HTTP 401 if missing or invalid.
    """
    if not creds or not creds.credentials:
        raise HTTPException(
            status_code=401,
            detail="Authentication required: Missing Authorization Bearer header.",
            headers={"WWW-Authenticate": "Bearer"}
        )
    return verify_jwt_token(creds.credentials)

async def get_current_user_with_query_fallback(
    creds: Optional[HTTPAuthorizationCredentials] = Security(security),
    token: Optional[str] = Query(None)
) -> AuthenticatedUser:
    """
    Supports both Authorization header and ?token=<jwt> query parameter.
    Critical for browser EventSource SSE streams which cannot send custom headers.
    """
    jwt_token = creds.credentials if (creds and creds.credentials) else token
    if not jwt_token:
        raise HTTPException(
            status_code=401,
            detail="Authentication required: Missing Bearer token or token query parameter.",
            headers={"WWW-Authenticate": "Bearer"}
        )
    return verify_jwt_token(jwt_token)
