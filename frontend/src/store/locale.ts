import { create } from 'zustand';

export type Locale = 'zh' | 'en';

interface LocaleState {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
}

const getInitialLocale = (): Locale => {
  const saved = localStorage.getItem('locale') as Locale;
  return saved === 'en' ? 'en' : 'zh';
};

export const useLocaleStore = create<LocaleState>((set) => ({
  locale: getInitialLocale(),
  setLocale: (locale: Locale) => {
    localStorage.setItem('locale', locale);
    set({ locale });
  },
  toggleLocale: () => set((state) => {
    const next = state.locale === 'zh' ? 'en' : 'zh';
    localStorage.setItem('locale', next);
    return { locale: next };
  }),
}));
