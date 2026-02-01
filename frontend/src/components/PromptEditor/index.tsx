import { useState, useEffect } from 'react';
import { MenuFoldOutlined, MenuUnfoldOutlined, HistoryOutlined } from '@ant-design/icons';
import { Segmented } from 'antd';
import { Prompt } from '@/apis/prompt';
import styles from './index.module.scss';
import EditorHeader from './EditorHeader';
import VersionList from './VersionList';
import EditorArea from './EditorArea';
import FileManager from './FileManager';
import AgentChat from './AgentChat';
import PublishModal from './PublishModal';
import { usePromptEditor } from './usePromptEditor';
import { useI18n } from '@/hooks/useI18n';

interface PromptEditorProps {
  prompt: Prompt | null;
  content: string;
  onContentChange: (content: string) => void;
  onPublish?: () => void;
  skillId: string;
  promptId?: string;
  showVersionList?: boolean;
}

export default function PromptEditor({ prompt, content, onContentChange, onPublish, skillId, promptId, showVersionList = false }: PromptEditorProps) {
  const [versionListCollapsed, setVersionListCollapsed] = useState(true);
  const {
    selectedVersion,
    selectedHistoryId,
    refreshTrigger,
    publishModalVisible,
    publishDescription,
    setPublishDescription,
    setPublishModalVisible,
    agentCollapsed,
    setAgentCollapsed,
    activeTab,
    setActiveTab,
    editorAreaRef,
    agentChatRef,
    publishing,
    hasPublished,
    publishedContent,
    displayContent,
    editorActions,
    handleTitleClick,
    handleVersionChange,
    onPublishConfirm,
    handleAddToChat,
    onSave,
  } = usePromptEditor({
    prompt,
    content,
    onPublish,
    skillId,
    promptId,
  });
  const { t } = useI18n();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        onSave?.();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSave]);

  return (
    <div className={styles.container}>
      <EditorHeader 
        title={`${t('promptEditor.currentVersion', '当前版本')}: ${prompt?.name || ''}`} 
        onClick={handleTitleClick}
        status={!hasPublished && promptId ? t('promptEditor.unpublished', '未发布') : undefined}
        leftIcon={
          showVersionList && activeTab !== 'files' ? (
            <span
              className={styles.versionIcon}
              onClick={() => setVersionListCollapsed(!versionListCollapsed)}
              title={versionListCollapsed ? t('version.expand', '展开版本') : t('version.collapse', '收起版本')}
            >
              <HistoryOutlined />
            </span>
          ) : null
        }
        center={
          <Segmented
            value={activeTab}
            onChange={(value) => setActiveTab(value as 'content' | 'files')}
            options={[
              { label: t('promptEditor.tabs.content', '提示词'), value: 'content' },
              { label: t('promptEditor.tabs.files', '技能文件'), value: 'files' },
            ]}
          />
        }
        versionIcon={
          activeTab !== 'files' ? (
            <span
              className={styles.versionIcon}
              onClick={() => setAgentCollapsed(!agentCollapsed)}
              title={agentCollapsed ? t('chat.expand', '展开聊天') : t('chat.collapse', '收起聊天')}
            >
              {agentCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            </span>
          ) : null
        }
      />
      <div className={styles.content}>
        {showVersionList && !versionListCollapsed && activeTab !== 'files' && (
          <VersionList 
            selectedVersion={selectedVersion} 
            onVersionChange={handleVersionChange}
            skillId={skillId}
            promptName={prompt?.name}
            currentPromptId={promptId}
            selectedHistoryId={selectedHistoryId}
            refreshTrigger={refreshTrigger}
          />
        )}
        
        {activeTab === 'files' ? (
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <FileManager 
              skillId={skillId} 
            />
          </div>
        ) : (
          <EditorArea
            ref={editorAreaRef}
            content={displayContent}
            onContentChange={onContentChange}
            actions={editorActions}
            showDiff={activeTab === 'content' && selectedVersion === 'diff' && hasPublished && content !== publishedContent}
            originalContent={publishedContent}
            modifiedContent={content}
            hasPublished={hasPublished}
            onAddToChat={handleAddToChat}
            onSave={onSave}
            fileName={prompt?.name || 'prompt.md'}
            language="markdown"
          />
        )}

        {activeTab !== 'files' && (
          <AgentChat 
            ref={agentChatRef}
            editorAreaRef={editorAreaRef}
            collapsed={agentCollapsed}
            onToggleCollapsed={setAgentCollapsed}
            chatId={prompt?.id ? `${skillId}:${prompt.id}` : (prompt?.name ? `${skillId}:${prompt.name}` : `${skillId}:draft`)}
          />
        )}
      </div>
      <PublishModal
        open={publishModalVisible}
        onCancel={() => setPublishModalVisible(false)}
        onConfirm={onPublishConfirm}
        confirmLoading={publishing}
        description={publishDescription}
        onDescriptionChange={setPublishDescription}
      />
    </div>
  );
}
