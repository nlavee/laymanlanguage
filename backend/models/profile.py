from pydantic import BaseModel, Field
from typing import List

class QuestionOption(BaseModel):
    id: str
    text: str
    implies_trait: str

class ProfileQuestion(BaseModel):
    id: str
    question_text: str
    options: List[QuestionOption]

class ProfileQuestionnaireResponse(BaseModel):
    questions: List[ProfileQuestion]

class UserTraitDefinition(BaseModel):
    category: str = Field(description="E.g., Role, Technical Skill, Domain Interest")
    value: str = Field(description="E.g., Hobbyist, Advanced, Web Development")

class ProfileSynthesisResponse(BaseModel):
    overall_summary: str = Field(description="A 2-3 sentence summary of the user's technical profile and goals, suitable for LLM persona configuration.")
    traits: List[UserTraitDefinition] = Field(description="Explicit structured traits extracted from the answers.")
