import React, { useRef } from 'react';
import { Save, X, PanelRight } from 'lucide-react';
import clsx from 'clsx';
import { useI18n } from '@/hooks/useI18n';
import { ExperienceEditor, ExperienceEditorRef } from '@/components/experience/ExperienceEditor';

interface RoleExperienceEditorProps {
  title: string;
  content: string;
  showPreview: boolean;
  onTitleChange: (title: string) => void;
  onContentChange: (content: string) => void;
  onTogglePreview: () => void;
  onSave: () => void;
  onCancel: () => void;
}

export function RoleExperienceEditorView({ 
  title, 
  content, 
  showPreview,
  onTitleChange, 
  onContentChange,
  onTogglePreview,
  onSave, 
  onCancel 
}: RoleExperienceEditorProps) {
  const { t } = useI18n();
  const editorRef = useRef<ExperienceEditorRef>(null);

  return (
    <div className="h-full flex flex-col">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div className="flex-1">
          <input
            type="text"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder={t('role.knowledge.titlePlaceholder', 'Enter experience title...')}
            className="w-full text-lg font-medium bg-transparent border-b border-transparent hover:border-[var(--border-color)] focus:border-indigo-500 outline-none transition-colors px-1 py-1"
          />
        </div>
      </div>
      <div className="flex-1 min-h-0 flex flex-col bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--border-color)] bg-[var(--header-bg)]">
          <div className="text-sm font-medium text-[var(--text-color-secondary)]">Markdown Editor</div>
          <div className="flex items-center gap-2">
            <button
              onClick={onTogglePreview}
              className={clsx(
                "flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors text-sm",
                showPreview 
                  ? "bg-indigo-100 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400" 
                  : "text-[var(--text-color-secondary)] hover:text-[var(--text-color)] hover:bg-[var(--item-hover-bg)]"
              )}
              title={showPreview ? "Close Preview" : "Open Preview"}
            >
              <PanelRight size={14} />
            </button>
            <div className="w-px h-4 bg-[var(--border-color)] mx-1" />
            <button 
              onClick={onCancel}
              className="flex items-center gap-1 px-3 py-1.5 text-[var(--text-color-secondary)] hover:text-[var(--text-color)] hover:bg-[var(--item-hover-bg)] rounded-lg transition-colors text-sm"
              title={t('common.cancel', 'Cancel')}
            >
              <X size={14} />
            </button>
            <button 
              onClick={onSave}
              className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors text-sm font-medium"
              title={t('common.save', 'Save')}
            >
              <Save size={14} />
            </button>
          </div>
        </div>
        <div className="flex-1 min-h-0">
          <ExperienceEditor 
            ref={editorRef}
            value={content}
            onChange={onContentChange}
            showPreview={showPreview}
          />
        </div>
      </div>
    </div>
  );
}
