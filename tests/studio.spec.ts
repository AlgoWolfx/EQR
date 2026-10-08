import { test, expect, type Page } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { PNG } from 'pngjs';
import jsQR from 'jsqr';
import { BinaryBitmap, HybridBinarizer, RGBLuminanceSource, QRCodeReader } from '@zxing/library';
import JSZip from 'jszip';
import AxeBuilder from '@axe-core/playwright';

function decodeWithBothReaders(buffer: Buffer, expected: string) {
  const png = PNG.sync.read(buffer);
  const rgba = new Uint8ClampedArray(png.data);
  expect(jsQR(rgba, png.width, png.height)?.data, 'jsQR decoded payload').toBe(expected);
  const gray = new Uint8ClampedArray(png.width * png.height);
  for (let i = 0; i < gray.length; i++)
    gray[i] = (rgba[i * 4] + 2 * rgba[i * 4 + 1] + rgba[i * 4 + 2]) / 4;
  const bitmap = new BinaryBitmap(
    new HybridBinarizer(new RGBLuminanceSource(gray, png.width, png.height)),
  );
  expect(new QRCodeReader().decode(bitmap).getText(), 'ZXing decoded payload').toBe(expected);
  return png;
}
async function downloadFile(page: Page, name: string) {
  const event = page.waitForEvent('download');
  await page.getByRole('button', { name, exact: true }).click();
  const download = await event;
  expect(await download.failure()).toBeNull();
  return {
    bytes: await readFile((await download.path())!),
    filename: download.suggestedFilename(),
  };
}
async function rasterizeSVG(page: Page, svg: string) {
  const base64 = await page.evaluate(async (svg) => {
    const image = new Image();
    image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
    await image.decode();
    const canvas = document.createElement('canvas');
    canvas.width = image.width;
    canvas.height = image.height;
    canvas.getContext('2d')!.drawImage(image, 0, 0);
    return canvas.toDataURL('image/png').split(',')[1];
  }, svg);
  return Buffer.from(base64, 'base64');
}

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('live Unicode text exports to readable PNG and SVG without sending content', async ({
  page,
}) => {
  const external: string[] = [];
  page.on('request', (request) => {
    if (!request.url().startsWith('http://127.0.0.1:4173') && !request.url().startsWith('data:'))
      external.push(request.url());
  });
  await page.getByRole('button', { name: 'Text', exact: true }).click();
  const payload = 'Yiğit · İstanbul\nOlá, São Paulo! Çığ şü ö ı İ 🚀';
  await page.getByLabel('Your text', { exact: true }).fill(payload);
  await expect(page.getByText('Your QR code is ready', { exact: true })).toBeVisible();
  const png = await downloadFile(page, 'Download PNG');
  expect(png.filename).toBe('eqr-text.png');
  const image = decodeWithBothReaders(png.bytes, payload);
  expect(image.width).toBe(1024);
  expect(image.height).toBe(1024);
  const svg = await downloadFile(page, 'Download SVG Scalable vector');
  expect(svg.filename).toBe('eqr-text.svg');
  expect(svg.bytes.toString()).not.toContain('Yiğit');
  decodeWithBothReaders(await rasterizeSVG(page, svg.bytes.toString()), payload);
  expect(external).toEqual([]);
});

test('Wi-Fi special characters survive QR generation', async ({ page }) => {
  await page.getByRole('button', { name: 'Wi-Fi', exact: true }).click();
  await page.getByLabel('Network name', { exact: true }).fill('Atölye;Guest\\Network');
  await page.getByLabel('Password', { exact: true }).fill('p:a"ss;word,123');
  await page.getByLabel('Hidden network', { exact: true }).selectOption('true');
  const png = await downloadFile(page, 'Download PNG');
  decodeWithBothReaders(
    png.bytes,
    'WIFI:T:WPA;S:Atölye\\;Guest\\\\Network;P:p\\:a\\"ss\\;word\\,123;H:true;;',
  );
  await page.getByLabel('Security', { exact: true }).selectOption('nopass');
  await expect(page.getByLabel('Password', { exact: true })).toHaveCount(0);
  decodeWithBothReaders(
    (await downloadFile(page, 'Download PNG')).bytes,
    'WIFI:T:nopass;S:Atölye\\;Guest\\\\Network;H:true;;',
  );
});

test('a long URL remains readable with rounded modules, a logo and SVG export', async ({
  page,
}) => {
  const url = `https://example.com/search?city=Istanbul&message=${'abcd'.repeat(120)}`;
  await page.getByLabel('Website URL', { exact: true }).fill(url);
  await page.getByText('Customize your code', { exact: true }).click();
  await page.getByRole('button', { name: 'Rounded', exact: true }).click();
  await page.getByLabel('Upload logo file').setInputFiles('public/icon-192.png');
  await expect(page.getByText('Your logo')).toBeVisible();
  await page.getByText('More QR settings').click();
  await expect(page.getByLabel('Error correction')).toHaveValue('H');
  await expect(page.getByLabel('Error correction')).toBeDisabled();
  decodeWithBothReaders((await downloadFile(page, 'Download PNG')).bytes, url);
  const svg = (await downloadFile(page, 'Download SVG Scalable vector')).bytes.toString();
  expect(svg).toContain('data:image/png;base64,');
  decodeWithBothReaders(await rasterizeSVG(page, svg), url);
  await page.getByRole('button', { name: 'Remove logo' }).click();
  await expect(page.getByLabel('Error correction')).toBeEnabled();
});

test('custom colors and all error correction levels export readable codes', async ({ page }) => {
  await page.getByText('Customize your code', { exact: true }).click();
  await page.getByRole('button', { name: 'Use #5a3b85 code color' }).click();
  await page.getByLabel('Export size').selectOption('512');
  await page.getByText('More QR settings').click();
  await page.getByLabel('Quiet zone').fill('8');
  for (const level of ['L', 'M', 'Q', 'H']) {
    await page.getByLabel('Error correction').selectOption(level);
    const png = decodeWithBothReaders(
      (await downloadFile(page, 'Download PNG')).bytes,
      'https://example.com',
    );
    expect(png.width).toBe(512);
  }
});

const formats = [
  {
    name: 'Email',
    fields: { 'Email address': 'hello@example.com', Subject: 'Olá', Message: 'Hello İstanbul' },
    expected: 'mailto:hello@example.com?subject=Ol%C3%A1&body=Hello%20%C4%B0stanbul',
  },
  {
    name: 'Phone',
    fields: { 'Phone number': '+90 (532) 123 4567' },
    expected: 'tel:+905321234567',
  },
  {
    name: 'SMS',
    fields: { 'Phone number': '+905321234567', Message: 'Hello & bye' },
    expected: 'sms:+905321234567?body=Hello%20%26%20bye',
  },
  {
    name: 'WhatsApp',
    fields: { 'Phone number with country code': '+905321234567', Message: 'Hi there' },
    expected: 'https://wa.me/905321234567?text=Hi%20there',
  },
  {
    name: 'Location',
    fields: { Latitude: '41.0082', Longitude: '28.9784' },
    expected: 'geo:41.0082,28.9784',
  },
  {
    name: 'Google review',
    fields: { 'Google Place ID': 'ChIJ1234567890_test' },
    expected: 'https://search.google.com/local/writereview?placeid=ChIJ1234567890_test',
  },
  {
    name: 'Contact',
    fields: {
      'First name': 'Yiğit',
      'Last name': 'Bayrak',
      Organization: 'EGORA Digital',
      'Phone number': '+905321234567',
    },
    expected:
      'BEGIN:VCARD\r\nVERSION:3.0\r\nN:Bayrak;Yiğit;;;\r\nFN:Yiğit Bayrak\r\nORG:EGORA Digital\r\nTEL;TYPE=CELL:+905321234567\r\nEND:VCARD',
  },
];
for (const format of formats)
  test(`${format.name} UI generates the expected readable payload`, async ({ page }) => {
    await page.getByRole('button', { name: format.name, exact: true }).click();
    for (const [label, value] of Object.entries(format.fields))
      await page.getByRole('textbox', { name: new RegExp(`^${label}(?: Optional)?$`) }).fill(value);
    decodeWithBothReaders((await downloadFile(page, 'Download PNG')).bytes, format.expected);
  });

test('invalid content and low contrast disable exports; reset restores defaults', async ({
  page,
}) => {
  await page.getByLabel('Website URL').fill('javascript:alert(1)');
  await expect(page.getByRole('button', { name: 'Download PNG', exact: true })).toBeDisabled();
  await expect(page.getByRole('alert')).toContainText('valid http://');
  await page.getByLabel('Website URL').fill('https://example.com');
  await page.getByText('Customize your code', { exact: true }).click();
  await page.getByLabel('Code color', { exact: true }).fill('#ffffff');
  await expect(page.getByRole('alert')).toContainText('contrast');
  await expect(page.getByRole('button', { name: 'Download PNG', exact: true })).toBeDisabled();
  await page.getByRole('button', { name: 'Reset this QR code' }).click();
  await expect(page.getByLabel('Code color', { exact: true })).toHaveValue('#254a36');
  await expect(page.getByRole('button', { name: 'Download PNG', exact: true })).toBeEnabled();
});

test('raster logos only; an SVG upload is rejected', async ({ page }) => {
  await page.getByLabel('Upload logo file').setInputFiles({
    name: 'unsafe.svg',
    mimeType: 'image/svg+xml',
    buffer: Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"/>'),
  });
  await expect(page.getByRole('alert')).toContainText('PNG, JPEG, or WebP');
  await expect(page.getByText('Your logo')).toHaveCount(0);
});

test('batch validates every line and downloads readable PNGs and SVGs in ZIPs', async ({
  page,
}) => {
  await page.getByRole('button', { name: 'Batch create' }).click();
  await page.getByLabel('Your links').fill('https://example.com\ninvalid');
  await expect(page.getByRole('dialog').getByRole('alert')).toContainText('Line 2');
  await expect(page.getByRole('button', { name: 'Download ZIP' })).toBeDisabled();
  await page.getByLabel('Content type').selectOption('text');
  const content = ['Olá İstanbul', 'The next big thing'];
  await page.getByLabel('Your text', { exact: false }).fill(content.join('\n'));
  for (const type of ['png', 'svg']) {
    await page.getByLabel('Export format').selectOption(type);
    const zip = await JSZip.loadAsync((await downloadFile(page, 'Download ZIP')).bytes);
    expect(Object.keys(zip.files)).toEqual([`eqr-01.${type}`, `eqr-02.${type}`]);
    for (const [index, payload] of content.entries()) {
      const file = zip.file(`eqr-0${index + 1}.${type}`)!;
      const buffer =
        type === 'png'
          ? await file.async('nodebuffer')
          : await rasterizeSVG(page, await file.async('string'));
      decodeWithBothReaders(buffer, payload);
    }
  }
  await page.getByRole('button', { name: 'Close dialog' }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
});

test('copy image puts a decodable PNG on the clipboard', async ({ page, context, browserName }) => {
  test.skip(browserName !== 'chromium', 'Image clipboard permissions vary between browsers.');
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.getByRole('button', { name: 'Copy image', exact: true }).click();
  await expect(page.getByRole('status').filter({ hasText: 'QR image copied' })).toBeVisible();
  const base64 = await page.evaluate(async () => {
    const [item] = await navigator.clipboard.read();
    const blob = await item.getType('image/png');
    const bytes = new Uint8Array(await blob.arrayBuffer());
    let binary = '';
    for (const byte of bytes) binary += String.fromCharCode(byte);
    return btoa(binary);
  });
  decodeWithBothReaders(Buffer.from(base64, 'base64'), 'https://example.com');
});

test('print sheet waits for six QR images and uses safe text captions', async ({ page }) => {
  await page.evaluate(() => {
    const append = document.body.append.bind(document.body);
    document.body.append = (...nodes: (Node | string)[]) => {
      append(...nodes);
      for (const node of nodes)
        if (node instanceof HTMLIFrameElement) {
          node.contentWindow!.print = () => {
            const doc = node.contentDocument!;
            (window as unknown as { printResult: unknown }).printResult = {
              images: [...doc.images].map((img) => ({
                complete: img.complete,
                width: img.naturalWidth,
              })),
              captions: [...doc.querySelectorAll('figcaption')].map((el) => el.textContent),
              scripts: doc.querySelectorAll('script').length,
            };
          };
        }
    };
  });
  const url = 'https://example.com/?q=<script>alert(1)</script>';
  await page.getByLabel('Website URL').fill(url);
  await page.getByRole('button', { name: 'Print sheet', exact: true }).click();
  await expect
    .poll(() => page.evaluate(() => (window as unknown as { printResult: unknown }).printResult))
    .toEqual({
      images: Array.from({ length: 6 }, () => ({ complete: true, width: 1024 })),
      captions: Array.from({ length: 6 }, () => url),
      scripts: 0,
    });
});

test('theme persists, content does not; app reloads offline', async ({ page, context }) => {
  await page.getByRole('button', { name: 'Switch to dark theme' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.getByLabel('Website URL').fill('https://secret.example.com/private');
  await page.evaluate(async () => {
    const registration = await navigator.serviceWorker.ready;
    if (!navigator.serviceWorker.controller)
      await new Promise<void>((resolve) =>
        navigator.serviceWorker.addEventListener('controllerchange', () => resolve(), {
          once: true,
        }),
      );
    return registration.active?.state;
  });
  await context.setOffline(true);
  await page.reload();
  await expect(
    page.getByRole('heading', { name: 'Free QR Code Generator', exact: true }),
  ).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.getByLabel('Website URL')).toHaveValue('https://example.com');
  await page.getByRole('button', { name: 'Text', exact: true }).click();
  await page.getByLabel('Your text', { exact: true }).fill('Created offline · İstanbul');
  expect(await page.evaluate(() => getComputedStyle(document.body).fontFamily)).toContain(
    'system-ui',
  );
  decodeWithBothReaders(
    (await downloadFile(page, 'Download PNG')).bytes,
    'Created offline · İstanbul',
  );
  expect(
    await page.evaluate(async () => {
      const keys = await caches.keys();
      const urls = (
        await Promise.all(
          keys.map(async (key) => (await (await caches.open(key)).keys()).map((r) => r.url)),
        )
      ).flat();
      return urls.some((url) => url.includes('secret.example.com'));
    }),
  ).toBe(false);
});

test('mobile layout has no horizontal overflow and dialogs work with the keyboard', async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
  await page.getByRole('button', { name: 'Batch create' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.getByRole('button', { name: 'How privacy works' }).click();
  await expect(page.getByRole('dialog')).toContainText(
    'Only your theme and language preferences are saved.',
  );
  await page.getByRole('button', { name: 'Back to the studio' }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
});

test('production page has no runtime errors or missing assets', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  const failed: string[] = [];
  page.on('response', (response) => {
    if (response.status() >= 400) failed.push(response.url());
  });
  await page.reload();
  await expect(page.getByRole('img', { name: 'Website QR code preview' })).toBeVisible();
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
    await document.fonts.ready;
  });
  expect(errors).toEqual([]);
  expect(failed).toEqual([]);
  await page.screenshot({ path: 'test-results/studio-desktop.png', fullPage: true });
  await page.setViewportSize({ width: 375, height: 812 });
  await page.screenshot({ path: 'test-results/studio-mobile.png', fullPage: true });
});

test('large text stays usable on desktop and narrow screens', async ({ page }) => {
  for (const width of [1280, 768, 430, 390, 375, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.evaluate(() => {
      document.documentElement.style.fontSize = '200%';
    });
    await page.evaluate(() => document.fonts.ready);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await page.getByRole('button', { name: 'Text', exact: true }).click();
    await page
      .getByLabel('Your text', { exact: true })
      .fill('Readable at large text sizes · İstanbul');
    await expect(page.getByRole('button', { name: 'Download PNG', exact: true })).toBeEnabled();
    await page.getByRole('button', { name: 'Batch create' }).click();
    expect(
      await page.getByRole('dialog').evaluate((dialog) => dialog.scrollWidth <= dialog.clientWidth),
    ).toBe(true);
    await page.getByRole('button', { name: 'Close dialog' }).click();
    await page.evaluate(() => {
      document.documentElement.style.fontSize = '';
    });
  }
});

test('studio and dialogs meet automated WCAG accessibility checks in both themes', async ({
  page,
}) => {
  for (const theme of ['light', 'dark']) {
    if (theme === 'dark') await page.getByRole('button', { name: 'Switch to dark theme' }).click();
    expect(
      (await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze())
        .violations,
    ).toEqual([]);
    await page.getByRole('button', { name: 'Batch create' }).click();
    expect(
      (await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze())
        .violations,
    ).toEqual([]);
    await page.getByRole('button', { name: 'Close dialog' }).click();
  }
});

test('guide and FAQ are readable without JavaScript, with matching structured data', async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4173/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Free QR Code Generator');
  await expect(
    page.getByText('Enable JavaScript to generate QR codes', { exact: false }),
  ).toBeVisible();
  await page.locator('summary').filter({ hasText: 'Do free QR codes expire?' }).click();
  await expect(
    page.getByText('The static QR code itself has no expiration date.', { exact: false }),
  ).toBeVisible();
  const schema = JSON.parse(
    (await page.locator('script[type="application/ld+json"]').textContent()) ?? '{}',
  );
  expect(
    schema['@graph'].find((node: { '@type': string }) => node['@type'] === 'FAQPage').mainEntity,
  ).toHaveLength(10);
  await context.close();
});

test('search use cases open the matching mode without sending payloads to metadata', async ({
  page,
}) => {
  await page.getByRole('link', { name: 'Guest Wi-Fi', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Wi-Fi', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await expect(page.getByLabel('Network name', { exact: true })).toBeVisible();
  await page.getByLabel('Network name', { exact: true }).fill('Private network');
  expect(await page.locator('head').textContent()).not.toContain('Private network');
  await page.goto('/?type=whatsapp');
  await expect(page.getByRole('button', { name: 'WhatsApp', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await expect(page.getByLabel('Phone number with country code')).toBeVisible();
});
