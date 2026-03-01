import os
import uuid
import json
from typing import List, Optional, Dict, Any
from sqlite_utils import Database
from backend.models.domain import DomainExpansion

WORKSPACE_DB = os.path.join(os.path.dirname(__file__), "../../../brain/workspace.db")

class WorkspaceManager:
    def __init__(self):
        os.makedirs(os.path.dirname(WORKSPACE_DB), exist_ok=True)
        self.db = Database(WORKSPACE_DB)
        
        # Initialize tables if they don't exist
        if "workspaces" not in self.db.table_names():
            self.db["workspaces"].create({
                "id": str,
                "user_id": str,
                "created_at": str,
                "user_query": str,
                "orchestrator_model": str
            }, pk="id")
            self.db["workspaces"].create_index(["user_id"])
        else:
            # Ensure orchestrator_model column exists
            if "orchestrator_model" not in self.db["workspaces"].columns_dict:
                self.db["workspaces"].add_column("orchestrator_model", str)
            if "user_id" not in self.db["workspaces"].columns_dict:
                self.db["workspaces"].add_column("user_id", str)
            
        if "domains" not in self.db.table_names():
            self.db["domains"].create({
                "id": str,
                "workspace_id": str,
                "domain_id": str,
                "name": str,
                "description": str,
                "search_queries": str, # JSON serialized
            }, pk="id", foreign_keys=[
                ("workspace_id", "workspaces", "id")
            ])

    def create_workspace(self, user_id: Optional[str], user_query: str, domains: List[DomainExpansion]) -> str:
        from datetime import datetime, timezone
        ws_id = str(uuid.uuid4())
        
        self.db["workspaces"].insert({
            "id": ws_id,
            "user_id": user_id,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "user_query": user_query,
            "orchestrator_model": "gemini-3-pro-preview" # Default
        })
        
        for d in domains:
            self.db["domains"].insert({
                "id": str(uuid.uuid4()),
                "workspace_id": ws_id,
                "domain_id": d.id,
                "name": d.name,
                "description": d.description,
                "search_queries": json.dumps([q.model_dump() for q in d.search_queries])
            })
            
        return ws_id

    def update_workspace(self, workspace_id: str, updates: Dict[str, Any]):
        self.db["workspaces"].update(workspace_id, updates)

    def get_workspace(self, workspace_id: str) -> Optional[Dict[str, Any]]:
        try:
            ws = self.db["workspaces"].get(workspace_id)
            domains = list(self.db["domains"].rows_where("workspace_id = ?", [workspace_id]))
            for d in domains:
                d["search_queries"] = json.loads(d["search_queries"])
            ws["domains"] = domains
            return ws
        except Exception:
            return None

    def list_workspaces(self, user_id: Optional[str]) -> List[Dict[str, Any]]:
        if not user_id:
            return []
        return list(self.db["workspaces"].rows_where("user_id = ?", [user_id], order_by="created_at desc"))

workspace_manager = WorkspaceManager()
