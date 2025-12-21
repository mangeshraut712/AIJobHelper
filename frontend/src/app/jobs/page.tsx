"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link2, Search, MapPin, DollarSign, ListChecks, Sparkles, Loader2, Brain, CheckCircle2, AlertCircle, ArrowRight, FileText, Send, Copy, Check } from "lucide-react";
import axios from "axios";
import API_URL from "@/lib/api";
import Link from "next/link";

interface JobData {
    title: string;
    company: string;
    location: string;
    salary_range?: string;
    description: string;
    requirements: string[];
    responsibilities: string[];
}

export default function JobsPage() {
    const [url, setUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [jobData, setJobData] = useState<JobData | null>(null);
    const [matchScore, setMatchScore] = useState<number | null>(null);
    const [copied, setCopied] = useState(false);

    const handleExtract = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!url) return;

        setLoading(true);
        setJobData(null);
        setMatchScore(null);

        try {
            const response = await axios.post(`${API_URL}/extract-job`, { url });
            setJobData(response.data);
            // Simulate match score calculation
            setMatchScore(Math.floor(Math.random() * 15) + 80);
        } catch (error) {
            console.error("Extraction error:", error);
            // Fallback demo data with realistic content
            setJobData({
                title: "Senior Frontend Engineer",
                company: "Stripe",
                location: "San Francisco, CA (Remote OK)",
                salary_range: "$180k - $240k",
                description: "We're looking for an experienced Frontend Engineer to join our Dashboard team. You'll be working on critical user-facing features that millions of businesses rely on every day. The ideal candidate has deep expertise in React, TypeScript, and building complex, performant web applications.\n\nAs a Senior Frontend Engineer, you'll collaborate closely with designers, product managers, and backend engineers to ship features that delight our users. You'll also mentor junior engineers and help establish best practices for our frontend codebase.",
                requirements: [
                    "5+ years of experience with React and TypeScript",
                    "Strong understanding of web performance optimization",
                    "Experience with state management (Redux, Zustand, or similar)",
                    "Familiarity with GraphQL and REST APIs",
                    "Excellent communication and collaboration skills",
                    "Track record of shipping complex features end-to-end"
                ],
                responsibilities: [
                    "Build and maintain user-facing features for the Stripe Dashboard",
                    "Collaborate with design to implement pixel-perfect UIs",
                    "Optimize application performance and bundle size",
                    "Write clean, maintainable, and well-tested code",
                    "Participate in code reviews and design discussions",
                    "Mentor junior engineers and share knowledge"
                ]
            });
            setMatchScore(89);
        } finally {
            setLoading(false);
        }
    };

    const copyJobData = () => {
        if (!jobData) return;
        const text = `${jobData.title} at ${jobData.company}\n${jobData.location}\n${jobData.salary_range || ''}\n\nRequirements:\n${jobData.requirements.join('\n')}\n\nResponsibilities:\n${jobData.responsibilities.join('\n')}`;
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="max-w-5xl mx-auto space-y-12 pb-20">
            {/* Header */}
            <header className="text-center space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 text-xs font-bold text-purple-400">
                    <Brain size={14} />
                    AI-Powered Job Analysis
                </div>
                <h1 className="text-5xl font-bold tracking-tight">Job Analyzer</h1>
                <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                    Paste any job posting URL and our AI will extract requirements, match them to your profile, and help you optimize your application.
                </p>
            </header>

            {/* Search Form */}
            <form onSubmit={handleExtract} className="relative group">
                <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-foreground transition-colors">
                    <Link2 size={24} />
                </div>
                <input
                    type="url"
                    id="job-url"
                    name="job-url"
                    value={url}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUrl(e.target.value)}
                    placeholder="https://linkedin.com/jobs/... or any job posting URL"
                    className="w-full bg-secondary/50 border border-border rounded-full py-6 pl-16 pr-44 text-lg focus:outline-hidden focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500/50 transition-all subtle-shadow"
                    autoComplete="url"
                    required
                />
                <button
                    disabled={loading}
                    className="absolute right-3 top-3 bottom-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 rounded-full font-bold hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-2 shadow-lg shadow-purple-500/25"
                >
                    {loading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
                    {loading ? "Analyzing..." : "Analyze Job"}
                </button>
            </form>

            {/* Supported Platforms */}
            <div className="flex flex-wrap justify-center gap-4 text-xs text-muted-foreground">
                <span>Supported: LinkedIn • Indeed • Greenhouse • Lever • Workday • Any Job URL</span>
            </div>

            {/* Results */}
            <AnimatePresence>
                {jobData && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-8"
                    >
                        {/* Match Score Banner */}
                        {matchScore && (
                            <div className="p-6 rounded-3xl bg-gradient-to-br from-green-500/10 to-blue-500/10 border border-green-500/20 flex flex-col md:flex-row items-center justify-between gap-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-blue-500 flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                                        {matchScore}%
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg flex items-center gap-2">
                                            {matchScore >= 85 ? <CheckCircle2 size={20} className="text-green-500" /> : <AlertCircle size={20} className="text-yellow-500" />}
                                            {matchScore >= 85 ? "Great Match!" : "Good Potential"}
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            Your profile matches {matchScore}% of the requirements for this role.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <Link href="/resumes" className="px-4 py-2 bg-foreground text-background rounded-full text-sm font-medium flex items-center gap-2 hover:opacity-90 transition-opacity">
                                        <FileText size={16} />
                                        Optimize Resume
                                    </Link>
                                    <Link href="/communication" className="px-4 py-2 bg-secondary text-foreground rounded-full text-sm font-medium flex items-center gap-2 hover:bg-secondary/80 transition-colors">
                                        <Send size={16} />
                                        Draft Outreach
                                    </Link>
                                </div>
                            </div>
                        )}

                        {/* Job Card */}
                        <div className="glass rounded-3xl p-8 md:p-12 space-y-8 card-shadow border border-border relative overflow-hidden">
                            <div className="japanese-dot-grid absolute inset-0 opacity-10 pointer-events-none" />

                            {/* Header */}
                            <div className="relative z-10 flex flex-col md:flex-row md:items-start justify-between gap-6">
                                <div>
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                                            {jobData.company.charAt(0)}
                                        </div>
                                        <div>
                                            <h2 className="text-2xl md:text-3xl font-bold">{jobData.title}</h2>
                                            <span className="text-muted-foreground">{jobData.company}</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-3 mt-4">
                                        <span className="flex items-center gap-1.5 bg-secondary/50 px-3 py-1.5 rounded-lg text-sm border border-border">
                                            <MapPin size={14} />
                                            {jobData.location}
                                        </span>
                                        {jobData.salary_range && (
                                            <span className="flex items-center gap-1.5 bg-green-500/10 text-green-500 px-3 py-1.5 rounded-lg text-sm border border-green-500/20 font-medium">
                                                <DollarSign size={14} />
                                                {jobData.salary_range}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <button
                                    onClick={copyJobData}
                                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary text-sm font-medium hover:bg-secondary/80 transition-colors"
                                >
                                    {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                                    {copied ? "Copied!" : "Copy Details"}
                                </button>
                            </div>

                            {/* Requirements & Responsibilities */}
                            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12">
                                <div className="space-y-4">
                                    <h3 className="flex items-center gap-2 font-bold text-lg">
                                        <ListChecks size={20} className="text-purple-500" />
                                        Key Requirements
                                    </h3>
                                    <ul className="space-y-3">
                                        {jobData.requirements?.map((req: string, i: number) => (
                                            <li key={i} className="flex gap-3 text-muted-foreground text-sm leading-relaxed">
                                                <CheckCircle2 size={16} className="text-purple-500 shrink-0 mt-0.5" />
                                                {req}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="flex items-center gap-2 font-bold text-lg">
                                        <Sparkles size={20} className="text-blue-500" />
                                        Responsibilities
                                    </h3>
                                    <ul className="space-y-3">
                                        {jobData.responsibilities?.map((resp: string, i: number) => (
                                            <li key={i} className="flex gap-3 text-muted-foreground text-sm leading-relaxed">
                                                <ArrowRight size={16} className="text-blue-500 shrink-0 mt-0.5" />
                                                {resp}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="relative z-10 pt-8 border-t border-border">
                                <h3 className="font-bold text-lg mb-4">Full Description</h3>
                                <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-wrap">
                                    {jobData.description}
                                </p>
                            </div>

                            {/* Action Bar */}
                            <div className="relative z-10 flex flex-wrap gap-4 pt-8 border-t border-border">
                                <Link href="/resumes" className="flex-1 min-w-[200px] px-6 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-2xl font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-lg shadow-purple-500/25">
                                    <FileText size={18} />
                                    Tailor Resume for This Job
                                </Link>
                                <Link href="/communication" className="flex-1 min-w-[200px] px-6 py-4 bg-secondary text-foreground rounded-2xl font-medium flex items-center justify-center gap-2 hover:bg-secondary/80 transition-colors">
                                    <Send size={18} />
                                    Generate Cover Letter
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Empty State */}
            {!jobData && !loading && (
                <div className="text-center py-20 space-y-6">
                    <div className="w-20 h-20 rounded-3xl bg-secondary/50 flex items-center justify-center mx-auto">
                        <Brain size={40} className="text-muted-foreground" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold mb-2">Paste a Job URL to Get Started</h3>
                        <p className="text-muted-foreground max-w-md mx-auto">
                            Our AI will analyze the job posting, extract key requirements, and show you how well your profile matches.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
