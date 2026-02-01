import zh from '@/i18n/dictionaries/zh';
import en from '@/i18n/dictionaries/en';
import { useLocaleStore } from '@/store';

type Dict = Record<string, string>;

const dicts: Record<'zh' | 'en', Dict> = { zh, en };

export const useI18n = () => {
  const { locale, setLocale, toggleLocale } = useLocaleStore();
  const t = (key: string, defaultText?: string) => {
    const dict = dicts[locale];
    return dict[key] ?? defaultText ?? key;
  };
  return { t, locale, setLocale, toggleLocale };
};
