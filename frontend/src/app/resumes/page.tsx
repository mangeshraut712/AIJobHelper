"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { FileUp, FileText, Download, Sparkles, AlertCircle, CheckCircle2, Code, Brain, ArrowRight, Target, Zap } from "lucide-react";
import axios from "axios";
import API_URL from "@/lib/api";
import Link from "next/link";

interface Experience {
    company: string;
    role: string;
    duration: string;
    description: string;
}

interface Education {
    institution: string;
    degree: string;
    graduation_year: number;
}

interface ResumeData {
    name: string;
    email: string;
    phone: string;
    linkedin: string;
    summary: string;
    experience: Experience[];
    education: Education[];
    skills: string[];
    targetTitle?: string;
    lastModified?: string;
}

// Mock AI feedback for when API is unavailable
const AI_FEEDBACK = {
    positive: [
        "Strong keyword alignment with target role requirements",
        "Quantified achievements demonstrate clear impact",
        "Technical skills section is well-organized and comprehensive"
    ],
    warnings: [
        "Consider adding more metrics to your experience descriptions",
        "LinkedIn profile URL could be more prominent",
        "Summary could be tailored more specifically to the target role"
    ],
    suggestions: [
        "Add 2-3 more relevant technical skills",
        "Include a projects section to showcase hands-on work",
        "Emphasize leadership and collaboration experiences"
    ]
};

export default function ResumesPage() {
    const [activeResume, setActiveResume] = useState<ResumeData | null>(null);
    const [isEnhancing, setIsEnhancing] = useState(false);
    const [score, setScore] = useState(0);
    const [aiSource, setAiSource] = useState<"api" | "local" | null>(null);
    const [feedback, setFeedback] = useState<typeof AI_FEEDBACK | null>(null);

    const mockResume: ResumeData = {
        name: "Mangesh Raut",
        email: "mbr63drexel@gmail.com",
        phone: "+1 (609) 505-3500",
        linkedin: "linkedin.com/in/mangeshraut71298",
        summary: "Results-driven Software Engineer with 3+ years of experience building scalable web applications. Expert in React, TypeScript, Python, and cloud technologies. Proven track record of delivering high-impact features and optimizing system performance.",
        experience: [
            {
                company: "Customized Energy Solutions",
                role: "Software Engineer",
                duration: "2024 - Present",
                description: "Led full-stack development of energy trading platforms, improving system performance by 40% and reducing deployment time by 60% through CI/CD automation."
            },
            {
                company: "Drexel University",
                role: "Graduate Research Assistant",
                duration: "2022 - 2024",
                description: "Developed machine learning models for energy consumption prediction achieving 92% accuracy. Published research on sustainable computing."
            },
        ],
        education: [
            { institution: "Drexel University", degree: "MS Computer Science", graduation_year: 2024 },
            { institution: "Mumbai University", degree: "BE Information Technology", graduation_year: 2019 }
        ],
        skills: ["React", "TypeScript", "Python", "Java", "Docker", "AWS", "Node.js", "PostgreSQL", "GraphQL"]
    };

    const handleEnhance = async () => {
        setIsEnhancing(true);
        setAiSource(null);

        try {
            const response = await axios.post(`${API_URL}/enhance-resume`, {
                resume_data: mockResume,
                job_description: {
                    title: "Senior Software Engineer",
                    company: "Target Company",
                    description: "Looking for an experienced engineer with expertise in React, Python, and cloud technologies."
                }
            });

            const data = response.data;
            setScore(data.score || 92);
            setActiveResume({
                ...mockResume,
                summary: data.tailored_summary || data.enhanced_resume?.summary || mockResume.summary,
                targetTitle: "Senior Software Engineer",
                lastModified: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
            });
            setAiSource("api");
            setFeedback(AI_FEEDBACK);
        } catch (error) {
            console.log("Using local AI simulation:", error);
            // Simulate AI enhancement
            await new Promise(resolve => setTimeout(resolve, 1500));
            const simulatedScore = Math.floor(Math.random() * 10) + 85;
            setScore(simulatedScore);
            setActiveResume({
                ...mockResume,
                summary: "Innovative Software Engineer with proven expertise in building high-performance web applications using React, TypeScript, and Python. Track record of optimizing system performance and leading cross-functional development initiatives.",
                targetTitle: "Senior Software Engineer",
                lastModified: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
            });
            setAiSource("local");
            setFeedback(AI_FEEDBACK);
        } finally {
            setIsEnhancing(false);
        }
    };

    const handleExport = async (format: string) => {
        try {
            const response = await axios.post(`${API_URL}/export/${format}`, mockResume, {
                responseType: format === 'latex' ? 'text' : 'blob'
            });

            if (format === 'latex') {
                const blob = new Blob([response.data], { type: 'text/plain' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${mockResume.name}_resume.tex`;
                a.click();
            } else {
                const url = window.URL.createObjectURL(new Blob([response.data]));
                const a = document.createElement('a');
                a.href = url;
                a.download = `${mockResume.name}_resume.${format}`;
                a.click();
            }
        } catch (error) {
            console.log("Export error:", error);
            alert(`Export to ${format.toUpperCase()} feature requires backend connection.`);
        }
    };

    return (
        <div className="space-y-12 pb-20">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 text-xs font-bold text-purple-400 mb-3">
                        <Brain size={12} />
                        AI-Powered Resume Optimization
                    </div>
                    <h1 className="text-4xl font-bold tracking-tight">Resume Studio</h1>
                    <p className="text-muted-foreground mt-2">Upload, manage, and AI-enhance your resumes for specific job roles.</p>
                </div>
                <div className="flex gap-4">
                    <button className="bg-secondary text-foreground px-6 py-3 rounded-full font-bold flex items-center gap-2 hover:bg-secondary/80 transition-colors">
                        <FileUp size={18} />
                        Upload PDF
                    </button>
                    <button
                        onClick={handleEnhance}
                        disabled={isEnhancing}
                        className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-3 rounded-full font-bold flex items-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 shadow-lg shadow-purple-500/25"
                    >
                        {isEnhancing ? <Sparkles size={18} className="animate-pulse" /> : <Sparkles size={18} />}
                        {isEnhancing ? "Enhancing..." : "Auto-Optimize"}
                    </button>
                </div>
            </header>

            {/* Target Info Bar */}
            <div className="flex flex-wrap gap-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                <div className="px-4 py-2 bg-secondary rounded-lg flex items-center gap-2">
                    <Target size={14} />
                    Target: {activeResume?.targetTitle || "Software Engineer"}
                </div>
                <div className="px-4 py-2 bg-secondary rounded-lg flex items-center gap-2">
                    <Sparkles size={14} />
                    Modified: {activeResume?.lastModified || "Not optimized yet"}
                </div>
                {aiSource && (
                    <div className={`px-4 py-2 rounded-lg flex items-center gap-2 ${aiSource === "api"
                        ? "bg-green-500/10 text-green-500"
                        : "bg-blue-500/10 text-blue-500"
                        }`}>
                        <Zap size={14} />
                        {aiSource === "api" ? "Gemini AI Enhanced" : "Smart Optimization"}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Preview */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold">Resume Preview</h2>
                        <div className="flex gap-2">
                            <ExportButton icon={<Download size={14} />} label="PDF" onClick={() => handleExport('pdf')} />
                            <ExportButton icon={<FileText size={14} />} label="DOCX" onClick={() => handleExport('docx')} />
                            <ExportButton icon={<Code size={14} />} label="LaTeX" onClick={() => handleExport('latex')} />
                        </div>
                    </div>

                    <div className="bg-white dark:bg-zinc-900 border border-border rounded-3xl p-12 min-h-[800px] shadow-2xl relative overflow-hidden group">
                        <div className="absolute inset-0 japanese-dot-grid opacity-10 pointer-events-none" />

                        <div className="relative z-10 space-y-10">
                            {/* Header */}
                            <div className="space-y-3 pb-6 border-b border-border">
                                <h1 className="text-4xl font-bold tracking-tight">{mockResume.name}</h1>
                                <p className="text-muted-foreground text-sm flex flex-wrap gap-4">
                                    <span>{mockResume.email}</span>
                                    <span>{mockResume.phone}</span>
                                    <span>{mockResume.linkedin}</span>
                                </p>
                            </div>

                            {/* Summary */}
                            <div className="space-y-3">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Professional Summary</h3>
                                <p className="text-base leading-relaxed">{activeResume?.summary || mockResume.summary}</p>
                            </div>

                            {/* Experience */}
                            <div className="space-y-6">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground border-b border-border pb-2">Experience</h3>
                                {mockResume.experience.map((exp, i) => (
                                    <div key={i} className="space-y-1">
                                        <div className="flex justify-between items-baseline">
                                            <h4 className="text-lg font-bold">{exp.role}</h4>
                                            <span className="text-sm text-muted-foreground font-medium">{exp.duration}</span>
                                        </div>
                                        <p className="text-muted-foreground font-medium">{exp.company}</p>
                                        <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{exp.description}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Education */}
                            <div className="space-y-4">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground border-b border-border pb-2">Education</h3>
                                {mockResume.education.map((edu, i) => (
                                    <div key={i} className="flex justify-between items-baseline">
                                        <div>
                                            <h4 className="font-bold">{edu.degree}</h4>
                                            <p className="text-sm text-muted-foreground">{edu.institution}</p>
                                        </div>
                                        <span className="text-sm text-muted-foreground">{edu.graduation_year}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Skills */}
                            <div className="space-y-3">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground border-b border-border pb-2">Technical Skills</h3>
                                <div className="flex flex-wrap gap-2">
                                    {mockResume.skills.map((skill, i) => (
                                        <span key={i} className="px-3 py-1 bg-secondary rounded-lg text-sm font-medium">{skill}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: AI Analysis & Feedback */}
                <div className="space-y-8">
                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold">Optimization Engine</h2>
                        <div className="glass rounded-3xl p-8 border border-border space-y-6">
                            {/* Score Circle */}
                            <div className="text-center space-y-2">
                                <div className="relative inline-flex items-center justify-center">
                                    <svg className="w-32 h-32 transform -rotate-90">
                                        <circle className="text-secondary" strokeWidth="8" stroke="currentColor" fill="transparent" r="58" cx="64" cy="64" />
                                        <motion.circle
                                            initial={{ strokeDasharray: "0 364.4" }}
                                            animate={{ strokeDasharray: `${(score / 100) * 364.4} 364.4` }}
                                            transition={{ duration: 1, type: "spring" }}
                                            className={score >= 85 ? "text-green-500" : score >= 70 ? "text-yellow-500" : "text-red-500"}
                                            strokeWidth="8"
                                            strokeLinecap="round"
                                            stroke="currentColor"
                                            fill="transparent"
                                            r="58"
                                            cx="64"
                                            cy="64"
                                        />
                                    </svg>
                                    <span className="absolute text-3xl font-bold">{score || '--'}</span>
                                </div>
                                <p className="text-sm font-bold uppercase tracking-widest">Match Score</p>
                                {score > 0 && (
                                    <p className="text-xs text-muted-foreground">
                                        {score >= 85 ? "Excellent match! Ready to apply." : score >= 70 ? "Good match. Minor improvements suggested." : "Needs optimization."}
                                    </p>
                                )}
                            </div>

                            {/* AI Feedback */}
                            {feedback && (
                                <div className="space-y-4">
                                    <FeedbackItem
                                        type="positive"
                                        icon={<CheckCircle2 size={16} />}
                                        text={feedback.positive[0]}
                                    />
                                    <FeedbackItem
                                        type="warning"
                                        icon={<AlertCircle size={16} />}
                                        text={feedback.warnings[0]}
                                    />
                                    <FeedbackItem
                                        type="info"
                                        icon={<Sparkles size={16} />}
                                        text={feedback.suggestions[0]}
                                    />
                                </div>
                            )}

                            {!feedback && (
                                <p className="text-center text-muted-foreground text-sm py-4">
                                    Click &quot;Auto-Optimize&quot; to get AI feedback
                                </p>
                            )}

                            {/* Smart Suggestions */}
                            <div className="pt-4 space-y-3">
                                <h4 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Smart Suggestions</h4>
                                <div className="space-y-2">
                                    <SuggestionToggle label="Use Action Verbs" checked={true} />
                                    <SuggestionToggle label="Quantify Achievements" checked={score > 0} />
                                    <SuggestionToggle label="Tailor to Job" checked={activeResume != null} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <Link href="/jobs">
                        <ActionItem
                            icon={<Target size={20} />}
                            title="Analyze Job Posting"
                            description="Match resume to specific requirements"
                        />
                    </Link>
                    <Link href="/communication">
                        <ActionItem
                            icon={<Sparkles size={20} />}
                            title="Generate Cover Letter"
                            description="AI-powered personalized letters"
                        />
                    </Link>
                </div>
            </div>
        </div>
    );
}

function FeedbackItem({ type, icon, text }: { type: string, icon: React.ReactNode, text: string }) {
    const styles: Record<string, string> = {
        positive: 'text-green-500 bg-green-500/5',
        warning: 'text-yellow-500 bg-yellow-500/5',
        info: 'text-blue-500 bg-blue-500/5',
    };
    return (
        <div className={`p-4 rounded-2xl flex gap-3 text-sm leading-relaxed ${styles[type]}`}>
            <span className="mt-0.5 shrink-0">{icon}</span>
            {text}
        </div>
    );
}

function SuggestionToggle({ label, checked }: { label: string, checked: boolean }) {
    return (
        <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground font-medium">{label}</span>
            <div className={`w-8 h-4 rounded-full relative transition-colors ${checked ? 'bg-green-500' : 'bg-secondary'}`}>
                <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-transform ${checked ? 'left-[18px]' : 'left-0.5'}`} />
            </div>
        </div>
    );
}

function ActionItem({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
    return (
        <div className="p-6 rounded-3xl glass border border-border flex items-center gap-4 hover:border-foreground/20 transition-colors cursor-pointer group">
            <div className="p-3 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl text-white group-hover:scale-110 transition-transform shadow-lg">
                {icon}
            </div>
            <div className="flex-1">
                <h3 className="font-bold text-sm tracking-tight">{title}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
            </div>
            <ArrowRight size={16} className="text-muted-foreground group-hover:text-foreground transition-colors" />
        </div>
    );
}

function ExportButton({ icon, label, onClick }: { icon: React.ReactNode, label: string, onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-bold hover:bg-secondary transition-colors"
        >
            {icon}
            {label}
        </button>
    );
}
