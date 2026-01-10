"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
    Link2, FileText, MessageSquare, Target, TrendingUp,
    Briefcase, Plus, ExternalLink, Trash2, Building2,
    Sparkles, Clock, Zap, Award
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
    analyzing: { label: "Analyzing", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400", gradient: "from-blue-500 to-cyan-400" },
    resume_updated: { label: "Resume Ready", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400", gradient: "from-purple-500 to-pink-400" },
    applied: { label: "Applied", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400", gradient: "from-green-500 to-emerald-400" },
    interviewing: { label: "Interviewing", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400", gradient: "from-yellow-500 to-orange-400" },
    offer: { label: "Offer", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400", gradient: "from-emerald-500 to-green-400" },
    rejected: { label: "Rejected", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400", gradient: "from-red-500 to-pink-400" },
};

const FADE_IN = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, ease: "easeOut" },
};

const quickActions = [
    { href: "/jobs", icon: Link2, label: "Analyze Job", desc: "Paste a job URL", highlight: true, gradient: "from-blue-500 to-cyan-400" },
    { href: "/resumes", icon: FileText, label: "Resume Studio", desc: "Enhance your resume", gradient: "from-purple-500 to-pink-400" },
    { href: "/communication", icon: MessageSquare, label: "Messages", desc: "Generate outreach", gradient: "from-green-500 to-emerald-400" },
    { href: "/profile", icon: Target, label: "My Profile", desc: "Update your info", gradient: "from-orange-500 to-red-400" },
];

export default function DashboardPage() {
    const { toast } = useToast();
    const [trackedJobs, setTrackedJobs] = useState<TrackedJob[]>([]);
    const [profileComplete, setProfileComplete] = useState(0);
    const greeting = new Date().getHours() < 12 ? "Good morning" : new Date().getHours() < 18 ? "Good afternoon" : "Good evening";

    useEffect(() => {
        const loadData = () => {
            try {
                const jobs = secureGet<Array<{ id: string; title: string; company: string; url: string; analyzedAt: string }>>('analyzedJobs');
                if (jobs && Array.isArray(jobs)) {
                    setTrackedJobs(jobs.map((job) => ({
                        id: job.id || Math.random().toString(),
                        title: job.title || "Unknown Job",
                        company: job.company || "Unknown Company",
                        url: job.url || "",
                        status: "analyzing",
                        createdAt: job.analyzedAt || new Date().toISOString(),
                    })));
                }

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
        secureSet('analyzedJobs', updated);
        toast(`Status updated to ${STATUS_CONFIG[status].label}`, "success");
    };

    const deleteTrackedJob = (jobId: string) => {
        const updated = trackedJobs.filter(job => job.id !== jobId);
        setTrackedJobs(updated);
        secureSet('analyzedJobs', updated);
        toast("Job removed from tracking", "info");
    };

    const stats = [
        { label: "Jobs Analyzed", value: trackedJobs.length.toString(), icon: Target, gradient: "from-blue-500 to-cyan-400", change: "+12% this week" },
        { label: "Resumes Updated", value: trackedJobs.filter(j => j.status !== "analyzing").length.toString(), icon: FileText, gradient: "from-purple-500 to-pink-400", change: "3 this week" },
        { label: "Applications", value: trackedJobs.filter(j => ["applied", "interviewing", "offer"].includes(j.status)).length.toString(), icon: Briefcase, gradient: "from-green-500 to-emerald-400", change: "+2 this week" },
        { label: "Profile Strength", value: `${profileComplete}%`, icon: TrendingUp, gradient: "from-orange-500 to-red-400", change: profileComplete < 100 ? "Complete now" : "Perfect!" },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
                {/* Header with Premium Styling */}
                <motion.div {...FADE_IN} className="mb-8 sm:mb-12">
                    <div className="relative inline-block mb-4">
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
                            {greeting}
                            <span className="inline-block ml-2">👋</span>
                        </h1>
                        {/* Gradient underline */}
                        <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-primary via-purple-500 to-pink-500 rounded-full opacity-60" />
                    </div>
                    <p className="text-lg sm:text-xl text-muted-foreground mt-6">Track your job applications and manage your career tools.</p>
                </motion.div>

                {/* Stats Cards with Glassmorphism */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12"
                >
                    {stats.map((stat, index) => (
                        <motion.div
                            key={index}
                            whileHover={{ y: -4, scale: 1.02 }}
                            transition={{ type: "spring", stiffness: 300 }}
                            className="group relative"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl blur-xl -z-10"
                                style={{ background: `linear-gradient(to bottom right, var(--tw-gradient-stops))` }} />
                            <AppleCard className="relative overflow-hidden border-border/40 hover:border-primary/30 transition-all">
                                {/* Top gradient bar */}
                                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.gradient}`} />

                                <div className="p-5 sm:p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                                            <stat.icon className="w-6 h-6 text-white" />
                                        </div>
                                        <span className="text-xs font-medium text-muted-foreground bg-secondary/50 px-2 py-1 rounded-full"
                                        >{stat.change}</span>
                                    </div>
                                    <div className="text-3xl sm:text-4xl font-bold mb-2 bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
                                        {stat.value}
                                    </div>
                                    <div className="text-sm text-muted-foreground font-medium">{stat.label}</div>
                                </div>
                            </AppleCard>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Quick Actions - Premium Style */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="mb-8 sm:mb-12"
                >
                    <div className="flex items-center gap-2 mb-6">
                        <Zap className="w-5 h-5 text-primary" />
                        <h2 className="text-2xl font-bold">Quick Actions</h2>
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {quickActions.map((action, index) => (
                            <Link key={index} href={action.href}>
                                <motion.div whileHover={{ y: -6, scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                                    <AppleCard className={`group relative h-full cursor-pointer overflow-hidden transition-all duration-300 ${action.highlight ? "border-2 border-primary/40 shadow-lg shadow-primary/10" : "border-border/40 hover:border-primary/30"
                                        }`}>
                                        {/* Gradient overlay on hover */}
                                        <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-[0.08] transition-opacity`} />

                                        <div className="p-5 sm:p-6 relative z-10">
                                            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${action.gradient} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-transform`}>
                                                <action.icon className="w-7 h-7 text-white" />
                                            </div>
                                            <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">{action.label}</h3>
                                            <p className="text-sm text-muted-foreground">{action.desc}</p>
                                        </div>

                                        {action.highlight && (
                                            <div className="absolute top-3 right-3">
                                                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                                            </div>
                                        )}
                                    </AppleCard>
                                </motion.div>
                            </Link>
                        ))}
                    </div>
                </motion.div>

                <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">
                    {/* Main Content - Tracked Jobs */}
                    <div className="lg:col-span-2 space-y-6">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                        >
                            <AppleCard className="overflow-hidden border-border/40">
                                {/* Card header with gradient */}
                                <div className="bg-gradient-to-r from-primary/5 via-purple-500/5 to-pink-500/5 border-b border-border/40 p-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-lg">
                                                <Briefcase className="w-5 h-5 text-white" />
                                            </div>
                                            <h2 className="text-xl font-semibold">Job Applications</h2>
                                        </div>
                                        <Link href="/jobs">
                                            <AppleButton variant="secondary" size="sm" className="shadow-sm">
                                                <Plus size={14} />
                                                Add Job
                                            </AppleButton>
                                        </Link>
                                    </div>
                                </div>

                                <div className="p-6">
                                    {trackedJobs.length > 0 ? (
                                        <div className="space-y-3">
                                            {trackedJobs.map((job) => (
                                                <motion.div
                                                    key={job.id}
                                                    whileHover={{ x: 4, scale: 1.01 }}
                                                    className="group relative flex items-center justify-between p-4 rounded-2xl bg-gradient-to-br from-secondary/30 to-secondary/50 hover:from-secondary/50 hover:to-secondary/70 border border-border/20 hover:border-primary/20 transition-all"
                                                >
                                                    {/* Status indicator bar */}
                                                    <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl bg-gradient-to-b ${STATUS_CONFIG[job.status].gradient}`} />

                                                    <div className="flex items-center gap-4 flex-1 min-w-0">
                                                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${STATUS_CONFIG[job.status].gradient} flex items-center justify-center font-bold text-white text-lg shadow-md flex-shrink-0`}>
                                                            {job.company.charAt(0)}
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <h4 className="font-semibold text-sm sm:text-base truncate">{job.title}</h4>
                                                            <p className="text-sm text-muted-foreground flex items-center gap-1.5 truncate">
                                                                <Building2 size={12} className="flex-shrink-0" />
                                                                {job.company}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2 flex-shrink-0">
                                                        <select
                                                            value={job.status}
                                                            onChange={(e) => updateJobStatus(job.id, e.target.value as TrackedJob["status"])}
                                                            className={`text-xs font-semibold px-3 py-1.5 rounded-full border-0 cursor-pointer shadow-sm ${STATUS_CONFIG[job.status].color}`}
                                                        >
                                                            {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                                                                <option key={key} value={key}>{config.label}</option>
                                                            ))}
                                                        </select>
                                                        <a
                                                            href={sanitizeUrl(job.url)}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="p-2 rounded-lg hover:bg-background/50 transition-colors"
                                                        >
                                                            <ExternalLink size={14} className="text-muted-foreground hover:text-primary transition-colors" />
                                                        </a>
                                                        <button
                                                            onClick={() => deleteTrackedJob(job.id)}
                                                            className="p-2 rounded-lg hover:bg-background/50 transition-colors text-muted-foreground hover:text-destructive"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-16">
                                            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary/10 to-purple-500/10 flex items-center justify-center mx-auto mb-6 border border-primary/20">
                                                <Briefcase className="w-10 h-10 text-primary" />
                                            </div>
                                            <h3 className="font-semibold text-lg mb-2">No jobs tracked yet</h3>
                                            <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
                                                Start by analyzing a job posting to track your applications
                                            </p>
                                            <Link href="/jobs">
                                                <AppleButton variant="primary" className="shadow-lg shadow-primary/20">
                                                    <Link2 size={14} />
                                                    Analyze Your First Job
                                                </AppleButton>
                                            </Link>
                                        </div>
                                    )}
                                </div>
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
                            <AppleCard className="overflow-hidden border-border/40">
                                <div className="bg-gradient-to-br from-primary/10 via-purple-500/10 to-pink-500/10 p-6 border-b border-border/20">
                                    <div className="flex items-center gap-3">
                                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-lg">
                                            <Sparkles className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <h2 className="font-semibold text-lg">AI Tips</h2>
                                            <p className="text-xs text-muted-foreground">Personalized for you</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-6 space-y-3">
                                    {profileComplete < 100 && (
                                        <div className="p-4 rounded-xl bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200/50 dark:border-yellow-800/50">
                                            <p className="text-sm text-yellow-700 dark:text-yellow-400 font-medium">
                                                💡 Complete your profile to get better resume optimization
                                            </p>
                                        </div>
                                    )}
                                    <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200/50 dark:border-blue-800/50">
                                        <p className="text-sm text-blue-700 dark:text-blue-400 font-medium">
                                            🎯 Tailor your resume for each job you apply to for 3x more interviews
                                        </p>
                                    </div>
                                    <div className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200/50 dark:border-purple-800/50">
                                        <p className="text-sm text-purple-700 dark:text-purple-400 font-medium">
                                            ⚡ Use the bullet library to save time on future applications
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
                            <AppleCard className="p-6 border-border/40">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="font-semibold text-lg flex items-center gap-2">
                                        <Award className="w-5 h-5 text-primary" />
                                        Profile Strength
                                    </h2>
                                    <span className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">{profileComplete}%</span>
                                </div>
                                <div className="h-3 bg-secondary/50 rounded-full overflow-hidden mb-6 border border-border/30">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${profileComplete}%` }}
                                        transition={{ duration: 1, delay: 0.8, ease: "easeOut" }}
                                        className="h-full bg-gradient-to-r from-primary via-purple-500 to-pink-500 rounded-full relative overflow-hidden"
                                    >
                                        {/* Animated shine effect */}
                                        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                                    </motion.div>
                                </div>
                                <Link href="/profile">
                                    <AppleButton variant="secondary" className="w-full shadow-sm">
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
                            <AppleCard className="p-6 border-border/40">
                                <div className="flex items-center gap-2 mb-6">
                                    <Clock className="w-5 h-5 text-muted-foreground" />
                                    <h2 className="font-semibold text-lg">Recent Activity</h2>
                                </div>
                                <div className="space-y-3">
                                    {trackedJobs.slice(0, 3).map((job, idx) => (
                                        <div key={idx} className="flex items-center gap-3 text-sm p-3 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors">
                                            <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${STATUS_CONFIG[job.status].gradient} shadow-sm`} />
                                            <span className="text-muted-foreground truncate flex-1">
                                                Analyzed <span className="font-medium text-foreground">{job.title}</span> at {job.company}
                                            </span>
                                        </div>
                                    ))}
                                    {trackedJobs.length === 0 && (
                                        <p className="text-sm text-muted-foreground text-center py-8 bg-secondary/30 rounded-xl">
                                            No activity yet
                                        </p>
                                    )}
                                </div>
                            </AppleCard>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
}
