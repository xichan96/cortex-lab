import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Button, Input, Popconfirm, Tooltip, message as antMessage } from 'antd';
import { PlusOutlined, DeleteOutlined, MessageOutlined, FormOutlined, HistoryOutlined } from '@ant-design/icons';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import CollapseIcon from './CollapseIcon';
import { v4 as uuidv4 } from 'uuid';
import { getRoles, Role } from '@/apis/role';
import { useI18n } from '@/hooks/useI18n';
import { useChatLLMSettings } from '@/hooks/useChatLLMSettings';
import { sendChatMessageStream, getChatSessions, getChatMessages, deleteChatSession, ChatSession, ChatMessage as ChatMessageType } from '@/apis/chat';
import styles from './index.module.scss';

type MsgRole = 'user' | 'assistant' | 'system';

interface Message {
  id: string;
  role: MsgRole;
  content: string;
  streaming?: boolean;
}

interface SessionItem {
  id: string;
  roleId?: string;
  roleName?: string;
  provider?: string;
  modelName?: string;
  title?: string;
  createdAt: number;
  messages: Message[];
}

const SESSIONS_KEY = 'chat_sessions';
const LAST_SESSION_KEY = 'chat_last_session';
const LAST_ROLE_ID_KEY = 'chat_last_role_id';
const LAST_MODEL_KEY = 'chat_last_model';

export default function SessionManager() {
  const { t } = useI18n();
  const { setting } = useChatLLMSettings({ maskSensitive: true });
  const [roles, setRoles] = useState<Role[]>([]);
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [currentId, setCurrentId] = useState<string | undefined>(undefined);
  const [currentModel, setCurrentModel] = useState<string>('');
  const [currentRoleId, setCurrentRoleId] = useState<string | undefined>(undefined);
  const [configLocked, setConfigLocked] = useState(false);
  const [collapsed, setCollapsed] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentSessionIdRef = useRef<string | undefined>(undefined);

  const models = useMemo(() => {
    if (!setting) return [];
    const list: { provider: string; model: string }[] = [];
    if (setting.openai?.models) list.push(...setting.openai.models.map(m => ({ provider: 'openai', model: m })));
    if (setting.deepseek?.models) list.push(...setting.deepseek.models.map(m => ({ provider: 'deepseek', model: m })));
    if (setting.volce?.models) list.push(...setting.volce.models.map(m => ({ provider: 'volce', model: m })));
    return list;
  }, [setting]);

  const currentRole = useMemo(() => roles.find(r => r.id === currentRoleId), [roles, currentRoleId]);
  const currentSession = useMemo(() => sessions.find(s => s.id === currentId), [sessions, currentId]);
  const currentMessages = useMemo(() => currentSession?.messages || [], [currentSession]);

  useEffect(() => {
    const loadSessions = async () => {
      try {
        const response = await getChatSessions({ page: 1, page_size: 100 });
        if (response?.list) {
          const serverSessions: SessionItem[] = response.list.map((s: ChatSession) => ({
            id: s.id,
            roleId: s.role_id,
            roleName: s.role_name,
            provider: s.provider,
            modelName: s.model_name,
            title: s.title || undefined,
            createdAt: new Date(s.created_at).getTime(),
            messages: [],
          }));
          setSessions(serverSessions);
          
          const last = localStorage.getItem(LAST_SESSION_KEY) || undefined;
          if (last && serverSessions.some(s => s.id === last)) {
            setCurrentId(last);
          }
        }
      } catch (error) {
        console.error('Failed to load sessions:', error);
        try {
          const raw = localStorage.getItem(SESSIONS_KEY);
          if (raw) {
            const parsed: SessionItem[] = JSON.parse(raw);
            setSessions(parsed);
          }
          const last = localStorage.getItem(LAST_SESSION_KEY) || undefined;
          if (last) setCurrentId(last);
        } catch {}
      }
    };
    loadSessions();
  }, []);

  useEffect(() => {
    getRoles()
      .then(res => setRoles(res.list || []))
      .catch(() =>
        setRoles([
          { id: 'r_architect', name: 'Architect', description: 'System Architect', tools: ['file'] },
          { id: 'r_coder', name: 'Coder', description: 'Senior Developer', tools: ['command'] },
          { id: 'r_writer', name: 'Writer', description: 'Content Creator', tools: ['send_email'] },
        ])
      );
  }, []);

  useEffect(() => {
    if (roles.length > 0 && models.length > 0 && currentId) {
      const session = sessions.find(s => s.id === currentId);
      if (session) {
        if (session.roleId && roles.some(r => r.id === session.roleId)) {
          if (currentRoleId !== session.roleId) {
            setCurrentRoleId(session.roleId);
            try {
              localStorage.setItem(LAST_ROLE_ID_KEY, session.roleId);
            } catch {}
          }
        }
        if (session.modelName && models.some(m => m.model === session.modelName)) {
          if (currentModel !== session.modelName) {
            setCurrentModel(session.modelName);
            try {
              localStorage.setItem(LAST_MODEL_KEY, session.modelName);
            } catch {}
          }
        }
      }
    }
  }, [roles, models, sessions, currentId]);

  useEffect(() => {
    if (roles.length > 0 && !currentRoleId && !currentId) {
      const cachedRoleId = localStorage.getItem(LAST_ROLE_ID_KEY);
      const roleId = cachedRoleId && roles.some(r => r.id === cachedRoleId) 
        ? cachedRoleId 
        : roles[0].id;
      setCurrentRoleId(roleId);
    }
  }, [roles, currentRoleId, currentId]);

  useEffect(() => {
    if (models.length > 0 && !models.some(m => m.model === currentModel) && !currentId) {
      const cachedModel = localStorage.getItem(LAST_MODEL_KEY);
      const model = cachedModel && models.some(m => m.model === cachedModel)
        ? cachedModel
        : models[0].model;
      setCurrentModel(model);
    }
  }, [models, currentModel, currentId]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [currentMessages]);

  useEffect(() => {
    currentSessionIdRef.current = currentId;
  }, [currentId]);

  const persist = (next: SessionItem[]) => {
    setSessions(next);
    try {
      localStorage.setItem(SESSIONS_KEY, JSON.stringify(next));
    } catch {}
  };

  const setCurrent = async (id?: string) => {
    setCurrentId(id);
    currentSessionIdRef.current = id;
    try {
      if (id) {
        setConfigLocked(true);
        localStorage.setItem(LAST_SESSION_KEY, id);
        const session = sessions.find(s => s.id === id);
        if (session) {
          if (session.roleId && roles.length > 0 && roles.some(r => r.id === session.roleId)) {
            setCurrentRoleId(session.roleId);
            try {
              localStorage.setItem(LAST_ROLE_ID_KEY, session.roleId);
            } catch {}
          } else if (roles.length > 0) {
            const fallbackRoleId = roles[0].id;
            setCurrentRoleId(fallbackRoleId);
            try {
              localStorage.setItem(LAST_ROLE_ID_KEY, fallbackRoleId);
            } catch {}
          }
          if (session.modelName && models.length > 0 && models.some(m => m.model === session.modelName)) {
            setCurrentModel(session.modelName);
            try {
              localStorage.setItem(LAST_MODEL_KEY, session.modelName);
            } catch {}
          }
          if (session.messages.length === 0) {
            try {
              const response = await getChatMessages(id, { page: 1, page_size: 100, order: 'asc' });
              if (response?.list) {
                const messages: Message[] = response.list.map((m: ChatMessageType) => ({
                  id: m.id,
                  role: m.role as MsgRole,
                  content: filterToolResults(m.content),
                  streaming: false,
                }));
                setSessions(prev => prev.map(s => 
                  s.id === id ? { ...s, messages } : s
                ));
                setTimeout(() => {
                  if (messagesEndRef.current) {
                    messagesEndRef.current.scrollIntoView({ behavior: 'auto' });
                  }
                }, 100);
              }
            } catch (error) {
              console.error('Failed to load messages:', error);
            }
          } else {
            setTimeout(() => {
              if (messagesEndRef.current) {
                messagesEndRef.current.scrollIntoView({ behavior: 'auto' });
              }
            }, 100);
          }
        }
      } else {
        localStorage.removeItem(LAST_SESSION_KEY);
      }
    } catch {}
  };

  const handleNewSession = () => {
    setCurrent(undefined);
    setConfigLocked(false);
    if (roles.length > 0) {
      const cachedRoleId = localStorage.getItem(LAST_ROLE_ID_KEY);
      const roleId = cachedRoleId && roles.some(r => r.id === cachedRoleId) 
        ? cachedRoleId 
        : roles[0].id;
      setCurrentRoleId(roleId);
    }
    if (models.length > 0) {
      const cachedModel = localStorage.getItem(LAST_MODEL_KEY);
      const model = cachedModel && models.some(m => m.model === cachedModel)
        ? cachedModel
        : models[0].model;
      setCurrentModel(model);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        handleNewSession();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNewSession]);


  const guessProvider = (model: string) => {
    const m = models.find(x => x.model === model);
    return m?.provider || 'custom';
  };

  const titleFromFirstMessage = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return '未命名会话';
    const noBreak = trimmed.replace(/\n+/g, ' ');
    return noBreak.slice(0, 20);
  };

  const filterToolResults = (content: string): string => {
    if (!content) return content;
    
    let filtered = content;
    
    const jsonToolPatterns = [
      /\[\s*\{\s*"id"\s*:\s*"[^"]*"\s*,\s*"type"\s*:\s*"function"[^\]]*\]\s*/g,
      /\[\s*\{\s*"type"\s*:\s*"function"[^\]]*\]\s*/g,
      /\[\s*\{\s*"function"\s*:\s*\{[^}]*"name"[^\]]*\]\s*/g,
      // Handle cases where type might be empty (e.g. streaming artifacts)
      /\[\s*\{\s*"type"\s*:\s*""\s*,\s*"function"[^\]]*\]\s*/g,
    ];
    
    for (const pattern of jsonToolPatterns) {
      filtered = filtered.replace(pattern, '');
    }
    
    const lines = filtered.split('\n');
    const filteredLines: string[] = [];
    let skipNext = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();
      
      if (skipNext) {
        skipNext = false;
        continue;
      }
      
      const isToolLine = 
        trimmed.startsWith('Tool:') ||
        trimmed.startsWith('Tool ') ||
        trimmed.includes('Tool execution result:') ||
        trimmed.match(/^Tool\s+\w+.*returned:/i) ||
        trimmed.match(/^Tool\s+\w+.*execution failed:/i);
      
      const isJsonToolLine = 
        (trimmed.startsWith('[') || trimmed.startsWith('{')) &&
        trimmed.includes('"type"') &&
        trimmed.includes('"function"');
      
      if (isToolLine || isJsonToolLine) {
        if (i + 1 < lines.length && !lines[i + 1].trim()) {
          skipNext = true;
        }
        continue;
      }
      
      filteredLines.push(line);
    }
    
    let result = filteredLines.join('\n');
    result = result.replace(/\n{3,}/g, '\n\n');
    
    return result.trim();
  };

  const handleSend = async (content: string) => {
    if (!currentRoleId || !currentModel) {
      antMessage.error('请选择角色和模型');
      return;
    }

    const session = currentSession;
    const isNewSession = !session;
    const sessionId = session?.id;
    
    if (isNewSession) {
      setConfigLocked(true);
    }

    const provider = guessProvider(currentModel);
    const userMsg: Message = { id: uuidv4(), role: 'user', content };
    const aiMsgId = uuidv4();
    const aiMsg: Message = { id: aiMsgId, role: 'assistant', content: '', streaming: true };

    const historyMessages = session?.messages.map(m => ({
      role: m.role,
      content: m.content,
    })) || [];

    const messages = [...historyMessages, { role: 'user' as const, content }];

    let finalSessionId: string | undefined = sessionId;
    let hasEnded = false;
    let tempSessionId: string | undefined = undefined;

    if (sessionId) {
      currentSessionIdRef.current = sessionId;
      setSessions(prev => {
        const updated = prev.map(s => {
          if (s.id === sessionId) {
            return { ...s, messages: [...s.messages, userMsg, aiMsg] };
          }
          return s;
        });
        try {
          localStorage.setItem(SESSIONS_KEY, JSON.stringify(updated));
        } catch {}
        return updated;
      });
    } else if (isNewSession) {
      tempSessionId = uuidv4();
      currentSessionIdRef.current = tempSessionId;
      const tempSession: SessionItem = {
        id: tempSessionId,
        roleId: currentRoleId,
        roleName: currentRole?.name,
        provider: provider,
        modelName: currentModel,
        createdAt: Date.now(),
        title: undefined,
        messages: [userMsg, aiMsg],
      };
      setCurrent(tempSessionId);
      setSessions(prev => {
        const updated = [tempSession, ...prev];
        try {
          localStorage.setItem(SESSIONS_KEY, JSON.stringify(updated));
        } catch {}
        return updated;
      });
    }

    try {
      const abortController = new AbortController();
      
      finalSessionId = await sendChatMessageStream(
        currentRoleId!,
        provider,
        currentModel,
        { messages, stream: true },
        sessionId || undefined,
        {
          onMessage: (chunk: any) => {
            if (chunk.type === 'session') {
              const newSessionId = chunk.sessionId;
              if (newSessionId) {
                const oldTempId = tempSessionId;
                tempSessionId = newSessionId;
                currentSessionIdRef.current = newSessionId;
                
                if (isNewSession && oldTempId) {
                  setCurrent(newSessionId);
                  setSessions(prev => {
                    const updated = prev.map(s => {
                      if (s.id === oldTempId) {
                        return { ...s, id: newSessionId };
                      }
                      return s;
                    });
                    try {
                      localStorage.setItem(SESSIONS_KEY, JSON.stringify(updated));
                    } catch {}
                    return updated;
                  });
                } else if (sessionId && sessionId !== newSessionId) {
                  setSessions(prev => prev.map(s => 
                    s.id === sessionId ? { ...s, id: newSessionId } : s
                  ));
                  setCurrent(newSessionId);
                }
              }
            } else if (chunk.type === 'chunk') {
              const delta = chunk.content || '';
              if (delta) {
                setSessions(prev => {
                  const currentId = currentSessionIdRef.current || tempSessionId || sessionId;
                  if (!currentId) return prev;
                  
                  const updated = prev.map(s => {
                    if (s.id !== currentId) return s;
                    const aiMsgExists = s.messages.some(m => m.id === aiMsgId);
                    let msgs: Message[];
                    if (aiMsgExists) {
                      msgs = s.messages.map(m => {
                        if (m.id === aiMsgId) {
                          const newContent = m.content + delta;
                          return { ...m, streaming: true, content: newContent };
                        }
                        return m;
                      });
                    } else {
                      msgs = [...s.messages, { ...aiMsg, content: delta, streaming: true }];
                    }
                    return { ...s, messages: msgs };
                  });
                  return updated;
                });
              }
            } else if (chunk.type === 'error') {
              hasEnded = true;
              const errorMsg = chunk.error || '未知错误';
              antMessage.error('发送消息失败: ' + errorMsg);
              setSessions(prev => {
                const currentId = currentSessionIdRef.current || tempSessionId || sessionId;
                if (!currentId) return prev;
                const updated = prev.map(s => {
                  if (s.id !== currentId) return s;
                  const msgs = s.messages.map(m => {
                    if (m.id === aiMsgId) {
                      const rawContent = m.content || '发送失败，请重试';
                      const filteredContent = filterToolResults(rawContent);
                      return { ...m, streaming: false, content: filteredContent };
                    }
                    return m;
                  });
                  return { ...s, messages: msgs };
                });
                try {
                  localStorage.setItem(SESSIONS_KEY, JSON.stringify(updated));
                } catch {}
                return updated;
              });
            } else if (chunk.type === 'end') {
              hasEnded = true;
              setSessions(prev => {
                const currentId = currentSessionIdRef.current || tempSessionId || sessionId;
                if (!currentId) return prev;
                const updated = prev.map(s => {
                  if (s.id !== currentId) return s;
                  const msgs = s.messages.map(m => {
                    if (m.id === aiMsgId) {
                      const rawContent = m.content || '无响应';
                      const filteredContent = filterToolResults(rawContent);
                      return { ...m, streaming: false, content: filteredContent };
                    }
                    return m;
                  });
                  const title = s.title ?? titleFromFirstMessage(content);
                  return { ...s, messages: msgs, title };
                });
                try {
                  localStorage.setItem(SESSIONS_KEY, JSON.stringify(updated));
                } catch {}
                return updated;
              });
            }
          },
          onError: (error: Error) => {
            hasEnded = true;
            console.error('Chat stream error:', error);
            antMessage.error('发送消息失败: ' + error.message);
            setSessions(prev => {
              const currentId = currentSessionIdRef.current || tempSessionId || sessionId;
              if (!currentId) return prev;
              const updated = prev.map(s => {
                if (s.id !== currentId) return s;
                const msgs = s.messages.map(m => {
                  if (m.id === aiMsgId) {
                    const rawContent = m.content || '发送失败，请重试';
                    const filteredContent = filterToolResults(rawContent);
                    return { ...m, streaming: false, content: filteredContent };
                  }
                  return m;
                });
                return { ...s, messages: msgs };
              });
              try {
                localStorage.setItem(SESSIONS_KEY, JSON.stringify(updated));
              } catch {}
              return updated;
            });
          },
          onComplete: (newSessionId?: string) => {
            if (hasEnded) return;
            hasEnded = true;
            
            if (newSessionId) {
              finalSessionId = newSessionId;
              currentSessionIdRef.current = newSessionId;
              tempSessionId = newSessionId;
              
              if (isNewSession) {
                setCurrent(newSessionId);
              }
              
              setSessions(prev => {
                let updated = prev;
                const targetId = newSessionId;
                
                if (isNewSession) {
                  const sessionExists = prev.some(s => s.id === targetId);
                  if (!sessionExists) {
                    updated = [{
                      id: targetId,
                      roleId: currentRoleId,
                      roleName: currentRole?.name,
                      provider: provider,
                      modelName: currentModel,
                      createdAt: Date.now(),
                      title: undefined,
                      messages: [userMsg, aiMsg],
                    }, ...prev];
                  }
                } else if (sessionId && sessionId !== newSessionId) {
                  updated = prev.map(s => {
                    if (s.id === sessionId) {
                      return { ...s, id: newSessionId };
                    }
                    return s;
                  });
                }
                
                updated = updated.map(s => {
                  if (s.id !== targetId) return s;
                  const msgs = s.messages.map(m => {
                    if (m.id === aiMsgId) {
                      const rawContent = m.content || '无响应';
                      const filteredContent = filterToolResults(rawContent);
                      return { ...m, streaming: false, content: filteredContent };
                    }
                    return m;
                  });
                  const title = s.title ?? titleFromFirstMessage(content);
                  return { ...s, messages: msgs, title };
                });
                try {
                  localStorage.setItem(SESSIONS_KEY, JSON.stringify(updated));
                } catch {}
                return updated;
              });
            } else if (sessionId) {
              setSessions(prev => {
                const updated = prev.map(s => {
                  if (s.id !== sessionId) return s;
                  const msgs = s.messages.map(m => {
                    if (m.id === aiMsgId) {
                      const rawContent = m.content || '无响应';
                      const filteredContent = filterToolResults(rawContent);
                      return { ...m, streaming: false, content: filteredContent };
                    }
                    return m;
                  });
                  const title = s.title ?? titleFromFirstMessage(content);
                  return { ...s, messages: msgs, title };
                });
                try {
                  localStorage.setItem(SESSIONS_KEY, JSON.stringify(updated));
                } catch {}
                return updated;
              });
            }
          },
          signal: abortController.signal,
        }
      ) || sessionId;
    } catch (error: any) {
      console.error('Chat send error:', error);
      if (error.name !== 'AbortError') {
        antMessage.error('发送消息失败: ' + (error.message || '未知错误'));
        const currentId = currentSessionIdRef.current || tempSessionId || sessionId;
        if (currentId) {
          setSessions(prev => {
            const updated = prev.map(s => {
              if (s.id !== currentId) return s;
              const msgs = s.messages.map(m => {
                if (m.id === aiMsgId) {
                  const rawContent = m.content || '发送失败，请重试';
                  const filteredContent = filterToolResults(rawContent);
                  return { ...m, streaming: false, content: filteredContent };
                }
                return m;
              });
              return { ...s, messages: msgs };
            });
            try {
              localStorage.setItem(SESSIONS_KEY, JSON.stringify(updated));
            } catch {}
            return updated;
          });
        }
      }
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteChatSession(id);
      const next = sessions.filter(s => s.id !== id);
      persist(next);
      if (currentId === id) {
        handleNewSession();
      }
    } catch (error) {
      console.error('Failed to delete session:', error);
      antMessage.error('删除会话失败');
    }
  };

  const isSendDisabled = !currentRoleId || !currentModel;

  return (
    <div className={styles.chatShell}>
      <div className={`${styles.sessionSidebar} ${collapsed ? styles.collapsed : ''}`}>
        <div className={styles.sessionHeader}>
          <div className={styles.newSessionCard} onClick={handleNewSession}>
            <FormOutlined className={styles.newSessionIcon} />
            <span className={styles.newSessionText}>新对话</span>
            <span className={styles.newSessionShortcut}>⌘ K</span>
          </div>
          <div className={styles.collapseButton} onClick={() => setCollapsed(true)}>
            <CollapseIcon className={styles.collapseIcon} />
          </div>
        </div>
        
        <div className={styles.sessionList}>
          {sessions.length > 0 && (
            <div className={styles.sessionGroupTitle}>历史对话</div>
          )}
          
          {sessions.length === 0 ? (
            <div className={styles.sessionEmpty}>
              <HistoryOutlined className={styles.emptyIcon} />
              <div className={styles.emptyText}>暂无历史对话</div>
            </div>
          ) : (
            <div className={styles.sessionItems}>
              {sessions.map((item) => (
                <div
                  key={item.id}
                  className={`${styles.sessionItem} ${currentId === item.id ? styles.sessionItemActive : ''}`}
                  onClick={() => {
                    setCurrent(item.id);
                  }}
                >
                  <MessageOutlined className={styles.sessionIcon} />
                  <div className={styles.sessionTitle}>{item.title || '未命名会话'}</div>
                  <Popconfirm
                    title="删除会话"
                    description="确认删除该会话？"
                    onConfirm={(e) => {
                      e?.stopPropagation();
                      handleDelete(item.id);
                    }}
                    onCancel={(e) => e?.stopPropagation()}
                  >
                    <div 
                      className={styles.deleteButton}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <DeleteOutlined />
                    </div>
                  </Popconfirm>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className={styles.chatMain}>
        {collapsed && (
          <div className={styles.expandButton} onClick={() => setCollapsed(false)}>
            <CollapseIcon className={styles.expandIcon} />
          </div>
        )}
        <div className="flex-1 overflow-y-auto px-5 py-3 sm:p-4 lg:p-6 custom-scrollbar">
          <div className={`max-w-4xl mx-auto space-y-3 sm:space-y-5 lg:space-y-6 ${currentMessages.length === 0 ? 'h-full' : ''}`}>
            {currentMessages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-[var(--text-color-secondary)] px-4">
                <div className="text-3xl sm:text-5xl lg:text-6xl mb-3 sm:mb-5 lg:mb-6 opacity-80">🧠</div>
                <div className="text-base sm:text-lg lg:text-xl font-medium opacity-100 text-center">{t('chat.runtime')}</div>
                <div className="mt-2 opacity-80 text-xs sm:text-sm lg:text-base text-center">{t('chat.welcome')}</div>
              </div>
            )}
            {currentMessages.map(m => (
              <ChatMessage key={m.id} message={m} />
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>
        <ChatInput
          onSend={handleSend}
          disabled={isSendDisabled}
          roles={roles}
          currentRole={currentRole}
          onRoleChange={(roleId) => {
            setCurrentRoleId(roleId);
            try {
              localStorage.setItem(LAST_ROLE_ID_KEY, roleId);
            } catch {}
          }}
          models={models}
          currentModel={currentModel}
          onModelChange={(model) => {
            setCurrentModel(model);
            try {
              localStorage.setItem(LAST_MODEL_KEY, model);
            } catch {}
          }}
          configLocked={configLocked}
        />
      </div>
    </div>
  );
}
