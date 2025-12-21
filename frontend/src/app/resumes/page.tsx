"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    FileText, Sparkles, Download, CheckCircle2, AlertCircle,
    RefreshCw, Target, ArrowRight, Briefcase, Link2,
    AlertTriangle, TrendingUp, Copy, Eye
} from "lucide-react";
import { AppleCard } from "@/components/ui/AppleCard";
import { AppleButton } from "@/components/ui/AppleButton";
import { useToast } from "@/components/ui/Toast";
import axios from "axios";
import API_URL from "@/lib/api";
import Link from "next/link";

interface JobData {
    title: string;
    company: string;
    skills: string[];
    requirements: string[];
    description: string;
}

interface ProfileData {
    name: string;
    email: string;
    phone: string;
    summary: string;
    skills: string[];
    experience: Array<{ role: string; company: string; description: string }>;
    education: Array<{ institution: string; degree: string }>;
}

interface EnhancementResult {
    score: number;
    feedback: string[];
    suggestions: string[];
    matchedSkills: string[];
    missingSkills: string[];
    enhancedSummary: string;
}

const FADE_IN = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, ease: "easeOut" as const },
};

export default function ResumesPage() {
    const { toast } = useToast();
    const [currentJob, setCurrentJob] = useState<JobData | null>(null);
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [isEnhancing, setIsEnhancing] = useState(false);
    const [enhancement, setEnhancement] = useState<EnhancementResult | null>(null);
    const [showPreview, setShowPreview] = useState(false);

    useEffect(() => {
        // Load current job from localStorage
        const savedJob = localStorage.getItem("currentJobForResume");
        if (savedJob) {
            setCurrentJob(JSON.parse(savedJob));
        }

        // Load profile
        const savedProfile = localStorage.getItem("careerAgentProfile");
        if (savedProfile) {
            setProfile(JSON.parse(savedProfile));
        }
    }, []);

    const enhanceResume = async () => {
        if (!currentJob || !profile) {
            toast("Please add a job and complete your profile first", "error");
            return;
        }

        setIsEnhancing(true);
        try {
            // Call AI enhancement API
            const response = await axios.post(`${API_URL}/enhance-resume`, {
                resume_data: {
                    name: profile.name,
                    email: profile.email,
                    phone: profile.phone,
                    summary: profile.summary,
                    skills: profile.skills,
                    experience: profile.experience?.map(exp => ({
                        company: exp.company,
                        role: exp.role,
                        description: exp.description,
                    })) || [],
                    education: profile.education?.map(edu => ({
                        institution: edu.institution,
                        degree: edu.degree,
                    })) || [],
                },
                job_description: {
                    title: currentJob.title,
                    company: currentJob.company,
                    description: currentJob.description,
                    requirements: currentJob.requirements?.join(", ") || "",
                    skills: currentJob.skills?.join(", ") || "",
                },
            });

            const data = response.data;

            // Calculate real match score based on skills overlap
            const profileSkills = profile.skills?.map(s => s.toLowerCase()) || [];
            const jobSkills = currentJob.skills?.map(s => s.toLowerCase()) || [];
            const matchedSkills = jobSkills.filter(skill =>
                profileSkills.some(ps => ps.includes(skill) || skill.includes(ps))
            );
            const missingSkills = jobSkills.filter(skill =>
                !profileSkills.some(ps => ps.includes(skill) || skill.includes(ps))
            );

            const realScore = jobSkills.length > 0
                ? Math.round((matchedSkills.length / jobSkills.length) * 100)
                : 50;

            setEnhancement({
                score: data.score || realScore,
                feedback: data.feedback ? [data.feedback] : [
                    realScore >= 70 ? "Strong skill alignment with this role" : "Some key skills may need development",
                    profile.experience?.length > 0 ? "Relevant experience detected" : "Add more experience details",
                ],
                suggestions: data.suggestions || [
                    "Quantify your achievements with numbers",
                    "Add keywords from the job description",
                    "Highlight relevant projects",
                ],
                matchedSkills: matchedSkills.map(s => s.charAt(0).toUpperCase() + s.slice(1)),
                missingSkills: missingSkills.map(s => s.charAt(0).toUpperCase() + s.slice(1)),
                enhancedSummary: data.tailored_summary || profile.summary || "",
            });

            toast("Resume analysis complete!", "success");
        } catch (error) {
            console.error("Enhancement error:", error);

            // Fallback: Calculate score locally
            const profileSkills = profile.skills?.map(s => s.toLowerCase()) || [];
            const jobSkills = currentJob.skills?.map(s => s.toLowerCase()) || [];
            const matchedSkills = jobSkills.filter(skill =>
                profileSkills.some(ps => ps.includes(skill) || skill.includes(ps))
            );
            const missingSkills = jobSkills.filter(skill =>
                !profileSkills.some(ps => ps.includes(skill) || skill.includes(ps))
            );

            const realScore = jobSkills.length > 0
                ? Math.round((matchedSkills.length / jobSkills.length) * 100)
                : 50;

            setEnhancement({
                score: realScore,
                feedback: [
                    realScore >= 70 ? "Good skill match for this role" : "Consider adding more relevant skills",
                    profile.experience?.length > 0 ? "Experience section looks good" : "Add work experience",
                ],
                suggestions: [
                    "Add keywords from the job description to your summary",
                    "Quantify your achievements with metrics",
                    "Tailor your experience bullet points to match requirements",
                ],
                matchedSkills: matchedSkills.map(s => s.charAt(0).toUpperCase() + s.slice(1)),
                missingSkills: missingSkills.map(s => s.charAt(0).toUpperCase() + s.slice(1)),
                enhancedSummary: profile.summary || "",
            });

            toast("Resume analyzed locally (AI unavailable)", "info");
        } finally {
            setIsEnhancing(false);
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return "text-green-500";
        if (score >= 60) return "text-yellow-500";
        return "text-red-500";
    };

    const getScoreLabel = (score: number) => {
        if (score >= 80) return "Excellent Match";
        if (score >= 60) return "Good Match";
        if (score >= 40) return "Needs Improvement";
        return "Low Match";
    };

    return (
        <div className="max-w-6xl mx-auto px-6 py-8">
            {/* Header */}
            <motion.div {...FADE_IN} className="mb-8">
                <h1 className="text-4xl font-bold tracking-tight mb-2">Resume Studio</h1>
                <p className="text-lg text-muted-foreground">Enhance your resume for specific job applications</p>
            </motion.div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="lg:col-span-2 space-y-6"
                >
                    {/* Job Context */}
                    <AppleCard className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="font-semibold">Target Job</h2>
                            <Link href="/jobs">
                                <AppleButton variant="secondary" size="sm">
                                    <Link2 size={14} />
                                    Change Job
                                </AppleButton>
                            </Link>
                        </div>

                        {currentJob ? (
                            <div className="flex items-start gap-4 p-4 bg-secondary/30 rounded-xl">
                                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center font-bold text-primary shrink-0">
                                    {currentJob.company?.charAt(0) || "J"}
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-medium">{currentJob.title}</h3>
                                    <p className="text-sm text-muted-foreground">{currentJob.company}</p>
                                    <div className="flex flex-wrap gap-1 mt-2">
                                        {currentJob.skills?.slice(0, 5).map((skill, idx) => (
                                            <span key={idx} className="text-xs px-2 py-0.5 bg-secondary rounded-full">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <Target className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                                <p className="text-muted-foreground mb-4">No job selected</p>
                                <Link href="/jobs">
                                    <AppleButton variant="primary">
                                        <Link2 size={14} />
                                        Analyze a Job First
                                    </AppleButton>
                                </Link>
                            </div>
                        )}
                    </AppleCard>

                    {/* Enhancement Results */}
                    {enhancement && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <AppleCard className="overflow-hidden">
                                {/* Score Header */}
                                <div className="p-6 border-b border-border bg-secondary/30">
                                    <div className="flex items-center gap-6">
                                        {/* Score Circle */}
                                        <div className="relative w-28 h-28 shrink-0">
                                            <svg className="w-28 h-28 transform -rotate-90">
                                                <circle
                                                    cx="56"
                                                    cy="56"
                                                    r="48"
                                                    stroke="currentColor"
                                                    strokeWidth="8"
                                                    fill="none"
                                                    className="text-secondary"
                                                />
                                                <motion.circle
                                                    cx="56"
                                                    cy="56"
                                                    r="48"
                                                    stroke="currentColor"
                                                    strokeWidth="8"
                                                    fill="none"
                                                    className={getScoreColor(enhancement.score)}
                                                    strokeLinecap="round"
                                                    initial={{ strokeDasharray: "0 302" }}
                                                    animate={{ strokeDasharray: `${(enhancement.score / 100) * 302} 302` }}
                                                    transition={{ duration: 1, delay: 0.3 }}
                                                />
                                            </svg>
                                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                <span className={`text-3xl font-bold ${getScoreColor(enhancement.score)}`}>
                                                    {enhancement.score}%
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex-1">
                                            <h3 className="text-lg font-semibold mb-2">{getScoreLabel(enhancement.score)}</h3>
                                            <div className="space-y-2">
                                                {enhancement.feedback.map((item, idx) => (
                                                    <div key={idx} className="flex items-center gap-2 text-sm">
                                                        {enhancement.score >= 60 ? (
                                                            <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                                                        ) : (
                                                            <AlertCircle className="w-4 h-4 text-yellow-500 shrink-0" />
                                                        )}
                                                        <span>{item}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Skills Analysis */}
                                <div className="p-6 space-y-6">
                                    {/* Matched Skills */}
                                    {enhancement.matchedSkills.length > 0 && (
                                        <div>
                                            <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                                                <CheckCircle2 size={14} className="text-green-500" />
                                                Skills You Have ({enhancement.matchedSkills.length})
                                            </h4>
                                            <div className="flex flex-wrap gap-2">
                                                {enhancement.matchedSkills.map((skill, idx) => (
                                                    <span key={idx} className="apple-pill bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                                        {skill}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Missing Skills */}
                                    {enhancement.missingSkills.length > 0 && (
                                        <div>
                                            <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                                                <AlertTriangle size={14} className="text-yellow-500" />
                                                Skills to Add ({enhancement.missingSkills.length})
                                            </h4>
                                            <div className="flex flex-wrap gap-2">
                                                {enhancement.missingSkills.map((skill, idx) => (
                                                    <span key={idx} className="apple-pill bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                                                        {skill}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Suggestions */}
                                    <div>
                                        <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                                            <Sparkles size={14} className="text-primary" />
                                            AI Suggestions
                                        </h4>
                                        <ul className="space-y-2">
                                            {enhancement.suggestions.map((suggestion, idx) => (
                                                <li key={idx} className="flex items-start gap-2 text-sm">
                                                    <ArrowRight size={14} className="text-primary mt-0.5 shrink-0" />
                                                    <span>{suggestion}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="p-6 border-t border-border bg-secondary/30 flex flex-wrap gap-3">
                                    <Link href="/profile">
                                        <AppleButton variant="primary">
                                            <FileText size={14} />
                                            Update My Profile
                                        </AppleButton>
                                    </Link>
                                    <Link href="/communication">
                                        <AppleButton variant="secondary">
                                            Generate Cover Letter
                                        </AppleButton>
                                    </Link>
                                    <AppleButton variant="secondary" onClick={() => setShowPreview(true)}>
                                        <Eye size={14} />
                                        Preview Resume
                                    </AppleButton>
                                </div>
                            </AppleCard>
                        </motion.div>
                    )}

                    {/* Enhance Button (when no results yet) */}
                    {!enhancement && currentJob && profile && (
                        <AppleCard className="p-8 text-center">
                            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                                <Sparkles className="w-8 h-8 text-primary" />
                            </div>
                            <h3 className="text-xl font-semibold mb-3">Ready to Enhance</h3>
                            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                                Click below to analyze how well your profile matches this job and get personalized suggestions.
                            </p>
                            <AppleButton
                                variant="primary"
                                onClick={enhanceResume}
                                disabled={isEnhancing}
                                className="px-8 py-4 text-base"
                            >
                                {isEnhancing ? (
                                    <>
                                        <RefreshCw size={18} className="animate-spin" />
                                        Analyzing...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles size={18} />
                                        Analyze My Resume
                                    </>
                                )}
                            </AppleButton>
                        </AppleCard>
                    )}
                </motion.div>

                {/* Sidebar */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="space-y-6"
                >
                    {/* Profile Summary */}
                    <AppleCard className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="font-semibold">Your Profile</h2>
                            <Link href="/profile" className="text-sm text-primary hover:underline">
                                Edit
                            </Link>
                        </div>

                        {profile ? (
                            <div className="space-y-4">
                                <div>
                                    <p className="font-medium">{profile.name || "Your Name"}</p>
                                    <p className="text-sm text-muted-foreground">{profile.email || "Add email"}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground mb-2">Skills ({profile.skills?.length || 0})</p>
                                    <div className="flex flex-wrap gap-1">
                                        {profile.skills?.slice(0, 6).map((skill, idx) => (
                                            <span key={idx} className="text-xs px-2 py-0.5 bg-secondary rounded-full">
                                                {skill}
                                            </span>
                                        ))}
                                        {(profile.skills?.length || 0) > 6 && (
                                            <span className="text-xs text-muted-foreground">+{profile.skills.length - 6} more</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-4">
                                <p className="text-sm text-muted-foreground mb-3">No profile found</p>
                                <Link href="/profile">
                                    <AppleButton variant="secondary" size="sm">
                                        Create Profile
                                    </AppleButton>
                                </Link>
                            </div>
                        )}
                    </AppleCard>

                    {/* Export Options */}
                    <AppleCard className="p-6">
                        <h2 className="font-semibold mb-4">Export Resume</h2>
                        <div className="space-y-2">
                            <AppleButton variant="secondary" className="w-full justify-start">
                                <Download size={14} />
                                Download as PDF
                            </AppleButton>
                            <AppleButton variant="secondary" className="w-full justify-start">
                                <Download size={14} />
                                Download as DOCX
                            </AppleButton>
                            <AppleButton variant="secondary" className="w-full justify-start">
                                <Copy size={14} />
                                Copy to Clipboard
                            </AppleButton>
                        </div>
                    </AppleCard>

                    {/* Tips */}
                    <AppleCard className="p-6">
                        <h2 className="font-semibold mb-4">Resume Tips</h2>
                        <div className="space-y-3 text-sm text-muted-foreground">
                            <p>✓ Use keywords from the job description</p>
                            <p>✓ Quantify achievements with numbers</p>
                            <p>✓ Keep it to 1-2 pages</p>
                            <p>✓ Tailor for each application</p>
                        </div>
                    </AppleCard>
                </motion.div>
            </div>
        </div>
    );
}
