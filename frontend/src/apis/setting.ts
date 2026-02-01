import { request } from "@/utils";

export interface CreateSettingRequest {
  group: string;
  key: string;
  value: string;
}

export interface UpdateSettingRequest {
  group: string;
  key: string;
  value: string;
}

export interface DeleteSettingRequest {
  group: string;
  key: string;
}

export interface GetSettingRequest {
  group: string;
  key: string;
}

export interface Setting {
  group: string;
  key: string;
  value: string;
  created_at: string;
  updated_at: string;
}

export const createSetting = (data: CreateSettingRequest) => request.post('/settings', data);

export const updateSetting = (data: UpdateSettingRequest) => request.put('/settings', data);

export const deleteSetting = (data: DeleteSettingRequest) => request.delete(`/settings/${data.group}/${data.key}`);

export const getSetting = (data: GetSettingRequest) => request.get<Setting>(`/settings/${data.group}/${data.key}`);

export const getSettings = (params?: { group?: string }) => request.get<Setting[]>('/settings', { params });

export interface LLMConfig {
  provider: string;
  openai: {
    api_key: string;
    base_url: string;
    model: string;
    org_id: string;
    api_type: string;
  };
  deepseek: {
    api_key: string;
    base_url: string;
    model: string;
  };
  volce: {
    api_key: string;
    base_url: string;
    model: string;
  };
}

export interface LLMSetting {
  provider: string;
  openai: {
    api_key: string;
    base_url: string;
    model: string;
    org_id: string;
    api_type: string;
  };
  deepseek: {
    api_key: string;
    base_url: string;
    model: string;
  };
  volce: {
    api_key: string;
    base_url: string;
    model: string;
  };
}

export interface UpdateLLMSettingRequest {
  provider: string;
  openai: {
    api_key: string;
    base_url: string;
    model: string;
    org_id: string;
    api_type: string;
  };
  deepseek: {
    api_key: string;
    base_url: string;
    model: string;
  };
  volce: {
    api_key: string;
    base_url: string;
    model: string;
  };
}

export const getLLMSetting = () => request.get<LLMSetting>('/settings/llm');

export const updateLLMSetting = (data: UpdateLLMSettingRequest) => request.put('/settings/llm', data);

export interface ChatLLMConfig {
  openai: {
    api_key: string;
    base_url: string;
    models: string[];
    org_id: string;
    api_type: string;
  };
  deepseek: {
    api_key: string;
    base_url: string;
    models: string[];
  };
  volce: {
    api_key: string;
    base_url: string;
    models: string[];
  };
}

export interface ChatLLMSetting {
  openai: {
    api_key: string;
    base_url: string;
    models: string[];
    org_id: string;
    api_type: string;
  };
  deepseek: {
    api_key: string;
    base_url: string;
    models: string[];
  };
  volce: {
    api_key: string;
    base_url: string;
    models: string[];
  };
}

export interface UpdateChatLLMSettingRequest {
  openai: {
    api_key: string;
    base_url: string;
    models: string[];
    org_id: string;
    api_type: string;
  };
  deepseek: {
    api_key: string;
    base_url: string;
    models: string[];
  };
  volce: {
    api_key: string;
    base_url: string;
    models: string[];
  };
}

export const getChatLLMSetting = (params?: { mask_sensitive?: boolean }) => request.get<ChatLLMSetting>('/settings/chat-llm', { params });

export const updateChatLLMSetting = (data: UpdateChatLLMSettingRequest) => request.put('/settings/chat-llm', data);

export interface FetchLLMModelsRequest {
  provider: string;
  api_key: string;
  base_url?: string;
}
export interface FetchLLMModelsResponse {
  models: string[];
}
export const fetchLLMModels = (data: FetchLLMModelsRequest) => request.post<FetchLLMModelsResponse>('/llm/models/fetch', data, { timeout: 120000 });

export interface AgentConfig {
  name: string;
  prompt: string;
  tools: string[];
}

export interface AgentSetting {
  name: string;
  prompt: string;
  tools: string[];
}

export interface UpdateAgentSettingRequest {
  name: string;
  prompt: string;
  tools: string[];
}

export const getAgentSetting = () => request.get<AgentSetting>('/settings/agent');

export const updateAgentSetting = (data: UpdateAgentSettingRequest) => request.put('/settings/agent', data);

export interface SimpleMemoryConfig {
  max_history_messages: number;
}

export interface MongoDBMemoryConfig {
  uri: string;
  database: string;
  collection: string;
  max_history_messages: number;
}

export interface RedisMemoryConfig {
  host: string;
  port: number;
  username?: string;
  password?: string;
  db: number;
  key_prefix: string;
  max_history_messages: number;
}

export interface SQLiteMemoryConfig {
  dsn: string;
  table_name: string;
  max_history_messages: number;
}

export interface MySQLMemoryConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  table_name: string;
  max_history_messages: number;
}

export interface MemoryConfig {
  provider: string; // simple, mongodb, redis, sqlite, mysql
  simple: SimpleMemoryConfig;
  mongodb: MongoDBMemoryConfig;
  redis: RedisMemoryConfig;
  sqlite: SQLiteMemoryConfig;
  mysql: MySQLMemoryConfig;
}

export interface MemorySetting {
  provider: string;
  simple: SimpleMemoryConfig;
  mongodb: MongoDBMemoryConfig;
  redis: RedisMemoryConfig;
  sqlite: SQLiteMemoryConfig;
  mysql: MySQLMemoryConfig;
}

export interface UpdateMemorySettingRequest {
  provider: string;
  simple: SimpleMemoryConfig;
  mongodb: MongoDBMemoryConfig;
  redis: RedisMemoryConfig;
  sqlite: SQLiteMemoryConfig;
  mysql: MySQLMemoryConfig;
}

export const getMemorySetting = () => request.get<MemorySetting>('/settings/memory');

export const updateMemorySetting = (data: UpdateMemorySettingRequest) => request.put('/settings/memory', data);
