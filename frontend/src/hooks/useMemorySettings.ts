import { useState, useEffect } from 'react';
import { Form, message } from 'antd';
import { 
  getMemorySetting, 
  updateMemorySetting,
  MemorySetting,
  UpdateMemorySettingRequest
} from '@/apis/setting';

export const useMemorySettings = () => {
  const [loading, setLoading] = useState(false);
  const [setting, setSetting] = useState<MemorySetting | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

  const fetchSetting = async () => {
    try {
      setLoading(true);
      const res = await getMemorySetting();
      setSetting(res);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSetting();
  }, []);

  const handleEdit = () => {
    if (setting) {
      form.setFieldsValue(setting);
    }
    setModalVisible(true);
  };

  const handleSubmit = async (values: UpdateMemorySettingRequest) => {
    try {
      await updateMemorySetting(values);
      message.success('更新成功');
      setModalVisible(false);
      fetchSetting();
    } catch (error) {
      message.error('更新失败');
    }
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    form.resetFields();
  };

  return {
    loading,
    setting,
    modalVisible,
    form,
    handleEdit,
    handleSubmit,
    handleCloseModal,
  };
};
