import { useState } from 'react';
import { usePromptDetection } from '@/hooks/usePromptDetection';
import { extractPromptContent } from '@/utils/promptDetector';
import { Message } from '@/hooks/useAgentChat';
import CodeBlockActions from './CodeBlockActions';
import styles from './index.module.scss';
import { useI18n } from '@/hooks/useI18n';

interface MessageActionsProps {
  message: Message;
  onApplyToEditor: (content: string) => void;
}

export default function MessageActions({ message, onApplyToEditor }: MessageActionsProps) {
  const { isPrompt, showHint } = usePromptDetection(message);
  const [hovered, setHovered] = useState(false);
  const { t } = useI18n();

  if (message.role !== 'assistant' || message.streaming || !message.content) {
    return null;
  }

  const handleApply = (content: string) => {
    const extracted = extractPromptContent(content);
    onApplyToEditor(extracted);
  };

  return (
    <div 
      className={styles.messageActions}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {showHint && hovered && (
        <div className={styles.promptHint}>
          {t('promptEditor.detectedPromptHint', '检测到可能是提示词')}
        </div>
      )}
      <CodeBlockActions
        content={message.content}
        onApply={handleApply}
      />
    </div>
  );
}
