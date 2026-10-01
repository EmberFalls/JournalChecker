"use client";

import { FormEvent, useMemo } from "react";
import { ArrowUp, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

interface SearchCapsuleProps {
  query: string;
  onQueryChange: (q: string) => void;
  onSubmit: (e: FormEvent) => void;
  isLoading: boolean;
  mode: "identifier" | "website";
  message?: string;
}

function validateIssnChecksum(raw: string): boolean | null {
  const cleaned = raw.replace(/[^0-9Xx]/g, "").toUpperCase();
  if (cleaned.length !== 8) return null;
  let sum = 0;
  for (let i = 0; i < 7; i++) {
    sum += parseInt(cleaned[i], 10) * (8 - i);
  }
  const checkChar = cleaned[7];
  const expectedCheck = (11 - (sum % 11)) % 11;
  const actualCheck = checkChar === "X" ? 10 : parseInt(checkChar, 10);
  return expectedCheck === actualCheck;
}

export default function SearchCapsule({
  query,
  onQueryChange,
  onSubmit,
  isLoading,
  mode,
  message,
}: SearchCapsuleProps) {
  const issnStatus = useMemo(() => {
    if (mode !== "identifier") return null;
    const isPotentialIssn = /^[0-9]{4}-?[0-9]{3}[0-9Xx]$/.test(query.trim());
    if (!isPotentialIssn) return null;
    return validateIssnChecksum(query.trim());
  }, [query, mode]);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={onSubmit} aria-label="Journal search form">
        <div className="flex items-center h-16 w-full rounded-full bg-white border border-slate-200/90 pl-6 pr-2 shadow-[0_12px_32px_rgba(33,66,231,0.08),0_2px_6px_rgba(0,0,0,0.04)] focus-within:ring-2 focus-within:ring-blue-600/30 focus-within:border-blue-600 transition-all">
          <input
            id="hero-search-input"
            type="text"
            className="w-full bg-transparent text-base text-slate-900 placeholder:text-slate-400 focus:outline-none"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder={
              mode === "identifier"
                ? "ISSN (e.g. 1932-6203), DOI, or journal title…"
                : "https://journals.plos.org/plosone"
            }
            required
            aria-label="Search query"
            disabled={isLoading}
          />
          <button
            type="submit"
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white shadow-md hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
            aria-label="Submit search"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <ArrowUp className="h-5 w-5 stroke-[2.5]" />
            )}
          </button>
        </div>
      </form>

      {issnStatus !== null && (
        <div className="mt-2 flex items-center justify-center gap-1.5 text-xs font-medium">
          {issnStatus ? (
            <span className="flex items-center gap-1 text-emerald-600">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Valid ISSN checksum
            </span>
          ) : (
            <span className="flex items-center gap-1 text-amber-600">
              <AlertCircle className="h-3.5 w-3.5" />
              Invalid checksum — please verify digits
            </span>
          )}
        </div>
      )}

      {message && (
        <p className="mt-3 text-xs sm:text-sm text-slate-600 text-center" role="status">
          {message}
        </p>
      )}
    </div>
  );
}
