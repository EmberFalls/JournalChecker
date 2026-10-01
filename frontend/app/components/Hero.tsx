"use client";

import { FormEvent } from "react";
import ModeToggle from "./ModeToggle";
import QuickPills from "./QuickPills";
import SearchCapsule from "./SearchCapsule";

interface HeroProps {
  query: string;
  onQueryChange: (q: string) => void;
  onSubmit: (e: FormEvent) => void;
  onSelectSample: (q: string) => void;
  isLoading: boolean;
  mode: "identifier" | "website";
  onModeChange: (m: "identifier" | "website") => void;
  message?: string;
}

export default function Hero({
  query,
  onQueryChange,
  onSubmit,
  onSelectSample,
  isLoading,
  mode,
  onModeChange,
  message,
}: HeroProps) {
  return (
    <section
      id="hero-search"
      className="relative w-full min-h-[90vh] bg-[url('/hero-gradient-bg.jpg')] bg-cover bg-center bg-no-repeat pt-32 pb-24 px-4 text-center overflow-hidden flex flex-col items-center justify-center"
      aria-label="Hero Search Section"
    >
      <div className="mx-auto max-w-4xl relative z-10 flex flex-col items-center">
        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl md:text-[64px] font-bold tracking-tight text-slate-900 leading-[1.08] mb-6 max-w-3xl">
          Verify Scholarly Journals
          <br />
          <span className="text-slate-900">with Traceable Evidence</span>
        </h1>

        {/* Hero Subtitle */}
        <p className="text-base sm:text-lg md:text-xl text-slate-700 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
          Conservative risk scoring across DOAJ, Scopus, Web of Science, and Crossref. Absence of data is never treated as misconduct.
        </p>

        {/* Mode Toggle Capsule */}
        <div className="mb-6">
          <ModeToggle mode={mode} onModeChange={onModeChange} />
        </div>

        {/* Search Capsule */}
        <SearchCapsule
          query={query}
          onQueryChange={onQueryChange}
          onSubmit={onSubmit}
          isLoading={isLoading}
          mode={mode}
          message={message}
        />

        {/* Quick Sample Suggestions */}
        <div className="mt-5">
          <QuickPills onSelect={onSelectSample} />
        </div>
      </div>
    </section>
  );
}
