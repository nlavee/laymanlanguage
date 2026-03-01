import os
import json
from typing import Any, AsyncGenerator, Dict, List, Optional
from pydantic import BaseModel
from google import genai
from google.genai import types

from backend.llm.provider import LLMProvider


class GeminiProvider(LLMProvider):
    def __init__(self, model_name: str = "gemini-3-pro-preview", api_key: Optional[str] = None):
        from dotenv import load_dotenv
        
        # Traverse up to find the root directory containing .env
        current_dir = os.path.dirname(os.path.abspath(__file__))
        root_dir = os.path.dirname(os.path.dirname(os.path.dirname(current_dir)))
        env_path = os.path.join(root_dir, '.env')
        
        # Fallback if the traverse fails (e.g. running from slightly different context)
        if not os.path.exists(env_path):
             env_path = os.path.join(os.getcwd(), '.env')
             
        load_dotenv(dotenv_path=env_path)
        
        key = api_key or os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
        if not key:
            raise ValueError(f"Gemini API Key not found. Tried loading .env from {env_path}")
        self.client = genai.Client(api_key=key)
        
        # Model Mapping for layman/placeholders
        self.model_mapping = {
            "gemini-3-pro": "gemini-3-pro-preview",
        }
        self.model_name = self.model_mapping.get(model_name, model_name)

    async def generate_json(self, messages: List[Dict[str, str]], response_model: type[BaseModel]) -> BaseModel:
        contents = self._convert_messages(messages)
        
        # We use sync generate_content internally or async logic if google-genai supports it
        # google-genai supports async via client.aio
        response = await self.client.aio.models.generate_content(
            model=self.model_name,
            contents=contents,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=response_model,
            ),
        )
        return response_model.model_validate_json(response.text)

    async def stream_response(self, messages: List[Dict[str, str]]) -> AsyncGenerator[str, None]:
        contents = self._convert_messages(messages)
        response_stream = await self.client.aio.models.generate_content_stream(
            model=self.model_name,
            contents=contents
        )
        async for chunk in response_stream:
            if chunk.text:
                yield chunk.text

    async def orchestrate_tools(self, messages: List[Dict[str, str]], tools: List[Any]) -> Any:
        # Implementation for function calling / tools
        pass

    def _convert_messages(self, messages: List[Dict[str, str]]) -> List[types.Content]:
        contents = []
        for msg in messages:
            role = msg.get("role")
            if role == "assistant":
                role = "model"
            contents.append(types.Content(role=role, parts=[types.Part.from_text(text=msg.get("content", ""))]))
        return contents
