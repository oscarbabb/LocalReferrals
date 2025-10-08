import { useState, useEffect, createContext, useContext } from 'react';
import { es } from '@/locales/es';
import { en } from '@/locales/en';
import { es as esLocale, enUS } from 'date-fns/locale';
import type { Locale } from 'date-fns';

export type Language = 'es' | 'en';

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  t: (key: string) => string;
  dateLocale: Locale;
}

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

const translations = { es, en };

export function useLanguageManager(): LanguageContextType {
  const [language, setLanguage] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('language');
      return (saved as Language) || 'es'; // Default to Spanish
    }
    return 'es';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
    document.documentElement.lang = language;
  }, [language]);

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'es' ? 'en' : 'es');
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations[typeof language]] || key;
  };

  const dateLocale = language === 'es' ? esLocale : enUS;

  return {
    language,
    toggleLanguage,
    t,
    dateLocale
  };
}