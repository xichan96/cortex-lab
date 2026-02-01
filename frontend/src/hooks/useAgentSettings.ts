import { useState, useEffect } from 'react';
import { Form, message } from 'antd';
import { 
  getAgentSetting, 
  updateAgentSetting,
  AgentSetting,
  UpdateAgentSettingRequest
} from '@/apis/setting';

export const useAgentSettings = () => {
  const [loading, setLoading] = useState(false);
  const [setting, setSetting] = useState<AgentSetting | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

  const fetchSetting = async () => {
    try {
      setLoading(true);
      const res = await getAgentSetting();
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

  const handleSubmit = async (values: UpdateAgentSettingRequest) => {
    try {
      await updateAgentSetting(values);
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

