---
phase: 07-support-donation-modal-with-generated-banner
type: context
created: 2026-04-14
---

<decisions>

## D-01: Modal Trigger Timing
**Decision:** First download + every 5th download after
**Rationale:** Balance between encouraging donations and not annoying users. localStorage counter tracks download count.

## D-02: Modal Tone & Content
**Decision:** Gratitude-first approach
**Copy direction:** "Thanks for using Suno Downloader! If you'd like to help keep it free..." — lead with appreciation, soft ask for support.

## D-03: Banner Image Style
**Decision:** Cozy coffee + music mashup with warm tones
**Generation:** Use nanobanana MCP to generate. Coffee cup with musical notes/vinyl vibes. Warm color palette. Should feel inviting, not corporate.

## D-04: Modal Layout
**Decision:** Centered overlay — banner image on top, gratitude text below, big "Buy Me a Coffee" button at bottom
**Behavior:** Classic modal pattern. Dismissable via X button or clicking outside.

## D-05: Existing Top Banner
**Decision:** Keep both banner and modal
**Rationale:** Banner is passive/always visible for returning users who dismissed the modal. Modal is the active conversion tool triggered at download moments. Different purposes, different touchpoints.

## D-06: Dismissal Behavior
**Decision:** localStorage download counter, no permanent opt-out
**Logic:** Show modal on 1st download and every 5th download after (1, 5, 10, 15...). X button and click-outside to close. No "don't show again" checkbox — keeps the ask alive without being aggressive.

</decisions>

<specifics>

- buymeacoffee URL: https://buymeacoffee.com/focused
- Modal triggers on Download ZIP click and individual song download click
- Banner image generated via nanobanana MCP (warm coffee + music theme)
- Existing support-banner CSS class and banner variables already in App.css/index.css
- ModalsProvider already configured in main.tsx
- Multiple modal component patterns exist (ContextModal, OptionsModal) for reference

</specifics>

<canonical_refs>

- client/src/App.tsx — main app component, download handlers, current support banner
- client/src/App.css — support-banner, info-banner, monolith-card styles
- client/src/index.css — banner CSS variables (--banner-bg, --banner-border, --banner-text)
- client/src/main.tsx — ModalsProvider wrapper
- client/src/components/ContextModal.tsx — existing modal pattern using @mantine/modals
- client/src/services/WebApi.ts — downloadPlaylist API call

</canonical_refs>

<deferred>

None

</deferred>
