# EQR product and design guidance

Read `PRODUCT.md` before product changes and `DESIGN.md` before UI changes.
The user-confirmed product brief wins over generic skill defaults.

## Design workflow

Use project-local `apple-design` and `emil-design-eng` skills for interaction,
restraint and spatial consistency; use `mobile-native` for mobile web details.
Use Impeccable for critique, clarify, typeset, distill, polish and audit.
These layers share one direction: a quiet, utility-first QR generator.

System UI typography is intentional. Do not replace it with downloaded fonts.
Keep the generator near the top, supporting content below it, and branding subtle.
No decorative blobs, gradients, nested cards, fake reviews or inflated claims.
Preserve every working QR format and export. Never upload QR content.

## SEO and deployment

`src/site/config.ts` owns site metadata and future tool/page contracts.
`src/site/content.ts` is shared by visible FAQ and JSON-LD; keep them consistent.
`src/site/render.ts` emits crawler-readable HTML at build time.
Set `PUBLIC_SITE_URL` to the exact final page URL; never guess a domain.
Unconfigured preview builds intentionally have no canonical and are not indexable.
Future landing pages need distinct useful content and the matching generator mode.
Enable cross-tool links only when their real destinations exist.

## Verification

Run `npm test`, `npm run build`, `npm run test:e2e` and `npm run format:check`.
In a cloud environment, use `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium`
when the bundled Playwright browser is unavailable.
Review 320/375/390/430px, tablet, desktop, both themes and 200% text scaling.
Physical phone/print tests complement browser automation; do not claim they ran
without access to that hardware. Do not claim Lighthouse scores without measuring.

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

When the user types `/graphify`, use the installed graphify skill or instructions before doing anything else.

Rules:

- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- Dirty graphify-out/ files are expected after hooks or incremental updates; dirty graph files are not a reason to skip graphify. Only skip graphify if the task is about stale or incorrect graph output, or the user explicitly says not to use it.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
