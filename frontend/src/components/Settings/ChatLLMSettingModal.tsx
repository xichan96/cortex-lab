 import { Modal, Form, Input, Select, FormInstance, Button, message } from 'antd';
 import { ChatLLMSetting, UpdateChatLLMSettingRequest, fetchLLMModels } from '@/apis/setting';
 import { useI18n } from '@/hooks/useI18n';
 import { useMemo, useState } from 'react';
 
 const INPUT_CLASS = "!border-gray-300 dark:!border-gray-600 !rounded-lg focus:!ring-2 focus:!ring-indigo-500/20 focus:!border-indigo-500 hover:!border-indigo-500 !bg-[var(--card-bg)] !text-[var(--text-color)]";
 
 interface ChatLLMSettingModalProps {
   visible: boolean;
   form: FormInstance;
   provider: string | null;
   setting?: ChatLLMSetting | null;
   onSubmit: (values: UpdateChatLLMSettingRequest) => void;
   onClose: () => void;
 }
 
 export const ChatLLMSettingModal = ({ visible, form, provider, setting, onSubmit, onClose }: ChatLLMSettingModalProps) => {
   const { t } = useI18n();
   const [fetching, setFetching] = useState<{ [k: string]: boolean }>({});
   const [fetchedModels, setFetchedModels] = useState<{ [k: string]: string[] }>({});
 
   const RECOMMENDED = useMemo(() => ({
     openai: ['gpt-4o', 'gpt-4o-mini', 'o3-mini', 'gpt-4.1', 'gpt-4.1-mini'],
     deepseek: ['deepseek-chat', 'deepseek-reasoner'],
     volce: ['volce-chat', 'volce-lite']
   }), []);
 
   const DEFAULT_BASE_URLS: Record<string, string> = {
     openai: 'https://api.openai.com',
     deepseek: 'https://api.deepseek.com',
     volce: 'https://ark.cn-beijing.volces.com/api/v3',
   };
 
   const buildOptions = (key: string | null) => {
     if (!key) return [];
     const rec = RECOMMENDED[key] || [];
     const fetched = fetchedModels[key] || [];
     const merged = Array.from(new Set([...rec, ...fetched]));
     return merged.map(m => ({ label: m, value: m }));
   };
 
   const normalizeBaseUrl = (u: string) => u ? u.replace(/\/+$/, '') : '';
 
   const getModelsUrl = (prov: string, base: string) => {
     const b = normalizeBaseUrl(base);
     switch (prov) {
       case 'openai':
       case 'deepseek':
         return `${b}/v1/models`;
       case 'volce':
       default:
         return `${b}/v1/models`;
     }
   };
 
   const handleFetchModels = async (key: string) => {
     try {
       setFetching(s => ({ ...s, [key]: true }));
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
   
   const getProviderName = (p: string | null) => {
     switch(p) {
       case 'openai': return 'OpenAI';
       case 'deepseek': return 'DeepSeek';
       case 'volce': return 'Volce';
       default: return '';
     }
   };
 
   return (
     <Modal
       title={`${t('llm.editChatConfig', '编辑对话LLM配置')} - ${getProviderName(provider)}`}
       open={visible}
       onCancel={onClose}
       onOk={() => form.submit()}
       width={800}
     >
       <Form
         form={form}
         layout="vertical"
         onFinish={onSubmit}
       >
         {provider === 'openai' && (
           <>
             <Form.Item
               name={['openai', 'api_key']}
               label={t('common.apiKey', 'API Key')}
               rules={[{ required: true, message: t('common.apiKeyRequired', '请输入API Key') }]}
             >
               <Input.Password className={INPUT_CLASS} placeholder={t('common.apiKeyRequired', '请输入API Key')} />
             </Form.Item>
              <Form.Item
                name={['openai', 'base_url']}
                label={t('common.baseUrl', 'Base URL')}
              >
                <Input className={INPUT_CLASS} placeholder={t('common.baseUrlRequired', '请输入Base URL')} />
              </Form.Item>
             <Form.Item
               name={['openai', 'models']}
               label={t('common.models', 'Models')}
               rules={[{ required: true, message: t('common.modelsRequired', '请输入Models') }]}
             >
                <div className="flex items-start gap-2">
                  <div className="flex-1">
                    <Select
                      mode="tags"
                      className="w-full"
                      placeholder={t('common.modelsPlaceholder', '输入模型名称并回车')}
                      tokenSeparators={[',']}
                      options={buildOptions('openai')}
                      allowClear
                      showSearch
                    />
                  </div>
                  <Button
                    onClick={() => handleFetchModels('openai')}
                    loading={!!fetching['openai']}
                  >
                    {t('llm.fetchModels', '自动获取模型')}
                  </Button>
                </div>
             </Form.Item>
             <Form.Item
               name={['openai', 'org_id']}
               label={t('llm.orgId', 'Org ID')}
             >
               <Input className={INPUT_CLASS} placeholder={t('llm.orgIdPlaceholder', '请输入Org ID')} />
             </Form.Item>
             <Form.Item
               name={['openai', 'api_type']}
               label={t('llm.apiType', 'API Type')}
               rules={[{ required: true, message: t('llm.apiTypeRequired', '请输入API Type') }]}
             >
               <Input className={INPUT_CLASS} placeholder={t('llm.apiTypeRequired', '请输入API Type')} />
             </Form.Item>
           </>
         )}
 
         {provider === 'deepseek' && (
           <>
             <Form.Item
               name={['deepseek', 'api_key']}
               label={t('common.apiKey', 'API Key')}
               rules={[{ required: true, message: t('common.apiKeyRequired', '请输入API Key') }]}
             >
               <Input.Password className={INPUT_CLASS} placeholder={t('common.apiKeyRequired', '请输入API Key')} />
             </Form.Item>
              <Form.Item
                name={['deepseek', 'base_url']}
                label={t('common.baseUrl', 'Base URL')}
              >
                <Input className={INPUT_CLASS} placeholder={t('common.baseUrlRequired', '请输入Base URL')} />
              </Form.Item>
             <Form.Item
               name={['deepseek', 'models']}
               label={t('common.models', 'Models')}
               rules={[{ required: true, message: t('common.modelsRequired', '请输入Models') }]}
             >
                <div className="flex items-start gap-2">
                  <div className="flex-1">
                    <Select
                      mode="tags"
                      className="w-full"
                      placeholder={t('common.modelsPlaceholder', '输入模型名称并回车')}
                      tokenSeparators={[',']}
                      options={buildOptions('deepseek')}
                      allowClear
                      showSearch
                    />
                  </div>
                  <Button
                    onClick={() => handleFetchModels('deepseek')}
                    loading={!!fetching['deepseek']}
                  >
                    {t('llm.fetchModels', '自动获取模型')}
                  </Button>
                </div>
             </Form.Item>
           </>
         )}
 
         {provider === 'volce' && (
           <>
             <Form.Item
               name={['volce', 'api_key']}
               label={t('common.apiKey', 'API Key')}
               rules={[{ required: true, message: t('common.apiKeyRequired', '请输入API Key') }]}
             >
               <Input.Password className={INPUT_CLASS} placeholder={t('common.apiKeyRequired', '请输入API Key')} />
             </Form.Item>
             <Form.Item
               name={['volce', 'base_url']}
               label={t('common.baseUrl', 'Base URL')}
             >
               <Input className={INPUT_CLASS} placeholder={t('common.baseUrlRequired', '请输入Base URL')} />
             </Form.Item>
             <Form.Item
               name={['volce', 'models']}
               label={t('common.models', 'Models')}
             >
                <div className="flex items-start gap-2">
                  <div className="flex-1">
                    <Select
                      mode="tags"
                      className="w-full"
                      placeholder={t('common.modelsPlaceholder', '输入模型名称并回车')}
                      tokenSeparators={[',']}
                      options={buildOptions('volce')}
                      allowClear
                      showSearch
                    />
                  </div>
                  <Button
                    onClick={() => handleFetchModels('volce')}
                    loading={!!fetching['volce']}
                  >
                    {t('llm.fetchModels', '自动获取模型')}
                  </Button>
                </div>
             </Form.Item>
           </>
         )}
       </Form>
     </Modal>
   );
 };
