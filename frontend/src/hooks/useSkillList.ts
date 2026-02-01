import { useState, useCallback, useEffect } from 'react';
import { message } from 'antd';
import { 
  createSkill, 
  deleteSkill, 
  getSkills, 
  updateSkill, 
  Skill, 
  CreateSkillRequest, 
  UpdateSkillRequest 
} from '@/apis/skill';

export function useSkillList() {
  const [loading, setLoading] = useState(false);
  const [skills, setSkills] = useState<Skill[]>([]);

  const fetchSkills = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getSkills();
      setSkills(res);
      return res;
    } catch (error) {
      console.error(error);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSkills();
  }, [fetchSkills]);

  const handleDelete = useCallback(async (id: string) => {
    try {
      await deleteSkill(id);
      message.success('删除成功');
      fetchSkills();
    } catch (error) {
      message.error('删除失败');
    }
  }, [fetchSkills]);

  const handleCreate = useCallback(async (values: CreateSkillRequest) => {
    try {
      await createSkill(values);
      message.success('创建成功');
      fetchSkills();
      return true;
    } catch (error) {
      message.error('创建失败');
      return false;
    }
  }, [fetchSkills]);

  const handleUpdate = useCallback(async (id: string, values: UpdateSkillRequest) => {
    try {
      await updateSkill(id, { ...values, id });
      message.success('更新成功');
      fetchSkills();
      return true;
    } catch (error) {
      message.error('更新失败');
      return false;
    }
  }, [fetchSkills]);

  return {
    skills,
    loading,
    fetchSkills,
    handleDelete,
    handleCreate,
    handleUpdate,
  };
}
