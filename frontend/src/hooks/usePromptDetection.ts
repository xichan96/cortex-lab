import { useMemo } from 'react';
import { isPromptContent, shouldAutoApply } from '@/utils/promptDetector';
import { Message } from './useAgentChat';

export function usePromptDetection(message: Message) {
  const detection = useMemo(() => {
    if (message.role !== 'assistant' || message.streaming || !message.content) {
      return {
        isPrompt: false,
        shouldAuto: false,
        showHint: false,
      };
    }

    const isPrompt = isPromptContent(message.content);
    const shouldAuto = false;

    return {
      isPrompt,
      shouldAuto,
      showHint: isPrompt && !shouldAuto,
    };
  }, [message]);

  return detection;
}
