"use client";

import { FormEvent, useState } from "react";

type Candidate = { id: string; title: string; score: number; reasons: string[] };
type Report = { journal: { current_title: string; canonical_publisher?: string; official_domain?: string; identifiers: string[] }; assessment: string; confidence: number; coverage: number; dimensions: Record<string, string>; rationale: string[]; last_checked: string; evidence: { provider: string; evidence_type: string; status: string; source_url?: string; value?: { authority?: string; classification?: string; effective_year?: number; listed_urls?: string[]; notice?: string; title?: string; listed?: boolean; name?: string; year?: string; value?: string | number; source_id?: string; SJR?: string; "SJR Best Quartile"?: string; "H index"?: string }; observed_at?: string }[]; claims: { claim_type: string; supporting_text: string; verification_status?: string; verification_rationale?: string }[] };
const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8100";

export default function Home() {
  const [query, setQuery] = useState(""); const [candidates, setCandidates] = useState<Candidate[]>([]); const [report, setReport] = useState<Report | null>(null); const [message, setMessage] = useState("");
  async function onSearch(event: FormEvent) {
    event.preventDefault(); setReport(null); setMessage("Searching identity evidence…");
    const response = await fetch(`${base}/api/search`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ query }) });
    if (!response.ok) { setMessage("Search could not be completed."); return; }
    const result = await response.json(); setCandidates(result.candidates); setMessage(result.input_type === "invalid_issn" ? "That ISSN fails its checksum. Check the digits and try again." : result.candidates.length ? "Choose a matching journal to analyze." : "No matching record was found in the available sources. That alone does not indicate misconduct.");
  }
  async function analyze(id: string) {
    setMessage("Collecting evidence and safely checking relevant website pages…");
    const response = await fetch(`${base}/api/journals/${id}/analyze`, { method: "POST" });
    if (!response.ok) { setMessage("Analysis could not be completed."); return; }
    setReport(await response.json()); setMessage("");
  }
  return <main><header><p className="eyebrow">EVIDENCE-FIRST VERIFICATION</p><h1>Journal Integrity</h1><p>Assess published claims conservatively. Missing evidence is never treated as proof of misconduct.</p></header>
    <form onSubmit={onSearch}><label htmlFor="query">Journal ISSN, DOI, title, or website</label><div className="search"><input id="query" value={query} onChange={e => setQuery(e.target.value)} placeholder="e.g. 1234-5678 or 10.xxxx/…" required /><button>Search</button></div></form>
    {message && <p className="message">{message}</p>}
    {candidates.length > 0 && <section><h2>Possible matches</h2>{candidates.map(candidate => <button type="button" className="candidate" onClick={() => analyze(candidate.id)} key={candidate.id}><strong>{candidate.title}</strong><span>{Math.round(candidate.score * 100)}% match · {candidate.reasons[0]}</span></button>)}</section>}
    {report && <section className="report">
      {report.journal.current_title.includes("[SYNTHETIC DEMO]") && <p className="demo-note" style={{ background: "#fff4d6", border: "1px solid #e5c46a", borderRadius: 7, padding: 12 }}><b>Demo record.</b> This is a synthetic walkthrough. Its negative result is pre-seeded for demonstration and is not a finding about a real journal.</p>}
      {report.evidence.some(item => item.evidence_type === "predatory_list") && <p className="authority-note" style={{ background: "#fff4d6", border: "1px solid #e5c46a", borderRadius: 7, padding: 12 }}><b>Source-specific listing.</b> The cited authority includes this publication in its dated list. Check the linked record and journal identity before drawing a broader conclusion.</p>}
      <div className="assessment"><div><p className="eyebrow">ASSESSMENT</p><h2>{report.assessment.replaceAll("_", " ")}</h2><p>{report.rationale[0]}</p></div><dl><div><dt>Confidence</dt><dd>{Math.round(report.confidence * 100)}%</dd></div><div><dt>Coverage</dt><dd>{Math.round(report.coverage * 100)}%</dd></div></dl></div>
      <h3>Identity</h3><p><b>{report.journal.current_title}</b><br />{report.journal.canonical_publisher ?? "Publisher not independently established"}<br />{report.journal.official_domain ?? "Official domain not independently established"}<br />{report.journal.identifiers.join(", ") || "No identifiers"}</p>
      <h3>Assessment dimensions</h3><div className="dimensions">{Object.entries(report.dimensions).map(([name, value]) => <div key={name}><span>{name.replaceAll("_", " ")}</span><b>{value.replaceAll("_", " ")}</b></div>)}</div>
      <h3>Source evidence</h3><ul>{report.evidence.map((item, index) => <li key={index}><b>{item.status}</b> — {item.provider}: {item.evidence_type}{item.value?.title && ` — ${item.value.title}`}{item.value?.authority && ` — ${item.value.authority} ${item.value.effective_year ?? ""} (${item.value.classification ?? "source listed"})`}{item.evidence_type === "scopus_metric" && item.value?.name && ` — ${item.value.name}: ${item.value.value ?? "n/a"} (${item.value.year ?? "year unavailable"})`}{item.evidence_type === "scimago_metrics" && ` — SJR ${item.value?.SJR ?? "n/a"}, ${item.value?.["SJR Best Quartile"] ?? "quartile unavailable"} (${item.value?.year ?? "year unavailable"})`}{item.value?.listed && " — exact identifier matched"} {item.source_url && <a href={item.source_url} target="_blank" rel="noreferrer">source</a>} {item.value?.listed_urls?.map((url, urlIndex) => <span key={urlIndex}> · <a href={url} target="_blank" rel="noreferrer">listed URL {urlIndex + 1}</a></span>)} {item.observed_at && <small> checked {new Date(item.observed_at).toLocaleDateString()}</small>}</li>)}</ul>
      {report.claims.length > 0 && <><h3>Claim verification</h3><ul>{report.claims.map((claim, index) => <li key={index}><b>{claim.verification_status ?? "NOT_VERIFIED"}</b> — {claim.claim_type.replaceAll("_", " ")}: {claim.verification_rationale ?? claim.supporting_text}</li>)}</ul></>}
      <p className="checked">Last analysed {new Date(report.last_checked).toLocaleString()}. “Not verified” and “unknown” are not adverse findings.</p>
    </section>}
  </main>;
}
