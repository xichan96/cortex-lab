import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation, useSearchParams } from 'react-router';
import { Prompt } from '@/apis/prompt';
import { getRole, updateRole } from '@/apis/role';

export function usePromptEditorController() {
  const { skillId, promptId } = useParams<{ skillId: string; promptId: string }>();
  const [searchParams] = useSearchParams();
  const roleId = searchParams.get('role');
  const navigate = useNavigate();
  const location = useLocation();
  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (roleId) {
      // Load role prompt
      getRole(roleId)
        .then((role) => {
          setPrompt({
            id: roleId,
            name: `${role.name} - 角色提示词`,
            content: role.prompt || '',
            skill_id: '',
            version: 0,
            created_at: '',
            updated_at: '',
            description: role.description || '',
            status: 'published',
            created_by: 'system',
          } as Prompt);
          setContent(role.prompt || '');
          setLoading(false);
        })
        .catch(() => {
          navigate(-1);
        });
    } else {
      const state = location.state as { prompt?: Prompt } | undefined;
      if (state?.prompt) {
        setPrompt(state.prompt);
        setContent(state.prompt.content || '');
        setLoading(false);
      } else {
        navigate(-1);
      }
    }
  }, [location.state, navigate, roleId]);

  return {
    skillId,
    promptId,
    roleId,
    prompt,
    content,
    setContent,
    loading,
  };
}
