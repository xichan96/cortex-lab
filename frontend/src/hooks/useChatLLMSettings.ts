import { useState, useEffect } from 'react';
import { Form, message } from 'antd';
import { 
  getChatLLMSetting, 
  updateChatLLMSetting,
  ChatLLMSetting,
  UpdateChatLLMSettingRequest
} from '@/apis/setting';

export const useChatLLMSettings = (options?: { maskSensitive?: boolean }) => {
  const [loading, setLoading] = useState(false);
  const [setting, setSetting] = useState<ChatLLMSetting | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProvider, setEditingProvider] = useState<string | null>(null);
  const [form] = Form.useForm();

  const maskSensitive = options?.maskSensitive;

  const fetchSetting = async () => {
    try {
      setLoading(true);
      const res = await getChatLLMSetting({ mask_sensitive: maskSensitive });
      setSetting(res);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSetting();
  }, [maskSensitive]);

  const handleEdit = (provider: string) => {
    if (setting) {
      form.setFieldsValue(setting);
    }
    setEditingProvider(provider);
    setModalVisible(true);
  };

  const handleSubmit = async (values: UpdateChatLLMSettingRequest) => {
    try {
      const newSetting = {
        ...setting,
        ...values,
      } as UpdateChatLLMSettingRequest;

      await updateChatLLMSetting(newSetting);
      message.success('更新成功');
      setModalVisible(false);
      setEditingProvider(null);
      fetchSetting();
    } catch (error) {
      message.error('更新失败');
    }
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setEditingProvider(null);
    form.resetFields();
  };

  return {
    loading,
    setting,
    modalVisible,
    editingProvider,
    form,
    handleEdit,
    handleSubmit,
    handleCloseModal,
  };
};
