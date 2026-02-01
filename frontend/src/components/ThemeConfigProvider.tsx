import { ConfigProvider, theme as antTheme } from 'antd';
import { useThemeStore, useLocaleStore } from '@/store';
import { useEffect } from 'react';
import zhCN from 'antd/locale/zh_CN';
import enUS from 'antd/locale/en_US';
import { HighlightStyle } from './HighlightStyle';

export const ThemeConfigProvider = ({ children }: { children: React.ReactNode }) => {
  const { theme } = useThemeStore();
  const { locale } = useLocaleStore();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.setAttribute('lang', locale === 'zh' ? 'zh-CN' : 'en-US');
  }, [locale]);

  return (
    <ConfigProvider
      locale={locale === 'zh' ? zhCN : enUS}
      theme={{
        algorithm: theme === 'dark' ? antTheme.darkAlgorithm : antTheme.defaultAlgorithm,
        token: {
          colorBorderSecondary: theme === 'dark' ? '#434343' : '#d9d9d9',
        },
      }}
    >
      <HighlightStyle />
      {children}
    </ConfigProvider>
  );
};
