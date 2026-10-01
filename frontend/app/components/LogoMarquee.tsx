"use client";

import {
  DoajLogo,
  ScopusLogo,
  WebOfScienceLogo,
  CrossrefLogo,
  ScimagoLogo,
  DgrsdtLogo,
  PubmedLogo,
} from "./logos/AuthorityLogos";

export default function LogoMarquee() {
  const authorities = [
    { name: "DOAJ", desc: "Directory of Open Access Journals", Logo: DoajLogo },
    { name: "Scopus", desc: "Elsevier Serial Titles", Logo: ScopusLogo },
    { name: "Web of Science", desc: "Clarivate Citation Index", Logo: WebOfScienceLogo },
    { name: "Crossref", desc: "DOI Registration Agency", Logo: CrossrefLogo },
    { name: "SCImago", desc: "Journal Rank (SJR)", Logo: ScimagoLogo },
    { name: "DGRSDT", desc: "Algerian Research Directorate", Logo: DgrsdtLogo },
    { name: "PubMed", desc: "NCBI / NLM MEDLINE Database", Logo: PubmedLogo },
  ];

  const duplicated = [...authorities, ...authorities, ...authorities];

  return (
    <section id="authorities" className="border-y border-slate-100 bg-slate-50/60 py-8 overflow-hidden">
      <div className="mx-auto max-w-5xl px-4 text-center mb-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
          Cross-referenced against official scholarly registries
        </p>
      </div>

      <div className="relative w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
        <div className="animate-marquee gap-4">
          {duplicated.map((item, idx) => {
            const LogoComponent = item.Logo;
            return (
              <div
                key={`${item.name}-${idx}`}
                className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white/95 px-4 py-2.5 shadow-sm transition-all hover:shadow-md hover:border-slate-300 shrink-0"
              >
                <div className="flex h-9 w-9 items-center justify-center shrink-0">
                  <LogoComponent className="h-8 w-8" />
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold text-slate-900 leading-none">{item.name}</div>
                  <div className="text-[10px] text-slate-500 mt-1 font-medium">{item.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
