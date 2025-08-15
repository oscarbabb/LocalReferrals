import { ReactNode } from 'react';
import { LanguageContext, useLanguageManager } from '@/hooks/use-language';

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const languageManager = useLanguageManager();

  return (
    <LanguageContext.Provider value={languageManager}>
      {children}
    </LanguageContext.Provider>
  );
}