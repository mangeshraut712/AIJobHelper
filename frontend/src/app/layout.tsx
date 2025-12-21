import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// Use Inter as it's closest to Apple's SF Pro available on Google Fonts
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "CareerAgentPro - AI-Powered Career Platform",
  description: "Your AI Career Co-Pilot. Automate job search, optimize resumes with AI, and land your dream role with CareerAgentPro.",
  keywords: ["AI resume", "job search", "career platform", "resume optimization", "job application"],
  authors: [{ name: "Mangesh Raut" }],
  openGraph: {
    title: "CareerAgentPro - AI-Powered Career Platform",
    description: "Your AI Career Co-Pilot. Automate job search, optimize resumes, and land your dream role.",
    url: "https://ai-job-helper-steel.vercel.app",
    siteName: "CareerAgentPro",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CareerAgentPro - AI Career Platform",
    description: "Your AI Career Co-Pilot for job search automation.",
  },
};

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} font-sans antialiased min-h-screen flex flex-col`}
        suppressHydrationWarning
      >
        <Navbar />
        <main className="flex-1 pt-20">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
