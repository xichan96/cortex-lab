import { useState, useEffect } from 'react';
import { Form, message } from 'antd';
import { 
  getSettings, 
  createSetting, 
  updateSetting, 
  deleteSetting,
  Setting,
  CreateSettingRequest,
  UpdateSettingRequest,
  DeleteSettingRequest
} from '@/apis/setting';
import { parseJsonValue, buildJsonFromFields, JsonField } from '@/utils/jsonParser';

export const useGeneralSettings = () => {
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<Setting[]>([]);
  const [editingSetting, setEditingSetting] = useState<Setting | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [filterGroup, setFilterGroup] = useState<string>('');
  const [valueIsJson, setValueIsJson] = useState(false);
  const [jsonFields, setJsonFields] = useState<JsonField[]>([]);
  const [form] = Form.useForm();

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const params = filterGroup ? { group: filterGroup } : undefined;
      const res = await getSettings(params);
      setSettings(res);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, [filterGroup]);

  const handleEdit = (record: Setting) => {
    setEditingSetting(record);
    const jsonResult = parseJsonValue(record.value);
    setValueIsJson(jsonResult.isJson);
    if (jsonResult.isJson) {
      setJsonFields(jsonResult.fields);
      form.setFieldsValue({
        group: record.group,
        key: record.key,
        jsonFields: jsonResult.fields,
      });
    } else {
      setJsonFields([]);
      form.setFieldsValue({ ...record });
    }
    setModalVisible(true);
  };

  const handleDelete = async (record: Setting) => {
    try {
      await deleteSetting({ group: record.group, key: record.key } as DeleteSettingRequest);
      message.success('删除成功');
      fetchSettings();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      const submitValue = valueIsJson && values.jsonFields 
        ? buildJsonFromFields(values.jsonFields)
        : values.value;

      const submitData = {
        group: values.group,
        key: values.key,
        value: submitValue,
      };

      if (editingSetting) {
        await updateSetting(submitData as UpdateSettingRequest);
        message.success('更新成功');
      } else {
        await createSetting(submitData as CreateSettingRequest);
        message.success('创建成功');
      }
      fetchSettings();
      handleCloseModal();
    } catch (error) {
      message.error(editingSetting ? '更新失败' : '创建失败');
    }
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    form.resetFields();
    setEditingSetting(null);
    setValueIsJson(false);
    setJsonFields([]);
  };

  const handleCreate = () => {
    form.resetFields();
    setEditingSetting(null);
    setValueIsJson(false);
    setJsonFields([]);
    setModalVisible(true);
  };

  return {
    loading,
    settings,
    editingSetting,
    modalVisible,
    filterGroup,
    valueIsJson,
    jsonFields,
    form,
    setFilterGroup,
    setValueIsJson,
    setJsonFields,
    handleEdit,
    handleDelete,
    handleSubmit,
    handleCloseModal,
    handleCreate,
    fetchSettings,
  };
};

