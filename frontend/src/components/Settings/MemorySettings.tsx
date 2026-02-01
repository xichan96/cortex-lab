import { Button, Typography, Descriptions } from 'antd';
import { EditOutlined, DatabaseOutlined } from '@ant-design/icons';
import { useMemorySettings } from '@/hooks/useMemorySettings';
import { MemorySettingModal } from './MemorySettingModal';
import { useI18n } from '@/hooks/useI18n';

const { Title } = Typography;

export const MemorySettings = () => {
  const { setting, handleEdit, modalVisible, form, handleSubmit, handleCloseModal } = useMemorySettings();
  const { t } = useI18n();

  return (
    <div className="space-y-6">
      <div className="bg-[var(--card-bg)] shadow-sm border border-[var(--border-color)] rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <DatabaseOutlined className="text-lg text-indigo-600 dark:text-indigo-400" />
            <Title level={5} style={{ margin: 0 }}>{t('settings.tab.memory', 'Memory Config')}</Title>
          </div>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={handleEdit}
            size="large"
            className="bg-indigo-600 hover:bg-indigo-500"
          >
            {t('memory.editConfigModal', '编辑Memory配置')}
          </Button>
        </div>

        {setting ? (
          <Descriptions column={1} bordered size="middle" className="pl-7">
            <Descriptions.Item label={t('memory.provider', 'Memory Provider')}>
              <span className="font-medium text-indigo-600 dark:text-indigo-400">{setting.provider}</span>
            </Descriptions.Item>
            
            {setting.provider === 'simple' && (
              <>
                <Descriptions.Item label={t('memory.simple.maxHistory', '最大历史消息数')}>{setting.simple?.max_history_messages}</Descriptions.Item>
              </>
            )}

            {setting.provider === 'redis' && (
              <>
                <Descriptions.Item label={t('common.host', 'Host')}>{setting.redis?.host}</Descriptions.Item>
                <Descriptions.Item label={t('common.port', 'Port')}>{setting.redis?.port}</Descriptions.Item>
                <Descriptions.Item label={t('common.username', 'Username')}>{setting.redis?.username || '-'}</Descriptions.Item>
                <Descriptions.Item label={t('memory.redis.db', 'DB')}>{setting.redis?.db}</Descriptions.Item>
                <Descriptions.Item label="Key Prefix">{setting.redis?.key_prefix || '-'}</Descriptions.Item>
                <Descriptions.Item label={t('memory.simple.maxHistory', '最大历史消息数')}>{setting.redis?.max_history_messages}</Descriptions.Item>
              </>
            )}

            {setting.provider === 'mongodb' && (
              <>
                <Descriptions.Item label="URI">{setting.mongodb?.uri}</Descriptions.Item>
                <Descriptions.Item label="Database">{setting.mongodb?.database}</Descriptions.Item>
                <Descriptions.Item label="Collection">{setting.mongodb?.collection}</Descriptions.Item>
                <Descriptions.Item label={t('memory.simple.maxHistory', '最大历史消息数')}>{setting.mongodb?.max_history_messages}</Descriptions.Item>
              </>
            )}

            {setting.provider === 'sqlite' && (
              <>
                <Descriptions.Item label="DSN">{setting.sqlite?.dsn}</Descriptions.Item>
                <Descriptions.Item label="Table Name">{setting.sqlite?.table_name}</Descriptions.Item>
                <Descriptions.Item label={t('memory.simple.maxHistory', '最大历史消息数')}>{setting.sqlite?.max_history_messages}</Descriptions.Item>
              </>
            )}

            {setting.provider === 'mysql' && (
              <>
                <Descriptions.Item label={t('common.host', 'Host')}>{setting.mysql?.host}</Descriptions.Item>
                <Descriptions.Item label={t('common.port', 'Port')}>{setting.mysql?.port}</Descriptions.Item>
                <Descriptions.Item label={t('common.username', 'Username')}>{setting.mysql?.username || '-'}</Descriptions.Item>
                <Descriptions.Item label="Database">{setting.mysql?.database}</Descriptions.Item>
                <Descriptions.Item label="Table Name">{setting.mysql?.table_name}</Descriptions.Item>
                <Descriptions.Item label={t('memory.simple.maxHistory', '最大历史消息数')}>{setting.mysql?.max_history_messages}</Descriptions.Item>
              </>
            )}
          </Descriptions>
        ) : (
          <div className="pl-7 text-[var(--text-color-secondary)]">{t('common.noConfig', '暂无配置')}</div>
        )}
      </div>

      <MemorySettingModal
        visible={modalVisible}
        form={form}
        onSubmit={handleSubmit}
        onClose={handleCloseModal}
      />
    </div>
  );
};
