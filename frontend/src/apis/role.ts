import { request } from "@/utils";

export interface Role {
  id: string;
  name: string;
  description: string;
  prompt?: string;
  principle?: string;
  tools?: string[];
  tool_config?: {
    builtin?: string[];
    mcp?: {
      url: string;
      tools?: string[];
    }[];
    email_config?: {
      address: string;
      name: string;
      pwd: string;
      host: string;
      port: number;
    };
  };
  is_public?: boolean;
  avatar?: string;
}

export const getRoles = (params?: { page?: number; page_size?: number; keyword?: string; scope?: string }) => 
  request.get<{ list: Role[]; total: number }>('/roles', { params });

export const getRole = (id: string) => request.get<Role>(`/roles/${id}`);

export const createRole = (data: Partial<Role>) => request.post<Role>('/roles', data);

export const updateRole = (id: string, data: Partial<Role>) => request.put<Role>(`/roles/${id}`, data);

export const deleteRole = (id: string) => request.delete(`/roles/${id}`);
