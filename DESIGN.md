---
name: Sehat
description: Medical report digitization and consent-based sharing, presented with clinical calm and zero visual noise.
colors:
  ink: "#14151A"
  ink-hover: "#000000"
  cobalt: "#2A5CFF"
  cobalt-soft: "#DDE1FF"
  cobalt-deep: "#2047C7"
  paper: "#FFFFFF"
  mist: "#EDF0F7"
  fog: "#F3F3F4"
  charcoal: "#1A1C1C"
  slate: "#434656"
  steel: "#747688"
  pale-steel: "#C0C1C8"
  hairline: "rgba(26, 28, 28, 0.08)"
  morning-sky-deep: "#3E63A8"
  morning-sky-mid: "#6D8FCE"
  morning-sky-pale: "#B8CBEA"
  clinical-red: "#BA1A1A"
  clinical-red-soft: "#FFF4F3"
  pulse-teal: "#13ACC4"
  pulse-teal-soft: "#F3FDFF"
  amber-glucose: "#D98324"
  amber-glucose-soft: "#FFFAF3"
  deep-plum: "#770058"
  deep-plum-soft: "#FFF3FE"
  success-green: "#4CAF50"
  success-green-soft: "rgba(76, 175, 80, 0.1)"
  navy-device: "#0F172A"
  navy-device-border: "#1E293B"
typography:
  display:
    fontFamily: "Inter, sans-serif"
    fontSize: "clamp(2.125rem, 6vw, 3.875rem)"
    fontWeight: 700
    lineHeight: 1.08
    letterSpacing: "-0.03em"
  headline:
    fontFamily: "Inter, sans-serif"
    fontSize: "clamp(1.625rem, 4vw, 2.375rem)"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Inter, sans-serif"
    fontSize: "18px"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "normal"
  body:
    fontFamily: "Public Sans, system-ui, -apple-system, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "normal"
  label:
    fontFamily: "Inter, sans-serif"
    fontSize: "12px"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "0.06em"
rounded:
  xs: "8px"
  sm: "12px"
  icon: "16px"
  md: "18px"
  lg: "24px"
  xl: "28px"
  2xl: "32px"
  pill: "999px"
spacing:
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  2xl: "40px"
  section: "100px"
  section-mobile: "60px"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.pill}"
    padding: "12px 26px"
  button-primary-hover:
    backgroundColor: "{colors.ink-hover}"
  button-secondary:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.charcoal}"
    rounded: "{rounded.pill}"
    padding: "12px 26px"
  badge-pill:
    backgroundColor: "{colors.cobalt-soft}"
    textColor: "{colors.cobalt}"
    rounded: "{rounded.pill}"
    padding: "8px 16px"
  card:
    backgroundColor: "{colors.paper}"
    rounded: "{rounded.xl}"
    padding: "32px"
  card-compact:
    backgroundColor: "{colors.paper}"
    rounded: "{rounded.sm}"
    padding: "12px"
---

# Design System: Sehat

## 1. Overview

**Creative North Star: "The Quiet Instrument"**

Sehat presents medical data the way a well-made clinical instrument presents a reading: exact, unhurried, and never showing off. The page makes one loud gesture — a deep morning-sky gradient hero band that frames the product like glass over an exhibit — and then goes quiet. Everything after that is white space, hairline borders, soft ambient shadows, and a single blue accent used with discipline. Precision is the persuasion; there is no stock photography, no stethoscope iconography, no teal-and-white "corporate healthcare" palette standing in for trust. Trust here is earned by showing the mechanism — a real scan, a real consent slider, a real revoke button — not by decorating around it.

The system explicitly rejects the generic health-app playbook: no clip-art doctors, no gradient-text hero claims, no tiny uppercase eyebrows stacked above every section. Where the page needs a label, it uses a single pill badge per section, sparingly, in the one accent color the whole system is built around.

**Key Characteristics:**
- One accent (cobalt #2A5CFF) carries all interactive and informational emphasis; everything else is ink, paper, or hairline gray.
- Health-metric widgets are the one place color multiplies — each vital sign gets its own clinical hue, because distinguishing data at a glance is functional, not decorative.
- Depth is ambient at rest, and only ever deepens as a direct response to hover — nothing floats unprovoked.
- Pill shapes recur deliberately (buttons, badges, the consent slider) as the system's one consistent shape signature.

## 2. Colors

The palette is overwhelmingly neutral — near-black ink, white paper, hairline gray — with a single cobalt blue doing all of the interactive and brand signaling, and a small clinical set of hues reserved exclusively for health-metric data.

### Primary
- **Cobalt** (`#2A5CFF`): The one accent. Section badges, links, icon-wrapper tints, the consent slider handle, timeline markers, the scanning laser. If something on the page is interactive or means "pay attention," it's this blue.
- **Cobalt Deep** (`#2047C7`): Gradient partner to Cobalt in the bottom CTA band; never used standalone.
- **Cobalt Soft** (`#DDE1FF`): The tint behind badge pills and icon wrappers — Cobalt at rest, before it needs to be loud.

### Neutral
- **Ink** (`#14151A`): The Letters.app-style solid pill CTA — the site's single highest-contrast call to action color, used sparingly (header download button, hero download button).
- **Charcoal** (`#1A1C1C`): Primary text and heading color.
- **Slate** (`#434656`): Supporting/body copy color — the workhorse gray for paragraph text under headings.
- **Steel** (`#747688`) / **Pale Steel** (`#C0C1C8`): Tertiary labels, units, timestamps, disabled/quiet states.
- **Paper** (`#FFFFFF`): Base page background and every card surface.
- **Mist** (`#EDF0F7`) / **Fog** (`#F3F3F4`): Section tint bands and the phone-mockup's internal screen background — a half-step off white, used to separate zones without a hard edge.
- **Hairline** (`rgba(26, 28, 28, 0.08)`): The only border color on the page. Every card, divider, and frame uses this one value.

### Named Rules
**The One Accent Rule.** Cobalt is the only color permitted to carry meaning or call for action outside the health-widget system. If a new element needs emphasis, reach for Cobalt before reaching for a new hue.

**The Clinical Palette Rule.** The four vital-sign colors below exist only inside measurement widgets. They never leak into navigation, buttons, or marketing copy — the moment a "health color" appears outside a data context, it stops meaning data and starts meaning decoration.

- **Clinical Red** (`#BA1A1A`, soft: `#FFF4F3`): Blood pressure.
- **Pulse Teal** (`#13ACC4`, soft: `#F3FDFF`): Heart rate.
- **Amber Glucose** (`#D98324`, soft: `#FFFAF3`): Blood sugar.
- **Deep Plum** (`#770058`, soft: `#FFF3FE`): Body temperature.
- **Success Green** (`#4CAF50`, soft: `rgba(76,175,80,0.1)`): Confirmation states only (consent granted, scan verified) — never a general-purpose accent.

### Atmosphere
- **Morning Sky** (`#3E63A8` → `#6D8FCE` → `#B8CBEA` → white): The hero band's gradient, used exactly once per page as the establishing shot.
- **Navy Device** (`#0F172A`, border `#1E293B`): Reserved for the phone-frame chassis and its status bar — the device itself, never the UI content inside it.

## 3. Typography

**Display/Headline/Title Font:** Inter (with system-ui, sans-serif fallback)
**Body Font:** Public Sans (with system-ui, -apple-system, sans-serif fallback)

**Character:** Inter carries every heading at 700 weight with tightened tracking — confident and structural. Public Sans handles all body copy at a relaxed 1.6 line-height — the contrast between a tight geometric display face and an open humanist body face is what keeps the page from reading as one undifferentiated block of bold text.

### Hierarchy
- **Display** (700, `clamp(34px, 6vw, 62px)`, line-height 1.08, letter-spacing -0.03em): Hero `h1` only. Appears once per page, always on the Morning Sky gradient in white.
- **Headline** (700, `clamp(26px, 4vw, 38px)`, letter-spacing -0.02em): Section `h2`s ("One app for your whole medical history," "From paper to pocket in four steps").
- **Title** (700, 17–22px): Card and timeline-step `h3`s. Size scales with card prominence — flagship twin-cards at 22px, the 3-up feature grid at 19px, timeline steps at 18px, security items at 17px — this is deliberate hierarchy, not drift.
- **Body** (400, 15–17px, line-height 1.6, capped at ~60ch by container width): Supporting paragraph copy, set in Slate under headings, Charcoal when standalone. The upper end (17px) is reserved for copy sitting on a prominent colored surface (the bottom CTA band), where it needs slightly more presence against the gradient.
- **Label** (800, 12px, letter-spacing 0.06em, uppercase): Section badges and the hero badge — the only uppercase-tracked text on the page, reserved for these pills specifically.

### Named Rules
**The Single Eyebrow Rule.** Uppercase tracked labels appear only inside a pill badge shape, never as bare text above a heading. The pill shape alone isn't the full exception, though — repeating it on every section is still the banned cadence. It now bookends the page (first section, "Core Capabilities," and the closing "Security First" section only); the two sections between run on heading + copy alone.

## 4. Elevation

Cards are flat-adjacent at rest — a soft, wide, low-opacity ambient shadow (`--shadow`) that reads more as "this surface is slightly raised" than "this object is floating" — and only deepen into a true lifted shadow (`--shadow-lg`) paired with a `translateY(-4px to -5px)` as a direct hover response. Nothing on the page casts a resting shadow heavier than the ambient tier; depth is earned through interaction, not applied as decoration.

### Shadow Vocabulary
- **Ambient** (`box-shadow: 0 18px 45px rgba(0,0,0,0.06)`): Default resting state for flagship cards, feature cards, timeline content, the bottom CTA band.
- **Lifted** (`box-shadow: 0 28px 80px rgba(0,0,0,0.12)`): Hover state for the same cards, always paired with a small upward translate.
- **Micro-ambient** (`box-shadow: 0 4px 10px rgba(0,0,0,0.02)`): The phone-mockup's internal widgets — a barely-there separation appropriate to a miniature screen where a full Ambient shadow would read as too heavy.
- **CTA glow** (`box-shadow: 0 10px 22px rgba(0,0,0,0.18)` on the Ink button, `0 6px 18px rgba(15,23,42,0.16)` on the light pill): Button-specific hover shadows, distinct from card elevation because they signal "pressable," not "raised surface."

### Named Rules
**The Earned Depth Rule.** No element ships with Lifted shadow as its resting state. Elevation increases only in direct response to hover or an active interaction — a page that looks the same whether or not you're touching it.

## 5. Components

Buttons, cards, and inputs are quietly confident and clinically tidy: unadorned pill buttons, soft-shadowed cards that lift a few pixels on hover, nothing that shouts.

### Buttons
- **Shape:** Full pill (`border-radius: 999px`).
- **Primary:** Ink background (`#14151A`), white text, `12px 26px` padding (`16px 34px` for the large hero variant, `9px 18px` for the small header variant, taller under `@media (pointer: coarse)` for touch). Hover shifts to pure black (`#000000`) with a 1px upward translate and a soft dark glow.
- **Secondary (light pill):** White background, Charcoal text, used where the Ink pill would lose contrast (over the hero's blue gradient or the bottom CTA band). Hover shifts to a faint gray (`#f2f4f8`).
- **Focus:** A white-then-Cobalt halo (`box-shadow: 0 0 0 2px #fff, 0 0 0 4px var(--primary)`) instead of a plain outline, since pills sit on both white and blue-gradient backgrounds and a single-color ring would disappear against one of them.

### Badges / Pills
- **Style:** Cobalt Soft background, Cobalt text, full pill radius, uppercase 12px/800-weight label type, `8px 16px` padding.
- **State:** Static only — these are section tags, not interactive controls.

### Cards / Containers
- **Corner Style:** 28px radius for flagship two-up cards, 24px for the standard three-up feature grid, 18px for timeline content, 12px for compact in-mockup widgets.
- **Background:** Paper (`#FFFFFF`) throughout; never tinted.
- **Shadow Strategy:** Ambient at rest, Lifted on hover (see Elevation).
- **Border:** 1px Hairline (`rgba(26,28,28,0.08)`) on every card.
- **Internal Padding:** 32–40px for full-size cards, 12–16px for compact/in-mockup cards.

### Inputs / Fields
- No standalone text-input pattern exists on the marketing page today. The nearest analog is the **consent slider** (see Signature Component below) — if a real input is added, inherit the card's Hairline border and Paper background, with Cobalt as the focus-state color.

### Navigation
- **Style:** Fixed, transparent header over the hero; logo renders white via a CSS filter until scroll passes the hero threshold, at which point the header gains a solid/blurred background and the logo reverts to its natural color. Nav links are Slate at rest, Cobalt on hover. No visible nav-link underline or active-state indicator beyond color.

### Signature Component: Consent Slider
A full-width pill-shaped "slide to grant access" control (Mist background, Hairline border) with a circular Cobalt handle that carries a chevron icon and a soft blue shadow. On completion it hands off to a success overlay (scale + fade entrance, `cubic-bezier(0.175, 0.885, 0.32, 1.275)`) showing a dashed-border access code box in Cobalt monospace text and a countdown timer — the single moment in the whole page where the "time-bound, revocable" product principle is dramatized rather than described.

## 6. Do's and Don'ts

### Do:
- **Do** keep Cobalt (`#2A5CFF`) as the only cross-page accent color; every other hue on the page is either a neutral or scoped to a health-metric widget.
- **Do** use the full pill shape (`999px`) for every button, badge, and slider — it's the system's one recurring shape signature.
- **Do** let cards rest at Ambient shadow and only reach Lifted shadow on hover, paired with a small upward translate.
- **Do** give each vital-sign widget its own clinical hue (Clinical Red, Pulse Teal, Amber Glucose, Deep Plum) so real data stays legible at a glance.
- **Do** show the mechanism (a real scan animation, a real consent slider, a real revoke button) as the proof of the pitch — that is the trust-building device, not copy.

### Don't:
- **Don't** use stock-photo doctors, stethoscopes, or a teal-and-white "corporate healthcare" palette anywhere on the site — an explicit anti-reference from PRODUCT.md.
- **Don't** introduce gradient text, side-stripe borders, tiny uppercase eyebrows floating above headings (outside the pill-badge exception), or numbered 01/02/03 section scaffolding — the generic AI-marketing-page tells this system is built to avoid.
- **Don't** let a health-widget color (Clinical Red, Pulse Teal, Amber Glucose, Deep Plum) appear outside an actual measurement context — once it leaves the widget, it stops reading as data and starts reading as arbitrary decoration.
- **Don't** ship a card, button, or badge with a resting shadow heavier than Ambient — elevation is earned by interaction, never applied as default decoration.
- **Don't** add a second accent color "for variety." If a section feels flat, reach for typography weight, spacing, or the existing Cobalt before introducing a new hue.
