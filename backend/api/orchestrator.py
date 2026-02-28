from fastapi import APIRouter, BackgroundTasks
from backend.orchestrator.agent import orchestrator
from pydantic import BaseModel

router = APIRouter(prefix="/api/orchestrator", tags=["orchestrator"])

class OrchestrationRequest(BaseModel):
    workspace_id: str

@router.post("/start")
async def start_orchestration(req: OrchestrationRequest, background_tasks: BackgroundTasks):
    # Kick off the robust Planner Agent in the background
    background_tasks.add_task(orchestrator.run_planner, req.workspace_id)
    return {"status": "started", "workspace_id": req.workspace_id}
