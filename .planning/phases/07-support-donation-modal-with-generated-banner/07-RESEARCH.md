# Phase 7: Support Donation Modal with Generated Banner — Research

**Researched:** 2026-04-14
**Domain:** React modal UI, localStorage state management, nanobanana image generation
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Modal trigger timing — 1st download + every 5th download after. localStorage counter tracks download count.
- **D-02:** Gratitude-first tone. "Thanks for using Suno Downloader! If you'd like to help keep it free..." Lead with appreciation, soft ask for support.
- **D-03:** Banner image — cozy coffee + music mashup via nanobanana MCP. Warm tones. Coffee cup with musical notes/vinyl vibes. Should feel inviting, not corporate.
- **D-04:** Centered overlay — banner image on top, gratitude text below, "Buy Me a Coffee" button at bottom. Dismissable via X button or clicking outside.
- **D-05:** Keep both existing top banner AND new modal (different purposes).
- **D-06:** localStorage download counter, no permanent opt-out. Show on 1, 5, 10, 15...

### Claude's Discretion

None specified.

### Deferred Ideas (OUT OF SCOPE)

None.
</user_constraints>

---

## Summary

This phase adds a donation prompt modal that fires at strategic download moments without disrupting the core download flow. The codebase already has all infrastructure needed: `ModalsProvider` is configured in `main.tsx`, `@mantine/modals` is installed at v6.0.13, and two working modal patterns exist in `ContextModal.tsx` and `OptionsModal.tsx` (via `SimpleSettingsModal.tsx`).

The implementation has three discrete workstreams: (1) generate and embed the banner image asset, (2) build the modal component, and (3) wire the localStorage counter into the existing `downloadPlaylist` handler in `App.tsx`. No backend changes are needed — this is entirely client-side.

The only novel dependency is the nanobanana MCP for image generation, which is already available in this environment. The image should be generated first (Wave 0 / task 1) since it needs to be embedded as an asset before the modal component can reference it.

**Primary recommendation:** Build a standalone `DonationModal.tsx` using Mantine's `Modal` component (not `modals.open()` API), controlled via `useState` from App.tsx. This keeps the counter logic co-located with the download handlers that increment it.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @mantine/core `Modal` | 6.0.13 | Modal overlay component | Already installed, project constraint is Mantine v6 |
| @mantine/modals `ModalsProvider` | 6.0.13 | Modal context already wrapping App | Already configured in main.tsx |
| React `useState` | 18.2.0 | Control modal open/closed state | Existing pattern throughout App.tsx |
| localStorage | browser native | Persist download counter | Already used for all settings storage |

[VERIFIED: codebase grep — client/package.json, main.tsx, ContextModal.tsx, SimpleSettingsModal.tsx]

### Image Asset
| Tool | Purpose | When to Use |
|------|---------|-------------|
| `nanobanana:photorealistic_shot` | Generate warm cozy coffee + music banner | Best for photorealistic scenes with specific mood/composition |
| `nanobanana:sticker_flat` | Alternative — flat kawaii style | If photorealistic reads as too corporate |

[VERIFIED: MCP system context — nanobanana tools listed in session init]

### No New npm Dependencies Required
The entire feature can be built with already-installed packages. [VERIFIED: codebase]

---

## Architecture Patterns

### Recommended Component Structure
```
client/src/
├── components/
│   └── DonationModal.tsx     # New: self-contained modal component
├── assets/
│   └── donation-banner.png   # New: generated banner image
└── App.tsx                   # Modified: counter logic + modal open state
```

### Pattern 1: Controlled Modal via useState (recommended)

**What:** App.tsx owns `donationModalOpen` state. The download handler increments a counter, checks the trigger condition, and sets state to open. `DonationModal` receives `opened` and `onClose` as props.

**When to use:** When the open/close trigger lives in a different component than the modal itself (counter logic is in App.tsx download handler).

**Example:**
```typescript
// Source: existing SimpleSettingsModal.tsx pattern, adapted
// In App.tsx:
const [donationModalOpen, setDonationModalOpen] = useState(false);

const checkAndShowDonationModal = () => {
  const count = parseInt(localStorage.getItem('suno-download-count') || '0') + 1;
  localStorage.setItem('suno-download-count', String(count));
  // Trigger on 1st, 5th, 10th, 15th... (1, then every 5th)
  if (count === 1 || (count > 1 && (count - 1) % 5 === 0)) {
    setDonationModalOpen(true);
  }
};

// Call checkAndShowDonationModal() at the TOP of downloadPlaylist(), before async work
```

**Why call before async:** The modal open is non-blocking — it shows while the download proceeds. This is the correct UX pattern (user can dismiss and watch progress simultaneously).

### Pattern 2: Modal Component Structure

```typescript
// Source: SimpleSettingsModal.tsx pattern (OptionsModal pattern in codebase)
import { Modal, Stack, Text, Button, Image } from '@mantine/core';
import bannerImg from '../assets/donation-banner.png';

interface DonationModalProps {
  opened: boolean;
  onClose: () => void;
}

function DonationModal({ opened, onClose }: DonationModalProps) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      centered
      size="md"
      withCloseButton
      // closeOnClickOutside defaults to true in Mantine v6
    >
      <Stack spacing="md" pb="md">
        <Image src={bannerImg} radius="md" />
        <Text size="lg" fw={600} ta="center">Thanks for using Suno Downloader!</Text>
        <Text size="sm" color="dimmed" ta="center">
          If you'd like to help keep it free...
        </Text>
        <Button
          component="a"
          href="https://buymeacoffee.com/focused"
          target="_blank"
          rel="noopener noreferrer"
          fullWidth
          size="md"
        >
          Buy Me a Coffee
        </Button>
      </Stack>
    </Modal>
  );
}
```

[VERIFIED: codebase — SimpleSettingsModal.tsx and OptionsModal.tsx confirm Mantine v6 Modal API usage]

### Trigger Logic — Counter Math

D-01 and D-06 specify: show on 1st download, then every 5th after (1, 5, 10, 15...).

```
count === 1              → show (first download)
count === 5              → show (1 + 4)
count === 10             → show (1 + 4 + 5)
count === 15             → show (1 + 4 + 5 + 5)
```

Formula: `count === 1 || (count > 1 && (count - 1) % 5 === 0)`

Verification:
- count=1 → true (1===1)
- count=5 → (5-1)%5 = 0 → true
- count=6 → (6-1)%5 = 1 → false
- count=10 → (10-1)%5 = 4 → false ← WRONG

Corrected formula: `count === 1 || count % 5 === 0`

Verification:
- count=1 → true
- count=5 → true
- count=10 → true
- count=15 → true
- count=6 → false
- count=4 → false ✓

**Use:** `count === 1 || count % 5 === 0`

### Anti-Patterns to Avoid

- **Incrementing counter after await:** If the download fails or throws, the counter would still increment. Increment before the try/catch so the counter advances on every attempt.
- **Using modals.open() API:** The programmatic `modals.open()` pattern (used in `ContextModal.tsx`) is harder to control for show/hide from parent state. Use `Modal` component with `opened` prop instead.
- **Storing counter in React state:** Counter must survive page refreshes — localStorage only.
- **Not adding `rel="noopener noreferrer"` to BMC link:** External link best practice.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Modal overlay | Custom div portal | Mantine `Modal` | Focus trap, click-outside, a11y — already installed |
| Image import | Dynamic fetch at runtime | Static import (`import bannerImg from '../assets/...'`) | Vite handles the asset hash/path; no runtime URL issues |

---

## Image Generation

### Recommended nanobanana Tool
**Tool:** `nanobanana:photorealistic_shot`

This is the correct tool for a "cozy coffee + music mashup with warm tones" — it generates photorealistic scenes with controllable composition and mood.

### Suggested Prompt Approach

```
Subject: A cozy coffee cup with steam rising, surrounded by vinyl records and 
musical notes floating gently, warm amber lighting, shallow depth of field.

Composition: Horizontal banner format (2:1 ratio), centered subject, warm 
brown/amber/cream color palette.

Style: Warm, inviting, lifestyle photography aesthetic. Soft bokeh background. 
Not corporate — feels personal and handmade.
```

### Image Sizing / Format

- **Format:** PNG (preferred for web, Vite handles it)
- **Recommended dimensions:** 600x300px or similar 2:1 ratio for banner display
- **Placement in modal:** `<Image>` component, full modal width, top of modal body
- **Output path:** `client/src/assets/donation-banner.png`

If the first generation reads as too corporate or cold, fall back to `nanobanana:sticker_flat` for a warmer kawaii/flat-art aesthetic.

**Note from Phase 01 history:** nanobanana MCP was unavailable in one prior session. If unavailable at execution time, use a CSS gradient placeholder (warm amber tones) as fallback and skip the image import. [VERIFIED: STATE.md — "Used fallback accent-colored icon logo — nanobanana MCP unavailable in environment"]

---

## Common Pitfalls

### Pitfall 1: Modal Blocks Download Progress
**What goes wrong:** If the modal opens synchronously before `downloadPlaylist` starts the async fetch, and the user watches the modal instead of dismissing it, the download still runs in background — which is correct. But if the modal is opened AFTER `await downloadPlaylistApi(...)` the user never sees it until download completes.
**Why it happens:** Async await blocks the function execution.
**How to avoid:** Call `checkAndShowDonationModal()` at the very start of `downloadPlaylist`, before the `setIsDownloading(true)` and before any `await`.
**Warning signs:** Modal only appears after the ZIP downloads.

### Pitfall 2: Mantine v6 Modal Styling Conflicts
**What goes wrong:** Mantine v6 Modal uses its own theming context — background colors won't automatically inherit the Monolith CSS variables.
**Why it happens:** Mantine injects its own `--mantine-*` CSS vars, not the project's `--bg-card`, `--text-primary` etc.
**How to avoid:** Use the `styles` prop on `Modal` to explicitly set background and color using CSS variables:
```typescript
styles={{
  content: { backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' },
  header: { backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' },
}}
```
This pattern is already proven in `SimpleSettingsModal.tsx`.
**Warning signs:** Modal appears with wrong background color or white text on white in light mode.

### Pitfall 3: localStorage Key Collision
**What goes wrong:** Using an existing localStorage key name accidentally overwrites a setting.
**Why it happens:** The project already uses `suno-name-template`, `suno-overwrite-files`, `suno-embed-images`.
**How to avoid:** Use a new distinct key: `suno-download-count` (not used anywhere in the codebase). [VERIFIED: codebase grep — no existing `suno-download-count` key]
**Warning signs:** Settings reset unexpectedly.

### Pitfall 4: Vite Asset Import Path
**What goes wrong:** Image 404 in production because of hash-based filenames.
**Why it happens:** Vite renames assets with content hashes at build time. A hardcoded `/assets/banner.png` path breaks.
**How to avoid:** Always import images as ES modules: `import bannerImg from '../assets/donation-banner.png'`. Vite resolves the hashed path correctly.
**Warning signs:** Image shows in dev but breaks in production build.

---

## Code Examples

### localStorage Counter Pattern
```typescript
// Source: existing App.tsx localStorage pattern (suno-name-template etc.)
const checkAndShowDonationModal = () => {
  const current = parseInt(localStorage.getItem('suno-download-count') || '0');
  const next = current + 1;
  localStorage.setItem('suno-download-count', String(next));
  if (next === 1 || next % 5 === 0) {
    setDonationModalOpen(true);
  }
};
```

### Modal with Theme-Aware Styles
```typescript
// Source: SimpleSettingsModal.tsx styles prop pattern
<Modal
  opened={opened}
  onClose={onClose}
  centered
  size="md"
  withCloseButton
  styles={{
    content: { backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' },
    header: { backgroundColor: 'var(--bg-card)', borderBottom: '1px solid var(--border-color)' },
  }}
>
```

### External Link Button Pattern
```typescript
// Source: App.tsx footer links pattern
<Button
  component="a"
  href="https://buymeacoffee.com/focused"
  target="_blank"
  rel="noopener noreferrer"
  fullWidth
>
  Buy Me a Coffee
</Button>
```

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None detected — no test config files in codebase |
| Config file | None |
| Quick run command | Manual browser testing |
| Full suite command | Manual browser testing |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| D-01 | Counter increments and modal triggers on 1, 5, 10 | manual | Open app, click Download ZIP 1x, 4x, 5x | N/A |
| D-04 | Modal dismisses via X and click-outside | manual | Click X; click backdrop | N/A |
| D-05 | Top banner still present alongside modal | manual | Visual check | N/A |
| D-06 | No permanent opt-out — re-appears on count 10 | manual | Reload page, download 5 more times | N/A |

### Wave 0 Gaps
No automated test infrastructure exists or is needed for this phase — all validation is manual browser testing.

---

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | — |
| V3 Session Management | no | — |
| V4 Access Control | no | — |
| V5 Input Validation | no | No user input in this modal |
| V6 Cryptography | no | — |

### Known Threat Patterns

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Open redirect via BMC link | Spoofing | `rel="noopener noreferrer"` on external anchor |

No meaningful attack surface — this is a client-side modal linking to an external URL.

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| nanobanana MCP | Banner image generation | Confirmed in session | — | CSS gradient placeholder (warm amber: `linear-gradient(135deg, #f6d365, #fda085)`) |
| @mantine/core v6 | Modal component | ✓ | 6.0.13 | — |
| Vite | Asset import resolution | ✓ | 4.3.9 | — |
| localStorage | Download counter | ✓ | browser native | sessionStorage (loses count on close — not preferred) |

**Missing dependencies with no fallback:** None.

**Missing dependencies with fallback:**
- nanobanana: if unavailable, CSS gradient banner is a viable placeholder that ships the feature without blocking.

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `Modal` component from `@mantine/core` v6 accepts `styles.content` and `styles.header` keys | Architecture Patterns | Modal background won't match theme — fallback to `style` prop on children |

All other claims verified directly against codebase files.

**If this table is empty:** Only one assumed claim, low risk — proven pattern exists in SimpleSettingsModal.tsx for `styles.header` and `styles.body` (not `content`). Verify: Mantine v6 uses `body` not `content` for the modal body area.

**Correction from codebase verification:**
SimpleSettingsModal.tsx line 83-90 uses:
```
styles={{ header: { ... }, body: { ... } }}
```
So the correct keys are `header` and `body`, not `content`. The code example above should use `body` not `content`. [VERIFIED: SimpleSettingsModal.tsx]

---

## Open Questions

1. **Does the modal fire before or after the download starts?**
   - What we know: The modal should not block the download.
   - Recommendation: Open modal at the start of `downloadPlaylist()`, before the `try/await`. Modal is non-blocking UI — download runs concurrently.

2. **Image dimensions for the banner**
   - What we know: Modal is `size="md"` — ~440px wide with Mantine padding.
   - Recommendation: Generate at 600x300 (2:1), Modal `Image` will fill width naturally.

---

## Sources

### Primary (HIGH confidence)
- `client/src/components/SimpleSettingsModal.tsx` — Mantine v6 Modal API usage, `styles` prop keys verified
- `client/src/components/ContextModal.tsx` — `modals.open()` API pattern (not recommended for this phase)
- `client/src/main.tsx` — ModalsProvider confirmed configured
- `client/src/App.tsx` — download handler, localStorage patterns, existing support banner
- `client/src/index.css` — CSS variable names for theme-aware styling
- `client/src/App.css` — `.support-banner` and `.monolith-card` existing classes
- `client/package.json` — `@mantine/core@^6.0.13` confirmed

### Secondary (MEDIUM confidence)
- MCP system context — nanobanana tool list confirmed in session init

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all libraries verified against actual installed package.json
- Architecture: HIGH — patterns derived from existing codebase, not training assumptions
- Pitfalls: HIGH — based on direct codebase analysis (SimpleSettingsModal styles pattern, Vite asset import confirmed)
- Image generation: MEDIUM — nanobanana availability confirmed in session, but exact prompt output is untested

**Research date:** 2026-04-14
**Valid until:** 2026-05-14 (stable libraries, no moving parts)
