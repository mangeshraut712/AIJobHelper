"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Linkedin, Send, Copy, RefreshCw, Check, Clock, MessageSquare, Loader2 } from "lucide-react";
import axios from "axios";
import API_URL from "@/lib/api";

export default function CommunicationPage() {
    const [activeTab, setActiveTab] = useState("email");
    const [content, setContent] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [copied, setCopied] = useState(false);

    const generateContent = async (type: string) => {
        setIsGenerating(true);
        try {
            const response = await axios.post(`${API_URL}/generate-communication`, {
                resume_data: {
                    name: "Mangesh Raut",
                    email: "mbr63drexel@gmail.com",
                    experience: [],
                    education: [],
                    skills: []
                },
                job_description: {
                    title: "Software Engineer",
                    company: "Target Company",
                    description: "Interested in the role."
                },
                type: type === "linkedin" ? "linkedin_message" : (type === "email" ? "email" : "follow_up")
            });
            setContent(response.data.content);
        } catch (error) {
            console.error("Generation error:", error);
            setContent("Failed to generate content. Please check your API key.");
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
                <h1 className="text-5xl font-bold tracking-tight">Outreach Studio</h1>
                <p className="text-muted-foreground text-lg">Generate personalized messages and emails to stand out to recruiters.</p>
            </header>

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

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <MessageSquare size={24} />
                        AI Draft
                    </h2>
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
                            className="px-4 py-2 bg-foreground text-background rounded-full text-sm font-bold flex items-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
                        >
                            {copied ? <Check size={14} /> : <Copy size={14} />}
                            {copied ? "Copied" : "Copy"}
                        </button>
                    </div>
                </div>

                <div className="relative group">
                    <div className="absolute inset-0 japanese-dot-grid opacity-10 pointer-events-none rounded-3xl" />
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Select a type and click Generate..."
                        className="w-full h-96 bg-secondary/30 border border-border rounded-3xl p-8 md:p-12 text-lg text-foreground focus:outline-hidden focus:ring-2 focus:ring-foreground/10 transition-all resize-none leading-relaxed"
                    />
                    {!content && !isGenerating && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <button
                                onClick={() => generateContent(activeTab)}
                                className="bg-foreground text-background px-8 py-4 rounded-full font-bold flex items-center gap-2 hover:opacity-90 transition-opacity"
                            >
                                <Send size={18} />
                                Generate {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                            </button>
                        </div>
                    )}
                    {isGenerating && (
                        <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm rounded-3xl">
                            <div className="flex flex-col items-center gap-4">
                                <RefreshCw size={48} className="animate-spin text-foreground/20" />
                                <p className="font-bold text-muted-foreground animate-pulse tracking-widest uppercase text-xs">AI is thinking...</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-12">
                <TipsCard
                    title="Pro Tip: Personalization"
                    text="AI drafts are a great starting point, but adding one specific detail about a recent company project can double your response rate."
                />
                <TipsCard
                    title="Optimal Timing"
                    text="For emails, Tuesday mornings between 9 AM and 11 AM usually see the highest open rates from hiring managers."
                />
            </div>
        </div>
    );
}

function TabButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
    return (
        <button
            onClick={onClick}
            className={`px-6 py-3 rounded-full flex items-center gap-2 font-bold transition-all ${active ? 'bg-foreground text-background shadow-lg' : 'bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80'}`}
        >
            {icon}
            <span className="hidden sm:inline">{label}</span>
        </button>
    );
}

function TipsCard({ title, text }: { title: string, text: string }) {
    return (
        <div className="p-8 rounded-3xl border border-border bg-foreground/[0.02] space-y-3">
            <h4 className="font-bold text-lg">{title}</h4>
            <p className="text-muted-foreground text-sm leading-relaxed">{text}</p>
        </div>
    );
}
