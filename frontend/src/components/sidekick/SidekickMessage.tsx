import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import { User, Bot } from 'lucide-react';
import { Message } from '@/hooks/useAgentChat';
import { CodeReference } from './CodeReference';
import { CodeReferenceInfo } from './types';

interface SidekickMessageProps {
  message: Message;
}

export const SidekickMessage: React.FC<SidekickMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';

  const renderContent = () => {
    if (isUser) {
      const codeRefRegex = /```code-ref\n([\s\S]*?)\n```/g;
      const parts: React.ReactNode[] = [];
      let lastIndex = 0;
      let match;

      while ((match = codeRefRegex.exec(message.content)) !== null) {
        // Text before match
        if (match.index > lastIndex) {
          parts.push(
            <span key={`text-${lastIndex}`}>
              {message.content.substring(lastIndex, match.index)}
            </span>
          );
        }

        // The code ref chip
        try {
          const ref = JSON.parse(match[1]) as CodeReferenceInfo;
          parts.push(
            <CodeReference 
                key={`ref-${match.index}`}
                fileName={ref.fileName}
                lineRange={ref.lineRange}
                variant="chip"
            />
          );
        } catch (e) {
          // Fallback if parse fails
          parts.push(<span key={`err-${match.index}`}>{match[0]}</span>);
        }

        lastIndex = match.index + match[0].length;
      }

      // Remaining text
      if (lastIndex < message.content.length) {
        parts.push(
          <span key={`text-${lastIndex}`}>
            {message.content.substring(lastIndex)}
          </span>
        );
      }

      return (
        <div className="whitespace-pre-wrap">
          {parts.length > 0 ? parts : message.content}
        </div>
      );
    }

    return (
      <div className="prose prose-sm max-w-none dark:prose-invert text-xs">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeHighlight, rehypeRaw]}
        >
          {message.content}
        </ReactMarkdown>
      </div>
    );
  };

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div className={`
        w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
        ${isUser ? 'bg-indigo-100 text-indigo-600' : 'bg-green-100 text-green-600'}
      `}>
        {isUser ? <User size={16} /> : <Bot size={16} />}
      </div>
      <div className={`
        max-w-[85%] rounded-lg p-3 text-xs shadow-sm overflow-hidden
        ${isUser 
          ? 'bg-[var(--message-user-bg)] text-white' 
          : 'bg-[var(--message-agent-bg)] text-[var(--text-color)] border border-[var(--border-color)]'
        }
      `}>
        {renderContent()}
      </div>
    </div>
  );
};
