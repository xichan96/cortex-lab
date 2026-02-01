import { Modal, Form, Input, Select, FormInstance } from 'antd';
import { UpdateAgentSettingRequest } from '@/apis/setting';
import { useI18n } from '@/hooks/useI18n';

const INPUT_CLASS = "!border-gray-300 dark:!border-gray-600 !rounded-lg focus:!ring-2 focus:!ring-indigo-500/20 focus:!border-indigo-500 hover:!border-indigo-500 !bg-[var(--card-bg)] !text-[var(--text-color)]";

interface AgentSettingModalProps {
  visible: boolean;
  form: FormInstance;
  onSubmit: (values: UpdateAgentSettingRequest) => void;
  onClose: () => void;
}

export const AgentSettingModal = ({ visible, form, onSubmit, onClose }: AgentSettingModalProps) => {
  const { t } = useI18n();
  return (
    <Modal
      title={t('agent.editConfigModal', '编辑Agent配置')}
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
        <Form.Item
          name="name"
          label={t('common.name', '名称')}
        >
          <Input className={INPUT_CLASS} placeholder={t('agent.namePlaceholder', '请输入Agent名称')} />
        </Form.Item>
        <Form.Item
          name="prompt"
          label={t('agent.prompt', '提示词')}
        >
          <Input.TextArea className={INPUT_CLASS} placeholder={t('agent.promptPlaceholder', '请输入Agent提示词')} rows={6} />
        </Form.Item>
        <Form.Item
          name="tools"
          label={t('agent.tools', '工具列表 (MCP)')}
          rules={[
            {
              validator: (_, value) => {
                if (!value || value.length === 0) {
                  return Promise.resolve();
                }
                const urlPattern = /^https?:\/\/.+/;
                const invalidUrls = value.filter((url: string) => !urlPattern.test(url));
                if (invalidUrls.length > 0) {
                  return Promise.reject(new Error(t('agent.toolsUrlInvalid', '请输入有效的 URL 链接（以 http:// 或 https:// 开头）')));
                }
                return Promise.resolve();
              },
            },
          ]}
        >
          <Select
            mode="tags"
            placeholder={t('agent.toolsPlaceholder', '请输入 MCP 工具链接（URL），按回车添加')}
            style={{ width: '100%' }}
            tokenSeparators={[',']}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};
