"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
    Link2, FileText, MessageSquare, Target, TrendingUp,
    Briefcase, Plus, ExternalLink, Trash2, Building2,
    Sparkles, Clock
} from "lucide-react";
import { AppleCard } from "@/components/ui/AppleCard";
import { AppleButton } from "@/components/ui/AppleButton";
import { useToast } from "@/components/ui/Toast";
import { secureGet, secureSet, sanitizeUrl } from "@/lib/secureStorage";

interface TrackedJob {
    id: string;
    title: string;
    company: string;
    url: string;
    status: "analyzing" | "resume_updated" | "applied" | "interviewing" | "offer" | "rejected";
    appliedDate?: string;
    notes?: string;
    createdAt: string;
}

const STATUS_CONFIG = {
    analyzing: { label: "Analyzing", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
    resume_updated: { label: "Resume Updated", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" },
    applied: { label: "Applied", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
    interviewing: { label: "Interviewing", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" },
    offer: { label: "Offer", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
    rejected: { label: "Rejected", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
};

const FADE_IN = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, ease: "easeOut" as const },
};

const quickActions = [
    { href: "/jobs", icon: Link2, label: "Analyze Job", desc: "Paste a job URL", highlight: true },
    { href: "/resumes", icon: FileText, label: "Resume Studio", desc: "Enhance your resume" },
    { href: "/communication", icon: MessageSquare, label: "Messages", desc: "Generate outreach" },
    { href: "/profile", icon: Target, label: "My Profile", desc: "Update your info" },
];

export default function DashboardPage() {
    const { toast } = useToast();
    const [trackedJobs, setTrackedJobs] = useState<TrackedJob[]>([]);
    const [profileComplete, setProfileComplete] = useState(0);
    const greeting = new Date().getHours() < 12 ? "Good morning" : new Date().getHours() < 18 ? "Good afternoon" : "Good evening";

    useEffect(() => {
        // Use requestAnimationFrame to avoid synchronous state update warning
        const loadData = () => {
            try {
                // Load tracked jobs from secure storage
                const jobs = secureGet<Array<{ id: string; title: string; company: string; url: string; analyzedAt: string }>>('analyzedJobs');
                if (jobs && Array.isArray(jobs)) {
                    setTrackedJobs(jobs.map((job) => ({
                        id: job.id || Math.random().toString(),
                        title: job.title || "Unknown Job",
                        company: job.company || "Unknown Company",
                        url: job.url || "",
                        status: "analyzing" as const,
                        createdAt: job.analyzedAt || new Date().toISOString(),
                    })));
                }

                // Calculate profile completeness from secure storage
                const data = secureGet<{ name?: string; email?: string; experience?: unknown[]; education?: unknown[]; skills?: unknown[] }>('profile');
                if (data) {
                    let score = 0;
                    if (data.name && data.email) score += 25;
                    if (data.experience?.length && data.experience.length > 0) score += 25;
                    if (data.education?.length && data.education.length > 0) score += 25;
                    if (data.skills?.length && data.skills.length >= 3) score += 25;
                    setProfileComplete(score);
                }
            } catch (error) {
                console.error("Failed to load dashboard data:", error);
            }
        };

        requestAnimationFrame(loadData);
    }, []);

    const updateJobStatus = (jobId: string, status: TrackedJob["status"]) => {
        const updated = trackedJobs.map(job =>
            job.id === jobId ? { ...job, status } : job
        );
        setTrackedJobs(updated);
        toast(`Status updated to ${STATUS_CONFIG[status].label}`, "success");
    };

    const deleteTrackedJob = (jobId: string) => {
        const updated = trackedJobs.filter(job => job.id !== jobId);
        setTrackedJobs(updated);
        toast("Job removed from tracking", "info");
    };

    const stats = [
        { label: "Jobs Analyzed", value: trackedJobs.length.toString(), icon: Target },
        { label: "Resumes Updated", value: trackedJobs.filter(j => j.status !== "analyzing").length.toString(), icon: FileText },
        { label: "Applications", value: trackedJobs.filter(j => ["applied", "interviewing", "offer"].includes(j.status)).length.toString(), icon: Briefcase },
        { label: "Profile Strength", value: `${profileComplete}%`, icon: TrendingUp },
    ];

    return (
        <div className="max-w-6xl mx-auto px-6 py-8">
            {/* Header */}
            <motion.div {...FADE_IN} className="mb-10">
                <h1 className="text-4xl font-bold tracking-tight mb-2">{greeting}</h1>
                <p className="text-lg text-muted-foreground">Track your job applications and manage your career tools.</p>
            </motion.div>

            {/* Quick Actions - Prominent */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10"
            >
                {quickActions.map((action, index) => (
                    <Link key={index} href={action.href}>
                        <motion.div whileHover={{ y: -4, scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                            <AppleCard className={`p-5 h-full cursor-pointer transition-colors ${action.highlight ? "border-2 border-primary" : ""}`}>
                                <div className={`w-12 h-12 rounded-2xl ${action.highlight ? "bg-primary" : "bg-primary/10"} flex items-center justify-center mb-4`}>
                                    <action.icon className={`w-6 h-6 ${action.highlight ? "text-primary-foreground" : "text-primary"}`} />
                                </div>
                                <h3 className="font-semibold mb-1">{action.label}</h3>
                                <p className="text-sm text-muted-foreground">{action.desc}</p>
                            </AppleCard>
                        </motion.div>
                    </Link>
                ))}
            </motion.div>

            {/* Stats */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10"
            >
                {stats.map((stat, index) => (
                    <AppleCard key={index} className="p-5">
                        <div className="flex items-center justify-between mb-3">
                            <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                                <stat.icon className="w-5 h-5 text-muted-foreground" />
                            </div>
                        </div>
                        <div className="text-2xl font-bold mb-1">{stat.value}</div>
                        <div className="text-sm text-muted-foreground">{stat.label}</div>
                    </AppleCard>
                ))}
            </motion.div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Main Content - Tracked Jobs */}
                <div className="lg:col-span-2 space-y-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                    >
                        <AppleCard className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-semibold">Job Applications</h2>
                                <Link href="/jobs">
                                    <AppleButton variant="secondary" size="sm">
                                        <Plus size={14} />
                                        Add Job
                                    </AppleButton>
                                </Link>
                            </div>

                            {trackedJobs.length > 0 ? (
                                <div className="space-y-4">
                                    {trackedJobs.map((job) => (
                                        <motion.div
                                            key={job.id}
                                            whileHover={{ x: 4 }}
                                            className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-background flex items-center justify-center font-bold text-primary border border-border">
                                                    {job.company.charAt(0)}
                                                </div>
                                                <div>
                                                    <h4 className="font-medium">{job.title}</h4>
                                                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                                                        <Building2 size={12} />
                                                        {job.company}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <select
                                                    value={job.status}
                                                    onChange={(e) => updateJobStatus(job.id, e.target.value as TrackedJob["status"])}
                                                    className={`text-xs font-medium px-3 py-1.5 rounded-full border-0 cursor-pointer ${STATUS_CONFIG[job.status].color}`}
                                                >
                                                    {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                                                        <option key={key} value={key}>{config.label}</option>
                                                    ))}
                                                </select>
                                                <a
                                                    href={sanitizeUrl(job.url)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-2 rounded-lg hover:bg-background transition-colors"
                                                >
                                                    <ExternalLink size={14} className="text-muted-foreground" />
                                                </a>
                                                <button
                                                    onClick={() => deleteTrackedJob(job.id)}
                                                    className="p-2 rounded-lg hover:bg-background transition-colors text-muted-foreground hover:text-destructive"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4">
                                        <Briefcase className="w-8 h-8 text-muted-foreground" />
                                    </div>
                                    <h3 className="font-semibold mb-2">No jobs tracked yet</h3>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        Start by analyzing a job posting to track your applications
                                    </p>
                                    <Link href="/jobs">
                                        <AppleButton variant="primary">
                                            <Link2 size={14} />
                                            Analyze Your First Job
                                        </AppleButton>
                                    </Link>
                                </div>
                            )}
                        </AppleCard>
                    </motion.div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* AI Tips */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                    >
                        <AppleCard className="p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                                    <Sparkles className="w-5 h-5 text-primary-foreground" />
                                </div>
                                <div>
                                    <h2 className="font-semibold">AI Tips</h2>
                                    <p className="text-xs text-muted-foreground">Personalized for you</p>
                                </div>
                            </div>
                            <div className="space-y-3">
                                {profileComplete < 100 && (
                                    <div className="p-3 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
                                        <p className="text-sm text-yellow-700 dark:text-yellow-400">
                                            Complete your profile to get better resume optimization
                                        </p>
                                    </div>
                                )}
                                <div className="p-3 rounded-xl bg-secondary/50">
                                    <p className="text-sm text-muted-foreground">
                                        💡 Tip: Tailor your resume for each job you apply to for 3x more interviews
                                    </p>
                                </div>
                            </div>
                        </AppleCard>
                    </motion.div>

                    {/* Profile Progress */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.5 }}
                    >
                        <AppleCard className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="font-semibold">Profile Strength</h2>
                                <span className="text-2xl font-bold text-primary">{profileComplete}%</span>
                            </div>
                            <div className="h-2 bg-secondary rounded-full overflow-hidden mb-4">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${profileComplete}%` }}
                                    transition={{ duration: 1, delay: 0.8 }}
                                    className="h-full bg-primary rounded-full"
                                />
                            </div>
                            <Link href="/profile">
                                <AppleButton variant="secondary" className="w-full">
                                    {profileComplete < 100 ? "Complete Profile" : "View Profile"}
                                </AppleButton>
                            </Link>
                        </AppleCard>
                    </motion.div>

                    {/* Recent Activity */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.6 }}
                    >
                        <AppleCard className="p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <Clock className="w-5 h-5 text-muted-foreground" />
                                <h2 className="font-semibold">Recent Activity</h2>
                            </div>
                            <div className="space-y-3">
                                {trackedJobs.slice(0, 3).map((job, idx) => (
                                    <div key={idx} className="flex items-center gap-3 text-sm">
                                        <div className="w-2 h-2 rounded-full bg-primary" />
                                        <span className="text-muted-foreground truncate">
                                            Analyzed {job.title} at {job.company}
                                        </span>
                                    </div>
                                ))}
                                {trackedJobs.length === 0 && (
                                    <p className="text-sm text-muted-foreground text-center py-4">
                                        No activity yet
                                    </p>
                                )}
                            </div>
                        </AppleCard>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
