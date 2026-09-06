---
name: IOnLearn
description: Produktivitas Akademik & Asisten Belajar — Classroom-synced study companion
colors:
  primary: "#818cf8"
  primary-deep: "#4f46e5"
  primary-soft: "#a5b4fc"
  neutral-bg: "#0c0c0c"
  neutral-surface: "#161616"
  neutral-surface-2: "#141414"
  neutral-raised: "#1f1f1f"
  neutral-border: "#2b2b2b"
  neutral-text: "#f5f5f5"
  neutral-text-2: "#a3a3a3"
  neutral-text-muted: "#737373"
  accent-success: "#34d399"
  accent-warning: "#fbbf24"
  accent-danger: "#f87171"
  accent-info: "#7dd3fc"
  light-bg: "#f8fafc"
  light-surface: "#ffffff"
  light-border: "#e2e8f0"
  light-text: "#0f172a"
typography:
  display:
    fontFamily: "Lexend, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontWeight: 800
    letterSpacing: "-0.025em"
  body:
    fontFamily: "Plus Jakarta Sans, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Plus Jakarta Sans, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontWeight: 600
    fontSize: "12px"
  mono:
    fontFamily: "JetBrains Mono, monospace"
    fontSize: "12px"
rounded:
  chip: "8px"
  button: "10px"
  card: "16px"
  dialog: "24px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "20px"
  page: "24px"
components:
  button-primary:
    backgroundColor: "{colors.primary-deep}"
    textColor: "{colors.light-surface}"
    rounded: "{rounded.button}"
    padding: "12px 16px"
    height: "36px"
  button-primary-bright:
    backgroundColor: "{colors.light-surface}"
    textColor: "{colors.neutral-bg}"
    rounded: "{rounded.button}"
    padding: "12px 16px"
    height: "36px"
  button-outline:
    backgroundColor: "{colors.light-surface}"
    textColor: "{colors.light-text}"
    rounded: "{rounded.button}"
    padding: "12px 16px"
    height: "36px"
  button-outline-dark:
    backgroundColor: "{colors.neutral-surface-2}"
    textColor: "{colors.neutral-text}"
    rounded: "{rounded.button}"
    padding: "12px 16px"
    height: "36px"
  button-ghost:
    textColor: "{colors.neutral-text-2}"
    rounded: "{rounded.button}"
  chip:
    backgroundColor: "#eef2ff"
    textColor: "#4338ca"
    rounded: "{rounded.chip}"
    padding: "4px 10px"
    typography: "{typography.label}"
  chip-dark:
    backgroundColor: "{colors.neutral-surface-2}"
    textColor: "{colors.primary-soft}"
    rounded: "{rounded.chip}"
    padding: "4px 10px"
    typography: "{typography.label}"
  card:
    backgroundColor: "{colors.light-surface}"
    textColor: "{colors.light-text}"
    rounded: "{rounded.card}"
    padding: "20px 20px"
  card-dark:
    backgroundColor: "{colors.neutral-surface}"
    textColor: "{colors.neutral-text}"
    rounded: "{rounded.card}"
    padding: "20px 20px"
  input:
    backgroundColor: "{colors.light-bg}"
    textColor: "{colors.light-text}"
    rounded: "{rounded.button}"
    height: "36px"
  input-dark:
    backgroundColor: "{colors.neutral-surface-2}"
    textColor: "{colors.neutral-text}"
    rounded: "{rounded.button}"
    height: "36px"
---

# Design System: IOnLearn

## Overview

**Creative North Star: "The Late-Study Lamp"**

The interface is a desk lamp in a dark room: everything around the light stays quiet and near-black, and exactly one thing is lit at a time — the task, the deadline, the button that moves you forward. The dark surface is a soft neutral black (never pure black, never blue-cast black), and the indigo accent is the lamplight itself: scarce, precise, and always aimed at what matters right now.

The system reads as calm, orderly, and encouraging. Surfaces are flat, separated by hairline borders and tonal steps rather than cast shadows; the eye moves from greeting to progress to the task list without anything shouting for attention. Density is real but disciplined — chips carry the metadata, weight stays reserved for the task title and the one primary action, and a deliberate 20px cadence separates major groups from the 16px rhythm inside them.

This is an Operate surface: the tool should disappear while the homework leads. Both modes honor the same spacing, radius, and component language; the light mode is the "day desk" on slate paper, the dark mode is the "night desk" that the product truth says matters most — long evening sessions where reading comfort beats striking contrasts.

**Key Characteristics:**
- Soft near-black dark mode (`#0c0c0c` family), explicitly free of blue cast and pastel haze
- One primary accent (indigo) at rest; emerald/amber/rose/sky appear only as status language
- Flat surfaces with hairline borders; shadows effectively absent at rest
- Lexend for headings, Plus Jakarta Sans for UI, JetBrains Mono only for real data
- 20px group cadence, 16px card rhythm, 8px chip rhythm
- Inverted primary button in dark mode (paper-white fill, near-black text)

## Colors

A monochrome-neutral skeleton with one lit accent and a strict status vocabulary. In dark mode, every surface belongs to the `#0c0c0c` neutral family; in light mode, the slate family fills the same roles.

### Primary
- **Study Indigo** (#818cf8 dark / #4f46e5 light): the single resting accent. Carries brand lockups, the focus ring, progress fill, active filter states, and text links. Bright variant `#a5b4fc` marks hover/active accent text. Rarity is the point — a screen should show several *uses* of indigo without letting it own the layout.

### Secondary
- **Done Green** (#34d399): completion, checkboxes checked, "ADA MATERI" sync state, completion rings. Appears only where a task is actually done or ready.
- **Deadline Amber** (#fbbf24): "Hari Ini" deadlines and sync warnings.
- **Overdue Rose** (#f87171): overdue badges, destructive actions.
- **Source Sky** (#7dd3fc): attachment and source icons (Drive files, study sources).

### Neutral
- **Soft Black** (#0c0c0c): dark page background. Never pure `#000`, never navy-tinted.
- **Ink Surface** (#141414): dark chip and input fill — the most common surface step.
- **Charcoal Surface** (#161616): dark cards, raised surfaces, low-tone buttons.
- **Raised Charcoal** (#1f1f1f): dark hover state for buttons, chips, and card interactions.
- **Hairline** (#2b2b2b): the dark border everywhere; borders-out are visual structure, not decoration.
- **Paper White** (#f5f5f5): dark-mode primary text, and the fill of the inverted primary button.
- **Quiet Gray** (#a3a3a3): dark secondary text and labels.
- **Muted Echo** (#737373): dark icons, placeholders, timestamps, and disabled-adjacent text.
- **Day Paper** (#f8fafc) / **Card White** (#ffffff) / **Ink Slate** (#0f172a): the light-mode background, surface, and text.
- **Line Slate** (#e2e8f0): the light-mode hairline border.

### Named Rules
**The Lamplight Rule.** One accent is lit at rest — indigo. Emerald, amber, rose, and sky are reserved for their semantic labels and are never used decoratively on the same surface, so a task card at rest shows its urgency (or its completion) before it shows anything else.
**The Soft-Black Rule.** Dark surfaces never reach pure black and never shift blue. Every dark surface, border, and hover lives on the `#0c0c0c → #2b2b2b` neutral ramp.

## Typography

**Display Font:** Lexend (with system-ui fallback)
**Body Font:** Plus Jakarta Sans (with system-ui, -apple-system, Segoe UI, Roboto fallback)
**Label/Mono Font:** JetBrains Mono (data only)

**Character:** A headless-but-friendly pairing. Lexend rounds and squares its stems for legibility at the bold weights that anchor titles; Plus Jakarta Sans stays neutral and open in the body so paragraphs read quietly for long sessions. The pair is contemporary and approachable — a study crush, not a legal document.

### Hierarchy
- **Display** (800, 20px mobile / 24px desktop, tracking `-0.025em`, line-height snug): page greeting and hero headings. Surface on the dashboard header ("Halo, [nama]").
- **Headline** (bold/700, 16–18px, tracking tight): card titles and empty-state headings. The strongest weight allowed on a task card — nothing on a card out-boldens its title.
- **Title** (semibold/600, 14–16px): section headers and dialog titles.
- **Body** (400, 14px desktop / 12px mobile, line-height 1.6): descriptions, counts, modal copy. Belows `75ch` inside cards.
- **Label** (600 or 500, 12px, no letterspacing): chips, badge text, button labels, timestamps.

### Named Rules
**The One-Voice Rule.** Lexend speaks in headings, Plus Jakarta Sans speaks in the UI, JetBrains Mono appears only for actual data — dates, hash-like identifiers, debug timestamps. Mono is never worn as a "technical" costume.

## Layout

The dashboard runs on a single centered column: `max-w-6xl` container with `px-4 sm:px-6` page gutters. The task path is linear — greeting, progress + quick filters, search/filter cards, then the task list — and each major group is separated by a 20px cadence (`mb-5`) while cards inside the list breathe at 16px (`space-y-4`).

The primary components are full-width strips rather than a fragmented tiles grid: the stats banner, filter card, and each task card span the column. Density concentrates in the task card's metadata row (chips wrap to two lines with a 8px gap when needed), and the card's internal rhythm steps down from the top metadata row (12px) through the title (8px gap to description) to actions separated by a single hairline divider.

Responsive behavior is structural, not decorative: the stats filter grid is 2×2 thumbnails on mobile and 4 across on `sm`; the navbar collapses text labels ("Tambah Tugas", "Cek Tugas Baru") to icon-only under their breakpoints; the mobile-only floating chat button appears below `md` and disappears on desktop where the navbar carries the action. Touch targets hold at `h-8`–`h-9` for icon and small buttons, `h-11` for large.

## Elevation & Depth

The system is flat by default in both modes: depth is carried by tonal layering and hairline borders, not cast shadows. Elevation communicates hierarchy only at two points — interactive elements lean on a hairline shadow at rest, and the profile dropdown floats on the strongest shadow (`shadow-xl`) as the single true overlay.

### Shadow Vocabulary
- **Hairline lift** (`0 1px 2px 0 rgb(0 0 0 / 0.05)`): default on cards and primary buttons (Tailwind `shadow-2xs`/`xs`). Reads as an edge, not a float.
- **State lift** (same spec, more noticeable on hover): cards raise slightly on hover plus a border shift from line-slate to the accent.
- **Overlay float** (`shadow-xl`): reserved for the profile dropdown and dialog panels — the only elements allowed to float above the page.

### Named Rules
**The Flat-By-Default Rule.** Surfaces are flat at rest. Shadows appear only where interactive state or a true overlay demands them; nothing decorative casts a shadow.

## Shapes

A two-step radius language. **Cards and dialogs** use generous curves (16px `rounded-2xl`, dialogs 24px `rounded-3xl`) to keep the tool friendly; **working controls** — buttons, inputs, chips, checkboxes — use a tighter 8–10px step (`rounded-[8px]`/`rounded-[10px]`) and nest down to 6px for icon buttons. Progress fills and avatars go full-round.

Borders are universally hairline (1px) in both modes: `Line Slate` on light, `Hairline` (#2b2b2b) on dark. Checkbox and progress-rail interiors obey the tone ladder (`slate-100`/`#141414`). There are no gradient fills, no colored edge ribs, and no hard offset shadows.

## Components

### Buttons
- **Shape:** 10px radius (`rounded-[10px]`); small buttons 8px (`rounded-[8px]`), large 12px (`rounded-[12px]`). Capsule-free, tactile without cuteness.
- **Primary:** Indigo-600 fill, white text (`h-9`, `px-4`) in light mode. **In dark mode the primary inverts** — Paper White fill, Soft Black text — so the brightest thing on the night desk is the action itself. Hover deepens the light fill to white.
- **Hover / Focus:** 150ms ease transitions; focus ring is a 2px indigo wash (`ring-[#818cf8]/30–40`); presses compress at `scale-95`.
- **Outline:** hairline border + white fill (light) / `#141414` fill (dark), hover raises surface one tone step.
- **Secondary / Ghost:** secondary is a slate-100 (light) or `#161616` (dark) surface button; ghost is text-only until hover, where it takes a surface wash. Primary-subtle is a tinted-ghost: indigo-50 wash with indigo text (light) switching to neutral surface + accent text in dark.
- **Destructive:** rose-600 solid (light); in dark a rose-tinted translucent fill with rose-200 text.

### Chips
- **Style:** 8px radius pill-rectangles (`rounded-[8px]`), 12px label text at 500–600 weight, 8px horizontal padding. Light mode tints the fill per label (indigo-50, rose-50, amber-50, emerald-50) with a tinted border; dark mode drops the tint for a uniform `#141414` fill with a `#2b2b2b` border, carrying color in the text and icon only.
- **State:** urgency chips stay bold (deadline semantics), metadata chips sit at semibold so no chip out-shouts the task title. Filter chips invert to `#f5f5f5`/`#0c0c0c` when selected in dark mode.

### Cards / Containers
- **Corner Style:** 16px radius (`rounded-2xl`).
- **Background:** Card White (light) / Charcoal Surface `#161616` (dark); inputs and sub-surfaces drop to `#141414`.
- **Border:** hairline Line Slate (light) / `#2b2b2b` (dark); hover shifts the border toward the accent at partial opacity (`#818cf8/50`).
- **Shadow Strategy:** hairline lift at rest only (see Elevation).
- **Internal Padding:** 20px (`p-5`, `sm:p-6` for cards; 14–16px for filter card and compact rows).
- **Structure:** metadata row on top, title next, a single dividable action rail at the bottom — never two nested hairline separators in one card.

### Inputs / Fields
- **Style:** hairline stroke, 10px radius, slate-50 fill (light) or `#141414` fill (dark), 12–14px text.
- **Focus:** 2px indigo glow (`ring-[#818cf8]/20`) plus an indigo border shift.
- **Selects:** same treatment, with a native chevron icon; menu options re-skin to `#161616`/Paper White in dark mode.

### Navigation
- Sticky header (`h-16`, `backdrop-blur-md`, hairline bottom border) holding the 40px logo mark with brand lockup and tagline, then icon-and-label actions right-aligned. The accent lives in the logo mark and Tanya AI action; the profile dropdown is the only `shadow-xl` element, with 8px rhythm menu rows that highlight on hover. Below `sm`/`md` the label text collapses to icons.

### Signature Component: Custom Checkbox
The task-completion control is an off-square 28×28 `rounded-[8px]` button: a 2px hairline box at rest that shifts toward indigo on hover and fills **Done Green** (#34d399) with a `#0c0c0c` 3px-stroke check when complete — the one moment in the system where a saturated color fills a canvas, and it commits immediately with a small confetti pop (≈20 particles) on mobile-weight.

## Do's and Don'ts

### Do:
- **Do** keep dark surfaces on the `#0c0c0c → #2b2b2b` neutral ramp in both surfaces and borders.
- **Do** reserve saturated accents for semantic status — Done Green, Deadline Amber, Overdue Rose, Source Sky — and let indigo carry all resting emphasis.
- **Do** hold the 20px/16px/8px rhythm: 20px between major groups, 16px inside cards, 8px between chips.
- **Do** keep one hairline separator per card; let proximity (not stacked rules) separate content from actions.
- **Do** let the task title be the heaviest text on its card.
- **Do** invert the primary button in dark mode (Paper White fill, Soft Black text) so the action is the brightest element.

### Don't:
- **Don't** use pure `#000000` or any blue- or navy-tinted black for dark backgrounds.
- **Don't** reach for pastel or hazy accents in dark mode — the status colors are vivid by commitment.
- **Don't** cast shadows beyond the hairline lift at rest; the profile dropdown owns `shadow-xl`.
- **Don't** wear JetBrains Mono on prose — data only.
- **Don't** create a second nested `border-t` inside a card (the "encased" look).
- **Don't** put gray text on a colored fill — on tinted chips, shade the hue instead.