import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Sliders, 
  Database, 
  Globe,
  Bot,
  MessageSquare
} from 'lucide-react';
import clsx from 'clsx';
import { GeneralSettings, SystemSettings, RoleEditorAgentSettings, ChatLLMSettings } from '@/components/Settings';
import { useI18n } from '@/hooks/useI18n';

export default function Settings() {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState('system');
  const [menuCollapsed, setMenuCollapsed] = useState(false);

  const menuItems = [
    { id: 'system', label: t('settings.tab.system', 'System Config'), icon: Globe, component: <SystemSettings /> },
    { id: 'general', label: t('settings.tab.general', 'General Config'), icon: Sliders, component: <GeneralSettings /> },
    { id: 'chat-llm', label: t('settings.tab.chat_llm', '对话LLM配置'), icon: MessageSquare, component: <ChatLLMSettings /> },
    { id: 'role-editor', label: t('settings.tab.roleEditor', 'Role Editor Agent'), icon: Bot, component: <RoleEditorAgentSettings /> },
  ];

  const activeItem = menuItems.find(item => item.id === activeTab) || menuItems[0];

  return (
    <div className="flex flex-col lg:flex-row h-full bg-[var(--body-bg)] overflow-hidden relative">
      {/* Mobile overlay */}
      <div 
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity lg:hidden ${!menuCollapsed ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setMenuCollapsed(true)}
      />
      
      {/* Sidebar Menu */}
      <div className={`
        fixed left-0 top-0 h-full z-50 transition-transform lg:relative lg:z-auto lg:translate-x-0
        ${menuCollapsed ? '-translate-x-full' : 'translate-x-0'}
        flex flex-col w-full sm:w-80 lg:w-64 xl:w-72 border-r border-[var(--border-color)] bg-[var(--sider-bg)] flex-shrink-0 overflow-y-auto shadow-lg lg:shadow-none
      `}>
        <div className="p-3 sm:p-4 border-b border-[var(--border-color)]">
          <h2 className="text-base sm:text-lg font-bold text-[var(--text-color)]">{t('settings.title', 'Settings')}</h2>
          <p className="text-xs text-[var(--text-color-secondary)] mt-1">{t('settings.description', 'Manage system configurations')}</p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-1.5 sm:p-2 space-y-1">
          {menuItems.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setMenuCollapsed(true);
              }}
              className={clsx(
                'flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg cursor-pointer transition-all border border-transparent hover:scale-[1.02]',
                activeTab === item.id
                  ? 'bg-indigo-600 text-white shadow-lg scale-[1.02]'
                  : 'hover:bg-[var(--item-hover-bg)] hover:border-[var(--border-color)]'
              )}
            >
              <div className={clsx(
                "w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center transition-colors",
                activeTab === item.id ? "bg-white/20 text-white" : "bg-[var(--body-bg)] text-[var(--text-color-secondary)]"
              )}>
                <item.icon size={16} className="sm:w-[18px] sm:h-[18px]" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className={clsx(
                  "font-medium truncate text-xs sm:text-sm",
                  activeTab === item.id ? "text-white" : "text-[var(--text-color)]"
                )}>
                  {item.label}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Content Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 bg-[var(--body-bg)] overflow-hidden">
        {/* Header */}
        <div className="bg-[var(--header-bg)] border-b border-[var(--border-color)] px-3 sm:px-4 lg:px-6 py-3 sm:py-4 flex items-center justify-between shadow-sm z-10">
          {menuCollapsed && (
            <button
              onClick={() => setMenuCollapsed(false)}
              className="lg:hidden p-2 rounded-lg bg-[var(--card-bg)] border border-[var(--border-color)] text-[var(--text-color)] hover:bg-[var(--item-hover-bg)] transition-colors shadow-sm mr-3"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          )}
          <div>
            <h1 className="text-base sm:text-lg lg:text-xl font-bold text-[var(--text-color)] flex items-center gap-2">
              {activeItem.icon && <activeItem.icon className="text-indigo-600 dark:text-indigo-400 sm:w-[18px] sm:h-[18px]" size={16} />}
              <span>{activeItem.label}</span>
            </h1>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-auto p-3 sm:p-4 lg:p-6">
          <div className="max-w-4xl mx-auto">
            {activeItem.component}
          </div>
        </div>
      </div>
    </div>
  );
}
