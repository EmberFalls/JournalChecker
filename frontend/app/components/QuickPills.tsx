"use client";

interface QuickPillsProps {
  onSelect: (sampleQuery: string) => void;
}

const samples = [
  { label: "PLOS ONE", value: "1932-6203" },
  { label: "Synthetic Demo", value: "9999-0008" },
  { label: "DGRSDT Listed", value: "1009-6744" },
  { label: "Invalid Checksum", value: "1234-5678" },
];

export default function QuickPills({ onSelect }: QuickPillsProps) {
  return (
    <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
      <span className="text-xs text-slate-500">Try a sample:</span>
      {samples.map((sample) => (
        <button
          key={sample.value}
          type="button"
          onClick={() => onSelect(sample.value)}
          className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition-colors"
        >
          {sample.label}
        </button>
      ))}
    </div>
  );
}
