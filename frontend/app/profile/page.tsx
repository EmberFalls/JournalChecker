"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Shield,
  ArrowLeft,
  Search,
  Trash2,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  XCircle,
  HelpCircle,
  Key,
  Copy,
  Check,
  Building,
  Mail,
  User,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, searchHistory, clearHistory, logout } = useAuth();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterVerdict, setFilterVerdict] = useState<string>("all");
  const [copiedKey, setCopiedKey] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login?redirect=/profile");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated || !user) return null;

  function copyApiKey() {
    if (!user) return;
    navigator.clipboard.writeText(user.apiKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  }

  // Filter history
  const filteredHistory = searchHistory.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.query.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.identifiers.some((id) => id.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesVerdict =
      filterVerdict === "all" || item.assessment.toLowerCase().includes(filterVerdict.toLowerCase());

    return matchesSearch && matchesVerdict;
  });

  function getVerdictBadge(assessment: string) {
    const norm = assessment.toLowerCase();
    if (norm.includes("low_risk") || norm.includes("verified")) {
      return (
        <Badge variant="success" className="px-2.5 py-0.5 text-[11px]">
          <ShieldCheck className="h-3 w-3" />
          Low Risk
        </Badge>
      );
    }
    if (norm.includes("some_concerns") || norm.includes("warning")) {
      return (
        <Badge variant="warning" className="px-2.5 py-0.5 text-[11px]">
          <AlertTriangle className="h-3 w-3" />
          Some Concerns
        </Badge>
      );
    }
    if (norm.includes("high_risk") || norm.includes("contradicted")) {
      return (
        <Badge variant="destructive" className="px-2.5 py-0.5 text-[11px]">
          <XCircle className="h-3 w-3" />
          High Risk
        </Badge>
      );
    }
    return (
      <Badge variant="subtle" className="px-2.5 py-0.5 text-[11px]">
        <HelpCircle className="h-3 w-3" />
        Evaluated
      </Badge>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-900 flex flex-col">
      {/* Navigation Bar */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-md px-4 py-3">
        <div className="mx-auto max-w-6xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 px-3 py-1.5 rounded-full transition-all"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Workspace
            </Link>
          </div>

          <Link href="/" className="flex items-center gap-2 font-bold text-slate-900 text-sm">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 text-white">
              <Shield className="h-3.5 w-3.5 text-blue-400" />
            </div>
            <span className="tracking-tight">Journal Integrity</span>
          </Link>

          <Button variant="ghost" size="sm" onClick={logout} className="text-xs text-red-600 hover:bg-red-50">
            Sign Out
          </Button>
        </div>
      </header>

      {/* Profile Body */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8 space-y-8">
        {/* User Identity Card */}
        <Card className="rounded-3xl border border-slate-200/90 bg-white shadow-sm overflow-hidden">
          <div className="bg-[url('/hero-gradient-bg.jpg')] bg-cover bg-center h-24 border-b border-slate-100" />
          <CardContent className="p-6 sm:p-8 -mt-12">
            <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 pb-6 border-b border-slate-100">
              <div className="flex items-end gap-4">
                <Avatar className="h-20 w-20 border-4 border-white shadow-md">
                  <AvatarFallback className="bg-slate-900 text-white font-bold text-2xl">
                    {user.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900">{user.name}</h1>
                  <p className="text-xs font-medium text-slate-500">{user.role}</p>
                </div>
              </div>

              <Badge variant="subtle" className="px-3 py-1 text-xs">
                Verified Academic Researcher
              </Badge>
            </div>

            {/* Profile Metadata Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-6">
              <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 flex items-center gap-3">
                <Mail className="h-4 w-4 text-blue-600 shrink-0" />
                <div className="truncate">
                  <div className="text-[11px] font-medium text-slate-400">Email Address</div>
                  <div className="text-xs font-semibold text-slate-900 truncate">{user.email}</div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 flex items-center gap-3">
                <Building className="h-4 w-4 text-blue-600 shrink-0" />
                <div className="truncate">
                  <div className="text-[11px] font-medium text-slate-400">Institution</div>
                  <div className="text-xs font-semibold text-slate-900 truncate">{user.institution}</div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 flex items-center justify-between">
                <div className="flex items-center gap-2.5 truncate">
                  <Key className="h-4 w-4 text-blue-600 shrink-0" />
                  <div className="truncate">
                    <div className="text-[11px] font-medium text-slate-400">API Key</div>
                    <div className="text-xs font-mono font-semibold text-slate-900 truncate max-w-[120px]">
                      {user.apiKey}
                    </div>
                  </div>
                </div>
                <Button size="sm" variant="ghost" onClick={copyApiKey} className="h-8 w-8 p-0 shrink-0">
                  {copiedKey ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Verification History Suite */}
        <Card className="rounded-3xl border border-slate-200/90 bg-white shadow-sm overflow-hidden">
          <CardHeader className="p-6 sm:p-8 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100">
            <div>
              <CardTitle className="text-xl font-bold text-slate-900">Past Search & Verification History</CardTitle>
              <CardDescription className="text-xs text-slate-500 mt-1">
                All scholarly journal lookups performed under your account.
              </CardDescription>
            </div>

            {searchHistory.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearHistory}
                className="gap-1.5 text-xs text-red-600 hover:bg-red-50 hover:border-red-200 self-start sm:self-auto"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Clear History
              </Button>
            )}
          </CardHeader>

          <CardContent className="p-6 sm:p-8 space-y-6">
            {/* Filter Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Filter by title or ISSN…"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 h-10 rounded-xl text-xs"
                />
              </div>

              {/* Filter Pills */}
              <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
                {[
                  { label: "All", value: "all" },
                  { label: "Low Risk", value: "low_risk" },
                  { label: "Some Concerns", value: "some_concerns" },
                  { label: "High Risk", value: "high_risk" },
                ].map((pill) => (
                  <button
                    key={pill.value}
                    type="button"
                    onClick={() => setFilterVerdict(pill.value)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                      filterVerdict === pill.value
                        ? "bg-slate-900 text-white shadow-sm"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {pill.label}
                  </button>
                ))}
              </div>
            </div>

            {/* History Table / Empty State */}
            {filteredHistory.length === 0 ? (
              <div className="py-12 text-center max-w-sm mx-auto">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 mb-3">
                  <Shield className="h-6 w-6" />
                </div>
                <h3 className="text-sm font-semibold text-slate-900 mb-1">No Past Verifications Found</h3>
                <p className="text-xs text-slate-500 mb-4">
                  {searchTerm || filterVerdict !== "all"
                    ? "No records match your active filters."
                    : "Run your first journal evaluation in the dashboard."}
                </p>
                <Link href="/dashboard">
                  <Button size="sm" className="bg-blue-600 text-white hover:bg-blue-700">
                    Go to Workspace
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredHistory.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 transition-all hover:border-slate-300 hover:shadow-sm gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900">{item.title}</span>
                        {getVerdictBadge(item.assessment)}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                        <span>Query: <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">{item.query}</code></span>
                        <span>Mode: {item.mode}</span>
                        <span>Confidence: {Math.round(item.confidence * 100)}%</span>
                        <span>{new Date(item.timestamp).toLocaleString()}</span>
                      </div>
                    </div>

                    <Link href={`/dashboard?q=${encodeURIComponent(item.query)}`}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5 text-xs font-semibold text-blue-600 border-blue-100 bg-blue-50/50 hover:bg-blue-100 shrink-0"
                      >
                        Inspect Report
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
