import React, { useState, useRef } from 'react';
import { Input, Button, Select } from 'antd';
import { SendOutlined } from '@ant-design/icons';
import { ProviderIcon } from '@/components/Icons/ProviderIcons';
import { Role } from '@/apis/role';
import { Avatar } from '@/components/role/Avatar';
import { useI18n } from '@/hooks/useI18n';
import styles from './index.module.scss';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  roles: Role[];
  currentRole?: Role;
  onRoleChange: (roleId: string) => void;
  models: { provider: string; model: string }[];
  currentModel: string;
  onModelChange: (model: string) => void;
  configLocked?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ 
  onSend, 
  disabled,
  roles,
  currentRole,
  onRoleChange,
  models,
  currentModel,
  onModelChange,
  configLocked
}) => {
  const { t } = useI18n();
  const [value, setValue] = useState('');
  const textareaRef = useRef<any>(null);

  const handleSend = () => {
    if (!value.trim() || disabled) return;
    onSend(value);
    setValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={styles.inputArea}>
      <div className={styles.inputContainer}>
        <div className={styles.inputWrapper}>
          <Input.TextArea
            ref={textareaRef}
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t('chat.placeholder')}
          autoSize={{ minRows: 3, maxRows: 12 }}
          bordered={false}
          className={styles.messageInput}
          disabled={disabled}
        />
        
        <div className={styles.inputToolbar}>
          <div className={styles.toolbarLeft}>
            <Select
              value={currentRole?.id}
              onChange={onRoleChange}
              className="w-auto"
              placeholder={t('chat.selectRole')}
              options={roles.map(r => ({ 
                label: (
                  <div className="flex items-center gap-2">
                    <Avatar avatar={r.avatar} name={r.name} size={18} />
                    <span title={r.name}>{r.name}</span>
                  </div>
                ), 
                value: r.id 
              }))}
              optionLabelProp="label"
              size="small"
              variant="borderless"
              popupMatchSelectWidth={false}
              disabled={disabled || configLocked}
            >
              {roles.map(r => (
                <Select.Option key={r.id} value={r.id} label={
                  <div className="flex items-center gap-2">
                    <Avatar avatar={r.avatar} name={r.name} size={20} />
                    <span className="hidden lg:inline" title={r.name}>{r.name}</span>
                  </div>
                }>
                  <div className="flex items-center gap-2">
                    <Avatar avatar={r.avatar} name={r.name} size={18} />
                    <span title={r.name}>{r.name}</span>
                  </div>
                </Select.Option>
              ))}
            </Select>

            <Select
              value={currentModel}
              onChange={onModelChange}
              className="w-auto"
              optionLabelProp="label"
              size="small"
              variant="borderless"
              popupMatchSelectWidth={false}
              disabled={disabled || configLocked}
            >
              {models.map(m => (
                <Select.Option key={m.model} value={m.model} label={
                  <div className="flex items-center gap-2">
                    <ProviderIcon keyName={m.provider} />
                    <span className="hidden lg:inline text-xs" title={m.model}>
                      {m.model.length > 15 ? `${m.model.slice(0, 15)}...` : m.model}
                    </span>
                  </div>
                }>
                  <div className="flex items-center gap-2">
                    <ProviderIcon keyName={m.provider} />
                    <span title={m.model}>{m.model}</span>
                  </div>
                </Select.Option>
              ))}
            </Select>

          </div>
          
          <div className={styles.toolbarRight}>
            <Button 
              type="primary" 
              icon={<SendOutlined />} 
              onClick={handleSend}
              disabled={!value.trim() || disabled}
              className={styles.sendButton}
            />
          </div>
        </div>
      </div>
      <div className={styles.disclaimer}>
        {t('chat.disclaimer')}
      </div>
      </div>
    </div>
  );
};

export default ChatInput;
