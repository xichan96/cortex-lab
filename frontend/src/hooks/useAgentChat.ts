import { useState, useRef, useCallback, useEffect } from 'react';
import { getAgentSession, AgentChatRequest, AgentMessage } from '@/apis/agent';
import { useAuthStore } from '@/store';
import { v4 as uuidv4 } from 'uuid';

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  streaming?: boolean;
}

interface ChatCache {
  sessionId: string;
  messages: Message[];
  model?: string;
  roleId?: string;
  tools?: string[];
}

const STORAGE_KEY = 'agent_chat_cache';

export interface UseAgentChatOptions {
  onAgentMessageComplete?: (content: string, userMessage: string) => void;
  id?: string;
  initialModel?: string;
  initialRoleId?: string;
  initialTools?: string[];
  promptKey?: string;
}

export function useAgentChat(options?: UseAgentChatOptions) {
  const { onAgentMessageComplete, id } = options || {};
  const [agentMessage, setAgentMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [sending, setSending] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  
  // Configuration State
  const [model, setModel] = useState(options?.initialModel || 'gpt-4');
  const [roleId, setRoleId] = useState<string | undefined>(options?.initialRoleId);
  const [tools, setTools] = useState<string[]>(options?.initialTools || []);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const sessionIdRef = useRef<string>('');
  const token = useAuthStore((state) => state.token);

  const getStorageKey = useCallback(() => {
    return id ? `${STORAGE_KEY}_${id}` : STORAGE_KEY;
  }, [id]);

  const loadCache = useCallback((): ChatCache | null => {
    try {
      const cached = localStorage.getItem(getStorageKey());
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (error) {
      console.error('Failed to load chat cache:', error);
    }
    return null;
  }, [getStorageKey]);

  const saveCache = useCallback((data: ChatCache) => {
    try {
      localStorage.setItem(getStorageKey(), JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save chat cache:', error);
    }
  }, [getStorageKey]);

  const clearCache = useCallback(() => {
    try {
      localStorage.removeItem(getStorageKey());
    } catch (error) {
      console.error('Failed to clear chat cache:', error);
    }
  }, [getStorageKey]);

  // Initialize session and load cache
  useEffect(() => {
    const initSession = async () => {
      const cached = loadCache();
      if (cached) {
        setSessionId(cached.sessionId);
        sessionIdRef.current = cached.sessionId;
        setMessages(cached.messages);
        if (cached.model) setModel(cached.model);
        if (cached.roleId) setRoleId(cached.roleId);
        if (cached.tools) setTools(cached.tools);
      } else {
        try {
          const res = await getAgentSession();
          setSessionId(res.session_id);
          sessionIdRef.current = res.session_id;
        } catch (e) {
          console.error('Failed to init session', e);
          // Fallback to local uuid if API fails
          const newId = uuidv4();
          setSessionId(newId);
          sessionIdRef.current = newId;
        }
      }
    };
    initSession();
  }, [loadCache]);

  // Scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Save cache on change
  useEffect(() => {
    if (sessionId || messages.length > 0) {
      saveCache({ sessionId, messages, model, roleId, tools });
    }
  }, [sessionId, messages, model, roleId, tools, saveCache]);

  const sendMessageInternal = useCallback(async (content: string) => {
    if (!content.trim() || sending) return;

    const userMsg: Message = { 
      id: uuidv4(), 
      role: 'user', 
      content 
    };

    const assistantMsgId = uuidv4();
    const assistantMsg: Message = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      streaming: true,
    };

    setMessages(prev => [...prev, userMsg, assistantMsg]);
    setSending(true);

    try {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      let currentSessionId = sessionIdRef.current || sessionId;
      if (!currentSessionId) {
        try {
          const res = await getAgentSession();
          currentSessionId = res.session_id;
          setSessionId(currentSessionId);
          sessionIdRef.current = currentSessionId;
        } catch (e) {
          console.error('Failed to get session id', e);
          const newId = uuidv4();
          currentSessionId = newId;
          setSessionId(newId);
          sessionIdRef.current = newId;
        }
      }
      
      const promptConfig = model ? JSON.stringify({ model: { name: model } }) : undefined;

      const reqData: AgentChatRequest = {
        session_id: currentSessionId,
        message: content,
        prompt_config: promptConfig,
        role_id: roleId,
        prompt_key: options?.promptKey,
      };

      let currentResponse = '';
      
      const response = await fetch('/api/agent/chat/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(reqData),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      if (reader) {
        let isDone = false;
        while (!isDone) {
          const { done, value } = await reader.read();
          if (done) {
            isDone = true;
            break;
          }

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.trim() === '') continue;
            
            if (line.startsWith('data: ')) {
              const data = line.slice(6).trim();
              if (data === '[DONE]') {
                setMessages(prev => {
                  const updated = prev.map(m => 
                    m.id === assistantMsgId ? { ...m, streaming: false } : m
                  );
                  return updated;
                });
                onAgentMessageComplete?.(currentResponse, content);
                continue;
              }

              try {
                const parsed = JSON.parse(data);

                // Update session id if provided in response
                if (parsed.data?.session_id) {
                  const newSessionId = parsed.data.session_id;
                  if (newSessionId !== currentSessionId) {
                    currentSessionId = newSessionId;
                    sessionIdRef.current = newSessionId;
                    setSessionId(newSessionId);
                  }
                }

                // Handle different response formats (nested data or direct content)
                let delta = '';
                if (parsed.data?.content !== undefined) {
                  delta = parsed.data.content;
                } else if (parsed.choices?.[0]?.delta?.content !== undefined) {
                  delta = parsed.choices[0].delta.content;
                } else if (parsed.content !== undefined) {
                  delta = parsed.content;
                }

                if (delta) {
                  currentResponse += delta;
                  setMessages(prev => prev.map(m => {
                    if (m.id === assistantMsgId) {
                      return { ...m, content: m.content + delta };
                    }
                    return m;
                  }));
                }
              } catch (e) {
                console.error('Error parsing SSE data:', e);
              }
            }
          }
        }
      }
    } catch (err: any) {
      if (err.name === 'AbortError') return;
      console.error('Chat failed:', err);
      setMessages(prev => prev.map(m => 
        m.id === assistantMsgId ? { ...m, streaming: false, content: m.content + '\n[Error: Connection Failed]' } : m
      ));
    } finally {
      setSending(false);
      abortControllerRef.current = null;
    }
  }, [sending, sessionId, onAgentMessageComplete, model, roleId, options?.promptKey, token]);

  const handleSendMessage = useCallback(async () => {
    if (!agentMessage.trim()) return;
    const currentMessage = agentMessage;
    setAgentMessage('');
    await sendMessageInternal(currentMessage);
  }, [agentMessage, sendMessageInternal]);

  const sendMessageDirectly = useCallback(async (content: string) => {
    await sendMessageInternal(content);
  }, [sendMessageInternal]);

  const handleClearContext = () => {
    setMessages([]);
    clearCache();
    // Re-init session
    getAgentSession().then(res => {
      setSessionId(res.session_id);
      sessionIdRef.current = res.session_id;
    });
  };

  const stopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setSending(false);
      setMessages(prev => prev.map(m => ({ ...m, streaming: false })));
    }
  };

  return {
    agentMessage,
    setAgentMessage,
    messages,
    sending,
    model,
    setModel,
    roleId,
    setRoleId,
    tools,
    setTools,
    messagesEndRef,
    handleSendMessage,
    sendMessageDirectly,
    handleClearContext,
    stopGeneration,
  };
}
