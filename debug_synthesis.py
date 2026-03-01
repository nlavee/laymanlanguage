import asyncio
import os
from backend.api.synthesis import synthesize_results

async def debug():
    from sqlite_utils import Database
    # Use workspace.db instead of users.db!
    db_path = os.path.join(os.path.dirname(__file__), "brain", "workspace.db")
    if not os.path.exists(db_path):
        db_path = os.path.join(os.path.dirname(__file__), "..", "brain", "workspace.db")
        
    db = Database(db_path)
    try:
        ws = next(db["workspaces"].rows_where("1=1 ORDER BY created_at DESC LIMIT 1"))
        ws_id = ws["id"]
        print(f"Testing with workspace {ws_id}")
        
        # mock user
        mock_user = {"username": ws["user_id"]}
        
        res = await synthesize_results(ws_id, mock_user)
        print("SUCCESS!")
        print(res.model_dump_json(indent=2))
    except Exception as e:
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(debug())
