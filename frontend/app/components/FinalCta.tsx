"use client";

import { ArrowRight } from "lucide-react";

export default function FinalCta() {
  return (
    <section className="py-24 px-4 bg-slate-900" aria-label="Call to Action">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
          Start verifying scholarly journals
        </h2>
        <p className="mt-4 text-slate-400 text-base max-w-xl mx-auto">
          Conservative risk scoring, transparent citations, and multi-registry corroboration — all in one place.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <a
            href="#hero-search"
            className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-slate-900 hover:bg-slate-100 transition-colors"
          >
            Verify a journal
            <ArrowRight className="h-4 w-4" />
          </a>
          <a
            href="http://localhost:8100/docs"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-slate-700 px-6 py-2.5 text-sm font-medium text-slate-300 hover:text-white hover:border-slate-500 transition-colors"
          >
            Explore API docs
          </a>
        </div>
      </div>
    </section>
  );
}
