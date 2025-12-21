import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col pt-24`}
      >
        <Navbar />
        <main className="max-w-7xl mx-auto px-6 pb-12 flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
