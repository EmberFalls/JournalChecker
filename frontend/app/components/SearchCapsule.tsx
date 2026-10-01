"use client";

import { FormEvent, useMemo } from "react";

interface SearchCapsuleProps {
  query: string;
  onQueryChange: (q: string) => void;
  onSubmit: (e: FormEvent) => void;
  isLoading: boolean;
  mode: "identifier" | "website";
  message?: string;
}

// Client-side quick ISSN checksum validator
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
    <div className="search-capsule-container">
      <form onSubmit={onSubmit} aria-label="Journal verification search">
        <div className="search-capsule">
          <input
            id="hero-search-input"
            type="text"
            className="search-input"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder={
              mode === "identifier"
                ? "Search by ISSN (e.g. 1932-6203), DOI, or Journal Title…"
                : "Enter journal domain or URL (e.g. https://plos.org)…"
            }
            required
            aria-label="Search query"
            disabled={isLoading}
          />
          <button
            type="submit"
            className="search-submit-btn"
            aria-label="Search journal"
            disabled={isLoading}
          >
            {isLoading ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="animate-spin" aria-hidden="true">
                <circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="12" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 19V5M5 12l7-7 7 7" />
              </svg>
            )}
          </button>
        </div>
      </form>

      {/* Realtime ISSN checksum badge / helper */}
      {issnStatus !== null && (
        <div style={{ marginTop: "8px", fontSize: "13px", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
          {issnStatus ? (
            <span style={{ color: "#a7f3d0", fontWeight: 600 }}>✓ Valid ISSN checksum</span>
          ) : (
            <span style={{ color: "#fecaca", fontWeight: 600 }}>⚠ ISSN fails checksum. Please verify digits.</span>
          )}
        </div>
      )}

      {/* Message feedback */}
      {message && <p className="search-feedback" role="status">{message}</p>}
    </div>
  );
}
