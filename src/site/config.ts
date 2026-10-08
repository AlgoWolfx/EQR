import type { QRKind } from '../lib/payloads';

// Set PUBLIC_SITE_URL to the final page URL at build time. No guessed canonical.
export function resolveSite(publicURL = '') {
  if (!publicURL.trim()) return { url: '', base: '/', indexable: false };
  const url = new URL(publicURL);
  if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password)
    throw new Error('PUBLIC_SITE_URL must be an HTTP(S) page URL without credentials.');
  if (url.search || url.hash)
    throw new Error('PUBLIC_SITE_URL cannot contain a query or fragment.');
  const base = `${url.pathname.replace(/\/$/, '')}/`;
  return { url: `${url.origin}${base}`, base, indexable: true };
}

export const site = {
  name: 'EGORA Free QR Code Generator',
  title: 'Free QR Code Generator – No Sign Up, No Watermark | EGORA',
  description:
    'Create unlimited static QR codes for free. No sign-up, watermark or subscription. Download PNG or SVG. The QR code itself never expires.',
  organization: { name: 'EGORA Digital', url: 'https://egoradigital.com/' },
  source: 'https://github.com/AlgoWolfx/EQR',
  // Enable only when these tools actually exist. Never render dead placeholder links.
  moreTools: [] as { label: string; url: string }[],
};

// These are a content contract for future distinct landing pages, not published URLs.
export const futurePages: { slug: string; kind: QRKind; requiredContent: string }[] = [
  {
    slug: 'url-qr-code-generator',
    kind: 'url',
    requiredContent: 'Website, menu and hosted PDF links',
  },
  {
    slug: 'wifi-qr-code-generator',
    kind: 'wifi',
    requiredContent: 'Security, escaping and password sharing',
  },
  {
    slug: 'whatsapp-qr-code-generator',
    kind: 'whatsapp',
    requiredContent: 'Country codes and pre-filled messages',
  },
  {
    slug: 'vcard-qr-code-generator',
    kind: 'contact',
    requiredContent: 'Saving and updating contact details',
  },
  {
    slug: 'email-qr-code-generator',
    kind: 'email',
    requiredContent: 'Email subjects and message encoding',
  },
];

export function initialKind(search: string): QRKind {
  const kind = new URLSearchParams(search).get('type');
  return [
    'url',
    'text',
    'wifi',
    'contact',
    'email',
    'phone',
    'sms',
    'whatsapp',
    'location',
    'review',
  ].includes(kind ?? '')
    ? (kind as QRKind)
    : 'url';
}
