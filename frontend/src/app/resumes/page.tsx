"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { FileText, Sparkles, Download, Eye, CheckCircle2, AlertCircle, RefreshCw, Plus, Trash2, Edit3 } from "lucide-react";

interface Resume {
    id: string;
    name: string;
    lastUpdated: string;
    score: number;
    status: "optimized" | "needs-work" | "draft";
}

const mockResumes: Resume[] = [
    { id: "1", name: "Software Engineer Resume", lastUpdated: "2 days ago", score: 92, status: "optimized" },
    { id: "2", name: "Product Manager Resume", lastUpdated: "1 week ago", score: 78, status: "needs-work" },
    { id: "3", name: "Full Stack Developer", lastUpdated: "3 days ago", score: 85, status: "optimized" },
];

const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, ease: "easeOut" as const },
};

export default function ResumesPage() {
    const [resumes] = useState<Resume[]>(mockResumes);
    const [isOptimizing, setIsOptimizing] = useState(false);
    const [selectedResume, setSelectedResume] = useState<string | null>("1");

    const handleOptimize = async () => {
        setIsOptimizing(true);
        await new Promise(resolve => setTimeout(resolve, 2000));
        setIsOptimizing(false);
    };

    return (
        <div className="max-w-6xl mx-auto px-6 py-8">
            {/* Header */}
            <motion.div {...fadeIn} className="mb-8">
                <h1 className="text-4xl font-bold tracking-tight mb-2">Resume Studio</h1>
                <p className="text-lg text-muted-foreground">Create and optimize AI-powered resumes</p>
            </motion.div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Resume List */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="lg:col-span-1 space-y-4"
                >
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold">My Resumes</h2>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-primary-foreground"
                        >
                            <Plus size={18} />
                        </motion.button>
                    </div>

                    {resumes.map((resume) => (
                        <motion.div
                            key={resume.id}
                            whileHover={{ x: 4 }}
                            onClick={() => setSelectedResume(resume.id)}
                            className={`apple-card p-4 cursor-pointer transition-all ${selectedResume === resume.id ? 'ring-2 ring-primary' : ''
                                }`}
                        >
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                    <FileText className="w-5 h-5 text-primary" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-medium text-sm truncate">{resume.name}</h3>
                                    <p className="text-xs text-muted-foreground">{resume.lastUpdated}</p>
                                </div>
                                <div className="text-right">
                                    <span className={`text-lg font-bold ${resume.score >= 90 ? 'text-green-500' :
                                        resume.score >= 80 ? 'text-primary' : 'text-orange-500'
                                        }`}>
                                        {resume.score}%
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Resume Editor */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="lg:col-span-2"
                >
                    <div className="apple-card overflow-hidden">
                        {/* Toolbar */}
                        <div className="p-4 border-b border-border flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                    <FileText className="w-4 h-4 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-medium text-sm">Software Engineer Resume</h3>
                                    <p className="text-xs text-muted-foreground">Last edited 2 days ago</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="apple-button-secondary text-sm px-4 py-2"
                                >
                                    <Eye size={14} />
                                    Preview
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleOptimize}
                                    disabled={isOptimizing}
                                    className="apple-button-primary text-sm px-4 py-2"
                                >
                                    {isOptimizing ? (
                                        <RefreshCw size={14} className="animate-spin" />
                                    ) : (
                                        <Sparkles size={14} />
                                    )}
                                    {isOptimizing ? "Optimizing..." : "AI Optimize"}
                                </motion.button>
                            </div>
                        </div>

                        {/* Score & Feedback */}
                        <div className="p-6 border-b border-border bg-secondary/30">
                            <div className="flex items-center gap-6">
                                {/* Score Circle */}
                                <div className="relative w-24 h-24">
                                    <svg className="w-24 h-24 transform -rotate-90">
                                        <circle
                                            cx="48"
                                            cy="48"
                                            r="40"
                                            stroke="currentColor"
                                            strokeWidth="8"
                                            fill="none"
                                            className="text-secondary"
                                        />
                                        <motion.circle
                                            cx="48"
                                            cy="48"
                                            r="40"
                                            stroke="currentColor"
                                            strokeWidth="8"
                                            fill="none"
                                            className="text-green-500"
                                            strokeLinecap="round"
                                            initial={{ strokeDasharray: "0 251" }}
                                            animate={{ strokeDasharray: "231 251" }}
                                            transition={{ duration: 1, delay: 0.5 }}
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="text-2xl font-bold">92%</span>
                                    </div>
                                </div>

                                {/* Feedback */}
                                <div className="flex-1 space-y-3">
                                    <div className="flex items-center gap-2 text-sm">
                                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                                        <span>Strong technical skills section</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                                        <span>Quantified achievements included</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <AlertCircle className="w-4 h-4 text-orange-500" />
                                        <span>Add more keywords for ATS optimization</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Resume Content Preview */}
                        <div className="p-6 space-y-6 min-h-[400px]">
                            {/* Header */}
                            <div className="pb-4 border-b border-border">
                                <h2 className="text-xl font-bold mb-1">John Doe</h2>
                                <p className="text-sm text-muted-foreground">Senior Software Engineer • San Francisco, CA</p>
                                <p className="text-sm text-muted-foreground">john.doe@email.com • (555) 123-4567 • linkedin.com/in/johndoe</p>
                            </div>

                            {/* Summary */}
                            <div>
                                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-2">Summary</h3>
                                <p className="text-sm leading-relaxed">
                                    Results-driven software engineer with 5+ years of experience building scalable web applications.
                                    Expert in React, TypeScript, and Node.js with a track record of delivering high-impact projects.
                                </p>
                            </div>

                            {/* Experience */}
                            <div>
                                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">Experience</h3>
                                <div className="space-y-4">
                                    <div className="flex gap-4">
                                        <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center font-bold text-sm shrink-0">G</div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start mb-1">
                                                <div>
                                                    <h4 className="font-medium text-sm">Senior Software Engineer</h4>
                                                    <p className="text-xs text-muted-foreground">Google • Mountain View, CA</p>
                                                </div>
                                                <span className="text-xs text-muted-foreground">2021 - Present</span>
                                            </div>
                                            <ul className="text-sm text-muted-foreground space-y-1 mt-2">
                                                <li>• Led development of core platform features serving 10M+ users</li>
                                                <li>• Reduced page load time by 40% through performance optimization</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Skills */}
                            <div>
                                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">Skills</h3>
                                <div className="flex flex-wrap gap-2">
                                    {["React", "TypeScript", "Node.js", "Python", "AWS", "PostgreSQL", "GraphQL", "Docker"].map((skill) => (
                                        <span key={skill} className="apple-pill text-xs">{skill}</span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Export Actions */}
                        <div className="p-4 border-t border-border bg-secondary/30 flex justify-between items-center">
                            <div className="flex gap-2">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-2"
                                >
                                    <Edit3 size={14} />
                                    Edit
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="flex items-center gap-2 text-sm text-red-500 hover:text-red-600 transition-colors px-3 py-2"
                                >
                                    <Trash2 size={14} />
                                    Delete
                                </motion.button>
                            </div>
                            <div className="flex gap-2">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="apple-button-secondary text-sm px-4 py-2"
                                >
                                    <Download size={14} />
                                    PDF
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="apple-button-secondary text-sm px-4 py-2"
                                >
                                    <Download size={14} />
                                    DOCX
                                </motion.button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
