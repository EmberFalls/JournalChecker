"use client";

import { FormEvent, useState } from "react";
import AnnouncementBar from "./components/AnnouncementBar";
import AudienceTabs from "./components/AudienceTabs";
import DataSourcesGrid from "./components/DataSourcesGrid";
import FinalCta from "./components/FinalCta";
import Footer from "./components/Footer";
import HelpDrawer from "./components/HelpDrawer";
import Hero from "./components/Hero";
import HowItWorks from "./components/HowItWorks";
import ImpactNumbers from "./components/ImpactNumbers";
import LogoMarquee from "./components/LogoMarquee";
import Navbar from "./components/Navbar";
import SafeIntelligence from "./components/SafeIntelligence";
import ShowcaseTablet, { Candidate, Report } from "./components/ShowcaseTablet";
import TrustQuote from "./components/TrustQuote";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8100";

export default function Home() {
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<"identifier" | "website">("identifier");
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [report, setReport] = useState<Report | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Smooth scroll to showcase
  function scrollToSection(id: string) {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  }

  // Handle Search Submission with Timeout
  async function onSearch(e?: FormEvent, directQuery?: string) {
    if (e) e.preventDefault();
    const searchQuery = (directQuery ?? query).trim();
    if (!searchQuery) return;

    setError(null);
    setCandidates([]);
    setReport(null);
    setIsLoading(true);
    setMessage("Searching independent identity registries…");

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      const response = await fetch(`${API_BASE}/api/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchQuery }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Search request failed (${response.status})`);
      }

      const result = await response.json();
      setCandidates(result.candidates || []);

      if (result.input_type === "invalid_issn") {
        setMessage("That ISSN fails its checksum. Please check digits and try again.");
      } else if (result.candidates && result.candidates.length === 1) {
        // Auto-analyze single candidate
        setMessage("Corroborating candidate record across registries…");
        await analyze(result.candidates[0].id);
      } else if (result.candidates && result.candidates.length > 1) {
        setMessage("Multiple matching candidates found. Please select below.");
        scrollToSection("showcase");
      } else {
        setMessage("No matching record was found in the available sources. That alone does not indicate misconduct.");
      }
    } catch (err: any) {
      clearTimeout(timeoutId);
      if (err.name === "AbortError") {
        setError("Search timed out after 15 seconds. Please check your connection and try again.");
      } else {
        setError(err.message || "Failed to connect to verification backend.");
      }
      setMessage("");
    } finally {
      setIsLoading(false);
    }
  }

  // Handle Deep Evidence Analysis
  async function analyze(id: string) {
    setIsLoading(true);
    setError(null);
    setMessage("Collecting evidence and safely auditing public policies…");
    scrollToSection("showcase");

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);

    try {
      const response = await fetch(`${API_BASE}/api/journals/${id}/analyze`, {
        method: "POST",
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Analysis failed with status ${response.status}`);
      }

      const reportData = await response.json();
      setReport(reportData);
      setCandidates([]);
      setMessage("");
    } catch (err: any) {
      clearTimeout(timeoutId);
      if (err.name === "AbortError") {
        setError("Analysis timed out. Some external providers may be responding slowly.");
      } else {
        setError(err.message || "Could not complete journal analysis.");
      }
      setMessage("");
    } finally {
      setIsLoading(false);
    }
  }

  // Trigger from Quick Pills
  function handleSelectSample(sampleQuery: string) {
    setQuery(sampleQuery);
    onSearch(undefined, sampleQuery);
  }

  return (
    <main style={{ width: "100%", overflowX: "hidden" }}>
      {/* 1. Top Announcement Bar */}
      <AnnouncementBar />

      {/* 2. Sticky Pill Navbar with Dropdowns & Mobile Drawer */}
      <Navbar />

      {/* 3. Radiant Mesh Hero Section */}
      <Hero
        query={query}
        onQueryChange={setQuery}
        onSubmit={(e) => onSearch(e)}
        onSelectSample={handleSelectSample}
        isLoading={isLoading}
        mode={mode}
        onModeChange={setMode}
        message={message}
      />

      {/* 4. Infinite Authority Logos Marquee */}
      <LogoMarquee />

      {/* 5. Interactive Showcase Tablet (Arcade Window) */}
      <ShowcaseTablet
        report={report}
        candidates={candidates}
        isLoading={isLoading}
        onSelectCandidate={analyze}
        error={error}
        onRetry={() => onSearch()}
      />

      {/* 6. Safe Intelligence & Crawler Safeguards */}
      <SafeIntelligence />

      {/* 7. Academic Trust Quote */}
      <TrustQuote />

      {/* 8. 5-Step Pipeline ("How It Works") */}
      <HowItWorks />

      {/* 9. Tabbed Audience Use-Cases */}
      <AudienceTabs />

      {/* 10. Multi-Registry Data Sources Grid */}
      <DataSourcesGrid />

      {/* 11. Impact & Dimensions Numbers */}
      <ImpactNumbers />

      {/* 12. Final Call-to-Action */}
      <FinalCta />

      {/* 13. Comprehensive Footer + Newsletter */}
      <Footer />

      {/* Floating Methodology & Help Drawer */}
      <HelpDrawer />
    </main>
  );
}
