import { useState, useRef, useEffect, useImperativeHandle, forwardRef, Children, useCallback } from 'react';
import { Button, Input, Avatar } from 'antd';
import { ClearOutlined, CheckOutlined, CloseOutlined, RobotOutlined } from '@ant-design/icons';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import { useAgentChat } from '@/hooks/useAgentChat';
import { useAgentMessageHandler } from '@/hooks/useAgentMessageHandler';
import { useAutoApply } from '@/hooks/useAutoApply';
import CodeReference from './CodeReference';
import { CodeReferenceInfo } from './EditorArea';
import InputToolbar from './InputToolbar';
import styles from './index.module.scss';
import { useI18n } from '@/hooks/useI18n';

interface AgentChatProps {
  editorAreaRef?: React.RefObject<{ 
    navigateToLine: (lineRange: string) => void;
    replaceCode: (content: string, lineRange?: string) => void;
  }>;
  collapsed?: boolean;
  onToggleCollapsed?: (collapsed: boolean) => void;
  chatId?: string;
}

export interface AgentChatRef {
  setInputMessage: (content: string | CodeReferenceInfo) => void;
}

const AgentChat = forwardRef<AgentChatRef, AgentChatProps>(({ editorAreaRef, collapsed, onToggleCollapsed, chatId }, ref) => {
  const { t } = useI18n();
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const [codeReferences, setCodeReferences] = useState<CodeReferenceInfo[]>([]);
  const [plainText, setPlainText] = useState<string>('');
  const [width, setWidth] = useState(420);
  const [isResizing, setIsResizing] = useState(false);
  const inputRef = useRef<any>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const isCollapsed = typeof collapsed === 'boolean' ? collapsed : internalCollapsed;
  const setCollapsedValue = (next: boolean) => {
    if (typeof collapsed === 'boolean' && onToggleCollapsed) {
      onToggleCollapsed(next);
      return;
    }
    setInternalCollapsed(next);
  };

  const { autoApply, toggleAutoApply } = useAutoApply();

  // Ref to hold the latest line range function to resolve circular dependency
  const getLatestLineRangeRef = useRef<() => string | undefined>();

  const handleApplyToEditor = useCallback((content: string, lineRange?: string) => {
    if (editorAreaRef?.current) {
      editorAreaRef.current.replaceCode(content, lineRange);
    }
  }, [editorAreaRef]);

  const { handleAgentMessageComplete } = useAgentMessageHandler({
    onApplyToEditor: handleApplyToEditor,
    autoApplyEnabled: autoApply,
    getLineRange: () => getLatestLineRangeRef.current?.(),
  });
  
  const {
    agentMessage,
    setAgentMessage,
    messages,
    sending,
    messagesEndRef,
    handleSendMessage: originalHandleSendMessage,
    sendMessageDirectly,
    handleClearContext,
  } = useAgentChat({
    onAgentMessageComplete: handleAgentMessageComplete,
    id: chatId,
  });
  const getCodeReference = useCallback((msgIndex: number) => {
    // Find the closest previous user message with a code reference (Sticky Context)
    for (let i = msgIndex - 1; i >= 0; i--) {
      const msg = messages[i];
      if (msg.role === 'user') {
        const codeRefMatches = msg.content.match(/```code-ref\n([\s\S]*?)\n```/);
        if (codeRefMatches && codeRefMatches[1]) {
          try {
            // Remove the markdown code block wrapper to get clean JSON
            const jsonStr = codeRefMatches[1];
            return JSON.parse(jsonStr) as CodeReferenceInfo;
          } catch (e) {
            console.error('Failed to parse code reference:', e);
            continue;
          }
        }
        // If we found a user message but it has no code ref, continue searching backwards
        continue;
      }
    }
    return null;
  }, [messages]);

  const getLatestLineRange = useCallback(() => {
    // When auto-applying, we are at the end of the conversation
    const ref = getCodeReference(messages.length);
    return ref?.lineRange;
  }, [getCodeReference, messages]);

  // Update the ref whenever getLatestLineRange changes
  useEffect(() => {
    getLatestLineRangeRef.current = getLatestLineRange;
  }, [getLatestLineRange]);

  const getTextFromChildren = (nodeChildren: any): string => {
    return Children.toArray(nodeChildren)
      .map((child: any) => {
        if (typeof child === 'string') return child;
        if (child && child.props && child.props.children) {
          return getTextFromChildren(child.props.children);
        }
        return '';
      })
      .join('');
  };




  const handleSendMessage = () => {
    if (codeReferences.length > 0) {
      const codeRefText = codeReferences.map(ref => 
        `\`\`\`code-ref\n${JSON.stringify(ref)}\n\`\`\``
      ).join('\n');
      const fullMessage = plainText.trim() ? `${codeRefText}\n${plainText}` : codeRefText;
      sendMessageDirectly(fullMessage);
      setCodeReferences([]);
      setPlainText('');
      setAgentMessage('');
    } else {
      if (!agentMessage.trim()) return;
      originalHandleSendMessage();
    }
  };

  useImperativeHandle(ref, () => ({
    setInputMessage: (content: string | CodeReferenceInfo) => {
      if (typeof content === 'string') {
        setPlainText('');
        setCodeReferences([]);
        setAgentMessage(content);
      } else {
        setCodeReferences([content]);
        setPlainText('');
        setAgentMessage('');
      }
      setCollapsedValue(false);
      
      setTimeout(() => {
        if (inputRef.current) {
          const textarea = (inputRef.current as any)?.resizableTextArea?.textArea;
          if (textarea) {
            textarea.focus();
            textarea.setSelectionRange(textarea.value.length, textarea.value.length);
          }
        }
      }, 100);
      
      // 注意：这里无法直接清理 timeout，但通常不会有问题
      // 因为组件卸载时 React 会自动清理
    },
  }), [setAgentMessage]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !(e.nativeEvent as any).isComposing) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const container = sidebarRef.current?.parentElement;
      if (!container) return;
      
      const containerRect = container.getBoundingClientRect();
      const newWidth = containerRect.right - e.clientX;
      const minWidth = 300;
      const maxWidth = containerRect.width * 0.7;
      
      if (newWidth >= minWidth && newWidth <= maxWidth) {
        setWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing]);

  return (
    <>
      <div 
        ref={sidebarRef}
        className={`${styles.agentSidebar} ${isCollapsed ? styles.collapsed : ''} ${isResizing ? styles.resizing : ''}`}
        style={!isCollapsed ? { width: `${width}px` } : undefined}
      >
        {!isCollapsed && (
          <div 
            className={styles.resizeHandle}
            onMouseDown={handleMouseDown}
          />
        )}
        <div className={styles.agentHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Avatar size={28} style={{ backgroundColor: 'var(--message-user-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <RobotOutlined style={{ fontSize: 16 }} />
            </Avatar>
            <span style={{ fontSize: '14px', fontWeight: 500 }}>{t('agentChat.title', '角色编辑助手')}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {messages.length > 0 && (
              <Button
                type="text"
                size="small"
                icon={<ClearOutlined />}
                onClick={handleClearContext}
                className={styles.clearButton}
              >
              </Button>
            )}
          </div>
        </div>
        <div className={styles.messages}>
          {messages.length === 0 ? (
            <div className={styles.emptyMessage}>{t('agentChat.empty', '暂无对话')}</div>
          ) : (
            messages.map((msg, index) => (
              <div key={msg.id} className={msg.role === 'user' ? styles.userMessage : styles.agentMessage}>
                {msg.role === 'assistant' ? (
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeHighlight, rehypeRaw]}
                      components={{
                        code: ({ node, inline, className, children, ...props }: any) => {
                          const isInline = inline;
                          if (isInline) {
                            return (
                              <code className={className} {...props}>
                                {children}
                              </code>
                            );
                          }

                          const content = getTextFromChildren(children).replace(/\n$/, '');
                          
                          return (
                            <div style={{ position: 'relative' }}>
                              {editorAreaRef?.current?.replaceCode && (
                                <div style={{ position: 'absolute', top: 4, right: 4, zIndex: 10 }}>
                                  <Button
                                    type="text"
                                    size="small"
                                    icon={<CheckOutlined />}
                                    style={{ color: 'var(--text-color)', background: 'var(--code-bg)' }}
                                    onClick={() => {
                                      const ref = getCodeReference(index);
                                      editorAreaRef.current?.replaceCode(content, ref?.lineRange);
                                    }}
                                    title={t('agentChat.applyCodeTitle', '应用代码')}
                                  >
                                    {t('common.apply', '应用')}
                                  </Button>
                                </div>
                              )}
                              <pre className={className}>
                                <code className={className} {...props}>
                                  {children}
                                </code>
                              </pre>
                            </div>
                          );
                        },
                      }}
                    >
                      {msg.content || (msg.streaming ? t('agentChat.typing', '正在输入...') : '')}
                    </ReactMarkdown>
                ) : (
                  (() => {
                    const codeRefMatches = msg.content.match(/```code-ref\n([\s\S]*?)\n```/g);
                    if (codeRefMatches && codeRefMatches.length > 0) {
                      const parts: (string | CodeReferenceInfo)[] = [];
                      let lastIndex = 0;
                      
                      codeRefMatches.forEach((match) => {
                        const matchIndex = msg.content.indexOf(match, lastIndex);
                        if (matchIndex > lastIndex) {
                          const textBefore = msg.content.substring(lastIndex, matchIndex).trim();
                          if (textBefore) {
                            parts.push(textBefore);
                          }
                        }
                        
                        try {
                          const jsonStr = match.replace(/```code-ref\n/, '').replace(/\n```/, '');
                          const codeRef: CodeReferenceInfo = JSON.parse(jsonStr);
                          parts.push(codeRef);
                        } catch (e) {
                          parts.push(match);
                        }
                        
                        lastIndex = matchIndex + match.length;
                      });
                      
                      const textAfter = msg.content.substring(lastIndex).trim();
                      if (textAfter) {
                        parts.push(textAfter);
                      }
                      
                      return (
                        <div className={styles.messageContentWithRefs}>
                          {parts.map((part, index) => {
                            if (typeof part === 'string') {
                              return <span key={index}>{part}</span>;
                            } else {
                              return (
                                <CodeReference 
                                  key={index} 
                                  {...part}
                                  onNavigate={(lineRange) => {
                                    editorAreaRef?.current?.navigateToLine(lineRange);
                                  }}
                                />
                              );
                            }
                          })}
                        </div>
                      );
                    }
                    return msg.content;
                  })()
                )}
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
        <div className={styles.inputArea}>
          <div className={styles.inputRow}>
            <div className={styles.inputWithTags}>
              {codeReferences.length > 0 && (
                <div className={styles.codeReferencesInline}>
                  {codeReferences.map((ref, index) => (
                    <CodeReference
                      key={index}
                      fileName={ref.fileName}
                      lineRange={ref.lineRange}
                      onClose={() => {
                        const newRefs = codeReferences.filter((_, i) => i !== index);
                        setCodeReferences(newRefs);
                        if (newRefs.length === 0) {
                          setAgentMessage(plainText);
                          setPlainText('');
                        }
                      }}
                      onNavigate={(lineRange) => {
                        editorAreaRef?.current?.navigateToLine(lineRange);
                      }}
                    />
                  ))}
                </div>
              )}
              <Input.TextArea
                ref={inputRef}
                value={codeReferences.length > 0 ? plainText : agentMessage}
                onChange={(e) => {
                  const value = e.target.value;
                  if (codeReferences.length > 0) {
                    setPlainText(value);
                  } else {
                    setAgentMessage(value);
                  }
                }}
                placeholder={t('agentChat.inputPlaceholder', '输入消息...')}
                className={styles.messageInput}
                autoSize={{ minRows: 1, maxRows: 4 }}
                onKeyDown={handleKeyDown}
              />
              <InputToolbar
                onSend={handleSendMessage}
                sending={sending}
                disabled={sending || (codeReferences.length === 0 && !agentMessage.trim())}
                autoApply={autoApply}
                onToggleAutoApply={toggleAutoApply}
              />
            </div>
          </div>
        </div>
      </div>
      
    </>
  );
});

AgentChat.displayName = 'AgentChat';

export default AgentChat;
