"use client";

export default function ImpactNumbers() {
  const metrics = [
    {
      num: "6",
      label: "Official Registries",
      desc: "Cross-checked in parallel across DOAJ, Scopus, Web of Science & Crossref.",
    },
    {
      num: "7",
      label: "Audit Dimensions",
      desc: "Comprehensive evaluation from domain integrity to ethics and APC transparency.",
    },
    {
      num: "100%",
      label: "Traceable Evidence",
      desc: "Every assessment links directly back to original public datasets or API responses.",
    },
    {
      num: "0",
      label: "Blacklist Guesswork",
      desc: "Conservative scoring where absent rows never convert into negative findings.",
    },
  ];

  return (
    <section className="section-padding" id="dimensions" style={{ background: "var(--bg-canvas-subtle)" }} aria-label="Key Impact Metrics">
      <div className="container">
        <div style={{ textAlign: "center", maxWidth: "720px", margin: "0 auto 16px auto" }}>
          <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--brand-primary)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            By The Numbers
          </span>
          <h2 style={{ fontSize: "clamp(28px, 3.5vw, 42px)", marginTop: "8px", marginBottom: "16px" }}>
            Evidence-Backed Risk Scores
          </h2>
        </div>

        <div className="impact-grid">
          {metrics.map((m, i) => (
            <div key={i} className="impact-card">
              <div className="impact-big-num">{m.num}</div>
              <h3 style={{ fontSize: "16px", color: "var(--text-headline)", marginBottom: "6px" }}>{m.label}</h3>
              <p style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.5 }}>{m.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
