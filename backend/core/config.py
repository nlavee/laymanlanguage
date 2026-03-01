from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional
import os

class Settings(BaseSettings):
    # App Settings
    PROJECT_NAME: str = "Layman Language"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    
    # Auth Settings
    # This must be consistent across environments
    JWT_SECRET: str = os.getenv("JWT_SECRET", "super-secret-dev-key-change-in-prod")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7 # 1 week
    
    # Seeding Settings (to ensure deterministic passwords across restarts)
    # Format: username:password,username:password
    SEED_CREDENTIALS: Optional[str] = os.getenv("SEED_CREDENTIALS")
    
    # LLM Settings (Validated as optional, but will error later if missing and used)
    CLAUDE_API_KEY: Optional[str] = None
    GOOGLE_API_KEY: Optional[str] = None
    OPENAI_API_KEY: Optional[str] = None
    PRESENTON_API_KEY: Optional[str] = None

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
