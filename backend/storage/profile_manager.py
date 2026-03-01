import os
import yaml
from typing import Dict, Any, Optional

PROFILE_DIR = os.path.join(os.path.dirname(__file__), "../../../brain/profiles")

class ProfileManager:
    def __init__(self):
        os.makedirs(PROFILE_DIR, exist_ok=True)

    def get_profile_path(self, user_id: str):
        return os.path.join(PROFILE_DIR, f"user_{user_id}.md")

    def save_profile(self, user_id: str, summary: str, traits: Dict[str, str]):
        """Saves the profile as a Markdown file with YAML frontmatter."""
        frontmatter = yaml.dump({"traits": traits}, default_flow_style=False)
        content = f"---\n{frontmatter}---\n\n# User Profile Summary\n\n{summary}\n"
        
        path = self.get_profile_path(user_id)
        with open(path, "w") as f:
            f.write(content)

    def load_profile(self, user_id: Optional[str]) -> Optional[Dict[str, Any]]:
        if not user_id:
            return {
                "metadata": {"traits": {"experience": "Strategic Architecture", "focus": "Enterprise"}}, 
                "body": "A technical architect focused on modernizing legacy systems and designing scalable, cloud-native infrastructures."
            }
        path = self.get_profile_path(user_id)
        if not os.path.exists(path):
            return None
            
        with open(path, "r") as f:
            content = f.read()
            
        if content.startswith("---"):
            parts = content.split("---", 2)
            if len(parts) >= 3:
                frontmatter_str = parts[1]
                body = parts[2].strip()
                try:
                    metadata = yaml.safe_load(frontmatter_str)
                    return {"metadata": metadata, "body": body}
                except yaml.YAMLError:
                    pass
        return {"metadata": {}, "body": content}

    def delete_trait(self, user_id: str, trait_category: str) -> bool:
        profile = self.load_profile(user_id)
        if not profile:
            return False
            
        traits = profile.get("metadata", {}).get("traits", {})
        if trait_category in traits:
            del traits[trait_category]
            self.save_profile(user_id, profile.get("body", "").replace("# User Profile Summary\n\n", ""), traits)
            return True
        return False

    def reset_profile(self, user_id: str):
        path = self.get_profile_path(user_id)
        if os.path.exists(path):
            os.remove(path)

profile_manager = ProfileManager()
