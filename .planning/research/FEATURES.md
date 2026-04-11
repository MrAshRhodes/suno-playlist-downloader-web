# Feature Landscape — Visual Modernization

**Domain:** Premium music/download tool (web, dark-first)
**Researched:** 2026-04-11
**Scope:** Visual features only — no new functional features

---

## Table Stakes

Features users expect from a "premium dark-themed music tool" in 2026. Missing any of these makes the redesign feel incomplete.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Deep dark background (not `#000` or `#1a1a1a`) | Industry standard since Material Design. Pure black and flat dark grey feel cheap/unfinished. | Low | Target: `#0a0e1a` / `#111627`. These specific values are already decided in PROJECT.md |
| CSS variable-driven color system | Enables dual-theme (dark + light) without duplicating every rule. Current codebase uses per-component inline styles — this is the single biggest maintenance problem. | Medium | Requires extracting all inline `theme === 'dark' ? ...` ternaries into CSS variables. Mantine v6 supports scoped CSS vars via `createStyles` |
| Glassmorphism card surfaces | Expected in any music/AI-tool UI post-2023. Frosted glass panels on the URL input section, song table, and download card. | Low-Medium | `backdrop-filter: blur(8-12px)` + `rgba(255,255,255,0.07-0.12)` background. Keep blur ≤12px for performance. Do NOT apply to the entire page, only card-level surfaces |
| Smooth state transitions | Loading state → results state → downloading state must animate smoothly. Current app uses instant renders with no transitions. | Medium | CSS transitions on opacity/transform (300-400ms). Use `@media (prefers-reduced-motion)` fallback |
| Refined typography hierarchy | Current h3/h4 headings are browser-default weight and size. Premium tools use intentional type scale — weight contrast, letter-spacing on labels, lighter secondary text. | Low | No font change needed (system font works). Fix: weight 300 for section labels, 600 for titles, uppercase + tracking for column headers |
| Polished progress bar | Current bar is a flat 4px div. Expected: gradient fill, glow effect on the active end, smooth width transition. | Low | Already has `transition: width 0.3s ease` — needs gradient and glow |
| Icon/logo refinement | Current vinyl icon sits in a flat gradient square. Premium tools use more deliberate logo treatment — subtle glow, better proportions. | Low | Icon stays, surround treatment changes |
| Accessible contrast (WCAG AA) | Users with visual impairments, legal/reputational risk if not met. The Monolith palette is already verified AA. | Low | Design decision already made — just enforce in implementation |
| Hover and focus states on interactive elements | Current buttons have `transition: background-color 0.2s ease` but no glow, lift, or scale on hover. Inputs have no focus ring. | Low | Add box-shadow glow on hover, subtle scale transform (1.01–1.02) on buttons |

---

## Differentiators

Visual elements that make the tool feel distinctly premium — not expected baseline, but immediately noticed.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Audio waveform generative art background | Ties visual identity to the music domain. Ambient, non-distracting. Reinforces purpose of the tool on every page view. | Medium | p5.js with seeded noise (Perlin) for reproducible waveform shape. Draw on a `<canvas>` behind the UI, z-index below cards. Low opacity (0.15–0.25) so it reads as texture not decoration. Runs at ~30fps not 60 to save GPU |
| Ambient color bleed from palette | Subtle radial gradient tints at top/bottom edges of the page using the brand accent color. Creates depth without a full background illustration. | Low | `radial-gradient` from `rgba(26, 82, 226, 0.15)` at corners. One implementation line in CSS |
| Track row micro-animation | Each row in the song table fades/slides in when playlist loads (staggered, 20–30ms delay per row). During download, a shimmer or color-shift on the active row. | Medium | Use CSS `@keyframes` + inline `animation-delay` per row index. Shimmer on the processing row is achievable with a moving gradient overlay |
| Song thumbnail with ring treatment | Current thumbnails are 40x40 with `borderRadius: 3px`. Premium: rounded corners (6–8px), a subtle colored border/ring, and a faint drop shadow. | Low | One-liner CSS change per thumbnail |
| Download button with gradient and glow | CTA button is the highest-value interactive element. Should have gradient background, soft glow on hover, and a brief "pulse" on click/disabled state change. | Low-Medium | Use `box-shadow` with color-matched glow. Brief scale animation on press via `:active { transform: scale(0.98) }` |
| Frosted glass header | The header bar (logo + theme toggle) floating above content with a glass treatment creates visual layering — reinforces premium depth. | Low | `backdrop-filter: blur(10px)` + transparent background on header. Already distinct from body |
| Vignette overlay | A full-screen radial gradient from transparent center to `rgba(0,0,0,0.3)` at edges. Pulls focus to center content. Used in Spotify, Apple Music, every premium music product. | Low | One CSS pseudo-element on body or root container |
| Theme toggle with smooth morph | Current toggle is a raw button with icon swap. Premium: icon morphs (sun/moon transition), or the entire UI does a smooth cross-fade between themes. | Medium | CSS transition on all CSS variables (200ms) gives automatic cross-fade. Swap `transition: background 0.2s, color 0.2s` on `:root` |
| Song count + playlist name display | Once playlist loads, showing the playlist name and song count prominently (above the table) with styled typography feels polished and confirms the operation succeeded visually. | Low | Purely typographic — existing `playlistData.name` wired to a styled display |

---

## Anti-Features

Build none of these. Each one either actively harms the experience or wastes implementation effort.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Particle systems / floating orbs | Visual noise with no music-domain relevance. Distracts from the UI's clear 3-step workflow. Hard to tune to "ambient" rather than "screensaver." | Stick to the waveform: contextually relevant and controllable |
| Animated gradient backgrounds (looping full-page) | GPU-intensive, can cause layout shifts, often triggers motion sickness. Looks trendy for 6 months then dates the app instantly. | Use static radial tints + the waveform canvas instead |
| Parallax scrolling | App is a single-screen linear workflow (URL → results → download). No scroll depth to justify parallax. Just adds jitter and motion sickness risk. | N/A — it's not a marketing page |
| Skeleton loading screens | App only has one async operation (playlist fetch). Adding full skeleton screens (empty rectangles mimicking rows) increases implementation complexity for minimal payoff. The table is already empty until data arrives. | A spinner on the "Get playlist songs" button is sufficient |
| Heavy backdrop-blur everywhere | `backdrop-filter: blur()` on more than 3–4 elements simultaneously degrades GPU performance, especially on lower-end machines. Many Suno users are casual audio enthusiasts, not power-user setups. | Limit blur to: header, song table card, progress section. Three elements maximum |
| Animated counter on download percentage | Incrementing number animations (e.g., 0% → 73% with a tween) feel gimmicky on a utility tool. The progress bar communicates the same thing without demanding attention. | Percentage text can be static; bar animation carries the visual interest |
| Custom scroll bars (heavily styled) | Thin custom scrollbars (`::webkit-scrollbar`) frequently have poor contrast and confuse users unfamiliar with the handle. Song table already has `overflowY: auto`. | Use OS scrollbar or minimal neutral styling only |
| Toast notification redesign | Mantine's notification system already works. Re-styling it risks breaking the behavior. Low ROI visual change that touches a non-visual layer. | Leave notifications as-is; focus effort on primary UI surface |

---

## Feature Dependencies

The order matters for implementation. Downstream features break without upstream ones.

```
CSS variable system → Everything else
  (All glassmorphism, theme transitions, and color changes must be
   driven by variables, not inline ternary expressions)

CSS variable system → Dual-theme quality
  (Light mode upgrade requires variables; inline styles can't be 
   transitioned between themes smoothly)

Background canvas (p5.js waveform) → Glassmorphism cards look correct
  (Glass surfaces are visually inert over a flat dark background; 
   the waveform texture behind them is what makes blur meaningful)

Typography hierarchy → Visual hierarchy reads correctly
  (Progress bar glow and button polish are wasted if heading 
   weight/scale doesn't communicate the 3-step flow)
```

---

## MVP Recommendation

For a milestone targeting visual premium-feel with the highest ROI per implementation hour:

**Build first (highest visual impact, low-medium complexity):**
1. CSS variable extraction — unlocks everything downstream
2. Deep background colors (`#0a0e1a`) + vignette overlay — instant premium feel
3. Glassmorphism on the song table and URL input card
4. Typography hierarchy — weight/spacing corrections
5. Button gradient + glow hover state

**Build second (differentiators that require the above):**
6. p5.js waveform background canvas
7. Track row stagger animation on playlist load
8. Theme cross-fade transition (CSS variable transition)

**Defer to polish pass:**
9. Download row shimmer during active processing
10. Song thumbnail ring treatment
11. Playlist name/count display refinements

---

## Confidence Assessment

| Finding | Confidence | Basis |
|---------|------------|-------|
| Glassmorphism is table stakes for this aesthetic | HIGH | Verified: NNG, Apple Liquid Glass adoption, multiple 2025 music UI showcases |
| backdrop-blur ≤12px for performance | HIGH | Multiple official sources (MDN-adjacent, NNG, AxessLab) agree on this threshold |
| Particle systems as anti-feature | MEDIUM | Pattern observed across premium utility tools; not a published standard |
| p5.js Perlin noise waveform approach | HIGH | Official p5.js docs + codeburst tutorial confirm this is the canonical approach for ambient music visualization |
| CSS variable extraction as prerequisite | HIGH | Direct analysis of current App.tsx inline style pattern; architectural conclusion, not a web claim |
| Stagger animation on table rows | MEDIUM | Common pattern in Framer Motion and CSS-tricks examples; specific ms values are tuned by convention |

---

## Sources

- [Glassmorphism: Definition and Best Practices — NNG](https://www.nngroup.com/articles/glassmorphism/)
- [Glassmorphism Meets Accessibility — Axess Lab](https://axesslab.com/glassmorphism-meets-accessibility-can-frosted-glass-be-inclusive/)
- [Glassmorphism Design Trend: Implementation Guide 2025](https://playground.halfaccessible.com/blog/glassmorphism-design-trend-implementation-guide)
- [P5.js Tutorial: Make a Music Visualization — Codeburst](https://codeburst.io/p5-js-tutorial-for-beginners-make-a-music-visualization-bb747c4cd402)
- [Dark Mode UI Patterns and Best Practices 2025 — UI Deploy](https://ui-deploy.com/blog/complete-dark-mode-design-guide-ui-patterns-and-implementation-best-practices-2025)
- [Mantine v6 Dark Theme Guide](https://v6.mantine.dev/guides/dark-theme/)
- [Design Trends 2025: Glassmorphism, Neumorphism — Contra](https://contra.com/p/PYkeMOc7-design-trends-2025-glassmorphism-neumorphism-and-styles-you-need-to-know)
