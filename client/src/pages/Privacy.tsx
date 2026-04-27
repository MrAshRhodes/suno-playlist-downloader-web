/**
 * Privacy — Iubenda standard-embedding privacy policy page (Phase 10 ADM-06).
 *
 * Mounted ONLY on path `/privacy` via App.tsx's path-conditional route guard
 * (Wave 2 plan 06). Iubenda's loader script lives in this component's useEffect
 * — NOT in <head> — so cookies/tracking only run on this route.
 *
 * Source: research §6 + Pattern 4 (.planning/research/ad-networks-vs-adsense.md).
 * Iubenda standard embedding pattern verified at iubenda.com/en/help/216.
 */
import { useEffect } from 'react';

// TODO ADM-06: substitute real Iubenda numeric policy ID before deploy
// Wave 0 (plan 10-01) is deferred — IUBENDA_POLICY_ID not yet provisioned.
// Pre-deploy gate (plan 10-06) will block deploy until {IUBENDA_POLICY_ID}
// placeholder is replaced with the real numeric ID.
const IUBENDA_POLICY_URL = 'https://www.iubenda.com/privacy-policy/{IUBENDA_POLICY_ID}';

function Privacy() {
  useEffect(() => {
    // Iubenda standard embedding: append cdn.iubenda.com/iubenda.js once.
    // The anchor below has the iubenda-* classes which the script
    // transforms into the rendered policy HTML.
    const existing = document.querySelector(
      'script[src="https://cdn.iubenda.com/iubenda.js"]'
    );
    if (existing) return;
    const s = document.createElement('script');
    s.src = 'https://cdn.iubenda.com/iubenda.js';
    s.async = true;
    document.body.appendChild(s);
  }, []);

  return (
    <div className="app-wrapper" style={{ paddingTop: 48 }}>
      <a
        href="/"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          color: 'var(--accent)',
          textDecoration: 'none',
          fontSize: 13,
          marginBottom: 16,
          transition: 'opacity 0.2s ease',
        }}
      >
        ← Back to downloader
      </a>
      <h1 className="section-heading">Privacy Policy</h1>
      <div
        className="monolith-card"
        style={{ padding: 24, minHeight: 400 }}
      >
        <a
          href={IUBENDA_POLICY_URL}
          className="iubenda-white iubenda-noiframe iubenda-embed iubenda-noiframe"
          title="Privacy Policy"
        >
          Privacy Policy
        </a>
      </div>
    </div>
  );
}

export default Privacy;
