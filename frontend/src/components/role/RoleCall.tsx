import React, { useState, useEffect, useMemo } from 'react';
import { Role } from '@/types/hub';
import { useI18n } from '@/hooks/useI18n';
import { useChatLLMSettings } from '@/hooks/useChatLLMSettings';
import { Copy, Link, ChevronDown, ChevronUp } from 'lucide-react';
import { getRoles, Role as ApiRole } from '@/apis/role';
import { Select } from 'antd';
import { ProviderIcon } from '@/components/Icons/ProviderIcons';
import { RoleNotificationList } from './RoleNotificationList';
import { HumanNotificationList } from './HumanNotificationList';

interface RoleCallProps {
  role: Role;
  onUpdate: (role: Role) => void;
}

export function RoleCall({ role, onUpdate }: RoleCallProps) {
  const { t } = useI18n();
  const { setting } = useChatLLMSettings({ maskSensitive: true });
  const [roles, setRoles] = useState<ApiRole[]>([]);
  const [provider, setProvider] = useState('openai');
  const [modelName, setModelName] = useState('gpt-4o');
  const [isApiCollapsed, setIsApiCollapsed] = useState(true);

  const models = useMemo(() => {
    if (!setting) return [];
    const list: { provider: string; model: string }[] = [];
    if (setting.openai?.models) list.push(...setting.openai.models.map(m => ({ provider: 'openai', model: m })));
    if (setting.deepseek?.models) list.push(...setting.deepseek.models.map(m => ({ provider: 'deepseek', model: m })));
    if (setting.volce?.models) list.push(...setting.volce.models.map(m => ({ provider: 'volce', model: m })));
    return list;
  }, [setting]);

  // Set default model if available and current selection is invalid
  useEffect(() => {
    if (models.length > 0) {
      const currentExists = models.some(m => m.provider === provider && m.model === modelName);
      if (!currentExists) {
        setProvider(models[0].provider);
        setModelName(models[0].model);
      }
    }
  }, [models]);
  
  // Load available roles for selection
  useEffect(() => {
    getRoles({ page: 1, page_size: 100 }).then(res => {
      setRoles(res.list.filter(r => r.id !== role.id));
    });
  }, [role.id]);

  const baseUrl = window.location.origin.replace(/\/$/, ''); // Or use API base URL if different
  const apiUrl = `${baseUrl}/api/chat`; // Assuming api prefix

  const chatCurl = `curl -X POST "${apiUrl}/${role.id}/model/${provider}/${modelName}" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -d '{
    "message": "Hello"
  }'`;

  const streamCurl = `curl -X POST "${apiUrl}/${role.id}/model/${provider}/${modelName}/stream" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -d '{
    "message": "Hello"
  }'`;

  return (
    <div className="space-y-6 pb-20">
      {/* API Invocation Section */}
      <div className="bg-[var(--card-bg)] p-4 lg:p-6 rounded-xl border border-[var(--border-color)] shadow-sm">
        <div 
          className="flex items-center justify-between mb-4 cursor-pointer"
          onClick={() => setIsApiCollapsed(!isApiCollapsed)}
        >
          <div className="flex items-center gap-2">
            <Link size={20} />
            <h3 className="text-lg font-medium text-[var(--text-color)]">{t('role.call.api', 'API Invocation')}</h3>
          </div>
          <div className="flex items-center gap-3">
            {isApiCollapsed && (
              <>
                <div className="hidden sm:flex items-center gap-2 text-xs text-[var(--text-color-secondary)] bg-[var(--body-bg)] px-2 py-1 rounded-md border border-[var(--border-color)] font-mono">
                  <span className="font-bold text-green-600 dark:text-green-500">POST</span>
                  <span className="truncate max-w-[200px] md:max-w-none">/api/chat/:role_id/model/:provider/:model_name</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[var(--text-color-secondary)] bg-[var(--body-bg)] px-2 py-1 rounded-md border border-[var(--border-color)]">
                  <ProviderIcon keyName={provider} />
                  <span className="font-medium">{provider}</span>
                  <span className="w-[1px] h-3 bg-[var(--border-color)]"></span>
                  <span>{modelName}</span>
                </div>
              </>
            )}
            {isApiCollapsed ? <ChevronDown size={18} className="text-[var(--text-color-secondary)]" /> : <ChevronUp size={18} className="text-[var(--text-color-secondary)]" />}
          </div>
        </div>
        
        {!isApiCollapsed && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text-color-secondary)] mb-1">{t('role.call.provider', 'Provider')}</label>
                <Select
                  value={provider}
                  onChange={(val) => {
                    setProvider(val);
                    // Reset model when provider changes
                    const firstModel = models.find(m => m.provider === val)?.model;
                    if (firstModel) setModelName(firstModel);
                  }}
                  className="w-full"
                  options={Array.from(new Set(models.map(m => m.provider))).map(p => ({ 
                    label: (
                      <div className="flex items-center gap-2">
                        <ProviderIcon keyName={p} />
                        <span>{p}</span>
                      </div>
                    ), 
                    value: p 
                  }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-color-secondary)] mb-1">{t('role.call.modelName', 'Model Name')}</label>
                <Select
                  value={modelName}
                  onChange={(val) => setModelName(val)}
                  className="w-full"
                  options={models.filter(m => m.provider === provider).map(m => ({ label: m.model, value: m.model }))}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-sm font-medium text-[var(--text-color-secondary)]">{t('role.call.chatApi', 'Chat API')}</label>
                  <button 
                    onClick={() => navigator.clipboard.writeText(chatCurl)}
                    className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                  >
                    <Copy size={12} /> {t('common.copy', 'Copy')}
                  </button>
                </div>
                <pre className="bg-[var(--body-bg)] p-3 rounded-lg border border-[var(--border-color)] overflow-x-auto text-xs font-mono text-[var(--text-color)]">
                  {chatCurl}
                </pre>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-sm font-medium text-[var(--text-color-secondary)]">{t('role.call.streamApi', 'Stream API')}</label>
                  <button 
                    onClick={() => navigator.clipboard.writeText(streamCurl)}
                    className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                  >
                    <Copy size={12} /> {t('common.copy', 'Copy')}
                  </button>
                </div>
                <pre className="bg-[var(--body-bg)] p-3 rounded-lg border border-[var(--border-color)] overflow-x-auto text-xs font-mono text-[var(--text-color)]">
                  {streamCurl}
                </pre>
              </div>

              <div className="pt-4 border-t border-[var(--border-color)]">
                <h4 className="text-sm font-medium text-[var(--text-color)] mb-3">{t('role.call.pathParams', 'Path Parameters')}</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-[var(--border-color)]">
                        <th className="py-2 px-1 font-medium text-[var(--text-color-secondary)]">{t('role.call.name', 'Name')}</th>
                        <th className="py-2 px-1 font-medium text-[var(--text-color-secondary)]">{t('role.call.type', 'Type')}</th>
                        <th className="py-2 px-1 font-medium text-[var(--text-color-secondary)]">{t('role.call.description', 'Description')}</th>
                      </tr>
                    </thead>
                    <tbody className="text-[var(--text-color)]">
                      <tr className="border-b border-[var(--border-color)] border-dashed">
                        <td className="py-2 px-1 font-mono">role_id</td>
                        <td className="py-2 px-1">string</td>
                        <td className="py-2 px-1">{t('role.call.roleIdDesc', 'Unique identifier of the role')}</td>
                      </tr>
                      <tr className="border-b border-[var(--border-color)] border-dashed">
                        <td className="py-2 px-1 font-mono">provider</td>
                        <td className="py-2 px-1">string</td>
                        <td className="py-2 px-1">{t('role.call.providerDesc', 'Model provider (e.g., openai, deepseek)')}</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-1 font-mono">model_name</td>
                        <td className="py-2 px-1">string</td>
                        <td className="py-2 px-1">{t('role.call.modelNameDesc', 'Specific model name (e.g., gpt-4o)')}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-[var(--text-color)] mb-3">{t('role.call.headers', 'Headers')}</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-[var(--border-color)]">
                        <th className="py-2 px-1 font-medium text-[var(--text-color-secondary)]">{t('role.call.name', 'Name')}</th>
                        <th className="py-2 px-1 font-medium text-[var(--text-color-secondary)]">{t('role.call.required', 'Required')}</th>
                        <th className="py-2 px-1 font-medium text-[var(--text-color-secondary)]">{t('role.call.description', 'Description')}</th>
                      </tr>
                    </thead>
                    <tbody className="text-[var(--text-color)]">
                      <tr className="border-b border-[var(--border-color)] border-dashed">
                        <td className="py-2 px-1 font-mono">Authorization</td>
                        <td className="py-2 px-1">Yes</td>
                        <td className="py-2 px-1">{t('role.call.authDesc', 'Bearer token (API Key)')}</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-1 font-mono">X-Chat-Session-Id</td>
                        <td className="py-2 px-1">No</td>
                        <td className="py-2 px-1">{t('role.call.sessionIdDesc', 'Session ID for continuing a conversation')}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-[var(--text-color)] mb-2">{t('role.call.requestBody', 'Request Body')}</h4>
                  <pre className="bg-[var(--body-bg)] p-3 rounded-lg border border-[var(--border-color)] overflow-x-auto text-xs font-mono text-[var(--text-color)]">
{JSON.stringify({
  "messages": [
    {
      "role": "user",
      "content": "Hello"
    }
  ],
  "stream": false,
  "tools": ["tool_name (optional)"]
}, null, 2)}
                  </pre>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-[var(--text-color)] mb-2">{t('role.call.responseExample', 'Response Example')}</h4>
                  <pre className="bg-[var(--body-bg)] p-3 rounded-lg border border-[var(--border-color)] overflow-x-auto text-xs font-mono text-[var(--text-color)]">
{JSON.stringify({
  "code": 0,
  "msg": "success",
  "data": {
    "session_id": "session-uuid",
    "messages": [
      {
        "role": "assistant",
        "content": "Hi there!"
      }
    ]
  }
}, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <RoleNotificationList role={role} roles={roles} onUpdate={onUpdate} />
      <HumanNotificationList role={role} onUpdate={onUpdate} />
    </div>
  );
}