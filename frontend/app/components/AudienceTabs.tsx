"use client";

import { useState } from "react";

export default function AudienceTabs() {
  const [activeAudience, setActiveAudience] = useState<"researchers" | "librarians" | "editors" | "institutions">("researchers");

  const audiences = {
    researchers: {
      title: "For Researchers & Authors",
      pitch: "Submit your manuscript with confidence. Verify journal legitimacy and indexation claims before submitting.",
      features: [
        "Check ISSN check-digits and DOAJ listing status instantly.",
        "Detect hijacked or clone websites posing as legitimate journals.",
        "Verify peer-review policies and APC fee statements without blind blacklists.",
      ],
      stat: "100% Traceable Citations",
      badge: "Author Protection",
    },
    librarians: {
      title: "For Academic Librarians",
      pitch: "Equip faculty and students with transparent, evidence-based journal assessment tools.",
      features: [
        "Audit institutional journal recommendations against Scopus & Web of Science.",
        "Educate authors on the difference between absent data and predatory behavior.",
        "Maintain clean local datasets with DOAJ and SCImago CSV imports.",
      ],
      stat: "6 Connected Registries",
      badge: "Library Intelligence",
    },
    editors: {
      title: "For Journal Editors & Publishers",
      pitch: "Demonstrate transparency and protect your journal's scholarly identity from counterfeit domains.",
      features: [
        "Verify that published indexing claims accurately mirror database records.",
        "Detect domain identity conflicts and unauthorized mirror sites.",
        "Showcase verified DOAJ open-access seals and Scopus active coverage.",
      ],
      stat: "7 Audit Dimensions",
      badge: "Publisher Trust",
    },
    institutions: {
      title: "For Universities & Funders",
      pitch: "Automate publication compliance and assess faculty output against accredited publication channels.",
      features: [
        "Integrate verification into research evaluation workflows via REST API.",
        "Enforce source-specific list checks (e.g. DGRSDT 2025 listings).",
        "Auditable and reproducible assessments for grant reporting.",
      ],
      stat: "Stateless REST API",
      badge: "Institutional Compliance",
    },
  };

  const current = audiences[activeAudience];

  return (
    <section className="section-padding" id="audiences" style={{ background: "var(--bg-canvas-subtle)" }} aria-label="Use Cases for Academic Audiences">
      <div className="container">
        <div style={{ textAlign: "center", maxWidth: "720px", margin: "0 auto 16px auto" }}>
          <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--brand-primary)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            Tailored For Academic Workflows
          </span>
          <h2 style={{ fontSize: "clamp(28px, 3.5vw, 42px)", marginTop: "8px", marginBottom: "16px" }}>
            Built for Every Stakeholder in Scholarly Publishing
          </h2>
        </div>

        <div className="audience-tabs-wrapper">
          {/* Audience Nav Buttons */}
          <div className="audience-nav" role="tablist" aria-label="Audience use cases">
            {(["researchers", "librarians", "editors", "institutions"] as const).map((key) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={activeAudience === key}
                className="audience-tab-btn"
                onClick={() => setActiveAudience(key)}
              >
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </button>
            ))}
          </div>

          {/* Active Tab Content */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "36px", alignItems: "center" }}>
            <div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "var(--brand-50)", color: "var(--brand-primary)", padding: "4px 12px", borderRadius: "9999px", fontSize: "12.5px", fontWeight: 700, marginBottom: "16px" }}>
                {current.badge}
              </div>
              <h3 style={{ fontSize: "24px", color: "var(--text-headline)", marginBottom: "12px" }}>
                {current.title}
              </h3>
              <p style={{ fontSize: "15px", color: "var(--text-muted)", lineHeight: 1.6, marginBottom: "20px" }}>
                {current.pitch}
              </p>

              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "12px", marginBottom: "24px" }}>
                {current.features.map((feat, i) => (
                  <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: "10px", fontSize: "14px", color: "var(--text-body)" }}>
                    <div style={{ width: "20px", height: "20px", borderRadius: "50%", background: "var(--status-verified-bg)", color: "var(--status-verified)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: "2px" }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>

              <a href="#hero-search" style={{ fontSize: "14px", fontWeight: 600, color: "var(--brand-primary)", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                Start verifying now
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </a>
            </div>

            {/* Media Panel with Stat Badge */}
            <div style={{ position: "relative", background: "linear-gradient(135deg, #090e1a 0%, #1e293b 100%)", borderRadius: "20px", padding: "36px", color: "#ffffff", minHeight: "260px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "12px", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700 }}>
                  Verification Standard
                </span>
                <span style={{ background: "rgba(33, 66, 231, 0.4)", border: "1px solid rgba(255,255,255,0.2)", padding: "4px 10px", borderRadius: "9999px", fontSize: "12px", fontWeight: 700, color: "#93c5fd" }}>
                  {current.stat}
                </span>
              </div>

              <div style={{ margin: "24px 0" }}>
                <p style={{ fontSize: "18px", fontWeight: 600, lineHeight: 1.4, color: "#f8fafc" }}>
                  “Evidence-first verification removes uncertainty and provides the traceable backing researchers need.”
                </p>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "13px", color: "#cbd5e1" }}>
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#10b981" }} />
                <span>Audited against DOAJ, Scopus & Web of Science APIs</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
