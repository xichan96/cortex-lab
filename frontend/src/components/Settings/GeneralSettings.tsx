import { Table, Button, Space, Flex, Popconfirm, Input, TableColumnsType, Typography } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SlidersOutlined } from '@ant-design/icons';
import { Setting } from '@/apis/setting';
import { useGeneralSettings } from '@/hooks/useGeneralSettings';
import { GeneralSettingModal } from './GeneralSettingModal';
import dayjs from 'dayjs';
import { useI18n } from '@/hooks/useI18n';
import { useState, useEffect, useMemo } from 'react';

export const GeneralSettings = () => {
  const {
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
  } = useGeneralSettings();
  const { t } = useI18n();
  const { Title } = Typography;
  const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth >= 1024);

  useEffect(() => {
    const handleResize = () => {
      setIsLargeScreen(window.innerWidth >= 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const columns: TableColumnsType<Setting> = useMemo(() => [
    {
      title: t('settings.general.group', '分组'),
      dataIndex: 'group',
      key: 'group',
      align: 'center',
      width: 150,
      ellipsis: true,
    },
    {
      title: t('settings.general.key', '键'),
      dataIndex: 'key',
      key: 'key',
      align: 'center',
      width: 200,
      ellipsis: true,
    },
    {
      title: t('settings.general.value', '值'),
      dataIndex: 'value',
      key: 'value',
      align: 'center',
      ellipsis: true,
    },
    {
      title: t('common.actions', '操作'),
      key: 'action',
      width: 150,
      align: 'center',
      fixed: isLargeScreen ? false : ('right' as const),
      render: (_: any, record: Setting) => (
        <Space size="small" className="flex-nowrap">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            className="!px-1 lg:!px-3"
            size="small"
          >
            <span className="hidden lg:inline">{t('common.edit', '编辑')}</span>
          </Button>
          <Popconfirm
            title={t('settings.general.deleteConfirmTitle', '确定要删除这个配置吗？')}
            onConfirm={() => handleDelete(record)}
            okText={t('common.ok', '确定')}
            cancelText={t('common.cancel', '取消')}
          >
            <Button 
              type="link" 
              danger 
              icon={<DeleteOutlined />} 
              className="!px-1 lg:!px-3"
              size="small"
            >
              <span className="hidden lg:inline">{t('common.delete', '删除')}</span>
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ], [isLargeScreen, t, handleEdit, handleDelete]);

  return (
    <div className="space-y-3 sm:space-y-6">
      <div className="bg-[var(--card-bg)] shadow-sm border border-[var(--border-color)] rounded-xl p-3 sm:p-4 lg:p-6">
        <div className="flex items-center justify-between mb-3 sm:mb-6">
          <div className="flex items-center gap-2">
            <SlidersOutlined className="text-base sm:text-lg text-indigo-600 dark:text-indigo-400" />
            <Title level={5} className="!text-sm sm:!text-base" style={{ margin: 0 }}>{t('settings.tab.general', 'General Config')}</Title>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 mb-3 sm:mb-4">
          <Input
            placeholder={t('settings.general.filterGroupPlaceholder', '筛选分组')}
            value={filterGroup}
            onChange={(e) => setFilterGroup(e.target.value)}
            className="w-full sm:w-60"
            allowClear
            size="middle"
          />
          <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3">
            <div className="text-xs sm:text-sm text-[var(--text-color-secondary)]">
              {t('common.totalPrefix', '共')} {settings.length} {t('settings.general.totalConfigsUnit', '个配置')}
            </div>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreate}
              size="middle"
              className="bg-indigo-600 hover:bg-indigo-500"
            >
              <span className="hidden sm:inline">{t('settings.general.create', '新增配置')}</span>
              <span className="sm:hidden">{t('common.add', '新增')}</span>
            </Button>
          </div>
        </div>

        <div className={`-mx-3 sm:-mx-4 lg:-mx-6 ${!isLargeScreen ? 'overflow-x-auto' : ''}`}>
          <div className="inline-block min-w-full align-middle px-3 sm:px-4 lg:px-6">
            <Table
              columns={columns}
              dataSource={settings}
              loading={loading}
              rowKey={(record) => `${record.group}-${record.key}`}
              scroll={isLargeScreen ? undefined : { x: 800 }}
              size="small"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `${t('common.totalPrefix', '共')} ${total} ${t('common.totalRecordsUnit', '条')}`,
                size: 'default',
                responsive: true,
                simple: window.innerWidth < 640,
              }}
            />
          </div>
        </div>
      </div>

      <GeneralSettingModal
        visible={modalVisible}
        editingSetting={editingSetting}
        valueIsJson={valueIsJson}
        jsonFields={jsonFields}
        form={form}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        setValueIsJson={setValueIsJson}
        setJsonFields={setJsonFields}
      />
    </div>
  );
};
