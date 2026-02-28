from pydantic import BaseModel, Field
from typing import List

class ModelRank(BaseModel):
    model_name: str
    capabilities_score: int = Field(ge=0, le=100)
    ease_of_use_score: int = Field(ge=0, le=100)
    cost_efficiency_score: int = Field(ge=0, le=100)
    rationale: str

class ParetoDataPoint(BaseModel):
    name: str
    x: int = Field(description="Ease of use score (0-100)")
    y: int = Field(description="Capabilities score (0-100)")

class TimelineEvent(BaseModel):
    title: str = Field(description="Milestone or feature requirement")
    description: str
    date: str = Field(description="Estimated timeline length or stage (e.g. 'Month 1' or 'Phase 1')")

class SynthesisResponse(BaseModel):
    summary: str = Field(description="Executive Layman translation of what models suit the user best based on their profile and domain.")
    ranked_models: List[ModelRank]
    pareto_data: List[ParetoDataPoint]
    historical_timeline: List[TimelineEvent] = Field(description="Historical breakthroughs in this domain")
    implementation_timeline: List[TimelineEvent] = Field(description="Projected roadmap implementation")
