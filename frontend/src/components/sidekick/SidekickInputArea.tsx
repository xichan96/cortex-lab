import React from 'react';
import { Send, X } from 'lucide-react';
import { CodeReferenceInfo } from './types';
import { useI18n } from '@/hooks/useI18n';

interface SidekickInputAreaProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  sending: boolean;
  codeReferences: CodeReferenceInfo[];
  onRemoveCodeReference: (index: number) => void;
  autoApply?: boolean;
  onToggleAutoApply?: () => void;
}

export function SidekickInputArea({
  value,
  onChange,
  onSend,
  sending,
  codeReferences,
  onRemoveCodeReference,
  autoApply,
  onToggleAutoApply
}: SidekickInputAreaProps) {
  const { t } = useI18n();
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  const isDisabled = !value.trim() && codeReferences.length === 0;

  return (
    <div className="flex flex-col border-t border-[var(--border-color)] bg-[var(--card-bg)]">
      <div className="p-3">
        {codeReferences.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {codeReferences.map((ref, idx) => (
              <div key={idx} className="flex items-center gap-1 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 px-2 py-1 rounded text-xs border border-indigo-100 dark:border-indigo-800">
                <span className="font-medium">{ref.fileName} ({ref.lineRange})</span>
                <button 
                  onClick={() => onRemoveCodeReference(idx)}
                  className="hover:text-red-500 ml-1"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t('sidekick.placeholder', '询问提示词编辑助手...')}
          className="w-full p-3 border border-[var(--border-color)] bg-[var(--body-bg)] text-[var(--text-color)] rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none resize-none min-h-[80px] text-sm"
        />
      </div>

      {/* Actions Bar */}
      <div className="flex items-center justify-between px-3 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-[var(--text-color-secondary)]">Auto-Apply</span>
          {onToggleAutoApply && (
            <button
              onClick={onToggleAutoApply}
              className={`
                relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
                ${autoApply ? 'bg-indigo-600' : 'bg-[var(--border-color)]'}
              `}
            >
              <span
                className={`
                  inline-block h-3 w-3 transform rounded-full bg-white transition-transform
                  ${autoApply ? 'translate-x-5' : 'translate-x-1'}
                `}
              />
            </button>
          )}
        </div>
        <button
          onClick={onSend}
          disabled={isDisabled || sending}
          className={`
            flex items-center justify-center p-2 rounded-lg transition-colors
            ${isDisabled || sending 
              ? 'bg-[var(--item-hover-bg)] text-[var(--text-color-secondary)] cursor-not-allowed' 
              : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }
          `}
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}
