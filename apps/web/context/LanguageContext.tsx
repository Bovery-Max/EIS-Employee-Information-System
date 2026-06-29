'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../lib/translations';

type Language = 'en' | 'tr';
type TranslationKeys = typeof translations.en;

interface LanguageContextType {
  lang: Language;
  setLanguage: (lang: Language) => void;
  t: (section: keyof TranslationKeys, key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [lang, setLang] = useState<Language>('en');

  useEffect(() => {
    const saved = localStorage.getItem('eis_language') as Language;
    if (saved && (saved === 'en' || saved === 'tr')) {
      setLang(saved);
      document.documentElement.lang = saved === 'en' ? 'en-US' : 'tr';
    } else {
      document.documentElement.lang = 'en-US';
    }
  }, []);

  const setLanguage = (newLang: Language) => {
    setLang(newLang);
    localStorage.setItem('eis_language', newLang);
    document.documentElement.lang = newLang === 'en' ? 'en-US' : 'tr';
    window.dispatchEvent(new Event('eis_language_change'));
  };

  const t = (section: keyof TranslationKeys, key: string): string => {
    const sectionDict = translations[lang][section] as Record<string, string>;
    if (sectionDict && sectionDict[key]) {
      return sectionDict[key];
    }
    // Fallback to English if translation is missing
    const fallbackDict = translations['en'][section] as Record<string, string>;
    if (fallbackDict && fallbackDict[key]) {
      return fallbackDict[key];
    }
    return key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLanguage, t }}>
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
