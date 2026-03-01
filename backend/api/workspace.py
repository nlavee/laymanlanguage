import os
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Dict, Any, Optional

from backend.models.domain import DomainExpansionResponse
from backend.llm.gemini import GeminiProvider
from backend.storage.profile_manager import profile_manager
from backend.storage.workspace_manager import workspace_manager

from backend.core.auth_utils import get_current_user, get_optional_current_user

router = APIRouter(prefix="/api/workspace", tags=["workspace"])

from backend.llm.anthropic_provider import AnthropicProvider
from backend.llm.openai_provider import OpenAIProvider

class TaskIngestionRequest(BaseModel):
    query: str
    model_id: str = "claude-haiku-4-5-20251001"

@router.post("/ingest")
async def ingest_task(req: TaskIngestionRequest, current_user: Optional[dict] = Depends(get_optional_current_user)):
    # 1. Use req.model_id (user selection) for Synthesis Model
    # 2. Use Claude 4.5 Haiku for initial ingestion/orchestration
    orchestration_model = "claude-haiku-4-5-20251001"
    
    # Instantiate LLM for domain expansion (part of orchestration)
    llm = AnthropicProvider(model_name=orchestration_model)

    # 1. Load active user profile context
    username = current_user["username"] if current_user else None
    profile = profile_manager.load_profile(username)
    profile_summary = profile.get("body", "Generic User") if profile else "Generic User"

    prompt_path = os.path.join(os.path.dirname(__file__), "../prompts/domain_expansion.md")
    with open(prompt_path, "r") as f:
        system_prompt = f.read()

    messages = [
        {"role": "system", "content": system_prompt + f"\nUser Profile:\n{profile_summary}"},
        {"role": "user", "content": f"Task Query: {req.query}"}
    ]
    
    response = await llm.generate_json(messages, DomainExpansionResponse)
    
    # Save workspace with specific orchestration and synthesis models
    ws_id = workspace_manager.create_workspace(
        user_id=username, 
        user_query=req.query, 
        domains=response.domains,
        synthesis_model=req.model_id
    )
    
    return {
        "status": "success",
        "workspace_id": ws_id,
        "query": req.query,
        "domains": [d.model_dump() for d in response.domains],
        "orchestrator_model": orchestration_model,
        "synthesis_model": req.model_id,
        "is_anonymous": username is None
    }

@router.get("/")
def list_workspaces(current_user: dict = Depends(get_current_user)):
    return {"status": "success", "workspaces": workspace_manager.list_workspaces(current_user["username"])}

@router.get("/{workspace_id}")
def get_workspace(workspace_id: str, current_user: Optional[dict] = Depends(get_optional_current_user)):
    ws = workspace_manager.get_workspace(workspace_id)
    if not ws:
        return {"status": "error", "message": "Not found"}
    
    # Allow access if the workspace is anonymous OR if the current user owns it
    is_owner = current_user and ws.get("user_id") == current_user["username"]
    is_anonymous = ws.get("user_id") is None
    
    if not is_owner and not is_anonymous:
        return {"status": "error", "message": "Unauthorized"}
        
    return {"status": "success", "workspace": {
        "workspace_id": ws["id"],
        "query": ws.get("user_query", ""),
        "domains": ws.get("domains", []),
        "orchestrator_model": ws.get("orchestrator_model", "claude-haiku-4-5-20251001"),
        "synthesis_model": ws.get("synthesis_model", "claude-sonnet-4-6")
    }}
