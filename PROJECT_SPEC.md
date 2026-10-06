# EQR — Project Specification

## Goal

Build a polished, open-source QR studio that works locally in the browser and requires no account.

The project should be simple enough for non-technical users while being visually strong enough to represent a professional open-source product.

## Recommended product shape

Prefer a client-side web app/PWA unless repository constraints justify otherwise.

Core QR formats:
- URL
- Plain text
- Wi-Fi
- vCard/contact
- Email
- Phone
- SMS
- WhatsApp
- Geographic location
- Google Review link

Customization:
- Foreground/background colors
- Error correction level
- Quiet zone
- Size
- Logo/image overlay with safe sizing
- Rounded/square module styles only if QR readability remains reliable

Export:
- PNG
- SVG
- Copy to clipboard where supported
- Printable sheet layout
- Batch QR export

## UX requirements

- Drag/drop or paste where appropriate
- Live QR preview
- Mobile responsive
- Light/dark theme
- Keyboard accessible
- No dashboard-style clutter
- No account wall
- Core use should take seconds

## Privacy

Core QR generation must happen locally. Do not upload user-entered QR payloads to a server.

## Engineering requirements

- Type-safe code where practical
- Reusable QR payload encoders
- Reusable design tokens/components
- Unit tests for payload generation
- E2E coverage for the critical generate/export flow
- Clear README setup
- Sensible accessibility labels
- PWA/offline support if it does not overcomplicate v1

## Quality bar

Before declaring complete:
- test generated codes using multiple QR readers
- test Unicode and Turkish/Portuguese characters
- test long URLs
- test Wi-Fi special characters
- test SVG and PNG exports
- verify logo overlays do not make codes unreadable

## Non-goals for v1

- user accounts
- analytics dashboards
- cloud QR management
- dynamic redirect infrastructure
- subscriptions

## Delivery order

1. Inspect repo and choose the smallest suitable modern stack.
2. Establish design system.
3. Implement QR payload encoders.
4. Implement live preview.
5. Add customization.
6. Add export.
7. Add batch generation.
8. Add tests and accessibility pass.
9. Add PWA/offline support if clean.
10. Polish README and release build.

## Brand

Footer/About text may state:

Built by Yiğit Bayrak · EGORA Digital

Do not watermark generated QR codes.
