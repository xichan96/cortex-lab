import { Modal, Form, Input, Button, Space, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { Setting } from '@/apis/setting';
import { parseJsonValue, JsonField } from '@/utils/jsonParser';
import { useI18n } from '@/hooks/useI18n';

const INPUT_CLASS = "!border-gray-300 dark:!border-gray-600 !rounded-lg focus:!ring-2 focus:!ring-indigo-500/20 focus:!border-indigo-500 hover:!border-indigo-500 !bg-[var(--card-bg)] !text-[var(--text-color)]";

interface GeneralSettingModalProps {
  visible: boolean;
  editingSetting: Setting | null;
  valueIsJson: boolean;
  jsonFields: JsonField[];
  form: any;
  onClose: () => void;
  onSubmit: (values: any) => void;
  setValueIsJson: (value: boolean) => void;
  setJsonFields: (fields: JsonField[]) => void;
}

export const GeneralSettingModal = ({
  visible,
  editingSetting,
  valueIsJson,
  jsonFields,
  form,
  onClose,
  onSubmit,
  setValueIsJson,
  setJsonFields,
}: GeneralSettingModalProps) => {
  const { t } = useI18n();
  return (
    <Modal
      title={editingSetting ? t('settings.general.editSetting', '编辑配置') : t('settings.general.newSetting', '新增配置')}
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
          name="group"
          label={t('settings.general.group', '分组')}
          rules={[{ required: true, message: t('settings.general.groupRequired', '请输入分组') }]}
        >
          <Input className={INPUT_CLASS} placeholder={t('settings.general.groupRequired', '请输入分组')} />
        </Form.Item>
        <Form.Item
          name="key"
          label={t('settings.general.key', '键')}
          rules={[{ required: true, message: t('settings.general.keyRequired', '请输入键') }]}
        >
          <Input className={INPUT_CLASS} placeholder={t('settings.general.keyRequired', '请输入键')} disabled={!!editingSetting} />
        </Form.Item>
        {valueIsJson ? (
          <Form.Item label={t('settings.general.valueJsonLabel', '值（JSON格式）')}>
            <Form.List name="jsonFields">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => {
                    const fieldData = form.getFieldValue(['jsonFields', name]);
                    const hasNestedFields = fieldData?.nestedFields && fieldData.nestedFields.length > 0;
                    
                    return (
                      <div key={key} style={{ marginBottom: 16, padding: 12, border: '1px solid var(--border-color)', borderRadius: 4 }}>
                        <Space style={{ display: 'flex', marginBottom: hasNestedFields ? 8 : 0 }} align="baseline">
                          <Form.Item
                            {...restField}
                            name={[name, 'key']}
                            rules={[{ required: true, message: t('settings.general.keyNameRequired', '请输入键名') }]}
                            style={{ marginBottom: 0 }}
                          >
                            <Input className={INPUT_CLASS} placeholder={t('settings.general.keyNamePlaceholder', '键名')} style={{ width: 150 }} />
                          </Form.Item>
                          {!hasNestedFields ? (
                            <>
                              <Form.Item
                                {...restField}
                                name={[name, 'value']}
                                style={{ marginBottom: 0, flex: 1 }}
                              >
                                <Input className={INPUT_CLASS} placeholder={t('settings.general.valuePlaceholder', '值')} style={{ width: 400 }} />
                              </Form.Item>
                              <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => {
                                const prevVal = prevValues?.jsonFields?.[name]?.value;
                                const currVal = currentValues?.jsonFields?.[name]?.value;
                                return prevVal !== currVal;
                              }}>
                                {() => {
                                  const currentValue = form.getFieldValue(['jsonFields', name, 'value']);
                                  const canExpand = currentValue && (() => {
                                    try {
                                      const parsed = JSON.parse(currentValue);
                                      return typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed);
                                    } catch {
                                      return false;
                                    }
                                  })();
                                  
                                  return canExpand ? (
                                    <Button
                                      type="link"
                                      onClick={() => {
                                        const jsonResult = parseJsonValue(currentValue);
                                        if (jsonResult.isJson) {
                                          form.setFieldValue(['jsonFields', name, 'nestedFields'], jsonResult.fields);
                                          form.setFieldValue(['jsonFields', name, 'value'], undefined);
                                        }
                                      }}
                                    >
                                      {t('settings.general.expandJson', '展开JSON')}
                                    </Button>
                                  ) : null;
                                }}
                              </Form.Item>
                            </>
                          ) : (
                            <div style={{ flex: 1 }}>
                              <Form.Item
                                {...restField}
                                name={[name, 'nestedFields']}
                                style={{ marginBottom: 0 }}
                              >
                                <Form.List name={[name, 'nestedFields']}>
                                  {(nestedFields, { add: addNested, remove: removeNested }) => (
                                    <div style={{ paddingLeft: 20, borderLeft: '2px solid #1890ff' }}>
                                      {nestedFields.map(({ key: nestedKey, name: nestedName, ...nestedRestField }) => (
                                        <Space key={nestedKey} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                                          <Form.Item
                                            {...nestedRestField}
                                            name={[nestedName, 'key']}
                                            rules={[{ required: true, message: t('settings.general.keyNameRequired', '请输入键名') }]}
                                            style={{ marginBottom: 0 }}
                                          >
                                            <Input className={INPUT_CLASS} placeholder={t('settings.general.keyNamePlaceholder', '键名')} style={{ width: 120 }} />
                                          </Form.Item>
                                          <Form.Item
                                            {...nestedRestField}
                                            name={[nestedName, 'value']}
                                            style={{ marginBottom: 0, flex: 1 }}
                                          >
                                            <Input className={INPUT_CLASS} placeholder={t('settings.general.valuePlaceholder', '值')} style={{ width: 300 }} />
                                          </Form.Item>
                                          <Button type="link" onClick={() => removeNested(nestedName)} danger size="small">
                                            {t('common.delete', '删除')}
                                          </Button>
                                        </Space>
                                      ))}
                                      <Button type="dashed" onClick={() => addNested()} size="small" icon={<PlusOutlined />}>
                                        {t('settings.general.addField', '添加字段')}
                                      </Button>
                                    </div>
                                  )}
                                </Form.List>
                              </Form.Item>
                            </div>
                          )}
                          <Button type="link" onClick={() => remove(name)} danger>
                            {t('common.delete', '删除')}
                          </Button>
                        </Space>
                      </div>
                    );
                  })}
                  <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                    {t('settings.general.addField', '添加字段')}
                  </Button>
                </>
              )}
            </Form.List>
          </Form.Item>
        ) : (
          <Form.Item
            name="value"
            label={t('settings.general.value', '值')}
            rules={[{ required: true, message: t('settings.general.valueRequired', '请输入值') }]}
          >
            <Input.TextArea className={INPUT_CLASS} placeholder={t('settings.general.valueJsonPlaceholder', '请输入值（支持JSON格式）')} rows={4} />
          </Form.Item>
        )}
        {editingSetting && !valueIsJson && (
          <Form.Item>
            <Button
              type="link"
              onClick={() => {
                const jsonResult = parseJsonValue(editingSetting.value);
                if (jsonResult.isJson) {
                  setValueIsJson(true);
                  setJsonFields(jsonResult.fields);
                  form.setFieldsValue({
                    jsonFields: jsonResult.fields,
                  });
                } else {
                  message.warning(t('settings.general.invalidJson', '当前值不是有效的JSON格式'));
                }
              }}
            >
              {t('settings.general.convertToStructured', '转换为结构化编辑')}
            </Button>
          </Form.Item>
        )}
      </Form>
    </Modal>
  );
};
