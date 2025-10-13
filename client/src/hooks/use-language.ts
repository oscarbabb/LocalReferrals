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
      try {
        const saved = localStorage.getItem('language');
        return (saved as Language) || 'es'; // Default to Spanish
      } catch (e) {
        // Safari private browsing mode throws errors on localStorage access
        console.warn('localStorage not available:', e);
        return 'es';
      }
    }
    return 'es';
  });

  useEffect(() => {
    try {
      localStorage.setItem('language', language);
    } catch (e) {
      // Safari private browsing mode - silently fail
      console.warn('localStorage not available:', e);
    }
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