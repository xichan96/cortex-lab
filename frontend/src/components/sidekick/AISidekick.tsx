import React, { useState, useRef, useEffect, useImperativeHandle, forwardRef, useCallback } from 'react';
import { useAgentChat } from '@/hooks/useAgentChat';
import { useAgentMessageHandler } from '@/hooks/useAgentMessageHandler';
import { useAutoApply } from '@/hooks/useAutoApply';
import { Bot, Trash2, ChevronsRight } from 'lucide-react';
import { SidekickMessage } from './SidekickMessage';
import { SidekickInputArea } from './SidekickInputArea';
import { useResizable } from './useResizable';
import { AISidekickProps, AISidekickRef, CodeReferenceInfo } from './types';
import { useI18n } from '@/hooks/useI18n';

export const AISidekick = forwardRef<AISidekickRef, AISidekickProps>(({ editorRef, collapsed, onToggleCollapsed, chatId, promptKey }, ref) => {
  const { t } = useI18n();
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const [codeReferences, setCodeReferences] = useState<CodeReferenceInfo[]>([]);
  const sidebarRef = useRef<HTMLDivElement>(null);
  
  const isCollapsed = typeof collapsed === 'boolean' ? collapsed : internalCollapsed;
  const setCollapsedValue = (next: boolean) => {
    if (typeof collapsed === 'boolean' && onToggleCollapsed) {
      onToggleCollapsed(next);
      return;
    }
    setInternalCollapsed(next);
  };

  const { width, setIsResizing } = useResizable({ initialWidth: 400 });

  const { autoApply, toggleAutoApply } = useAutoApply();
  const getLatestLineRangeRef = useRef<() => string | undefined>(() => undefined);
  const [agentMessage, setAgentMessage] = useState('');

  // Handle applying code to editor
  const handleApplyToEditor = useCallback((content: string) => {
    if (editorRef?.current) {
       editorRef.current.insertContent(content);
    }
  }, [editorRef]);

  const { handleAgentMessageComplete } = useAgentMessageHandler({
    onApplyToEditor: handleApplyToEditor,
    autoApplyEnabled: autoApply,
    getLineRange: () => getLatestLineRangeRef.current(), 
  });

  const {
    messages,
    sending,
    messagesEndRef,
    sendMessageDirectly: sendMessageToAgent,
    handleClearContext,
  } = useAgentChat({
    onAgentMessageComplete: handleAgentMessageComplete,
    promptKey,
    id: chatId,
  });

  // Clear code references and input message when chat ID changes
  useEffect(() => {
    setCodeReferences([]);
    setAgentMessage('');
  }, [chatId]);

  const getLatestLineRange = useCallback(() => {
    // Find the last user message with a code reference
    for (let i = messages.length - 1; i >= 0; i--) {
      const msg = messages[i];
      if (msg.role === 'user') {
        const match = msg.content.match(/```code-ref\n({[\s\S]*?})\n```/);
        if (match) {
          try {
            const ref = JSON.parse(match[1]) as CodeReferenceInfo;
            return ref.lineRange;
          } catch (e) {
            console.error('Failed to parse code reference:', e);
          }
        }
      }
    }
    return undefined;
  }, [messages]);

  useEffect(() => {
    getLatestLineRangeRef.current = getLatestLineRange;
  }, [getLatestLineRange]);

  const handleSendMessage = () => {
    const trimmedMessage = (agentMessage || '').trim();
    if (!trimmedMessage && codeReferences.length === 0) return;
    
    let fullMessage = trimmedMessage;
    
    if (codeReferences.length > 0) {
       const refsBlock = codeReferences.map(ref => 
         `\`\`\`code-ref\n${JSON.stringify(ref)}\n\`\`\``
       ).join('\n');
       
       fullMessage = (fullMessage ? fullMessage + '\n\n' : '') + refsBlock;
       setCodeReferences([]);
    }
    
    if (fullMessage) {
        sendMessageToAgent(fullMessage);
        setAgentMessage('');
    }
  };

  useImperativeHandle(ref, () => ({
    setInputMessage: (content: string | CodeReferenceInfo) => {
      if (typeof content === 'string') {
        setAgentMessage(content);
        setCodeReferences([]); 
      } else {
        setCodeReferences(prev => {
            // Avoid duplicates
            if (prev.some(p => p.lineRange === content.lineRange && p.fileName === content.fileName)) return prev;
            return [...prev, content];
        });
        setAgentMessage(''); 
      }
      setCollapsedValue(false);
    },
  }), [setAgentMessage]);

  if (isCollapsed) {
    return (
      <div className="hidden xl:flex w-12 border-l border-[var(--border-color)] bg-[var(--card-bg)] flex-col items-center py-4">
        <button 
          onClick={() => setCollapsedValue(false)}
          className="p-2 text-[var(--text-color-secondary)] hover:text-indigo-600 hover:bg-[var(--item-hover-bg)] rounded-lg transition-colors"
          title={t('sidekick.title', '提示词编辑助手')}
        >
          <Bot size={24} />
        </button>
      </div>
    );
  }

  return (
    <div 
      ref={sidebarRef}
      style={{ width }}
      className="hidden xl:flex flex-col border-l border-[var(--border-color)] bg-[var(--card-bg)] h-full relative"
    >
      {/* Resizer */}
      <div 
        className="absolute left-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-indigo-500 transition-colors z-10"
        onMouseDown={() => setIsResizing(true)}
      />

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-color)]">
        <div className="flex items-center gap-2 text-[var(--text-color)] font-medium">
          <Bot size={18} className="text-indigo-600" />
          <span>{t('sidekick.title', '提示词编辑助手')}</span>
        </div>
        <div className="flex items-center gap-1">
          <button 
            onClick={handleClearContext}
            className="p-1 text-[var(--text-color-secondary)] hover:text-red-600 rounded hover:bg-[var(--item-hover-bg)]"
            title="Clear Chat"
          >
            <Trash2 size={16} />
          </button>
          <button 
            onClick={() => setCollapsedValue(true)}
            className="p-1 text-[var(--text-color-secondary)] hover:text-[var(--text-color)] rounded hover:bg-[var(--item-hover-bg)]"
          >
            <ChevronsRight size={18} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[var(--body-bg)]">
        {messages.map((msg) => (
          <SidekickMessage key={msg.id} message={msg} />
        ))}
        {sending && !messages.some(m => m.streaming) && (
           <div className="flex gap-3">
             <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0">
               <Bot size={16} />
             </div>
             <div className="bg-[var(--message-agent-bg)] border border-[var(--border-color)] rounded-lg p-3 shadow-sm">
               <div className="flex space-x-1">
                 <div className="w-2 h-2 bg-[var(--text-color-secondary)] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                 <div className="w-2 h-2 bg-[var(--text-color-secondary)] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                 <div className="w-2 h-2 bg-[var(--text-color-secondary)] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
               </div>
             </div>
           </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <SidekickInputArea 
        value={agentMessage}
        onChange={setAgentMessage}
        onSend={handleSendMessage}
        sending={sending}
        codeReferences={codeReferences}
        onRemoveCodeReference={(idx) => setCodeReferences(prev => prev.filter((_, i) => i !== idx))}
        autoApply={autoApply}
        onToggleAutoApply={toggleAutoApply}
      />
    </div>
  );
});

AISidekick.displayName = 'AISidekick';
