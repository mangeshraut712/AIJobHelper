"use client";

import React, { useState } from "react";
import { Mail, Linkedin, Send, Copy, RefreshCw, Check, Clock, MessageSquare, Brain, Sparkles } from "lucide-react";
import axios from "axios";
import API_URL from "@/lib/api";

// AI-generated mock content for when API is unavailable
const MOCK_CONTENT = {
    email: `Subject: Application for Software Engineer Position - Excited to Contribute!

Dear Hiring Manager,

I hope this email finds you well. I am writing to express my strong interest in the Software Engineer position at your company. With my background in full-stack development and passion for building impactful solutions, I am confident I would be a valuable addition to your team.

Currently, I am a Software Engineer with hands-on experience in React, TypeScript, Python, and cloud technologies. At my current role, I have led development of critical features that improved system performance by 40% and enhanced user experience for thousands of users.

What excites me most about this opportunity is the chance to work on innovative projects that make a real difference. I am particularly drawn to your company's commitment to engineering excellence and collaborative culture.

I would welcome the opportunity to discuss how my skills and experience align with your team's needs. Please find my resume attached for your review.

Thank you for considering my application. I look forward to hearing from you.

Best regards,
Mangesh Raut
mbr63drexel@gmail.com | +1 (609) 505-3500
LinkedIn: linkedin.com/in/mangeshraut71298`,

    linkedin: `Hi [Name],

I came across your profile and was impressed by your work at [Company]. I'm a Software Engineer specializing in React and Python, and I'm very interested in the [Position] role.

I'd love to connect and learn more about the team's work. Would you have a few minutes for a quick chat?

Best,
Mangesh`,

    followup: `Subject: Following Up - Software Engineer Application

Dear Hiring Manager,

I hope this message finds you well. I wanted to follow up on my application for the Software Engineer position that I submitted last week.

I remain very enthusiastic about the opportunity to contribute to your team. The role aligns perfectly with my experience in full-stack development, and I'm excited about the potential to work on impactful projects.

If there's any additional information I can provide or if you'd like to schedule a call to discuss my qualifications further, please don't hesitate to reach out.

Thank you for your time and consideration.

Best regards,
Mangesh Raut`
};

export default function CommunicationPage() {
    const [activeTab, setActiveTab] = useState("email");
    const [content, setContent] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [copied, setCopied] = useState(false);
    const [aiSource, setAiSource] = useState<"api" | "local" | null>(null);

    const generateContent = async (type: string) => {
        setIsGenerating(true);
        setAiSource(null);

        try {
            const response = await axios.post(`${API_URL}/generate-communication`, {
                resume_data: {
                    name: "Mangesh Raut",
                    email: "mbr63drexel@gmail.com",
                    phone: "+1 (609) 505-3500",
                    linkedin: "linkedin.com/in/mangeshraut71298",
                    experience: [
                        { company: "Customized Energy Solutions", role: "Software Engineer", duration: "2024 - 2025" }
                    ],
                    education: [
                        { institution: "Drexel University", degree: "MS CS", graduation_year: 2023 }
                    ],
                    skills: ["React", "TypeScript", "Python", "Java", "Docker", "AWS"]
                },
                job_description: {
                    title: "Software Engineer",
                    company: "Target Company",
                    description: "Looking for a skilled engineer with experience in modern web technologies."
                },
                type: type === "linkedin" ? "linkedin_message" : (type === "email" ? "email" : "follow_up")
            });
            setContent(response.data.content);
            setAiSource("api");
        } catch (error) {
            console.log("Using local AI content:", error);
            // Use intelligent fallback content
            const mockContent = type === "linkedin" ? MOCK_CONTENT.linkedin :
                type === "followup" ? MOCK_CONTENT.followup :
                    MOCK_CONTENT.email;
            setContent(mockContent);
            setAiSource("local");
        } finally {
            setIsGenerating(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-12 pb-20">
            <header className="text-center space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/20 text-xs font-bold text-green-400">
                    <Brain size={14} />
                    AI-Powered Message Generator
                </div>
                <h1 className="text-5xl font-bold tracking-tight">Outreach Studio</h1>
                <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                    Generate personalized emails, LinkedIn messages, and follow-ups that stand out to recruiters.
                </p>
            </header>

            {/* Tab Buttons */}
            <div className="flex justify-center gap-4">
                <TabButton
                    active={activeTab === "email"}
                    onClick={() => setActiveTab("email")}
                    icon={<Mail size={18} />}
                    label="Email Draft"
                />
                <TabButton
                    active={activeTab === "linkedin"}
                    onClick={() => setActiveTab("linkedin")}
                    icon={<Linkedin size={18} />}
                    label="LinkedIn Invite"
                />
                <TabButton
                    active={activeTab === "followup"}
                    onClick={() => setActiveTab("followup")}
                    icon={<Clock size={18} />}
                    label="Follow-up"
                />
            </div>

            {/* Content Editor */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                            <MessageSquare size={24} />
                            AI Draft
                        </h2>
                        {aiSource && (
                            <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${aiSource === "api"
                                    ? "bg-green-500/10 text-green-500"
                                    : "bg-blue-500/10 text-blue-500"
                                }`}>
                                {aiSource === "api" ? "Gemini AI" : "Smart Template"}
                            </span>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => generateContent(activeTab)}
                            disabled={isGenerating}
                            className="px-4 py-2 bg-secondary text-foreground rounded-full text-sm font-bold flex items-center gap-2 hover:bg-secondary/80 transition-colors disabled:opacity-50"
                        >
                            <RefreshCw size={14} className={isGenerating ? "animate-spin" : ""} />
                            Regenerate
                        </button>
                        <button
                            onClick={copyToClipboard}
                            disabled={!content}
                            className="px-4 py-2 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-full text-sm font-bold flex items-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 shadow-lg shadow-green-500/25"
                        >
                            {copied ? <Check size={14} /> : <Copy size={14} />}
                            {copied ? "Copied!" : "Copy"}
                        </button>
                    </div>
                </div>

                <div className="relative group">
                    <div className="absolute inset-0 japanese-dot-grid opacity-10 pointer-events-none rounded-3xl" />
                    <textarea
                        id="message-content"
                        name="message-content"
                        value={content}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setContent(e.target.value)}
                        placeholder="Select a type and click Generate to create your personalized message..."
                        className="w-full h-[450px] bg-secondary/30 border border-border rounded-3xl p-8 md:p-12 text-base text-foreground focus:outline-hidden focus:ring-2 focus:ring-green-500/30 focus:border-green-500/50 transition-all resize-none leading-relaxed font-mono"
                    />
                    {!content && !isGenerating && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <button
                                onClick={() => generateContent(activeTab)}
                                className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-8 py-4 rounded-full font-bold flex items-center gap-2 hover:opacity-90 transition-opacity shadow-lg shadow-green-500/25"
                            >
                                <Sparkles size={18} />
                                Generate {activeTab === "linkedin" ? "LinkedIn Message" : activeTab === "followup" ? "Follow-up Email" : "Cold Email"}
                            </button>
                        </div>
                    )}
                    {isGenerating && (
                        <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm rounded-3xl">
                            <div className="flex flex-col items-center gap-4">
                                <div className="relative">
                                    <Brain size={48} className="text-green-500 animate-pulse" />
                                    <Sparkles size={20} className="absolute -top-2 -right-2 text-blue-500 animate-bounce" />
                                </div>
                                <p className="font-bold text-muted-foreground animate-pulse tracking-widest uppercase text-xs">
                                    AI is crafting your message...
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Tips Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
                <TipsCard
                    icon={<Sparkles size={20} className="text-yellow-500" />}
                    title="Personalization"
                    text="Add specific details about the company or role to stand out from generic applications."
                />
                <TipsCard
                    icon={<Clock size={20} className="text-blue-500" />}
                    title="Best Timing"
                    text="Send emails Tuesday-Thursday, 9-11 AM local time for highest open rates."
                />
                <TipsCard
                    icon={<Send size={20} className="text-green-500" />}
                    title="Follow-up"
                    text="Wait 5-7 days before following up. Persistence shows genuine interest."
                />
            </div>
        </div>
    );
}

function TabButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
    return (
        <button
            onClick={onClick}
            className={`px-6 py-3 rounded-full flex items-center gap-2 font-bold transition-all ${active
                    ? 'bg-gradient-to-r from-green-600 to-blue-600 text-white shadow-lg shadow-green-500/25'
                    : 'bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80'
                }`}
        >
            {icon}
            <span className="hidden sm:inline">{label}</span>
        </button>
    );
}

function TipsCard({ icon, title, text }: { icon: React.ReactNode, title: string, text: string }) {
    return (
        <div className="p-6 rounded-3xl border border-border bg-secondary/20 hover:bg-secondary/40 transition-colors space-y-3">
            <div className="flex items-center gap-2">
                {icon}
                <h4 className="font-bold">{title}</h4>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">{text}</p>
        </div>
    );
}
