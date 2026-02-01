import { useCallback } from 'react';
import { isPromptContent, shouldAutoApply, extractPromptContent } from '@/utils/promptDetector';

interface UseAgentMessageHandlerOptions {
  onAgentMessageComplete?: (content: string, userMessage: string) => void;
  onApplyToEditor?: (content: string, lineRange?: string) => void;
  autoApplyEnabled?: boolean;
  getLineRange?: () => string | undefined;
}

interface CodeReferenceInfo {
  fileName: string;
  lineRange: string;
  content: string;
}

export function useAgentMessageHandler({ onAgentMessageComplete, onApplyToEditor, autoApplyEnabled = false, getLineRange }: UseAgentMessageHandlerOptions) {
  const handleAgentMessageComplete = useCallback((content: string, userMessage: string) => {
    if (onAgentMessageComplete) {
      onAgentMessageComplete(content, userMessage);
    }

    if (onApplyToEditor && autoApplyEnabled) {
      const isPrompt = isPromptContent(content);

      if (isPrompt) {
        const extracted = extractPromptContent(content);
        
        let lineRange: string | undefined;
        // Should check userMessage for code reference, not the agent's content
        const codeRefMatches = userMessage.match(/```code-ref\n([\s\S]*?)\n```/);
        if (codeRefMatches && codeRefMatches[1]) {
          try {
            const refInfo = JSON.parse(codeRefMatches[1]) as CodeReferenceInfo;
            if (refInfo && refInfo.lineRange) {
              lineRange = refInfo.lineRange;
            }
          } catch (e) {
            // Ignore parse errors
          }
        }
        
        // If not found in immediate message, try to get from external source (history)
        if (!lineRange && getLineRange) {
          lineRange = getLineRange();
        }
        
        onApplyToEditor(extracted, lineRange);
      }
    }
  }, [onAgentMessageComplete, onApplyToEditor, autoApplyEnabled, getLineRange]);

  return {
    handleAgentMessageComplete,
  };
}
