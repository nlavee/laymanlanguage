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
    # Verify workspace belongs to user OR is anonymous (allow claiming)
    ws = workspace_manager.get_workspace(req.workspace_id)
    if not ws:
        raise HTTPException(status_code=404, detail="Workspace not found")
        
    owner_id = ws.get("user_id")
    if owner_id and owner_id != current_user["username"]:
         raise HTTPException(status_code=403, detail="Unauthorized")
    
    # If the workspace is anonymous, claim it for the current user
    if not owner_id:
        workspace_manager.update_workspace(req.workspace_id, {"user_id": current_user["username"]})
    
    # Kick off the robust Planner Agent in the background
    background_tasks.add_task(orchestrator.run_planner, req.workspace_id)
    return {"status": "started", "workspace_id": req.workspace_id}
