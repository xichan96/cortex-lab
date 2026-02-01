import { request } from "@/utils";
import { useAuthStore } from "@/store";

// Chat Session Types
export interface ChatSession {
  id: string;
  user_id: string;
  role_id: string;
  role_name: string;
  provider: string;
  model_name: string;
  title?: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface GetChatSessionsParams {
  page?: number;
  page_size?: number;
}

export interface GetChatSessionsResponse {
  list: ChatSession[];
  total: number;
  page: number;
  page_size: number;
}

// Chat Message Types
export interface ChatMessageItem {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  role: "user" | "assistant" | "system";
  content: string;
  meta?: any;
  created_at: string;
  updated_at: string;
}

export interface SendChatMessageRequest {
  messages: ChatMessageItem[];
  tools?: string[];
  stream?: boolean;
}

export interface SendChatMessageResponse {
  session_id: string;
  messages: ChatMessage[];
}

export interface GetChatMessagesParams {
  page?: number;
  page_size?: number;
  order?: "asc" | "desc";
}

export interface GetChatMessagesResponse {
  list: ChatMessage[];
  total: number;
  page: number;
  page_size: number;
}

export interface UpdateChatSessionTitleRequest {
  title?: string;
}

// Chat Session APIs
export const getChatSessions = (params?: GetChatSessionsParams) =>
  request.get<GetChatSessionsResponse>("/chat/session", { params });

export const getChatSession = (sessionId: string) =>
  request.get<ChatSession>(`/chat/session/${sessionId}`);

export const updateChatSessionTitle = (sessionId: string, data: UpdateChatSessionTitleRequest) =>
  request.put(`/chat/session/${sessionId}/title`, data);

export const deleteChatSession = (sessionId: string) =>
  request.delete(`/chat/session/${sessionId}`);

// Chat Message APIs
export const sendChatMessage = (
  roleId: string,
  provider: string,
  modelName: string,
  data: SendChatMessageRequest,
  sessionId?: string
) => {
  const headers: Record<string, string> = {};
  if (sessionId) {
    headers["X-Chat-Session-Id"] = sessionId;
  }
  return request.post<SendChatMessageResponse>(
    `/chat/${roleId}/model/${provider}/${modelName}`,
    data,
    { headers, timeout: 120000 }
  );
};

export const getChatMessages = (sessionId: string, params?: GetChatMessagesParams) =>
  request.get<GetChatMessagesResponse>(`/chat/session/${sessionId}/messages`, { params });

// Stream Chat API - Using fetch for better SSE support
export const sendChatMessageStream = async (
  roleId: string,
  provider: string,
  modelName: string,
  data: SendChatMessageRequest,
  sessionId?: string,
  options?: {
    onMessage?: (chunk: any) => void;
    onError?: (error: Error) => void;
    onComplete?: (sessionId?: string) => void;
    signal?: AbortSignal;
  }
): Promise<string | undefined> => {
  const { token } = useAuthStore.getState();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  
  if (token) {
    headers["X-JWT"] = token;
  }
  if (sessionId) {
    headers["X-Chat-Session-Id"] = sessionId;
  }

  const url = `/api/chat/${roleId}/model/${provider}/${modelName}/stream`;
  
  try {
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({ ...data, stream: true }),
      signal: options?.signal,
    });

    if (!response.ok) {
      const error = new Error(`HTTP error! status: ${response.status}`);
      options?.onError?.(error);
      throw error;
    }

    // Get session ID from response header
    const finalSessionId = response.headers.get("X-Chat-Session-Id") || sessionId;
    
    // If we got a new session ID (either new session or different from what we sent), notify immediately
    if (finalSessionId && (!sessionId || finalSessionId !== sessionId) && options?.onMessage) {
      options.onMessage({ type: 'session', sessionId: finalSessionId });
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    
    if (!reader) {
      throw new Error("Response body is not readable");
    }

    let buffer = "";
    let isDone = false;

    while (!isDone) {
      const { done, value } = await reader.read();
      
      if (done) {
        isDone = true;
        options?.onComplete?.(finalSessionId || undefined);
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (line.trim() === "") continue;
        
        if (line.startsWith("data: ")) {
          const dataStr = line.slice(6).trim();
          
          if (dataStr === "[DONE]") {
            isDone = true;
            options?.onComplete?.(finalSessionId || undefined);
            break;
          }

          try {
            const parsed = JSON.parse(dataStr);
            options?.onMessage?.(parsed);
          } catch (e) {
            console.error("Error parsing SSE data:", e, dataStr);
          }
        }
      }
    }

    return finalSessionId || undefined;
  } catch (error: any) {
    if (error.name === "AbortError") {
      return undefined;
    }
    options?.onError?.(error);
    throw error;
  }
};
