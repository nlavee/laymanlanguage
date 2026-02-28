from fastapi import APIRouter, Depends
from backend.models.synthesis import SynthesisResponse
from backend.llm.gemini import GeminiProvider
from backend.storage.profile_manager import profile_manager
from backend.storage.workspace_manager import workspace_manager
from backend.storage.knowledgebase import knowledge_base

router = APIRouter(prefix="/api/synthesis", tags=["synthesis"])

def get_llm():
    return GeminiProvider()

@router.get("/{workspace_id}", response_model=SynthesisResponse)
async def synthesize_results(workspace_id: str, llm: GeminiProvider = Depends(get_llm)):
    # 1. Fetch ALL scraped/searched data from FTS5
    # For a real implementation, we'd search specifically by workspace_id and relevance.
    # Here, we grab general documents ingested during orchestration.
    docs = knowledge_base.search(f"{workspace_id}*", limit=20)
    data_context = "\n".join([d.get('content', '') for d in docs])
    
    if not data_context:
        data_context = "Simulation mode context: Top models evaluated were GPT-4, Gemini Pro, and Llama-3."
    
    # 2. Fetch Profile Persona
    profile = profile_manager.load_profile()
    profile_summary = profile.get("body", "Generic User") if profile else "Generic User"

    # 3. LLM JSON generation
    messages = [
        {"role": "system", "content": f"You are an expert Staff+ AI architect. Synthesize recent LLM research into a layman recommendation tailored strictly to this user:\n{profile_summary}\n\nThe user needs to know what models are optimal for their task, visualizing tradeoffs (capability vs cost/ease) on a pareto frontier, and a roadmap timeline."},
        {"role": "user", "content": f"Research Context extracted from SQLite FTS5:\n{data_context}\n\nOutputs must adhere to the JSON schema."}
    ]
    
    response = await llm.generate_json(messages, SynthesisResponse)
    return response
