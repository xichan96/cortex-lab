import { useEffect } from 'react';
import { useThemeStore } from '@/store';
import darkStyle from 'highlight.js/styles/github-dark.css?inline';
import lightStyle from 'highlight.js/styles/github.css?inline';

export const HighlightStyle = () => {
  const { theme } = useThemeStore();

  useEffect(() => {
    const styleId = 'highlight-js-style';
    let styleElement = document.getElementById(styleId) as HTMLStyleElement;

    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = styleId;
      document.head.appendChild(styleElement);
    }

    styleElement.textContent = theme === 'dark' ? darkStyle : lightStyle;

    return () => {
      // Optional: cleanup if needed, but usually we just update
    };
  }, [theme]);

  return null;
};
