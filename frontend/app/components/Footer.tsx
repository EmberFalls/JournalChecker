"use client";

import { Shield, ArrowUpRight } from "lucide-react";

export default function Footer() {
  const links = [
    { label: "Verify", href: "#hero-search" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "Data Sources", href: "#data-sources" },
    { label: "API Docs", href: "http://localhost:8100/docs", external: true },
  ];

  return (
    <footer className="border-t border-slate-100 bg-white py-10">
      <div className="mx-auto max-w-5xl px-4 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-900">
            <Shield className="h-3 w-3 text-blue-400" />
          </div>
          Journal Integrity
        </div>

        <div className="flex flex-wrap items-center gap-5 text-xs text-slate-500">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target={link.external ? "_blank" : undefined}
              rel={link.external ? "noreferrer" : undefined}
              className="inline-flex items-center gap-0.5 hover:text-slate-900 transition-colors"
            >
              {link.label}
              {link.external && <ArrowUpRight className="h-3 w-3" />}
            </a>
          ))}
        </div>

        <p className="text-xs text-slate-400">
          © {new Date().getFullYear()} Journal Integrity. Evidence-First.
        </p>
      </div>
    </footer>
  );
}
