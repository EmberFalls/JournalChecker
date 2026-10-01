"use client";

interface ModeToggleProps {
  mode: "identifier" | "website";
  onModeChange: (mode: "identifier" | "website") => void;
}

export default function ModeToggle({ mode, onModeChange }: ModeToggleProps) {
  return (
    <div
      className="mode-toggle-group"
      role="radiogroup"
      aria-label="Verification Search Mode"
    >
      <button
        type="button"
        role="radio"
        aria-checked={mode === "identifier"}
        className="mode-toggle-btn"
        onClick={() => onModeChange("identifier")}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        Identifier (ISSN / DOI / Title)
      </button>

      <button
        type="button"
        role="radio"
        aria-checked={mode === "website"}
        className="mode-toggle-btn"
        onClick={() => onModeChange("website")}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="10" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
        Journal Website Domain
      </button>
    </div>
  );
}
