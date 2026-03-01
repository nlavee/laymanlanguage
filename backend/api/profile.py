from fastapi import APIRouter, Depends
from backend.models.profile import ProfileQuestionnaireResponse, ProfileSynthesisResponse
from backend.llm.gemini import GeminiProvider
from backend.storage.profile_manager import profile_manager
from backend.core.auth_utils import get_current_user

router = APIRouter(prefix="/api/profile", tags=["profile"])

def get_llm():
    return GeminiProvider()

@router.get("/questions", response_model=ProfileQuestionnaireResponse)
async def get_questions(llm: GeminiProvider = Depends(get_llm)):
    messages = [
        {"role": "system", "content": "You are an expert AI profiling users to understand their technical background (e.g. Hobbyist, Enterprise, Researcher) and domain of interest. Generate highly targeted and intuitive questions."},
        {"role": "user", "content": "Generate exactly 3 multiple choice questions to accurately determine my technical profile, code proficiency, and how I intend to use LLMs."}
    ]
    response = await llm.generate_json(messages, ProfileQuestionnaireResponse)
    return response

@router.post("/save")
async def save_profile(answers: dict, llm: GeminiProvider = Depends(get_llm), current_user: dict = Depends(get_current_user)):
    messages = [
        {"role": "system", "content": "You are an expert AI synthesizing user characteristics into explicit structured traits."},
        {"role": "user", "content": f"Based on the following answers to the profiling questions, synthesize a detailed profile summary and explicitly define the traits. Answers chosen: {answers}"}
    ]
    synthesis: ProfileSynthesisResponse = await llm.generate_json(messages, ProfileSynthesisResponse)
    
    traits_dict = {t.category: t.value for t in synthesis.traits}
    profile_manager.save_profile(current_user["username"], synthesis.overall_summary, traits_dict)
    
    return {"status": "success", "profile": profile_manager.load_profile(current_user["username"])}

@router.get("/")
def get_current_profile(current_user: dict = Depends(get_current_user)):
    return profile_manager.load_profile(current_user["username"])

@router.delete("/trait/{trait_category}")
def delete_trait(trait_category: str, current_user: dict = Depends(get_current_user)):
    success = profile_manager.delete_trait(current_user["username"], trait_category)
    return {"status": "success" if success else "not_found"}

@router.delete("/")
def reset_profile(current_user: dict = Depends(get_current_user)):
    profile_manager.reset_profile(current_user["username"])
    return {"status": "success"}
