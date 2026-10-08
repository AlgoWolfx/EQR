import { translator, languages, type Language } from '.';
import { structuredData } from '../site/render';
import { site } from '../site/config';

export function localizePage(language: Language) {
  const t = translator(language);
  document.documentElement.lang = language;
  document.documentElement.dir = languages.find((item) => item.code === language)!.direction;
  document.querySelectorAll<HTMLElement>('[data-i18n]').forEach((element) => {
    element.textContent = t(element.dataset.i18n!);
  });
  document.querySelectorAll<HTMLElement>('[data-i18n-aria-label]').forEach((element) => {
    element.setAttribute('aria-label', t(element.dataset.i18nAriaLabel!));
  });
  document.querySelectorAll<HTMLAnchorElement>('.use-cases a').forEach((link) => {
    const url = new URL(link.href);
    if (language === 'en') url.searchParams.delete('lang');
    else url.searchParams.set('lang', language);
    link.href = url.href;
  });
  document.title = t(site.title);
  for (const selector of [
    'meta[name="description"]',
    'meta[property="og:description"]',
    'meta[name="twitter:description"]',
  ]) {
    document.querySelector(selector)?.setAttribute('content', t(site.description));
  }
  for (const selector of ['meta[property="og:title"]', 'meta[name="twitter:title"]']) {
    document.querySelector(selector)?.setAttribute('content', t(site.title));
  }
  const url = document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.href ?? '';
  const schema = document.querySelector('script[type="application/ld+json"]');
  if (schema)
    schema.textContent = JSON.stringify(
      structuredData({ url, base: import.meta.env.BASE_URL, indexable: !!url }, language),
    );
}
