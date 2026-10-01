"use client";

import { useEffect, useRef, useState } from "react";
import { HelpCircle, X, Shield, CheckCircle2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HelpDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      {/* Floating Info Button */}
      <button
        type="button"
        className="fixed bottom-6 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 text-white shadow-lg hover:bg-slate-800 transition-all hover:scale-105 active:scale-95"
        aria-label="Open Methodology & Help Guide"
        onClick={() => setIsOpen(true)}
      >
        <HelpCircle className="h-6 w-6" />
      </button>

      {/* Slide-out Drawer Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex justify-end transition-opacity"
          ref={drawerRef}
          onClick={(e) => {
            if (e.target === drawerRef.current) setIsOpen(false);
          }}
        >
          <div
            className="w-full max-w-md bg-white h-full p-6 sm:p-8 shadow-2xl flex flex-col justify-between overflow-y-auto"
            role="dialog"
            aria-modal="true"
            aria-label="Methodology & Help Guide"
          >
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-5 border-b border-slate-100">
                <div className="flex items-center gap-2.5 font-bold text-slate-900">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 text-white">
                    <Shield className="h-3.5 w-3.5 text-blue-400" />
                  </div>
                  <span>Methodology Guide</span>
                </div>
                <button
                  type="button"
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
                  onClick={() => setIsOpen(false)}
                  aria-label="Close help guide"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Guide Content */}
              <div className="mt-6 flex flex-col gap-6 text-sm">
                <div>
                  <h4 className="font-semibold text-slate-900 mb-1.5 flex items-center gap-1.5">
                    <span className="text-blue-600 font-mono text-xs">01</span>
                    Absence Is Not Misconduct
                  </h4>
                  <p className="text-slate-500 leading-relaxed">
                    Missing a record in DOAJ or Scopus does not imply a journal is predatory. Many legitimate regional or newly launched journals simply have not yet completed indexing application processes.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-slate-900 mb-1.5 flex items-center gap-1.5">
                    <span className="text-blue-600 font-mono text-xs">02</span>
                    ISSN Checksum Verification
                  </h4>
                  <p className="text-slate-500 leading-relaxed">
                    An ISSN is an 8-digit code (e.g., 1932-6203). The final digit is a Modulus-11 check digit based on descending positional multipliers to prevent typos.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-slate-900 mb-1.5 flex items-center gap-1.5">
                    <span className="text-blue-600 font-mono text-xs">03</span>
                    The 7 Evaluation Dimensions
                  </h4>
                  <ul className="mt-2 space-y-1.5 text-xs text-slate-600 pl-2">
                    <li className="flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                      <span><strong>Identity:</strong> Canonical publisher and title corroboration</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                      <span><strong>Indexing:</strong> Active vs. discontinued registry listings</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                      <span><strong>Claims:</strong> Website claims vs. observed databases</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                      <span><strong>Transparency:</strong> Peer-review, ethics, and APC fees</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                      <span><strong>Editorial:</strong> Board member public records</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                      <span><strong>Domain:</strong> Official URLs vs. hijacked clones</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                      <span><strong>Notices:</strong> Source-specific warning registries</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-slate-900 mb-1.5 flex items-center gap-1.5">
                    <span className="text-blue-600 font-mono text-xs">04</span>
                    Safe Crawler Guardrails
                  </h4>
                  <p className="text-slate-500 leading-relaxed">
                    Our crawler operates inside a strict SSRF-protected sandbox, validating DNS resolution before every request and limiting size/depth for safe analysis.
                  </p>
                </div>
              </div>
            </div>

            {/* Footer Button */}
            <div className="pt-6 border-t border-slate-100 mt-6">
              <Button
                className="w-full rounded-full bg-slate-900 hover:bg-slate-800 text-white font-medium"
                onClick={() => setIsOpen(false)}
              >
                Close Guide
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
