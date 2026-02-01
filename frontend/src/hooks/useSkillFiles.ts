import { useState, useCallback, useEffect } from 'react';
import { message } from 'antd';
import { 
  createSkillFile, 
  deleteSkillFile, 
  getSkillFileList, 
  updateSkillFile, 
  SkillFile, 
  CreateSkillFileRequest, 
  UpdateSkillFileRequest 
} from '@/apis/skillFile';

export function useSkillFiles(skillId: string) {
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<SkillFile[]>([]);

  const fetchFiles = useCallback(async () => {
    if (!skillId) return;
    try {
      setLoading(true);
      const res = await getSkillFileList(skillId);
      setFiles(res);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [skillId]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const handleDelete = useCallback(async (fileId: string) => {
    if (!skillId) return;
    try {
      await deleteSkillFile(skillId, fileId);
      message.success('删除成功');
      fetchFiles();
    } catch (error) {
      message.error('删除失败');
    }
  }, [skillId, fetchFiles]);

  const handleCreate = useCallback(async (values: CreateSkillFileRequest) => {
    if (!skillId) return;
    try {
      await createSkillFile(skillId, values);
      message.success('创建成功');
      fetchFiles();
      return true;
    } catch (error) {
      message.error('创建失败');
      return false;
    }
  }, [skillId, fetchFiles]);

  const handleUpdate = useCallback(async (fileId: string, values: UpdateSkillFileRequest) => {
    if (!skillId) return;
    try {
      await updateSkillFile(skillId, fileId, values);
      message.success('更新成功');
      fetchFiles();
      return true;
    } catch (error) {
      message.error('更新失败');
      return false;
    }
  }, [skillId, fetchFiles]);

  return {
    files,
    loading,
    fetchFiles,
    handleDelete,
    handleCreate,
    handleUpdate,
  };
}
