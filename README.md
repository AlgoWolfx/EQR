# EQR

**Create QR codes in your browser. Keep your content on your device.**

EQR is a free, open-source QR code studio by **EGORA Digital**. Create static codes, customize their appearance, and download PNG or SVG files without an account, uploads or watermarks.

Built with React, TypeScript and Vite. Runs as a static website with no backend, database or API keys.

## What you can do

- Create website, Wi-Fi, contact/vCard, WhatsApp, email, phone, SMS, location, Google Review and plain-text QR codes.
- Choose colors, square or rounded modules, error correction and an optional local image logo.
- Download PNG or self-contained SVG, copy an image where supported, or print a six-code sheet.
- Generate up to 50 website or text codes per batch and export a ZIP or print sheet.
- Use seven interface languages, light/dark/system themes and keyboard controls.
- Install the production app as a PWA and generate codes offline after the first online visit.

These are static QR codes: the encoded content cannot be changed after export. The codes do not have an expiration service; linked destinations can still change or disappear. Dynamic redirects and scan analytics are outside the project scope.

## Run locally

Install **Node.js 22.12+** and npm; Node 24 is recommended.

```sh
git clone https://github.com/AlgoWolfx/EQR.git
cd EQR
npm ci
npm run dev
```

Open the local address Vite prints on the same computer. `npm run build` creates `dist/`; `npm run preview` serves that build locally. Offline support works in production builds served over HTTPS or localhost.

## Use the studio

1. Choose a QR type and enter your content. The preview updates as you type.
2. Open **Customize your code** to adjust the design or add a logo.
3. Download, copy or print the result. Check a code on physical devices before distributing it.
4. Open **Batch create** for a list of website URLs or text entries.

Logos accept PNG, JPEG or WebP up to 2 MB. EQR processes them locally and uses high error correction. Exports keep a quiet zone of at least four modules and reject inverted/low-contrast colors or images too small for the matrix.

Wi-Fi joining, SMS, contact imports and location links depend on the scanning device and its apps. Google Review codes require a real Google Place ID. Automated QR readers do not establish readability on every camera, screen or printed sheet.

## Languages

English · Deutsch · Türkçe · العربية · 日本語 · Español · Português

The header selector translates the interface, help, validation and print headings while preserving QR content, styling and the logo. Arabic uses right-to-left layout with direction-aware URL/phone fields.

A supported `?lang=tr` URL takes priority over the saved language, then the browser language and English fallback. The shared `pt` locale supports both `pt-BR` and `pt-PT` browser preferences. Translations work offline. The initial crawler-readable page is English; language query parameters do not create separate landing pages.

## Privacy and offline use

QR content and logos stay in memory and reset on reload. Only theme and language preferences are saved. EQR has no accounts, tracking, external font requests or server-side QR generation, and it never fetches the destination you enter.

The service worker caches application assets, never QR payloads or exports. Visit the production app online once and let its cache finish before going offline. Updates prompt before reloading. A destination opened by a scanner has its own privacy policy.

## Checks

```sh
npm test
npm run build
npm run format:check
npx playwright install --with-deps chromium
npm run test:e2e
```

The browser suite decodes PNG/SVG exports with **jsQR and ZXing**, and checks all ten QR types, Unicode, escaping, logos, batches, clipboard, printing, languages, offline reloads, mobile layout and automated accessibility in both themes. GitHub Actions runs unit and browser checks on pushes to `main` and pull requests.

For an installed Chromium binary, set `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` to its path. See [development documentation](docs/DEVELOPMENT.md) for architecture and tooling.

## Deploy

Publish `dist/` on static HTTPS hosting. Set `PUBLIC_SITE_URL` to the exact final page URL before building; asset paths, PWA scope, canonical URLs and sitemap follow that setting. The public address is currently undecided. Without it, preview builds intentionally remain non-indexable.

See [deployment and SEO](docs/DEPLOYMENT.md) for root/subdirectory hosting, crawler configuration and Cloudflare Pages settings. Deployment and physical scanner/print checks remain release steps.

## Project and contribution

Read [PROJECT_SPEC.md](PROJECT_SPEC.md) for the brief, [CONTRIBUTING.md](CONTRIBUTING.md) for changes, and [PRODUCT.md](PRODUCT.md) / [DESIGN.md](DESIGN.md) for the established utility-first design direction.

Companion project: [EMeta](https://github.com/AlgoWolfx/EMeta), a local metadata viewer and cleaner.

## License

[MIT](LICENSE). Dependencies and bundled development tools retain their upstream licenses.

Built by **Yiğit Bayrak · EGORA Digital**.
