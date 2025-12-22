"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    Link2, Search, Building2, MapPin, DollarSign, Clock,
    Briefcase, CheckCircle2, AlertCircle, Sparkles, Copy,
    FileText, MessageSquare, Loader2, ExternalLink,
    Target, Star, Bookmark, Plus
} from "lucide-react";
import { AppleCard } from "@/components/ui/AppleCard";
import { AppleButton } from "@/components/ui/AppleButton";
import { useToast } from "@/components/ui/Toast";
import axios from "axios";
import API_URL from "@/lib/api";
import Link from "next/link";

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
    // Structured sections
    aboutJob?: string;
    responsibilities: string[];
    minimumQualifications: string[];
    preferredQualifications: string[];
    aboutCompany?: string;
    whyJoin?: string;
    // Legacy
    description: string;
    requirements: string[];
    skills: string[];
    benefits: string[];
    jobInfo?: Record<string, string>;
    source?: string;
    analyzedAt: string;
    matchScore?: number;
}

interface UserProfile {
    skills: string[];
    // Add other fields if needed for calculateMatchScore
}


const FADE_IN = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, ease: "easeOut" as const },
};

export default function AnalyzeJobPage() {
    const { toast } = useToast();
    const [jobUrl, setJobUrl] = useState("");
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [currentJob, setCurrentJob] = useState<AnalyzedJob | null>(null);
    const [isMounted, setIsMounted] = useState(false);
    const [savedJobs, setSavedJobs] = useState<AnalyzedJob[]>(() => {
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem("analyzedJobs");
            return saved ? JSON.parse(saved) : [];
        }
        return [];
    });

    const [profile] = useState<UserProfile | null>(() => {
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem("userProfile");
            return saved ? JSON.parse(saved) : null;
        }
        return null;
    });

    // Set mounted state after component mounts
    useEffect(() => {
        setIsMounted(true);
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
        if (!jobUrl.trim()) {
            toast("Please enter a job URL", "error");
            return;
        }

        setIsAnalyzing(true);
        try {
            const response = await axios.post(`${API_URL}/extract-job`, { url: jobUrl });
            const data = response.data;

            if (data.title === "Unsupported Job Board") {
                toast("This job board isn't fully supported yet, but we've extracted what we could.", "info");
            }

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
                // Structured sections
                aboutJob: data.about_job,
                responsibilities: data.responsibilities || [],
                minimumQualifications: data.minimum_qualifications || [],
                preferredQualifications: data.preferred_qualifications || [],
                aboutCompany: data.about_company,
                whyJoin: data.why_join,
                // Legacy
                description: data.description || data.about_job || "",
                requirements: data.requirements || data.minimum_qualifications || [],
                skills: data.skills || [],
                benefits: data.benefits || [],
                jobInfo: data.job_info || {},
                source: data.source,
                analyzedAt: new Date().toISOString(),
            };


            // Calculate match score if profile exists
            if (profile) {
                analyzedJob.matchScore = calculateMatchScore(analyzedJob.skills);
            }

            setCurrentJob(analyzedJob);
            toast("Job analyzed successfully!", "success");
        } catch (error) {
            console.error("Analysis error:", error);
            toast("Failed to analyze job. Please check the URL and try again.", "error");
        } finally {
            setIsAnalyzing(false);
        }
    };

    const saveJob = () => {
        if (!currentJob) return;
        const updatedJobs = [currentJob, ...savedJobs.filter(j => j.url !== currentJob.url)];
        setSavedJobs(updatedJobs);
        localStorage.setItem("analyzedJobs", JSON.stringify(updatedJobs));
        localStorage.setItem("currentJobForResume", JSON.stringify(currentJob));
        toast("Job saved!", "success");
    };

    const loadSavedJob = (job: AnalyzedJob) => {
        setCurrentJob(job);
        setJobUrl(job.url);
    };

    const deleteJob = (jobId: string) => {
        const updatedJobs = savedJobs.filter(j => j.id !== jobId);
        setSavedJobs(updatedJobs);
        localStorage.setItem("analyzedJobs", JSON.stringify(updatedJobs));
        if (currentJob?.id === jobId) setCurrentJob(null);
        toast("Job removed", "info");
    };

    return (
        <div className="max-w-6xl mx-auto px-6 py-8">
            {/* Header */}
            <motion.div {...FADE_IN} className="mb-8">
                <h1 className="text-4xl font-bold tracking-tight mb-2">Analyze Job</h1>
                <p className="text-lg text-muted-foreground">
                    Paste a job posting URL and let AI extract all the important details
                </p>
            </motion.div>

            {/* URL Input Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="mb-8"
            >
                <AppleCard className="p-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                            <input
                                type="url"
                                id="job-url"
                                name="job-url"
                                value={jobUrl}
                                onChange={(e) => setJobUrl(e.target.value)}
                                placeholder="Paste job posting URL (LinkedIn, Indeed, Greenhouse, etc.)"
                                className="w-full pl-12 pr-4 py-4 bg-secondary rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                autoComplete="url"
                                onKeyDown={(e) => e.key === "Enter" && analyzeJob()}
                            />
                        </div>
                        <AppleButton
                            variant="primary"
                            onClick={analyzeJob}
                            disabled={isAnalyzing}
                            className="px-8 py-4 text-base"
                        >
                            {isAnalyzing ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" />
                                    Analyzing...
                                </>
                            ) : (
                                <>
                                    <Search size={18} />
                                    Analyze Job
                                </>
                            )}
                        </AppleButton>
                    </div>
                    <p className="text-xs text-muted-foreground mt-3">
                        Supported: LinkedIn, Indeed, Greenhouse, Lever, Workday, and most job boards
                    </p>
                </AppleCard>
            </motion.div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Main Content - Analyzed Job */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="lg:col-span-2"
                >
                    {currentJob ? (
                        <AppleCard className="overflow-hidden">
                            {/* Job Header */}
                            <div className="p-6 border-b border-border">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-start gap-4">
                                        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center font-bold text-2xl text-primary shrink-0">
                                            {currentJob.company.charAt(0)}
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold mb-1">{currentJob.title}</h2>
                                            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                                                <span className="flex items-center gap-1">
                                                    <Building2 size={14} />
                                                    {currentJob.company}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <MapPin size={14} />
                                                    {currentJob.location}
                                                </span>
                                                {currentJob.matchScore !== undefined && (
                                                    <span className={`flex items-center gap-1 font-semibold ${currentJob.matchScore > 70 ? "text-green-500" :
                                                        currentJob.matchScore > 40 ? "text-yellow-500" : "text-red-500"
                                                        }`}>
                                                        <Target size={14} />
                                                        {currentJob.matchScore}% Match
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={saveJob}
                                            className="p-2 rounded-xl bg-primary/10 text-primary"
                                            title="Save job"
                                        >
                                            <Bookmark size={18} />
                                        </motion.button>
                                        <a
                                            href={currentJob.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-2 rounded-xl bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                                        >
                                            <ExternalLink size={18} />
                                        </a>
                                    </div>
                                </div>

                                {/* Meta info */}
                                <div className="flex flex-wrap gap-3 mt-4">
                                    {currentJob.salary !== "Not specified" && (
                                        <span className="apple-pill">
                                            <DollarSign size={12} />
                                            {currentJob.salary}
                                        </span>
                                    )}
                                    <span className="apple-pill">
                                        <Briefcase size={12} />
                                        {currentJob.jobType}
                                    </span>
                                    <span className="apple-pill">
                                        <Clock size={12} />
                                        Just analyzed
                                    </span>
                                </div>
                            </div>

                            {/* Job Details - All Structured Sections */}
                            <div className="p-6 space-y-6 max-h-[600px] overflow-y-auto">
                                {/* About the Job / Description */}
                                {(currentJob.aboutJob || currentJob.description) && (
                                    <div>
                                        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                                            <FileText size={14} />
                                            About the Job
                                        </h3>
                                        <p className="text-sm leading-relaxed whitespace-pre-line bg-secondary/50 p-4 rounded-xl">
                                            {(currentJob.aboutJob || currentJob.description).slice(0, 800)}
                                            {(currentJob.aboutJob || currentJob.description).length > 800 && "..."}
                                        </p>
                                    </div>
                                )}

                                {/* Responsibilities */}
                                {currentJob.responsibilities.length > 0 && (
                                    <div>
                                        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                                            <Briefcase size={14} />
                                            Responsibilities
                                        </h3>
                                        <ul className="space-y-2">
                                            {currentJob.responsibilities.slice(0, 10).map((resp, idx) => (
                                                <li key={idx} className="flex items-start gap-2 text-sm">
                                                    <span className="text-primary mt-1">•</span>
                                                    <span>{resp}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Minimum Qualifications */}
                                {currentJob.minimumQualifications.length > 0 && (
                                    <div>
                                        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                                            <CheckCircle2 size={14} className="text-green-500" />
                                            Minimum Qualifications
                                        </h3>
                                        <ul className="space-y-2">
                                            {currentJob.minimumQualifications.slice(0, 10).map((qual, idx) => (
                                                <li key={idx} className="flex items-start gap-2 text-sm">
                                                    <CheckCircle2 size={14} className="text-green-500 mt-0.5 shrink-0" />
                                                    <span>{qual}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Preferred Qualifications */}
                                {currentJob.preferredQualifications.length > 0 && (
                                    <div>
                                        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                                            <Star size={14} className="text-yellow-500" />
                                            Preferred Qualifications
                                        </h3>
                                        <ul className="space-y-2">
                                            {currentJob.preferredQualifications.slice(0, 8).map((qual, idx) => (
                                                <li key={idx} className="flex items-start gap-2 text-sm">
                                                    <Star size={14} className="text-yellow-500 mt-0.5 shrink-0" />
                                                    <span>{qual}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Required Skills */}
                                {currentJob.skills.length > 0 && (
                                    <div>
                                        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                                            Required Skills
                                        </h3>
                                        <div className="flex flex-wrap gap-2">
                                            {currentJob.skills.map((skill, idx) => (
                                                <span key={idx} className="apple-pill bg-primary/10 text-primary font-medium">
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* About the Company */}
                                {currentJob.aboutCompany && (
                                    <div>
                                        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                                            <Building2 size={14} />
                                            About {currentJob.company}
                                        </h3>
                                        <p className="text-sm leading-relaxed bg-secondary/50 p-4 rounded-xl">
                                            {currentJob.aboutCompany.slice(0, 500)}
                                            {currentJob.aboutCompany.length > 500 && "..."}
                                        </p>
                                    </div>
                                )}

                                {/* Why Join Us */}
                                {currentJob.whyJoin && (
                                    <div>
                                        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                                            <Sparkles size={14} className="text-primary" />
                                            Why Join Us
                                        </h3>
                                        <p className="text-sm leading-relaxed bg-primary/5 p-4 rounded-xl border border-primary/10">
                                            {currentJob.whyJoin.slice(0, 500)}
                                            {currentJob.whyJoin.length > 500 && "..."}
                                        </p>
                                    </div>
                                )}

                                {/* Job Information */}
                                {currentJob.jobInfo && Object.keys(currentJob.jobInfo).length > 0 && (
                                    <div>
                                        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                                            <AlertCircle size={14} />
                                            Job Information
                                        </h3>
                                        <div className="grid grid-cols-2 gap-2">
                                            {Object.entries(currentJob.jobInfo).map(([key, value]) => (
                                                <div key={key} className="bg-secondary/50 p-3 rounded-lg">
                                                    <span className="text-xs text-muted-foreground">{key}</span>
                                                    <p className="text-sm font-medium">{value}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Benefits */}
                                {currentJob.benefits.length > 0 && (
                                    <div>
                                        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                                            <Star size={14} className="text-yellow-500" />
                                            Benefits
                                        </h3>
                                        <div className="flex flex-wrap gap-2">
                                            {currentJob.benefits.map((benefit, idx) => (
                                                <span key={idx} className="apple-pill bg-green-500/10 text-green-600 dark:text-green-400">
                                                    <CheckCircle2 size={10} />
                                                    {benefit}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>


                            {/* Actions */}
                            <div className="p-6 border-t border-border bg-secondary/30">
                                <div className="flex flex-wrap gap-3">
                                    <Link href="/resumes" onClick={saveJob}>
                                        <AppleButton variant="primary" className="px-6">
                                            <Sparkles size={16} />
                                            Enhance Resume for This Job
                                        </AppleButton>
                                    </Link>
                                    <Link href="/communication" onClick={saveJob}>
                                        <AppleButton variant="secondary" className="px-6">
                                            <MessageSquare size={16} />
                                            Generate Cover Letter
                                        </AppleButton>
                                    </Link>
                                    <AppleButton
                                        variant="secondary"
                                        onClick={() => navigator.clipboard.writeText(JSON.stringify(currentJob, null, 2))}
                                        className="px-4"
                                    >
                                        <Copy size={16} />
                                        Copy Details
                                    </AppleButton>
                                </div>
                            </div>
                        </AppleCard>
                    ) : (
                        <AppleCard className="p-12 text-center">
                            <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                                <Target className="w-10 h-10 text-primary" />
                            </div>
                            <h3 className="text-xl font-semibold mb-3">Paste a Job URL to Start</h3>
                            <p className="text-muted-foreground max-w-md mx-auto mb-6">
                                Enter the URL of any job posting and our AI will extract all the important details like requirements, skills needed, and company information.
                            </p>
                            <div className="flex flex-wrap justify-center gap-2">
                                {["LinkedIn", "Indeed", "Greenhouse", "Lever"].map((platform) => (
                                    <span key={platform} className="apple-pill text-xs">
                                        {platform}
                                    </span>
                                ))}
                            </div>
                        </AppleCard>
                    )}
                </motion.div>

                {/* Sidebar - Saved Jobs */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="space-y-6"
                >
                    <AppleCard className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="font-semibold">Saved Jobs</h2>
                            <span className="text-xs text-muted-foreground">
                                {isMounted ? `${savedJobs.length} saved` : '0 saved'}
                            </span>
                        </div>

                        {!isMounted ? (
                            <div className="text-center py-8">
                                <div className="w-8 h-8 mx-auto mb-2 animate-pulse bg-muted-foreground/20 rounded-full" />
                                <p className="text-sm text-muted-foreground">
                                    Loading...
                                </p>
                            </div>
                        ) : savedJobs.length > 0 ? (
                            <div className="space-y-3 max-h-[400px] overflow-y-auto">
                                {savedJobs.map((job) => (
                                    <motion.div
                                        key={job.id}
                                        whileHover={{ x: 4 }}
                                        onClick={() => loadSavedJob(job)}
                                        className={`p-3 rounded-xl cursor-pointer transition-colors border ${currentJob?.id === job.id
                                            ? "border-primary bg-primary/5"
                                            : "border-transparent hover:bg-secondary/50"
                                            }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center font-bold text-sm shrink-0">
                                                {job.company.charAt(0)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-medium text-sm truncate">{job.title}</h4>
                                                <p className="text-xs text-muted-foreground truncate">{job.company}</p>
                                            </div>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); deleteJob(job.id); }}
                                                className="text-muted-foreground hover:text-destructive transition-colors p-1"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <Plus className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                                <p className="text-sm text-muted-foreground">
                                    No jobs saved yet. Analyze a job to get started!
                                </p>
                            </div>
                        )}
                    </AppleCard>

                    {/* Quick Tips */}
                    <AppleCard className="p-6">
                        <h2 className="font-semibold mb-4">How It Works</h2>
                        <div className="space-y-3 text-sm">
                            <div className="flex items-start gap-3">
                                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold shrink-0">1</div>
                                <p className="text-muted-foreground">Paste any job posting URL</p>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold shrink-0">2</div>
                                <p className="text-muted-foreground">AI extracts job requirements & skills</p>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold shrink-0">3</div>
                                <p className="text-muted-foreground">Enhance your resume to match</p>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold shrink-0">4</div>
                                <p className="text-muted-foreground">Generate tailored cover letter</p>
                            </div>
                        </div>
                    </AppleCard>
                </motion.div>
            </div>
        </div>
    );
}
