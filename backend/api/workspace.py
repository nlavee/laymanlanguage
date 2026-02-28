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
async def ingest_task(req: TaskIngestionRequest, llm: GeminiProvider = Depends(get_llm)): # Changed request to req
    # 1. Load active user profile context
    profile = profile_manager.load_profile()
    profile_summary = profile.get("body", "Generic User") if profile else "Generic User"

    prompt_path = os.path.join(os.path.dirname(__file__), "../prompts/domain_expansion.md")
    with open(prompt_path, "r") as f:
        system_prompt = f.read()

    messages = [
        {"role": "system", "content": system_prompt + f"\nUser Profile:\n{profile_summary}"},
        {"role": "user", "content": f"Task Query: {req.query}"}
    ]
    
    response = await llm.generate_json(messages, DomainExpansionResponse)
    response.orchestrator_model = llm.model_name
    
    # Save to SQLite Workspace
    ws_id = workspace_manager.create_workspace(req.query, response.domains)
    
    return {
        "status": "success",
        "workspace_id": ws_id,
        "query": req.query,
        "domains": [d.model_dump() for d in response.domains],
        "orchestrator_model": response.orchestrator_model
    }

@router.get("/{workspace_id}")
def get_workspace(workspace_id: str):
    ws = workspace_manager.get_workspace(workspace_id)
    if not ws:
        return {"status": "error", "message": "Not found"}
    return {"status": "success", "workspace": {
        "workspace_id": ws["id"],
        "query": ws.get("user_query", ""),
        "domains": ws.get("domains", []),
        "orchestrator_model": "gemini-3-pro-preview" # For retrospective loads
    }}
