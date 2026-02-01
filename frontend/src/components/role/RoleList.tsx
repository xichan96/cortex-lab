import React, { useState, useMemo } from 'react';
import { Role } from '@/types/hub';
import { Plus, Search } from 'lucide-react';
import clsx from 'clsx';
import { useI18n } from '@/hooks/useI18n';
import { Avatar } from './Avatar';

interface RoleListProps {
  roles: Role[];
  selectedRoleId: string | null;
  onSelectRole: (role: Role) => void;
  onAddRole: () => void;
}

export function RoleList({ roles, selectedRoleId, onSelectRole, onAddRole }: RoleListProps) {
  const { t } = useI18n();
  const [searchKeyword, setSearchKeyword] = useState('');

  const filteredRoles = useMemo(() => {
    if (!searchKeyword.trim()) {
      return roles;
    }
    const keyword = searchKeyword.trim().toLowerCase();
    return roles.filter(role => 
      role.name.toLowerCase().includes(keyword) ||
      role.description?.toLowerCase().includes(keyword)
    );
  }, [roles, searchKeyword]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && filteredRoles.length > 0) {
      e.preventDefault();
      onSelectRole(filteredRoles[0]);
    }
  };

  return (
    <div className="flex flex-col h-full border-r border-[var(--border-color)] bg-[var(--sider-bg)] w-full lg:w-80 xl:w-96 flex-shrink-0 shadow-lg lg:shadow-none">
      <div className="p-3 sm:p-4 border-b border-[var(--border-color)] flex flex-col gap-3 sm:gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-bold text-[var(--text-color)]">{t('roles.list.title', 'Roles')}</h2>
          <button 
            onClick={onAddRole}
            className="p-1.5 sm:p-2 rounded-md hover:bg-[var(--item-hover-bg)] text-indigo-600 dark:text-indigo-400 transition-all hover:scale-110"
          >
            <Plus size={18} className="sm:w-5 sm:h-5" />
          </button>
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-2 sm:top-2.5 text-[var(--text-color-secondary)] pointer-events-none" size={14} />
          <input 
            type="text" 
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('roles.list.search', 'Search roles...')} 
            className="w-full pl-8 sm:pl-9 pr-3 py-1.5 sm:py-2 bg-[var(--body-bg)] border border-[var(--border-color)] rounded-lg text-xs sm:text-sm text-[var(--text-color)] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder-[var(--text-color-secondary)]"
          />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-1.5 sm:p-2 space-y-1">
        {filteredRoles.map((role) => (
          <div
            key={role.id}
            onClick={() => onSelectRole(role)}
            className={clsx(
              'flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg cursor-pointer transition-all border border-transparent hover:scale-[1.02]',
              selectedRoleId === role.id
                ? 'bg-indigo-600 text-white shadow-lg scale-[1.02]'
                : 'hover:bg-[var(--item-hover-bg)] hover:border-[var(--border-color)]'
            )}
          >
            <Avatar 
              avatar={role.avatar} 
              name={role.name} 
              size={36} 
              className={clsx(
                "sm:w-10 sm:h-10",
                selectedRoleId === role.id ? "ring-2 ring-white/30" : ""
              )}
            />
            <div className="flex-1 min-w-0">
              <h3 className={clsx(
                "text-sm sm:text-base font-medium truncate",
                selectedRoleId === role.id ? "text-white" : "text-[var(--text-color)]"
              )}>
                {role.name}
              </h3>
              <p className={clsx(
                "text-xs truncate",
                selectedRoleId === role.id ? "text-indigo-100" : "text-[var(--text-color-secondary)]"
              )}>
                {role.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
