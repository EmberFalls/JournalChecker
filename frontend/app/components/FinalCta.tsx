"use client";

export default function FinalCta() {
  return (
    <section className="final-cta-section" aria-label="Call to Action">
      <div className="container">
        <h2>Start Verifying Scholarly Channels with Confidence</h2>
        <p>
          Assess published journal claims with conservative risk scoring, transparent citations, and multi-registry corroboration.
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "12px" }}>
          <a
            href="#hero-search"
            className="btn-primary-pill"
            style={{ padding: "12px 28px", fontSize: "15px" }}
          >
            <span>Verify a Journal Now</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>
          <a
            href="http://localhost:8100/docs"
            target="_blank"
            rel="noreferrer"
            className="btn-ghost-pill"
            style={{ padding: "12px 24px", fontSize: "15px", background: "rgba(255, 255, 255, 0.1)", color: "#ffffff", borderColor: "rgba(255, 255, 255, 0.2)" }}
          >
            Explore API Documentation ↗
          </a>
        </div>
      </div>
    </section>
  );
}
