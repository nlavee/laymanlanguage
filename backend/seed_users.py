import os
from backend.storage.user_manager import user_manager
from backend.core.auth_utils import get_password_hash

def seed_accounts():
    print("Seeding initial accounts...")
    
    # 2 accounts for the user, 1 for guest
    # Using shorter passwords to avoid any potential env-related length issues in bcrypt
    users = [
        {"username": "admin", "email": "admin@layman.ai", "password": "pass123", "is_verified": True},
        {"username": "nlavee", "email": "nlavee@layman.ai", "password": "pass123", "is_verified": True},
        {"username": "guest", "email": "guest@layman.ai", "password": "guestpass", "is_verified": True},
    ]
    
    for u in users:
        try:
            if not user_manager.get_user_by_username(u["username"]):
                hashed = get_password_hash(u["password"])
                user_manager.create_user(
                    username=u["username"],
                    email=u["email"],
                    password_hash=hashed,
                    is_verified=u["is_verified"]
                )
                print(f"✅ Created user: {u['username']}")
            else:
                print(f"ℹ️ User {u['username']} already exists.")
        except Exception as e:
            print(f"❌ Failed to create user {u['username']}: {str(e)}")

if __name__ == "__main__":
    seed_accounts()
