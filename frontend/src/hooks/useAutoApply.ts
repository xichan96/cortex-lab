import { useState, useCallback, useEffect } from 'react';

const AUTO_APPLY_KEY = 'agent_auto_apply';

export function useAutoApply() {
  const [autoApply, setAutoApply] = useState(() => {
    try {
      const saved = localStorage.getItem(AUTO_APPLY_KEY);
      return saved === 'true';
    } catch {
      return false;
    }
  });

  const toggleAutoApply = useCallback(() => {
    const newValue = !autoApply;
    setAutoApply(newValue);
    try {
      localStorage.setItem(AUTO_APPLY_KEY, String(newValue));
    } catch (e) {
      console.error('Failed to save auto apply setting:', e);
    }
  }, [autoApply]);

  return {
    autoApply,
    toggleAutoApply,
  };
}

