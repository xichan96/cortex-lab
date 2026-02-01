import { Button, Typography, Form, Input, Select, message } from 'antd';
import { EditOutlined, MessageOutlined, OpenAIOutlined } from '@ant-design/icons';
import { useChatLLMSettings } from '@/hooks/useChatLLMSettings';
import { useI18n } from '@/hooks/useI18n';
import { useEffect, useState } from 'react';
import { fetchLLMModels, updateChatLLMSetting } from '@/apis/setting';
import { ProviderIcon } from '@/components/Icons/ProviderIcons';

const { Title } = Typography;

export const ChatLLMSettings = () => {
  const { setting } = useChatLLMSettings();
  const { t } = useI18n();
  const [formOpenAI] = Form.useForm();
  const [formDeepSeek] = Form.useForm();
  const [formVolce] = Form.useForm();
  const [fetching, setFetching] = useState<{ [k: string]: boolean }>({});
  const [fetchedModels, setFetchedModels] = useState<{ [k: string]: string[] }>({});

  const PROVIDERS = [
    { key: 'openai', label: 'OpenAI' },
    { key: 'deepseek', label: 'DeepSeek' },
    { key: 'volce', label: 'Volce' },
  ];
  
  const LOGO_URLS: Record<string, string> = {
    // openai: 'https://upload.wikimedia.org/wikipedia/commons/4/4d/OpenAI_Logo.svg',
  };
  
  const ProviderHeader = ({ keyName, label }: { keyName: 'openai' | 'deepseek' | 'volce', label: string }) => {
    const [imgError, setImgError] = useState(false);
    const src = LOGO_URLS[keyName];
    return (
      <div className="flex items-center gap-2">
        {!imgError && src ? (
          <img
            src={src}
            alt={label}
            width={22}
            height={22}
            onError={() => setImgError(true)}
            style={{ objectFit: 'contain', filter: 'var(--logo-filter, none)' }}
          />
        ) : (
          <ProviderIcon keyName={keyName} />
        )}
        <Title level={5} style={{ margin: 0 }}>{label}</Title>
      </div>
    );
  };

  useEffect(() => {
    if (!setting) return;
    formOpenAI.setFieldsValue({ openai: setting.openai });
    formDeepSeek.setFieldsValue({ deepseek: setting.deepseek });
    formVolce.setFieldsValue({ volce: setting.volce });
  }, [setting, formOpenAI, formDeepSeek, formVolce]);

  const DEFAULT_BASE_URLS: Record<string, string> = {
    openai: 'https://api.openai.com',
    deepseek: 'https://api.deepseek.com',
    volce: 'https://ark.cn-beijing.volces.com/api/v3',
  };

  const buildOptions = (key: string | null) => {
    if (!key) return [];
    const fetched = fetchedModels[key] || [];
    return fetched.map(m => ({ label: m, value: m }));
  };

  const handleFetchModels = async (key: 'openai' | 'deepseek' | 'volce') => {
    try {
      setFetching(s => ({ ...s, [key]: true }));
      const form = key === 'openai' ? formOpenAI : key === 'deepseek' ? formDeepSeek : formVolce;
      const cfg = form.getFieldValue(key);
      const apiKey = cfg?.api_key;
      if (!apiKey) {
        message.warning(t('common.apiKeyRequired', '请输入API Key'));
        setFetching(s => ({ ...s, [key]: false }));
        return;
      }
      const baseUrl =
        cfg?.base_url ||
        (setting && (setting as any)[key]?.base_url) ||
        DEFAULT_BASE_URLS[key] ||
        '';
      const resp = await fetchLLMModels({ provider: key, api_key: apiKey, base_url: baseUrl });
      const ids: string[] = Array.isArray(resp?.models) ? resp.models : [];
      setFetchedModels(s => ({ ...s, [key]: ids }));
      message.success(t('llm.fetchModelsSuccess', '已加载模型列表'));
    } catch {
      message.error(t('llm.fetchModelsFailed', '获取模型列表失败'));
    } finally {
      setFetching(s => ({ ...s, [key]: false }));
    }
  };

  const handleSave = async (key: 'openai' | 'deepseek' | 'volce') => {
    try {
      const form = key === 'openai' ? formOpenAI : key === 'deepseek' ? formDeepSeek : formVolce;
      const values = form.getFieldsValue();
      const payload = {
        openai: key === 'openai' ? values.openai : setting?.openai || { api_key: '', base_url: '', models: [], org_id: '', api_type: '' },
        deepseek: key === 'deepseek' ? values.deepseek : setting?.deepseek || { api_key: '', base_url: '', models: [] },
        volce: key === 'volce' ? values.volce : setting?.volce || { api_key: '', base_url: '', models: [] },
      };
      await updateChatLLMSetting(payload as any);
      message.success(t('messages.configSaved', '配置已保存'));
    } catch {
      message.error(t('messages.configSaveError', '保存配置失败'));
    }
  };

  const renderProviderConfig = (providerKey: string) => {
    if (!setting) return <span className="text-[var(--text-color-secondary)]">{t('common.loading', '加载中...')}</span>;
    
    let config: any = null;
    if (providerKey === 'openai') config = setting.openai;
    else if (providerKey === 'deepseek') config = setting.deepseek;
    else if (providerKey === 'volce') config = setting.volce;

    const isConfigured = config && (config.api_key || config.base_url);

    const INPUT_CLASS = "!border-gray-300 dark:!border-gray-600 !rounded-lg focus:!ring-2 focus:!ring-indigo-500/20 focus:!border-indigo-500 hover:!border-indigo-500 !bg-[var(--card-bg)] !text-[var(--text-color)]";

    if (providerKey === 'openai') {
      return (
        <Form form={formOpenAI} layout="vertical">
          <Form.Item name={['openai', 'api_key']} label={t('common.apiKey', 'API Key')} rules={[{ required: true, message: t('common.apiKeyRequired', '请输入API Key') }]}>
            <Input.Password className={INPUT_CLASS} placeholder={t('common.apiKeyRequired', '请输入API Key')} />
          </Form.Item>
          <Form.Item name={['openai', 'base_url']} label={t('common.baseUrl', 'Base URL')}>
            <Input className={INPUT_CLASS} placeholder={t('common.baseUrlPlaceholder', '请输入Base URL')} />
          </Form.Item>
          <Form.Item name={['openai', 'models']} label={t('common.models', '模型列表')} rules={[{ required: true, message: t('common.modelsRequired', '请输入模型列表') }]}>
            <Select
              mode="tags"
              className="w-full"
              placeholder={t('common.modelsPlaceholder', '输入模型名称并回车')}
              tokenSeparators={[',']}
              options={buildOptions('openai')}
              allowClear
              showSearch
              loading={!!fetching['openai']}
              onDropdownVisibleChange={(open) => {
                if (!open) return;
                const cfg = formOpenAI.getFieldValue('openai') || {};
                if (!cfg.api_key) return;
                if ((fetchedModels['openai'] || []).length === 0) {
                  handleFetchModels('openai');
                }
              }}
            />
          </Form.Item>
          <Form.Item name={['openai', 'org_id']} label={t('llm.orgId', 'Org ID')}>
            <Input className={INPUT_CLASS} placeholder={t('llm.orgIdPlaceholder', '请输入Org ID')} />
          </Form.Item>
          <Form.Item name={['openai', 'api_type']} label={t('llm.apiType', 'API Type')} rules={[{ required: true, message: t('llm.apiTypeRequired', '请输入API Type') }]}>
            <Input className={INPUT_CLASS} placeholder={t('llm.apiTypeRequired', '请输入API Type')} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" className="bg-indigo-600 hover:bg-indigo-500" onClick={() => handleSave('openai')}>
              {t('common.save', '保存')}
            </Button>
          </Form.Item>
        </Form>
      );
    }

    if (providerKey === 'deepseek') {
      return (
        <Form form={formDeepSeek} layout="vertical">
          <Form.Item name={['deepseek', 'api_key']} label={t('common.apiKey', 'API Key')} rules={[{ required: true, message: t('common.apiKeyRequired', '请输入API Key') }]}>
            <Input.Password className={INPUT_CLASS} placeholder={t('common.apiKeyRequired', '请输入API Key')} />
          </Form.Item>
          <Form.Item name={['deepseek', 'base_url']} label={t('common.baseUrl', 'Base URL')}>
            <Input className={INPUT_CLASS} placeholder={t('common.baseUrlPlaceholder', '请输入Base URL')} />
          </Form.Item>
          <Form.Item name={['deepseek', 'models']} label={t('common.models', '模型列表')} rules={[{ required: true, message: t('common.modelsRequired', '请输入模型列表') }]}>
            <Select
              mode="tags"
              className="w-full"
              placeholder={t('common.modelsPlaceholder', '输入模型名称并回车')}
              tokenSeparators={[',']}
              options={buildOptions('deepseek')}
              allowClear
              showSearch
              loading={!!fetching['deepseek']}
              onDropdownVisibleChange={(open) => {
                if (!open) return;
                const cfg = formDeepSeek.getFieldValue('deepseek') || {};
                if (!cfg.api_key) return;
                if ((fetchedModels['deepseek'] || []).length === 0) {
                  handleFetchModels('deepseek');
                }
              }}
            />
          </Form.Item>
          <Form.Item>
            <Button type="primary" className="bg-indigo-600 hover:bg-indigo-500" onClick={() => handleSave('deepseek')}>
              {t('common.save', '保存')}
            </Button>
          </Form.Item>
        </Form>
      );
    }

    if (providerKey === 'volce') {
      return (
        <Form form={formVolce} layout="vertical">
          <Form.Item name={['volce', 'api_key']} label={t('common.apiKey', 'API Key')} rules={[{ required: true, message: t('common.apiKeyRequired', '请输入API Key') }]}>
            <Input.Password className={INPUT_CLASS} placeholder={t('common.apiKeyRequired', '请输入API Key')} />
          </Form.Item>
          <Form.Item name={['volce', 'base_url']} label={t('common.baseUrl', 'Base URL')}>
            <Input className={INPUT_CLASS} placeholder={t('common.baseUrlPlaceholder', '请输入Base URL')} />
          </Form.Item>
          <Form.Item name={['volce', 'models']} label={t('common.models', '模型列表')}>
            <Select
              mode="tags"
              className="w-full"
              placeholder={t('common.modelsPlaceholder', '输入模型名称并回车')}
              tokenSeparators={[',']}
              options={buildOptions('volce')}
              allowClear
              showSearch
              loading={!!fetching['volce']}
              onDropdownVisibleChange={(open) => {
                if (!open) return;
                const cfg = formVolce.getFieldValue('volce') || {};
                if (!cfg.api_key) return;
                if ((fetchedModels['volce'] || []).length === 0) {
                  handleFetchModels('volce');
                }
              }}
            />
          </Form.Item>
          <Form.Item>
            <Button type="primary" className="bg-indigo-600 hover:bg-indigo-500" onClick={() => handleSave('volce')}>
              {t('common.save', '保存')}
            </Button>
          </Form.Item>
        </Form>
      );
    }

    return null;
  };

  return (
    <div className="space-y-6">
      {PROVIDERS.map(p => (
        <div key={p.key} className="bg-[var(--card-bg)] shadow-sm border border-[var(--border-color)] rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <ProviderHeader keyName={p.key as any} label={p.label} />
            <div />
          </div>
          <div className="pl-7">
            {renderProviderConfig(p.key)}
          </div>
        </div>
      ))}
    </div>
  );
};
