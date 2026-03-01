from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel, EmailStr
from typing import Optional
import jwt

from backend.storage.user_manager import user_manager
from backend.core.auth_utils import (
    verify_password, 
    get_password_hash, 
    create_access_token, 
    create_refresh_token, 
    get_current_user,
    SECRET_KEY,
    ALGORITHM
)

router = APIRouter(prefix="/api/auth", tags=["auth"])

class UserLogin(BaseModel):
    username: str
    password: str

class UserSignup(BaseModel):
    username: str
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str

class RefreshTokenRequest(BaseModel):
    refresh_token: str

@router.post("/signup")
async def signup(user: UserSignup):
    if user_manager.get_user_by_username(user.username):
        raise HTTPException(status_code=400, detail="Username already registered")
    
    hashed_password = get_password_hash(user.password)
    user_manager.create_user(
        username=user.username,
        email=user.email,
        password_hash=hashed_password,
        is_verified=False # Requires manual verification
    )
    return {"message": "User created. Please wait for manual verification."}

@router.post("/login", response_model=Token)
async def login(credentials: UserLogin):
    user = user_manager.get_user_by_username(credentials.username)
    
    if not user or not verify_password(credentials.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user["is_verified"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account pending verification. Please contact administrator."
        )

    access_token = create_access_token(data={"sub": user["username"]})
    refresh_token = create_refresh_token(data={"sub": user["username"]})
    return {
        "access_token": access_token, 
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }

@router.post("/refresh", response_model=Token)
async def refresh(request: RefreshTokenRequest):
    try:
        payload = jwt.decode(request.refresh_token, SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid token type")
        
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid token")
            
        user = user_manager.get_user_by_username(username)
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
            
        access_token = create_access_token(data={"sub": user["username"]})
        # Note: We keep the same refresh token, or rotate it. 
        # For simplicity, we just return the new access token and the same refresh token.
        return {
            "access_token": access_token, 
            "refresh_token": request.refresh_token,
            "token_type": "bearer"
        }
    except Exception:
        raise HTTPException(status_code=401, detail="Could not validate credentials")

@router.get("/me")
async def read_users_me(current_user: dict = Depends(get_current_user)):
    return {
        "username": current_user["username"],
        "email": current_user["email"],
        "is_verified": current_user["is_verified"]
    }
