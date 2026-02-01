import React from 'react';
import { Select, message, Typography } from 'antd';
import { useI18n } from '@/hooks/useI18n';
import { useThemeStore } from '@/store';
import { GlobalOutlined, BgColorsOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;

export const SystemSettings: React.FC = () => {
  const { t, locale, setLocale } = useI18n();
  const { theme, setTheme } = useThemeStore();

  const handleLanguageChange = (value: 'zh' | 'en') => {
    setLocale(value);
    message.success(t('messages.languageChanged', '语言已切换'));
  };

  const handleThemeChange = (value: 'light' | 'dark') => {
    setTheme(value);
    message.success(t('messages.themeChanged', '主题已切换'));
  };

  return (
    <div className="space-y-6">
      {/* Theme Settings */}
      <div className="bg-[var(--card-bg)] shadow-sm border border-[var(--border-color)] rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <BgColorsOutlined className="text-lg text-indigo-600 dark:text-indigo-400" />
          <Title level={5} style={{ margin: 0 }}>{t('settings.theme.title', '主题设置')}</Title>
        </div>
        <div className="pl-7">
          <Text type="secondary" className="block mb-4">
            {t('settings.theme.description', '选择系统主题模式')}
          </Text>
          <Select
            value={theme}
            onChange={handleThemeChange}
            style={{ width: 200 }}
            size="large"
          >
            <Option value="light">{t('settings.theme.light', '浅色模式')}</Option>
            <Option value="dark">{t('settings.theme.dark', '深色模式')}</Option>
          </Select>
        </div>
      </div>

      {/* Language Settings */}
      <div className="bg-[var(--card-bg)] shadow-sm border border-[var(--border-color)] rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <GlobalOutlined className="text-lg text-indigo-600 dark:text-indigo-400" />
          <Title level={5} style={{ margin: 0 }}>{t('settings.language.title', '语言设置')}</Title>
        </div>
        <div className="pl-7">
          <Text type="secondary" className="block mb-4">
            {t('settings.language.description', '选择系统显示的语言')}
          </Text>
          <Select
            value={locale}
            onChange={handleLanguageChange}
            style={{ width: 200 }}
            size="large"
          >
            <Option value="en">English</Option>
            <Option value="zh">简体中文</Option>
          </Select>
        </div>
      </div>
    </div>
  );
};
