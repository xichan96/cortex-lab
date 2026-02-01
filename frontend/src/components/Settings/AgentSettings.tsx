import { Button, Typography, Descriptions } from 'antd';
import { EditOutlined, AppstoreOutlined } from '@ant-design/icons';
import { useAgentSettings } from '@/hooks/useAgentSettings';
import { AgentSettingModal } from './AgentSettingModal';
import { useI18n } from '@/hooks/useI18n';

const { Title } = Typography;

export const AgentSettings = () => {
  const { setting, handleEdit, modalVisible, form, handleSubmit, handleCloseModal } = useAgentSettings();
  const { t } = useI18n();

  return (
    <div className="space-y-6">
      <div className="bg-[var(--card-bg)] shadow-sm border border-[var(--border-color)] rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <AppstoreOutlined className="text-lg text-indigo-600 dark:text-indigo-400" />
            <Title level={5} style={{ margin: 0 }}>{t('settings.tab.agent', 'Agent Config')}</Title>
          </div>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={handleEdit}
            size="large"
            className="bg-indigo-600 hover:bg-indigo-500"
          >
            {t('agent.editConfigModal', '编辑Agent配置')}
          </Button>
        </div>

        {setting ? (
          <Descriptions column={1} bordered size="middle" className="pl-7">
            <Descriptions.Item label={t('common.name', '名称')}>
              {setting.name || t('common.notSet', '未设置')}
            </Descriptions.Item>
            <Descriptions.Item label={t('agent.prompt', '提示词')}>
              <div className="whitespace-pre-wrap max-h-60 overflow-y-auto">
                {setting.prompt || t('common.notSet', '未设置')}
              </div>
            </Descriptions.Item>
            <Descriptions.Item label={t('agent.tools', '工具列表 (MCP)')}>
              {setting.tools && setting.tools.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {setting.tools.map((tool, index) => (
                    <span key={index} className="px-2 py-1 bg-[var(--item-hover-bg)] rounded text-sm text-[var(--text-color)] border border-[var(--border-color)]">
                      {tool}
                    </span>
                  ))}
                </div>
              ) : (
                t('common.notSet', '未设置')
              )}
            </Descriptions.Item>
          </Descriptions>
        ) : (
          <div className="pl-7 text-[var(--text-color-secondary)]">{t('common.noConfig', '暂无配置')}</div>
        )}
      </div>

      <AgentSettingModal
        visible={modalVisible}
        form={form}
        onSubmit={handleSubmit}
        onClose={handleCloseModal}
      />
    </div>
  );
};
