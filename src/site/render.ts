import { faqs, useCases } from './content';
import { site, type resolveSite } from './config';
import { translator, type Language } from '../i18n';

type SiteLocation = ReturnType<typeof resolveSite>;
export function escapeHTML(value: string) {
  return value.replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!,
  );
}
export function structuredData(location: SiteLocation, language: Language = 'en') {
  const t = translator(language);
  const application = {
    '@type': 'WebApplication',
    name: t(site.name),
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Any',
    browserRequirements: t('Requires JavaScript for QR generation'),
    description: t(site.description),
    inLanguage: language,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
    ...(location.url ? { url: location.url } : {}),
    publisher: {
      '@type': 'Organization',
      name: site.organization.name,
      url: site.organization.url,
    },
  };
  return {
    '@context': 'https://schema.org',
    '@graph': [
      application,
      {
        '@type': 'FAQPage',
        mainEntity: faqs.map(({ question, answer }) => ({
          '@type': 'Question',
          name: t(question),
          acceptedAnswer: { '@type': 'Answer', text: t(answer) },
        })),
      },
    ],
  };
}
export function renderHead(location: SiteLocation) {
  const image = location.url ? new URL('og-card.png', location.url).href : '';
  return `
    <script>document.documentElement.classList.add('js');try{var t=localStorage.getItem('eqr-theme');if(t==='dark'||(t!=='light'&&matchMedia('(prefers-color-scheme: dark)').matches))document.documentElement.dataset.theme='dark'}catch(e){}</script>
    <title>${escapeHTML(site.title)}</title>
    <meta name="description" content="${escapeHTML(site.description)}">
    <meta name="robots" content="${location.indexable ? 'index, follow' : 'noindex, nofollow'}">
    <meta property="og:title" content="${escapeHTML(site.title)}">
    <meta property="og:description" content="${escapeHTML(site.description)}">
    <meta property="og:type" content="website">
    <meta property="og:site_name" content="EGORA Digital">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${escapeHTML(site.title)}">
    <meta name="twitter:description" content="${escapeHTML(site.description)}">
    ${location.url ? `<link rel="canonical" href="${escapeHTML(location.url)}"><meta property="og:url" content="${escapeHTML(location.url)}"><meta property="og:image" content="${escapeHTML(image)}"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta name="twitter:image" content="${escapeHTML(image)}">` : ''}
    <script type="application/ld+json">${JSON.stringify(structuredData(location)).replace(/</g, '\\u003c')}</script>`;
}
export function renderPage(location: SiteLocation) {
  const base = escapeHTML(location.base);
  return `
    <a class="skip-link" href="#studio" data-i18n="Skip to QR generator">Skip to QR generator</a>
    <header class="site-header">
      <a class="brand" href="${base}" aria-label="EGORA EQR home" data-i18n-aria-label="EGORA EQR home"><img src="${base}icon.svg" width="24" height="24" alt=""><span>EGORA<span class="brand-subtitle" data-i18n="/ EQR"> / EQR</span></span></a>
      <nav class="header-actions" aria-label="Main navigation" data-i18n-aria-label="Main navigation"><a href="#qr-guide" data-i18n="How it works">How it works</a><a href="${site.source}" target="_blank" rel="noreferrer" class="source-link" data-i18n="Open source">Open source</a><span id="language-control"></span><span id="theme-control"></span></nav>
    </header>
    <main class="page">
      <section class="intro" aria-labelledby="page-title"><h1 id="page-title" data-i18n="Free QR Code Generator">Free QR Code Generator</h1><p class="intro-promise" data-i18n="No sign-up. No watermark. No limits.">No sign-up. No watermark. No limits.</p><p class="intro-description" data-i18n="Create a static QR code and download it instantly.">Create a static QR code and download it instantly.</p></section>
      <div id="studio" class="tool-mount"><div class="tool-loading" role="status"><p class="without-js" data-i18n="Enable JavaScript to generate QR codes locally in your browser. The guide and answers below are available without it.">Enable JavaScript to generate QR codes locally in your browser. The guide and answers below are available without it.</p><p class="with-js" data-i18n="Loading QR generator…">Loading QR generator…</p></div></div>
      <div class="reading-content">
        <section class="free-section" aria-labelledby="free-heading"><h2 id="free-heading" data-i18n="Free means free.">Free means free.</h2><p data-i18n="No subscription. No account. No watermark. Create it, download it, use it.">No subscription. No account. No watermark. Create it, download it, use it.</p><p data-i18n="Each code contains your information directly. It needs no EGORA service to keep working.">Each code contains your information directly. It needs no EGORA service to keep working.</p></section>
        <section id="qr-guide" aria-labelledby="guide-heading"><h2 id="guide-heading" data-i18n="How to create a QR code">How to create a QR code</h2><ol class="guide-steps"><li><h3 data-i18n="Enter your information">Enter your information</h3><p data-i18n="Paste a link or choose another type, like Wi-Fi or a contact card.">Paste a link or choose another type, like Wi-Fi or a contact card.</p></li><li><h3 data-i18n="Make it yours">Make it yours</h3><p data-i18n="The preview updates as you type. Change colors or add a logo if you want.">The preview updates as you type. Change colors or add a logo if you want.</p></li><li><h3 data-i18n="Download and test">Download and test</h3><p data-i18n="Save PNG for sharing or SVG for print. Check it with your camera before using it.">Save PNG for sharing or SVG for print. Check it with your camera before using it.</p></li></ol></section>
        <section aria-labelledby="uses-heading"><h2 id="uses-heading" data-i18n="What can I use a QR code for?">What can I use a QR code for?</h2><dl class="use-cases">${useCases.map((item) => `<div><dt><a href="${base}?type=${item.kind}#studio" data-i18n="${escapeHTML(item.name)}">${escapeHTML(item.name)}</a></dt><dd data-i18n="${escapeHTML(item.text)}">${escapeHTML(item.text)}</dd></div>`).join('')}</dl></section>
        <section aria-labelledby="static-heading"><h2 id="static-heading" data-i18n="Static codes. No expiration date.">Static codes. No expiration date.</h2><p data-i18n="A static QR code contains your link or information directly. Its encoded content cannot be edited after download. You can create a new code whenever you need one.">A static QR code contains your link or information directly. Its encoded content cannot be edited after download. You can create a new code whenever you need one.</p><p data-i18n="The code itself does not expire, but a linked website or file can become unavailable. Keep your destination online. Dynamic QR codes use a managed redirect to change destinations; this tool creates static codes.">The code itself does not expire, but a linked website or file can become unavailable. Keep your destination online. Dynamic QR codes use a managed redirect to change destinations; this tool creates static codes.</p></section>
        <section class="faq" aria-labelledby="faq-heading"><h2 id="faq-heading" data-i18n="Questions, answered.">Questions, answered.</h2>${faqs.map(({ question, answer }) => `<details><summary><span data-i18n="${escapeHTML(question)}">${escapeHTML(question)}</span><span aria-hidden="true">+</span></summary><p data-i18n="${escapeHTML(answer)}">${escapeHTML(answer)}</p></details>`).join('')}</section>
        ${site.moreTools.length ? `<section aria-labelledby="tools-heading"><h2 id="tools-heading" data-i18n="More free tools">More free tools</h2><ul>${site.moreTools.map((tool) => `<li><a href="${escapeHTML(tool.url)}">${escapeHTML(tool.label)}</a></li>`).join('')}</ul></section>` : ''}
        <section class="custom-section" aria-labelledby="custom-heading"><div><h2 id="custom-heading" data-i18n="Need something custom?">Need something custom?</h2><p data-i18n="Websites, automations and software built for businesses.">Websites, automations and software built for businesses.</p></div><a href="${site.organization.url}" target="_blank" rel="noreferrer"><span data-i18n="Visit EGORA Digital">Visit EGORA Digital</span> <span aria-hidden="true">→</span></a></section>
      </div>
    </main>
    <footer class="site-footer"><p><span data-i18n="Free QR Code Generator by">Free QR Code Generator by</span> <a href="${site.organization.url}">EGORA Digital</a></p><span><span data-i18n="Built by">Built by</span> <a href="https://github.com/AlgoWolfx">Yiğit Bayrak</a></span><span id="offline-status"></span></footer>`;
}
