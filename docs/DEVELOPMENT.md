# Development

Use Node.js 22.12+ (Node.js 24 LTS recommended) and npm. No backend, database,
environment variables, or API keys are needed.

```sh
npm ci
npm run dev
```

Vite prints the local development address. QR generation, logo processing, and
export all run in the browser. The app uses bundled assets and platform system fonts;
it never fetches the destination encoded in a QR code.

```sh
npm test             # Payload, rendering safeguards, and batch validation
npm run typecheck    # Strict TypeScript validation
npm run build        # Production build, including the offline service worker
npm run preview      # Serve the production build locally
```

For browser tests, install Chromium once:

```sh
npx playwright install --with-deps chromium
npm run test:e2e
```

If Chromium is already installed on your machine, you can instead set
`PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` to its executable path. For this cloud
environment:

```sh
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm run test:e2e
```

The browser suite builds and serves the production app automatically. It checks
all ten payload formats, PNG/SVG exports with two independent QR readers
(jsQR and ZXing), Unicode, Wi-Fi escaping, long URLs, rounded modules, logos,
all correction levels, batch ZIP contents, image clipboard, print preparation,
mobile layout, offline reloads, and automated WCAG checks in both themes. Test output goes to the ignored
`test-results/` directory. CI runs these checks on every pull request.

## Project structure

- `src/lib/payloads.ts` — validated, reusable payload encoders
- `src/lib/qr.ts` — shared SVG renderer, PNG conversion, and local logo handling
- `src/lib/export.ts` — batch ZIP and print-sheet generation
- `src/App.tsx` — studio UI, theme, privacy, and PWA status
- `src/styles.css` — system typography, responsive tokens and interaction styles
- `src/site/config.ts` — SEO/site settings and future page contracts
- `src/site/content.ts` — shared visible FAQ and use-case content
- `src/site/render.ts` — build-time HTML and JSON-LD
- `src/site/plugin.ts` — Vite static-site and crawler asset generation
- `tests/studio.spec.ts` — browser flows and independent QR decode checks

## Codex tools

EQR uses **Graphify** for code navigation and **Emil Kowalski + Impeccable** for interface work. The official Graphify package is `graphifyy`; each repository maintains its own graph. These are optional development tools, not website dependencies.

To install Graphify on another computer, with `uv` available:

```sh
uv tool install graphifyy==0.9.80
graphify install --platform codex
```

Then, from a project root:

```sh
graphify codex install
graphify update .
graphify query "How does the language selector work?"
```

The graph update extracts code locally without an API key. Semantic document
extraction is a separate optional workflow. EQR's `.graphifyignore` keeps tool
vendors and build files out of its graph; generated graphs and local hook
configuration stay out of version control. Graphify is a development tool,
separate from the website's runtime and its language selector.

## Design tooling

Emil Kowalski’s `apple-design`, `emil-design-eng`, and `mobile-native` skills are
installed project-locally alongside Impeccable in `.agents/skills/`. Use Emil for
interaction and restraint, then Impeccable for critique, clarify, typeset,
distill, polish and audit. System UI typography is a deliberate product decision.
The upstream source revision and license are included with the skill. Reload your
Codex session if the new skill does not appear in its skill list.

This install does not enable automatic edit hooks. To run a manual typography
check from the repository root:

```sh
.agents/skills/impeccable/scripts/impeccable detect --json --scope type src
```

The launcher downloads a SHA-256-verified platform engine on first use if one is
not already cached. Impeccable is development tooling and is not shipped in the
web application's bundle. Upstream licenses and source revisions ship with the
skills. `PRODUCT.md`, `DESIGN.md`, `AGENTS.md` and the surface contract preserve the
user-confirmed brief for future changes.
