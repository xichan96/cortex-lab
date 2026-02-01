import { Modal, Form, Input, message } from 'antd';
import { useState } from 'react';
import { updateUser } from '@/apis/user';
import { useAuthStore } from '@/store';
import { useI18n } from '@/hooks/useI18n';

interface ChangePasswordModalProps {
  open: boolean;
  onCancel: () => void;
}

export default function ChangePasswordModal({ open, onCancel }: ChangePasswordModalProps) {
  const [form] = Form.useForm();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const { t } = useI18n();

  const handleSubmit = async (values: any) => {
    if (!user) return;
    
    if (values.password !== values.confirmPassword) {
      message.error(t('changePassword.passwordMismatchError', '两次输入的密码不一致'));
      return;
    }

    try {
      setLoading(true);
      await updateUser(user.id, { 
        id: user.id,
        password: values.password 
      });
      message.success(t('changePassword.success', '密码修改成功'));
      onCancel();
      form.resetFields();
    } catch (error) {
      console.error(error);
      message.error(t('changePassword.failed', '密码修改失败'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={t('header.changePassword', '修改密码')}
      open={open}
      onCancel={() => {
        onCancel();
        form.resetFields();
      }}
      onOk={() => form.submit()}
      confirmLoading={loading}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <Form.Item
          name="password"
          label={t('changePassword.newPassword', '新密码')}
          rules={[{ required: true, message: t('changePassword.newPasswordRequired', '请输入新密码') }]}
        >
          <Input.Password placeholder={t('changePassword.newPasswordPlaceholder', '请输入新密码')} />
        </Form.Item>
        <Form.Item
          name="confirmPassword"
          label={t('changePassword.confirmNewPassword', '确认新密码')}
          rules={[{ required: true, message: t('changePassword.confirmNewPasswordRequired', '请再次输入新密码') }]}
        >
          <Input.Password placeholder={t('changePassword.confirmNewPasswordPlaceholder', '请再次输入新密码')} />
        </Form.Item>
      </Form>
    </Modal>
  );
}
