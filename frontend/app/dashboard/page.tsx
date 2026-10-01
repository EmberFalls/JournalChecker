"use client";

import { Suspense, useState, useEffect, FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Shield, LogOut, User, History, ArrowLeft, Download, RefreshCw } from "lucide-react";
import { useAuth } from "@/lib/auth";
import ModeToggle from "../components/ModeToggle";
import SearchCapsule from "../components/SearchCapsule";
import QuickPills from "../components/QuickPills";
import ShowcaseTablet, { Candidate, Report } from "../components/ShowcaseTablet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8100";

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const { user, isAuthenticated, logout, addSearchHistory, searchHistory } = useAuth();

  const [query, setQuery] = useState(initialQuery);
  const [mode, setMode] = useState<"identifier" | "website">("identifier");
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [report, setReport] = useState<Report | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Auth Protection
  useEffect(() => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/dashboard${initialQuery ? `&q=${encodeURIComponent(initialQuery)}` : ""}`);
    }
  }, [isAuthenticated, router, initialQuery]);

  // Execute initial search if query passed in URL
  useEffect(() => {
    if (initialQuery && isAuthenticated) {
      runSearch(initialQuery, mode);
    }
  }, [initialQuery, isAuthenticated]);

  async function runSearch(q: string, searchMode: "identifier" | "website") {
    if (!q.trim()) return;
    setIsLoading(true);
    setError(null);
    setMessage("");
    setCandidates([]);

    try {
      if (searchMode === "website") {
        const payload = { target: q, max_crawl_pages: 5, depth: 1 };
        const res = await fetch(`${API_BASE}/api/analyze/website`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error(`Website analysis returned code ${res.status}`);
        const data = await res.json();
        setReport(data);

        // Record in search history
        addSearchHistory({
          query: q,
          mode: searchMode,
          title: data.journal?.current_title || q,
          assessment: data.assessment || "COMPLETED",
          confidence: data.confidence || 0.85,
          coverage: data.coverage || 0.8,
          identifiers: data.journal?.identifiers || [],
        });
      } else {
        const res = await fetch(`${API_BASE}/api/search`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: q }),
        });
        if (!res.ok) throw new Error(`Search returned code ${res.status}`);
        const data = await res.json();

        if (data.candidates && data.candidates.length > 0) {
          setCandidates(data.candidates);
          setMessage(`Found ${data.candidates.length} matching candidate journals.`);
          // Fetch report for first match
          await fetchReport(data.candidates[0].id, q);
        } else {
          setReport(null);
          setMessage("No matching journals found across registries.");
        }
      }
    } catch (err: any) {
      setError(err.message || "Failed to communicate with verification engine.");
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchReport(id: string, originalQuery: string) {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/journals/${encodeURIComponent(id)}/analyze`, {
        method: "POST",
      });
      if (!res.ok) throw new Error(`Analysis returned code ${res.status}`);
      const data = await res.json();
      setReport(data);

      // Record in search history
      addSearchHistory({
        query: originalQuery,
        mode: "identifier",
        title: data.journal?.current_title || originalQuery,
        assessment: data.assessment || "COMPLETED",
        confidence: data.confidence || 0.9,
        coverage: data.coverage || 0.85,
        identifiers: data.journal?.identifiers || [id],
      });
    } catch (err: any) {
      setError(err.message || "Failed to load detailed report.");
    } finally {
      setIsLoading(false);
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    runSearch(query, mode);
  }

  function handleSelectSample(sampleQuery: string) {
    setQuery(sampleQuery);
    runSearch(sampleQuery, mode);
  }

  function handleExportReport() {
    if (!report) return;
    const jsonStr = JSON.stringify(report, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `verification-report-${report.journal.current_title.replace(/[^a-z0-9]/gi, "_")}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-900 flex flex-col">
      {/* Dashboard Top Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-md px-4 py-3">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2.5 font-bold text-slate-900 text-sm">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-white">
                <Shield className="h-4 w-4 text-blue-400" />
              </div>
              <span className="tracking-tight hidden sm:inline">Journal Integrity</span>
            </Link>
            <span className="rounded-full bg-blue-50 border border-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
              Researcher Workspace
            </span>
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-3">
            <Link href="/profile">
              <Button variant="ghost" size="sm" className="gap-1.5 text-xs font-medium text-slate-700">
                <History className="h-4 w-4 text-slate-500" />
                <span className="hidden sm:inline">Past Searches</span>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                  {searchHistory.length}
                </span>
              </Button>
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-full p-1 border border-slate-200 hover:border-slate-300 transition-colors focus:outline-none">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-slate-900 text-white font-bold text-xs">
                      {user?.name?.slice(0, 2).toUpperCase() || "US"}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="font-bold text-slate-900">{user?.name}</div>
                  <div className="text-[11px] font-normal text-slate-500 truncate">{user?.email}</div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push("/profile")}>
                  <User className="h-4 w-4" />
                  Profile & History
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("http://localhost:8100/docs")}>
                  <Shield className="h-4 w-4" />
                  API Documentation
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-red-600 focus:text-red-600">
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Workspace Body */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8 space-y-8">
        {/* Search Command Header */}
        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-sm text-center">
          <div className="max-w-2xl mx-auto space-y-4">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Run Scholarly Journal Verification
            </h1>
            <p className="text-xs sm:text-sm text-slate-600">
              Query official registers across DOAJ, Scopus, Web of Science, and Crossref in real-time.
            </p>

            <div className="pt-2">
              <ModeToggle mode={mode} onModeChange={setMode} />
            </div>

            <SearchCapsule
              query={query}
              onQueryChange={setQuery}
              onSubmit={handleSubmit}
              isLoading={isLoading}
              mode={mode}
              message={message}
            />

            <QuickPills onSelect={handleSelectSample} />
          </div>
        </div>

        {/* Action Header for Report */}
        {report && (
          <div className="flex items-center justify-between bg-white rounded-2xl border border-slate-200/80 px-6 py-3 shadow-sm">
            <span className="text-xs font-semibold text-slate-600">
              Active Evaluation: <strong className="text-slate-900">{report.journal.current_title}</strong>
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportReport}
              className="gap-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              <Download className="h-3.5 w-3.5 text-blue-600" />
              Export Report JSON
            </Button>
          </div>
        )}

        {/* Verification Tablet View */}
        <ShowcaseTablet
          report={report}
          candidates={candidates}
          isLoading={isLoading}
          onSelectCandidate={(id) => fetchReport(id, query)}
          error={error}
          onRetry={() => runSearch(query, mode)}
        />
      </main>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="p-8 text-xs font-medium text-slate-400 text-center">Loading dashboard workspace…</div>}>
      <DashboardContent />
    </Suspense>
  );
}
