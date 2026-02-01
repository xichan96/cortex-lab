import { useState, useCallback, useEffect } from 'react';
import { message } from 'antd';
import { 
  createPrompt, 
  deletePrompt, 
  getPromptList, 
  updatePrompt, 
  getPrompt, 
  publishPrompt, 
  Prompt, 
  CreatePromptRequest, 
  UpdatePromptRequest 
} from '@/apis/prompt';

export function usePromptList(skillId: string, filterName?: string) {
  const [loading, setLoading] = useState(false);
  const [prompts, setPrompts] = useState<Prompt[]>([]);

  const fetchPrompts = useCallback(async () => {
    if (!skillId) return;
    try {
      setLoading(true);
      const params: { name?: string; status?: string } = { status: 'draft' };
      if (filterName) params.name = filterName;
      const res = await getPromptList(skillId, params);
      setPrompts(res);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [skillId, filterName]);

  useEffect(() => {
    fetchPrompts();
  }, [fetchPrompts]);

  const handleDelete = useCallback(async (id: string) => {
    if (!skillId) return;
    try {
      await deletePrompt(skillId, id);
      message.success('删除成功');
      fetchPrompts();
    } catch (error) {
      message.error('删除失败');
    }
  }, [skillId, fetchPrompts]);

  const handleCreate = useCallback(async (values: CreatePromptRequest) => {
    if (!skillId) return;
    try {
      await createPrompt(skillId, values);
      message.success('创建成功');
      fetchPrompts();
      return true;
    } catch (error) {
      message.error('创建失败');
      return false;
    }
  }, [skillId, fetchPrompts]);

  const handleUpdate = useCallback(async (id: string, content: string, config?: string) => {
    if (!skillId) return;
    try {
      await updatePrompt(skillId, id, { 
        id,
        content,
        config
      });
      message.success('更新成功');
      fetchPrompts();
      return true;
    } catch (error) {
      message.error('更新失败');
      return false;
    }
  }, [skillId, fetchPrompts]);

  const handlePublish = useCallback(async (id: string, description?: string) => {
    if (!skillId) return;
    try {
      await publishPrompt(skillId, id, description);
      message.success('发布成功');
      fetchPrompts();
      return true;
    } catch (error) {
      message.error('发布失败');
      return false;
    }
  }, [skillId, fetchPrompts]);

  const loadPrompt = useCallback(async (id: string): Promise<Prompt | null> => {
    if (!skillId) return null;
    try {
      const data = await getPrompt(skillId, id);
      return data;
    } catch (error) {
      message.error('加载提示词失败');
      return null;
    }
  }, [skillId]);

  return {
    prompts,
    loading,
    fetchPrompts,
    handleDelete,
    handleCreate,
    handleUpdate,
    handlePublish,
    loadPrompt,
  };
}
