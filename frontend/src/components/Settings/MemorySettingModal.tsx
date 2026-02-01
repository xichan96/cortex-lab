import { Modal, Form, Input, Select, InputNumber, Divider } from 'antd';
import { UpdateMemorySettingRequest } from '@/apis/setting';
import { useI18n } from '@/hooks/useI18n';

const INPUT_CLASS = "!border-gray-300 dark:!border-gray-600 !rounded-lg focus:!ring-2 focus:!ring-indigo-500/20 focus:!border-indigo-500 hover:!border-indigo-500 !bg-[var(--card-bg)] !text-[var(--text-color)]";

interface MemorySettingModalProps {
  visible: boolean;
  form: any;
  onSubmit: (values: UpdateMemorySettingRequest) => void;
  onClose: () => void;
}

export const MemorySettingModal = ({
  visible,
  form,
  onSubmit,
  onClose,
}: MemorySettingModalProps) => {
  const { t } = useI18n();
  const provider = Form.useWatch('provider', form);

  return (
    <Modal
      title={t('memory.editConfigModal', '编辑Memory配置')}
      open={visible}
      onOk={() => form.submit()}
      onCancel={onClose}
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onSubmit}
        initialValues={{ provider: 'simple' }}
      >
        <Form.Item
          name="provider"
          label={t('memory.provider', 'Memory Provider')}
          rules={[{ required: true, message: t('memory.providerRequired', '请选择Provider') }]}
        >
          <Select>
            <Select.Option value="simple">Simple (In-Memory)</Select.Option>
            <Select.Option value="redis">Redis</Select.Option>
            <Select.Option value="mongodb">MongoDB</Select.Option>
            <Select.Option value="sqlite">SQLite</Select.Option>
            <Select.Option value="mysql">MySQL</Select.Option>
          </Select>
        </Form.Item>

        <Divider />

        {provider === 'simple' && (
          <>
            <Form.Item
              name={['simple', 'max_history_messages']}
              label={t('memory.simple.maxHistory', '最大历史消息数')}
              rules={[{ required: true, message: t('memory.simple.maxHistoryRequired', '请输入最大历史消息数') }]}
            >
              <InputNumber className={INPUT_CLASS} style={{ width: '100%' }} min={1} />
            </Form.Item>
          </>
        )}

        {provider === 'redis' && (
          <>
            <Form.Item
              name={['redis', 'host']}
              label={t('common.host', 'Host')}
              rules={[{ required: true, message: t('common.hostRequired', '请输入Host') }]}
            >
              <Input className={INPUT_CLASS} placeholder="localhost" />
            </Form.Item>
            <Form.Item
              name={['redis', 'port']}
              label={t('common.port', 'Port')}
              rules={[{ required: true, message: t('common.portRequired', '请输入Port') }]}
            >
              <InputNumber className={INPUT_CLASS} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item
              name={['redis', 'username']}
              label={t('common.username', 'Username')}
            >
              <Input className={INPUT_CLASS} />
            </Form.Item>
            <Form.Item
              name={['redis', 'password']}
              label={t('common.password', 'Password')}
            >
              <Input.Password className={INPUT_CLASS} />
            </Form.Item>
            <Form.Item
              name={['redis', 'db']}
              label={t('memory.redis.db', 'DB')}
              rules={[{ required: true, message: t('memory.redis.dbRequired', '请输入DB') }]}
            >
              <InputNumber className={INPUT_CLASS} style={{ width: '100%' }} min={0} />
            </Form.Item>
            <Form.Item
              name={['redis', 'key_prefix']}
              label={t('memory.redis.keyPrefix', 'Key Prefix')}
            >
              <Input className={INPUT_CLASS} placeholder="memory:" />
            </Form.Item>
            <Form.Item
              name={['redis', 'max_history_messages']}
              label={t('memory.redis.maxHistory', '最大历史消息数')}
              rules={[{ required: true, message: t('memory.redis.maxHistoryRequired', '请输入最大历史消息数') }]}
            >
              <InputNumber className={INPUT_CLASS} style={{ width: '100%' }} min={1} />
            </Form.Item>
          </>
        )}

        {provider === 'mongodb' && (
          <>
            <Form.Item
              name={['mongodb', 'uri']}
              label={t('memory.mongodb.uri', 'URI')}
              rules={[{ required: true, message: t('memory.mongodb.uriRequired', '请输入URI') }]}
            >
              <Input className={INPUT_CLASS} placeholder="mongodb://localhost:27017" />
            </Form.Item>
            <Form.Item
              name={['mongodb', 'database']}
              label={t('memory.mongodb.database', 'Database')}
              rules={[{ required: true, message: t('memory.mongodb.databaseRequired', '请输入Database') }]}
            >
              <Input className={INPUT_CLASS} />
            </Form.Item>
            <Form.Item
              name={['mongodb', 'collection']}
              label={t('memory.mongodb.collection', 'Collection')}
              rules={[{ required: true, message: t('memory.mongodb.collectionRequired', '请输入Collection') }]}
            >
              <Input className={INPUT_CLASS} />
            </Form.Item>
            <Form.Item
              name={['mongodb', 'max_history_messages']}
              label={t('memory.mongodb.maxHistory', '最大历史消息数')}
              rules={[{ required: true, message: t('memory.mongodb.maxHistoryRequired', '请输入最大历史消息数') }]}
            >
              <InputNumber className={INPUT_CLASS} style={{ width: '100%' }} min={1} />
            </Form.Item>
          </>
        )}

        {provider === 'sqlite' && (
          <>
            <Form.Item
              name={['sqlite', 'dsn']}
              label="DSN"
              rules={[{ required: true, message: '请输入DSN' }]}
            >
              <Input className={INPUT_CLASS} placeholder="file:memory.db?cache=shared" />
            </Form.Item>
            <Form.Item
              name={['sqlite', 'table_name']}
              label="Table Name"
              rules={[{ required: true, message: '请输入Table Name' }]}
            >
              <Input className={INPUT_CLASS} placeholder="chat_messages" />
            </Form.Item>
            <Form.Item
              name={['sqlite', 'max_history_messages']}
              label={t('memory.simple.maxHistory', '最大历史消息数')}
              rules={[{ required: true, message: t('memory.simple.maxHistoryRequired', '请输入最大历史消息数') }]}
            >
              <InputNumber className={INPUT_CLASS} style={{ width: '100%' }} min={1} />
            </Form.Item>
          </>
        )}

        {provider === 'mysql' && (
          <>
            <Form.Item
              name={['mysql', 'host']}
              label={t('common.host', 'Host')}
              rules={[{ required: true, message: t('common.hostRequired', '请输入Host') }]}
            >
              <Input className={INPUT_CLASS} placeholder="localhost" />
            </Form.Item>
            <Form.Item
              name={['mysql', 'port']}
              label={t('common.port', 'Port')}
              rules={[{ required: true, message: t('common.portRequired', '请输入Port') }]}
            >
              <InputNumber className={INPUT_CLASS} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item
              name={['mysql', 'username']}
              label={t('common.username', 'Username')}
              rules={[{ required: true, message: t('common.usernameRequired', '请输入Username') }]}
            >
              <Input className={INPUT_CLASS} />
            </Form.Item>
            <Form.Item
              name={['mysql', 'password']}
              label={t('common.password', 'Password')}
              rules={[{ required: true, message: t('common.passwordRequired', '请输入Password') }]}
            >
              <Input.Password className={INPUT_CLASS} />
            </Form.Item>
            <Form.Item
              name={['mysql', 'database']}
              label="Database"
              rules={[{ required: true, message: '请输入Database' }]}
            >
              <Input className={INPUT_CLASS} />
            </Form.Item>
            <Form.Item
              name={['mysql', 'table_name']}
              label="Table Name"
              rules={[{ required: true, message: '请输入Table Name' }]}
            >
              <Input className={INPUT_CLASS} placeholder="chat_messages" />
            </Form.Item>
            <Form.Item
              name={['mysql', 'max_history_messages']}
              label={t('memory.simple.maxHistory', '最大历史消息数')}
              rules={[{ required: true, message: t('memory.simple.maxHistoryRequired', '请输入最大历史消息数') }]}
            >
              <InputNumber className={INPUT_CLASS} style={{ width: '100%' }} min={1} />
            </Form.Item>
          </>
        )}
      </Form>
    </Modal>
  );
};
