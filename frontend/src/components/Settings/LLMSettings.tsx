import { Button, Typography, Descriptions } from 'antd';
import { EditOutlined, RobotOutlined } from '@ant-design/icons';
import { useLLMSettings } from '@/hooks/useLLMSettings';
import { LLMSettingModal } from './LLMSettingModal';
import { useI18n } from '@/hooks/useI18n';

const { Title } = Typography;

export const LLMSettings = () => {
  const { setting, handleEdit, modalVisible, form, handleSubmit, handleCloseModal } = useLLMSettings();
  const { t } = useI18n();

  return (
    <div className="space-y-6">
      <div className="bg-[var(--card-bg)] shadow-sm border border-[var(--border-color)] rounded-xl p-6">
        <div className="flex justify-end mb-4">
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={handleEdit}
            size="large"
            className="bg-indigo-600 hover:bg-indigo-500"
          >
            {t('llm.editConfig', '编辑LLM配置')}
          </Button>
        </div>

        {setting ? (
          <Descriptions column={1} bordered size="middle" className="pl-7">
            <Descriptions.Item label={t('llm.currentProvider', '当前提供商')}>
              <span className="font-medium text-indigo-600 dark:text-indigo-400">{setting.provider}</span>
            </Descriptions.Item>
            
            {setting.provider === 'openai' && (
              <>
                <Descriptions.Item label="Base URL">{setting.openai.base_url}</Descriptions.Item>
                <Descriptions.Item label="Model">{setting.openai.model}</Descriptions.Item>
                <Descriptions.Item label="API Type">{setting.openai.api_type}</Descriptions.Item>
              </>
            )}
            {setting.provider === 'deepseek' && (
              <>
                <Descriptions.Item label="Base URL">{setting.deepseek.base_url}</Descriptions.Item>
                <Descriptions.Item label="Model">{setting.deepseek.model}</Descriptions.Item>
              </>
            )}
            {setting.provider === 'volce' && (
              <>
                <Descriptions.Item label="Base URL">{setting.volce.base_url || t('common.notSet', '未设置')}</Descriptions.Item>
                <Descriptions.Item label="Model">{setting.volce.model || t('common.notSet', '未设置')}</Descriptions.Item>
              </>
            )}
          </Descriptions>
        ) : (
          <div className="pl-7 text-[var(--text-color-secondary)]">{t('common.noConfig', '暂无配置')}</div>
        )}
      </div>

      <LLMSettingModal
        visible={modalVisible}
        form={form}
        onSubmit={handleSubmit}
        onClose={handleCloseModal}
      />
    </div>
  );
};
