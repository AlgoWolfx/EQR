import { describe, expect, it } from 'vitest';
import { defaultSettings, renderSVG } from './qr';
import { batchEntries } from './export';

describe('QR rendering safeguards', () => {
  it('produces an SVG at the requested size without a watermark or user HTML', () => {
    const svg = renderSVG('<script>alert("hi")</script>', defaultSettings);
    expect(svg).toContain('width="1024" height="1024"');
    expect(svg).not.toContain('<script>');
    expect(svg).not.toContain('EQR');
  });
  it('keeps finder modules square when using rounded data modules', () => {
    const svg = renderSVG('hello', { ...defaultSettings, style: 'rounded' });
    expect(svg).toContain('<rect x="4" y="4" width="1" height="1" shape-rendering="crispEdges"/>');
    expect(svg).toContain('rx="0.22"');
  });
  it('rejects low contrast, inverted colors and arbitrary color markup', () => {
    for (const foreground of ['#eeeeee', '#ffffff', '"/><script>'])
      expect(() => renderSVG('hello', { ...defaultSettings, foreground })).toThrow();
  });
  it('protects minimum quiet zone and output resolution', () => {
    expect(() => renderSVG('hello', { ...defaultSettings, margin: 0 })).toThrow('quiet zone');
    expect(() => renderSVG('hello', { ...defaultSettings, size: 32 })).toThrow('image size');
    expect(() => renderSVG('hello'.repeat(200), { ...defaultSettings, size: 256 })).toThrow(
      'dense',
    );
  });
  it('reports content beyond QR capacity', () => {
    expect(() => renderSVG('x'.repeat(10_000), defaultSettings)).toThrow('too long');
  });
  it('rejects SVG and remote logos to keep exports self-contained and safe', () => {
    for (const logo of ['https://example.com/image.png', 'data:image/svg+xml;base64,abc'])
      expect(() => renderSVG('hello', { ...defaultSettings, logo })).toThrow('PNG');
  });
});
describe('Batch validation', () => {
  it('ignores blank lines and renders each valid entry', () => {
    expect(
      batchEntries('https://example.com\n\nhttps://example.org\r\n', 'url', defaultSettings),
    ).toHaveLength(2);
  });
  it('identifies a bad row and never partially exports the batch', () => {
    expect(() => batchEntries('https://example.com\ninvalid', 'url', defaultSettings)).toThrow(
      'Line 2',
    );
  });
  it('bounds batch size and rejects empty batches', () => {
    expect(() => batchEntries('Hello\n'.repeat(51), 'text', defaultSettings)).toThrow('50');
    expect(() => batchEntries('  \n', 'text', defaultSettings)).toThrow('at least one');
  });
});
