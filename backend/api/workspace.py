from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Dict, Any

from backend.models.domain import DomainExpansionResponse
from backend.llm.gemini import GeminiProvider
from backend.storage.profile_manager import profile_manager
from backend.storage.workspace_manager import workspace_manager

router = APIRouter(prefix="/api/workspace", tags=["workspace"])

def get_llm():
    return GeminiProvider()

class TaskIngestionRequest(BaseModel):
    query: str

@router.post("/ingest")
async def ingest_task(request: TaskIngestionRequest, llm: GeminiProvider = Depends(get_llm)):
    # 1. Load active user profile context
    profile = profile_manager.load_profile()
    profile_summary = profile.get("body", "") if profile else "No specific profile."
    
    # 2. Prompt LLM for expansion
    messages = [
        {"role": "system", "content": f"You are an expert Staff+ AI architect. The user's technical profile is:\n{profile_summary}\n\nTask: Break down the user's querying into 3-5 distinct, highly technical subdomains that must be researched to find the state-of-the-art LLMs for their specific task. Be sure to tailor this to their specific profile."},
        {"role": "user", "content": request.query}
    ]
    
    expansion: DomainExpansionResponse = await llm.generate_json(messages, DomainExpansionResponse)
    
    # 3. Save to workspace manager
    ws_id = workspace_manager.create_workspace(request.query, expansion.domains)
    
    return {"status": "success", "workspace_id": ws_id, "domains": expansion.domains}

@router.get("/{workspace_id}")
def get_workspace(workspace_id: str):
    ws = workspace_manager.get_workspace(workspace_id)
    if not ws:
        return {"status": "error", "message": "Workspace not found"}
    return {"status": "success", "workspace": ws}
