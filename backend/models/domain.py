from pydantic import BaseModel, Field
from typing import List

class DomainQuery(BaseModel):
    query: str = Field(description="A specific search string to find state-of-the-art developments (papers, models, benchmarks) for this domain.")
    rationale: str = Field(description="Why this query is important for the domain.")

class DomainExpansion(BaseModel):
    id: str = Field(description="Unique short identifier")
    name: str = Field(description="Name of the domain area")
    description: str = Field(description="Why this domain is relevant to the query")
    search_queries: List[DomainQuery] = Field(description="Specific queries an agent should run to understand this domain.")
    assumptions: List[str] = Field(description="Explicitly state any underlying technical/business assumptions made when formulating this domain.")
    target_models: List[str] = Field(description="A list of specific LLMs or small models that should be investigated for this domain.")

class DomainExpansionResponse(BaseModel):
    domains: List[DomainExpansion]
    orchestrator_model: str = Field(default="gemini-3-pro-preview", description="The LLM executing the orchestration")
