import sys
from backend.storage.user_manager import user_manager

def verify_user(username):
    user = user_manager.get_user_by_username(username)
    if not user:
        print(f"❌ User '{username}' not found.")
        return
    
    if user["is_verified"]:
        print(f"ℹ️ User '{username}' is already verified.")
        return
    
    user_manager.verify_user(user["id"])
    print(f"✅ User '{username}' has been successfully verified.")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python backend/verify_user.py <username>")
    else:
        verify_user(sys.argv[1])
