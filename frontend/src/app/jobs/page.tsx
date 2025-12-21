"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link2, Search, Building2, MapPin, DollarSign, ListChecks, Sparkles, Loader2 } from "lucide-react";
import axios from "axios";
import API_URL from "@/lib/api";

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

    const handleExtract = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!url) return;

        setLoading(true);
        try {
            const response = await axios.post(`${API_URL}/extract-job`, { url });
            setJobData(response.data);
        } catch (error) {
            console.error("Extraction error:", error);
            // Fallback dummy data for demo
            setJobData({
                title: "Frontend Developer",
                company: "Vercel",
                location: "Remote",
                salary_range: "$140k - $180k",
                description: "We are looking for a world-class frontend developer to join our team...",
                requirements: ["React experts", "TypeScript proficiency", "Next.js experience"],
                responsibilities: ["Building performant UIs", "Collaborating with design team"]
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-12 pb-20">
            <header className="text-center space-y-4">
                <h1 className="text-5xl font-bold tracking-tight">Job Analysis</h1>
                <p className="text-muted-foreground text-lg">Paste a job posting URL and let our AI extract the core requirements.</p>
            </header>

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
                    placeholder="https://linkedin.com/jobs/..."
                    className="w-full bg-secondary/50 border border-border rounded-full py-6 pl-16 pr-40 text-lg focus:outline-hidden focus:ring-2 focus:ring-foreground/10 transition-all subtle-shadow"
                    autoComplete="url"
                    required
                />
                <button
                    disabled={loading}
                    className="absolute right-3 top-3 bottom-3 bg-foreground text-background px-8 rounded-full font-bold hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-2"
                >
                    {loading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
                    {loading ? "Analyzing..." : "Analyze"}
                </button>
            </form>

            <AnimatePresence>
                {jobData && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-8"
                    >
                        <div className="glass rounded-3xl p-8 md:p-12 space-y-8 card-shadow border border-border relative overflow-hidden">
                            <div className="japanese-dot-grid absolute inset-0 opacity-10 pointer-events-none" />

                            <div className="relative z-10 flex flex-col md:flex-row md:items-start justify-between gap-6">
                                <div>
                                    <h2 className="text-3xl font-bold">{jobData.title}</h2>
                                    <div className="flex flex-wrap gap-4 mt-4 text-muted-foreground tracking-tight">
                                        <span className="flex items-center gap-1.5 bg-secondary/50 px-3 py-1 rounded-lg text-sm border border-border">
                                            <Building2 size={16} />
                                            {jobData.company}
                                        </span>
                                        <span className="flex items-center gap-1.5 bg-secondary/50 px-3 py-1 rounded-lg text-sm border border-border">
                                            <MapPin size={16} />
                                            {jobData.location}
                                        </span>
                                        {jobData.salary_range && (
                                            <span className="flex items-center gap-1.5 bg-secondary/50 px-3 py-1 rounded-lg text-sm border border-border">
                                                <DollarSign size={16} />
                                                {jobData.salary_range}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <button className="bg-foreground text-background px-6 py-3 rounded-full text-sm font-bold flex items-center gap-2 hover:opacity-90 transition-opacity whitespace-nowrap">
                                    <Sparkles size={16} />
                                    Optimize Resume
                                </button>
                            </div>

                            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12">
                                <div className="space-y-4">
                                    <h3 className="flex items-center gap-2 font-bold text-lg">
                                        <ListChecks size={20} className="text-secondary-foreground" />
                                        Key Requirements
                                    </h3>
                                    <ul className="space-y-3">
                                        {jobData.requirements?.map((req: string, i: number) => (
                                            <li key={i} className="flex gap-3 text-muted-foreground text-sm leading-relaxed">
                                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-foreground/20 shrink-0" />
                                                {req}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="flex items-center gap-2 font-bold text-lg">
                                        <Sparkles size={20} className="text-secondary-foreground" />
                                        Responsibilities
                                    </h3>
                                    <ul className="space-y-3">
                                        {jobData.responsibilities?.map((resp: string, i: number) => (
                                            <li key={i} className="flex gap-3 text-muted-foreground text-sm leading-relaxed">
                                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-foreground/20 shrink-0" />
                                                {resp}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            <div className="relative z-10 pt-8 border-t border-border">
                                <h3 className="font-bold text-lg mb-4">Job Description</h3>
                                <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-wrap">
                                    {jobData.description}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

