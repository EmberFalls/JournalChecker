"use client";

import { Search, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModeToggleProps {
  mode: "identifier" | "website";
  onModeChange: (mode: "identifier" | "website") => void;
}

export default function ModeToggle({ mode, onModeChange }: ModeToggleProps) {
  return (
    <div
      className="inline-flex items-center rounded-full bg-slate-900/90 p-1 backdrop-blur-sm shadow-sm"
      role="radiogroup"
      aria-label="Verification mode"
    >
      <button
        type="button"
        role="radio"
        aria-checked={mode === "identifier"}
        onClick={() => onModeChange("identifier")}
        className={cn(
          "flex items-center gap-1.5 rounded-full px-5 py-2 text-xs sm:text-sm font-medium transition-all",
          mode === "identifier"
            ? "bg-white text-slate-900 shadow-sm"
            : "text-slate-300 hover:text-white"
        )}
      >
        <Search className="h-3.5 w-3.5" />
        ISSN / DOI / Title
      </button>
      <button
        type="button"
        role="radio"
        aria-checked={mode === "website"}
        onClick={() => onModeChange("website")}
        className={cn(
          "flex items-center gap-1.5 rounded-full px-5 py-2 text-xs sm:text-sm font-medium transition-all",
          mode === "website"
            ? "bg-white text-slate-900 shadow-sm"
            : "text-slate-300 hover:text-white"
        )}
      >
        <Globe className="h-3.5 w-3.5" />
        Website Domain
      </button>
    </div>
  );
}
