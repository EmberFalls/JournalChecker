"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  ShieldCheck,
  AlertTriangle,
  XCircle,
  HelpCircle,
  ExternalLink,
  CheckCircle2,
  FileCheck,
  Search,
  Activity,
  ArrowRight,
} from "lucide-react";

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

const SAMPLE_REPORT: Report = {
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
      supporting_text: "PLOS ONE operates a rigorous, multidisciplinary peer review model.",
      verification_status: "NOT_VERIFIED",
      verification_rationale: "Website policy observed; peer-review models require human review.",
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
  const activeReport = report || (candidates.length === 0 && !isLoading ? SAMPLE_REPORT : null);

  function getStatusBadge(assessment: string) {
    const norm = assessment.toLowerCase();
    if (norm.includes("low_risk") || norm.includes("verified")) {
      return (
        <Badge variant="success" className="px-3 py-1 text-xs">
          <ShieldCheck className="h-3.5 w-3.5" />
          {assessment.replace(/_/g, " ")}
        </Badge>
      );
    }
    if (norm.includes("some_concerns") || norm.includes("warning")) {
      return (
        <Badge variant="warning" className="px-3 py-1 text-xs">
          <AlertTriangle className="h-3.5 w-3.5" />
          {assessment.replace(/_/g, " ")}
        </Badge>
      );
    }
    if (norm.includes("high_risk") || norm.includes("contradicted")) {
      return (
        <Badge variant="destructive" className="px-3 py-1 text-xs">
          <XCircle className="h-3.5 w-3.5" />
          {assessment.replace(/_/g, " ")}
        </Badge>
      );
    }
    return (
      <Badge variant="subtle" className="px-3 py-1 text-xs">
        <HelpCircle className="h-3.5 w-3.5" />
        {assessment.replace(/_/g, " ")}
      </Badge>
    );
  }

  return (
    <section id="showcase" className="py-20 bg-slate-50/50">
      <div className="mx-auto max-w-5xl px-4">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#2142e7] mb-2">
            <Activity className="h-3.5 w-3.5" />
            Verification Intelligence Hub
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 mb-3">
            Traceable Evidence. No Blind Labels.
          </h2>
          <p className="text-sm text-slate-500">
            Explore live risk scores, 7-dimension integrity matrices, and cross-referenced public records.
          </p>
        </div>

        {/* Showcase Tablet Card */}
        <Card className="rounded-3xl border border-slate-200/90 shadow-[0_20px_50px_-15px_rgba(33,66,231,0.12),0_4px_20px_-2px_rgba(0,0,0,0.04)] overflow-hidden bg-white">
          <Tabs defaultValue="assessment" className="w-full">
            {/* Top Bar with Tabs */}
            <div className="border-b border-slate-100 bg-slate-50/80 px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
              <TabsList>
                <TabsTrigger value="assessment">Risk Assessment</TabsTrigger>
                <TabsTrigger value="dimensions">7 Dimensions</TabsTrigger>
                <TabsTrigger value="evidence">Source Evidence</TabsTrigger>
              </TabsList>

              <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span>Verification Engine Active</span>
              </div>
            </div>

            {/* Canvas Content */}
            <div className="p-6 sm:p-8">
              {/* Skeleton State */}
              {isLoading && (
                <div className="space-y-4">
                  <div className="h-8 w-2/3 rounded-xl bg-slate-100 animate-shimmer" />
                  <div className="h-4 w-1/3 rounded-xl bg-slate-100 animate-shimmer" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                    <div className="h-28 rounded-2xl bg-slate-100 animate-shimmer" />
                    <div className="h-28 rounded-2xl bg-slate-100 animate-shimmer" />
                  </div>
                </div>
              )}

              {/* Error State */}
              {!isLoading && error && (
                <div className="py-12 text-center max-w-md mx-auto">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600 mb-4">
                    <AlertTriangle className="h-6 w-6" />
                  </div>
                  <h3 className="text-base font-semibold text-slate-900 mb-1">Search Interrupted</h3>
                  <p className="text-xs text-slate-500 mb-5">{error}</p>
                  {onRetry && (
                    <Button size="sm" onClick={onRetry} className="bg-[#2142e7] text-white">
                      Try Again
                    </Button>
                  )}
                </div>
              )}

              {/* Candidate Picker Sheet */}
              {!isLoading && !error && candidates.length > 0 && (
                <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-5 mb-6">
                  <h4 className="text-sm font-semibold text-slate-900 mb-1">Multiple Matching Journals</h4>
                  <p className="text-xs text-slate-500 mb-3">Select the exact journal record to inspect:</p>
                  <div className="space-y-2">
                    {candidates.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => onSelectCandidate(c.id)}
                        className="w-full flex items-center justify-between rounded-xl border border-slate-200/80 bg-white p-3.5 text-left transition-all hover:border-[#2142e7] hover:shadow-sm"
                      >
                        <div>
                          <div className="text-sm font-semibold text-slate-900">{c.title}</div>
                          <div className="text-xs text-slate-500 mt-0.5">{c.reasons[0]}</div>
                        </div>
                        <span className="text-xs font-bold text-[#2142e7] bg-blue-50 px-2.5 py-1 rounded-full shrink-0">
                          {Math.round(c.score * 100)}% Match →
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Active Report View */}
              {!isLoading && !error && activeReport && (
                <div>
                  {/* Synthetic Note */}
                  {activeReport.journal.current_title.includes("[SYNTHETIC") && (
                    <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-3.5 text-xs text-amber-800">
                      <strong>Synthetic Walkthrough:</strong> This fixture demonstrates a negative claim finding. It is not a real journal finding.
                    </div>
                  )}

                  {/* Scorecard Identity Header */}
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 pb-6 border-b border-slate-100 mb-6">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#2142e7]">
                        Evaluated Publication Channel
                      </span>
                      <h3 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
                        {activeReport.journal.current_title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-slate-500">
                        <span>Publisher: {activeReport.journal.canonical_publisher || "Independently resolving"}</span>
                        {activeReport.journal.official_domain && (
                          <span>Domain: {activeReport.journal.official_domain}</span>
                        )}
                        <span>Identifiers: {activeReport.journal.identifiers.join(", ") || "None"}</span>
                      </div>
                    </div>

                    <div className="sm:text-right">
                      <div className="text-xs text-slate-400 font-medium mb-1">Risk Evaluation</div>
                      {getStatusBadge(activeReport.assessment)}
                    </div>
                  </div>

                  {/* Tab 1: Risk Assessment */}
                  <TabsContent value="assessment" className="mt-0 space-y-6">
                    {/* Dual Meters */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-5">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-semibold text-slate-600">Evidence Confidence</span>
                          <span className="text-xl font-bold text-slate-900">
                            {Math.round(activeReport.confidence * 100)}%
                          </span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-[#2142e7] transition-all duration-500"
                            style={{ width: `${Math.round(activeReport.confidence * 100)}%` }}
                          />
                        </div>
                        <p className="text-[11px] text-slate-400 mt-2">
                          Degree of independent corroboration across authorized authorities.
                        </p>
                      </div>

                      <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-5">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-semibold text-slate-600">Check Coverage</span>
                          <span className="text-xl font-bold text-slate-900">
                            {Math.round(activeReport.coverage * 100)}%
                          </span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                            style={{ width: `${Math.round(activeReport.coverage * 100)}%` }}
                          />
                        </div>
                        <p className="text-[11px] text-slate-400 mt-2">
                          Proportion of applicable dimensions verified against available data.
                        </p>
                      </div>
                    </div>

                    {/* Rationale Box */}
                    <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-5">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                        Evaluation Rationale
                      </h4>
                      <p className="text-sm text-slate-700 leading-relaxed">
                        {activeReport.rationale[0] || "Available evidence assessed conservatively under standard criteria."}
                      </p>
                    </div>
                  </TabsContent>

                  {/* Tab 2: 7 Dimensions Matrix */}
                  <TabsContent value="dimensions" className="mt-0">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {Object.entries(activeReport.dimensions).map(([key, val]) => (
                        <div
                          key={key}
                          className="flex items-center justify-between rounded-xl border border-slate-100 bg-white p-4 shadow-sm"
                        >
                          <span className="text-xs font-medium text-slate-700 capitalize">
                            {key.replace(/_/g, " ")}
                          </span>
                          <Badge
                            variant={
                              val === "supported" || val === "not_adverse" || val === "no_contradiction_observed"
                                ? "success"
                                : val === "contradicted" || val === "conflict"
                                ? "destructive"
                                : "subtle"
                            }
                            className="text-[11px] capitalize"
                          >
                            {val.replace(/_/g, " ")}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  {/* Tab 3: Traceable Evidence */}
                  <TabsContent value="evidence" className="mt-0">
                    <div className="space-y-3">
                      {activeReport.evidence.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex flex-col sm:flex-row sm:items-center sm:justify-between rounded-xl border border-slate-100 bg-white p-4 shadow-sm gap-2"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-900 capitalize">
                                {item.provider}: {item.evidence_type.replace(/_/g, " ")}
                              </span>
                              <Badge variant={item.status === "VERIFIED" ? "success" : "subtle"} className="text-[10px]">
                                {item.status}
                              </Badge>
                            </div>
                            <div className="text-xs text-slate-400 mt-1">
                              {item.value?.title && `Title: ${item.value.title} · `}
                              Observed {item.observed_at ? new Date(item.observed_at).toLocaleDateString() : "Live"}
                            </div>
                          </div>

                          {item.source_url && (
                            <a
                              href={item.source_url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-xs font-semibold text-[#2142e7] hover:underline shrink-0"
                            >
                              View Source Record
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                </div>
              )}
            </div>
          </Tabs>
        </Card>
      </div>
    </section>
  );
}
