# Product

## Register

brand

## Platform

web

## Users

South Asian patients and their families — the general health-conscious population, not a narrow clinical niche. They accumulate physical lab reports over time (blood work, glucose panels, etc.) and currently manage them the old way: a shoebox or a phone camera roll of photos. They arrive at this landing page on a phone browser (mockup content uses names like "Arjun Prasad", doctor "Dr. Aadil Ahmed", domain mysehat.app), deciding in a few seconds whether this app is worth installing — right now that means sideloading a pre-release Android APK from GitHub, not a Play Store tap. Trust in a medical-data product is the gate they have to clear before anything else registers.

## Product Purpose

Sehat turns a photo of any paper lab report into a structured, private health record via OCR, then lets the patient grant a doctor time-bound, revocable access to specific data — nothing shared by default, nothing permanent. The landing page's job is singular: convert visitors into APK downloads. Success is a visitor understanding, within one scroll, that (1) scanning removes manual data entry, (2) sharing is consent-gated and reversible, and (3) their records can stay device-only if they choose — then tapping Download.

## Brand Personality

Trustworthy, calm, precise. Clinical confidence without clinical coldness — the site should feel like it was built by people who take medical data seriously, not like a generic wellness app. Current implementation direction (Letters.app-inspired: blue primary #2A5CFF, black pill CTAs, generous white space, restrained rounded cards) is the right lane and should be preserved and refined, not reinvented.

## Anti-references

Avoid generic "health app" cliches: no stock-photo doctors or stethoscopes, no teal-and-white "corporate healthcare" palette, no generic cross/heartbeat iconography as decoration. Avoid the broader AI-slop SaaS scaffold regardless of category — gradient text, side-stripe borders, tiny uppercase eyebrows on every section, numbered 01/02/03 markers as default scaffolding, identical icon-heading-text card grids.

## Design Principles

1. **Trust through precision, not decoration.** Every claim about privacy, consent, or OCR accuracy should read as concrete and specific, not marketing fluff — precise language and real mechanics beat reassuring adjectives.
2. **Show the mechanism, not just the promise.** The interactive phone mockup demonstrating scan → digitize → consent-share is the proof of the pitch, not decoration; keep it central and functioning rather than reducing it to a static screenshot.
3. **Data reads clinical-precise; everything else stays calm.** Measurement widgets (BP, heart rate, sugar, temperature) keep distinct, purposeful accent colors so real data is legible at a glance; the surrounding chrome stays restrained blue/black/white so it never competes with the data it's presenting.
4. **Consent and control are a headline feature, not a footnote.** Revocable, time-bound sharing is the actual differentiator versus "just another health app" — give it equal visual weight to the OCR scanning pitch, not a secondary bullet.
5. **Reject category-cliche health-app visuals on sight.** No stock photography, no stethoscope/cross iconography, no teal-corporate-healthcare palette — if a section could be mistaken for a generic clinic website, rework it.

## Accessibility & Inclusion

No formal WCAG level mandated by the user, but hold the line on the skill's baseline: body text ≥4.5:1 contrast, large text ≥3:1, and a `prefers-reduced-motion` alternative for every animation (hero starfield, scroll-triggered timeline, phone-mockup transitions, laser-scan effect) since none of that is optional per house rules.
