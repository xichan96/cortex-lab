import React from 'react';
import { useI18n } from '@/hooks/useI18n';

interface RolePromptEditorProps {
  value: string;
  onChange: (value: string) => void;
  textareaRef?: React.RefObject<HTMLTextAreaElement>;
}

export function RolePromptEditor({ value, onChange, textareaRef }: RolePromptEditorProps) {
  const { t } = useI18n();

  return (
    <div className="bg-[var(--card-bg)] p-3 sm:p-4 lg:p-6 rounded-xl border border-[var(--border-color)] shadow-sm">
      <h3 className="text-base sm:text-lg font-medium text-[var(--text-color)] mb-3 sm:mb-4">{t('role.config.prompt', '角色提示词')}</h3>
      <div className="relative">
        <textarea 
          ref={textareaRef}
          name="prompt"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={12}
          placeholder={t('role.config.promptPlaceholder', '# 你是xxx专家\n\n## 核心能力\n- ...\n\n## 工作方式\n...\n\n## 对话风格\n...')}
          className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-[var(--body-bg)] text-[var(--text-color)] border border-[var(--border-color)] font-mono text-xs sm:text-sm rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
        />
        <div className="absolute top-2 sm:top-3 right-2 sm:right-3 text-[10px] sm:text-xs text-[var(--text-color-secondary)] pointer-events-none">
          Markdown
        </div>
      </div>
    </div>
  );
}
