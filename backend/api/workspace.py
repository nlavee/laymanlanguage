import os
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Dict, Any

from backend.models.domain import DomainExpansionResponse
from backend.llm.gemini import GeminiProvider
from backend.storage.profile_manager import profile_manager
from backend.storage.workspace_manager import workspace_manager

from backend.core.auth_utils import get_current_user

router = APIRouter(prefix="/api/workspace", tags=["workspace"])

from backend.llm.anthropic_provider import AnthropicProvider
from backend.llm.openai_provider import OpenAIProvider

class TaskIngestionRequest(BaseModel):
    query: str
    model_id: str = "gemini-3-pro-preview"

@router.post("/ingest")
async def ingest_task(req: TaskIngestionRequest, current_user: dict = Depends(get_current_user)):
    # Determine the LLM Provider based on user selection
    if "claude" in req.model_id.lower():
        llm = AnthropicProvider(model_name=req.model_id)
    elif "gpt" in req.model_id.lower() or "o1" in req.model_id.lower() or "o3" in req.model_id.lower():
        llm = OpenAIProvider(model_name=req.model_id)
    else:
        llm = GeminiProvider(model_name=req.model_id)

    # 1. Load active user profile context
    profile = profile_manager.load_profile(current_user["username"])
    profile_summary = profile.get("body", "Generic User") if profile else "Generic User"

    prompt_path = os.path.join(os.path.dirname(__file__), "../prompts/domain_expansion.md")
    with open(prompt_path, "r") as f:
        system_prompt = f.read()

    messages = [
        {"role": "system", "content": system_prompt + f"\nUser Profile:\n{profile_summary}"},
        {"role": "user", "content": f"Task Query: {req.query}"}
    ]
    
    response = await llm.generate_json(messages, DomainExpansionResponse)
    
    # Save the selected orchestrator model down into the SQLite workspace state
    ws_id = workspace_manager.create_workspace(current_user["username"], req.query, response.domains)
    workspace_manager.update_workspace(ws_id, {"orchestrator_model": req.model_id})
    
    return {
        "status": "success",
        "workspace_id": ws_id,
        "query": req.query,
        "domains": [d.model_dump() for d in response.domains],
        "orchestrator_model": req.model_id
    }

@router.get("/")
def list_workspaces(current_user: dict = Depends(get_current_user)):
    return {"status": "success", "workspaces": workspace_manager.list_workspaces(current_user["username"])}

@router.get("/{workspace_id}")
def get_workspace(workspace_id: str, current_user: dict = Depends(get_current_user)):
    ws = workspace_manager.get_workspace(workspace_id)
    if not ws or ws.get("user_id") != current_user["username"]:
        return {"status": "error", "message": "Not found or unauthorized"}
    return {"status": "success", "workspace": {
        "workspace_id": ws["id"],
        "query": ws.get("user_query", ""),
        "domains": ws.get("domains", []),
        "orchestrator_model": ws.get("orchestrator_model", "gemini-3-pro-preview")
    }}
