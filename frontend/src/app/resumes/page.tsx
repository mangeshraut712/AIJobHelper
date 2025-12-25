"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    FileText, Sparkles, Download, CheckCircle2, AlertCircle,
    RefreshCw, Target, ArrowRight, Briefcase, Link2,
    AlertTriangle, Copy, Eye, BarChart2, Wrench,
    Edit2, Trash2, Plus, Save
} from "lucide-react";


import { AppleCard } from "@/components/ui/AppleCard";
import { AppleButton } from "@/components/ui/AppleButton";
import { useToast } from "@/components/ui/Toast";
import axios from "axios";
import API_URL from "@/lib/api";
import Link from "next/link";
import { secureGet, secureSet } from "@/lib/secureStorage";
import { STORAGE_KEYS, migrateOldKeys } from "@/lib/storageKeys";

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

interface ExperienceImprovement {
    original: { role: string; company: string; description: string };
    issues: string[];
    suggested_bullets: string[];
    ai_suggested_bullets?: string[];
}

interface SectionImprovements {
    summary: {
        current: string;
        issues: string[];
        suggested: string;
        tips: string[];
    };
    experience: {
        items: ExperienceImprovement[];
        general_tips: string[];
    };
    skills: {
        matched: string[];
        missing: string[];
        suggested_additions: string[];
    };
    projects: {
        tips: string[];
        suggested: string[];
    };
}

interface ScoreBreakdown {
    skills_match: number;
    experience_relevance: number;
    keyword_density: number;
    education: number;
    format_quality: number;
}

interface EnhancementResult {
    score: number;
    ats_score: number;
    score_breakdown: ScoreBreakdown;
    feedback: string;
    suggestions: string[];
    matchedSkills: string[];
    missingSkills: string[];
    enhancedSummary: string;
    suggestedSkillsToAdd: string[];
    section_improvements: SectionImprovements;
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
    const [isExporting, setIsExporting] = useState(false);
    const [enhancement, setEnhancement] = useState<EnhancementResult | null>(null);
    const [showPreview, setShowPreview] = useState(false);
    const [useAI, setUseAI] = useState(true);
    const [hasAppliedSuggestions, setHasAppliedSuggestions] = useState(false);

    // Editable state for AI suggestions
    const [editableBullets, setEditableBullets] = useState<Record<string, string[]>>({});
    const [editingSummary, setEditingSummary] = useState(false);
    const [editedSummary, setEditedSummary] = useState("");


    useEffect(() => {
        // Migrate old storage keys to new standard keys
        migrateOldKeys();

        // Load current job from secure storage
        const savedJob = secureGet<JobData>(STORAGE_KEYS.CURRENT_JOB_FOR_RESUME);
        if (savedJob) {
            setCurrentJob(savedJob);
        }

        // Load profile from secure storage
        const savedProfile = secureGet<ProfileData>(STORAGE_KEYS.PROFILE);
        if (savedProfile) {
            setProfile(savedProfile);
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
                    name: profile.name || "Name",
                    email: profile.email || "email@example.com",
                    phone: profile.phone || "",
                    location: "",
                    linkedin: "",
                    website: "",
                    summary: profile.summary || "",
                    skills: profile.skills || [],
                    experience: profile.experience?.map(exp => ({
                        company: exp.company || "",
                        role: exp.role || "",
                        duration: "",
                        description: exp.description || "",
                    })) || [],
                    education: profile.education?.map(edu => ({
                        institution: edu.institution || "",
                        degree: edu.degree || "",
                        graduation_year: "",
                    })) || [],
                },
                job_description: {
                    title: currentJob.title || "Job",
                    company: currentJob.company || "Company",
                    description: currentJob.description || "",
                    requirements: currentJob.requirements || [],
                    responsibilities: [],
                    skills: currentJob.skills || [],
                },
            });


            const data = response.data;

            // Use the real ATS score from the backend
            const sectionImprovements = data.section_improvements || {
                summary: { current: "", issues: [], suggested: data.tailored_summary || "", tips: [] },
                experience: { items: [], general_tips: [] },
                skills: { matched: [], missing: [], suggested_additions: [] },
                projects: { tips: [], suggested: [] },
            };

            setEnhancement({
                score: data.ats_score || data.score || 50,
                ats_score: data.ats_score || data.score || 50,
                score_breakdown: data.score_breakdown || {
                    skills_match: 0,
                    experience_relevance: 0,
                    keyword_density: 0,
                    education: 0,
                    format_quality: 0,
                },
                feedback: data.feedback || "Analysis complete",
                suggestions: data.suggestions || [],
                matchedSkills: sectionImprovements.skills?.matched || [],
                missingSkills: sectionImprovements.skills?.missing || [],
                enhancedSummary: data.tailored_summary || profile.summary || "",
                suggestedSkillsToAdd: sectionImprovements.skills?.suggested_additions || [],
                section_improvements: sectionImprovements,
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
                ats_score: realScore,
                score_breakdown: {
                    skills_match: Math.round((matchedSkills.length / Math.max(jobSkills.length, 1)) * 100),
                    experience_relevance: profile.experience?.length ? 60 : 20,
                    keyword_density: Math.round((matchedSkills.length / Math.max(jobSkills.length, 1)) * 100),
                    education: profile.education?.length ? 80 : 20,
                    format_quality: profile.summary ? 80 : 40,
                },
                feedback: realScore >= 70 ? "✓ Good skill match for this role" : "⚠ Consider adding more relevant skills",
                suggestions: [
                    "Add keywords from the job description to your summary",
                    "Quantify your achievements with metrics",
                    "Tailor your experience bullet points to match requirements",
                ],
                matchedSkills: matchedSkills.map(s => s.charAt(0).toUpperCase() + s.slice(1)),
                missingSkills: missingSkills.map(s => s.charAt(0).toUpperCase() + s.slice(1)),
                enhancedSummary: profile.summary || "",
                suggestedSkillsToAdd: missingSkills.map(s => s.charAt(0).toUpperCase() + s.slice(1)),
                section_improvements: {
                    summary: {
                        current: profile.summary || "",
                        issues: !profile.summary ? ["Missing professional summary"] : [],
                        suggested: `Results-driven professional seeking ${currentJob?.title || "this"} role. ${profile.summary || ""}`,
                        tips: ["Add keywords from the job description"],
                    },
                    experience: {
                        items: (profile.experience || []).map(exp => ({
                            original: exp,
                            issues: ["Add quantified achievements with metrics"],
                            suggested_bullets: ["• Led initiatives resulting in improvements"],
                        })),
                        general_tips: ["Start with action verbs", "Include numbers/metrics"],
                    },
                    skills: {
                        matched: matchedSkills,
                        missing: missingSkills,
                        suggested_additions: missingSkills,
                    },
                    projects: {
                        tips: ["Add 2-3 relevant projects"],
                        suggested: [],
                    },
                },
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

    const applyAISuggestions = () => {
        if (!profile || !enhancement) return;

        // Add missing skills to profile
        const currentSkills = new Set(profile.skills?.map(s => s.toLowerCase()) || []);
        const newSkills = [...(profile.skills || [])];

        enhancement.suggestedSkillsToAdd.forEach(skill => {
            if (!currentSkills.has(skill.toLowerCase())) {
                newSkills.push(skill);
            }
        });

        // Update profile with enhanced summary and new skills
        const updatedProfile = {
            ...profile,
            skills: newSkills,
            summary: enhancement.enhancedSummary || profile.summary,
        };

        setProfile(updatedProfile);
        secureSet("profile", updatedProfile);
        setHasAppliedSuggestions(true);
        toast(`Added ${enhancement.suggestedSkillsToAdd.length} skills and enhanced summary!`, "success");
    };

    const addSingleSkill = (skill: string) => {
        if (!profile) return;

        const currentSkills = profile.skills || [];
        if (!currentSkills.some(s => s.toLowerCase() === skill.toLowerCase())) {
            const updatedProfile = {
                ...profile,
                skills: [...currentSkills, skill],
            };
            setProfile(updatedProfile);
            secureSet("profile", updatedProfile);
            toast(`Added "${skill}" to your skills!`, "success");
        }
    };

    const applyEnhancedSummary = () => {
        if (!profile || !enhancement?.enhancedSummary) return;

        const updatedProfile = {
            ...profile,
            summary: enhancement.enhancedSummary,
        };
        setProfile(updatedProfile);
        secureSet("profile", updatedProfile);
        toast("Summary updated with AI enhancement!", "success");
    };

    const reAnalyzeResume = async () => {
        setHasAppliedSuggestions(false);
        await enhanceResume();
    };

    const applyExperienceBullets = (experienceIndex: number, suggestedBullets: string[]) => {
        if (!profile || !profile.experience) return;

        const updatedExperience = [...profile.experience];
        const currentExp = updatedExperience[experienceIndex];

        // Combine existing description with new bullet points
        const existingDesc = currentExp.description || "";
        const newBullets = suggestedBullets.join("\n");
        const enhancedDescription = existingDesc ? `${existingDesc}\n\n${newBullets}` : newBullets;

        updatedExperience[experienceIndex] = {
            ...currentExp,
            description: enhancedDescription,
        };

        const updatedProfile = {
            ...profile,
            experience: updatedExperience,
        };

        setProfile(updatedProfile);
        secureSet("profile", updatedProfile);
        toast(`Applied ${suggestedBullets.length} bullet points to "${currentExp.role}"!`, "success");
    };

    const applyAllExperienceImprovements = () => {
        if (!profile || !profile.experience || !enhancement?.section_improvements?.experience?.items) return;

        const updatedExperience = profile.experience.map((exp, idx) => {
            const improvement = enhancement.section_improvements.experience.items[idx];
            if (!improvement) return exp;

            const bullets = improvement.ai_suggested_bullets || improvement.suggested_bullets || [];
            if (bullets.length === 0) return exp;

            const existingDesc = exp.description || "";
            const newBullets = bullets.join("\n");

            return {
                ...exp,
                description: existingDesc ? `${existingDesc}\n\n${newBullets}` : newBullets,
            };
        });

        const updatedProfile = {
            ...profile,
            experience: updatedExperience,
        };

        setProfile(updatedProfile);
        secureSet("profile", updatedProfile);
        toast("Applied AI improvements to all experiences!", "success");
    };

    // Initialize editable bullets from enhancement
    const initEditableBullets = (experienceIndex: number) => {
        if (!enhancement?.section_improvements?.experience?.items?.[experienceIndex]) return;

        const item = enhancement.section_improvements.experience.items[experienceIndex];
        const bullets = item.ai_suggested_bullets || item.suggested_bullets || [];

        setEditableBullets(prev => ({
            ...prev,
            [experienceIndex.toString()]: [...bullets],
        }));
    };

    // Update a specific bullet
    const updateBullet = (experienceIndex: number, bulletIndex: number, newText: string) => {
        const key = experienceIndex.toString();
        setEditableBullets(prev => {
            const bullets = [...(prev[key] || [])];
            bullets[bulletIndex] = newText;
            return { ...prev, [key]: bullets };
        });
    };

    // Delete a bullet
    const deleteBullet = (experienceIndex: number, bulletIndex: number) => {
        const key = experienceIndex.toString();
        setEditableBullets(prev => {
            const bullets = [...(prev[key] || [])];
            bullets.splice(bulletIndex, 1);
            return { ...prev, [key]: bullets };
        });
        toast("Bullet point removed", "info");
    };

    // Add a new bullet
    const addBullet = (experienceIndex: number) => {
        const key = experienceIndex.toString();
        setEditableBullets(prev => {
            const bullets = [...(prev[key] || [])];
            bullets.push("• Add your achievement here with specific metrics");
            return { ...prev, [key]: bullets };
        });
    };

    // Save edited bullets to profile
    const saveBulletsToProfile = (experienceIndex: number) => {
        if (!profile || !profile.experience) return;

        const key = experienceIndex.toString();
        const bullets = editableBullets[key] || [];

        if (bullets.length === 0) {
            toast("Add at least one bullet point", "error");
            return;
        }

        const updatedExperience = [...profile.experience];
        const currentExp = updatedExperience[experienceIndex];
        const existingDesc = currentExp.description || "";
        const newBullets = bullets.join("\n");
        const enhancedDescription = existingDesc ? `${existingDesc}\n\n${newBullets}` : newBullets;

        updatedExperience[experienceIndex] = {
            ...currentExp,
            description: enhancedDescription,
        };

        const updatedProfile = {
            ...profile,
            experience: updatedExperience,
        };

        setProfile(updatedProfile);
        secureSet("profile", updatedProfile);
        toast(`Applied ${bullets.length} customized bullet points!`, "success");

        // Clear editable state for this experience
        setEditableBullets(prev => {
            const newState = { ...prev };
            delete newState[key];
            return newState;
        });
    };

    // Save edited summary
    const saveEditedSummary = () => {
        if (!profile || !editedSummary.trim()) return;

        const updatedProfile = {
            ...profile,
            summary: editedSummary.trim(),
        };

        setProfile(updatedProfile);
        secureSet("profile", updatedProfile);
        setEditingSummary(false);
        toast("Summary updated!", "success");
    };




    const buildResumeData = () => {
        if (!profile) return null;
        return {
            name: profile.name || "Name",
            email: profile.email || "",
            phone: profile.phone || "",
            location: "",
            linkedin: "",
            website: "",
            summary: enhancement?.enhancedSummary || profile.summary || "",
            skills: profile.skills || [],
            experience: profile.experience?.map(exp => ({
                company: exp.company || "",
                role: exp.role || "",
                duration: "",
                description: exp.description || "",
            })) || [],
            education: profile.education?.map(edu => ({
                institution: edu.institution || "",
                degree: edu.degree || "",
                graduation_year: "",
            })) || [],
        };
    };

    const exportPDF = async () => {
        const resumeData = buildResumeData();
        if (!resumeData) {
            toast("Please complete your profile first", "error");
            return;
        }

        setIsExporting(true);
        try {
            const response = await axios.post(`${API_URL}/export/pdf`, resumeData, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.download = `${profile?.name || 'resume'}_resume.pdf`;
            link.click();
            window.URL.revokeObjectURL(url);
            toast("PDF downloaded successfully!", "success");
        } catch {
            toast("PDF export failed. Try DOCX instead.", "error");
        } finally {
            setIsExporting(false);
        }
    };

    const exportDOCX = async () => {
        const resumeData = buildResumeData();
        if (!resumeData) {
            toast("Please complete your profile first", "error");
            return;
        }

        setIsExporting(true);
        try {
            const response = await axios.post(`${API_URL}/export/docx`, resumeData, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.download = `${profile?.name || 'resume'}_resume.docx`;
            link.click();
            window.URL.revokeObjectURL(url);
            toast("DOCX downloaded successfully!", "success");
        } catch {
            toast("DOCX export failed", "error");
        } finally {
            setIsExporting(false);
        }
    };

    const exportLaTeX = async () => {
        const resumeData = buildResumeData();
        if (!resumeData) {
            toast("Please complete your profile first", "error");
            return;
        }

        setIsExporting(true);
        try {
            const response = await axios.post(`${API_URL}/export/latex`, resumeData);
            const blob = new Blob([response.data], { type: 'text/plain' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${profile?.name || 'resume'}_resume.tex`;
            link.click();
            window.URL.revokeObjectURL(url);
            toast("LaTeX file downloaded!", "success");
        } catch {
            toast("LaTeX export failed", "error");
        } finally {
            setIsExporting(false);
        }
    };

    const copyToClipboard = () => {
        if (!profile) {
            toast("Please complete your profile first", "error");
            return;
        }

        const text = `${profile.name}
${profile.email} | ${profile.phone}

SUMMARY
${enhancement?.enhancedSummary || profile.summary || ""}

SKILLS
${profile.skills?.join(", ") || ""}

EXPERIENCE
${profile.experience?.map(exp => `${exp.role} at ${exp.company}\n${exp.description}`).join("\n\n") || ""}

EDUCATION
${profile.education?.map(edu => `${edu.degree} - ${edu.institution}`).join("\n") || ""}`;

        navigator.clipboard.writeText(text);
        toast("Resume copied to clipboard!", "success");
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
                                                {enhancement.feedback.split(" | ").map((item: string, idx: number) => (
                                                    <div key={idx} className="flex items-center gap-2 text-sm">
                                                        {item.startsWith("✓") ? (
                                                            <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                                                        ) : item.startsWith("✗") ? (
                                                            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                                                        ) : (
                                                            <AlertCircle className="w-4 h-4 text-yellow-500 shrink-0" />
                                                        )}
                                                        <span>{item.replace(/^[✓✗⚠]\s*/, "")}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                    </div>
                                </div>

                                {/* ATS Score Breakdown */}
                                <div className="p-6 border-t border-border">
                                    <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
                                        <BarChart2 size={14} />
                                        ATS Score Breakdown
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {[
                                            { label: "Skills Match", value: enhancement.score_breakdown.skills_match, weight: "30%" },
                                            { label: "Experience Relevance", value: enhancement.score_breakdown.experience_relevance, weight: "25%" },
                                            { label: "Keyword Density", value: enhancement.score_breakdown.keyword_density, weight: "20%" },
                                            { label: "Education", value: enhancement.score_breakdown.education, weight: "10%" },
                                            { label: "Format Quality", value: enhancement.score_breakdown.format_quality, weight: "15%" },
                                        ].map((item, idx) => (
                                            <div key={idx} className="space-y-1">
                                                <div className="flex justify-between text-xs">
                                                    <span>{item.label} <span className="text-muted-foreground">({item.weight})</span></span>
                                                    <span className={item.value >= 70 ? "text-green-500" : item.value >= 40 ? "text-yellow-500" : "text-red-500"}>
                                                        {item.value}%
                                                    </span>
                                                </div>
                                                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                                                    <motion.div
                                                        className={`h-full rounded-full ${item.value >= 70 ? "bg-green-500" : item.value >= 40 ? "bg-yellow-500" : "bg-red-500"
                                                            }`}
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${item.value}%` }}
                                                        transition={{ duration: 0.8, delay: idx * 0.1 }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
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

                                    {/* Missing Skills - Clickable to Add */}
                                    {enhancement.missingSkills.length > 0 && (
                                        <div>
                                            <div className="flex items-center justify-between mb-3">
                                                <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                                    <AlertTriangle size={14} className="text-yellow-500" />
                                                    Skills to Add ({enhancement.missingSkills.length})
                                                </h4>
                                                <AppleButton
                                                    variant="primary"
                                                    size="sm"
                                                    onClick={applyAISuggestions}
                                                    disabled={hasAppliedSuggestions}
                                                >
                                                    <Sparkles size={12} />
                                                    {hasAppliedSuggestions ? "Applied!" : "Add All Skills"}
                                                </AppleButton>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {enhancement.missingSkills.map((skill, idx) => {
                                                    const alreadyHas = profile?.skills?.some(s =>
                                                        s.toLowerCase() === skill.toLowerCase()
                                                    );
                                                    return (
                                                        <button
                                                            key={idx}
                                                            onClick={() => !alreadyHas && addSingleSkill(skill)}
                                                            disabled={alreadyHas}
                                                            className={`apple-pill flex items-center gap-1 transition-all ${alreadyHas
                                                                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                                                : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 hover:bg-yellow-200 cursor-pointer"
                                                                }`}
                                                        >
                                                            {alreadyHas ? (
                                                                <CheckCircle2 size={12} />
                                                            ) : (
                                                                <span className="font-bold">+</span>
                                                            )}
                                                            {skill}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}


                                    {/* Experience Improvements */}
                                    {enhancement.section_improvements?.experience?.items?.length > 0 && (
                                        <div className="border-t border-border pt-6">
                                            <div className="flex items-center justify-between mb-4">
                                                <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                                    <Briefcase size={14} />
                                                    Experience Improvements
                                                </h4>
                                                <AppleButton
                                                    variant="primary"
                                                    size="sm"
                                                    onClick={applyAllExperienceImprovements}
                                                >
                                                    <Sparkles size={12} />
                                                    Apply All Improvements
                                                </AppleButton>
                                            </div>
                                            <div className="space-y-4">
                                                {enhancement.section_improvements.experience.items.map((item, idx) => (
                                                    <div key={idx} className="bg-secondary/30 rounded-xl p-4">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <div>
                                                                <span className="font-medium">{item.original?.role || `Experience ${idx + 1}`}</span>
                                                                <span className="text-xs text-muted-foreground ml-2">{item.original?.company}</span>
                                                            </div>
                                                        </div>

                                                        {/* Current Description */}
                                                        {item.original?.description && (
                                                            <div className="text-xs text-muted-foreground mb-3 p-2 bg-secondary/50 rounded">
                                                                <span className="font-medium">Current: </span>
                                                                {item.original.description.slice(0, 100)}...
                                                            </div>
                                                        )}

                                                        {/* Issues */}
                                                        {item.issues?.length > 0 && (
                                                            <div className="space-y-1 mb-3">
                                                                {item.issues.map((issue, i) => (
                                                                    <div key={i} className="flex items-center gap-2 text-xs text-yellow-600 dark:text-yellow-400">
                                                                        <AlertTriangle size={12} />
                                                                        <span>{issue}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}


                                                        {/* Suggested Bullets with Edit/Apply Options */}
                                                        {((item.suggested_bullets?.length ?? 0) > 0 || (item.ai_suggested_bullets?.length ?? 0) > 0) && (
                                                            <div className="bg-primary/5 rounded-lg p-3">
                                                                <div className="flex items-center justify-between mb-3">
                                                                    <div className="flex items-center gap-2 text-xs font-medium text-primary">
                                                                        <Sparkles size={12} />
                                                                        Suggested Bullet Points
                                                                    </div>
                                                                    <div className="flex items-center gap-2">
                                                                        {editableBullets[idx.toString()] ? (
                                                                            <>
                                                                                <AppleButton
                                                                                    variant="secondary"
                                                                                    size="sm"
                                                                                    onClick={() => addBullet(idx)}
                                                                                >
                                                                                    <Plus size={12} />
                                                                                    Add
                                                                                </AppleButton>
                                                                                <AppleButton
                                                                                    variant="primary"
                                                                                    size="sm"
                                                                                    onClick={() => saveBulletsToProfile(idx)}
                                                                                >
                                                                                    <Save size={12} />
                                                                                    Save
                                                                                </AppleButton>
                                                                            </>
                                                                        ) : (
                                                                            <>
                                                                                <AppleButton
                                                                                    variant="secondary"
                                                                                    size="sm"
                                                                                    onClick={() => initEditableBullets(idx)}
                                                                                >
                                                                                    <Edit2 size={12} />
                                                                                    Edit
                                                                                </AppleButton>
                                                                                <AppleButton
                                                                                    variant="primary"
                                                                                    size="sm"
                                                                                    onClick={() => applyExperienceBullets(
                                                                                        idx,
                                                                                        item.ai_suggested_bullets || item.suggested_bullets || []
                                                                                    )}
                                                                                >
                                                                                    <CheckCircle2 size={12} />
                                                                                    Apply All
                                                                                </AppleButton>
                                                                            </>
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                {/* Editable or Static Bullets */}
                                                                {editableBullets[idx.toString()] ? (
                                                                    <div className="space-y-2">
                                                                        {editableBullets[idx.toString()].map((bullet, i) => (
                                                                            <div key={i} className="flex items-start gap-2 group">
                                                                                <ArrowRight size={12} className="mt-2 text-primary shrink-0" />
                                                                                <input
                                                                                    type="text"
                                                                                    value={bullet}
                                                                                    onChange={(e) => updateBullet(idx, i, e.target.value)}
                                                                                    className="flex-1 bg-background border border-border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                                                                                />
                                                                                <button
                                                                                    onClick={() => deleteBullet(idx, i)}
                                                                                    className="p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded opacity-70 hover:opacity-100"
                                                                                >
                                                                                    <Trash2 size={14} />
                                                                                </button>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                ) : (
                                                                    <ul className="space-y-2 text-sm">
                                                                        {(item.ai_suggested_bullets || item.suggested_bullets || []).map((bullet, i) => (
                                                                            <li key={i} className="text-muted-foreground flex items-start gap-2">
                                                                                <ArrowRight size={12} className="mt-1 text-primary shrink-0" />
                                                                                <span>{bullet}</span>
                                                                            </li>
                                                                        ))}
                                                                    </ul>
                                                                )}
                                                            </div>
                                                        )}

                                                    </div>
                                                ))}
                                            </div>

                                            {enhancement.section_improvements.experience.general_tips?.length > 0 && (
                                                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                                    <div className="flex items-center gap-2 text-xs font-medium text-blue-600 dark:text-blue-400 mb-2">
                                                        <Wrench size={12} />
                                                        General Tips
                                                    </div>
                                                    <ul className="space-y-1 text-xs text-blue-700 dark:text-blue-300">
                                                        {enhancement.section_improvements.experience.general_tips.map((tip, idx) => (
                                                            <li key={idx}>• {tip}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Projects Section */}
                                    {enhancement.section_improvements?.projects?.tips?.length > 0 && (
                                        <div className="border-t border-border pt-6">
                                            <div className="flex items-center justify-between mb-4">
                                                <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                                    <Target size={14} />
                                                    Projects Recommendations
                                                </h4>
                                                <Link href="/profile">
                                                    <AppleButton variant="secondary" size="sm">
                                                        <FileText size={12} />
                                                        Add Projects
                                                    </AppleButton>
                                                </Link>
                                            </div>
                                            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
                                                <ul className="space-y-2 text-sm text-orange-700 dark:text-orange-300">
                                                    {enhancement.section_improvements.projects.tips.map((tip, idx) => (
                                                        <li key={idx} className="flex items-start gap-2">
                                                            <ArrowRight size={14} className="mt-0.5 shrink-0" />
                                                            <span>{tip}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    )}

                                    {/* AI Suggestions */}
                                    <div className="border-t border-border pt-6">
                                        <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                                            <Sparkles size={14} className="text-primary" />
                                            Quick Actions
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                            {enhancement.suggestions.map((suggestion, idx) => (
                                                <div key={idx} className="flex items-start gap-2 text-sm bg-secondary/30 p-3 rounded-lg">
                                                    <ArrowRight size={14} className="text-primary mt-0.5 shrink-0" />
                                                    <span>{suggestion}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>



                                {/* Enhanced Summary Section */}
                                {enhancement.enhancedSummary && enhancement.enhancedSummary !== profile?.summary && (
                                    <div className="p-6 border-t border-border">
                                        <div className="flex items-center justify-between mb-3">
                                            <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                                <Sparkles size={14} className="text-primary" />
                                                AI-Enhanced Summary
                                            </h4>
                                            <div className="flex items-center gap-2">
                                                {editingSummary ? (
                                                    <>
                                                        <AppleButton
                                                            variant="secondary"
                                                            size="sm"
                                                            onClick={() => {
                                                                setEditingSummary(false);
                                                                setEditedSummary("");
                                                            }}
                                                        >
                                                            Cancel
                                                        </AppleButton>
                                                        <AppleButton
                                                            variant="primary"
                                                            size="sm"
                                                            onClick={saveEditedSummary}
                                                        >
                                                            <Save size={12} />
                                                            Save
                                                        </AppleButton>
                                                    </>
                                                ) : (
                                                    <>
                                                        <AppleButton
                                                            variant="secondary"
                                                            size="sm"
                                                            onClick={() => {
                                                                setEditingSummary(true);
                                                                setEditedSummary(enhancement.enhancedSummary);
                                                            }}
                                                        >
                                                            <Edit2 size={12} />
                                                            Edit
                                                        </AppleButton>
                                                        <AppleButton
                                                            variant="primary"
                                                            size="sm"
                                                            onClick={applyEnhancedSummary}
                                                        >
                                                            <CheckCircle2 size={12} />
                                                            Apply
                                                        </AppleButton>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                        {editingSummary ? (
                                            <textarea
                                                value={editedSummary}
                                                onChange={(e) => setEditedSummary(e.target.value)}
                                                rows={4}
                                                className="w-full bg-background border border-border rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                                                placeholder="Edit the AI-generated summary..."
                                            />
                                        ) : (
                                            <p className="text-sm bg-primary/5 p-4 rounded-xl border border-primary/10">
                                                {enhancement.enhancedSummary}
                                            </p>
                                        )}
                                    </div>
                                )}


                                {/* Actions */}
                                <div className="p-6 border-t border-border bg-secondary/30">
                                    <div className="flex flex-wrap gap-3 mb-4">
                                        <AppleButton
                                            variant="primary"
                                            onClick={reAnalyzeResume}
                                            disabled={isEnhancing}
                                        >
                                            {isEnhancing ? (
                                                <RefreshCw size={14} className="animate-spin" />
                                            ) : (
                                                <RefreshCw size={14} />
                                            )}
                                            Re-analyze Resume
                                        </AppleButton>
                                        <AppleButton
                                            variant="secondary"
                                            onClick={applyAISuggestions}
                                            disabled={hasAppliedSuggestions || enhancement.missingSkills.length === 0}
                                        >
                                            <Sparkles size={14} />
                                            {hasAppliedSuggestions ? "All Applied ✓" : "Apply All Suggestions"}
                                        </AppleButton>
                                        <AppleButton variant="secondary" onClick={() => setShowPreview(true)}>
                                            <Eye size={14} />
                                            Preview Resume
                                        </AppleButton>
                                    </div>
                                    <div className="flex flex-wrap gap-3">
                                        <Link href="/communication">
                                            <AppleButton variant="secondary">
                                                Generate Cover Letter
                                            </AppleButton>
                                        </Link>
                                        <Link href="/profile">
                                            <AppleButton variant="secondary">
                                                <FileText size={14} />
                                                Edit Full Profile
                                            </AppleButton>
                                        </Link>
                                    </div>
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

                            {/* AI Toggle */}
                            <div className="flex items-center justify-center gap-3 mb-6">
                                <span className={`text-sm ${!useAI ? 'font-semibold' : 'text-muted-foreground'}`}>
                                    Local Analysis
                                </span>
                                <button
                                    onClick={() => setUseAI(!useAI)}
                                    className={`relative w-14 h-7 rounded-full transition-colors ${useAI ? 'bg-primary' : 'bg-secondary'
                                        }`}
                                >
                                    <span
                                        className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-transform ${useAI ? 'translate-x-8' : 'translate-x-1'
                                            }`}
                                    />
                                </button>
                                <span className={`text-sm flex items-center gap-1 ${useAI ? 'font-semibold' : 'text-muted-foreground'}`}>
                                    <Sparkles size={14} className={useAI ? 'text-primary' : ''} />
                                    AI Enhanced
                                </span>
                            </div>

                            <AppleButton
                                variant="primary"
                                onClick={enhanceResume}
                                disabled={isEnhancing}
                                className="px-8 py-4 text-base"
                            >
                                {isEnhancing ? (
                                    <>
                                        <RefreshCw size={18} className="animate-spin" />
                                        {useAI ? "AI Analyzing..." : "Analyzing..."}
                                    </>
                                ) : (
                                    <>
                                        <Sparkles size={18} />
                                        {useAI ? "Analyze with AI" : "Analyze Locally"}
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
                            <AppleButton
                                variant="secondary"
                                className="w-full justify-start"
                                onClick={exportPDF}
                                disabled={isExporting || !profile}
                            >
                                <Download size={14} />
                                {isExporting ? "Exporting..." : "Download as PDF"}
                            </AppleButton>
                            <AppleButton
                                variant="secondary"
                                className="w-full justify-start"
                                onClick={exportDOCX}
                                disabled={isExporting || !profile}
                            >
                                <Download size={14} />
                                Download as DOCX
                            </AppleButton>
                            <AppleButton
                                variant="secondary"
                                className="w-full justify-start"
                                onClick={exportLaTeX}
                                disabled={isExporting || !profile}
                            >
                                <Download size={14} />
                                Download as LaTeX
                            </AppleButton>
                            <AppleButton
                                variant="secondary"
                                className="w-full justify-start"
                                onClick={copyToClipboard}
                                disabled={!profile}
                            >
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

            {/* Preview Modal */}
            {
                showPreview && profile && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setShowPreview(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="bg-background rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-auto p-8"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold">Resume Preview</h2>
                                <button
                                    onClick={() => setShowPreview(false)}
                                    className="p-2 hover:bg-secondary rounded-lg"
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="space-y-6 text-sm">
                                {/* Header */}
                                <div className="text-center border-b pb-4">
                                    <h1 className="text-2xl font-bold">{profile.name}</h1>
                                    <p className="text-muted-foreground">
                                        {profile.email} {profile.phone && `| ${profile.phone}`}
                                    </p>
                                </div>

                                {/* Summary */}
                                {(enhancement?.enhancedSummary || profile.summary) && (
                                    <div>
                                        <h3 className="font-semibold uppercase text-xs tracking-wider text-muted-foreground mb-2">
                                            Professional Summary
                                        </h3>
                                        <p>{enhancement?.enhancedSummary || profile.summary}</p>
                                    </div>
                                )}

                                {/* Skills */}
                                {profile.skills?.length > 0 && (
                                    <div>
                                        <h3 className="font-semibold uppercase text-xs tracking-wider text-muted-foreground mb-2">
                                            Skills
                                        </h3>
                                        <div className="flex flex-wrap gap-2">
                                            {profile.skills.map((skill, idx) => (
                                                <span key={idx} className="px-2 py-1 bg-secondary rounded text-xs">
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Experience */}
                                {profile.experience?.length > 0 && (
                                    <div>
                                        <h3 className="font-semibold uppercase text-xs tracking-wider text-muted-foreground mb-2">
                                            Experience
                                        </h3>
                                        <div className="space-y-4">
                                            {profile.experience.map((exp, idx) => (
                                                <div key={idx}>
                                                    <p className="font-medium">{exp.role}</p>
                                                    <p className="text-muted-foreground text-xs">{exp.company}</p>
                                                    <p className="mt-1">{exp.description}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Education */}
                                {profile.education?.length > 0 && (
                                    <div>
                                        <h3 className="font-semibold uppercase text-xs tracking-wider text-muted-foreground mb-2">
                                            Education
                                        </h3>
                                        <div className="space-y-2">
                                            {profile.education.map((edu, idx) => (
                                                <div key={idx}>
                                                    <p className="font-medium">{edu.degree}</p>
                                                    <p className="text-muted-foreground text-xs">{edu.institution}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-3 mt-6 pt-4 border-t">
                                <AppleButton variant="primary" onClick={exportPDF} disabled={isExporting}>
                                    <Download size={14} />
                                    Export PDF
                                </AppleButton>
                                <AppleButton variant="secondary" onClick={exportDOCX} disabled={isExporting}>
                                    <Download size={14} />
                                    Export DOCX
                                </AppleButton>
                                <AppleButton variant="secondary" onClick={() => setShowPreview(false)}>
                                    Close
                                </AppleButton>
                            </div>
                        </motion.div>
                    </motion.div>
                )
            }
        </div >
    );
}

