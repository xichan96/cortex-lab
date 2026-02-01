import React, { useState } from 'react';
import { Role, HumanNotification } from '@/types/hub';
import { useI18n } from '@/hooks/useI18n';
import { Mail, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import { Switch } from 'antd';
import clsx from 'clsx';

interface HumanNotificationListProps {
  role: Role;
  onUpdate: (role: Role) => void;
}

export function HumanNotificationList({ role, onUpdate }: HumanNotificationListProps) {
  const { t } = useI18n();
  const [isSmtpExpanded, setIsSmtpExpanded] = useState(false);
  const [draftNotification, setDraftNotification] = useState<HumanNotification | null>(null);

  const isEnabled = (role.tool_config?.human_notifications?.length || 0) > 0;

  // Cache the notification configuration when it exists
  React.useEffect(() => {
    const current = role.tool_config?.human_notifications?.[0];
    if (current) {
      setDraftNotification(current);
    }
  }, [role.tool_config?.human_notifications]);

  const updateNotifications = (newNotifications: HumanNotification[]) => {
    const newToolConfig = { ...role.tool_config };
    newToolConfig.human_notifications = newNotifications;
    onUpdate({ ...role, tool_config: newToolConfig });
  };

  const handleToggle = (checked: boolean) => {
    if (checked) {
      // Restore draft or use default
      const toRestore = draftNotification || { 
        target_emails: [], 
        trigger: '', 
        content: '' 
      };
      updateNotifications([toRestore]);
    } else {
      // Clear notifications to disable
      updateNotifications([]);
    }
  };

  const currentNotification = role.tool_config?.human_notifications?.[0] || draftNotification || { 
    target_emails: [], 
    trigger: '', 
    content: '' 
  };

  const handleUpdate = (field: keyof HumanNotification, value: any) => {
    const updated = { ...currentNotification, [field]: value };
    updateNotifications([updated]);
  };

  const updateEmailConfig = (field: string, value: any) => {
    const newToolConfig = { ...role.tool_config };
    newToolConfig.email_config = {
      host: '',
      port: 587,
      address: '',
      pwd: '',
      name: '',
      ...newToolConfig.email_config,
      [field]: value
    };
    onUpdate({ ...role, tool_config: newToolConfig });
  };

  const emails = currentNotification.target_emails.join(', ');
  
  const hasTargetEmails = currentNotification.target_emails.length > 0;
  const isSmtpConfigured = !!(
    role.tool_config?.email_config?.host &&
    role.tool_config?.email_config?.address &&
    role.tool_config?.email_config?.pwd
  );
  const showSmtpWarning = hasTargetEmails && !isSmtpConfigured;

  return (
    <div className="bg-[var(--card-bg)] p-4 lg:p-6 rounded-xl border border-[var(--border-color)] shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Mail size={20} />
          <h3 className="text-lg font-medium text-[var(--text-color)]">{t('role.human.title', 'Notify Humans (Email)')}</h3>
        </div>
        <Switch 
          checked={isEnabled} 
          onChange={handleToggle} 
        />
      </div>

      {isEnabled && (
        <div className="space-y-4 animate-in slide-in-from-top-2 duration-200">
          <div>
            <label className="block text-xs font-medium text-[var(--text-color-secondary)] mb-1.5">{t('role.human.targetEmails', 'Target Emails')}</label>
          <input 
            type="text"
            value={emails}
            onChange={(e) => {
              const newEmails = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
              handleUpdate('target_emails', newEmails);
            }}
            placeholder={t('role.human.emailPlaceholder', "email@example.com, another@example.com")}
            className="w-full px-3 py-2 bg-[var(--body-bg)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-color)] focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
          />
          <p className="text-xs text-[var(--text-color-secondary)] mt-1">{t('role.human.emailTip', 'Comma separated for multiple recipients')}</p>
        </div>

        <div>
          <label className="block text-xs font-medium text-[var(--text-color-secondary)] mb-1.5">{t('role.human.triggerCondition', 'Trigger Condition')}</label>
          <input 
            type="text"
            value={currentNotification.trigger}
            onChange={(e) => handleUpdate('trigger', e.target.value)}
            placeholder={t('role.human.triggerPlaceholder', 'Trigger condition (when to notify)...')}
            className="w-full px-3 py-2 bg-[var(--body-bg)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-color)] focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-[var(--text-color-secondary)] mb-1.5">{t('role.human.content', 'Notification Content')}</label>
          <textarea 
            value={currentNotification.content}
            onChange={(e) => handleUpdate('content', e.target.value)}
            placeholder={t('role.human.contentPlaceholder', 'Notification content...')}
            rows={3}
            className="w-full px-3 py-2 bg-[var(--body-bg)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-color)] focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all resize-none"
          />
        </div>

        <div className="mt-6 pt-6 border-t border-[var(--border-color)]">
          {showSmtpWarning && (
             <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2 text-amber-700 animate-in slide-in-from-top-1">
               <AlertCircle size={16} className="mt-0.5 shrink-0" />
               <div className="text-xs">
                 <p className="font-medium">{t('role.human.smtp.warningTitle', 'SMTP Configuration Required')}</p>
                 <p>{t('role.human.smtp.warningDesc', 'You have configured email recipients but SMTP settings are incomplete. Emails will not be sent.')}</p>
               </div>
             </div>
          )}
          <div 
            className="flex items-center justify-between cursor-pointer mb-4"
            onClick={() => setIsSmtpExpanded(!isSmtpExpanded)}
          >
            <h4 className={clsx("text-sm font-medium transition-colors", showSmtpWarning ? "text-amber-600" : "text-[var(--text-color)]")}>
              {t('role.human.smtp.title', 'SMTP Configuration')}
            </h4>
            <div className="text-[var(--text-color-secondary)]">
              {isSmtpExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </div>
          </div>
          
          {isSmtpExpanded && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in slide-in-from-top-2 duration-200">
              <div>
                <label className="block text-xs font-medium text-[var(--text-color-secondary)] mb-1.5">{t('role.human.smtp.host', 'Host')}</label>
                <input
                  type="text"
                  value={role.tool_config?.email_config?.host || ''}
                  onChange={(e) => updateEmailConfig('host', e.target.value)}
                  placeholder="smtp.gmail.com"
                  className="w-full px-3 py-2 bg-[var(--body-bg)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-color)] focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--text-color-secondary)] mb-1.5">{t('role.human.smtp.port', 'Port')}</label>
                <input
                  type="number"
                  value={role.tool_config?.email_config?.port || 587}
                  onChange={(e) => updateEmailConfig('port', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-[var(--body-bg)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-color)] focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--text-color-secondary)] mb-1.5">{t('role.human.smtp.address', 'Email Address')}</label>
                <input
                  type="email"
                  value={role.tool_config?.email_config?.address || ''}
                  onChange={(e) => updateEmailConfig('address', e.target.value)}
                  placeholder={t('role.human.smtp.addressPlaceholder', "your-email@example.com")}
                  className="w-full px-3 py-2 bg-[var(--body-bg)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-color)] focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--text-color-secondary)] mb-1.5">{t('role.human.smtp.pwd', 'Password / App Key')}</label>
                <input
                  type="password"
                  value={role.tool_config?.email_config?.pwd || ''}
                  onChange={(e) => updateEmailConfig('pwd', e.target.value)}
                  className="w-full px-3 py-2 bg-[var(--body-bg)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-color)] focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-[var(--text-color-secondary)] mb-1.5">{t('role.human.smtp.name', 'Sender Name')}</label>
                <input
                  type="text"
                  value={role.tool_config?.email_config?.name || ''}
                  onChange={(e) => updateEmailConfig('name', e.target.value)}
                  placeholder="My Assistant"
                  className="w-full px-3 py-2 bg-[var(--body-bg)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-color)] focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                />
              </div>
            </div>
          )}
        </div>
      </div>
      )}
    </div>
  );
}