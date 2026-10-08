import QRCode from 'qrcode';

export type QRSettings = {
  foreground: string;
  background: string;
  size: number;
  margin: number;
  correction: 'L' | 'M' | 'Q' | 'H';
  style: 'square' | 'rounded';
  logo?: string;
};
export const defaultSettings: QRSettings = {
  foreground: '#254a36',
  background: '#ffffff',
  size: 1024,
  margin: 4,
  correction: 'M',
  style: 'square',
};
function luminance(hex: string) {
  const rgb = hex
    .slice(1)
    .match(/.{2}/g)!
    .map((value) => {
      const n = parseInt(value, 16) / 255;
      return n <= 0.04045 ? n / 12.92 : ((n + 0.055) / 1.055) ** 2.4;
    });
  return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
}
export function validateSettings(s: QRSettings) {
  if (!/^#[\da-f]{6}$/i.test(s.foreground) || !/^#[\da-f]{6}$/i.test(s.background))
    throw new Error('Choose valid foreground and background colors.');
  const dark = luminance(s.foreground);
  const light = luminance(s.background);
  if (dark >= light || (light + 0.05) / (dark + 0.05) < 4.5)
    throw new Error('Use a darker code on a lighter background with at least 4.5:1 contrast.');
  if (!Number.isInteger(s.margin) || s.margin < 4 || s.margin > 12)
    throw new Error('Keep a quiet zone of 4 to 12 modules.');
  if (!Number.isInteger(s.size) || s.size < 256 || s.size > 2048)
    throw new Error('Choose an image size between 256 and 2048 pixels.');
  if (
    s.logo &&
    (!/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(s.logo) ||
      s.logo.length > 3_000_000)
  )
    throw new Error('Use a PNG, JPEG, or WebP logo under 2 MB.');
}
export function renderSVG(payload: string, s: QRSettings): string {
  validateSettings(s);
  let qr: ReturnType<typeof QRCode.create>;
  try {
    qr = QRCode.create(payload, { errorCorrectionLevel: s.logo ? 'H' : s.correction });
  } catch {
    throw new Error(
      'This content is too long for a QR code. Shorten it or choose a lower error correction level.',
    );
  }
  const n = qr.modules.size;
  const total = n + s.margin * 2;
  if (s.size / total < 3)
    throw new Error('This code is dense. Increase the export size or shorten the content.');
  let modules = '';
  for (let row = 0; row < n; row++)
    for (let col = 0; col < n; col++) {
      if (!qr.modules.get(row, col)) continue;
      const finder = (row < 8 && col < 8) || (row < 8 && col >= n - 8) || (row >= n - 8 && col < 8);
      const rounded = s.style === 'rounded' && !finder;
      // Snap square finder cells to pixels even when data cells use smooth rounded edges.
      // Otherwise fractional export scales can leave seams that break scanner detection.
      modules += `<rect x="${col + s.margin}" y="${row + s.margin}" width="1" height="1"${rounded ? ' rx="0.22"' : ' shape-rendering="crispEdges"'}/>`;
    }
  // A small raster-only logo, with H correction and a background pad. Finder patterns remain intact.
  const logoSize = n * 0.14;
  const pad = 1;
  const logo = s.logo
    ? `<rect x="${(total - logoSize) / 2 - pad}" y="${(total - logoSize) / 2 - pad}" width="${logoSize + pad * 2}" height="${logoSize + pad * 2}" fill="${s.background}" rx="0.7"/><image href="${s.logo}" x="${(total - logoSize) / 2}" y="${(total - logoSize) / 2}" width="${logoSize}" height="${logoSize}" preserveAspectRatio="xMidYMid meet"/>`
    : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${s.size}" height="${s.size}" viewBox="0 0 ${total} ${total}" role="img" aria-label="QR code"><rect width="${total}" height="${total}" fill="${s.background}"/><g fill="${s.foreground}"${s.style === 'square' ? ' shape-rendering="crispEdges"' : ''}>${modules}</g>${logo}</svg>`;
}
export const svgURL = (svg: string) =>
  `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
export async function pngBlob(svg: string, size: number): Promise<Blob> {
  const img = new Image();
  img.src = svgURL(svg);
  await img.decode();
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Your browser could not create an image. Try the SVG download.');
  ctx.drawImage(img, 0, 0, size, size);
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Could not export the image.'))),
      'image/png',
    ),
  );
}
export function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}
export async function readLogo(file: File): Promise<string> {
  if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type))
    throw new Error('Choose a PNG, JPEG, or WebP image.');
  if (file.size > 2_000_000) throw new Error('Choose a logo smaller than 2 MB.');
  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    const canvas = document.createElement('canvas');
    const scale = Math.min(1, 320 / Math.max(image.width, image.height));
    canvas.width = Math.max(1, Math.round(image.width * scale));
    canvas.height = Math.max(1, Math.round(image.height * scale));
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Cannot load this logo.');
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/png');
  } finally {
    URL.revokeObjectURL(url);
  }
}
