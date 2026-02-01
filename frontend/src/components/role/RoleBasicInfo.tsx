import React from 'react';
import { useI18n } from '@/hooks/useI18n';
import { AvatarSelector } from './AvatarSelector';

interface RoleBasicInfoProps {
  name: string;
  description: string;
  avatar: string;
  onNameChange: (name: string) => void;
  onDescriptionChange: (description: string) => void;
  onAvatarChange: (avatar: string) => void;
}

export function RoleBasicInfo({ 
  name, 
  description, 
  avatar, 
  onNameChange, 
  onDescriptionChange, 
  onAvatarChange 
}: RoleBasicInfoProps) {
  const { t } = useI18n();

  return (
    <div className="bg-[var(--card-bg)] p-3 sm:p-4 lg:p-6 rounded-xl border border-[var(--border-color)] shadow-sm">
      <h3 className="text-base sm:text-lg font-medium text-[var(--text-color)] mb-3 sm:mb-4">{t('role.config.basicInfo', 'Basic Information')}</h3>
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
        <div className="pt-2 sm:pt-6 flex justify-center sm:block">
          <AvatarSelector 
            value={avatar} 
            onChange={onAvatarChange}
            size={64}
            className="sm:w-20 sm:h-20"
          />
        </div>
        <div className="flex-1 space-y-3 sm:space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-color-secondary)] mb-1">{t('role.config.name', 'Role Name')}</label>
            <input 
              type="text" 
              name="name"
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              className="w-full px-3 py-2 bg-[var(--body-bg)] border border-[var(--border-color)] rounded-lg text-[var(--text-color)] focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-color-secondary)] mb-1">{t('role.config.description', 'Description')}</label>
            <textarea 
              name="description"
              value={description}
              onChange={(e) => onDescriptionChange(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 bg-[var(--body-bg)] border border-[var(--border-color)] rounded-lg text-[var(--text-color)] focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
