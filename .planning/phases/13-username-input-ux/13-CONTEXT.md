# Phase 13: @Username Input UX - Context

**Gathered:** 2026-05-12
**Status:** Ready for planning

<domain>
## Phase Boundary

Improve @username input discovery and correctness. Three self-contained changes: update placeholder text, add helper text below the input, and add a Suno.ts regex branch so full `https://suno.com/@username` URLs are routed to `getSongsFromUser`. No backend changes. Touches `client/src/App.tsx` and `client/src/services/Suno.ts` only.

</domain>

<decisions>
## Implementation Decisions

### Wording / Copy
- **D-01:** Placeholder: `"Playlist URL or @username"` — short, fits inline, covers both formats.
- **D-02:** Step heading: `"Paste playlist link or @username"` — extends existing heading, consistent with placeholder.

### Helper Text
- **D-03:** Content: `"Accepts playlist URLs and @username handles"` — one sentence, neutral tone, covers both formats.
- **D-04:** Placement: below the input field, small muted text (`color: var(--text-secondary)`, `font-size: 12px`). Rendered as a `<small>` or `<div>` immediately under the input element inside the step card's flex container.

### INP-03 Full URL Routing
- **D-05:** Add regex branch in `Suno.ts` `getSongsFromPlayList`, before the playlist regex. Pattern: `if (url.match(/suno\.com\/@/)) return this.getSongsFromUser(url);`. Logic stays in the service layer — App.tsx untouched for this requirement.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements
- `.planning/REQUIREMENTS.md` §INP-01, INP-02, INP-03 — all 3 input UX requirements, locked

### Source Files to Modify
- `client/src/App.tsx` — input field placeholder, step heading, helper text (INP-01, INP-02)
- `client/src/services/Suno.ts` — `getSongsFromPlayList` routing logic (INP-03)

### Codebase Maps
- `.planning/codebase/ARCHITECTURE.md` — layer overview
- `.planning/codebase/CONVENTIONS.md` — code style, naming, patterns

</canonical_refs>

<code_context>
## Existing Code Insights

### Input Field Location
- `client/src/App.tsx:206-215` — native `<input type="text">` inside a `.step-card.monolith-card` div. Currently has `placeholder="https://suno.com/playlist/..."`. Wrapped in a flex div alongside the "Get playlist songs" button.
- Step heading at `App.tsx:~203`: `<h3 className="section-heading">Paste playlist link</h3>`

### Suno.ts Routing (current)
- `client/src/services/Suno.ts:40-42` — existing branch: `if (url.startsWith('@') || (!url.includes('http') && ...))` → `getSongsFromUser`. Handles bare `@username` but NOT `https://suno.com/@username`.
- `client/src/services/Suno.ts:46-53` — playlist regex: `/suno\.com\/playlist\/(.*)/`. Full suno.com/@username URL falls through here and throws "Invalid URL or no playlist ID found".

### Helper Text Pattern
- App uses `var(--text-secondary)` for muted text throughout. Existing examples in footer. No Mantine `TextInput` wrapper — it's a plain `<input>`, so helper text must be a separate element (e.g. `<div>` or `<small>`).

### Integration Points
- INP-03 fix: insert before the playlist regex in `getSongsFromPlayList`. New check order: (1) bare `@username` or non-URL string, (2) `suno.com/@` full URL → both → `getSongsFromUser`; (3) playlist regex; (4) throw.

</code_context>

<specifics>
## Specific Ideas

- Test profile for INP-03 UAT: `https://suno.com/@focusedbeats` (per REQUIREMENTS.md implementation note)

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 13-username-input-ux*
*Context gathered: 2026-05-12*
