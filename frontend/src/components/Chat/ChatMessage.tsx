import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import 'highlight.js/styles/github-dark.css';
import { CopyOutlined, CheckOutlined } from '@ant-design/icons';
import { message as antMessage, Tooltip, Collapse, Tag } from 'antd';
import { CaretRightOutlined, CaretDownOutlined, CodeOutlined, BugOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { AgentMessage } from '@/apis/agent';
import { useI18n } from '@/hooks/useI18n';
import styles from './index.module.scss';

interface ChatMessageProps {
  message: AgentMessage & { streaming?: boolean };
}

interface LogData {
  tool?: string;
  name?: string;
  msg?: string;
  message?: string;
  level?: string;
  status?: string;
  type?: string;
  [key: string]: any;
}

const LogLine: React.FC<{ data: LogData | string }> = ({ data }) => {
  const [expanded, setExpanded] = useState(false);
  const isJson = typeof data === 'object' && data !== null;

  const { summary, isError, toolName } = React.useMemo(() => {
    if (!isJson) return { summary: String(data), isError: false, toolName: null };
    
    const d = data as LogData;
    const tool = d.tool || d.name || d.type;
    const msg = d.msg || d.message || d.output || JSON.stringify(d);
    const err = d.level === 'error' || d.status === 'error';
    
    return {
      summary: msg.length > 100 ? msg.slice(0, 100) + '...' : msg,
      isError: err,
      toolName: tool,
    };
  }, [data, isJson]);

  const toggle = () => setExpanded(!expanded);

  return (
    <div className="border-b border-gray-700/50 last:border-0 font-mono text-xs">
      <div 
        className={`flex items-start gap-2 py-1.5 px-3 hover:bg-white/5 dark:hover:bg-white/5 cursor-pointer transition-colors ${isError ? 'text-red-400' : 'text-gray-300'}`}
        onClick={toggle}
      >
        <span className="mt-0.5 text-gray-500 shrink-0 select-none">
          {expanded ? <CaretDownOutlined /> : <CaretRightOutlined />}
        </span>
        
        <span className="mt-0.5 shrink-0">
          {isError ? <BugOutlined /> : (toolName ? <CodeOutlined /> : <InfoCircleOutlined />)}
        </span>

        {toolName && (
          <span className="shrink-0 px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 text-[10px] font-bold uppercase tracking-wider">
            {toolName}
          </span>
        )}

        <span className="break-all whitespace-pre-wrap flex-1 leading-relaxed opacity-90">
          {summary}
        </span>
      </div>
      
      {expanded && (
        <div className="bg-black/20 p-3 pl-9 overflow-x-auto border-t border-gray-700/30">
          <pre className="m-0 text-[11px] leading-5 text-gray-400 font-mono whitespace-pre-wrap break-words">
            {isJson ? JSON.stringify(data, null, 2) : String(data)}
          </pre>
        </div>
      )}
    </div>
  );
};

const LogViewer: React.FC<{ logs: (string | LogData)[] }> = ({ logs }) => {
  return (
    <div className="rounded-lg overflow-hidden border border-gray-700/50 bg-[#1e1e1e] shadow-sm my-2 w-full">
      <div className="flex items-center gap-2 px-3 py-2 bg-white/5 border-b border-gray-700/50">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
        </div>
        <span className="text-xs text-gray-400 font-mono ml-2">Console Output</span>
      </div>
      <div className="flex flex-col max-h-[500px] overflow-y-auto custom-scrollbar">
        {logs.map((log, i) => (
          <LogLine key={i} data={log} />
        ))}
      </div>
    </div>
  );
};

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const { t } = useI18n();
  const isUser = message.role === 'user';
  const [copiedCode, setCopiedCode] = useState<string>('');

  const blocks = React.useMemo(() => {
    if (isUser || !message.content) return [];

    // Normalize newlines and handle concatenated JSON objects like [...][...]
    const normalizedContent = message.content.replace(/\]\[/g, ']\n[');
    const lines = normalizedContent.split('\n');
    
    const result: { type: 'log' | 'text', content: any }[] = [];
    let currentLogs: any[] = [];
    let currentTextLines: string[] = [];
    
    const flushLogs = () => {
      if (currentLogs.length > 0) {
        result.push({ type: 'log', content: currentLogs });
        currentLogs = [];
      }
    };
    
    const flushText = () => {
      if (currentTextLines.length > 0) {
        result.push({ type: 'text', content: currentTextLines.join('\n') });
        currentTextLines = [];
      }
    };
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.trim() === '') {
        // Empty lines are ambiguous; keep them with the current context or default to text
        if (currentLogs.length > 0) {
             // If we are in log mode, maybe this empty line separates logs? 
             // Or maybe it ends log mode? Let's assume empty lines don't break log mode 
             // unless followed by text. But for safety, let's treat it as text if it's just formatting.
             // Actually, treating empty lines as text is safer for markdown spacing.
             flushLogs();
             currentTextLines.push(line);
        } else {
             currentTextLines.push(line);
        }
        continue;
      }
      
      try {
        const p = JSON.parse(line);
        // Heuristic: Must be an object or array, and look like a tool call or log
        if (p && (typeof p === 'object' || Array.isArray(p))) {
           // Check if it looks like a tool call (optional, but good for safety)
           // For now, accept any JSON object/array as log to be safe against raw JSON leak
           flushText();
           if (Array.isArray(p)) {
              // Flatten if it's an array of objects
              if (p.every(item => typeof item === 'object')) {
                 currentLogs.push(...p);
              } else {
                 currentLogs.push(p);
              }
           } else {
              currentLogs.push(p);
           }
        } else {
           throw new Error('Not an object');
        }
      } catch {
        // Not JSON, treat as text
        flushLogs();
        currentTextLines.push(line);
      }
    }
    
    flushLogs();
    flushText();
    
    return result;
  }, [message.content, isUser]);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    antMessage.success(t('common.copied', '已复制'));
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    antMessage.success(t('common.copied', '已复制'));
    setTimeout(() => setCopiedCode(''), 2000);
  };

  const fixIncompleteMarkdown = (content: string): string => {
    if (!content) return content;
    
    let fixed = content;
    
    const lines = fixed.split('\n');
    let inCodeBlock = false;
    let codeBlockCount = 0;
    let lastCodeBlockLine = -1;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.trim().startsWith('```')) {
        codeBlockCount++;
        inCodeBlock = !inCodeBlock;
        lastCodeBlockLine = i;
      }
    }
    
    if (inCodeBlock || codeBlockCount % 2 !== 0) {
      const lastLine = lines[lines.length - 1];
      if (lastLine && lastLine.trim() && !lastLine.trim().startsWith('```')) {
        fixed += '\n```';
      } else if (!lastLine || !lastLine.trim()) {
        fixed += '```';
      } else {
        fixed += '\n```';
      }
    }
    
    let inInlineCode = false;
    let backtickCount = 0;
    for (let i = 0; i < fixed.length; i++) {
      if (fixed[i] === '`' && (i === 0 || fixed[i-1] !== '\\')) {
        if (i < fixed.length - 2 && fixed[i+1] === '`' && fixed[i+2] === '`') {
          i += 2;
          continue;
        }
        backtickCount++;
        inInlineCode = !inInlineCode;
      }
    }
    
    if (inInlineCode && backtickCount % 2 !== 0) {
      const lastBacktickIndex = fixed.lastIndexOf('`');
      const beforeBacktick = fixed.substring(0, lastBacktickIndex);
      const afterBacktick = fixed.substring(lastBacktickIndex + 1);
      
      const codeBlockAfter = afterBacktick.match(/```/);
      if (codeBlockAfter) {
        return fixed;
      }
      
      if (!afterBacktick.includes('\n') && afterBacktick.trim().length > 0) {
        fixed += '`';
      }
    }
    
    const dollarMatches = fixed.match(/\$\$/g);
    if (dollarMatches && dollarMatches.length % 2 !== 0) {
      fixed += '$$';
    }
    
    const singleDollarCount = (fixed.match(/(?<!\$)\$(?!\$)/g) || []).length;
    if (singleDollarCount % 2 !== 0) {
      fixed += '$';
    }
    
    return fixed;
  };

  const preprocessContent = (content: string): string => {
    if (!content) return content;
    
    return content.replace(/\\boxed\{([^}]+)\}/g, (match, inner, offset, string) => {
      const before = string.substring(Math.max(0, offset - 2), offset);
      const after = string.substring(offset + match.length, Math.min(string.length, offset + match.length + 2));
      
      if ((before.endsWith('$') && !before.endsWith('$$')) || before.endsWith('$$') || 
          after.startsWith('$') || after.startsWith('$$')) {
        return match;
      }
      
      if (inner.includes('\n') || inner.length > 50) {
        return `$$\\boxed{${inner}}$$`;
      }
      return `$\\boxed{${inner}}$`;
    });
  };

  const renderTypingAnimation = () => {
    return (
      <div className={styles.typingAnimation}>
        <span></span>
        <span></span>
        <span></span>
      </div>
    );
  };

  const renderMarkdown = (content: string) => {
    if (!content) return null;
    
    // Process markdown content
    const fixedMarkdown = message.streaming ? fixIncompleteMarkdown(content) : content;
    const processedMarkdown = preprocessContent(fixedMarkdown);
    
    try {
      return (
        <ReactMarkdown 
          remarkPlugins={[remarkGfm, remarkMath]}
          rehypePlugins={[rehypeHighlight, rehypeRaw, rehypeKatex]}
          components={{
            code: ({ node, inline, className, children, ...props }: any) => {
              if (inline) {
                return (
                  <code className={className} {...props}>
                    {children}
                  </code>
                );
              }
              
              return (
                <code className={className} {...props}>
                  {children}
                </code>
              );
            },
            pre: ({ node, children, ...props }: any) => {
              const code = node?.children?.[0];
              const codeContent = code?.children?.[0]?.value || '';
              const isCopied = copiedCode === codeContent;
              
              return (
                <div className={styles.codeBlockWrapper}>
                  <div className={styles.codeBlockHeader}>
                    <Tooltip title={isCopied ? t('common.copied', '已复制') : t('common.copy', '复制')}>
                      <span 
                        className={styles.copyCodeButton}
                        onClick={() => handleCopyCode(codeContent)}
                      >
                        {isCopied ? <CheckOutlined /> : <CopyOutlined />}
                      </span>
                    </Tooltip>
                  </div>
                  <pre {...props}>
                    {children}
                  </pre>
                </div>
              );
            },
          }}
        >
          {processedMarkdown}
        </ReactMarkdown>
      );
    } catch (error) {
      console.error('Markdown render error:', error);
      return <div className="whitespace-pre-wrap">{content}</div>;
    }
  };

  return (
    <div className={`${styles.messageWrapper} flex flex-col max-w-full ${isUser ? 'items-end' : 'items-start'}`}>
      <div className={isUser ? styles.userMessage : styles.agentMessage}>
        {isUser ? (
          <div className="whitespace-pre-wrap">{message.content}</div>
        ) : (
          <>
            {blocks.map((block, index) => (
              <React.Fragment key={index}>
                {block.type === 'log' ? (
                  <LogViewer logs={block.content} />
                ) : (
                  renderMarkdown(block.content)
                )}
              </React.Fragment>
            ))}
            {message.streaming && !message.content && renderTypingAnimation()}
            {message.streaming && blocks.length === 0 && renderTypingAnimation()}
          </>
        )}
      </div>
      <div className={`${styles.messageActions} ${isUser ? 'mr-1' : 'ml-1'}`}>
        <Tooltip title={t('common.copy', '复制')}>
          <span className={styles.actionIcon} onClick={handleCopy}>
            <CopyOutlined />
          </span>
        </Tooltip>
      </div>
    </div>
  );
};

export default ChatMessage;
