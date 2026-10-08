import { encodePayload } from './payloads';
import { download, pngBlob, renderSVG, svgURL, type QRSettings } from './qr';
import { translator, languages, type Language } from '../i18n';

export function batchEntries(text: string, type: 'url' | 'text', settings: QRSettings) {
  const rows = text
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (!rows.length) throw new Error('Add at least one line to your batch.');
  if (rows.length > 50) throw new Error('Use up to 50 lines per batch.');
  return rows.map((row, i) => {
    try {
      return { label: row, svg: renderSVG(encodePayload(type, { [type]: row }), settings) };
    } catch (error) {
      throw new Error(`Line ${i + 1}: ${(error as Error).message}`);
    }
  });
}
export async function exportBatch(
  entries: { svg: string }[],
  type: 'png' | 'svg',
  size: number,
  onProgress: (n: number) => void,
) {
  const { default: JSZip } = await import('jszip');
  const zip = new JSZip();
  for (const [index, entry] of entries.entries()) {
    const blob =
      type === 'svg'
        ? new Blob([entry.svg], { type: 'image/svg+xml' })
        : await pngBlob(entry.svg, size);
    zip.file(`eqr-${String(index + 1).padStart(2, '0')}.${type}`, await blob.arrayBuffer());
    onProgress(index + 1);
  }
  download(await zip.generateAsync({ type: 'blob' }), 'eqr-batch.zip');
}
export async function printSheet(
  entries: { svg: string; label: string }[],
  language: Language = 'en',
) {
  const t = translator(language);
  const frame = document.createElement('iframe');
  frame.title = t('EQR — QR sheet');
  frame.style.cssText = 'position:fixed;width:1px;height:1px;left:-9999px;border:0';
  document.body.append(frame);
  try {
    const doc = frame.contentDocument;
    const win = frame.contentWindow;
    if (!doc || !win)
      throw new Error('Your browser cannot open a printable sheet. Download the QR image instead.');
    doc.title = t('EQR — QR sheet');
    doc.documentElement.lang = language;
    doc.documentElement.dir = languages.find((item) => item.code === language)!.direction;
    const style = doc.createElement('style');
    style.textContent =
      '@page{size:A4;margin:16mm}body{font-family:system-ui,-apple-system,"Segoe UI",sans-serif;font-size:12pt;line-height:1.5;color:#17251c;margin:0}h1{font-size:18pt;font-weight:600;margin:0 0 6mm}main{display:grid;grid-template-columns:repeat(2,1fr);gap:8mm}figure{margin:0;padding:6mm;border:1px solid #ddd;break-inside:avoid;text-align:center}img{width:54mm;height:54mm}figcaption{font-size:9pt;margin-top:4mm;overflow-wrap:anywhere}';
    doc.head.append(style);
    const heading = doc.createElement('h1');
    heading.textContent = t('Scan & connect');
    doc.body.append(heading);
    const grid = doc.createElement('main');
    doc.body.append(grid);
    const loaded: Promise<void>[] = [];
    entries.forEach((entry) => {
      const figure = doc.createElement('figure');
      const img = doc.createElement('img');
      img.src = svgURL(entry.svg);
      img.alt = t('QR code');
      loaded.push(img.decode());
      const caption = doc.createElement('figcaption');
      caption.dir = 'auto';
      caption.textContent = entry.label;
      figure.append(img, caption);
      grid.append(figure);
    });
    await Promise.all(loaded);
    await doc.fonts.ready;
    // The iframe owns its content; user text is inserted with textContent, never HTML.
    win.addEventListener('afterprint', () => frame.remove(), { once: true });
    win.focus();
    win.print();
    setTimeout(() => frame.remove(), 60_000);
  } catch (error) {
    frame.remove();
    throw error;
  }
}
