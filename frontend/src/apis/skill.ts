import { request } from "@/utils";

export interface CreateSkillRequest {
  name: string;
  description?: string;
}

export interface UpdateSkillRequest {
  id: string;
  name?: string;
  description?: string;
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export const createSkill = (data: CreateSkillRequest) => request.post<{ id: string }>('/skills', data);

export const updateSkill = (skillId: string, data: UpdateSkillRequest) => request.put(`/skills/${skillId}`, data);

export const deleteSkill = (skillId: string) => request.delete(`/skills/${skillId}`);

export const getSkills = () => request.get<Skill[]>('/skills');
