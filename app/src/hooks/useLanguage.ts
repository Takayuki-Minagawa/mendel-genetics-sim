import { useState, useCallback } from 'react';
import translations from '../i18n/translations';
import type { Language, TranslationKeys } from '../i18n/translations';

export function useLanguage() {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('genetics-lang');
    if (saved === 'ja' || saved === 'en') return saved;
    return 'ja';
  });

  const toggleLanguage = useCallback(() => {
    setLanguage((l) => {
      const next = l === 'ja' ? 'en' : 'ja';
      localStorage.setItem('genetics-lang', next);
      return next;
    });
  }, []);

  const t = translations[language] as TranslationKeys;

  return { language, setLanguage, toggleLanguage, t };
}
