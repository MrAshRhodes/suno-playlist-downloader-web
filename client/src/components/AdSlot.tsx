/**
 * AdSlot — Adsterra banner integration (Phase 10 ADM-02).
 *
 * Source: research §6 (.planning/research/ad-networks-vs-adsense.md) — verbatim.
 *
 * SINGLE-INSTANCE COMPONENT WARNING:
 *   `window.atOptions` is a global. Mounting two <AdSlot /> instances on the
 *   same page causes the second mount's atOptions to overwrite the first's,
 *   so only one ad will render (or both will render with the second's config).
 *   This phase ships exactly one slot above the footer; this is fine.
 *
 *   If a future phase ever needs multiple slots (e.g., mobile 300x250 variant),
 *   refactor to the <iframe srcDoc> isolation pattern documented at
 *   https://joshwp.com/how-to-implement-adsterra-ads-in-react-js-next-js-projects/
 *   — DO NOT just duplicate this component.
 *
 * CLS contract:
 *   The wrapper div reserves `minHeight: height` BEFORE the iframe paints.
 *   This is the only mechanism keeping CLS < 0.1 (Lighthouse mobile).
 *   Do not remove the inline `minHeight` style.
 *
 * Empty-key behavior:
 *   If `adKey` is falsy (env var unset, e.g., contributor without Adsterra
 *   credentials), the wrapper renders silently with no script injection.
 *   Layout space is still reserved. No error, no console.warn — graceful
 *   degradation per Phase 4 D-09 + research §7.
 *
 *   Q4 resolved (RESEARCH.md §Open Questions): silent failure preferred
 *   over console.warn — Phase 4 D-09 + research §7 graceful degradation.
 *   This explicitly OVERRIDES the original §13 recommendation to add a
 *   console.warn once per mount.
 */
import { useEffect, useRef } from 'react';

interface AdSlotProps {
  adKey: string;
  width: number;
  height: number;
  className?: string;
}

function AdSlot({ adKey, width, height, className }: AdSlotProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Q4 resolved: silent failure preferred over console.warn —
    // Phase 4 D-09 + research §7 graceful degradation.
    if (!ref.current || !adKey) return;

    // Per-unit Adsterra global — set BEFORE invoke.js loads
    (window as unknown as { atOptions: unknown }).atOptions = {
      key: adKey,
      format: 'iframe',
      height,
      width,
      params: {},
    };

    const s = document.createElement('script');
    s.src = `//www.highperformanceformat.com/${adKey}/invoke.js`;
    s.async = true;
    ref.current.appendChild(s);

    // No cleanup return: invoke.js mutates the wrapper's children directly
    // (creates the ad iframe). React's normal unmount removes the wrapper
    // and its descendants. Removing the script tag manually is unnecessary
    // because the iframe it spawned has already fully loaded.
  }, [adKey, height, width]);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        minHeight: height,
        width,
        margin: '32px auto',
        padding: 16,
        border: '1px solid var(--border-color)',
        borderRadius: 12,
        background: 'transparent',
      }}
      aria-label="Advertisement"
      role="complementary"
    />
  );
}

export default AdSlot;
