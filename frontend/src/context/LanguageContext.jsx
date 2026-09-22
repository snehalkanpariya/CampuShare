import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations, getTranslation } from '../config/translations';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('campus_lang') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('campus_lang', lang);
  }, [lang]);

  const t = (key, fallback = '') => {
    return getTranslation(lang, key, fallback);
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    return {
      lang: 'en',
      setLang: () => {},
      t: (k, fb) => fb || k
    };
  }
  return context;
}
