import React from 'react';
import { Cpu } from 'lucide-react';
import clsx from 'clsx';
import { useI18n } from '@/hooks/useI18n';
import { Role } from '@/types/hub';
import { BUILTIN_TOOLS } from './constants';

interface RoleBuiltinToolsProps {
  toolConfig: Role['tool_config'];
  onChange: (toolConfig: Role['tool_config']) => void;
}

export function RoleBuiltinTools({ toolConfig, onChange }: RoleBuiltinToolsProps) {
  const { t } = useI18n();

  const handleToggleTool = (toolId: string, checked: boolean) => {
    const prevBuiltin = toolConfig?.builtin || [];
    const nextBuiltin = checked
      ? Array.from(new Set(prevBuiltin.concat([toolId])))
      : prevBuiltin.filter(id => id !== toolId);
    const mcp = toolConfig?.mcp || [];
    
    onChange({
      ...(toolConfig || {}),
      builtin: nextBuiltin,
      mcp,
    });
  };

  const handleEmailConfigChange = (field: string, value: string | number) => {
    onChange({
      ...toolConfig,
      email_config: { 
        ...toolConfig?.email_config, 
        [field]: value 
      } as any
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Cpu size={16} />
          <span className="text-sm font-medium text-[var(--text-color)]">
            {t('role.tools.builtin', 'Built-in Tools')}
          </span>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {BUILTIN_TOOLS.map(tool => {
          const checked = !!toolConfig?.builtin?.includes(tool.id);
          return (
            <div key={tool.id} className={clsx("flex flex-col gap-2", tool.id === 'send_email' && checked && "sm:col-span-2")}>
              <label
                className="flex items-start gap-3 p-3 bg-[var(--body-bg)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-color)] cursor-pointer select-none hover:border-indigo-500/50 transition-colors group relative"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(e) => handleToggleTool(tool.id, e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-medium break-words">{tool.label}</span>
                    <span className="text-[10px] text-[var(--text-color-secondary)] font-mono opacity-70 bg-[var(--bg-secondary)] px-1.5 py-0.5 rounded shrink-0 mt-0.5">{tool.id}</span>
                  </div>
                  {tool.description && (
                    <p className="text-xs text-[var(--text-color-secondary)] mt-1 line-clamp-2 group-hover:line-clamp-none transition-all">
                      {tool.description}
                    </p>
                  )}
                </div>
              </label>
              {tool.id === 'send_email' && checked && (
                <div className="ml-0 sm:ml-7 p-4 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-sm space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                  <h5 className="text-xs font-medium text-[var(--text-color-secondary)] uppercase tracking-wider">SMTP Configuration</h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-[var(--text-color-secondary)] mb-1.5">Host</label>
                      <input
                        type="text"
                        value={toolConfig?.email_config?.host || ''}
                        onChange={(e) => handleEmailConfigChange('host', e.target.value)}
                        className="w-full px-3 py-2 bg-[var(--body-bg)] border border-[var(--border-color)] rounded-lg text-xs text-[var(--text-color)] focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                        placeholder="smtp.example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[var(--text-color-secondary)] mb-1.5">Port</label>
                      <input
                        type="number"
                        value={toolConfig?.email_config?.port || 465}
                        onChange={(e) => handleEmailConfigChange('port', parseInt(e.target.value))}
                        className="w-full px-3 py-2 bg-[var(--body-bg)] border border-[var(--border-color)] rounded-lg text-xs text-[var(--text-color)] focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                        placeholder="465"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-[var(--text-color-secondary)] mb-1.5">Address (User)</label>
                      <input
                        type="text"
                        value={toolConfig?.email_config?.address || ''}
                        onChange={(e) => handleEmailConfigChange('address', e.target.value)}
                        className="w-full px-3 py-2 bg-[var(--body-bg)] border border-[var(--border-color)] rounded-lg text-xs text-[var(--text-color)] focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                        placeholder="user@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[var(--text-color-secondary)] mb-1.5">Password</label>
                      <input
                        type="password"
                        value={toolConfig?.email_config?.pwd || ''}
                        onChange={(e) => handleEmailConfigChange('pwd', e.target.value)}
                        className="w-full px-3 py-2 bg-[var(--body-bg)] border border-[var(--border-color)] rounded-lg text-xs text-[var(--text-color)] focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                        placeholder="********"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-[var(--text-color-secondary)] mb-1.5">From Name</label>
                      <input
                        type="text"
                        value={toolConfig?.email_config?.name || ''}
                        onChange={(e) => handleEmailConfigChange('name', e.target.value)}
                        className="w-full px-3 py-2 bg-[var(--body-bg)] border border-[var(--border-color)] rounded-lg text-xs text-[var(--text-color)] focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                        placeholder="My Assistant"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <p className="text-xs text-[var(--text-color-secondary)]">
        {t('role.tools.builtin.help', 'These are identifiers of built-in tools provided by the system.')}
      </p>
    </div>
  );
}
