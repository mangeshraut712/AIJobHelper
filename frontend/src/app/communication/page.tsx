"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    Mail, Linkedin, MessageSquare, Sparkles, Copy,
    CheckCircle2, RefreshCw, Send, FileText, Link2,
    Building2
} from "lucide-react";
import { AppleCard } from "@/components/ui/AppleCard";
import { AppleButton } from "@/components/ui/AppleButton";
import { useToast } from "@/components/ui/Toast";
import axios from "axios";
import API_URL from "@/lib/api";
import Link from "next/link";
import { secureGet } from "@/lib/secureStorage";
import { STORAGE_KEYS } from "@/lib/storageKeys";

type MessageType = "cover_letter" | "email" | "linkedin" | "follow_up";

interface JobData {
    title: string;
    company: string;
    description: string;
    requirements: string[];
    skills: string[];
}

interface ProfileData {
    name: string;
    email: string;
    summary: string;
    skills: string[];
    experience: Array<{ role: string; company: string; description: string }>;
}

const templates: Record<MessageType, { icon: typeof Mail; label: string; color: string; description: string }> = {
    cover_letter: { icon: FileText, label: "Cover Letter", color: "bg-purple-500", description: "Formal application letter" },
    email: { icon: Mail, label: "Application Email", color: "bg-blue-500", description: "Email to recruiter/HR" },
    linkedin: { icon: Linkedin, label: "LinkedIn Message", color: "bg-[#0a66c2]", description: "Connection request message" },
    follow_up: { icon: MessageSquare, label: "Follow Up", color: "bg-green-500", description: "After interview/application" },
};

const FADE_IN = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, ease: "easeOut" as const },
};

export default function CommunicationPage() {
    const { toast } = useToast();
    const [messageType, setMessageType] = useState<MessageType>("cover_letter");
    const [isGenerating, setIsGenerating] = useState(false);
    const [copied, setCopied] = useState(false);
    const [generatedContent, setGeneratedContent] = useState("");
    const [currentJob, setCurrentJob] = useState<JobData | null>(null);
    const [profile, setProfile] = useState<ProfileData | null>(null);

    useEffect(() => {
        // Load current job using secureGet (adds 'cap_' prefix automatically)
        const savedJob = secureGet<JobData>(STORAGE_KEYS.CURRENT_JOB_FOR_RESUME);
        if (savedJob) {
            setCurrentJob(savedJob);
        }

        // Load profile using secureGet (adds 'cap_' prefix automatically)
        const savedProfile = secureGet<ProfileData>(STORAGE_KEYS.PROFILE);
        if (savedProfile) {
            setProfile(savedProfile);
        }
    }, []);

    const generateMessage = async () => {
        if (!currentJob) {
            toast("Please analyze a job first", "error");
            return;
        }

        setIsGenerating(true);

        const name = profile?.name || "Your Name";
        const jobTitle = currentJob.title || "the position";
        const company = currentJob.company || "your company";
        const skills = profile?.skills?.slice(0, 5).join(", ") || "relevant skills";
        const experience = profile?.experience?.[0];
        const experienceText = experience
            ? `my experience as ${experience.role} at ${experience.company}`
            : "my professional background";

        try {
            // Try to use the AI API
            const response = await axios.post(`${API_URL}/generate-cover-letter`, {
                resume_data: {
                    name: profile?.name || "",
                    email: profile?.email || "",
                    summary: profile?.summary || "",
                    skills: profile?.skills || [],
                    experience: profile?.experience || [],
                },
                job_description: {
                    title: currentJob.title,
                    company: currentJob.company,
                    description: currentJob.description || "",
                    requirements: currentJob.requirements?.join(", ") || "",
                    skills: currentJob.skills?.join(", ") || "",
                },
                template_type: messageType,
            });

            setGeneratedContent(response.data.content || generateLocalMessage());
        } catch {
            // Use local generation
            setGeneratedContent(generateLocalMessage());
        } finally {
            setIsGenerating(false);
        }

        function generateLocalMessage() {
            const messages: Record<MessageType, string> = {
                cover_letter: `Dear Hiring Manager,

I am writing to express my strong interest in the ${jobTitle} position at ${company}. With ${experienceText} and expertise in ${skills}, I am confident in my ability to contribute meaningfully to your team.

${profile?.summary || "Throughout my career, I have developed a strong foundation in delivering high-quality work and collaborating effectively with cross-functional teams."}

The ${jobTitle} role particularly appeals to me because it aligns perfectly with my career goals and allows me to leverage my skills in ${skills}. I am excited about the opportunity to bring my experience to ${company} and contribute to your continued success.

Key qualifications I bring to this role:
${currentJob?.requirements?.slice(0, 3).map(req => `• ${req}`).join("\n") || "• Strong technical skills\n• Team collaboration\n• Problem-solving abilities"}

I would welcome the opportunity to discuss how my background and skills would benefit your team. Thank you for considering my application.

Best regards,
${name}`,

                email: `Subject: Application for ${jobTitle} Position at ${company}

Dear Hiring Manager,

I am excited to apply for the ${jobTitle} position at ${company}. With a strong background in ${skills}, I believe I would be a valuable addition to your team.

${profile?.summary?.slice(0, 200) || "I bring relevant experience and a passion for delivering excellent results."}

I have attached my resume for your review and would welcome the opportunity to discuss this role further.

Thank you for your time and consideration.

Best regards,
${name}
${profile?.email || "your.email@example.com"}`,

                linkedin: `Hi there! 👋

I recently came across the ${jobTitle} opportunity at ${company} and I'm very interested in learning more.

With my background in ${skills}, I believe I could be a great fit for your team. ${experience ? `My experience as ${experience.role} at ${experience.company} has prepared me well for this type of role.` : ""}

Would you be open to a quick chat about the position? I'd love to hear more about the team and what you're looking for.

Looking forward to connecting!

Best,
${name}`,

                follow_up: `Subject: Following Up - ${jobTitle} Application at ${company}

Dear Hiring Manager,

I hope this message finds you well. I wanted to follow up on my application for the ${jobTitle} position at ${company}, which I submitted recently.

I remain very enthusiastic about this opportunity and am confident that my skills in ${skills} would allow me to contribute effectively to your team.

If there is any additional information I can provide, please don't hesitate to reach out. I would be happy to schedule a call at your convenience to discuss my qualifications further.

Thank you for your time and consideration.

Best regards,
${name}
${profile?.email || "your.email@example.com"}`
            };

            return messages[messageType];
        }
    };

    const copyToClipboard = async () => {
        await navigator.clipboard.writeText(generatedContent);
        setCopied(true);
        toast("Copied to clipboard!", "success");
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="max-w-5xl mx-auto px-6 py-8">
            {/* Header */}
            <motion.div {...FADE_IN} className="mb-8">
                <h1 className="text-4xl font-bold tracking-tight mb-2">Message Generator</h1>
                <p className="text-lg text-muted-foreground">
                    Create personalized cover letters, emails, and messages for your applications
                </p>
            </motion.div>

            <div className="grid lg:grid-cols-5 gap-8">
                {/* Settings */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="lg:col-span-2 space-y-6"
                >
                    {/* Target Job */}
                    <AppleCard className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="font-semibold">Target Job</h2>
                            <Link href="/jobs">
                                <span className="text-xs text-primary hover:underline">Change</span>
                            </Link>
                        </div>

                        {currentJob ? (
                            <div className="flex items-start gap-3 p-3 bg-secondary/30 rounded-xl">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center font-bold text-primary shrink-0">
                                    {currentJob.company?.charAt(0) || "J"}
                                </div>
                                <div>
                                    <p className="font-medium text-sm">{currentJob.title}</p>
                                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                                        <Building2 size={10} />
                                        {currentJob.company}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-4">
                                <p className="text-sm text-muted-foreground mb-3">No job selected</p>
                                <Link href="/jobs">
                                    <AppleButton variant="secondary" size="sm">
                                        <Link2 size={12} />
                                        Analyze a Job
                                    </AppleButton>
                                </Link>
                            </div>
                        )}
                    </AppleCard>

                    {/* Message Type */}
                    <AppleCard className="p-6">
                        <h2 className="font-semibold mb-4">Message Type</h2>
                        <div className="space-y-2">
                            {(Object.keys(templates) as MessageType[]).map((type) => {
                                const template = templates[type];
                                return (
                                    <motion.button
                                        key={type}
                                        whileHover={{ x: 4 }}
                                        onClick={() => {
                                            setMessageType(type);
                                            setGeneratedContent("");
                                        }}
                                        className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${messageType === type
                                            ? "bg-primary/10 border border-primary/30"
                                            : "hover:bg-secondary/50 border border-transparent"
                                            }`}
                                    >
                                        <div className={`w-10 h-10 rounded-lg ${template.color} flex items-center justify-center shrink-0`}>
                                            <template.icon size={18} className="text-white" />
                                        </div>
                                        <div className="text-left">
                                            <p className="font-medium text-sm">{template.label}</p>
                                            <p className="text-xs text-muted-foreground">{template.description}</p>
                                        </div>
                                    </motion.button>
                                );
                            })}
                        </div>
                    </AppleCard>

                    {/* Generate Button */}
                    <AppleButton
                        variant="primary"
                        onClick={generateMessage}
                        disabled={isGenerating || !currentJob}
                        className="w-full py-4 text-base"
                    >
                        {isGenerating ? (
                            <>
                                <RefreshCw size={18} className="animate-spin" />
                                Generating...
                            </>
                        ) : (
                            <>
                                <Sparkles size={18} />
                                Generate {templates[messageType].label}
                            </>
                        )}
                    </AppleButton>
                </motion.div>

                {/* Output */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="lg:col-span-3"
                >
                    <AppleCard className="overflow-hidden h-full flex flex-col">
                        {/* Header */}
                        <div className="p-4 border-b border-border flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                {(() => {
                                    const Icon = templates[messageType].icon;
                                    return (
                                        <div className={`w-8 h-8 rounded-lg ${templates[messageType].color} flex items-center justify-center`}>
                                            <Icon size={14} className="text-white" />
                                        </div>
                                    );
                                })()}
                                <span className="font-medium text-sm">{templates[messageType].label}</span>
                            </div>
                            {generatedContent && (
                                <div className="flex gap-2">
                                    <AppleButton
                                        variant="secondary"
                                        size="sm"
                                        onClick={copyToClipboard}
                                    >
                                        {copied ? <CheckCircle2 size={14} /> : <Copy size={14} />}
                                        {copied ? "Copied!" : "Copy"}
                                    </AppleButton>
                                </div>
                            )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 p-6">
                            {generatedContent ? (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="h-full"
                                >
                                    <textarea
                                        value={generatedContent}
                                        onChange={(e) => setGeneratedContent(e.target.value)}
                                        className="w-full h-full min-h-[450px] bg-transparent resize-none text-sm leading-relaxed focus:outline-none"
                                        placeholder="Your generated message will appear here..."
                                    />
                                </motion.div>
                            ) : (
                                <div className="h-full min-h-[450px] flex flex-col items-center justify-center text-center">
                                    <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mb-4">
                                        <Send className="w-7 h-7 text-muted-foreground" />
                                    </div>
                                    <h3 className="font-medium mb-2">Ready to Generate</h3>
                                    <p className="text-sm text-muted-foreground max-w-xs">
                                        {currentJob
                                            ? `Select a message type and click Generate to create a personalized ${templates[messageType].label.toLowerCase()}.`
                                            : "Analyze a job first, then generate personalized messages."}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        {generatedContent && (
                            <div className="p-4 border-t border-border bg-secondary/30 flex justify-between items-center">
                                <span className="text-xs text-muted-foreground">
                                    ✨ Generated with AI • Edit as needed
                                </span>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={generateMessage}
                                    className="text-sm text-primary hover:underline flex items-center gap-1"
                                >
                                    <RefreshCw size={12} />
                                    Regenerate
                                </motion.button>
                            </div>
                        )}
                    </AppleCard>
                </motion.div>
            </div>
        </div>
    );
}
