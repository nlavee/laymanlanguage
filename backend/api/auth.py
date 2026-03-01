from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel, EmailStr
from typing import Optional

from backend.storage.user_manager import user_manager
from backend.core.auth_utils import verify_password, get_password_hash, create_access_token

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
    token_type: str

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
    print(f"DEBUG: Login attempt for user: {credentials.username}")
    user = user_manager.get_user_by_username(credentials.username)
    if not user:
        print(f"DEBUG: User not found: {credentials.username}")
    else:
        print(f"DEBUG: User found, checking password for {credentials.username}")
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
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me")
async def read_users_me(current_user: str = Depends(create_access_token)):
    # This is a bit of a placeholder, actual implementation should use get_current_user dependency
    return {"username": current_user}
