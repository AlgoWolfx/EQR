import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { PNG } from 'pngjs';
import jsQR from 'jsqr';
import { BinaryBitmap, HybridBinarizer, RGBLuminanceSource, QRCodeReader } from '@zxing/library';
import { languages, translator } from '../src/i18n';
import { faqs } from '../src/site/content';
import AxeBuilder from '@axe-core/playwright';

test('switching all seven languages keeps content, style, logo and usable QR exports', async ({
  page,
}) => {
  await page.goto('/?type=text');
  const payload = 'İstanbul · العربية · 日本語 · Español · Deutsch · Olá, São Paulo';
  await page.locator('#field-text').fill(payload);
  await page.locator('.customization > summary').click();
  await page.getByRole('button', { name: 'Rounded', exact: true }).click();
  const logo = new PNG({ width: 32, height: 32 });
  logo.data.fill(255);
  await page
    .locator('input[type="file"]')
    .setInputFiles({ name: 'logo.png', mimeType: 'image/png', buffer: PNG.sync.write(logo) });
  await expect(page.locator('.logo-upload')).toHaveClass(/has-logo/);
  await expect(page.locator('.language-select option')).toHaveCount(7);
  const originalQR = await page.locator('.qr-preview').getAttribute('src');
  for (const language of languages) {
    const t = translator(language.code);
    await page.locator('.language-select').selectOption(language.code);
    await expect(page.locator('html')).toHaveAttribute('lang', language.code);
    await expect(page.locator('html')).toHaveAttribute('dir', language.direction);
    await expect(page.locator('#page-title')).toHaveText(t('Free QR Code Generator'));
    await expect(page.locator('#content-heading')).toHaveText(t('Share a message'));
    await expect(page.locator('#field-text')).toHaveValue(payload);
    await expect(page.locator('.qr-preview')).toHaveAttribute('src', originalQR!);
    await expect(page.locator('.logo-upload')).toHaveClass(/has-logo/);
    await expect(page.getByRole('button', { name: t('Rounded'), exact: true })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await page.setViewportSize({ width: 375, height: 812 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    const schema = JSON.parse(
      (await page.locator('script[type="application/ld+json"]').textContent())!,
    );
    expect(schema['@graph'][1].mainEntity[0].name).toBe(t(faqs[0].question));
    expect(await page.locator('head').textContent()).not.toContain(payload);
    const event = page.waitForEvent('download');
    await page.getByRole('button', { name: t('Download PNG'), exact: true }).click();
    const download = await event;
    // Check the transient notification before the two CPU-heavy image decoders.
    await expect(page.locator('.toast')).toContainText(t('PNG downloaded.'));
    const png = PNG.sync.read(await readFile((await download.path())!));
    expect(jsQR(new Uint8ClampedArray(png.data), png.width, png.height)?.data).toBe(payload);
    const gray = new Uint8ClampedArray(png.width * png.height);
    for (let i = 0; i < gray.length; i++)
      gray[i] = (png.data[i * 4] + 2 * png.data[i * 4 + 1] + png.data[i * 4 + 2]) / 4;
    expect(
      new QRCodeReader()
        .decode(
          new BinaryBitmap(
            new HybridBinarizer(new RGBLuminanceSource(gray, png.width, png.height)),
          ),
        )
        .getText(),
    ).toBe(payload);
  }
});

test('language and theme persist offline; input resets and switching remains local', async ({
  page,
  context,
}) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Switch to dark theme' }).click();
  await page.locator('#field-url').fill('https://private.example.com/secret');
  await page.locator('.language-select').selectOption('tr');
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
    if (!navigator.serviceWorker.controller)
      await new Promise<void>((resolve) =>
        navigator.serviceWorker.addEventListener('controllerchange', () => resolve(), {
          once: true,
        }),
      );
  });
  await context.setOffline(true);
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('lang', 'tr');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.locator('#field-url')).toHaveValue('https://example.com');
  await page.locator('.language-select').selectOption('ja');
  await expect(page.locator('#page-title')).toHaveText('無料QRコード作成ツール');
  // Chromium's network emulation can report navigator.onLine=true after a cached reload.
  // Reapply it to exercise the actual offline event as well as the cached navigation above.
  await context.setOffline(false);
  await context.setOffline(true);
  await expect(page.locator('.footer-status')).toHaveText(translator('ja')('Working offline'));
  const stored = await page.evaluate(() => ({ ...localStorage }));
  expect(stored).toEqual({ 'eqr-theme': 'dark', 'eqr-language': 'ja' });
  await page.reload();
  await expect(page.locator('.language-select')).toHaveValue('ja');
  await page.locator('.language-select').selectOption('pt');
  await expect(page.locator('#page-title')).toHaveText('Gerador de Código QR Grátis');
  await page.reload();
  await expect(page.locator('.language-select')).toHaveValue('pt');
  await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
});

test('Portuguese browser language, validation and batch feedback are localized', async ({
  browser,
}) => {
  const context = await browser.newContext({ locale: 'pt-BR' });
  const page = await context.newPage();
  const t = translator('pt');
  await page.goto('/');
  await expect(page.locator('.language-select')).toHaveValue('pt');
  await expect(page.locator('#page-title')).toHaveText('Gerador de Código QR Grátis');
  await page.locator('#field-url').fill('');
  await expect(page.getByRole('alert')).toHaveText('Insira a URL de um site.');
  await page.getByRole('button', { name: t('Batch create') }).click();
  await page.locator('#batch-content').fill('https://example.com\ninvalid');
  await expect(page.getByRole('dialog').getByRole('alert')).toHaveText(
    t('Line 2: Enter a valid http:// or https:// URL without embedded credentials.'),
  );
  await page.locator('#batch-type').selectOption('text');
  await page.locator('#batch-content').fill('Olá, São Paulo!\nBem-vindo');
  await expect(page.locator('#batch-result')).toContainText('2 códigos QR prontos');
  await page.locator('#batch-content').fill('Olá, São Paulo!');
  await expect(page.locator('#batch-result')).toContainText('1 código QR pronto');
  await context.close();
});

test('explicit language overrides preferences, preserves mode and carries into use-case links', async ({
  browser,
}) => {
  const context = await browser.newContext({ locale: 'es-MX' });
  const page = await context.newPage();
  await page.goto('/');
  await expect(page.locator('.language-select')).toHaveValue('es');
  await page.goto('/?lang=ar&type=wifi#studio');
  await expect(page.locator('.language-select')).toHaveValue('ar');
  await expect(page.locator('#field-ssid')).toBeVisible();
  await page.locator('.use-cases a[href*="whatsapp"]').click();
  await expect(page.locator('#field-phone')).toHaveAttribute('dir', 'ltr');
  await expect(page.locator('.language-select')).toHaveValue('ar');
  await page.goto('/?lang=en&type=url');
  await expect(page.locator('.language-select')).toHaveValue('en');
  await expect(page.locator('#field-url')).toBeVisible();
  await context.close();
  const unsupported = await browser.newContext({ locale: 'zh-CN' });
  const fallback = await unsupported.newPage();
  await fallback.goto('/');
  await expect(fallback.locator('.language-select')).toHaveValue('en');
  await unsupported.close();
});

test('Arabic validation, dialogs, print headings and RTL remain accessible', async ({ page }) => {
  await page.goto('/?lang=ar');
  const t = translator('ar');
  await page.locator('#field-url').fill('');
  await expect(page.getByRole('alert')).toHaveText(t('Enter a website URL.'));
  await page.locator('#field-url').fill('https://example.com/');
  await page.setViewportSize({ width: 375, height: 812 });
  expect(
    (await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze())
      .violations,
  ).toEqual([]);
  await page.getByRole('button', { name: t('How privacy works') }).click();
  await expect(page.getByRole('dialog')).toContainText(
    t(
      'Only your theme and language preferences are saved. Offline mode caches the app itself, never your QR content. There are no analytics, external fonts, or account requirements.',
    ),
  );
  await page.getByRole('button', { name: t('Close dialog') }).click();
  await page.getByRole('button', { name: t('Batch create') }).click();
  await page.locator('#batch-content').fill('https://example.com\ninvalid');
  await expect(page.getByRole('dialog').getByRole('alert')).toHaveText(
    t('Line 2: Enter a valid http:// or https:// URL without embedded credentials.'),
  );
  await page.locator('#batch-type').selectOption('text');
  await page.locator('#batch-content').fill('مرحبا بالعالم\n日本語');
  await expect(page.locator('#batch-result')).toContainText(
    t('{count} QR codes ready', { count: 2 }),
  );
  expect(
    (await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze())
      .violations,
  ).toEqual([]);
  await page.evaluate(() => {
    const append = document.body.append.bind(document.body);
    document.body.append = (...nodes: (Node | string)[]) => {
      append(...nodes);
      for (const node of nodes)
        if (node instanceof HTMLIFrameElement)
          node.contentWindow!.print = () => {
            const doc = node.contentDocument!;
            (window as unknown as { printLocale: unknown }).printLocale = {
              lang: doc.documentElement.lang,
              dir: doc.documentElement.dir,
              heading: doc.querySelector('h1')?.textContent,
              captions: [...doc.querySelectorAll('figcaption')].map((el) => el.textContent),
            };
          };
    };
  });
  await page.getByRole('button', { name: t('Print this batch') }).click();
  await expect
    .poll(() => page.evaluate(() => (window as unknown as { printLocale: unknown }).printLocale))
    .toEqual({
      lang: 'ar',
      dir: 'rtl',
      heading: t('Scan & connect'),
      captions: ['مرحبا بالعالم', '日本語'],
    });
});

test('all languages fit narrow, tablet and desktop screens at 200% text size', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => (document.documentElement.style.fontSize = '200%'));
  for (const language of languages) {
    await page.locator('.language-select').selectOption(language.code);
    for (const width of [320, 375, 390, 430, 768, 1280]) {
      await page.setViewportSize({ width, height: 900 });
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
        `${language.code} at ${width}px`,
      ).toBe(true);
    }
  }
});
