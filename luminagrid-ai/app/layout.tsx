import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "LuminaGrid AI | Data Analytics",
  description: "Intelligent data grid and visualization platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Hardcoding 'dark' here bypasses the broken ThemeProvider and matches your portfolio aesthetic
    <html lang="en" className="dark">
      <body className={`${inter.className} min-h-screen bg-[#09090b] text-slate-100 antialiased`}>
        {children}
      </body>
    </html>
  );
}