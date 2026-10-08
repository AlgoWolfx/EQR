import { describe, expect, it } from 'vitest';
import { encodePayload, escapeWiFi, PayloadError, type QRKind } from './payloads';

describe('QR payload encoders', () => {
  it('preserves long URLs, Unicode paths and query strings', () => {
    const url = `https://example.com/İstanbul/ação?q=${'x'.repeat(600)}&name=Yiğit`;
    expect(encodePayload('url', { url })).toBe(url);
  });
  it.each([
    'javascript:alert(1)',
    'data:text/html,hello',
    'example.com',
    'https://',
    'https://user:pass@example.com',
  ])('rejects unsafe or invalid website URLs: %s', (url) => {
    expect(() => encodePayload('url', { url })).toThrow(PayloadError);
  });
  it('preserves plain text, line breaks, whitespace and Turkish/Portuguese characters', () => {
    const text = '  Yiğit · İstanbul\nOlá, São Paulo! Çığ şü ö ı İ 🚀  ';
    expect(encodePayload('text', { text })).toBe(text);
  });
  it('escapes Wi-Fi punctuation, backslashes and quotes without trimming credentials', () => {
    expect(escapeWiFi('a\\b;c,d:e"f')).toBe('a\\\\b\\;c\\,d\\:e\\"f');
    expect(
      encodePayload('wifi', {
        ssid: ' Café;Guest ',
        password: ' p:a\\s"s; ',
        security: 'WPA',
        hidden: 'true',
      }),
    ).toBe('WIFI:T:WPA;S: Café\\;Guest ;P: p\\:a\\\\s\\"s\\; ;H:true;;');
  });
  it('omits passwords on open Wi-Fi networks', () => {
    expect(encodePayload('wifi', { ssid: 'Guests', security: 'nopass', password: 'ignored' })).toBe(
      'WIFI:T:nopass;S:Guests;H:false;;',
    );
  });
  it('rejects invalid Wi-Fi security and missing passwords', () => {
    expect(() => encodePayload('wifi', { ssid: 'Test', security: 'evil;' })).toThrow();
    expect(() => encodePayload('wifi', { ssid: 'Test', security: 'WPA' })).toThrow();
  });
  it('emits escaped CRLF vCard 3.0 and prevents property injection', () => {
    const result = encodePayload('contact', {
      firstName: 'Yiğit',
      lastName: 'Bayrak',
      organization: 'EGORA; Digital, Inc\nURL:evil',
      phone: '+90 (532) 123-4567',
      email: 'hi@example.com',
      website: 'https://example.com',
    });
    expect(result).toBe(
      'BEGIN:VCARD\r\nVERSION:3.0\r\nN:Bayrak;Yiğit;;;\r\nFN:Yiğit Bayrak\r\nORG:EGORA\\; Digital\\, Inc\\nURL:evil\r\nTEL;TYPE=CELL:+905321234567\r\nEMAIL:hi@example.com\r\nURL:https://example.com\r\nEND:VCARD',
    );
  });
  it('folds long vCard lines at 75 UTF-8 bytes without splitting characters', () => {
    const name = 'İğçã'.repeat(40);
    const result = encodePayload('contact', { firstName: name });
    expect(result.split('\r\n').every((line) => new TextEncoder().encode(line).length <= 75)).toBe(
      true,
    );
    expect(result.replace(/\r\n /g, '')).toContain(`FN:${name}`);
  });
  it('encodes email headers and body independently', () => {
    expect(
      encodePayload('email', {
        email: 'hello@example.com',
        subject: 'Olá & İyi',
        message: 'Line 1\nLine 2?',
      }),
    ).toBe(
      'mailto:hello@example.com?subject=Ol%C3%A1%20%26%20%C4%B0yi&body=Line%201%0ALine%202%3F',
    );
    expect(encodePayload('email', { email: 'hello@example.com' })).toBe('mailto:hello@example.com');
  });
  it('rejects recipient injection', () => {
    expect(() => encodePayload('email', { email: 'hi@example.com?cc=bad@example.com' })).toThrow();
  });
  it('encodes valid recipient punctuation so it cannot become a URI fragment or query', () => {
    expect(encodePayload('email', { email: 'hello#tag+more@example.com' })).toBe(
      'mailto:hello%23tag%2Bmore@example.com',
    );
    for (const email of ['hello..there@example.com', '<hello>@example.com', 'hi@-invalid.com']) {
      expect(() => encodePayload('email', { email })).toThrow();
    }
  });
  it('normalizes phone numbers and encodes SMS messages', () => {
    expect(encodePayload('phone', { phone: '+44 (7700) 900-123' })).toBe('tel:+447700900123');
    expect(encodePayload('sms', { phone: '+905321234567', message: 'Hi & bye' })).toBe(
      'sms:+905321234567?body=Hi%20%26%20bye',
    );
    expect(() => encodePayload('phone', { phone: '+90;123?body=evil' })).toThrow();
  });
  it('requires international WhatsApp numbers and escapes the chat message', () => {
    expect(encodePayload('whatsapp', { phone: '+90 532 123 4567', message: 'Olá İstanbul' })).toBe(
      'https://wa.me/905321234567?text=Ol%C3%A1%20%C4%B0stanbul',
    );
    expect(() => encodePayload('whatsapp', { phone: '05321234567' })).toThrow();
    expect(() => encodePayload('whatsapp', { phone: '+05321234567' })).toThrow();
  });
  it('supports valid coordinate edges and rejects invalid input', () => {
    expect(encodePayload('location', { latitude: '-90', longitude: '180' })).toBe('geo:-90,180');
    for (const latitude of ['91', 'Infinity', '0x30', 'NaN', ''])
      expect(() => encodePayload('location', { latitude, longitude: '0' })).toThrow();
    expect(() => encodePayload('location', { latitude: '0', longitude: '-181' })).toThrow();
  });
  it('builds Google review destinations from Place IDs', () => {
    expect(encodePayload('review', { placeId: 'ChIJ1234567890_test' })).toBe(
      'https://search.google.com/local/writereview?placeid=ChIJ1234567890_test',
    );
    expect(() => encodePayload('review', { placeId: 'https://maps.google.com' })).toThrow();
  });
  it.each<QRKind>([
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
  ])('rejects empty %s content', (kind) => {
    expect(() => encodePayload(kind, {})).toThrow(PayloadError);
  });
});
