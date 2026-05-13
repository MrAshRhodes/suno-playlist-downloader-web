# Phase 17: Batch Downloads + Archiver Migration - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-13
**Phase:** 17-batch-downloads-archiver-migration
**Areas discussed:** BATCH_SIZE delivery, Batch download UX, Batch error handling

---

## BATCH_SIZE Delivery

| Option | Description | Selected |
|--------|-------------|----------|
| VITE_BATCH_SIZE env var | Set at Vite build time. Changing requires rebuild/redeploy but no code change. Consistent with NODE_ENV pattern. | ✓ |
| Fetch from /api/settings | Server reads process.env.BATCH_SIZE and exposes it. No rebuild needed. | |
| Hardcode 50 in client | Client always uses 50; server uses its own env var separately. | |

**User's choice:** VITE_BATCH_SIZE env var
**Notes:** Consistent with existing Vite env var usage pattern in this project.

---

## Batch Download UX

### Button label during batches

| Option | Description | Selected |
|--------|-------------|----------|
| Batch label update | Button shows "Downloading batch 1 of 3…" and updates per batch. | ✓ |
| No change | Button stays disabled with spinner; multiple browser downloads fire. | |
| Claude's discretion | No preference. | |

**User's choice:** Batch label update ("Downloading batch N of M…")

### Song table row status during batching

| Option | Description | Selected |
|--------|-------------|----------|
| All selected rows → Processing immediately | All flip to Processing at download start. Simpler. | ✓ |
| Batch 2+ rows stay None until batch starts | Only active batch rows show Processing. | |
| Claude's discretion | No preference. | |

**User's choice:** All selected rows show Processing immediately

---

## Batch Error Handling

### On batch failure

| Option | Description | Selected |
|--------|-------------|----------|
| Stop all — show error | First failure aborts. showError() with specific batch number. | ✓ |
| Continue — attempt remaining | Log failure, proceed. Partial results. | |
| Claude's discretion | No preference. | |

**User's choice:** Stop all on first failure

### Error message specificity

| Option | Description | Selected |
|--------|-------------|----------|
| Name the batch | "Failed to download batch 2 of 3" | ✓ |
| Generic message | "Failed to download playlist" | |
| Claude's discretion | No preference. | |

**User's choice:** Name the specific batch in the error message

---

## Claude's Discretion

- Server-side streaming implementation details (archiver pipe setup, cleanup)
- Exact SSE event payload shape (constrained by existing App.tsx SSE handler: `data.progress`, `data.completedItem`)
- Temp directory cleanup timing post-archiver migration

## Deferred Ideas

None — discussion stayed within phase scope.
