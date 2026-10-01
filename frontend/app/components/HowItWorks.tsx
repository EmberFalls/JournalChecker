"use client";

export default function HowItWorks() {
  const steps = [
    {
      step: "01",
      tag: "Resolution",
      title: "Normalize & Validate Identifiers",
      desc: "Input ISSN, DOI, title, or domain. The engine validates check-digits and canonicalizes identity before querying.",
      detail: "Prevents duplicate or mismatched candidate records.",
    },
    {
      step: "02",
      tag: "Aggregations",
      title: "Query Authoritative Registries",
      desc: "Parallel lookup across DOAJ, Scopus Serial Titles, Web of Science, Crossref metadata, and SCImago ranks.",
      detail: "Historical coverage preserved; missing data never penalized.",
    },
    {
      step: "03",
      tag: "Auditing",
      title: "Safe Policy & Claim Extraction",
      desc: "The sandbox crawler parses public journal pages to extract peer-review policies, APC fee statements, and ethics declarations.",
      detail: "Re-validates redirects against SSRF attacks.",
    },
    {
      step: "04",
      tag: "Verification",
      title: "Cross-Reference Claims vs. Facts",
      desc: "Compares stated indexing claims on the journal website against authorized database listings.",
      detail: "Explicitly flags verified corroborations vs. contradictions.",
    },
    {
      step: "05",
      tag: "Scoring",
      title: "Synthesize 7-Dimension Scorecard",
      desc: "Calculates conservative risk labels, confidence percentages, and check coverage meters with traceable citations.",
      detail: "Outputs human-readable rationale without automated legal conclusions.",
    },
  ];

  return (
    <section className="section-padding" id="how-it-works" aria-label="How Journal Integrity Works">
      <div className="container">
        <div style={{ textAlign: "center", maxWidth: "720px", margin: "0 auto 16px auto" }}>
          <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--brand-primary)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            The 5-Step Pipeline
          </span>
          <h2 style={{ fontSize: "clamp(28px, 3.5vw, 42px)", marginTop: "8px", marginBottom: "16px" }}>
            How Journal Verification Works
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "16px" }}>
            From raw identifier input to multi-registry corroboration and conservative risk synthesis.
          </p>
        </div>

        <div className="steps-grid">
          {steps.map((s) => (
            <div key={s.step} className="step-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span className="step-tag">{s.tag}</span>
                <span style={{ fontSize: "20px", fontWeight: 800, color: "var(--brand-primary)", opacity: 0.5, fontFamily: "monospace" }}>
                  {s.step}
                </span>
              </div>
              <h3 style={{ fontSize: "18px", color: "var(--text-headline)" }}>{s.title}</h3>
              <p style={{ fontSize: "14px", color: "var(--text-body)", lineHeight: 1.55 }}>{s.desc}</p>
              <div style={{ marginTop: "auto", paddingTop: "12px", borderTop: "1px solid var(--border-subtle)", fontSize: "12.5px", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "6px" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
                {s.detail}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
