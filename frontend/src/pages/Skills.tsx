import { useState } from 'react';
import { Card, Button, Form, Input, Modal, Row, Col, Typography, Popconfirm, theme, Empty } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { Skill } from '@/apis/skill';
import Page from '@/components/Page';
import { useSkillList } from '@/hooks';
import { useI18n } from '@/hooks/useI18n';
import { useNavigate } from 'react-router';
import dayjs from 'dayjs';

const { Meta } = Card;
const { Paragraph } = Typography;

export default function Skills() {
  const { token } = theme.useToken();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [skillModalVisible, setSkillModalVisible] = useState(false);
  const [skillForm] = Form.useForm();
  const [keyword, setKeyword] = useState('');

  const { skills, loading, handleDelete: handleDeleteSkill, handleCreate: handleCreateSkill, handleUpdate: handleUpdateSkill } = useSkillList();

  const handleEditSkill = (skill: Skill) => {
    setEditingSkill(skill);
    skillForm.setFieldsValue(skill);
    setSkillModalVisible(true);
  };

  const handleSubmitSkill = async () => {
    try {
      const values = await skillForm.validateFields();
      if (editingSkill) {
        await handleUpdateSkill(editingSkill.id, values);
      } else {
        await handleCreateSkill(values);
      }
      setSkillModalVisible(false);
      skillForm.resetFields();
      setEditingSkill(null);
    } catch (error) {
      console.error(error);
    }
  };

  const filteredSkills = (() => {
    const q = keyword.trim().toLowerCase();
    if (!q) return skills;
    return skills.filter(s => 
      s.name.toLowerCase().includes(q) || 
      (s.description || '').toLowerCase().includes(q)
    );
  })();

  return (
    <Page 
      title={t('skills.pageTitle', '我的技能')} 
      extra={
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', alignItems: 'center' }}>
          <Input.Search
            placeholder={t('common.searchPlaceholder', '搜索技能...')}
            allowClear
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onSearch={(val) => setKeyword(val)}
            style={{ width: 280 }}
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              skillForm.resetFields();
              setEditingSkill(null);
              setSkillModalVisible(true);
            }}
          >
            {t('skills.createSkill', '创建技能')}
          </Button>
        </div>
      }
    >
      {loading ? (
        <Row gutter={[16, 16]}>
          {Array.from({ length: 8 }).map((_, i) => (
            <Col xs={24} sm={12} md={8} lg={6} xl={4} key={i}>
              <Card className="skill-card" hoverable loading />
            </Col>
          ))}
        </Row>
      ) : filteredSkills.length === 0 ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '40vh' }}>
          <Empty description={t('common.empty', '暂无数据')} />
        </div>
      ) : (
        <Row gutter={[16, 16]}>
          {filteredSkills.map(skill => (
            <Col xs={24} sm={12} md={8} lg={6} xl={4} key={skill.id}>
              <Card
                className="skill-card"
                hoverable
                onClick={() => navigate(`/skills/${skill.id}`)}
                actions={[
                  <Button
                    key="edit"
                    type="text"
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditSkill(skill);
                    }}
                  >
                    {t('common.edit', '编辑')}
                  </Button>,
                  <Popconfirm
                    key="delete"
                    title={t('skills.tabDeleteConfirmTitle', '确定要删除这个技能吗？')}
                    description={t('skills.tabDeleteConfirmDesc', '删除后无法恢复，且该技能下的所有提示词也将被删除。')}
                    onConfirm={(e) => {
                      e?.stopPropagation();
                      handleDeleteSkill(skill.id);
                    }}
                    onCancel={(e) => e?.stopPropagation()}
                    okText={t('common.ok', '确定')}
                    cancelText={t('common.cancel', '取消')}
                  >
                    <Button
                      type="text"
                      danger
                      size="small"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {t('common.delete', '删除')}
                    </Button>
                  </Popconfirm>
                ]}
              >
                <div className="skill-card-body">
                  <div className="skill-card-title">{skill.name}</div>
                  <div className="skill-card-subtitle">
                    {t('skills.updatedAt', '更新于')} {dayjs(skill.updated_at || skill.created_at).format('YYYY-MM-DD HH:mm')}
                  </div>
                  <Paragraph className="skill-card-desc text-ellipsis-2" ellipsis={{ rows: 2 }} style={{ marginBottom: 0 }}>
                    {skill.description || t('skills.noDescription', '暂无描述')}
                  </Paragraph>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      <Modal
        title={editingSkill ? t('skills.modal.editSkill', '编辑技能') : t('skills.modal.newSkill', '新增技能')}
        open={skillModalVisible}
        onCancel={() => {
          setSkillModalVisible(false);
          skillForm.resetFields();
          setEditingSkill(null);
        }}
        onOk={handleSubmitSkill}
      >
        <Form
          form={skillForm}
          layout="vertical"
        >
          <Form.Item
            name="name"
            label={t('common.name', '名称')}
            rules={[{ required: true, message: t('common.nameRequired', '请输入名称') }]}
          >
            <Input placeholder={t('common.nameRequired', '请输入名称')} />
          </Form.Item>
          <Form.Item
            name="description"
            label={t('common.description', '描述')}
          >
            <Input.TextArea placeholder={t('common.descriptionPlaceholder', '请输入描述')} rows={4} />
          </Form.Item>
        </Form>
      </Modal>
    </Page>
  );
}
