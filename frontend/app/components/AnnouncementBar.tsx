"use client";

export default function AnnouncementBar() {
  return (
    <aside className="announcement-bar" aria-label="Platform Announcement">
      <span className="announcement-badge">Methodology Update</span>
      <span>
        Evidence-first verification engine v1.0 is live.{" "}
        <a href="#how-it-works">
          Read our conservative risk standards
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </a>
      </span>
    </aside>
  );
}
