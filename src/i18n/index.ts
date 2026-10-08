import { translationRows } from './messages';

export const languages = [
  { code: 'en', name: 'English', direction: 'ltr' },
  { code: 'de', name: 'Deutsch', direction: 'ltr' },
  { code: 'tr', name: 'Türkçe', direction: 'ltr' },
  { code: 'ar', name: 'العربية', direction: 'rtl' },
  { code: 'ja', name: '日本語', direction: 'ltr' },
  { code: 'es', name: 'Español', direction: 'ltr' },
  { code: 'pt', name: 'Português', direction: 'ltr' },
] as const;
export type Language = (typeof languages)[number]['code'];
export type Translate = (message: string, params?: Record<string, string | number>) => string;
const catalogs = languages.map(
  (_, i) => new Map<string, string>(translationRows.map((row) => [row[0], row[i]])),
);
export function isLanguage(value: string | null | undefined): value is Language {
  return languages.some((language) => language.code === value);
}
export function preferredLanguage(search: string, saved?: string | null, browser = 'en'): Language {
  const query = new URLSearchParams(search).get('lang');
  if (isLanguage(query)) return query;
  if (isLanguage(saved)) return saved;
  const base = browser.toLowerCase().split(/[-_]/)[0];
  return isLanguage(base) ? base : 'en';
}
export function translator(language: Language): Translate {
  const catalog = catalogs[languages.findIndex((item) => item.code === language)];
  const t: Translate = (message, params = {}) => {
    const line = /^Line (\d+): (.+)$/s.exec(message);
    if (line) return t('Line {line}: {message}', { line: line[1], message: t(line[2]) });
    const downloaded = /^(PNG|SVG) downloaded\.$/.exec(message);
    if (downloaded) return t('{type} downloaded.', { type: downloaded[1] });
    return (catalog.get(message) ?? message).replace(/\{(\w+)\}/g, (token, name: string) =>
      params[name] === undefined ? token : String(params[name]),
    );
  };
  return t;
}
