import { request } from "@/utils";
import { User } from "./user";

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export type UserRole = 'admin' | 'user';

export interface UserInfo {
  id: string;
  username: string;
  email?: string;
  avatar_url?: string;
  role?: UserRole;
  created_at?: string;
  updated_at?: string;
}

export const login = (data: LoginRequest) => request.post<LoginResponse>('/auth/login', data);

export const register = (data: LoginRequest) => request.post<LoginResponse>('/auth/register', data);

export const logout = () => request.post('/auth/logout');

export const getCurrentUser = () => request.get<User>('/auth/me');

