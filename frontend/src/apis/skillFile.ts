import { request } from "@/utils";

export interface SkillFile {
  id: string;
  skill_id: string;
  name: string;
  description: string;
  content: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface CreateSkillFileRequest {
  name: string;
  description?: string;
  content: string;
}

export interface UpdateSkillFileRequest {
  name?: string;
  description?: string;
  content?: string;
}

export const createSkillFile = (skillId: string, data: CreateSkillFileRequest) => 
  request.post<{ id: string }>(`/skills/${skillId}/files`, data);

export const updateSkillFile = (skillId: string, fileId: string, data: UpdateSkillFileRequest) => 
  request.put(`/skills/${skillId}/files/${fileId}`, data);

export const deleteSkillFile = (skillId: string, fileId: string) => 
  request.delete(`/skills/${skillId}/files/${fileId}`);

export const getSkillFile = (skillId: string, fileId: string) => 
  request.get<SkillFile>(`/skills/${skillId}/files/${fileId}`);

export const getSkillFileList = (skillId: string) => 
  request.get<SkillFile[]>(`/skills/${skillId}/files`);
