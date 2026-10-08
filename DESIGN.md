---
name: EQR by EGORA Digital
description: A quiet, precise QR utility with immediate local preview.
colors:
  'ink': '#202322'
  'muted': '#5e6561'
  'page': '#fafaf9'
  'surface': '#fff'
  'input': '#fff'
  'line': '#d8dcda'
  'green': '#254a36'
  'soft-green': '#edf3ee'
  'danger': '#a22939'
  'ink-dark': '#f1f3f1'
  'muted-dark': '#b0b7b2'
  'page-dark': '#171819'
  'surface-dark': '#202323'
  'input-dark': '#202323'
  'line-dark': '#444b46'
  'green-dark': '#b8ddc6'
  'soft-green-dark': '#293c30'
  'danger-dark': '#ffabb9'
  'green-hover': '#183b28'
  'white': '#fff'
  'selection-bg': '#c3dfcd'
  'selection-ink': '#163220'
  'muted-contrast': '#303a34'
  'line-contrast': '#717b74'
  'muted-dark-contrast': '#d7dfd9'
  'line-dark-contrast': '#919a93'
typography:
  'display':
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Segoe UI', sans-serif"
    fontSize: 'clamp(1.875rem, 3.2vw, 2.75rem)'
    fontWeight: 650
    lineHeight: 1.12
    letterSpacing: '-0.035em'
  'headline':
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Segoe UI', sans-serif"
    fontSize: '1.5rem'
    fontWeight: 650
    lineHeight: 1.25
    letterSpacing: '-0.025em'
  'title':
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Segoe UI', sans-serif"
    fontSize: '1.375rem'
    fontWeight: 650
    lineHeight: 1.25
    letterSpacing: '-0.025em'
  'tool-title':
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Segoe UI', sans-serif"
    fontSize: '1.125rem'
    fontWeight: 650
    lineHeight: 1.25
    letterSpacing: '-0.02em'
  'body':
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Segoe UI', sans-serif"
    fontSize: '1rem'
    fontWeight: 400
    lineHeight: 1.5
  'label':
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Segoe UI', sans-serif"
    fontSize: '0.875rem'
    fontWeight: 550
    lineHeight: 1.4
  'caption':
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Segoe UI', sans-serif"
    fontSize: '0.8125rem'
    fontWeight: 400
    lineHeight: 1.5
rounded:
  'control': '0.5rem'
  'preview': '0.75rem'
  'modal': '1rem'
  'swatch': '50%'
spacing:
  '4': '0.25rem'
  '6': '0.375rem'
  '8': '0.5rem'
  '10': '0.625rem'
  '12': '0.75rem'
  '16': '1rem'
  '20': '1.25rem'
  '24': '1.5rem'
  '32': '2rem'
  '40': '2.5rem'
  '48': '3rem'
  '56': '3.5rem'
components:
  'button-primary':
    backgroundColor: '{colors.green}'
    textColor: '{colors.white}'
    rounded: '{rounded.control}'
    padding: '0.75rem 1rem'
    width: '100%'
    height: '3rem'
  'button-primary-hover':
    backgroundColor: '{colors.green-hover}'
  'button-secondary':
    backgroundColor: '{colors.surface}'
    textColor: '{colors.ink}'
    rounded: '{rounded.control}'
    padding: '0.75rem 1rem'
    width: '100%'
    height: '3rem'
  'button-secondary-hover':
    backgroundColor: '{colors.soft-green}'
  'button-text':
    textColor: '{colors.green}'
    padding: '0.375rem 0'
    height: '2.75rem'
  'field-text':
    backgroundColor: '{colors.input}'
    textColor: '{colors.ink}'
    typography: '{typography.body}'
    rounded: '{rounded.control}'
    padding: '0.75rem'
    width: '100%'
    height: '3rem'
  'format-button':
    textColor: '{colors.muted}'
    rounded: '{rounded.control}'
    padding: '0.5rem 0.75rem'
    height: '2.75rem'
  'format-button-active':
    backgroundColor: '{colors.soft-green}'
    textColor: '{colors.green}'
  'preview-stage':
    backgroundColor: '{colors.surface}'
    rounded: '{rounded.preview}'
    padding: '1rem'
    height: '16rem'
  'modal':
    backgroundColor: '{colors.surface}'
    textColor: '{colors.ink}'
    rounded: '{rounded.modal}'
    padding: '1.5rem'
    width: 'min(34rem, calc(100% - 2rem))'
---

# Design System: EQR by EGORA Digital

## Overview

**Creative North Star: "Apple-inspired utility"**

EQR is a quiet, precise working interface. The confirmed Apple-inspired direction uses system typography, warm neutral surfaces and a restrained green accent. Its personality comes from readable hierarchy, consistent controls and immediate feedback.

The interface stays flat at rest. Fine boundaries identify inputs and the real QR preview; spacing organizes the surrounding content. Branding stays subtle. The user explicitly rejected downloaded fonts, decorative marketing scaffolds, gradients, fake proof and elaborate animation.

This record describes `src/styles.css`, `src/App.tsx` and `src/site/render.ts`.
Product commitments live in `PRODUCT.md`; page-specific composition remains in
`.impeccable/surfaces/qr-generator.md`. Frontmatter owns primitive values. Dark and
increased-contrast entries record actual overrides, not additional directions.

**Key Characteristics:**

- System UI typography throughout.
- Warm white and near-black foundations with restrained green states.
- Flat sections, fine boundaries and gently curved controls.
- Immediate live preview, touch-friendly targets and visible keyboard focus.

## Colors

A warm neutral foundation and one restrained green action family support both themes.

### Primary

- **Utility green** (`green`): primary download background and the light-theme accent for ready status, text actions, caret and focus.
- **Primary hover green** (`green-hover`): download hover on fine-pointer, hover-capable devices.
- **Soft green** (`soft-green`): selected controls and supported hover surfaces.
- **Dark-theme green** (`green-dark`, `soft-green-dark`): brighter accent text and darker selected surfaces. Filled downloads retain `green` and `white` in both themes.

### Neutral

- **Warm page / charcoal page** (`page`, `page-dark`): uninterrupted light and dark grounds.
- **Surface and input** (`surface`, `input` and their `-dark` variants): preview, fields, dialogs and feedback.
- **Ink and muted ink** (`ink`, `muted` and their `-dark` variants): primary information and supporting explanations.
- **Fine line** (`line`, `line-dark`): section separators and control boundaries.
- **Fixed white** (`white`): download text and QR paper, independent of app theme.
- **Increased-contrast variants** (four `-contrast` tokens): replace muted text and lines under `prefers-contrast: more`.
- **Selection** (`selection-bg`, `selection-ink`): explicit text-selection colors shared by both themes.

### Error state

**Danger** (`danger`, `danger-dark`) marks invalid field borders and error text.
It is a semantic state rather than a decorative accent.

**The Functional Accent Rule.** Use green for the primary download, selected controls, ready status, focus and small utility actions. QR color presets are editable output choices, not additional interface accent colors.

## Typography

**Display and Body Font:** the exact `--font-body` system stack in the frontmatter.
No downloaded typeface or separate mono family is used. Numeric settings and
counts use tabular numerals where implemented.

**Character:** compact and readable, with restrained semibold headings. The ramp
is role-based rather than a mathematical scale.

### Hierarchy

- **Display:** the sole page H1; fluid size, tight tracking and balanced wrapping.
- **Headline:** reading-section H2 headings.
- **Title:** modal H2 headings, using `--type-title`.
- **Tool title:** editor and preview H2 headings. The custom-service heading uses this size with ordinary H2 tracking.
- **Body:** primary field text and ordinary paragraphs. Reading/privacy paragraphs use line height (1.65); reading paragraphs stop at (72ch).
- **Label:** field labels use the recorded weight and line height. Format and shape buttons are regular by default; selected format labels use weight (600), ready status (500), and action text (550), generally with inherited line height (1.5).
- **Caption:** hints, export notes, footer and small status text. Export notes use line height (1.6); other captions generally inherit (1.5).
- **Supporting title:** H3 uses body size, weight (600) and line height (1.4). Intro promise and use-case names use weight (550); branding uses (700).

**The System Voice Rule.** Use the existing system stack for every role. System display text is an explicit user commitment in this project.

## Layout

Header, page and footer share a centered maximum width (70rem), with total
horizontal subtraction (3rem). At (760px) and below, subtraction becomes (2rem).
The wrapping header has minimum height (4.5rem) and includes the top safe-area
inset; the footer includes the bottom safe-area inset.

The generator uses minimum-zero columns (1.2fr / 1fr), horizontal gap (3rem) and
vertical gap (1.5rem). Formats span both columns. At (850px) and below, horizontal
gap becomes (1.5rem) and the three-column guide becomes one column with gap
(1.25rem). At (760px) and below, the generator becomes one column with row gap
(1.25rem): formats, input and optional customization, then preview and exports.
The preview gains a top separator and padding (1.25rem); use cases become one column.

Desktop formats wrap; mobile formats use a single horizontally scrolling strip
with padding (0.25rem), a thin scrollbar and hidden icons. At (500px) and below,
the source link, brand suffix and live-preview hint hide; header gaps narrow to
(0.5rem), and the batch toolbar aligns right. Input and exports stay in normal flow.

The spacing steps in frontmatter are observed relative values. Intro top/bottom
padding is (2.25rem / 1.5rem), reduced to (1.75rem / 1rem) on mobile. Reading
content starts after (3.5rem), reduced to (2.5rem); sections have vertical padding
(2.5rem), reduced to (2rem). Descriptions stop at (55ch). Color settings and batch
selects auto-fit minimum widths (8rem) and (10rem), capped by available width.

Controls use minimum heights: fields and download actions (3rem); icon, format,
shape, text and utility actions (2.75rem); FAQ summaries (3.5rem). Frontmatter
component `height` values describe minimums; implement them with `min-height`.
Textareas resize vertically between (6rem) and (20rem). Preserve minimum-zero
widths, wrapping and relative sizing for narrow screens and larger text.

Loading reserves (54rem), (56.5rem) from (761px) through (1100px), and (75rem) at
(760px) and below. These reservations are not heights for the working generator.

## Elevation & Depth

Depth comes primarily from tonal separation and fine borders. Ordinary sections
have no shadows. Editor and preview column wrappers are not surfaced cards.
Only transient feedback and dialogs use ambient shadows.

### Shadow Vocabulary

- **Toast** (`0 0.5rem 2rem #0003`): transient feedback above the page.
- **Modal** (`0 1.25rem 5rem #0003`): a dialog over a dim backdrop (`#0008`).

**The Flat Utility Rule.** Keep ordinary page sections flat. Reserve shadows for a transient notification or a modal above the page.

## Shapes

Controls share `rounded.control`; preview, toast and update banner share
`rounded.preview`; dialogs use `rounded.modal`. Fine solid boundaries are (1px);
logo upload uses a dashed line of the same width. Color preset targets are circles
(2.75rem), with a page-colored border (0.5rem); native swatches have radius (0.25rem).

The QR paper is square with width `min(100%, 14rem)` on fixed white. Preview
minimum height is (16rem). Square/rounded modules are actual encoded output,
not a decorative interface treatment.

## Components

### Buttons

Primary exports use fixed green fill and white text; secondary exports use the
current surface, ink and fine boundary. Text utilities have no filled box. Icon
actions have square targets (2.75rem) and transparent backgrounds.

Enabled buttons press immediately at scale (0.97), transitioning transform over
(160ms) with `cubic-bezier(0.23, 1, 0.32, 1)` and background over (160ms ease).
Disabled buttons have opacity (0.5), no press scale and a not-allowed cursor.
Fine-pointer hover darkens primary fill, adds soft green to secondary/icon/format
actions, or underlines text utilities. Reduced motion removes scaling and retains
only background transitions (100ms ease).

### Inputs / Fields

Fields use the input surface, fine boundary, control radius and body-sized text,
with padding (0.75rem). URL icon spacing increases left padding to (2.375rem).
Placeholders use muted ink and caret uses green. Invalid fields use danger borders
and connect to the visible error through ARIA. Common visible focus is a green
outline (2px) with offset (4px), across fields, links, buttons and disclosures.

### Format and shape controls

Formats use `aria-pressed` and soft green selection. Shape options add a boundary,
changing border and text to green when selected. Preserve touch height and local
wrapping/scrolling. Circular color presets choose QR output colors; their selected
outline is (1px) with offset (-5px).

### Preview / Container

The stage contains a real QR image, recalculated synchronously from content,
format and settings edits. No debounce or generate action is required. A valid
result shows green ready status; invalid content shows a white-paper empty state
and danger message. Exports disable without a valid image or during processing.
Clipboard copying also depends on browser capability and HTTPS, with a download
fallback explained in its title.

### Disclosures

Customization, advanced settings and FAQ use native `details` / `summary`.
Customization and advanced summaries have minimum height (3rem) and rotate their
chevron (180deg) when open. FAQ rows use fine separators; their existing text plus
indicator rotates (45deg). No animated height transition is implemented.

### Navigation

Small branding and utility links use the system stack. Navigation wraps, hover
underlines links, and mobile simplifies links and brand suffix. Use-case links
select a real mode through a query and anchor. The skip link appears on keyboard
focus. Future tool links render only when real destinations are configured.

### Dialogs and feedback

Native modal dialogs have width `min(34rem, calc(100% - 2rem))`, maximum height
`calc(100dvh - 2rem)`, internal scrolling and contained overscroll. Close control,
Escape and outside click close them; batch closure is ignored while processing.
The bottom-centered live-status toast lasts (5000ms), supports dismissal and
respects the bottom safe area. A bottom-right update banner asks before reloading
because content will clear. Theme follows a saved preference or OS setting and
stores only theme and language preferences.

## Do's and Don'ts

### Do:

- **Do** reuse the established system stack, relative type sizes and semantic theme variables.
- **Do** keep text fields at 1rem and allow labels, actions and longer content to wrap.
- **Do** preserve visible focus, local control scrolling, immediate preview and reduced-motion behavior.
- **Do** use green to explain action or state and danger colors for real errors.
- **Do** use native disclosures and dialogs with clear labels and keyboard access.

### Don't:

- **Don't** download or substitute fonts, including a decorative display face.
- **Don't** add decorative gradients, blobs, illustrative scenes, nested cards or marketing scaffolds.
- **Don't** add fake ratings, testimonials, usage numbers or performance claims.
- **Don't** introduce elaborate animation or a generation step before the live preview.
- **Don't** turn user-selected QR output colors into the surrounding interface palette.

No defects are canonized: the finish review returned `ship` with no material
fixes. Physical device scanning/printing and deployed search/performance results
remain outside the observed evidence. Sidecar tonal ramps are synthesized panel
visualizations, not implemented colors. The publication address remains configurable
and is not a visual token.

## Interface localization

A native header selector supports English, German, Turkish, Arabic, Japanese,
Spanish and Portuguese. Labels, supporting content, feedback, dialogs and print headings use
local dictionaries. Existing system fonts, QR generation and user input stay
unchanged. Arabic sets document RTL; logical CSS properties mirror controls,
while URLs, numbers and QR artwork preserve their direction. Labels wrap at
narrow widths and large text sizes; the preference works offline.
