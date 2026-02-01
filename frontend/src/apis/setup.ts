import { request } from "@/utils";

export interface InstallRequest {
  db_driver: 'mysql' | 'sqlite';
  host?: string;
  port?: number;
  user?: string;
  password?: string;
  database?: string;
  path?: string;
}

export const checkInstall = () => request.get<{ installed: boolean }>('/setup/check');
export const installSystem = (data: InstallRequest) => request.post('/setup/install', data);
