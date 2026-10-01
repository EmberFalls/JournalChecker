"use client";

export default function LogoMarquee() {
  const authorities = [
    {
      name: "DOAJ",
      desc: "Directory of Open Access Journals",
      tag: "Public Index",
    },
    {
      name: "Scopus",
      desc: "Elsevier Serial Titles & Coverage",
      tag: "Source List",
    },
    {
      name: "Web of Science",
      desc: "Clarivate Starter Journal API",
      tag: "Starter Registry",
    },
    {
      name: "Crossref",
      desc: "DOI Registration Agency",
      tag: "Metadata Registry",
    },
    {
      name: "SCImago",
      desc: "Journal & Country Rank (SJR)",
      tag: "Metrics Import",
    },
    {
      name: "DGRSDT",
      desc: "Algerian Research Directorate",
      tag: "Warning List",
    },
  ];

  // Duplicate list for seamless infinite marquee loop
  const duplicatedList = [...authorities, ...authorities];

  return (
    <section className="marquee-section" id="marquee" aria-label="Official Data Sources Marquee">
      <div className="container">
        <div className="marquee-header">
          <span className="marquee-badge">6 Data Sources</span>
          <span>Cross-referenced against verified scholarly registries & datasets</span>
        </div>
      </div>

      <div className="marquee-track-wrapper">
        <div className="marquee-track" role="region" aria-label="Scrolling authorities">
          {duplicatedList.map((auth, index) => (
            <div key={`${auth.name}-${index}`} className="authority-item">
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "8px",
                  background: "#ffffff",
                  border: "1px solid #e2e8f0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 800,
                  fontSize: "12px",
                  color: "var(--brand-primary)",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                }}
              >
                {auth.name.slice(0, 3)}
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span className="authority-name">{auth.name}</span>
                  <span style={{ fontSize: "11px", color: "var(--brand-primary)", background: "var(--brand-50)", padding: "1px 6px", borderRadius: "4px", fontWeight: 600 }}>
                    {auth.tag}
                  </span>
                </div>
                <div className="authority-meta">{auth.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
