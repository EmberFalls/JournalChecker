"use client";

import { motion } from "framer-motion";
import { Search, Database, ShieldCheck, CheckCircle2, BarChart3, ArrowRight } from "lucide-react";

export default function HowItWorks() {
  const steps = [
    {
      step: "01",
      title: "Normalize Identifiers",
      desc: "Input ISSN, DOI, title, or domain. The engine validates check-digits and canonicalizes identity before querying.",
      icon: Search,
      colSpan: "md:col-span-7",
      highlight: true,
      badge: "Check-Digit Validated",
    },
    {
      step: "02",
      title: "Query Authoritative Registries",
      desc: "Parallel lookup across DOAJ, Scopus, Web of Science, Crossref metadata, and SCImago ranks.",
      icon: Database,
      colSpan: "md:col-span-5",
      highlight: false,
      badge: "5+ Real-time APIs",
    },
    {
      step: "03",
      title: "Safe Policy Extraction",
      desc: "A sandboxed crawler parses public journal pages to extract peer-review policies, APC fees, and ethics declarations.",
      icon: ShieldCheck,
      colSpan: "md:col-span-4",
      highlight: false,
      badge: "Sandboxed Parser",
    },
    {
      step: "04",
      title: "Cross-Reference Claims",
      desc: "Stated indexing claims on the journal website are compared against authorized database listings.",
      icon: CheckCircle2,
      colSpan: "md:col-span-4",
      highlight: false,
      badge: "Zero Hallucination",
    },
    {
      step: "05",
      title: "Synthesize Scorecard",
      desc: "Conservative risk labels, confidence percentages, and check coverage with traceable citations are output.",
      icon: BarChart3,
      colSpan: "md:col-span-4",
      highlight: false,
      badge: "Audit Trail",
    },
  ];

  return (
    <section id="how-it-works" className="py-24 px-4 bg-white" aria-label="How Journal Integrity Works">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-widest text-blue-600 bg-blue-50 border border-blue-100 mb-3">
            The Verification Pipeline
          </span>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-slate-900">
            How verification works
          </h2>
          <p className="mt-4 text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            From raw identifier input to multi-registry corroboration and conservative risk synthesis.
          </p>
        </div>

        {/* Bento Box 12-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {steps.map((s, idx) => {
            const IconComponent = s.icon;
            return (
              <motion.div
                key={s.step}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: idx * 0.08 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className={`${s.colSpan} group relative rounded-3xl border border-slate-200/90 ${
                  s.highlight
                    ? "bg-gradient-to-br from-blue-50/60 via-white to-slate-50/80 p-8 shadow-sm hover:shadow-md hover:border-blue-300"
                    : "bg-slate-50/70 p-7 hover:bg-white hover:border-slate-300 hover:shadow-sm"
                } transition-all flex flex-col justify-between overflow-hidden`}
              >
                {/* Background Accent Glow for Hero Bento Card */}
                {s.highlight && (
                  <div className="absolute -top-24 -right-24 h-56 w-56 rounded-full bg-blue-400/10 blur-3xl pointer-events-none" />
                )}

                <div>
                  {/* Top Bar inside Bento Tile */}
                  <div className="flex items-center justify-between gap-3 mb-6">
                    <div className="flex items-center gap-2">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-sm group-hover:bg-blue-600 transition-colors">
                        <IconComponent className="h-5 w-5" />
                      </div>
                      <span className="text-xs font-bold font-mono text-slate-400 tracking-wider">
                        STEP {s.step}
                      </span>
                    </div>

                    <span className="rounded-full bg-white border border-slate-200/80 px-3 py-1 text-[11px] font-semibold text-slate-600 shadow-2xs">
                      {s.badge}
                    </span>
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold text-slate-900 tracking-tight mb-2 group-hover:text-blue-600 transition-colors">
                    {s.title}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed font-normal">
                    {s.desc}
                  </p>
                </div>

                {/* Bottom subtle indicator */}
                <div className="mt-6 pt-4 border-t border-slate-200/50 flex items-center justify-between text-xs font-semibold text-slate-400 group-hover:text-blue-600 transition-colors">
                  <span>Phase {s.step} of 05</span>
                  <ArrowRight className="h-3.5 w-3.5 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
