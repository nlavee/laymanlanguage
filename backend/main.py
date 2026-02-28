from fastapi import FastAPI, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import asyncio
import uuid

from backend.core.logger import stream_logger

app = FastAPI(title="Layman Language Disclosed API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For dev only, configure properly in prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
