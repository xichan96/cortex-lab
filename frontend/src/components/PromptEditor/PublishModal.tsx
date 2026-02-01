import React from 'react';
import { Modal, Input } from 'antd';
import { useI18n } from '@/hooks/useI18n';

interface PublishModalProps {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  confirmLoading: boolean;
  description: string;
  onDescriptionChange: (value: string) => void;
}

const PublishModal: React.FC<PublishModalProps> = ({
  open,
  onCancel,
  onConfirm,
  confirmLoading,
  description,
  onDescriptionChange,
}) => {
  const { t } = useI18n();
  return (
    <Modal
      title={t('promptEditor.publishTitle', '发布提示词')}
      open={open}
      onOk={onConfirm}
      onCancel={onCancel}
      confirmLoading={confirmLoading}
    >
      <Input.TextArea
        rows={4}
        value={description}
        onChange={(e) => onDescriptionChange(e.target.value)}
        placeholder={t('promptEditor.publishDescriptionPlaceholder', '请输入发布说明')}
      />
    </Modal>
  );
};

export default PublishModal;
