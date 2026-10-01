"use client";

interface QuickPillsProps {
  onSelect: (sampleQuery: string) => void;
}

export default function QuickPills({ onSelect }: QuickPillsProps) {
  const samples = [
    {
      label: "PLOS ONE",
      value: "1932-6203",
      type: "positive",
      badge: "DOAJ & Scopus Verified",
    },
    {
      label: "Synthetic Contradiction",
      value: "9999-0008",
      type: "demo",
      badge: "Synthetic Fixture",
    },
    {
      label: "DGRSDT Listed Record",
      value: "1009-6744",
      type: "flagged",
      badge: "Source-Specific List",
    },
    {
      label: "Invalid Checksum",
      value: "1234-5678",
      type: "invalid",
      badge: "Checksum Test",
    },
  ];

  return (
    <div className="quick-pills-row">
      <span className="quick-pills-label">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
        </svg>
        Try verified test fixtures:
      </span>
      {samples.map((sample) => (
        <button
          key={sample.value}
          type="button"
          className="quick-pill-btn"
          onClick={() => onSelect(sample.value)}
          aria-label={`Test query ${sample.label} (${sample.value})`}
        >
          <span>{sample.label}</span>
          <span style={{ fontSize: "11px", opacity: 0.7, fontFamily: "monospace" }}>
            {sample.value}
          </span>
        </button>
      ))}
    </div>
  );
}
