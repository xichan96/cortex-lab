import { request } from "@/utils";

export interface CreatePromptRequest {
  name: string;
  description?: string;
  content: string;
  config?: string;
}

export interface UpdatePromptRequest {
  id: string;
  description?: string;
  content?: string;
  config?: string;
}

export interface Prompt {
  id: string;
  skill_id: string;
  name: string;
  description: string;
  content: string;
  config?: string;
  status: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export const createPrompt = (skillId: string, data: CreatePromptRequest) => 
  request.post<{ id: string }>(`/skills/${skillId}/prompts`, data);

export const updatePrompt = (skillId: string, promptId: string, data: UpdatePromptRequest) => 
  request.put(`/skills/${skillId}/prompts/${promptId}`, data);

export const deletePrompt = (skillId: string, promptId: string) => 
  request.delete(`/skills/${skillId}/prompts/${promptId}`);

export const getPrompt = (skillId: string, promptId: string) => 
  request.get<Prompt>(`/skills/${skillId}/prompts/${promptId}`);

export const getPromptList = (skillId: string, params?: { name?: string; status?: string }) => 
  request.get<Prompt[]>(`/skills/${skillId}/prompts`, { params });

export const publishPrompt = (skillId: string, promptId: string, description?: string) => 
  request.post(`/skills/${skillId}/prompts/${promptId}/publish`, { description });
