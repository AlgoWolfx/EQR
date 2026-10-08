import { describe, expect, it } from 'vitest';
import { initialKind, resolveSite } from './config';
import { faqs } from './content';
import { escapeHTML, renderHead, renderPage, structuredData } from './render';

describe('production and preview SEO configuration', () => {
  it('keeps an unknown publication address out of search metadata', () => {
    const head = renderHead(resolveSite());
    expect(head).toContain('noindex, nofollow');
    expect(head).not.toContain('rel="canonical"');
    expect(head).not.toContain('property="og:url"');
  });
  it('supports a subdirectory without losing the canonical path', () => {
    const location = resolveSite('https://example.org/tools/qr-code-generator');
    expect(location.base).toBe('/tools/qr-code-generator/');
    const head = renderHead(location);
    expect(head).toContain('href="https://example.org/tools/qr-code-generator/"');
    expect(head).toContain('https://example.org/tools/qr-code-generator/og-card.png');
    expect(head).toContain('index, follow');
    expect(renderPage(location)).toContain('href="/tools/qr-code-generator/?type=wifi#studio"');
  });
  it.each([
    'javascript:alert(1)',
    'https://user:password@example.org/',
    'https://example.org/?q=x',
    'https://example.org/#qr',
  ])('rejects invalid publication config %s', (url) => {
    expect(() => resolveSite(url)).toThrow();
  });
  it('puts the same honest answers in HTML and structured data', () => {
    const location = resolveSite();
    const html = renderPage(location);
    const schema = structuredData(location)['@graph'][1];
    expect(schema).toHaveProperty('@type', 'FAQPage');
    for (const faq of faqs) {
      expect(html).toContain(escapeHTML(faq.question));
      expect(html).toContain(escapeHTML(faq.answer));
    }
    expect(html.match(/<h1\b/g)).toHaveLength(1);
    expect(html).toContain('up to 50 codes per batch');
    expect(html).toContain('still point to that old address');
    expect(JSON.stringify(schema)).not.toContain('aggregateRating');
  });
  it('maps shared use-case links to real generator modes', () => {
    expect(initialKind('?type=wifi')).toBe('wifi');
    expect(initialKind('?type=whatsapp')).toBe('whatsapp');
    expect(initialKind('?type=not-a-mode')).toBe('url');
    expect(initialKind('')).toBe('url');
  });
});
