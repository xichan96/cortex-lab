import { request } from "@/utils";

export interface AgentMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface AgentChatRequest {
  message?: string;
  session_id?: string;
  prompt_config?: string;
  prompt_content?: string;
  prompt_key?: string;
  
  // Legacy/Frontend state fields
  model?: string;
  messages?: AgentMessage[];
  role_id?: string;
  tools?: string[];
  stream?: boolean;
}

export interface AgentChatResponse {
  id?: string;
  choices?: {
    index: number;
    message?: AgentMessage;
    delta?: {
      content?: string;
    };
    finish_reason: string | null;
  }[];
  // Support non-standard OpenAI format (AgentExecutor output)
  output?: string;
}

export interface AgentSessionResponse {
  session_id: string;
}

export const getAgentSession = () =>
  request.post<AgentSessionResponse>("/agent/session");

export const agentChat = (data: AgentChatRequest) =>
  request.post<AgentChatResponse>("/agent/chat", data, { timeout: 120000 });

export const agentStreamChat = (data: AgentChatRequest) =>
  request.post("/agent/chat/stream", { ...data, stream: true }, {
    responseType: "text", // For SSE
  });
