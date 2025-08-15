import { useState } from 'react';
import { useLanguage } from '@/hooks/use-language';
import { Button } from '@/components/ui/button';

const FlagIcon = ({ country, isActive }: { country: 'mx' | 'us', isActive: boolean }) => {
  if (country === 'mx') {
    return (
      <svg 
        className={`w-6 h-6 transition-all duration-300 ${isActive ? 'scale-110' : 'scale-100'}`} 
        viewBox="0 0 24 16" 
        fill="none"
      >
        {/* Mexican Flag */}
        <rect width="24" height="16" rx="2" fill="#006847"/>
        <rect x="8" y="0" width="8" height="16" fill="#FFFFFF"/>
        <rect x="16" y="0" width="8" height="16" rx="0 2 2 0" fill="#CE1126"/>
        {/* Eagle emblem simplified */}
        <circle cx="12" cy="8" r="2" fill="#8B4513" opacity="0.8"/>
      </svg>
    );
  } else {
    return (
      <svg 
        className={`w-6 h-6 transition-all duration-300 ${isActive ? 'scale-110' : 'scale-100'}`} 
        viewBox="0 0 24 16" 
        fill="none"
      >
        {/* US Flag simplified */}
        <rect width="24" height="16" rx="2" fill="#B22234"/>
        <rect x="0" y="1" width="24" height="1" fill="#FFFFFF"/>
        <rect x="0" y="3" width="24" height="1" fill="#FFFFFF"/>
        <rect x="0" y="5" width="24" height="1" fill="#FFFFFF"/>
        <rect x="0" y="7" width="24" height="1" fill="#FFFFFF"/>
        <rect x="0" y="9" width="24" height="1" fill="#FFFFFF"/>
        <rect x="0" y="11" width="24" height="1" fill="#FFFFFF"/>
        <rect x="0" y="13" width="24" height="1" fill="#FFFFFF"/>
        <rect x="0" y="0" width="10" height="8" rx="0" fill="#3C3B6E"/>
      </svg>
    );
  }
};

export function LanguageToggle() {
  const { language, toggleLanguage } = useLanguage();
  const [isAnimating, setIsAnimating] = useState(false);

  const handleToggle = () => {
    setIsAnimating(true);
    setTimeout(() => {
      toggleLanguage();
      setTimeout(() => setIsAnimating(false), 150);
    }, 150);
  };

  return (
    <Button
      onClick={handleToggle}
      variant="ghost"
      size="sm"
      className="relative h-10 px-3 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all duration-200"
      data-testid="button-language-toggle"
    >
      <div className="flex items-center gap-2">
        <div className={`transition-all duration-300 ${isAnimating ? 'scale-0 rotate-180' : 'scale-100 rotate-0'}`}>
          <FlagIcon 
            country={language === 'es' ? 'mx' : 'us'} 
            isActive={true}
          />
        </div>
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {language === 'es' ? 'ES' : 'EN'}
        </span>
      </div>
      
      {/* Animated background effect */}
      <div className={`absolute inset-0 bg-gradient-to-r from-orange-100 to-orange-200 dark:from-orange-900/30 dark:to-orange-800/30 rounded-md transition-all duration-300 -z-10 ${isAnimating ? 'scale-110 opacity-100' : 'scale-95 opacity-0'}`}/>
    </Button>
  );
}