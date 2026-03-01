import os
import uuid
import json
from typing import List, Dict, Any
from sqlite_utils import Database

KNOWLEDGE_DB = os.path.join(os.path.dirname(__file__), "../../brain/knowledge.db")

class KnowledgeBase:
    def __init__(self):
        os.makedirs(os.path.dirname(KNOWLEDGE_DB), exist_ok=True)
        self.db = Database(KNOWLEDGE_DB)
        
        if "documents" not in self.db.table_names():
            self.db["documents"].create({
                "id": str,
                "workspace_id": str,
                "domain_id": str,
                "title": str,
                "content": str,
                "source_url": str
            }, pk="id")
            
            # Enable Full Text Search (FTS5) for rapid capability search
            self.db["documents"].enable_fts(["title", "content"], fts_version="FTS5", create_triggers=True)

    def insert_document(self, workspace_id: str, domain_id: str, title: str, content: str, source_url: str):
        self.db["documents"].insert({
            "id": str(uuid.uuid4()),
            "workspace_id": workspace_id,
            "domain_id": domain_id,
            "title": title,
            "content": content,
            "source_url": source_url
        })
        
    def search(self, query: str, limit: int = 5) -> List[Dict[str, Any]]:
        # FTS5 search syntax
        try:
            return list(self.db["documents"].search(query, limit=limit))
        except Exception as e:
            return []

knowledge_base = KnowledgeBase()
