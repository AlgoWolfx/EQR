import { describe, expect, it } from 'vitest';
import { languages, preferredLanguage, translator } from '.';
import { translationRows } from './messages';
import { formats } from '../lib/payloads';
import { faqs, useCases } from '../site/content';
import { resolveSite } from '../site/config';
import { structuredData } from '../site/render';

describe('interface localization', () => {
  it('supports the requested languages with Arabic RTL and no Chinese option', () => {
    expect(languages.map((item) => item.code)).toEqual(['en', 'de', 'tr', 'ar', 'ja', 'es', 'pt']);
    expect(languages.filter((item) => item.direction === 'rtl').map((item) => item.code)).toEqual([
      'ar',
    ]);
  });
  it('prioritizes a supported URL language, saved preference, then browser language', () => {
    expect(preferredLanguage('?type=wifi&lang=ar', 'tr', 'de-DE')).toBe('ar');
    expect(preferredLanguage('?lang=zh', 'tr', 'de-DE')).toBe('tr');
    expect(preferredLanguage('', 'unsupported', 'es-MX')).toBe('es');
    expect(preferredLanguage('', null, 'JA-jp')).toBe('ja');
    expect(preferredLanguage('', null, 'pt-BR')).toBe('pt');
    expect(preferredLanguage('', null, 'pt-PT')).toBe('pt');
    expect(preferredLanguage('', null, 'zh-CN')).toBe('en');
  });
  it('keeps every catalog complete with matching interpolation tokens', () => {
    const tokens = (text: string) => [...text.matchAll(/\{\w+\}/g)].map((match) => match[0]).sort();
    expect(new Set(translationRows.map((row) => row[0])).size).toBe(translationRows.length);
    for (const row of translationRows) {
      expect(row).toHaveLength(languages.length);
      for (const message of row) {
        expect(message.trim()).not.toBe('');
        expect(tokens(message), row[0]).toEqual(tokens(row[0]));
      }
    }
  });
  it('covers all format titles, descriptions, field labels, help and shared page content', () => {
    const keys = new Set<string>(translationRows.map((row) => row[0]));
    const messages = formats.flatMap((format) => [
      format.name,
      format.title,
      format.description,
      ...format.fields.flatMap((field) => [field.label, ...(field.hint ? [field.hint] : [])]),
    ]);
    messages.push(
      ...faqs.flatMap((faq) => [faq.question, faq.answer]),
      ...useCases.flatMap((item) => [item.name, item.text]),
    );
    for (const message of messages.filter((message) => message !== 'Google Place ID'))
      expect(keys.has(message), message).toBe(true);
  });
  it('localizes dynamic errors and feedback without changing technical values', () => {
    const t = translator('tr');
    expect(t('Line 2: Enter a website URL.')).toBe('Satır 2: Web sitesi adresi gir.');
    expect(t('PNG downloaded.')).toBe(t('{type} downloaded.', { type: 'PNG' }));
    expect(t('Use {color} code color', { color: '#254a36' })).toContain('#254a36');
    expect(t('WPA / WPA2 / WPA3')).toBe('WPA / WPA2 / WPA3');
  });
  it.each(languages)(
    'keeps $code FAQ schema consistent with the visible translations',
    ({ code }) => {
      const schema = structuredData(resolveSite(), code);
      const t = translator(code);
      expect(schema['@graph'][0]).toHaveProperty('inLanguage', code);
      expect(schema['@graph'][1]).toHaveProperty(
        'mainEntity',
        faqs.map((faq) => ({
          '@type': 'Question',
          name: t(faq.question),
          acceptedAnswer: { '@type': 'Answer', text: t(faq.answer) },
        })),
      );
    },
  );
});
