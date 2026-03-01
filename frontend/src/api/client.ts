import axios from 'axios';

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000',
});

export interface QuestionOption {
  id: string;
  text: string;
  implies_trait: string;
}

export interface ProfileQuestion {
  id: string;
  question_text: string;
  options: QuestionOption[];
}

export interface ProfileQuestionnaireResponse {
  questions: ProfileQuestion[];
}

export interface ProfileResponse {
  metadata: {
    traits: Record<string, string>;
  };
  body: string;
}

export const fetchProfile = async (): Promise<ProfileResponse | null> => {
    const res = await apiClient.get('/api/profile/');
    return res.data;
}

export const fetchQuestions = async (): Promise<ProfileQuestionnaireResponse> => {
    const res = await apiClient.get('/api/profile/questions');
    return res.data;
}

export const saveProfile = async (answers: Record<string, QuestionOption>): Promise<ProfileResponse> => {
    const res = await apiClient.post('/api/profile/save', answers);
    return res.data.profile;
}

export const resetProfile = async (): Promise<void> => {
    await apiClient.delete('/api/profile/');
}

export interface DomainQuery {
    query: string;
    rationale: string;
}

export interface DomainExpansion {
    id: string;
    name: string;
    description: string;
    search_queries: DomainQuery[];
    assumptions: string[];
    target_models: string[];
}

export interface WorkspaceResponse {
    status: string;
    workspace_id: string;
    query: string;
    domains: DomainExpansion[];
    orchestrator_model: string;
    synthesis_model: string;
}

export const ingestTask = async (query: string, model_id: string): Promise<WorkspaceResponse> => {
    const res = await apiClient.post('/api/workspace/ingest', { query, model_id });
    return res.data;
}

export const getWorkspace = async (workspaceId: string): Promise<WorkspaceResponse> => {
    const res = await apiClient.get(`/api/workspace/${workspaceId}`);
    return res.data.workspace;
}

export const startOrchestration = async (workspaceId: string): Promise<unknown> => {
    const res = await apiClient.post('/api/orchestrator/start', { workspace_id: workspaceId });
    return res.data;
}

export interface ModelRank {
    model_name: string;
    capabilities_score: number;
    ease_of_use_score: number;
    cost_efficiency_score: number;
    rationale: string;
}

export interface ParetoDataPoint {
    name: string;
    x: number;
    y: number;
}

export interface TimelineEvent {
    title: string;
    description: string;
    date: string;
}

export interface SynthesisResponse {
    summary: string;
    ranked_models: ModelRank[];
    pareto_data: ParetoDataPoint[];
    historical_timeline: TimelineEvent[];
    implementation_timeline: TimelineEvent[];
}

export const getSynthesis = async (workspaceId: string): Promise<SynthesisResponse> => {
    const res = await apiClient.get(`/api/synthesis/${workspaceId}`);
    return res.data;
}
