import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// Inter is the gold standard for high-legibility SaaS interfaces
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "GhostOrder KDS",
  description: "Enterprise Kitchen Display System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Hardcoding 'dark' here permanently locks the theme
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-[#09090b] text-slate-100 antialiased min-h-screen`}>
        {children}
      </body>
    </html>
  );
}