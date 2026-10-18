import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/auth/AuthContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ATSForge AI — Beat the ATS. Land the Interview.",
  description:
    "Production-grade AI resume creation, deterministic 8-factor ATS scoring, real Google authentication, and intelligent career preparation tools.",
  keywords: [
    "ATS Resume Optimizer",
    "AI Resume Tailor",
    "Resume Scanner",
    "Google OAuth Resume Builder",
    "Cover Letter Generator",
  ],
  authors: [{ name: "ATSForge AI" }],
  openGraph: {
    title: "ATSForge AI — Beat the ATS. Land the Interview.",
    description:
      "Production-grade AI resume builder with real Google authentication, user-owned document isolation, deterministic ATS scoring, and career tools.",
    siteName: "ATSForge AI",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full scroll-smooth">
      <body className={`${inter.className} min-h-screen flex flex-col bg-neutral-50 text-neutral-900`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
