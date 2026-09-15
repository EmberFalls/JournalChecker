"use client";

import { FormEvent, useState } from "react";

type Candidate = { id: string; title: string; score: number; reasons: string[] };
type Report = { journal: { current_title: string; canonical_publisher?: string; official_domain?: string; identifiers: string[] }; assessment: string; confidence: number; coverage: number; rationale: string[]; evidence: { provider: string; evidence_type: string; status: string; source_url?: string }[]; claims: { claim_type: string; supporting_text: string; verification_status?: string; verification_rationale?: string }[] };
const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

export default function Home() {
  const [query, setQuery] = useState(""); const [candidates, setCandidates] = useState<Candidate[]>([]); const [report, setReport] = useState<Report | null>(null); const [message, setMessage] = useState("");
  async function onSearch(event: FormEvent) {
    event.preventDefault(); setReport(null); setMessage("Searching identity evidence…");
    const response = await fetch(`${base}/api/search`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ query }) });
    if (!response.ok) { setMessage("Search could not be completed."); return; }
    const result = await response.json(); setCandidates(result.candidates); setMessage(result.candidates.length ? "Choose a matching journal to analyze." : "No known candidate yet. Import evidence or try an ISSN/DOI.");
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
    {candidates.length > 0 && <section><h2>Possible matches</h2>{candidates.map(candidate => <button className="candidate" onClick={() => analyze(candidate.id)} key={candidate.id}><strong>{candidate.title}</strong><span>{Math.round(candidate.score * 100)}% match · {candidate.reasons[0]}</span></button>)}</section>}
    {report && <section className="report"><div className="assessment"><div><p className="eyebrow">ASSESSMENT</p><h2>{report.assessment.replaceAll("_", " ")}</h2><p>{report.rationale[0]}</p></div><dl><div><dt>Confidence</dt><dd>{Math.round(report.confidence * 100)}%</dd></div><div><dt>Coverage</dt><dd>{Math.round(report.coverage * 100)}%</dd></div></dl></div><h3>{report.journal.current_title}</h3><p>{report.journal.canonical_publisher ?? "Publisher not independently established"} · {report.journal.identifiers.join(", ") || "No identifiers"}</p><h3>Source evidence</h3><ul>{report.evidence.map((item, index) => <li key={index}><b>{item.status}</b> — {item.provider}: {item.evidence_type} {item.source_url && <a href={item.source_url} target="_blank" rel="noreferrer">source</a>}</li>)}</ul>{report.claims.length > 0 && <><h3>Claim verification</h3><ul>{report.claims.map((claim, index) => <li key={index}><b>{claim.verification_status ?? "NOT_VERIFIED"}</b> — {claim.claim_type.replaceAll("_", " ")}: {claim.verification_rationale ?? claim.supporting_text}</li>)}</ul></>}</section>}
  </main>;
}
