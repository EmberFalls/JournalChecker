"use client";

import { useEffect, useRef, useState } from "react";

export default function HelpDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      {/* Floating Info / Shield Trigger Button */}
      <button
        type="button"
        className="floating-help-btn"
        aria-label="Open Methodology & Help Guide"
        onClick={() => setIsOpen(true)}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
      </button>

      {/* Slide-out Drawer Overlay */}
      {isOpen && (
        <div
          className="help-drawer-overlay"
          ref={drawerRef}
          onClick={(e) => {
            if (e.target === drawerRef.current) setIsOpen(false);
          }}
        >
          <div className="help-drawer" role="dialog" aria-modal="true" aria-label="Methodology & Help Guide">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "20px" }}>🛡️</span>
                <h3 style={{ fontSize: "17px", color: "var(--text-headline)" }}>Methodology Guide</h3>
              </div>
              <button
                type="button"
                className="btn-ghost-pill"
                style={{ padding: "6px 12px" }}
                onClick={() => setIsOpen(false)}
                aria-label="Close help guide"
              >
                ✕
              </button>
            </div>

            {/* Guide Sections */}
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div>
                <h4 style={{ fontSize: "14px", color: "var(--brand-primary)", marginBottom: "4px" }}>
                  1. The "Absence ≠ Misconduct" Principle
                </h4>
                <p style={{ fontSize: "13.5px", color: "var(--text-body)", lineHeight: 1.55 }}>
                  Missing a record in DOAJ or Scopus does not imply a journal is predatory. Many legitimate niche, local-language, or newly launched journals have not yet applied or completed indexing review.
                </p>
              </div>

              <div>
                <h4 style={{ fontSize: "14px", color: "var(--brand-primary)", marginBottom: "4px" }}>
                  2. ISSN Checksum Calculation
                </h4>
                <p style={{ fontSize: "13.5px", color: "var(--text-body)", lineHeight: 1.55 }}>
                  An ISSN is an 8-digit code (e.g. 1932-6203). The final digit is a modulus-11 check digit based on descending positional multipliers. If an ISSN fails checksum, it indicates a typographical error.
                </p>
              </div>

              <div>
                <h4 style={{ fontSize: "14px", color: "var(--brand-primary)", marginBottom: "4px" }}>
                  3. The 7 Assessment Dimensions
                </h4>
                <ul style={{ paddingLeft: "16px", fontSize: "13px", color: "var(--text-body)", display: "flex", flexDirection: "column", gap: "6px" }}>
                  <li><strong>Identity Integrity:</strong> Independent publisher and title corroboration.</li>
                  <li><strong>Indexing Authenticity:</strong> Active vs discontinued database listings.</li>
                  <li><strong>Claim Consistency:</strong> Website claims vs registry observations.</li>
                  <li><strong>Publishing Transparency:</strong> Peer-review, ethics, and APC policies.</li>
                  <li><strong>Editorial Transparency:</strong> Editorial board members & affiliations.</li>
                  <li><strong>Website Domain Identity:</strong> Authentic domain vs hijacked clone URLs.</li>
                  <li><strong>Source List Flags:</strong> Source-specific warnings (e.g. DGRSDT 2025).</li>
                </ul>
              </div>

              <div>
                <h4 style={{ fontSize: "14px", color: "var(--brand-primary)", marginBottom: "4px" }}>
                  4. Safe Crawler Sandbox
                </h4>
                <p style={{ fontSize: "13.5px", color: "var(--text-body)", lineHeight: 1.55 }}>
                  The crawler strictly enforces SSRF protection, rejecting internal/private IPs and processing only public HTML documents with timeout limits.
                </p>
              </div>
            </div>

            <div style={{ marginTop: "auto", paddingTop: "16px", borderTop: "1px solid var(--border-subtle)" }}>
              <button
                type="button"
                className="btn-primary-pill"
                style={{ width: "100%", justifyContent: "center" }}
                onClick={() => setIsOpen(false)}
              >
                Got It, Return to Platform
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
