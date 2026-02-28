from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from backend.orchestrator.agent import orchestrator
from pydantic import BaseModel
from backend.core.auth_utils import get_current_user
from backend.storage.workspace_manager import workspace_manager

router = APIRouter(prefix="/api/orchestrator", tags=["orchestrator"])

class OrchestrationRequest(BaseModel):
    workspace_id: str

@router.post("/start")
async def start_orchestration(req: OrchestrationRequest, background_tasks: BackgroundTasks, current_user: dict = Depends(get_current_user)):
    # Verify workspace belongs to user
    ws = workspace_manager.get_workspace(req.workspace_id)
    if not ws or ws.get("user_id") != current_user["username"]:
         raise HTTPException(status_code=403, detail="Unauthorized")
    
    # Kick off the robust Planner Agent in the background
    background_tasks.add_task(orchestrator.run_planner, req.workspace_id)
    return {"status": "started", "workspace_id": req.workspace_id}
