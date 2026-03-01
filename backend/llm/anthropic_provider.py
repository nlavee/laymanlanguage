import os
import json
from typing import Any, AsyncGenerator, Dict, List, Optional
from pydantic import BaseModel
import anthropic
import instructor

from backend.llm.provider import LLMProvider

class AnthropicProvider(LLMProvider):
    def __init__(self, model_name: str = "claude-3-5-sonnet-20241022", api_key: Optional[str] = None):
        from dotenv import load_dotenv
        
        # Traverse up to find the root directory containing .env
        current_dir = os.path.dirname(os.path.abspath(__file__))
        root_dir = os.path.dirname(os.path.dirname(os.path.dirname(current_dir)))
        env_path = os.path.join(root_dir, '.env')
        
        if not os.path.exists(env_path):
             env_path = os.path.join(os.getcwd(), '.env')
             
        load_dotenv(dotenv_path=env_path)
        
        key = api_key or os.getenv("ANTHROPIC_API_KEY") or os.getenv("CLAUDE_API_KEY")
        if not key:
            raise ValueError(f"Anthropic/Claude API Key not found. Tried loading .env from {env_path}")
            
        # Initialize async anthropic client
        base_client = anthropic.AsyncAnthropic(api_key=key)
        # Patch with instructor to support Pydantic response_model easily
        self.client = instructor.from_anthropic(base_client)
        
        # Model Mapping for layman/placeholders
        self.model_mapping = {
            "claude-haiku-4-5-20251001": "claude-3-haiku-20240307",
            "claude-sonnet-4-6": "claude-3-haiku-20240307",
            "claude-haiku-4-5": "claude-3-haiku-20240307",
            "claude-sonnet-4-5": "claude-3-haiku-20240307",
            "claude-haiku-4-6": "claude-3-haiku-20240307",
        }
        self.model_name = self.model_mapping.get(model_name, model_name)

    async def generate_json(self, messages: List[Dict[str, str]], response_model: type[BaseModel]) -> BaseModel:
        # Instructor handles the Pydantic structured output mapping
        import asyncio
        try:
            resp = await asyncio.wait_for(
                self.client.messages.create(
                    model=self.model_name,
                    max_tokens=4096,
                    messages=messages,
                    response_model=response_model
                ),
                timeout=45.0 # Reasonable timeout for a single LLM call
            )
            return resp
        except asyncio.TimeoutError:
            raise ValueError(f"Anthropic LLM call timed out for model {self.model_name}")
        except Exception as e:
            raise ValueError(f"Anthropic LLM call failed: {str(e)}")

    async def stream_response(self, messages: List[Dict[str, str]]) -> AsyncGenerator[str, None]:
        # Use underlying anthropic client for raw text streaming
        stream = await self.client.client.messages.create(
            max_tokens=4096,
            messages=messages,
            model=self.model_name,
            stream=True,
        )
        async for event in stream:
            if event.type == "content_block_delta" and event.delta.type == "text_delta":
                yield event.delta.text

    async def orchestrate_tools(self, messages: List[Dict[str, str]], tools: List[Any]) -> Any:
        pass
