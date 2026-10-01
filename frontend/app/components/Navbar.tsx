"use client";

import { useEffect, useRef, useState } from "react";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && mobileOpen) {
        setMobileOpen(false);
      }
    }
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <header className="navbar-wrapper">
      <nav className="navbar-pill" aria-label="Main Navigation">
        {/* Brand Logo */}
        <a href="#" className="brand-logo" aria-label="Journal Integrity Homepage">
          <div className="brand-disc" aria-hidden="true">
            <div className="brand-disc-inner" />
          </div>
          <span>JOURNAL INTEGRITY</span>
        </a>

        {/* Desktop Navigation Links with Dropdowns */}
        <ul className="nav-links" role="menubar">
          {/* Methodology Dropdown */}
          <li className="nav-item-dropdown" role="none">
            <button
              className="nav-link-btn"
              role="menuitem"
              aria-haspopup="true"
              aria-expanded="false"
            >
              Methodology
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>
            <div className="dropdown-menu" role="menu">
              <a href="#how-it-works" className="dropdown-item" role="menuitem">
                <span className="dropdown-item-title">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                  Conservative Scoring
                </span>
                <span className="dropdown-item-desc">Why missing evidence is never treated as proof of misconduct.</span>
              </a>
              <a href="#safe-crawling" className="dropdown-item" role="menuitem">
                <span className="dropdown-item-title">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  Safe Web Crawler
                </span>
                <span className="dropdown-item-desc">SSRF-protected policy extraction without scraper risks.</span>
              </a>
            </div>
          </li>

          {/* Authorities Dropdown */}
          <li className="nav-item-dropdown" role="none">
            <button
              className="nav-link-btn"
              role="menuitem"
              aria-haspopup="true"
              aria-expanded="false"
            >
              Authorities
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>
            <div className="dropdown-menu" role="menu">
              <a href="#data-sources" className="dropdown-item" role="menuitem">
                <span className="dropdown-item-title">6 Scholarly Registries</span>
                <span className="dropdown-item-desc">DOAJ, Scopus, Web of Science, Crossref, SCImago, and DGRSDT.</span>
              </a>
              <a href="#marquee" className="dropdown-item" role="menuitem">
                <span className="dropdown-item-title">Live Indexing Checks</span>
                <span className="dropdown-item-desc">Serial Title API and Starter API real-time lookups.</span>
              </a>
            </div>
          </li>

          {/* 7 Dimensions */}
          <li role="none">
            <a href="#dimensions" className="nav-link-btn" role="menuitem">
              7 Dimensions
            </a>
          </li>

          {/* Use Cases */}
          <li role="none">
            <a href="#audiences" className="nav-link-btn" role="menuitem">
              Use Cases
            </a>
          </li>

          {/* API Docs */}
          <li role="none">
            <a href="http://localhost:8100/docs" target="_blank" rel="noreferrer" className="nav-link-btn" role="menuitem">
              API Docs
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </a>
          </li>
        </ul>

        {/* Action Buttons */}
        <div className="nav-actions">
          <a href="#showcase" className="btn-ghost-pill">
            View Test Suite
          </a>
          <a href="#hero-search" className="btn-primary-pill">
            <span>Verify Journal</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>
        </div>

        {/* Mobile Toggle Button */}
        <button
          className="mobile-menu-btn"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {mobileOpen ? (
              <path d="M18 6L6 18M6 6l12 12" />
            ) : (
              <path d="M3 12h18M3 6h18M3 18h18" />
            )}
          </svg>
        </button>
      </nav>

      {/* Mobile Menu Drawer */}
      {mobileOpen && (
        <div
          className="help-drawer-overlay"
          ref={mobileMenuRef}
          onClick={(e) => {
            if (e.target === mobileMenuRef.current) setMobileOpen(false);
          }}
        >
          <div className="help-drawer" role="dialog" aria-modal="true" aria-label="Mobile Navigation Menu">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div className="brand-logo">
                <div className="brand-disc"><div className="brand-disc-inner" /></div>
                <span>JOURNAL INTEGRITY</span>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                className="btn-ghost-pill"
                style={{ padding: "6px 12px" }}
                aria-label="Close menu"
              >
                ✕
              </button>
            </div>
            <nav style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "16px" }}>
              <a href="#how-it-works" onClick={() => setMobileOpen(false)} style={{ fontSize: "16px", fontWeight: 600 }}>
                Methodology
              </a>
              <a href="#data-sources" onClick={() => setMobileOpen(false)} style={{ fontSize: "16px", fontWeight: 600 }}>
                Authorities & Registries
              </a>
              <a href="#dimensions" onClick={() => setMobileOpen(false)} style={{ fontSize: "16px", fontWeight: 600 }}>
                7 Dimensions Matrix
              </a>
              <a href="#audiences" onClick={() => setMobileOpen(false)} style={{ fontSize: "16px", fontWeight: 600 }}>
                Use Cases
              </a>
              <a href="http://localhost:8100/docs" target="_blank" rel="noreferrer" style={{ fontSize: "16px", fontWeight: 600, color: "var(--brand-primary)" }}>
                API Documentation ↗
              </a>
            </nav>
            <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: "10px" }}>
              <a
                href="#hero-search"
                onClick={() => setMobileOpen(false)}
                className="btn-primary-pill"
                style={{ justifyContent: "center", width: "100%" }}
              >
                Verify a Journal Now
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
