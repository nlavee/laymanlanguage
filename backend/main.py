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

app = FastAPI(title="layman.ai API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://0.0.0.0:3000",
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
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=False)
