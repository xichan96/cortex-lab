import React from 'react';
import { Plus, BookOpen, FileText, Link as LinkIcon, FileCode, Trash2 } from 'lucide-react';
import { useI18n } from '@/hooks/useI18n';
import { ExperienceItem } from '@/types/hub';

interface RoleExperienceListProps {
  items: ExperienceItem[];
  onAdd: () => void;
  onEdit: (item: ExperienceItem) => void;
  onDelete: (e: React.MouseEvent, id: string) => void;
}

export function RoleExperienceList({ items, onAdd, onEdit, onDelete }: RoleExperienceListProps) {
  const { t } = useI18n();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="text-lg font-medium text-[var(--text-color)]">{t('role.knowledge.title', 'Experience Base')}</h3>
          <p className="text-sm text-[var(--text-color-secondary)]">{t('role.knowledge.description', 'Manage documents and data sources for this role')}</p>
        </div>
        <button 
          onClick={onAdd}
          className="flex items-center gap-2 px-3 py-2 bg-[var(--card-bg)] border border-[var(--border-color)] hover:bg-[var(--item-hover-bg)] text-[var(--text-color)] rounded-lg text-sm font-medium transition-colors shadow-sm"
        >
          <Plus size={16} />
          {t('role.knowledge.add', 'Add Experience')}
        </button>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-12 bg-[var(--card-bg)] rounded-xl border border-dashed border-[var(--border-color)]">
          <BookOpen className="mx-auto h-12 w-12 text-[var(--text-color-secondary)]" />
          <h3 className="mt-2 text-sm font-medium text-[var(--text-color)]">{t('role.knowledge.empty.title', 'No experience added')}</h3>
          <p className="mt-1 text-sm text-[var(--text-color-secondary)]">{t('role.knowledge.empty.desc', 'Start by adding documents or links to train this role.')}</p>
          <button 
            onClick={onAdd}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
          >
            <Plus size={16} />
            {t('role.knowledge.createFirst', 'Create First Item')}
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {items.map((item) => (
            <div 
              key={item.id} 
              onClick={() => onEdit(item)}
              className="bg-[var(--card-bg)] p-4 rounded-xl border border-[var(--border-color)] shadow-sm hover:shadow-md transition-all group cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-lg">
                    {item.type === 'text' && <FileText size={20} />}
                    {item.type === 'url' && <LinkIcon size={20} />}
                    {item.type === 'file' && <FileCode size={20} />}
                  </div>
                  <div>
                    <h4 className="font-medium text-[var(--text-color)] group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{item.title}</h4>
                    <div className="text-sm text-[var(--text-color-secondary)] line-clamp-2 mt-1 prose prose-sm max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: item.content }} />
                    <div className="flex gap-2 mt-3">
                      {item.tags.map(tag => (
                        <span key={tag} className="px-2 py-0.5 bg-[var(--item-hover-bg)] text-[var(--text-color-secondary)] text-xs rounded-full">
                          {tag}
                        </span>
                      ))}
                      <span className="text-xs text-[var(--text-color-secondary)] py-0.5 ml-1">
                        {t('common.updated', 'Updated')} {new Date(item.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={(e) => onDelete(e, item.id)}
                  className="text-[var(--text-color-secondary)] hover:text-red-600 p-1 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
