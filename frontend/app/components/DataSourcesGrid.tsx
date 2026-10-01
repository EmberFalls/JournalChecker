"use client";

import { motion } from "framer-motion";
import {
  DoajLogo,
  ScopusLogo,
  WebOfScienceLogo,
  CrossrefLogo,
  ScimagoLogo,
  DgrsdtLogo,
} from "./logos/AuthorityLogos";
import { ShieldCheck, CheckCircle2, ArrowRight } from "lucide-react";

const sources = [
  {
    name: "DOAJ",
    fullName: "Directory of Open Access Journals",
    desc: "Comprehensive registry of peer-reviewed open-access journals. Confirms editorial boards, licenses, and APC declarations.",
    method: "CSV Import",
    Logo: DoajLogo,
    colSpan: "md:col-span-8",
    highlight: true,
    tagColor: "bg-amber-50 text-amber-700 border-amber-200",
  },
  {
    name: "Scopus",
    fullName: "Scopus Serial Titles",
    desc: "Elsevier's curated abstract and citation database. Confirms active and discontinued indexing status.",
    method: "Serial Title API",
    Logo: ScopusLogo,
    colSpan: "md:col-span-4",
    highlight: false,
    tagColor: "bg-orange-50 text-orange-700 border-orange-200",
  },
  {
    name: "Web of Science",
    fullName: "WoS Starter API",
    desc: "Clarivate citation index verifying journal ISSN registration, publisher identities, and core collection status.",
    method: "Starter API",
    Logo: WebOfScienceLogo,
    colSpan: "md:col-span-4",
    highlight: false,
    tagColor: "bg-purple-50 text-purple-700 border-purple-200",
  },
  {
    name: "Crossref",
    fullName: "Crossref Metadata",
    desc: "Authoritative DOI registration agency for scholarly publications, validating digital persistence and volume.",
    method: "Public REST API",
    Logo: CrossrefLogo,
    colSpan: "md:col-span-4",
    highlight: false,
    tagColor: "bg-sky-50 text-sky-700 border-sky-200",
  },
  {
    name: "SCImago",
    fullName: "SCImago Journal Rank",
    desc: "Source-attributed SJR metrics, quartiles (Q1–Q4), and H-index distributions derived from Scopus observations.",
    method: "CSV Import",
    Logo: ScimagoLogo,
    colSpan: "md:col-span-4",
    highlight: false,
    tagColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  {
    name: "DGRSDT",
    fullName: "Algerian Research Directorate",
    desc: "Ministry predatory journal notices, reported as source-specific dated flags rather than universal conclusions.",
    method: "Curated Fixture",
    Logo: DgrsdtLogo,
    colSpan: "md:col-span-12",
    highlight: true,
    tagColor: "bg-slate-100 text-slate-700 border-slate-200",
  },
];

export default function DataSourcesGrid() {
  return (
    <section id="data-sources" className="py-24 px-4 bg-slate-50/70" aria-label="Authoritative Data Sources">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-widest text-blue-600 bg-blue-50 border border-blue-100 mb-3">
            Connected Registries
          </span>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-slate-900">
            Multi-registry cross-referencing
          </h2>
          <p className="mt-4 text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Integration means direct lookup against official records — avoiding single-point assumptions or guesswork.
          </p>
        </div>

        {/* Bento Box 12-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {sources.map((s, idx) => {
            const LogoComponent = s.Logo;
            return (
              <motion.div
                key={s.name}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: idx * 0.08 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className={`${s.colSpan} group relative rounded-3xl border border-slate-200/90 ${
                  s.colSpan === "md:col-span-12"
                    ? "bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-8 shadow-md"
                    : s.highlight
                    ? "bg-white p-8 shadow-sm hover:shadow-md border-blue-200/80"
                    : "bg-white p-7 shadow-sm hover:shadow-md hover:border-slate-300"
                } transition-all flex flex-col justify-between overflow-hidden`}
              >
                {/* Visual Content */}
                <div>
                  <div className="flex items-start justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 border border-slate-100 p-1.5 shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                        <LogoComponent className="h-9 w-9" />
                      </div>
                      <div>
                        <h3 className={`text-lg font-bold tracking-tight ${s.colSpan === "md:col-span-12" ? "text-white" : "text-slate-900"}`}>
                          {s.name}
                        </h3>
                        <p className={`text-xs font-medium ${s.colSpan === "md:col-span-12" ? "text-slate-300" : "text-slate-400"}`}>
                          {s.fullName}
                        </p>
                      </div>
                    </div>

                    <span className={`shrink-0 rounded-full border px-3 py-1 text-[11px] font-semibold ${s.colSpan === "md:col-span-12" ? "bg-slate-800 text-blue-300 border-slate-700" : s.tagColor}`}>
                      {s.method}
                    </span>
                  </div>

                  <p className={`text-sm leading-relaxed ${s.colSpan === "md:col-span-12" ? "text-slate-300 max-w-3xl" : "text-slate-600"}`}>
                    {s.desc}
                  </p>
                </div>

                {/* Bottom Footer inside Bento Card */}
                <div className={`mt-6 pt-4 border-t flex items-center justify-between text-xs font-medium ${s.colSpan === "md:col-span-12" ? "border-slate-800 text-slate-400" : "border-slate-100 text-slate-400"}`}>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className={`h-3.5 w-3.5 ${s.colSpan === "md:col-span-12" ? "text-blue-400" : "text-emerald-500"}`} />
                    Active Authority Source
                  </span>
                  <span className="group-hover:translate-x-1 transition-transform flex items-center gap-1">
                    Details <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
