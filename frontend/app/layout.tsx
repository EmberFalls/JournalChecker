import "./styles.css";

export const metadata = { title: "Journal Integrity", description: "Evidence-first journal verification" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}

