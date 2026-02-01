import { request } from '@/utils';

export interface MCPTool {
  name: string;
  description: string;
}

export const fetchMCPTools = (url: string) => {
  return request.post<{ tools: MCPTool[] }>('/mcp/tools/fetch', { url }, { timeout: 120000 });
};
