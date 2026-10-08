export type QRKind =
  | 'url'
  | 'text'
  | 'wifi'
  | 'contact'
  | 'email'
  | 'phone'
  | 'sms'
  | 'whatsapp'
  | 'location'
  | 'review';
export type Values = Record<string, string>;
export type Field = {
  key: string;
  label: string;
  placeholder?: string;
  type?: 'text' | 'email' | 'tel' | 'password' | 'textarea' | 'select';
  options?: { value: string; label: string }[];
  optional?: boolean;
  hint?: string;
};
export type Format = {
  id: QRKind;
  name: string;
  title: string;
  description: string;
  fields: Field[];
  defaults: Values;
};

export const formats: Format[] = [
  {
    id: 'url',
    name: 'Website',
    title: 'Share a website',
    description: 'Open a website, profile, menu, or any other link with a scan.',
    fields: [
      {
        key: 'url',
        label: 'Website URL',
        placeholder: 'https://example.com',
        hint: 'Include https:// or http:// in your link.',
      },
    ],
    defaults: { url: 'https://example.com' },
  },
  {
    id: 'text',
    name: 'Text',
    title: 'Share a message',
    description: 'Show a note or instructions when someone scans your code. No website needed.',
    fields: [
      {
        key: 'text',
        label: 'Your text',
        type: 'textarea',
        placeholder: 'Enter the message you want to share',
      },
    ],
    defaults: { text: '' },
  },
  {
    id: 'wifi',
    name: 'Wi-Fi',
    title: 'Connect to Wi-Fi',
    description: 'Let guests scan to join your network without typing the password.',
    fields: [
      { key: 'ssid', label: 'Network name', placeholder: 'Your Wi-Fi network' },
      {
        key: 'security',
        label: 'Security',
        type: 'select',
        options: [
          { value: 'WPA', label: 'WPA / WPA2 / WPA3' },
          { value: 'WEP', label: 'WEP' },
          { value: 'nopass', label: 'Open network (no password)' },
        ],
      },
      { key: 'password', label: 'Password', type: 'password', placeholder: 'Network password' },
      {
        key: 'hidden',
        label: 'Hidden network',
        type: 'select',
        options: [
          { value: 'false', label: 'No' },
          { value: 'true', label: 'Yes' },
        ],
      },
    ],
    defaults: { ssid: '', security: 'WPA', password: '', hidden: 'false' },
  },
  {
    id: 'contact',
    name: 'Contact',
    title: 'Share contact details',
    description: 'Create a contact card that people can save to their address book.',
    fields: [
      { key: 'firstName', label: 'First name', placeholder: 'Ada' },
      { key: 'lastName', label: 'Last name', placeholder: 'Lovelace', optional: true },
      { key: 'organization', label: 'Organization', placeholder: 'Your company', optional: true },
      {
        key: 'phone',
        label: 'Phone number',
        type: 'tel',
        placeholder: '+44 7700 900123',
        optional: true,
      },
      {
        key: 'email',
        label: 'Email address',
        type: 'email',
        placeholder: 'hello@example.com',
        optional: true,
      },
      { key: 'website', label: 'Website', placeholder: 'https://example.com', optional: true },
    ],
    defaults: {},
  },
  {
    id: 'email',
    name: 'Email',
    title: 'Start an email',
    description: 'Set the recipient, then add an optional subject and message.',
    fields: [
      { key: 'email', label: 'Email address', type: 'email', placeholder: 'hello@example.com' },
      { key: 'subject', label: 'Subject', placeholder: 'Let’s talk', optional: true },
      { key: 'message', label: 'Message', type: 'textarea', optional: true },
    ],
    defaults: {},
  },
  {
    id: 'phone',
    name: 'Phone',
    title: 'Make a phone call',
    description: 'Open the phone dialer with your number ready to call.',
    fields: [{ key: 'phone', label: 'Phone number', type: 'tel', placeholder: '+44 7700 900123' }],
    defaults: {},
  },
  {
    id: 'sms',
    name: 'SMS',
    title: 'Start a text message',
    description: 'Pre-fill a text message. The person scanning chooses whether to send it.',
    fields: [
      { key: 'phone', label: 'Phone number', type: 'tel', placeholder: '+44 7700 900123' },
      { key: 'message', label: 'Message', type: 'textarea', optional: true },
    ],
    defaults: {},
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    title: 'Open a WhatsApp chat',
    description: 'Start a WhatsApp conversation with your number and optional message.',
    fields: [
      {
        key: 'phone',
        label: 'Phone number with country code',
        type: 'tel',
        placeholder: '+90 532 123 4567',
        hint: 'Use the international number, including its country code.',
      },
      { key: 'message', label: 'Message', type: 'textarea', optional: true },
    ],
    defaults: {},
  },
  {
    id: 'location',
    name: 'Location',
    title: 'Share a location',
    description: 'Open these coordinates in a supported maps app.',
    fields: [
      { key: 'latitude', label: 'Latitude', placeholder: '41.0082', hint: 'Between −90 and 90.' },
      {
        key: 'longitude',
        label: 'Longitude',
        placeholder: '28.9784',
        hint: 'Between −180 and 180.',
      },
    ],
    defaults: {},
  },
  {
    id: 'review',
    name: 'Google review',
    title: 'Collect Google reviews',
    description: 'Link to the review form for your Google Business listing.',
    fields: [
      {
        key: 'placeId',
        label: 'Google Place ID',
        placeholder: 'ChIJ…',
        hint: 'Enter your Google Place ID, not a Maps URL or business name.',
      },
    ],
    defaults: {},
  },
];

export class PayloadError extends Error {
  constructor(
    public field: string,
    message: string,
  ) {
    super(message);
  }
}
function required(v: Values, key: string, label: string) {
  const value = (v[key] ?? '').trim();
  if (!value) throw new PayloadError(key, `Enter ${label}.`);
  return value;
}
function webURL(value: string, field: string) {
  try {
    const parsed = new URL(value);
    if (!['https:', 'http:'].includes(parsed.protocol) || !parsed.hostname) throw new Error();
    if (parsed.username || parsed.password) throw new Error();
    return value;
  } catch {
    throw new PayloadError(
      field,
      'Enter a valid http:// or https:// URL without embedded credentials.',
    );
  }
}
function email(value: string) {
  const [local, domain, extra] = value.split('@');
  const validLocal =
    /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+$/.test(local ?? '') &&
    !local.startsWith('.') &&
    !local.endsWith('.') &&
    !local.includes('..') &&
    local.length <= 64;
  const labels = (domain ?? '').split('.');
  const validDomain =
    labels.length >= 2 &&
    labels.every((label) => /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?$/.test(label));
  if (extra !== undefined || !validLocal || !validDomain || value.length > 254)
    throw new PayloadError('email', 'Enter a valid email address.');
  return value;
}
function phone(value: string) {
  if (!/^\+?[\d\s().-]+$/.test(value))
    throw new PayloadError(
      'phone',
      'Enter a phone number using digits and an optional + country code.',
    );
  const clean = value.replace(/[\s().-]/g, '');
  if (!/^\+?\d{3,15}$/.test(clean)) throw new PayloadError('phone', 'Use between 3 and 15 digits.');
  return clean;
}
export const escapeWiFi = (value: string) => value.replace(/[\\;,:\"]/g, '\\$&');
export const escapeVCard = (value: string) =>
  value
    .replace(/\\/g, '\\\\')
    .replace(/\r\n|\r|\n/g, '\\n')
    .replace(/[;,]/g, '\\$&');
const oneLine = (value: string) => value.replace(/[\r\n]/g, '');

export function encodePayload(kind: QRKind, v: Values): string {
  switch (kind) {
    case 'url':
      return webURL(required(v, 'url', 'a website URL'), 'url');
    case 'text': {
      if (!(v.text ?? '').trim()) throw new PayloadError('text', 'Enter some text.');
      return v.text;
    }
    case 'wifi': {
      required(v, 'ssid', 'a network name');
      const security = v.security ?? 'WPA';
      if (!['WPA', 'WEP', 'nopass'].includes(security))
        throw new PayloadError('security', 'Choose a supported network security type.');
      if (security !== 'nopass' && !(v.password ?? ''))
        throw new PayloadError('password', 'Enter the network password.');
      return `WIFI:T:${security};S:${escapeWiFi(v.ssid)};${security === 'nopass' ? '' : `P:${escapeWiFi(v.password)};`}H:${v.hidden === 'true'};;`;
    }
    case 'contact': {
      const first = required(v, 'firstName', 'a first name');
      const last = (v.lastName ?? '').trim();
      const lines = [
        'BEGIN:VCARD',
        'VERSION:3.0',
        `N:${escapeVCard(last)};${escapeVCard(first)};;;`,
        `FN:${escapeVCard([first, last].filter(Boolean).join(' '))}`,
      ];
      if (v.organization?.trim()) lines.push(`ORG:${escapeVCard(v.organization.trim())}`);
      if (v.phone?.trim()) lines.push(`TEL;TYPE=CELL:${phone(v.phone.trim())}`);
      if (v.email?.trim()) lines.push(`EMAIL:${email(v.email.trim())}`);
      if (v.website?.trim()) lines.push(`URL:${oneLine(webURL(v.website.trim(), 'website'))}`);
      lines.push('END:VCARD');
      // vCard 3.0 lines fold at 75 UTF-8 octets; never split a Unicode character.
      return lines
        .flatMap((line) => {
          const parts: string[] = [];
          let part = '';
          let bytes = 0;
          for (const char of line) {
            const width = new TextEncoder().encode(char).length;
            if (bytes + width > 75) {
              parts.push(part);
              part = ' ';
              bytes = 1;
            }
            part += char;
            bytes += width;
          }
          parts.push(part);
          return parts;
        })
        .join('\r\n');
    }
    case 'email': {
      const address = email(required(v, 'email', 'an email address'));
      const [local, domain] = address.split('@');
      const recipient = `${encodeURIComponent(local)}@${domain}`;
      const query = [
        v.subject ? `subject=${encodeURIComponent(v.subject)}` : '',
        v.message ? `body=${encodeURIComponent(v.message)}` : '',
      ]
        .filter(Boolean)
        .join('&');
      return `mailto:${recipient}${query ? `?${query}` : ''}`;
    }
    case 'phone':
      return `tel:${phone(required(v, 'phone', 'a phone number'))}`;
    case 'sms':
      return `sms:${phone(required(v, 'phone', 'a phone number'))}${v.message ? `?body=${encodeURIComponent(v.message)}` : ''}`;
    case 'whatsapp': {
      const value = required(v, 'phone', 'an international phone number');
      if (!value.startsWith('+'))
        throw new PayloadError('phone', 'Start with + and the country code, for example +90.');
      const number = phone(value).slice(1);
      if (number.startsWith('0') || number.length < 7)
        throw new PayloadError('phone', 'Use a valid international number with its country code.');
      return `https://wa.me/${number}${v.message ? `?text=${encodeURIComponent(v.message)}` : ''}`;
    }
    case 'location': {
      const coordinates = ['latitude', 'longitude'].map((key, i) => {
        const value = required(v, key, key);
        const num = Number(value);
        if (
          !/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(value) ||
          !Number.isFinite(num) ||
          Math.abs(num) > (i === 0 ? 90 : 180)
        )
          throw new PayloadError(
            key,
            `Enter a ${key} between ${i === 0 ? '−90 and 90' : '−180 and 180'}.`,
          );
        return num;
      });
      return `geo:${coordinates.join(',')}`;
    }
    case 'review': {
      const id = required(v, 'placeId', 'a Google Place ID');
      if (!/^[A-Za-z0-9_-]{10,}$/.test(id))
        throw new PayloadError('placeId', 'Enter a Google Place ID, not a URL or business name.');
      return `https://search.google.com/local/writereview?placeid=${encodeURIComponent(id)}`;
    }
  }
}
