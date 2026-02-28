import os
import yaml
from typing import Dict, Any, Optional

PROFILE_DIR = os.path.join(os.path.dirname(__file__), "../../../brain/profiles")

class ProfileManager:
    def __init__(self):
        os.makedirs(PROFILE_DIR, exist_ok=True)
        # Using a single default profile for now. Can be expanded for multi-user later.
        self.default_profile_path = os.path.join(PROFILE_DIR, "default_user.md")

    def save_profile(self, summary: str, traits: Dict[str, str]):
        """Saves the profile as a Markdown file with YAML frontmatter."""
        frontmatter = yaml.dump({"traits": traits}, default_flow_style=False)
        content = f"---\n{frontmatter}---\n\n# User Profile Summary\n\n{summary}\n"
        
        with open(self.default_profile_path, "w") as f:
            f.write(content)

    def load_profile(self) -> Optional[Dict[str, Any]]:
        if not os.path.exists(self.default_profile_path):
            return None
            
        with open(self.default_profile_path, "r") as f:
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

    def delete_trait(self, trait_category: str) -> bool:
        profile = self.load_profile()
        if not profile:
            return False
            
        traits = profile.get("metadata", {}).get("traits", {})
        if trait_category in traits:
            del traits[trait_category]
            self.save_profile(profile.get("body", "").replace("# User Profile Summary\n\n", ""), traits)
            return True
        return False

    def reset_profile(self):
        if os.path.exists(self.default_profile_path):
            os.remove(self.default_profile_path)

profile_manager = ProfileManager()
