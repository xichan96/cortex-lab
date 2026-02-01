import { useState, useEffect } from 'react';
import { theme, Spin, Button, Space } from 'antd';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { Prompt } from '@/apis/prompt';
import Page from '@/components/Page';
import PromptEditor from '@/components/PromptEditor';
import { useSkillList, usePromptList } from '@/hooks';
import { useI18n } from '@/hooks/useI18n';
import { PageLoading } from '@/components/Loading';

export default function SkillDetail() {
  const { token } = theme.useToken();
  const { skillId } = useParams<{ skillId: string }>();
  const navigate = useNavigate();
  const { t } = useI18n();
  const [activePrompt, setActivePrompt] = useState<Prompt | null>(null);
  const [editorContent, setEditorContent] = useState<string>('');
  
  const { skills } = useSkillList();
  const { prompts, loading: promptLoading, fetchPrompts } = usePromptList(skillId || '');

  const skill = skillId ? skills.find(n => n.id === skillId) || null : null;

  // Auto-select Prompt
  useEffect(() => {
    if (promptLoading) return;
    if (!skillId) return;

    if (prompts.length > 0) {
      const targetPrompt = prompts[0];
      if (!activePrompt || activePrompt.id !== targetPrompt.id) {
          setActivePrompt(targetPrompt);
          setEditorContent(targetPrompt.content || '');
      }
    }
  }, [prompts, promptLoading, skillId, activePrompt]);

  if (!skill) {
      return <PageLoading />;
  }

  return (
    <Page 
        title={skill.name} 
        extra={
            <Button 
                icon={<ArrowLeftOutlined />} 
                onClick={() => navigate('/skills')}
            >
                {t('common.back', '返回')}
            </Button>
        }
    >
      <div style={{ height: 'calc(100vh - 140px)', display: 'flex', flexDirection: 'column' }}>
         {!activePrompt ? (
             <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                 <Spin size="large" tip={t('common.loading', '加载中...')} />
             </div>
         ) : (
             <PromptEditor
                prompt={activePrompt}
                content={editorContent}
                onContentChange={setEditorContent}
                skillId={skillId || ''}
                promptId={activePrompt.id}
                showVersionList={true}
             />
         )}
      </div>
    </Page>
  );
}
