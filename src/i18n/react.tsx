import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import {
  isLanguage,
  languages,
  preferredLanguage,
  translator,
  type Language,
  type Translate,
} from '.';
import { localizePage } from './page';

export function initialLanguage() {
  let saved: string | null = null;
  try {
    saved = localStorage.getItem('eqr-language');
  } catch {
    /* Optional storage. */
  }
  return preferredLanguage(window.location.search, saved, navigator.language);
}
const Context = createContext<{
  language: Language;
  setLanguage: (language: Language) => void;
  t: Translate;
} | null>(null);
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState(initialLanguage);
  useEffect(() => {
    localizePage(language);
    try {
      localStorage.setItem('eqr-language', language);
    } catch {
      /* Optional storage. */
    }
    const url = new URL(window.location.href);
    if (language === 'en') url.searchParams.delete('lang');
    else url.searchParams.set('lang', language);
    window.history.replaceState(null, '', url);
  }, [language]);
  return (
    <Context.Provider value={{ language, setLanguage, t: translator(language) }}>
      {children}
    </Context.Provider>
  );
}
export function useLanguage() {
  const context = useContext(Context);
  if (!context) throw new Error('LanguageProvider is required.');
  return context;
}
export function LanguageSelector() {
  const { language, setLanguage, t } = useLanguage();
  return (
    <select
      className="language-select"
      aria-label={t('Language')}
      value={language}
      onChange={(event) => {
        if (isLanguage(event.target.value)) setLanguage(event.target.value);
      }}
    >
      {languages.map((item) => (
        <option key={item.code} value={item.code} lang={item.code}>
          {item.name}
        </option>
      ))}
    </select>
  );
}
