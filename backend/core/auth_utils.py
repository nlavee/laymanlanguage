import os
from datetime import datetime, timedelta, timezone
from typing import Optional
import jwt # PyJWT
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel

# Configuration
SECRET_KEY = os.getenv("JWT_SECRET", "super-secret-dev-key-change-in-prod")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7 # 1 week

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")
optional_oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login", auto_error=False)

class TokenData(BaseModel):
    username: Optional[str] = None

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user_token(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        return username
    except Exception:
        raise credentials_exception

async def get_current_user(username: str = Depends(get_current_user_token)):
    from backend.storage.user_manager import user_manager
    user = user_manager.get_user_by_username(username)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    if not user["is_verified"]:
        raise HTTPException(status_code=403, detail="User not verified")
    return user

async def get_optional_current_user(token: Optional[str] = Depends(optional_oauth2_scheme)) -> Optional[dict]:
    if not token:
        return None
    try:
        from backend.storage.user_manager import user_manager
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username:
            return user_manager.get_user_by_username(username)
    except Exception:
        pass
    return None
