'use client';

import { useLanguage } from '@/context/language-context';
import en from '@/lib/locales/en.json';
import hi from '@/lib/locales/hi.json';

const translations = { en, hi };

export function useTranslation() {
  const { language } = useLanguage();

  const t = (key: string): string => {
    const keys = key.split('.');
    let result: any = translations[language];
    for (const k of keys) {
      result = result?.[k];
      if (result === undefined) {
        // Fallback to English if translation not found
        let fallbackResult: any = translations['en'];
        for (const fk of keys) {
            fallbackResult = fallbackResult?.[fk];
            if(fallbackResult === undefined) return key;
        }
        return fallbackResult;
      }
    }
    return result || key;
  };

  return { t };
}
