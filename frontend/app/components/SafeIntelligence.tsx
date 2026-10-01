"use client";

export default function SafeIntelligence() {
  const safeguards = [
    {
      title: "Zero Private Network Access (SSRF Protection)",
      desc: "The sandbox strictly forbids internal, localhost, link-local, and reserved IP ranges. Every redirection is re-validated at DNS level before HTTP fetch.",
      icon: "🛡️",
    },
    {
      title: "Content-Type & Response Size Limits",
      desc: "Crawls process standard public HTML only, bounded to safe document depths and max sizes to prevent resource exhaustion.",
      icon: "⚡",
    },
    {
      title: "Absence Never Treated as Misconduct",
      desc: "A crawler timeout, connection drop, or missing web statement is recorded as UNVERIFIED or NOT OBSERVED — never as an adverse finding.",
      icon: "⚖️",
    },
  ];

  return (
    <section className="section-padding" id="safe-crawling" style={{ background: "#ffffff" }} aria-label="Safe Intelligence and Crawling">
      <div className="container">
        <div style={{ textAlign: "center", maxWidth: "720px", margin: "0 auto 48px auto" }}>
          <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--brand-primary)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            Security & Integrity Guardrails
          </span>
          <h2 style={{ fontSize: "clamp(28px, 3.5vw, 42px)", marginTop: "8px", marginBottom: "16px" }}>
            Safe Intelligence. Verified Claims.
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "16px" }}>
            Our web crawler operates inside a hardened sandbox designed specifically for academic verification without scraping violations or risk of false allegations.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px" }}>
          {safeguards.map((item, i) => (
            <div
              key={i}
              style={{
                background: "var(--bg-canvas-subtle)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "16px",
                padding: "28px",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              <span style={{ fontSize: "28px" }} aria-hidden="true">{item.icon}</span>
              <h3 style={{ fontSize: "17px", color: "var(--text-headline)" }}>{item.title}</h3>
              <p style={{ fontSize: "14px", color: "var(--text-body)", lineHeight: 1.6 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
