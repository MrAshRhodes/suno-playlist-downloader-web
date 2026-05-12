# Phase 13: @Username Input UX - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-12
**Phase:** 13-username-input-ux
**Areas discussed:** Wording / copy, Helper text, INP-03 routing

---

## Wording / Copy

### Placeholder

| Option | Description | Selected |
|--------|-------------|----------|
| Playlist URL or @username | Short, fits inline, covers both formats | ✓ |
| https://suno.com/playlist/... or @username | Explicit but long — truncates on narrow screens | |
| You decide | Claude picks the shortest clear option | |

**User's choice:** "Playlist URL or @username"

### Step Heading

| Option | Description | Selected |
|--------|-------------|----------|
| Paste playlist link or @username | Extends current heading, consistent with placeholder | ✓ |
| Paste link or @username | Shorter | |
| Leave as-is | Helper text covers the discovery gap | |

**User's choice:** "Paste playlist link or @username"

---

## Helper Text

### Content

| Option | Description | Selected |
|--------|-------------|----------|
| Accepts playlist URLs and @username handles | One sentence, covers both formats, neutral tone | ✓ |
| Two-line format list | e.g. • https://suno.com/playlist/... • @username or https://suno.com/@username | |
| You decide | Claude picks clean one-liner | |

**User's choice:** "Accepts playlist URLs and @username handles"

### Placement

| Option | Description | Selected |
|--------|-------------|----------|
| Below input, small muted text | Standard pattern — gray, 12px, sits under the field | ✓ |
| Inline tooltip on the input | Info icon, shows on hover — harder to discover | |
| You decide | Use whatever fits existing input markup | |

**User's choice:** Below input, small muted text

---

## INP-03 Routing

| Option | Description | Selected |
|--------|-------------|----------|
| Suno.ts — add branch in getSongsFromPlayList | Before playlist regex; logic stays in service layer | ✓ |
| App.tsx — normalize at input time | Strip URL to bare @username on paste/submit | |

**User's choice:** Suno.ts branch

---

## Deferred Ideas

None — discussion stayed within phase scope.
