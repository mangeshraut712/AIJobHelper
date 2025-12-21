"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { FileUp, FileText, Download, Sparkles, AlertCircle, CheckCircle2, Sliders, Layout, Code } from "lucide-react";
import axios from "axios";
import API_URL from "@/lib/api";

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

export default function ResumesPage() {
    const [activeResume, setActiveResume] = useState<ResumeData | null>(null);
    const [isEnhancing, setIsEnhancing] = useState(false);
    const [score, setScore] = useState(0);

    const mockResume: ResumeData = {
        name: "Mangesh Raut",
        email: "mbr63drexel@gmail.com",
        phone: "+16095053500",
        linkedin: "mangeshraut71298",
        summary: "Senior Software Engineer with experience in Java, Python, and Cloud...",
        experience: [
            { company: "Customized Energy Solutions", role: "Software Engineer", duration: "2024 - 2025", description: "Led full-stack projects." },
        ],
        education: [
            { institution: "Drexel University", degree: "MS CS", graduation_year: 2023 }
        ],
        skills: ["React", "TypeScript", "Python", "Java", "Docker"]
    };

    const handleEnhance = async () => {
        setIsEnhancing(true);
        try {
            const response = await axios.post(`${API_URL}/enhance-resume`, {
                resume_data: mockResume,
                job_description: {
                    title: "Senior Software Engineer",
                    company: "Target Company",
                    description: "Looking for an expert in React and Python."
                }
            });

            const data = response.data;
            setScore(data.score || 92);
            setActiveResume({
                ...mockResume,
                summary: data.tailored_summary || data.enhanced_resume?.summary || mockResume.summary,
                targetTitle: "Senior Software Engineer (AI Enhanced)",
                lastModified: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
            });
        } catch (error) {
            console.error("Enhancement error:", error);
            alert("Failed to connect to AI server. Using simulation.");
            setScore(88);
            setActiveResume({
                ...mockResume,
                targetTitle: "Senior Software Engineer (Simulated)",
                lastModified: "Dec 21, 2025"
            });
        } finally {
            setIsEnhancing(false);
        }
    };

    return (
        <div className="space-y-12 pb-20">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight">Resume Studio</h1>
                    <p className="text-muted-foreground mt-2">Upload, manage, and AI-enhance your resumes for specific job roles.</p>
                </div>
                <div className="flex gap-4">
                    <button
                        className="bg-secondary text-foreground px-6 py-3 rounded-full font-bold flex items-center gap-2 hover:bg-secondary/80 transition-colors"
                    >
                        <FileUp size={18} />
                        Upload PDF
                    </button>
                    <button
                        onClick={handleEnhance}
                        disabled={isEnhancing}
                        className="bg-foreground text-background px-8 py-3 rounded-full font-bold flex items-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                        {isEnhancing ? <Sparkles size={18} className="animate-pulse" /> : <Sparkles size={18} />}
                        {isEnhancing ? "Enhancing..." : "Auto-Optimize"}
                    </button>
                </div>
            </header>

            <div className="flex flex-wrap gap-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                <div className="px-4 py-2 bg-secondary rounded-lg flex items-center gap-2">
                    <Layout size={14} />
                    Target: {activeResume?.targetTitle || "Senior Frontend Engineer"}
                </div>
                <div className="px-4 py-2 bg-secondary rounded-lg flex items-center gap-2">
                    <Sparkles size={14} />
                    Modified: {activeResume?.lastModified || "Dec 21, 2025"}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Preview */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold">Resume Preview</h2>
                        <div className="flex gap-2">
                            <ExportButton icon={<Download size={14} />} label="PDF" />
                            <ExportButton icon={<FileText size={14} />} label="DOCX" />
                            <ExportButton icon={<Code size={14} />} label="LaTeX" />
                        </div>
                    </div>

                    <div className="bg-white dark:bg-zinc-900 border border-border rounded-3xl p-12 min-h-[800px] shadow-2xl relative overflow-hidden group">
                        <div className="absolute inset-0 japanese-dot-grid opacity-10 pointer-events-none" />

                        <div className="relative z-10 space-y-12">
                            <div className="space-y-4">
                                <h1 className="text-4xl font-bold tracking-tight">{mockResume.name}</h1>
                                <p className="text-muted-foreground text-sm flex gap-4">
                                    <span>alex.johnson@example.com</span>
                                    <span>San Francisco, CA</span>
                                    <span>linkedin.com/in/alexj</span>
                                </p>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground border-b border-border pb-2">Professional Summary</h3>
                                <p className="text-lg leading-relaxed">{activeResume?.summary || mockResume.summary}</p>
                            </div>

                            <div className="space-y-8">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground border-b border-border pb-2">Experience</h3>
                                {mockResume.experience.map((exp, i) => (
                                    <div key={i} className="space-y-1">
                                        <div className="flex justify-between items-baseline">
                                            <h4 className="text-xl font-bold">{exp.role}</h4>
                                            <span className="text-sm text-muted-foreground font-medium">{exp.duration}</span>
                                        </div>
                                        <p className="text-muted-foreground font-medium">{exp.company}</p>
                                        <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                                            Led the migration of legacy systems to a modern React architecture, resulting in a 40% improvement in load times and enhanced developer productivity...
                                        </p>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-4">
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
                            <div className="text-center space-y-2">
                                <div className="relative inline-flex items-center justify-center">
                                    <svg className="w-32 h-32 transform -rotate-90">
                                        <circle className="text-secondary" strokeWidth="8" stroke="currentColor" fill="transparent" r="58" cx="64" cy="64" />
                                        <motion.circle
                                            initial={{ strokeDasharray: "0 364.4" }}
                                            animate={{ strokeDasharray: `${(score / 100) * 364.4} 364.4` }}
                                            transition={{ duration: 1, type: "spring" }}
                                            className="text-foreground"
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
                            </div>

                            <div className="space-y-4">
                                <FeedbackItem
                                    type="positive"
                                    icon={<CheckCircle2 size={16} />}
                                    text="Strong keyword alignment found for React and TypeScript."
                                />
                                <FeedbackItem
                                    type="warning"
                                    icon={<AlertCircle size={16} />}
                                    text="Consider quantifying your achievements at TechCorp with metrics."
                                />
                                <FeedbackItem
                                    type="info"
                                    icon={<Sparkles size={16} />}
                                    text="AI suggested emphasizing your Next.js experience more."
                                />
                            </div>

                            <div className="pt-4 space-y-3">
                                <h4 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Smart Suggestions</h4>
                                <div className="space-y-2">
                                    <SuggestionToggle label="Use Action Verbs" checked={true} />
                                    <SuggestionToggle label="Remove Generic Objective" checked={true} />
                                    <SuggestionToggle label="Tailor Summary to Role" checked={activeResume != null} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <ActionItem
                        icon={<Layout size={20} />}
                        title="Switch Template"
                        description="Classic, Modern, or Minimalist"
                    />
                    <ActionItem
                        icon={<Sliders size={20} />}
                        title="Real-time Editor"
                        description="Edit your resume with AI assistance"
                    />
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
            <div className={`w-8 h-4 rounded-full relative transition-colors ${checked ? 'bg-foreground' : 'bg-secondary'}`}>
                <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-transform ${checked ? 'left-[18px]' : 'left-0.5'}`} />
            </div>
        </div>
    );
}

function ActionItem({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
    return (
        <div className="p-6 rounded-3xl glass border border-border flex items-center gap-4 hover:border-foreground/20 transition-colors cursor-pointer group">
            <div className="p-3 bg-foreground/5 rounded-2xl group-hover:scale-110 transition-transform">
                {icon}
            </div>
            <div>
                <h3 className="font-bold text-sm tracking-tight">{title}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
            </div>
        </div>
    );
}

function ExportButton({ icon, label }: { icon: React.ReactNode, label: string }) {
    return (
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-bold hover:bg-secondary transition-colors">
            {icon}
            {label}
        </button>
    );
}
