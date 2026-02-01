import React from 'react';
import { X } from 'lucide-react';

export interface CodeReferenceProps {
  fileName: string;
  lineRange: string;
  content?: string;
  onClose?: () => void;
  onNavigate?: (lineRange: string) => void;
  variant?: 'card' | 'chip';
}

export function CodeReference({ 
  fileName, 
  lineRange, 
  content, 
  onClose, 
  onNavigate,
  variant = 'card' 
}: CodeReferenceProps) {
  const handleClick = () => {
    if (onNavigate) {
      onNavigate(lineRange);
    }
  };

  if (variant === 'chip') {
    return (
      <div 
        className={`
          inline-flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded text-xs mx-1 my-0.5 align-middle
          ${onNavigate ? 'cursor-pointer hover:bg-white/30' : ''}
        `}
        onClick={handleClick}
      >
        <span className="font-medium">{fileName} ({lineRange})</span>
        {onClose && (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="hover:text-red-500 ml-1"
          >
            <X size={12} />
          </button>
        )}
      </div>
    );
  }

  return (
    <div 
      className={`
        relative flex flex-col gap-1 p-2 rounded bg-[var(--item-hover-bg)] border border-[var(--border-color)] text-xs
        ${onNavigate ? 'cursor-pointer hover:opacity-80' : 'cursor-default'}
      `}
      onClick={handleClick}
    >
      {onClose && (
        <button
          className="absolute top-1 right-1 p-0.5 text-[var(--text-color-secondary)] hover:text-[var(--text-color)] rounded-full hover:bg-[var(--border-color)] transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          aria-label="Close"
        >
          <X size={12} />
        </button>
      )}
      <div className="flex items-center gap-1 font-medium text-[var(--text-color)]">
        <span>{fileName}</span>
        <span className="text-[var(--text-color-secondary)]">({lineRange})</span>
      </div>
      {content && (
        <div className="mt-1 max-h-20 overflow-hidden bg-[var(--card-bg)] p-1 rounded border border-[var(--border-color)] font-mono text-[var(--text-color-secondary)]">
          <pre className="whitespace-pre-wrap break-all">
            <code>{content}</code>
          </pre>
        </div>
      )}
    </div>
  );
}
