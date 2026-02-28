from pydantic import BaseModel, Field
from typing import List

class DomainQuery(BaseModel):
    query: str = Field(description="A specific search string to find state-of-the-art developments (papers, models, benchmarks) for this domain.")
    rationale: str = Field(description="Why this query is important for the domain.")

class DomainExpansion(BaseModel):
    id: str = Field(description="Unique snake_case identifier")
    name: str = Field(description="Human readable name of the technical subdomain")
    description: str = Field(description="Brief description of what this domain entails regarding the user's task")
    search_queries: List[DomainQuery] = Field(description="2-3 specific queries to run against external knowledge bases")

class DomainExpansionResponse(BaseModel):
    domains: List[DomainExpansion]
