"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Link2, Search, Building2, MapPin, DollarSign, Clock,
    Briefcase, CheckCircle2, Sparkles,
    FileText, MessageSquare, Loader2, ExternalLink,
    Target, Bookmark, TrendingUp, History,
    ShieldCheck, Zap, ArrowRight, Trash2, Globe, Users
} from "lucide-react";
import { AppleCard } from "@/components/ui/AppleCard";
import { AppleButton } from "@/components/ui/AppleButton";
import { useToast } from "@/components/ui/Toast";
import axios from "axios";
import API_URL from "@/lib/api";
import Link from "next/link";
import { secureGet, secureSet, sanitizeUrl } from "@/lib/secureStorage";
import { STORAGE_KEYS } from "@/lib/storageKeys";

interface AnalyzedJob {
    id: string;
    url: string;
    title: string;
    company: string;
    location: string;
    salary: string;
    jobType: string;
    workArrangement?: string;
    experienceLevel?: string;
    yearsExperience?: string;
    aboutJob?: string;
    responsibilities: string[];
    minimumQualifications: string[];
    preferredQualifications: string[];
    aboutCompany?: string;
    whyJoin?: string;
    teamSize?: string;
    fundingInfo?: string;
    description: string;
    requirements: string[];
    skills: string[];
    benefits: string[];
    jobInfo?: Record<string, string>;
    source?: string;
    note?: string;
    analyzedAt: string;
    matchScore?: number;
}

interface UserProfile {
    skills: string[];
}

const FADE_IN = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
};

export default function AnalyzeJobPage() {
    const { toast } = useToast();
    const [jobUrl, setJobUrl] = useState("");
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [currentJob, setCurrentJob] = useState<AnalyzedJob | null>(null);
    const [savedJobs, setSavedJobs] = useState<AnalyzedJob[]>([]);
    const [profile, setProfile] = useState<UserProfile | null>(null);

    useEffect(() => {
        const loadData = () => {
            try {
                const jobs = secureGet<AnalyzedJob[]>(STORAGE_KEYS.ANALYZED_JOBS);
                if (jobs) setSavedJobs(jobs);

                const p = secureGet<UserProfile>(STORAGE_KEYS.PROFILE);
                if (p) setProfile(p);
            } catch (error) {
                console.error('Failed to load storage data:', error);
            }
        };
        loadData();
    }, []);

    const calculateMatchScore = (jobSkills: string[]) => {
        if (!jobSkills?.length || !profile?.skills?.length) return 0;
        const matched = jobSkills.filter(skill =>
            profile.skills.some((us: string) =>
                us.toLowerCase().includes(skill.toLowerCase()) ||
                skill.toLowerCase().includes(us.toLowerCase())
            )
        );
        return Math.round((matched.length / jobSkills.length) * 100);
    };

    const analyzeJob = async () => {
        if (!jobUrl.trim() || !jobUrl.startsWith('http')) {
            toast("Please enter a valid job URL", "error");
            return;
        }

        setIsAnalyzing(true);
        try {
            const response = await axios.post(`${API_URL}/extract-job`, { url: jobUrl });
            const data = response.data;

            const analyzedJob: AnalyzedJob = {
                id: Date.now().toString(),
                url: jobUrl,
                title: data.title || "Job Title",
                company: data.company || "Company",
                location: data.location || "Location not specified",
                salary: data.salary_range || "Not specified",
                jobType: data.job_type || "Full-time",
                workArrangement: data.work_arrangement,
                experienceLevel: data.experience_level,
                yearsExperience: data.years_experience,
                aboutJob: data.about_job,
                responsibilities: data.responsibilities || [],
                minimumQualifications: data.minimum_qualifications || [],
                preferredQualifications: data.preferred_qualifications || [],
                aboutCompany: data.about_company,
                whyJoin: data.why_join,
                teamSize: data.team_size,
                fundingInfo: data.funding_info,
                description: data.description || data.about_job || "",
                requirements: data.requirements || data.minimum_qualifications || [],
                skills: data.skills || [],
                benefits: data.benefits || [],
                jobInfo: data.job_info || {},
                source: data.source,
                note: data.note,
                analyzedAt: new Date().toISOString(),
            };

            if (profile) {
                analyzedJob.matchScore = calculateMatchScore(analyzedJob.skills);
            }

            setCurrentJob(analyzedJob);
            toast("AI Extraction Complete!", "success");
        } catch (error: unknown) {
            console.error("Analysis error:", error);
            // Provide detailed error messages based on error type
            if (axios.isAxiosError(error)) {
                if (error.response?.status === 400) {
                    const detail = error.response?.data?.detail || error.response?.data?.error;
                    if (detail?.includes("not found") || detail?.includes("removed")) {
                        toast("Job posting not found. It may have expired or been removed.", "error");
                    } else {
                        toast("Invalid URL or job page format. Try a different link.", "error");
                    }
                } else if (error.response?.status === 500) {
                    toast("Server error. The job site may be blocking our request.", "info");
                } else if (!error.response) {
                    toast("Cannot connect to server. Please check if backend is running.", "error");
                } else {
                    toast("Failed to analyze job. Try pasting the job description directly.", "error");
                }
            } else {
                toast("An unexpected error occurred. Please try again.", "error");
            }
        } finally {
            setIsAnalyzing(false);
        }
    };

    const saveCurrentJob = () => {
        if (!currentJob) return;
        const updatedJobs = [currentJob, ...savedJobs.filter(j => j.url !== currentJob.url)];
        setSavedJobs(updatedJobs);
        secureSet(STORAGE_KEYS.ANALYZED_JOBS, updatedJobs);
        secureSet(STORAGE_KEYS.CURRENT_JOB_FOR_RESUME, currentJob);
        toast("Job saved to your tracker", "success");
    };

    const deleteJob = (jobId: string) => {
        const updatedJobs = savedJobs.filter(j => j.id !== jobId);
        setSavedJobs(updatedJobs);
        secureSet(STORAGE_KEYS.ANALYZED_JOBS, updatedJobs);
        if (currentJob?.id === jobId) setCurrentJob(null);
        toast("Job removed", "info");
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 lg:py-20">

                {/* Hero Header Section */}
                <motion.div {...FADE_IN} className="text-center mb-16">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6"
                    >
                        <Sparkles size={16} />
                        <span>AI-Powered Job Analysis</span>
                    </motion.div>
                    <h1 className="text-5xl sm:text-6xl font-bold tracking-tight mb-6">
                        Paste. Analyze. <span className="text-primary italic">Apply.</span>
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                        Instantly extract requirements, skills, and match probability from any job posting.
                    </p>
                </motion.div>

                {/* Main Input Card - High-end Glow */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="max-w-4xl mx-auto mb-20 relative group"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-purple-500/20 to-pink-500/20 rounded-[2.5rem] blur-3xl opacity-50 group-hover:opacity-75 transition-opacity -z-10" />

                    <AppleCard className="p-8 sm:p-10 border-border/40 bg-card/80 backdrop-blur-xl rounded-[2.5rem] shadow-2xl shadow-primary/5">
                        <div className="flex flex-col md:flex-row gap-4 items-center">
                            <div className="w-full relative">
                                <Link2 className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-muted-foreground" />
                                <input
                                    type="url"
                                    value={jobUrl}
                                    onChange={(e) => setJobUrl(e.target.value)}
                                    placeholder="Paste job URL (LinkedIn, Indeed, Greenhouse...)"
                                    className="w-full pl-14 pr-6 py-5 bg-secondary/50 rounded-2xl text-base focus:outline-none focus:ring-2 focus:ring-primary/40 border border-border/30 transition-all font-medium"
                                    onKeyDown={(e) => e.key === "Enter" && analyzeJob()}
                                />
                            </div>
                            <AppleButton
                                variant="primary"
                                onClick={analyzeJob}
                                disabled={isAnalyzing}
                                className="w-full md:w-auto px-8 py-5 h-auto text-lg font-bold shadow-xl shadow-primary/25 relative overflow-hidden group"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-primary to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <span className="relative z-10 flex items-center gap-2">
                                    {isAnalyzing ? (
                                        <>
                                            <Loader2 size={20} className="animate-spin" />
                                            Analyzing...
                                        </>
                                    ) : (
                                        <>
                                            <Search size={20} />
                                            Extract Now
                                        </>
                                    )}
                                </span>
                            </AppleButton>
                        </div>
                        <div className="mt-8 flex flex-wrap justify-center gap-6 opacity-60">
                            {[
                                { icon: Globe, label: "Works Globally" },
                                { icon: ShieldCheck, label: "Safe & Secure" },
                                { icon: Zap, label: "Instant Extraction" }
                            ].map((item, idx) => (
                                <div key={idx} className="flex items-center gap-2 text-sm font-medium">
                                    <item.icon size={16} className="text-primary" />
                                    <span>{item.label}</span>
                                </div>
                            ))}
                        </div>
                    </AppleCard>
                </motion.div>

                {/* Content Grid */}
                <div className="grid lg:grid-cols-12 gap-10 items-start">

                    {/* Left/Main Column: Results */}
                    <div className="lg:col-span-8 space-y-8">
                        <AnimatePresence mode="wait">
                            {currentJob ? (
                                <motion.div
                                    key="results"
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.4 }}
                                >
                                    <AppleCard className="overflow-hidden border-border/40 shadow-xl rounded-[2rem]">
                                        {/* Header Branding Row */}
                                        <div className="p-8 sm:p-10 border-b border-border/40 bg-gradient-to-br from-primary/[0.03] to-purple-500/[0.03]">
                                            <div className="flex flex-col sm:flex-row items-start justify-between gap-6">
                                                <div className="flex items-start gap-5">
                                                    <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center font-bold text-3xl text-white shadow-2xl shadow-primary/20 shrink-0">
                                                        {currentJob.company.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <h2 className="text-3xl font-bold tracking-tight mb-2 leading-none">{currentJob.title}</h2>
                                                        <div className="flex flex-wrap items-center gap-4 text-muted-foreground font-medium">
                                                            <div className="flex items-center gap-1.5 bg-secondary/70 px-3 py-1 rounded-full text-sm">
                                                                <Building2 size={16} />
                                                                {currentJob.company}
                                                            </div>
                                                            <div className="flex items-center gap-1.5 bg-secondary/70 px-3 py-1 rounded-full text-sm">
                                                                <MapPin size={16} />
                                                                {currentJob.location}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex gap-2">
                                                    <AppleButton onClick={saveCurrentJob} variant="secondary" className="bg-white/50 backdrop-blur-sm border border-border/50 hover:bg-white shadow-sm h-12 w-12 p-0 flex items-center justify-center">
                                                        <Bookmark size={20} className="text-primary" />
                                                    </AppleButton>
                                                    <a href={sanitizeUrl(currentJob.url)} target="_blank" rel="noreferrer" className="flex items-center justify-center bg-white/50 backdrop-blur-sm border border-border/50 hover:bg-white shadow-sm h-12 w-12 p-0 rounded-full transition-all hover:scale-105 active:scale-95">
                                                        <ExternalLink size={20} className="text-muted-foreground" />
                                                    </a>
                                                </div>
                                            </div>

                                            {/* Key Specs Pills */}
                                            <div className="flex flex-wrap gap-3 mt-8">
                                                {currentJob.matchScore !== undefined && (
                                                    <div className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-base shadow-sm ${currentJob.matchScore > 75 ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" :
                                                        currentJob.matchScore > 45 ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" :
                                                            "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
                                                        }`}>
                                                        <Target size={18} />
                                                        {currentJob.matchScore}% Fit Rank
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-secondary/80 text-foreground font-semibold shadow-sm text-sm border border-border/20">
                                                    <DollarSign size={16} className="text-emerald-500" />
                                                    {currentJob.salary}
                                                </div>
                                                <div className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-secondary/80 text-foreground font-semibold shadow-sm text-sm border border-border/20">
                                                    <Briefcase size={16} className="text-primary" />
                                                    {currentJob.jobType}
                                                </div>
                                                {currentJob.yearsExperience && (
                                                    <div className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-secondary/80 text-foreground font-semibold shadow-sm text-sm border border-border/20">
                                                        <Clock size={16} className="text-purple-500" />
                                                        {currentJob.yearsExperience}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Structured Content Sections */}
                                        <div className="p-8 sm:p-10 space-y-12">

                                            {/* About Job */}
                                            {currentJob.description && (
                                                <section>
                                                    <div className="flex items-center gap-2 mb-4">
                                                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                                            <FileText size={18} />
                                                        </div>
                                                        <h3 className="text-lg font-bold">Role Intelligence</h3>
                                                    </div>
                                                    <div className="p-6 rounded-[1.5rem] bg-secondary/30 border border-border/20 text-foreground/80 leading-relaxed text-base">
                                                        {currentJob.description.split('\n').map((line, i) => (
                                                            <p key={i} className={line.trim() ? "mb-4" : "h-2"}>{line}</p>
                                                        )).slice(0, 4)}
                                                        <p className="text-primary font-semibold text-sm cursor-pointer hover:underline inline-flex items-center gap-1">
                                                            View full description <ArrowRight size={14} />
                                                        </p>
                                                    </div>
                                                </section>
                                            )}

                                            <div className="grid md:grid-cols-2 gap-8">
                                                {/* Requirements */}
                                                <section>
                                                    <div className="flex items-center gap-2 mb-5 font-bold text-base uppercase tracking-widest text-muted-foreground/80">
                                                        <Target size={16} className="text-rose-500" />
                                                        Essential Requirements
                                                    </div>
                                                    <div className="space-y-3">
                                                        {(currentJob.requirements || currentJob.minimumQualifications).slice(0, 6).map((req, i) => (
                                                            <div key={i} className="flex gap-3 p-4 rounded-xl bg-card border border-border/40 shadow-sm text-sm leading-snug">
                                                                <CheckCircle2 size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                                                                {req}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </section>

                                                {/* Skills Mesh */}
                                                <section>
                                                    <div className="flex items-center gap-2 mb-5 font-bold text-base uppercase tracking-widest text-muted-foreground/80">
                                                        <Zap size={16} className="text-amber-500" />
                                                        Critical Skills
                                                    </div>
                                                    <div className="flex flex-wrap gap-2.5">
                                                        {currentJob.skills.map((skill, i) => (
                                                            <motion.div
                                                                key={i}
                                                                whileHover={{ scale: 1.05, y: -2 }}
                                                                className="px-4 py-2.5 rounded-xl bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 text-primary font-bold text-sm shadow-sm"
                                                            >
                                                                {skill}
                                                            </motion.div>
                                                        ))}
                                                    </div>
                                                </section>
                                            </div>

                                            {/* CTA Multi-Action Bar */}
                                            <div className="pt-6 border-t border-border/40">
                                                <div className="flex flex-wrap gap-4">
                                                    <Link href="/resumes" className="flex-1 min-w-[200px]" onClick={saveCurrentJob}>
                                                        <AppleButton className="w-full h-14 bg-gradient-to-r from-primary to-purple-600 font-bold tracking-tight text-white gap-2 shadow-xl shadow-primary/20">
                                                            <Sparkles size={18} />
                                                            Optimize Resume
                                                        </AppleButton>
                                                    </Link>
                                                    <Link href="/communication" className="flex-1 min-w-[200px]" onClick={saveCurrentJob}>
                                                        <AppleButton variant="secondary" className="w-full h-14 font-bold border-border/60 hover:border-primary/40 bg-white/50 backdrop-blur-sm gap-2">
                                                            <MessageSquare size={18} className="text-primary" />
                                                            Generate Outreach
                                                        </AppleButton>
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    </AppleCard>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="empty"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex flex-col items-center justify-center py-20 text-center"
                                >
                                    <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-secondary to-secondary flex items-center justify-center mb-8 text-muted-foreground/20 border-2 border-dashed border-border/50">
                                        <History size={48} />
                                    </div>
                                    <h3 className="text-2xl font-bold mb-3 text-foreground/40">No Analysis Active</h3>
                                    <p className="text-muted-foreground max-w-sm mb-10">Paste a job posting URL above to instantly extract requirements and fit score.</p>

                                    <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
                                        <div className="p-4 rounded-3xl bg-card border border-border/40 text-left">
                                            <Globe size={20} className="text-blue-500 mb-3" />
                                            <div className="font-bold text-sm">Any Board</div>
                                            <div className="text-xs text-muted-foreground">LinkedIn, Indeed...</div>
                                        </div>
                                        <div className="p-4 rounded-3xl bg-card border border-border/40 text-left">
                                            <Users size={20} className="text-purple-500 mb-3" />
                                            <div className="font-bold text-sm">Rich Data</div>
                                            <div className="text-xs text-muted-foreground">Team & Funding info</div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Right Column: Tracker & Tips */}
                    <div className="lg:col-span-4 space-y-8">

                        {/* Saved Jobs Tracker */}
                        <motion.div {...FADE_IN} transition={{ delay: 0.3 }}>
                            <AppleCard className="p-8 border-border/40 rounded-[2rem]">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600">
                                            <TrendingUp size={20} />
                                        </div>
                                        <h2 className="text-lg font-bold tracking-tight">Saved Insights</h2>
                                    </div>
                                    <span className="bg-secondary px-2.5 py-1 rounded-lg text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                                        {savedJobs.length} Items
                                    </span>
                                </div>

                                <div className="space-y-4">
                                    {savedJobs.length > 0 ? (
                                        savedJobs.slice(0, 5).map((job) => (
                                            <motion.div
                                                key={job.id}
                                                whileHover={{ x: 4, y: -2 }}
                                                onClick={() => { setCurrentJob(job); setJobUrl(job.url); }}
                                                className={`group p-4 rounded-2xl cursor-pointer transition-all border ${currentJob?.id === job.id
                                                    ? "bg-primary/[0.03] border-primary/20 ring-1 ring-primary/10"
                                                    : "bg-secondary/40 border-border/20 hover:border-primary/20"
                                                    }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-background border border-border/50 flex items-center justify-center font-bold text-sm shadow-sm group-hover:scale-110 transition-transform">
                                                        {job.company.charAt(0)}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="font-bold text-sm truncate leading-tight group-hover:text-primary transition-colors">{job.title}</h4>
                                                        <p className="text-xs text-muted-foreground truncate">{job.company}</p>
                                                    </div>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); deleteJob(job.id); }}
                                                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-rose-500/10 hover:text-rose-500 transition-all"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </motion.div>
                                        ))
                                    ) : (
                                        <div className="text-center py-10 px-4 rounded-3xl border border-dashed border-border/50 text-muted-foreground/60 text-sm font-medium">
                                            Analyses will appear here
                                        </div>
                                    )}
                                </div>

                                {savedJobs.length > 0 && (
                                    <Link href="/dashboard" className="block mt-6 text-center text-xs font-bold text-primary hover:underline flex items-center justify-center gap-1 group">
                                        View Complete Tracker <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                )}
                            </AppleCard>
                        </motion.div>

                        {/* Pro Tips / Wisdom Cards */}
                        <motion.div {...FADE_IN} transition={{ delay: 0.4 }} className="space-y-4">
                            <AppleCard className="p-6 border-border/40 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-[2rem]">
                                <Sparkles size={24} className="mb-4 text-indigo-200" />
                                <h3 className="text-lg font-bold mb-2">Power Move</h3>
                                <p className="text-sm text-indigo-50/80 leading-relaxed font-medium">
                                    Analyze <span className="text-white font-bold">3+ jobs</span> in the same niche to see common skill patterns AI looks for.
                                </p>
                            </AppleCard>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
}

