import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { Language, getTranslation } from '@/lib/i18n';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: ReturnType<typeof getTranslation>;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode; initialLanguage?: Language }> = ({ children, initialLanguage }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    // initialLanguageが指定されていればそれを使用
    if (initialLanguage) {
      console.log('[LanguageContext] Initial language from prop:', initialLanguage);
      return initialLanguage;
    }
    // ローカルストレージから言語を取得、なければ'en'をデフォルトにする
    const saved = localStorage.getItem('language') as Language | null;
    const initial = saved || 'en';
    console.log('[LanguageContext] Initial language:', initial, 'from localStorage:', saved);
    return initial;
  });

  // initialLanguageが変わったときに言語を更新
  React.useEffect(() => {
    if (initialLanguage && initialLanguage !== language) {
      console.log('[LanguageContext] Updating language from prop:', initialLanguage);
      setLanguageState(initialLanguage);
    }
  }, [initialLanguage, language]);

  const setLanguage = useCallback((lang: Language) => {
    console.log('[LanguageContext] Setting language to:', lang);
    setLanguageState(lang);
    localStorage.setItem('language', lang);
    console.log('[LanguageContext] Language set successfully');
  }, []);

  const t = getTranslation(language);

  const value = useMemo(() => ({ language, setLanguage, t }), [language, setLanguage, t]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
