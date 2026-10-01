import { Inter } from "next/font/google";
import "./styles.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata = {
  title: "Journal Integrity | Evidence-First Scholarly Verification",
  description:
    "Evidence-first verification engine for scholarly journals. Conservative risk scoring across DOAJ, Scopus, Web of Science, and Crossref without guesswork.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={inter.className}>{children}</body>
    </html>
  );
}

