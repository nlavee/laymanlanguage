from abc import ABC, abstractmethod
from typing import Any, AsyncGenerator, Dict, List, Optional
from pydantic import BaseModel

class LLMProvider(ABC):
    @abstractmethod
    def __init__(self, model_name: str, api_key: Optional[str] = None):
        """Initialize the LLM provider."""
        pass

    @abstractmethod
    async def generate_json(self, messages: List[Dict[str, str]], response_model: type[BaseModel]) -> BaseModel:
        """Generate a structured JSON output mapped to a Pydantic model.
        messages should be a list of {"role": "user"|"assistant"|"system", "content": "..."}
        """
        pass

    @abstractmethod
    async def stream_response(self, messages: List[Dict[str, str]]) -> AsyncGenerator[str, None]:
        """Stream a standard text response yielding chunks of string text."""
        pass
        
    @abstractmethod
    async def orchestrate_tools(self, messages: List[Dict[str, str]], tools: List[Any]) -> Any:
        """Run an orchestration loop using tools, and stream intermediate CoT if capable."""
        pass
