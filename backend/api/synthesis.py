import os
import asyncio
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from backend.models.synthesis import SynthesisResponse
from backend.llm.gemini import GeminiProvider
from backend.llm.anthropic_provider import AnthropicProvider
from backend.llm.openai_provider import OpenAIProvider
from backend.storage.profile_manager import profile_manager
from backend.storage.workspace_manager import workspace_manager
from backend.storage.knowledgebase import knowledge_base

class DomainDeepDive(BaseModel):
    deep_dive_markdown: str

router = APIRouter(prefix="/api/synthesis", tags=["synthesis"])

@router.get("/{workspace_id}", response_model=SynthesisResponse)
async def synthesize_results(workspace_id: str):
    # 1. Fetch ALL scraped/searched data from FTS5
    # For a real implementation, we'd search specifically by workspace_id and relevance.
    # Here, we grab general documents ingested during orchestration.
    docs = knowledge_base.search(f"{workspace_id}*", limit=20)
    data_context = "\n".join([d.get('content', '') for d in docs])
    
    if not data_context:
        data_context = "Simulation mode context: Top models evaluated were GPT-4, Gemini Pro, and Llama-3."
    
    # 2. Fetch Workspace Domains for targeted deep dives
    ws = workspace_manager.get_workspace(workspace_id)
    domains = ws.get("domains", []) if ws else []
    
    # 2b. Instantiate the correct LLM
    model_id = ws.get("orchestrator_model", "gemini-3-pro-preview") if ws else "gemini-3-pro-preview"
    if "claude" in model_id.lower():
        llm = AnthropicProvider(model_name=model_id)
    elif "gpt" in model_id.lower() or "o1" in model_id.lower() or "o3" in model_id.lower():
        llm = OpenAIProvider(model_name=model_id)
    else:
        llm = GeminiProvider(model_name=model_id)

    # 3. Fetch Profile Persona
    profile = profile_manager.load_profile()
    profile_summary = profile.get("body", "Generic User") if profile else "Generic User"
    
    # 4. Perform Parallel Deep-Dives per domain
    deep_dive_prompt_path = os.path.join(os.path.dirname(__file__), "../prompts/domain_deep_dive.md")
    with open(deep_dive_prompt_path, "r") as f:
        deep_dive_system_prompt = f.read()

    async def fetch_deep_dive(domain):
        domain_name = domain.get('name', 'General Tech')
        prompt = deep_dive_system_prompt.replace("{domain_name}", domain_name)
        messages = [
            {"role": "system", "content": prompt + f"\nUser Profile:\n{profile_summary}"},
            {"role": "user", "content": f"Research Context extracted from SQLite FTS5:\n{data_context}\n\nPlease output the deep dive."}
        ]
        # We use a simple Pydantic wrapper to force the LLM to return strictly the markdown text
        res = await llm.generate_json(messages, DomainDeepDive)
        return f"### Deep Dive: {domain_name}\n{res.deep_dive_markdown}\n"

    deep_dive_results = await asyncio.gather(*[fetch_deep_dive(d) for d in domains])
    combined_deep_dives = "\n\n".join(deep_dive_results) if deep_dive_results else data_context
    
    # 5. Final Synthesis Generation
    prompt_path = os.path.join(os.path.dirname(__file__), "../prompts/synthesis.md")
    with open(prompt_path, "r") as f:
        system_prompt = f.read()

    messages = [
        {"role": "system", "content": system_prompt + f"\nUser Profile:\n{profile_summary}"},
        {"role": "user", "content": f"Comprehensive Per-Domain Research Reports:\n{combined_deep_dives}\n\nOutputs must adhere to the JSON schema."}
    ]
    
    response = await llm.generate_json(messages, SynthesisResponse)
    return response
