'use client';

import { useLanguage } from '@/context/language-context';
import en from '@/lib/locales/en.json';
import hi from '@/lib/locales/hi.json';
import { useCallback } from 'react';

const translations = { en, hi };

// Helper function to safely access nested properties
const getTranslation = (lang: 'en' | 'hi', key: string): string | undefined => {
  const keys = key.split('.');
  let result: any = translations[lang];
  for (const k of keys) {
    result = result?.[k];
    if (result === undefined) {
      return undefined;
    }
  }
  return typeof result === 'string' ? result : undefined;
};


export function useTranslation() {
  const { language } = useLanguage();

  const t = useCallback((key: string): string => {
    const translated = getTranslation(language, key);
    if (translated !== undefined) {
      return translated;
    }

    // Fallback to English if the translation is not found in the current language
    if (language !== 'en') {
      const fallback = getTranslation('en', key);
      if (fallback !== undefined) {
        return fallback;
      }
    }
    
    // If no translation is found in either language, return the key itself
    return key;
  }, [language]);

  return { t };
}
