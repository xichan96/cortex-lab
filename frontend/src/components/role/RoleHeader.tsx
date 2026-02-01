import React from 'react';
import { Save, Trash2 } from 'lucide-react';
import { useI18n } from '@/hooks/useI18n';

interface RoleHeaderProps {
  name: string;
  description: string;
  onDelete: () => void;
  onSave: () => void;
}

export function RoleHeader({ name, description, onDelete, onSave }: RoleHeaderProps) {
  const { t } = useI18n();
  
  return (
    <div className="bg-[var(--header-bg)] border-b border-[var(--border-color)] px-3 sm:px-4 lg:px-6 py-3 sm:py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between shadow-sm z-10 gap-3 sm:gap-0">
      <div className="flex-1 min-w-0 w-full sm:w-auto">
        <h1 className="text-base sm:text-lg lg:text-xl font-bold text-[var(--text-color)] truncate">{name}</h1>
        <p className="text-xs sm:text-sm text-[var(--text-color-secondary)] mt-1 truncate">{description}</p>
      </div>
      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
        <button 
          onClick={onDelete}
          className="flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors text-xs sm:text-sm font-medium flex-1 sm:flex-initial"
        >
          <Trash2 size={14} className="sm:w-4 sm:h-4" />
          <span className="hidden sm:inline">{t('common.delete', 'Delete')}</span>
        </button>
        <button 
          onClick={onSave}
          className="flex items-center justify-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm transition-all text-xs sm:text-sm font-medium flex-1 sm:flex-initial"
        >
          <Save size={14} className="sm:w-4 sm:h-4" />
          <span className="hidden sm:inline">{t('common.saveChanges', 'Save Changes')}</span>
          <span className="sm:hidden">{t('common.save', 'Save')}</span>
        </button>
      </div>
    </div>
  );
}
