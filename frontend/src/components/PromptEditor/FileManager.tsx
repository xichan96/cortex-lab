import { useRef, useState } from 'react';
import { Table, Button, Space, Popconfirm, Form, Modal, Input, Drawer, Alert } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, FileOutlined, ImportOutlined, MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import { SkillFile } from '@/apis/skillFile';
import { useSkillFiles } from '@/hooks/useSkillFiles';
import { useI18n } from '@/hooks/useI18n';
import EditorArea, { EditorAreaRef } from './EditorArea';
import AgentChat, { AgentChatRef } from './AgentChat';
import styles from './FileManager.module.scss';
import dayjs from 'dayjs';

interface FileManagerProps {
  skillId: string;
  onInsert?: (content: string) => void;
}

export default function FileManager({ skillId, onInsert }: FileManagerProps) {
  const { t } = useI18n();
  const { files, loading, handleCreate, handleDelete, handleUpdate } = useSkillFiles(skillId);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingFile, setEditingFile] = useState<SkillFile | null>(null);
  const [editorVisible, setEditorVisible] = useState(false);
  const [editorContent, setEditorContent] = useState('');
  const [editorFile, setEditorFile] = useState<SkillFile | null>(null);
  const [form] = Form.useForm();
  const editorAreaRef = useRef<EditorAreaRef>(null);
  const agentChatRef = useRef<AgentChatRef>(null);
  const [agentCollapsed, setAgentCollapsed] = useState(false);

  const handleEdit = (record: SkillFile) => {
    setEditingFile(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleOpenEditor = (record: SkillFile) => {
    setEditorFile(record);
    setEditorContent(record.content);
    setEditorVisible(true);
  };

  const handleDeleteFile = async (id: string) => {
    await handleDelete(id);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingFile) {
        await handleUpdate(editingFile.id, values);
      } else {
        await handleCreate({
            ...values,
            content: '', // Initial empty content for new file
        });
      }
      setModalVisible(false);
      form.resetFields();
      setEditingFile(null);
    } catch (error) {
      // Form validation failed
    }
  };

  const handleSaveContent = async () => {
    if (editorFile) {
      const success = await handleUpdate(editorFile.id, { content: editorContent });
      if (success) {
        setEditorVisible(false);
        setEditorFile(null);
        setEditorContent('');
      }
    }
  };
  
  const handleAddToChat = (chatContent: string | any) => {
    agentChatRef.current?.setInputMessage(chatContent);
    setAgentCollapsed(false);
  };

  const columns = [
    {
      title: t('promptEditor.files.name', '文件名'),
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: SkillFile) => (
        <Space>
          <FileOutlined />
          <Button type="link" onClick={() => handleOpenEditor(record)} style={{ padding: 0 }}>
            {text}
          </Button>
        </Space>
      ),
    },
    {
      title: t('promptEditor.files.description', '描述'),
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: t('common.updatedAt', '更新时间'),
      dataIndex: 'updated_at',
      key: 'updated_at',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: t('common.actions', '操作'),
      key: 'action',
      render: (_: any, record: SkillFile) => (
        <Space size="small">
          {onInsert && (
             <Button
               type="text"
               icon={<ImportOutlined />}
               title={t('promptEditor.files.insert', '插入到编辑器')}
               onClick={() => onInsert(record.content)}
             />
          )}
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title={t('promptEditor.files.deleteConfirm', '确定要删除这个文件吗？')}
            onConfirm={() => handleDeleteFile(record.id)}
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className={styles.container}>
      <div style={{ padding: '16px 16px 0' }}>
        <Alert
          message={t('promptEditor.files.tip', '技能文件用于存储较长的上下文、示例或知识库片段。可在此查看、编辑并保存。')}
          type="info"
          showIcon
          closable
        />
      </div>
      <div className={styles.header}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingFile(null);
            form.resetFields();
            setModalVisible(true);
          }}
        >
          {t('promptEditor.files.create', '新建文件')}
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={files}
        rowKey="id"
        loading={loading}
        pagination={false}
      />

      <Modal
        title={editingFile ? t('common.edit', '编辑') : t('promptEditor.files.create', '新建文件')}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => {
            setModalVisible(false);
            form.resetFields();
            setEditingFile(null);
        }}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label={t('promptEditor.files.name', '文件名')}
            rules={[{ required: true, message: t('promptEditor.files.nameRequired', '请输入文件名') }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="description"
            label={t('promptEditor.files.description', '描述')}
          >
            <Input.TextArea />
          </Form.Item>
        </Form>
      </Modal>

      <Drawer
        title={editorFile?.name}
        placement="right"
        width="80%"
        onClose={() => setEditorVisible(false)}
        open={editorVisible}
        extra={
          <Space>
            <Button type="primary" onClick={handleSaveContent}>
              {t('common.save', '保存')}
            </Button>
            <Button
              type="text"
              icon={agentCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              title={agentCollapsed ? t('chat.expand', '展开聊天') : t('chat.collapse', '收起聊天')}
              onClick={() => setAgentCollapsed(!agentCollapsed)}
            />
          </Space>
        }
        styles={{
          body: { padding: 0 },
        }}
      >
        {editorVisible && (
          <div style={{ height: '100%', display: 'flex', flexDirection: 'row' }}>
            <div style={{ flex: 1, overflow: 'hidden', minWidth: 0, height: '100%', display: 'flex', flexDirection: 'column' }}>
              <EditorArea
                ref={editorAreaRef}
                content={editorContent}
                onContentChange={setEditorContent}
                fileName={editorFile?.name}
                language="markdown"
                onAddToChat={handleAddToChat}
              />
            </div>
            <AgentChat
              ref={agentChatRef}
              editorAreaRef={editorAreaRef}
              collapsed={agentCollapsed}
              onToggleCollapsed={setAgentCollapsed}
              chatId={editorFile ? `${skillId}:file:${editorFile.id}` : `${skillId}:file:draft`}
            />
          </div>
        )}
      </Drawer>
    </div>
  );
}
