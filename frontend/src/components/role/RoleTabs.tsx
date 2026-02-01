import React from 'react';
import { BookOpen, Cpu, Settings as SettingsIcon, PhoneCall } from 'lucide-react';
import clsx from 'clsx';
import { useI18n } from '@/hooks/useI18n';

type TabId = 'config' | 'experience' | 'tools' | 'call';

interface RoleTabsProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

export function RoleTabs({ activeTab, onTabChange }: RoleTabsProps) {
  const { t } = useI18n();

  const tabs = [
    { id: 'config' as const, label: t('role.tab.config', 'Configuration'), icon: SettingsIcon },
    { id: 'experience' as const, label: t('role.tab.knowledge', 'Experience Base'), icon: BookOpen },
    { id: 'tools' as const, label: t('role.tab.tools', 'Tools'), icon: Cpu },
    { id: 'call' as const, label: t('role.tab.call', 'Call'), icon: PhoneCall },
  ];

  return (
    <div className="bg-[var(--header-bg)] border-b border-[var(--border-color)] px-3 sm:px-4 lg:px-6 flex gap-3 sm:gap-4 lg:gap-6 overflow-x-auto scrollbar-hide">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={clsx(
            "flex items-center gap-1.5 sm:gap-2 py-2.5 sm:py-3 lg:py-4 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap flex-shrink-0",
            activeTab === tab.id
              ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400"
              : "border-transparent text-[var(--text-color-secondary)] hover:text-[var(--text-color)]"
          )}
        >
          <tab.icon size={16} className="sm:w-[18px] sm:h-[18px]" />
          <span className="hidden sm:inline">{tab.label}</span>
        </button>
      ))}
    </div>
  );
}
