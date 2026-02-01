import PromptEditorComponent from '@/components/PromptEditor';
import styles from './PromptEditor.module.scss';
import { usePromptEditorController } from './usePromptEditorController';
import { useI18n } from '@/hooks/useI18n';
import { updateRole } from '@/apis/role';
import { message } from 'antd';

export default function PromptEditor() {
  const {
    skillId,
    promptId,
    roleId,
    prompt,
    content,
    setContent,
    loading,
  } = usePromptEditorController();
  const { t } = useI18n();

  const handlePublish = async () => {
    if (roleId) {
      try {
        await updateRole(roleId, { prompt: content });
        message.success(t('common.saveSuccess', '保存成功'));
      } catch (error) {
        message.error(t('common.saveFailed', '保存失败'));
      }
    }
  };

  if (loading && !prompt) {
    return <div className={styles.loading}>{t('common.loading', '加载中...')}</div>;
  }

  if (!prompt) {
    return null;
  }

  return (
    <PromptEditorComponent
      prompt={prompt}
      content={content}
      onContentChange={setContent}
      onPublish={handlePublish}
      skillId={skillId || ''}
      promptId={promptId}
      showVersionList={!roleId}
    />
  );
}
