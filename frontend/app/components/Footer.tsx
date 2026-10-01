"use client";

import { FormEvent, useState } from "react";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [newsletterStatus, setNewsletterStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  function handleSubscribe(e: FormEvent) {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setNewsletterStatus("error");
      setErrorMessage("Please enter a valid academic or professional email.");
      return;
    }
    setNewsletterStatus("loading");
    setTimeout(() => {
      setNewsletterStatus("success");
      setEmail("");
    }, 600);
  }

  return (
    <footer className="footer" aria-label="Website Footer">
      <div className="container">
        <div className="footer-grid">
          {/* Brand & Newsletter Column */}
          <div className="footer-col">
            <div className="brand-logo" style={{ marginBottom: "16px" }}>
              <div className="brand-disc"><div className="brand-disc-inner" /></div>
              <span>JOURNAL INTEGRITY</span>
            </div>
            <p style={{ fontSize: "14px", color: "var(--text-muted)", marginBottom: "20px", maxWidth: "320px", lineHeight: 1.55 }}>
              Evidence-first scholarly journal verification engine. Traceable facts over binary blacklists.
            </p>

            {/* Newsletter Subscription */}
            <div style={{ maxWidth: "340px" }}>
              <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-headline)", display: "block", marginBottom: "8px" }}>
                Dataset & Methodology Updates
              </span>
              <form onSubmit={handleSubscribe} aria-label="Methodology newsletter subscription">
                <div style={{ display: "flex", gap: "6px" }}>
                  <input
                    type="email"
                    placeholder="name@university.edu"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (newsletterStatus === "error") setNewsletterStatus("idle");
                    }}
                    style={{
                      flex: 1,
                      padding: "8px 12px",
                      borderRadius: "8px",
                      border: "1px solid var(--border-subtle)",
                      fontSize: "13.5px",
                      fontFamily: "inherit",
                    }}
                    disabled={newsletterStatus === "loading" || newsletterStatus === "success"}
                    aria-label="Email address"
                  />
                  <button
                    type="submit"
                    className="btn-primary-pill"
                    style={{ padding: "8px 14px", fontSize: "13px" }}
                    disabled={newsletterStatus === "loading" || newsletterStatus === "success"}
                  >
                    {newsletterStatus === "loading" ? "Subscribing…" : "Subscribe"}
                  </button>
                </div>
              </form>
              {newsletterStatus === "success" && (
                <p style={{ fontSize: "12.5px", color: "var(--status-verified)", marginTop: "6px", fontWeight: 600 }}>
                  ✓ Subscribed to dataset freshness & methodology releases.
                </p>
              )}
              {newsletterStatus === "error" && (
                <p style={{ fontSize: "12.5px", color: "var(--status-contradicted)", marginTop: "6px", fontWeight: 600 }}>
                  {errorMessage}
                </p>
              )}
            </div>
          </div>

          {/* Product Links */}
          <div className="footer-col">
            <h4>Platform</h4>
            <ul>
              <li><a href="#hero-search">Journal Verification</a></li>
              <li><a href="#showcase">Interactive Showcase</a></li>
              <li><a href="#how-it-works">5-Step Pipeline</a></li>
              <li><a href="#dimensions">7 Audit Dimensions</a></li>
            </ul>
          </div>

          {/* Authorities & Data */}
          <div className="footer-col">
            <h4>Registries</h4>
            <ul>
              <li><a href="https://doaj.org" target="_blank" rel="noreferrer">DOAJ Directory ↗</a></li>
              <li><a href="https://www.elsevier.com/products/scopus" target="_blank" rel="noreferrer">Elsevier Scopus ↗</a></li>
              <li><a href="https://clarivate.com" target="_blank" rel="noreferrer">Web of Science ↗</a></li>
              <li><a href="https://crossref.org" target="_blank" rel="noreferrer">Crossref Metadata ↗</a></li>
              <li><a href="https://scimagojr.com" target="_blank" rel="noreferrer">SCImago Rank ↗</a></li>
            </ul>
          </div>

          {/* Documentation & Standards */}
          <div className="footer-col">
            <h4>Standards & Docs</h4>
            <ul>
              <li><a href="http://localhost:8100/docs" target="_blank" rel="noreferrer">FastAPI REST Docs ↗</a></li>
              <li><a href="#safe-crawling">Crawler Sandbox Security</a></li>
              <li><a href="https://thinkchecksubmit.org" target="_blank" rel="noreferrer">Think. Check. Submit. ↗</a></li>
              <li><a href="https://publicationethics.org" target="_blank" rel="noreferrer">COPE Guidelines ↗</a></li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom Bar */}
        <div className="footer-bottom">
          <span>
            © {new Date().getFullYear()} Journal Integrity Verification Engine. Open Research & Public Evidence.
          </span>
          <div style={{ display: "flex", gap: "16px" }}>
            <a href="https://github.com" target="_blank" rel="noreferrer" aria-label="GitHub Repository">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
