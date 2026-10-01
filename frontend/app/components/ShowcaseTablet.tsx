"use client";

import { KeyboardEvent, useState } from "react";

export type Candidate = { id: string; title: string; score: number; reasons: string[] };

export type EvidenceItem = {
  provider: string;
  evidence_type: string;
  status: string;
  source_url?: string;
  value?: {
    authority?: string;
    classification?: string;
    effective_year?: number;
    listed_urls?: string[];
    notice?: string;
    title?: string;
    listed?: boolean;
    name?: string;
    year?: string;
    value?: string | number;
    source_id?: string;
    SJR?: string;
    "SJR Best Quartile"?: string;
    "H index"?: string;
  };
  observed_at?: string;
};

export type ClaimItem = {
  claim_type: string;
  supporting_text: string;
  verification_status?: string;
  verification_rationale?: string;
};

export type Report = {
  journal: {
    current_title: string;
    canonical_publisher?: string;
    official_domain?: string;
    identifiers: string[];
  };
  assessment: string;
  confidence: number;
  coverage: number;
  dimensions: Record<string, string>;
  rationale: string[];
  last_checked: string;
  evidence: EvidenceItem[];
  claims: ClaimItem[];
};

interface ShowcaseTabletProps {
  report: Report | null;
  candidates: Candidate[];
  isLoading: boolean;
  onSelectCandidate: (id: string) => void;
  error?: string | null;
  onRetry?: () => void;
}

// Sample fallback preview for first-time visitors
const SAMPLE_PREVIEW_REPORT: Report = {
  journal: {
    current_title: "PLOS ONE",
    canonical_publisher: "Public Library of Science",
    official_domain: "journals.plos.org",
    identifiers: ["1932-6203", "10.1371/journal.pone"],
  },
  assessment: "LOW_RISK",
  confidence: 0.94,
  coverage: 0.86,
  dimensions: {
    identity_integrity: "supported",
    indexing_authenticity: "not_adverse",
    claim_consistency: "no_contradiction_observed",
    publishing_transparency: "supported",
    editorial_transparency: "supported",
    website_domain_identity: "not_adverse",
    source_list_flags: "not_observed",
  },
  rationale: [
    "No material contradictions found across DOAJ, Scopus, and Crossref checks. This is not a legitimacy guarantee.",
  ],
  last_checked: new Date().toISOString(),
  evidence: [
    {
      provider: "doaj",
      evidence_type: "doaj_listing",
      status: "VERIFIED",
      source_url: "https://doaj.org/toc/1932-6203",
      observed_at: new Date().toISOString(),
      value: { title: "PLOS ONE", listed: true },
    },
    {
      provider: "scopus",
      evidence_type: "scopus_coverage",
      status: "VERIFIED",
      source_url: "https://www.elsevier.com/products/scopus/content",
      observed_at: new Date().toISOString(),
      value: { title: "PLOS ONE", listed: true },
    },
    {
      provider: "crossref",
      evidence_type: "issn",
      status: "VERIFIED",
      observed_at: new Date().toISOString(),
      value: { title: "PLOS ONE" },
    },
  ],
  claims: [
    {
      claim_type: "peer_review_policy",
      supporting_text: "PLOS ONE employs an open and rigorous peer review model.",
      verification_status: "NOT_VERIFIED",
      verification_rationale: "Website policy observed; peer-review model requires human review.",
    },
    {
      claim_type: "doaj_listing",
      supporting_text: "Indexed in Directory of Open Access Journals.",
      verification_status: "VERIFIED",
      verification_rationale: "Corroborated by official DOAJ public registry record.",
    },
  ],
};

export default function ShowcaseTablet({
  report,
  candidates,
  isLoading,
  onSelectCandidate,
  error,
  onRetry,
}: ShowcaseTabletProps) {
  const [activeTab, setActiveTab] = useState<"assessment" | "dimensions" | "evidence">("assessment");
  const activeReport = report || (candidates.length === 0 && !isLoading ? SAMPLE_PREVIEW_REPORT : null);

  const tabs: Array<{ id: "assessment" | "dimensions" | "evidence"; label: string; icon: string }> = [
    { id: "assessment", label: "Risk Assessment", icon: "📊" },
    { id: "dimensions", label: "7 Dimensions Matrix", icon: "🛡️" },
    { id: "evidence", label: "Traceable Evidence", icon: "📜" },
  ];

  // WAI-ARIA arrow key navigation for tabs
  function handleKeyDown(e: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (e.key === "ArrowRight") {
      const nextIndex = (index + 1) % tabs.length;
      setActiveTab(tabs[nextIndex].id);
    } else if (e.key === "ArrowLeft") {
      const prevIndex = (index - 1 + tabs.length) % tabs.length;
      setActiveTab(tabs[prevIndex].id);
    }
  }

  function renderStatusBadge(assessment: string) {
    const norm = assessment.toLowerCase();
    if (norm.includes("low_risk") || norm.includes("verified")) {
      return (
        <span className="status-badge-lg low-risk">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          {assessment.replace(/_/g, " ")}
        </span>
      );
    }
    if (norm.includes("some_concerns") || norm.includes("warning")) {
      return (
        <span className="status-badge-lg some-concerns">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          {assessment.replace(/_/g, " ")}
        </span>
      );
    }
    if (norm.includes("high_risk") || norm.includes("contradicted")) {
      return (
        <span className="status-badge-lg high-risk">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
          {assessment.replace(/_/g, " ")}
        </span>
      );
    }
    return (
      <span className="status-badge-lg neutral">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
        {assessment.replace(/_/g, " ")}
      </span>
    );
  }

  return (
    <section className="showcase-section" id="showcase" aria-label="Interactive Verification Showcase">
      <div className="container">
        <div className="showcase-header">
          <p className="showcase-eyebrow">Interactive Verification Hub</p>
          <h2 style={{ fontSize: "clamp(28px, 3.5vw, 42px)", marginBottom: "12px" }}>
            You're the researcher. We make evidence traceable.
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "16px" }}>
            Explore live risk scores, 7-dimension integrity matrices, and cross-referenced public records with zero opaque conclusions.
          </p>
        </div>

        <div className="showcase-tablet">
          {/* Top Tablet Header with Tabs */}
          <div className="showcase-tablet-topbar">
            <ul className="showcase-tabs-list" role="tablist" aria-label="Verification Report Views">
              {tabs.map((tab, idx) => (
                <li key={tab.id} role="presentation">
                  <button
                    id={`tab-${tab.id}`}
                    type="button"
                    role="tab"
                    aria-selected={activeTab === tab.id}
                    aria-controls={`panel-${tab.id}`}
                    className="showcase-tab-btn"
                    onClick={() => setActiveTab(tab.id)}
                    onKeyDown={(e) => handleKeyDown(e, idx)}
                  >
                    <span aria-hidden="true">{tab.icon}</span>
                    <span>{tab.label}</span>
                  </button>
                </li>
              ))}
            </ul>

            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "var(--text-muted)" }}>
              <span style={{ display: "inline-block", width: "8px", height: "8px", borderRadius: "50%", background: "#10b981" }} />
              <span>Real-Time Engine Connected</span>
            </div>
          </div>

          {/* Canvas Area */}
          <div className="showcase-canvas">
            {/* Loading Skeleton */}
            {isLoading && (
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <div className="skeleton-box" style={{ width: "60%", height: "36px" }} />
                <div className="skeleton-box" style={{ width: "40%", height: "20px" }} />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginTop: "16px" }}>
                  <div className="skeleton-box" style={{ height: "100px" }} />
                  <div className="skeleton-box" style={{ height: "100px" }} />
                </div>
                <div className="skeleton-box" style={{ height: "160px", marginTop: "16px" }} />
              </div>
            )}

            {/* Error State with Retry */}
            {!isLoading && error && (
              <div style={{ textAlign: "center", padding: "40px 20px" }}>
                <div style={{ width: "48px", height: "48px", margin: "0 auto 16px auto", borderRadius: "50%", background: "#fef2f2", color: "#dc2626", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                </div>
                <h3 style={{ fontSize: "18px", marginBottom: "8px" }}>Lookup Interrupted</h3>
                <p style={{ color: "var(--text-muted)", marginBottom: "20px" }}>{error}</p>
                {onRetry && (
                  <button type="button" onClick={onRetry} className="btn-primary-pill">
                    Try Again
                  </button>
                )}
              </div>
            )}

            {/* Candidate Selection */}
            {!isLoading && !error && candidates.length > 0 && (
              <div className="candidate-picker">
                <h4 style={{ fontSize: "15px", color: "var(--brand-primary)", marginBottom: "6px" }}>
                  Multiple Matching Journals Found
                </h4>
                <p style={{ fontSize: "13.5px", color: "var(--text-muted)" }}>
                  Select the exact journal candidate to initiate comprehensive evidence analysis:
                </p>
                {candidates.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    className="candidate-item-btn"
                    onClick={() => onSelectCandidate(c.id)}
                  >
                    <div>
                      <strong style={{ fontSize: "15px", color: "var(--text-headline)" }}>{c.title}</strong>
                      <div style={{ fontSize: "12.5px", color: "var(--text-muted)", marginTop: "2px" }}>
                        {c.reasons[0]}
                      </div>
                    </div>
                    <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--brand-primary)", background: "var(--brand-50)", padding: "4px 10px", borderRadius: "9999px" }}>
                      {Math.round(c.score * 100)}% Match →
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* Active Report Canvas */}
            {!isLoading && !error && activeReport && (
              <div>
                {/* Synthetic Demo Banner if applicable */}
                {activeReport.journal.current_title.includes("[SYNTHETIC") && (
                  <div style={{ background: "#fffbeb", border: "1px solid #fde68a", padding: "12px 16px", borderRadius: "10px", marginBottom: "20px", fontSize: "13.5px", color: "#92400e" }}>
                    <strong>Synthetic Demo Fixture:</strong> This is a pre-seeded test case demonstrating a contradicted claim. It does not represent a finding against any real scholarly journal.
                  </div>
                )}

                {/* Scorecard Header */}
                <div className="scorecard-header">
                  <div className="journal-identity-box">
                    <span style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "0.08em", color: "var(--brand-primary)", textTransform: "uppercase" }}>
                      Evaluated Channel
                    </span>
                    <h3>{activeReport.journal.current_title}</h3>
                    <div className="journal-meta-row">
                      <span>Publisher: {activeReport.journal.canonical_publisher || "Independently resolving"}</span>
                      {activeReport.journal.official_domain && (
                        <span>Domain: {activeReport.journal.official_domain}</span>
                      )}
                      <span>Identifiers: {activeReport.journal.identifiers.join(", ") || "None"}</span>
                    </div>
                  </div>

                  <div className="assessment-verdict-box">
                    <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 600 }}>
                      Risk Assessment
                    </span>
                    {renderStatusBadge(activeReport.assessment)}
                  </div>
                </div>

                {/* Tab Panel: Risk Assessment */}
                {activeTab === "assessment" && (
                  <div id="panel-assessment" role="tabpanel" aria-labelledby="tab-assessment">
                    {/* Dual Confidence & Coverage Gauges */}
                    <div className="metrics-gauges-row">
                      <div className="metric-gauge-card">
                        <div className="metric-gauge-header">
                          <span className="metric-gauge-title">Evidence Confidence</span>
                          <span className="metric-gauge-val">{Math.round(activeReport.confidence * 100)}%</span>
                        </div>
                        <div className="metric-bar-bg">
                          <div className="metric-bar-fill" style={{ width: `${Math.round(activeReport.confidence * 100)}%` }} />
                        </div>
                        <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "6px" }}>
                          Degree of independent corroboration across authorized authorities.
                        </p>
                      </div>

                      <div className="metric-gauge-card">
                        <div className="metric-gauge-header">
                          <span className="metric-gauge-title">Check Coverage</span>
                          <span className="metric-gauge-val">{Math.round(activeReport.coverage * 100)}%</span>
                        </div>
                        <div className="metric-bar-bg">
                          <div className="metric-bar-fill" style={{ width: `${Math.round(activeReport.coverage * 100)}%`, background: "#059669" }} />
                        </div>
                        <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "6px" }}>
                          Proportion of applicable dimensions verified against available data.
                        </p>
                      </div>
                    </div>

                    {/* Assessment Rationale */}
                    <div style={{ background: "var(--bg-canvas-subtle)", border: "1px solid var(--border-subtle)", borderRadius: "14px", padding: "18px 20px" }}>
                      <h4 style={{ fontSize: "14px", fontWeight: 700, marginBottom: "8px", color: "var(--text-headline)" }}>
                        Assessment Rationale
                      </h4>
                      <p style={{ fontSize: "14px", color: "var(--text-body)" }}>
                        {activeReport.rationale[0] || "Available evidence assessed conservatively under standard criteria."}
                      </p>
                    </div>
                  </div>
                )}

                {/* Tab Panel: 7 Dimensions Matrix */}
                {activeTab === "dimensions" && (
                  <div id="panel-dimensions" role="tabpanel" aria-labelledby="tab-dimensions">
                    <div className="dimensions-grid">
                      {Object.entries(activeReport.dimensions).map(([key, val]) => (
                        <div key={key} className="dimension-item-card">
                          <span className="dimension-name">{key.replace(/_/g, " ")}</span>
                          <span
                            className="dimension-val-badge"
                            style={{
                              background: val === "supported" || val === "not_adverse" || val === "no_contradiction_observed" ? "var(--status-verified-bg)" : val === "contradicted" || val === "conflict" ? "var(--status-contradicted-bg)" : "var(--status-neutral-bg)",
                              color: val === "supported" || val === "not_adverse" || val === "no_contradiction_observed" ? "var(--status-verified)" : val === "contradicted" || val === "conflict" ? "var(--status-contradicted)" : "var(--status-neutral)",
                              border: `1px solid ${val === "supported" || val === "not_adverse" || val === "no_contradiction_observed" ? "var(--status-verified-border)" : val === "contradicted" || val === "conflict" ? "var(--status-contradicted-border)" : "var(--status-neutral-border)"}`,
                            }}
                          >
                            {val.replace(/_/g, " ")}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tab Panel: Evidence Stream */}
                {activeTab === "evidence" && (
                  <div id="panel-evidence" role="tabpanel" aria-labelledby="tab-evidence">
                    <ul className="evidence-stream-list">
                      {activeReport.evidence.map((item, idx) => (
                        <li key={idx} className="evidence-stream-item">
                          <div>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <strong style={{ fontSize: "14px", textTransform: "capitalize" }}>
                                {item.provider}: {item.evidence_type.replace(/_/g, " ")}
                              </strong>
                              <span style={{ fontSize: "11px", fontWeight: 700, padding: "2px 6px", borderRadius: "4px", background: item.status === "VERIFIED" ? "var(--status-verified-bg)" : "var(--status-neutral-bg)", color: item.status === "VERIFIED" ? "var(--status-verified)" : "var(--text-muted)" }}>
                                {item.status}
                              </span>
                            </div>
                            <div style={{ fontSize: "12.5px", color: "var(--text-muted)", marginTop: "4px" }}>
                              {item.value?.title && `Title: ${item.value.title} · `}
                              {item.value?.authority && `Authority: ${item.value.authority} · `}
                              Observed {item.observed_at ? new Date(item.observed_at).toLocaleDateString() : "Live"}
                            </div>
                          </div>
                          {item.source_url && (
                            <a
                              href={item.source_url}
                              target="_blank"
                              rel="noreferrer"
                              style={{ fontSize: "13px", color: "var(--brand-primary)", fontWeight: 600 }}
                            >
                              View Public Source ↗
                            </a>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
