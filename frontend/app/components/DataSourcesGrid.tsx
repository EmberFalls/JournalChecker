"use client";

export default function DataSourcesGrid() {
  const sources = [
    {
      name: "DOAJ Public Dataset",
      type: "Open Access Directory",
      queryMethod: "Local CSV Importer",
      desc: "Comprehensive public registry of peer-reviewed, open-access journals. Confirms editorial boards, licenses, and APC fee declarations.",
      authority: "DOAJ Foundation",
    },
    {
      name: "Scopus Serial Titles",
      type: "Indexing Database",
      queryMethod: "Serial Title API & XLSX",
      desc: "Elsevier's curated abstract and citation database. Confirms active/discontinued indexing status and historical coverage dates.",
      authority: "Elsevier B.V.",
    },
    {
      name: "Web of Science",
      type: "Citation Registry",
      queryMethod: "Starter Journal API",
      desc: "Clarivate citation index verifying journal ISSN registration, publisher identities, and core collection statuses.",
      authority: "Clarivate Analytics",
    },
    {
      name: "Crossref Metadata",
      type: "DOI Registration",
      queryMethod: "Public REST API",
      desc: "Authoritative DOI registration agency for scholarly publications, validating digital persistence and publication volume.",
      authority: "Crossref",
    },
    {
      name: "SCImago Journal Rank",
      type: "Journal Metrics",
      queryMethod: "Dated CSV Import",
      desc: "Source-attributed SJR metrics, quartiles (Q1-Q4), and H-index distributions derived from Scopus dataset observations.",
      authority: "SCImago Lab",
    },
    {
      name: "DGRSDT Authority List",
      type: "National Warning Registry",
      queryMethod: "Curated Authority Fixture",
      desc: "Algerian Ministry Directorate predatory journal notices, reported as source-specific dated flags rather than universal conclusions.",
      authority: "DGRSDT Algeria",
    },
  ];

  return (
    <section className="section-padding" id="data-sources" style={{ background: "#ffffff" }} aria-label="Authoritative Data Sources">
      <div className="container">
        <div style={{ textAlign: "center", maxWidth: "720px", margin: "0 auto 16px auto" }}>
          <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--brand-primary)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            Connected Scholarly Registries
          </span>
          <h2 style={{ fontSize: "clamp(28px, 3.5vw, 42px)", marginTop: "8px", marginBottom: "16px" }}>
            Multi-Registry Cross Referencing
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "16px" }}>
            Integration indicates lookup against official records; it does not imply endorsement by the indexing providers.
          </p>
        </div>

        <div className="datasources-grid">
          {sources.map((s, i) => (
            <div key={i} className="datasource-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <h3 style={{ fontSize: "17px", color: "var(--text-headline)" }}>{s.name}</h3>
                  <span style={{ fontSize: "12px", color: "var(--brand-primary)", fontWeight: 600 }}>{s.type}</span>
                </div>
                <span style={{ fontSize: "11px", background: "var(--bg-canvas-subtle)", border: "1px solid var(--border-subtle)", padding: "3px 8px", borderRadius: "6px", color: "var(--text-muted)", fontWeight: 600 }}>
                  {s.queryMethod}
                </span>
              </div>
              <p style={{ fontSize: "13.5px", color: "var(--text-body)", lineHeight: 1.55 }}>
                {s.desc}
              </p>
              <div style={{ marginTop: "auto", paddingTop: "12px", borderTop: "1px solid var(--border-subtle)", fontSize: "12px", color: "var(--text-muted)" }}>
                Authority: <strong>{s.authority}</strong>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
