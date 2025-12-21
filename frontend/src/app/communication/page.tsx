"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Linkedin, MessageSquare, Sparkles, Copy, CheckCircle2, RefreshCw, Send } from "lucide-react";

type MessageType = "email" | "linkedin" | "follow_up";

const templates: Record<MessageType, { icon: typeof Mail; label: string; color: string }> = {
    email: { icon: Mail, label: "Professional Email", color: "bg-blue-500" },
    linkedin: { icon: Linkedin, label: "LinkedIn Message", color: "bg-[#0a66c2]" },
    follow_up: { icon: MessageSquare, label: "Follow Up", color: "bg-green-500" },
};

const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, ease: "easeOut" as const },
};

export default function CommunicationPage() {
    const [messageType, setMessageType] = useState<MessageType>("email");
    const [isGenerating, setIsGenerating] = useState(false);
    const [copied, setCopied] = useState(false);
    const [generatedContent, setGeneratedContent] = useState("");
    const [jobTitle, setJobTitle] = useState("Software Engineer");
    const [company, setCompany] = useState("Apple");

    const generateMessage = async () => {
        setIsGenerating(true);
        await new Promise(resolve => setTimeout(resolve, 1500));

        const messages: Record<MessageType, string> = {
            email: `Subject: Application for ${jobTitle} at ${company}

Dear Hiring Manager,

I am excited to apply for the ${jobTitle} position at ${company}. With my background in software development and passion for building exceptional products, I believe I would be a valuable addition to your team.

My experience includes:
• Building scalable applications serving millions of users
• Leading cross-functional teams to deliver products on time
• Implementing best practices in code quality and testing

I would welcome the opportunity to discuss how my skills and experience align with your needs.

Thank you for your consideration.

Best regards`,
            linkedin: `Hi! I noticed the ${jobTitle} opening at ${company} and I'm very interested. With my background in software engineering and passion for innovation, I'd love to connect and learn more about the team. Would you be open to a quick chat?`,
            follow_up: `Subject: Following Up - ${jobTitle} Application

Dear Hiring Manager,

I wanted to follow up on my application for the ${jobTitle} role at ${company} submitted last week.

I remain very enthusiastic about this opportunity and would love to discuss how I can contribute to your team's success.

Please let me know if you need any additional information.

Best regards`,
        };

        setGeneratedContent(messages[messageType]);
        setIsGenerating(false);
    };

    const copyToClipboard = async () => {
        await navigator.clipboard.writeText(generatedContent);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="max-w-4xl mx-auto px-6 py-8">
            {/* Header */}
            <motion.div {...fadeIn} className="mb-8">
                <h1 className="text-4xl font-bold tracking-tight mb-2">Message Generator</h1>
                <p className="text-lg text-muted-foreground">Create personalized outreach messages with AI</p>
            </motion.div>

            <div className="grid lg:grid-cols-5 gap-8">
                {/* Settings */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="lg:col-span-2 space-y-6"
                >
                    {/* Message Type */}
                    <div className="apple-card p-6">
                        <h2 className="font-semibold mb-4">Message Type</h2>
                        <div className="space-y-2">
                            {(Object.keys(templates) as MessageType[]).map((type) => {
                                const template = templates[type];
                                return (
                                    <motion.button
                                        key={type}
                                        whileHover={{ x: 4 }}
                                        onClick={() => setMessageType(type)}
                                        className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${messageType === type
                                            ? "bg-primary/10 text-primary"
                                            : "hover:bg-secondary"
                                            }`}
                                    >
                                        <div className={`w-9 h-9 rounded-lg ${template.color} flex items-center justify-center`}>
                                            <template.icon size={16} className="text-white" />
                                        </div>
                                        <span className="font-medium text-sm">{template.label}</span>
                                    </motion.button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Job Details */}
                    <div className="apple-card p-6">
                        <h2 className="font-semibold mb-4">Job Details</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm text-muted-foreground block mb-2">Job Title</label>
                                <input
                                    type="text"
                                    value={jobTitle}
                                    onChange={(e) => setJobTitle(e.target.value)}
                                    className="w-full apple-input"
                                    placeholder="e.g., Software Engineer"
                                />
                            </div>
                            <div>
                                <label className="text-sm text-muted-foreground block mb-2">Company</label>
                                <input
                                    type="text"
                                    value={company}
                                    onChange={(e) => setCompany(e.target.value)}
                                    className="w-full apple-input"
                                    placeholder="e.g., Apple"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Generate Button */}
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={generateMessage}
                        disabled={isGenerating}
                        className="w-full apple-button-primary py-4 text-base"
                    >
                        {isGenerating ? (
                            <RefreshCw size={18} className="animate-spin" />
                        ) : (
                            <Sparkles size={18} />
                        )}
                        {isGenerating ? "Generating..." : "Generate Message"}
                    </motion.button>
                </motion.div>

                {/* Output */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="lg:col-span-3"
                >
                    <div className="apple-card overflow-hidden h-full flex flex-col">
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
                            <div className="flex gap-2">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={copyToClipboard}
                                    disabled={!generatedContent}
                                    className="apple-button-secondary text-sm px-3 py-1.5"
                                >
                                    {copied ? <CheckCircle2 size={14} /> : <Copy size={14} />}
                                    {copied ? "Copied!" : "Copy"}
                                </motion.button>
                            </div>
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
                                        className="w-full h-full min-h-[400px] bg-transparent resize-none text-sm leading-relaxed focus:outline-none"
                                        placeholder="Your generated message will appear here..."
                                    />
                                </motion.div>
                            ) : (
                                <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center">
                                    <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mb-4">
                                        <Send className="w-7 h-7 text-muted-foreground" />
                                    </div>
                                    <h3 className="font-medium mb-2">Ready to Generate</h3>
                                    <p className="text-sm text-muted-foreground max-w-xs">
                                        Fill in the job details and click Generate to create your personalized message.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        {generatedContent && (
                            <div className="p-4 border-t border-border bg-secondary/30 flex justify-between items-center">
                                <span className="text-xs text-muted-foreground">
                                    ✨ Generated with AI • Feel free to edit
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
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
