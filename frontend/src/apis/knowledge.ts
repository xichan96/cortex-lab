import { request } from "@/utils";

export interface Experience {
  id: string;
  type: string;
  title: string;
  content: string;
  source_id?: string;
  tags?: string;
  usage_count: number;
  created_at: string;
  created_by: string;
}

export interface CreateExperienceRequest {
  type: string;
  title: string;
  content: string;
  source_id?: string;
  tags?: string;
  role_id?: string;
}

export interface GetExperienceRequest {
  page?: number;
  page_size?: number;
  type?: string;
  keyword?: string;
  role_id?: string;
  q?: string; // Compatible with 'q' parameter
}

export interface UpdateExperienceRequest {
  id: string;
  title?: string;
  content?: string;
  tags?: string;
}

export const getExperiences = (params?: GetExperienceRequest) => request.get<{ list: Experience[]; total: number }>('/experiences/search', { params });
export const createExperience = (data: CreateExperienceRequest) => request.post<{ id: string }>('/experiences', data);
export const getExperience = (id: string) => request.get<Experience>(`/experiences/${id}`);
export const updateExperience = (id: string, data: UpdateExperienceRequest) => request.put(`/experiences/${id}`, data);
export const deleteExperience = (id: string) => request.delete(`/experiences/${id}`);
