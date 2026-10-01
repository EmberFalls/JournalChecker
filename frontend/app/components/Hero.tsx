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
    <section className="hero-section" id="hero-search" aria-label="Hero Search Section">
      <div className="container" style={{ position: "relative", zIndex: 1 }}>
        {/* Announcement Pill */}
        <div className="hero-announcement">
          <span className="hero-announcement-tag">Methodology Note</span>
          <span>Conservative Evidence Scoring — No False Negatives</span>
        </div>

        {/* Hero Title */}
        <h1 className="hero-title">
          Verify Scholarly Journal Authenticity with Traceable Evidence
        </h1>

        {/* Hero Subtitle */}
        <p className="hero-subtitle">
          Cross-reference published claims conservatively across DOAJ, Scopus, Web of Science, and Crossref. Absence of proof is never treated as misconduct.
        </p>

        {/* Segmented Mode Switcher */}
        <ModeToggle mode={mode} onModeChange={onModeChange} />

        {/* Search Capsule Input */}
        <SearchCapsule
          query={query}
          onQueryChange={onQueryChange}
          onSubmit={onSubmit}
          isLoading={isLoading}
          mode={mode}
          message={message}
        />

        {/* Quick Test Samples */}
        <QuickPills onSelect={onSelectSample} />
      </div>
    </section>
  );
}
