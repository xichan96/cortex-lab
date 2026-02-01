import React, { useState, useRef, useEffect } from 'react';
import { Role, ExperienceItem } from '@/types/hub';
import { CortexEditorRef } from '@/components/editor/CortexEditor';
import { AISidekick } from '@/components/sidekick/AISidekick';
import { AISidekickRef } from '@/components/sidekick/types';
import { getExperiences, createExperience, updateExperience, deleteExperience } from '@/apis/knowledge';
import { RoleHeader } from './RoleHeader';
import { RoleTabs } from './RoleTabs';
import { RoleBasicInfo } from './RoleBasicInfo';
import { RolePromptEditor } from './RolePromptEditor';
import { RoleExperienceEditorView } from './RoleExperienceEditor';
import { RoleExperienceList } from './RoleExperienceList';
import { RoleBuiltinTools } from './RoleBuiltinTools';
import { RoleMCPTools } from './RoleMCPTools';
import { RoleToolsSummary } from './RoleToolsSummary';
import { SelectionMenu } from './SelectionMenu';
import { RoleCall } from './RoleCall';

interface RoleDetailProps {
  role: Role;
  onUpdate: (role: Role) => void;
  onDelete: (roleId: string) => void;
}

type TabId = 'config' | 'experience' | 'tools' | 'call';

export function RoleDetail({ role, onUpdate, onDelete }: RoleDetailProps) {
  const [activeTab, setActiveTab] = useState<TabId>('config');
  const [experienceList, setExperienceList] = useState<ExperienceItem[]>(role.experience || []);
  const [editingItem, setEditingItem] = useState<ExperienceItem | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [sidekickCollapsed, setSidekickCollapsed] = useState(false);
  const editorRef = useRef<CortexEditorRef>(null);
  const promptTextareaRef = useRef<HTMLTextAreaElement>(null);
  const sidekickRef = useRef<AISidekickRef>(null);
  const [selectionMenu, setSelectionMenu] = useState<{ x: number; y: number; text: string; lineRange: string; source: string } | null>(null);
  
  const [formData, setFormData] = useState<Role>(role);
  const [editingTitle, setEditingTitle] = useState('');
  const [editorContent, setEditorContent] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    setFormData({
      ...role,
      tool_config: role.tool_config || {
        builtin: [],
        mcp: (role.tools || []).map(url => ({ url, tools: [] })),
      },
    });
  }, [role]);

  useEffect(() => {
    setExperienceList([]);
    setActiveTab('config');
    setIsCreating(false);
    setEditingItem(null);
    setEditingTitle('');
    setEditorContent('');
    setShowPreview(false);
  }, [role.id]);

  useEffect(() => {
    if (activeTab === 'experience' && role.id) {
      fetchExperience();
    }
  }, [activeTab, role.id]);

  useEffect(() => {
    if (isCreating) {
      setEditingTitle('');
      setEditorContent('');
    }
  }, [isCreating]);

  useEffect(() => {
    if (editingItem) {
      setEditorContent(editingItem.content || '');
    }
  }, [editingItem]);

  // Create a virtual editor ref for the prompt textarea
  const promptEditorRef = useRef<CortexEditorRef>({
    setContent: (content: string) => {
      setFormData(prev => ({ ...prev, prompt: content }));
      setTimeout(() => {
        if (promptTextareaRef.current) {
          promptTextareaRef.current.scrollTop = promptTextareaRef.current.scrollHeight;
        }
      }, 0);
    },
    insertContent: (content: string) => {
      const trimmedContent = content.trim();
      if (trimmedContent.startsWith('# ') || trimmedContent.length > 200) {
        setFormData(prev => ({ ...prev, prompt: content }));
      } else {
        setFormData(prev => {
          const currentPrompt = prev.prompt || '';
          const separator = currentPrompt && !currentPrompt.endsWith('\n\n') ? '\n\n' : '';
          return { ...prev, prompt: currentPrompt + separator + content };
        });
      }
      setTimeout(() => {
        if (promptTextareaRef.current) {
          promptTextareaRef.current.scrollTop = promptTextareaRef.current.scrollHeight;
        }
      }, 0);
    },
    getContent: () => {
      return formData.prompt || '';
    }
  });
  
  // Update ref methods when formData changes
  useEffect(() => {
    if (promptEditorRef.current) {
      promptEditorRef.current.getContent = () => formData.prompt || '';
    }
  }, [formData.prompt]);

  const fetchExperience = async () => {
    try {
      const res = await getExperiences({ role_id: role.id });
      const items: ExperienceItem[] = res.list.map(k => {
        let parsedTags: string[] = [];
        try {
          const parsed = k.tags ? JSON.parse(k.tags) : [];
          if (Array.isArray(parsed)) parsedTags = parsed;
        } catch (e) {
          console.warn('Failed to parse tags for experience:', k.id);
        }
        
        return {
          id: k.id,
          title: k.title || k.content.slice(0, 50) + (k.content.length > 50 ? '...' : ''),
          content: k.content,
          type: (k.type as any) || 'text',
          tags: parsedTags,
          updatedAt: k.created_at
        };
      });
      setExperienceList(items);
    } catch (err) {
      console.error('Failed to fetch experience:', err);
    }
  };

  const handleSave = () => {
    onUpdate(formData);
  };

  const updateFormData = (updates: Partial<Role>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const updateToolConfig = (toolConfig: Role['tool_config']) => {
    const builtin = toolConfig?.builtin || [];
    const mcp = toolConfig?.mcp || [];
    setFormData(prev => ({
      ...prev,
      tool_config: toolConfig,
      tools: builtin.concat(mcp.map(m => m.url).filter(Boolean)),
    }));
  };

  const handleContentMouseUp = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'TEXTAREA' || target.tagName === 'INPUT') {
      const input = target as HTMLInputElement | HTMLTextAreaElement;
      const text = input.value.substring(input.selectionStart || 0, input.selectionEnd || 0);
      
      if (text && text.trim().length > 0) {
        const startLine = input.value.substring(0, input.selectionStart || 0).split('\n').length;
        const endLine = input.value.substring(0, input.selectionEnd || 0).split('\n').length;
        const lineRange = startLine === endLine ? `${startLine}` : `${startLine}-${endLine}`;
        
        let source = 'Configuration';
        if (input.getAttribute('name') === 'prompt') source = 'Prompt';
        else if (input.getAttribute('name') === 'description') source = 'Description';
        else if (input.getAttribute('name') === 'name') source = 'Name';
        else if (input.getAttribute('name') === 'principle') source = 'Principle';

        setSelectionMenu({
          x: e.clientX,
          y: e.clientY - 40,
          text: text,
          lineRange,
          source
        });
        return;
      }
    }
    setSelectionMenu(null);
  };

  const handleAddToChat = (content: string, context?: { lineRange: string }) => {
    if (context) {
      sidekickRef.current?.setInputMessage({
        fileName: editingItem?.title || 'Experience Base',
        lineRange: context.lineRange,
        content
      });
    } else {
      sidekickRef.current?.setInputMessage(content);
    }
  };

  const handleAddSelectionToChat = () => {
    if (selectionMenu) {
      sidekickRef.current?.setInputMessage({
        fileName: selectionMenu.source,
        lineRange: selectionMenu.lineRange,
        content: selectionMenu.text
      });
      setSelectionMenu(null);
    }
  };

  const handleSaveExperience = async (content: string) => {
    try {
      if (isCreating) {
        await createExperience({
          type: 'text',
          title: editingTitle || 'Untitled',
          content: content,
          role_id: role.id,
          tags: '[]'
        });
      } else if (editingItem) {
        await updateExperience(editingItem.id, {
          id: editingItem.id,
          title: editingTitle,
          content: content
        });
      }
      
      await fetchExperience();
      setIsCreating(false);
      setEditingItem(null);
      setEditingTitle('');
    } catch (err) {
      console.error('Failed to save experience:', err);
    }
  };

  const handleCancelEdit = () => {
    setIsCreating(false);
    setEditingItem(null);
    setEditingTitle('');
  };

  const handleDeleteExperience = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await deleteExperience(id);
      await fetchExperience();
    } catch (err) {
      console.error('Failed to delete experience:', err);
    }
  };

  const startEditing = (item: ExperienceItem) => {
    setEditingItem(item);
    setEditingTitle(item.title);
    setIsCreating(false);
  };

  const showSidekick = activeTab === 'config';

  return (
    <div className="flex-1 flex flex-col xl:flex-row h-full overflow-hidden">
      <div className="flex-1 flex flex-col h-full bg-[var(--body-bg)] min-w-0">
        <RoleHeader 
          name={formData.name}
          description={formData.description}
          onDelete={() => onDelete(role.id)}
          onSave={handleSave}
        />

        <RoleTabs 
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        <div className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6 pb-20 lg:pb-6">
          <div className="max-w-4xl mx-auto h-full flex flex-col">
            {activeTab === 'config' && (
              <div className="space-y-4 sm:space-y-6" onMouseUp={handleContentMouseUp}>
                <RoleBasicInfo
                  name={formData.name}
                  description={formData.description}
                  avatar={formData.avatar || ''}
                  onNameChange={(name) => updateFormData({ name })}
                  onDescriptionChange={(description) => updateFormData({ description })}
                  onAvatarChange={(avatar) => updateFormData({ avatar })}
                />

                <RolePromptEditor
                  value={formData.prompt || ''}
                  onChange={(prompt) => updateFormData({ prompt })}
                  textareaRef={promptTextareaRef}
                />
                
                {selectionMenu && (
                  <SelectionMenu
                    x={selectionMenu.x}
                    y={selectionMenu.y}
                    text={selectionMenu.text}
                    lineRange={selectionMenu.lineRange}
                    source={selectionMenu.source}
                    onAddToChat={handleAddSelectionToChat}
                  />
                )}
              </div>
            )}

            {activeTab === 'experience' && (
              <>
                {isCreating || editingItem ? (
                  <RoleExperienceEditorView
                    title={editingTitle}
                    content={editorContent}
                    showPreview={showPreview}
                    onTitleChange={setEditingTitle}
                    onContentChange={setEditorContent}
                    onTogglePreview={() => setShowPreview(!showPreview)}
                    onSave={() => handleSaveExperience(editorContent)}
                    onCancel={handleCancelEdit}
                  />
                ) : (
                  <RoleExperienceList
                    items={experienceList}
                    onAdd={() => setIsCreating(true)}
                    onEdit={startEditing}
                    onDelete={handleDeleteExperience}
                  />
                )}
              </>
            )}

            {activeTab === 'tools' && (
              <div className="bg-[var(--card-bg)] p-3 sm:p-4 lg:p-6 rounded-xl border border-[var(--border-color)] shadow-sm space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
                  <RoleBuiltinTools
                    toolConfig={formData.tool_config}
                    onChange={updateToolConfig}
                  />
                  
                  <RoleMCPTools
                    toolConfig={formData.tool_config}
                    onChange={updateToolConfig}
                  />
                </div>

                <RoleToolsSummary tools={formData.tools || []} />
              </div>
            )}

          {activeTab === 'call' && (
            <RoleCall 
              role={formData} 
              onUpdate={(updatedRole) => setFormData(updatedRole)} 
            />
          )}
        </div>
      </div>

      </div>

      {showSidekick && (
        <AISidekick 
          ref={sidekickRef}
          editorRef={activeTab === 'config' ? promptEditorRef : editorRef}
          collapsed={sidekickCollapsed}
          onToggleCollapsed={setSidekickCollapsed}
          chatId={`role-${role.id}`}
          promptKey="role_assistant"
        />
      )}
    </div>
  );
}
