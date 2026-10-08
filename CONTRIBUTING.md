# Contributing

Use Node.js 22.12+ and `npm ci`. Keep the client-only architecture and the established Emil Kowalski + Impeccable utility direction. Read PRODUCT.md and DESIGN.md before product/interface changes.

Run `npm test`, `npm run build`, `npm run format:check` and `npm run test:e2e`. Browser tests need Chromium; see [development](docs/DEVELOPMENT.md). Check keyboard use, both themes, 320px screens, text zoom and Arabic RTL when editing the interface.

New QR types need validated payload encoding and independent decode checks on actual exports. Preserve original user content when changing language. Do not add uploads, telemetry, remote fonts or unverified scanner/SEO claims.

Keep visible help, validation, translations and structured data consistent. Deployment addresses belong in PUBLIC_SITE_URL; never hard-code an assumed domain. Keep generated builds, graphs, reports and secrets out of commits.

Run `graphify update .` after source changes when using Graphify. Each repository has its own graph; semantic extraction is optional and separate from local AST updates.
