import os
from typing import Any, AsyncGenerator, Dict, List, Optional
from pydantic import BaseModel
from openai import AsyncOpenAI

from backend.llm.provider import LLMProvider

class OpenAIProvider(LLMProvider):
    def __init__(self, model_name: str = "gpt-5.2-2025-12-11", api_key: Optional[str] = None):
        from dotenv import load_dotenv
        load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '../../../.env'))
        key = api_key or os.getenv("OPENAI_API_KEY")
        if not key:
            raise ValueError("OpenAI API Key not found")
        self.client = AsyncOpenAI(api_key=key)
        self.model_name = model_name

    async def generate_json(self, messages: List[Dict[str, str]], response_model: type[BaseModel]) -> BaseModel:
        completion = await self.client.beta.chat.completions.parse(
            model=self.model_name,
            messages=messages,
            response_format=response_model,
        )
        if completion.choices and completion.choices[0].message.parsed:
            return completion.choices[0].message.parsed
        raise ValueError("Failed to parse output format")

    async def stream_response(self, messages: List[Dict[str, str]]) -> AsyncGenerator[str, None]:
        stream = await self.client.chat.completions.create(
            model=self.model_name,
            messages=messages,
            stream=True
        )
        async for chunk in stream:
            if chunk.choices and chunk.choices[0].delta.content:
                yield chunk.choices[0].delta.content

    async def orchestrate_tools(self, messages: List[Dict[str, str]], tools: List[Any]) -> Any:
        pass 
