"use client";

export default function TrustQuote() {
  return (
    <section className="section-padding" style={{ background: "linear-gradient(180deg, #ffffff 0%, var(--brand-50) 100%)", borderTop: "1px solid var(--border-subtle)", borderBottom: "1px solid var(--border-subtle)" }} aria-label="Academic Trust Statement">
      <div className="container" style={{ maxWidth: "860px", textAlign: "center" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "#ffffff", padding: "6px 14px", borderRadius: "9999px", border: "1px solid var(--brand-200)", fontSize: "12.5px", fontWeight: 700, color: "var(--brand-primary)", marginBottom: "24px" }}>
          <span>FOUNDING PRINCIPLE</span>
        </div>

        <blockquote style={{ fontSize: "clamp(20px, 2.2vw, 30px)", fontWeight: 700, lineHeight: 1.4, color: "var(--text-headline)", marginBottom: "28px", letterSpacing: "-0.015em" }}>
          “Binary blacklists often harm legitimate journals from emerging research regions. An evidence-first platform provides the full traceable record so researchers make informed, fair decisions.”
        </blockquote>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
          <strong style={{ fontSize: "15px", color: "var(--text-headline)" }}>
            Academic Integrity & Open Scholarship Advisory
          </strong>
          <span style={{ fontSize: "13.5px", color: "var(--text-muted)" }}>
            Based on COPE, Think. Check. Submit., and DOAJ transparency guidelines
          </span>
        </div>
      </div>
    </section>
  );
}
