import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Globe, Sun, Moon, Check } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { Language } from '../../types';

export const TopUtilityBar: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');
  const [isLangOpen, setIsLangOpen] = useState<boolean>(false);

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      // Date formatting based on language
      const dateLocale = language === 'hi' ? 'hi-IN' : language === 'or' ? 'or-IN' : 'en-IN';
      setCurrentDate(
        now.toLocaleDateString(dateLocale, {
          weekday: 'short',
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        })
      );
      // Time formatting
      setCurrentTime(
        now.toLocaleTimeString(dateLocale, {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true
        })
      );
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);
    return () => clearInterval(interval);
  }, [language]);

  const languages: { code: Language; label: string; nativeName: string }[] = [
    { code: 'en', label: 'English', nativeName: 'English' },
    { code: 'hi', label: 'Hindi', nativeName: 'हिन्दी' },
    { code: 'or', label: 'Odia', nativeName: 'ଓଡ଼ିଆ' }
  ];

  const currentLangObj = languages.find(l => l.code === language) || languages[0];

  return (
    <div className="bg-red-950 text-white border-b border-red-900/60 text-xs sm:text-sm py-1.5 px-3 sm:px-6 transition-colors">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        {/* Left Side: Live Date & Time */}
        <div className="flex items-center space-x-3 sm:space-x-5 text-amber-200/90 font-medium">
          <div className="flex items-center space-x-1.5">
            <Calendar className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="tracking-wide">{currentDate || 'Loading...'}</span>
          </div>
          <div className="hidden xs:flex items-center space-x-1.5 border-l border-red-800/80 pl-3">
            <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0 animate-pulse" />
            <span className="font-mono tracking-wider text-amber-300">{currentTime || '--:--:--'}</span>
          </div>
        </div>

        {/* Right Side: Language & Theme Switcher */}
        <div className="flex items-center space-x-3 sm:space-x-4 ml-auto">
          {/* Language Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsLangOpen(!isLangOpen)}
              className="flex items-center space-x-1.5 bg-red-900/80 hover:bg-red-800 text-amber-100 hover:text-white px-2.5 py-1 rounded border border-red-800 transition shadow-xs cursor-pointer"
              title={t('language')}
              aria-label="Select Language"
            >
              <Globe className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-medium text-xs">{currentLangObj.nativeName}</span>
              <span className="text-[10px] text-amber-300">▼</span>
            </button>

            {isLangOpen && (
              <div 
                className="absolute right-0 mt-1 w-32 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-md shadow-lg border border-slate-200 dark:border-slate-800 py-1 z-50 animate-in fade-in slide-in-from-top-1"
                onMouseLeave={() => setIsLangOpen(false)}
              >
                {languages.map(lang => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setLanguage(lang.code);
                      setIsLangOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-1.5 text-xs text-left hover:bg-red-50 dark:hover:bg-red-950/40 transition cursor-pointer ${
                      language === lang.code ? 'font-bold text-red-700 dark:text-red-400 bg-red-50/70 dark:bg-red-950/20' : ''
                    }`}
                  >
                    <span>{lang.nativeName}</span>
                    {language === lang.code && <Check className="w-3.5 h-3.5 text-red-600" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="flex items-center space-x-1.5 bg-red-900/80 hover:bg-red-800 text-amber-200 hover:text-amber-100 px-2.5 py-1 rounded border border-red-800 transition shadow-xs cursor-pointer"
            title={theme === 'dark' ? t('lightMode') : t('darkMode')}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-300" />
                <span className="text-xs hidden sm:inline">{t('lightMode')}</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-amber-300" />
                <span className="text-xs hidden sm:inline">{t('darkMode')}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
