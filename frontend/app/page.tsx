"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import DataSourcesGrid from "./components/DataSourcesGrid";
import FinalCta from "./components/FinalCta";
import Footer from "./components/Footer";
import HelpDrawer from "./components/HelpDrawer";
import Hero from "./components/Hero";
import HowItWorks from "./components/HowItWorks";
import LogoMarquee from "./components/LogoMarquee";
import Navbar from "./components/Navbar";
import ShowcaseTablet, { Candidate, Report } from "./components/ShowcaseTablet";

export default function Home() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<"identifier" | "website">("identifier");
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [report, setReport] = useState<Report | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSearchSubmit(e?: FormEvent, targetQuery?: string) {
    if (e) e.preventDefault();
    const q = (targetQuery ?? query).trim();
    if (!q) return;

    if (isAuthenticated) {
      router.push(`/dashboard?q=${encodeURIComponent(q)}`);
    } else {
      // Gate verification behind login
      router.push(`/login?redirect=/dashboard&q=${encodeURIComponent(q)}`);
    }
  }

  function handleSelectSample(sampleQuery: string) {
    setQuery(sampleQuery);
    handleSearchSubmit(undefined, sampleQuery);
  }

  return (
    <main className="w-full overflow-x-hidden">
      {/* Sticky Pill Navbar */}
      <Navbar />

      {/* Hero with Search Teaser */}
      <Hero
        query={query}
        onQueryChange={setQuery}
        onSubmit={(e) => handleSearchSubmit(e)}
        onSelectSample={handleSelectSample}
        isLoading={isLoading}
        mode={mode}
        onModeChange={setMode}
        message={message}
      />

      {/* Authority Logos Marquee */}
      <LogoMarquee />

      {/* Interactive Verification Result Preview */}
      <ShowcaseTablet
        report={report}
        candidates={candidates}
        isLoading={isLoading}
        onSelectCandidate={() => {}}
        error={error}
      />

      {/* How It Works Pipeline */}
      <HowItWorks />

      {/* Data Sources Grid */}
      <DataSourcesGrid />

      {/* Final Call-to-Action */}
      <FinalCta />

      {/* Footer */}
      <Footer />

      {/* Floating Help Drawer */}
      <HelpDrawer />
    </main>
  );
}
