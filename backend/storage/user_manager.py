import os
import uuid
from datetime import datetime, timezone
from typing import Optional, Dict, Any
from sqlite_utils import Database

USER_DB = os.path.join(os.path.dirname(__file__), "../../brain/users.db")

class UserManager:
    def __init__(self):
        os.makedirs(os.path.dirname(USER_DB), exist_ok=True)
        self.db = Database(USER_DB)
        
        if "users" not in self.db.table_names():
            self.db["users"].create({
                "id": str,
                "username": str,
                "email": str,
                "password_hash": str,
                "is_verified": bool,
                "created_at": str,
            }, pk="id")
            self.db["users"].create_index(["username"], unique=True)
            self.db["users"].create_index(["email"], unique=True)

    def create_user(self, username: str, email: str, password_hash: str, is_verified: bool = False) -> str:
        user_id = str(uuid.uuid4())
        self.db["users"].insert({
            "id": user_id,
            "username": username,
            "email": email,
            "password_hash": password_hash,
            "is_verified": is_verified,
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        return user_id

    def get_user_by_username(self, username: str) -> Optional[Dict[str, Any]]:
        try:
            return next(self.db["users"].rows_where("username = ?", [username]))
        except StopIteration:
            return None

    def get_user_by_id(self, user_id: str) -> Optional[Dict[str, Any]]:
        try:
            return self.db["users"].get(user_id)
        except Exception:
            return None

    def verify_user(self, user_id: str):
        self.db["users"].update(user_id, {"is_verified": True})

user_manager = UserManager()
