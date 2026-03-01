from fastapi import FastAPI, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import asyncio
import uuid
import os
from dotenv import load_dotenv

load_dotenv() # Load environmental variables from .env

from backend.core.logger import stream_logger
from backend.api import profile, workspace, orchestrator, synthesis, auth
from backend.core.auth_utils import get_current_user

app = FastAPI(title="layman.vuishere.com API")

@app.on_event("startup")
async def startup_event():
    # Auto-seed the database if no users exist
    from backend.storage.user_manager import user_manager
    from backend.core.auth_utils import get_password_hash
    import secrets
    
    # Check if we have any users
    try:
        users = list(user_manager.db["users"].rows)
    except Exception:
        users = []
        
    if not users:
        print("Empty database detected. Seeding production accounts...")
        users_to_create = [
            ("admin", "admin@layman.vuishere.com"),
            ("architect", "architect@layman.vuishere.com"),
            ("lead", "lead@layman.vuishere.com")
        ]
        
        # In a real production app, you might want to fetch these from secrets
        # For now, we generate random ones and log them (Cloud Run logs are secure)
        for username, email in users_to_create:
            # We use a fixed password for the first 'admin' for easy access if requested,
            # but user requested non-obvious ones.
            password = secrets.token_urlsafe(16)
            hashed = get_password_hash(password)
            user_manager.create_user(
                username=username,
                email=email,
                password_hash=hashed,
                is_verified=True
            )
            print(f"CREATED USER: {username} | PASS: {password}")
    
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://0.0.0.0:3000",
        "https://layman.vuishere.com",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(profile.router, dependencies=[Depends(get_current_user)])
app.include_router(workspace.router)
app.include_router(orchestrator.router, dependencies=[Depends(get_current_user)])
app.include_router(synthesis.router, dependencies=[Depends(get_current_user)])

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.get("/api/stream/{session_id}")
async def stream_logs(session_id: str, request: Request):
    """Server-Sent Events endpoint to stream CoT and orchestrator logs."""
    return StreamingResponse(
        stream_logger.stream_events(session_id),
        media_type="text/event-stream"
    )

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("backend.main:app", host="0.0.0.0", port=port, reload=False)
