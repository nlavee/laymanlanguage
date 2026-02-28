import pytest
import os
import json
from backend.models.domain import DomainExpansion, DomainQuery

def test_workspace_creation():
    db_path = "/tmp/test_workspace.db"
    if os.path.exists(db_path):
        os.remove(db_path)
        
    import backend.storage.workspace_manager as wm
    wm.WORKSPACE_DB = db_path
    
    # Needs to re-init to pick up path change
    manager = wm.WorkspaceManager()
    
    q = DomainQuery(query="Test search", rationale="Test rationale")
    d = DomainExpansion(id="dom_1", name="Domain 1", description="Test domain", search_queries=[q])
    
    ws_id = manager.create_workspace("Test user query", [d])
    assert ws_id is not None
    
    ws = manager.get_workspace(ws_id)
    assert ws is not None
    assert ws["user_query"] == "Test user query"
    
    domains = ws["domains"]
    assert len(domains) == 1
    assert domains[0]["name"] == "Domain 1"
    
    # Assert JSON decoding
    queries = domains[0]["search_queries"]
    assert len(queries) == 1
    assert queries[0]["query"] == "Test search"
