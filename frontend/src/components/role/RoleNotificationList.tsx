import React, { useState } from 'react';
import { Role, RoleNotification } from '@/types/hub';
import { useI18n } from '@/hooks/useI18n';
import { Avatar } from './Avatar';
import { Select } from 'antd';
import { Trash2, ChevronDown, ChevronUp, Plus, MessageSquare } from 'lucide-react';
import clsx from 'clsx';
import { Role as ApiRole } from '@/apis/role';

interface RoleNotificationListProps {
  role: Role;
  roles: ApiRole[];
  onUpdate: (role: Role) => void;
}

export function RoleNotificationList({ role, roles, onUpdate }: RoleNotificationListProps) {
  const { t } = useI18n();
  const [expandedRoleNotification, setExpandedRoleNotification] = useState<number | null>(null);

  const updateNotifications = (newNotifications: RoleNotification[]) => {
    const newToolConfig = { ...role.tool_config };
    newToolConfig.role_notifications = newNotifications;
    onUpdate({ ...role, tool_config: newToolConfig });
  };

  const addRoleNotification = () => {
    const current = role.tool_config?.role_notifications || [];
    updateNotifications([...current, { target_role_ids: [], trigger: '', content: '' }]);
    setExpandedRoleNotification(current.length);
  };

  const updateRoleNotification = (index: number, field: keyof RoleNotification, value: any) => {
    const current = [...(role.tool_config?.role_notifications || [])];
    current[index] = { ...current[index], [field]: value };
    updateNotifications(current);
  };

  const removeNotification = (index: number) => {
    const current = [...(role.tool_config?.role_notifications || [])];
    current.splice(index, 1);
    updateNotifications(current);
  };

  return (
    <div className="bg-[var(--card-bg)] p-4 lg:p-6 rounded-xl border border-[var(--border-color)] shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MessageSquare size={20} />
          <h3 className="text-lg font-medium text-[var(--text-color)]">{t('role.notification.title', 'Role Notifications')}</h3>
        </div>
        <button  
          onClick={addRoleNotification}
          className="flex items-center gap-1 px-3 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg transition-colors text-sm font-medium"
        >
          <Plus size={14} /> {t('role.notification.add', 'Add')}
        </button>
      </div>

      <div className="space-y-4">
        {(role.tool_config?.role_notifications || []).map((notification, idx) => {
          const targetRole = roles.find(r => r.id === notification.target_role_ids?.[0]);
          const isExpanded = expandedRoleNotification === idx;

          return (
            <div key={idx} className="bg-[var(--body-bg)] rounded-lg border border-[var(--border-color)] overflow-hidden transition-all duration-200">
              {/* Header / Summary Card */}
              <div 
                className={clsx(
                  "p-3 flex items-center justify-between cursor-pointer hover:bg-[var(--item-hover-bg)] transition-colors",
                  isExpanded && "border-b border-[var(--border-color)] bg-[var(--item-hover-bg)]"
                )}
                onClick={() => setExpandedRoleNotification(isExpanded ? null : idx)}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <Avatar avatar={targetRole?.avatar} name={targetRole?.name} size={36} className="shrink-0" />
                  <div className="min-w-0">
                    <h4 className="font-medium text-[var(--text-color)] truncate">
                      {targetRole?.name || <span className="text-[var(--text-color-secondary)] italic">{t('role.notification.selectRole', 'Select a role')}</span>}
                    </h4>
                    <p className="text-xs text-[var(--text-color-secondary)] truncate">
                      {notification.trigger ? `${t('role.notification.triggerPrefix', 'Trigger: ')}${notification.trigger}` : t('role.notification.noTrigger', 'No trigger set')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 pl-2">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      removeNotification(idx);
                    }}
                    className="p-1.5 text-gray-400 hover:text-red-500 transition-colors rounded-md hover:bg-[var(--bg-secondary)]"
                    title={t('role.notification.remove', 'Remove notification')}
                  >
                    <Trash2 size={16} />
                  </button>
                  <div className="text-[var(--text-color-secondary)]">
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </div>
              </div>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="p-4 space-y-4 bg-[var(--bg-secondary)] animate-in slide-in-from-top-2 duration-200">
                  <div>
                    <label className="block text-xs font-medium text-[var(--text-color-secondary)] mb-1.5">{t('role.notification.targetRole', 'Target Role')}</label>
                    <Select
                      value={notification.target_role_ids?.[0]}
                      onChange={(value) => updateRoleNotification(idx, 'target_role_ids', value ? [value] : [])}
                      style={{ width: '100%' }}
                      placeholder={t('role.notification.selectRole', 'Select a role')}
                      options={roles.map(r => ({ 
                        label: (
                          <div className="flex items-center gap-2">
                            <Avatar avatar={r.avatar} name={r.name} size={20} />
                            <span>{r.name}</span>
                          </div>
                        ), 
                        value: r.id 
                      }))}
                      optionLabelProp="label"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[var(--text-color-secondary)] mb-1.5">{t('role.notification.triggerCondition', 'Trigger Condition')}</label>
                    <input 
                      type="text"
                      value={notification.trigger}
                      onChange={(e) => updateRoleNotification(idx, 'trigger', e.target.value)}
                      placeholder={t('role.notification.triggerPlaceholder', "When to notify (e.g., 'task completed')...")}
                      className="w-full px-3 py-2 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-color)] focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[var(--text-color-secondary)] mb-1.5">{t('role.notification.content', 'Notification Content')}</label>
                    <textarea 
                      value={notification.content}
                      onChange={(e) => updateRoleNotification(idx, 'content', e.target.value)}
                      placeholder={t('role.notification.contentPlaceholder', 'Content to send...')}
                      rows={3}
                      className="w-full px-3 py-2 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-color)] focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all resize-none"
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {(role.tool_config?.role_notifications || []).length === 0 && (
          <div className="text-center py-8 text-[var(--text-color-secondary)] text-sm">
            {t('role.notification.empty', 'No role notifications configured')}
          </div>
        )}
      </div>
    </div>
  );
}
