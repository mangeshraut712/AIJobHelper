"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    Mic, Brain, MessageCircle, Sparkles, ChevronRight,
    Target, BookOpen, Lightbulb, Clock, Star, RefreshCw,
    CheckCircle2, AlertCircle, Building2
} from "lucide-react";
import { AppleCard } from "@/components/ui/AppleCard";
import { AppleButton } from "@/components/ui/AppleButton";
import { useToast } from "@/components/ui/Toast";
import { secureGet } from "@/lib/secureStorage";
import { STORAGE_KEYS } from "@/lib/storageKeys";

interface InterviewQuestion {
    id: string;
    category: string;
    question: string;
    difficulty: "Easy" | "Medium" | "Hard";
    tips: string[];
    sampleAnswer?: string;
}

const categories = [
    { id: "behavioral", label: "Behavioral", icon: MessageCircle, color: "bg-blue-500" },
    { id: "technical", label: "Technical", icon: Brain, color: "bg-purple-500" },
    { id: "situational", label: "Situational", icon: Target, color: "bg-green-500" },
    { id: "culture", label: "Culture Fit", icon: Star, color: "bg-orange-500" },
];

const sampleQuestions: InterviewQuestion[] = [
    {
        id: "1",
        category: "behavioral",
        question: "Tell me about a time when you had to deal with a difficult team member.",
        difficulty: "Medium",
        tips: [
            "Use the STAR method (Situation, Task, Action, Result)",
            "Focus on how you resolved the conflict professionally",
            "Highlight what you learned from the experience"
        ],
        sampleAnswer: "In my previous role, I worked with a colleague who often missed deadlines. I scheduled a private conversation to understand their challenges, discovered they were overwhelmed with tasks. Together we prioritized their workload and I offered to help with some items. This improved our team's delivery time by 30%."
    },
    {
        id: "2",
        category: "technical",
        question: "How would you design a scalable system to handle millions of concurrent users?",
        difficulty: "Hard",
        tips: [
            "Discuss horizontal scaling and load balancing",
            "Mention caching strategies (Redis, CDN)",
            "Talk about database sharding and replication",
            "Consider microservices architecture"
        ]
    },
    {
        id: "3",
        category: "situational",
        question: "How would you prioritize tasks when everything seems urgent?",
        difficulty: "Easy",
        tips: [
            "Mention using frameworks like Eisenhower Matrix",
            "Discuss communication with stakeholders",
            "Show how you delegate when appropriate"
        ]
    },
    {
        id: "4",
        category: "culture",
        question: "Why do you want to work at our company?",
        difficulty: "Medium",
        tips: [
            "Research the company's mission and values",
            "Connect your experience to their goals",
            "Show genuine enthusiasm and specific reasons"
        ]
    },
];

const FADE_IN = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, ease: "easeOut" as const },
};

export default function InterviewPrepPage() {
    const { toast } = useToast();
    const [selectedCategory, setSelectedCategory] = useState<string>("behavioral");
    const [currentQuestion, setCurrentQuestion] = useState<InterviewQuestion | null>(null);
    const [showAnswer, setShowAnswer] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    // Practice mode tracking
    const [currentJob, setCurrentJob] = useState<{ title: string; company: string } | null>(null);

    useEffect(() => {
        // Load saved job info on mount only (secureGet adds 'cap_' prefix automatically)
        const saved = secureGet<{ title: string; company: string }>(STORAGE_KEYS.CURRENT_JOB_FOR_RESUME);
        if (saved) {
            // Use a callback to avoid lint warning about setState in effect
            requestAnimationFrame(() => {
                setCurrentJob(saved);
            });
        }
    }, []);

    // Update question when category changes
    useEffect(() => {
        const filtered = sampleQuestions.filter(q => q.category === selectedCategory);
        if (filtered.length > 0) {
            requestAnimationFrame(() => {
                setCurrentQuestion(filtered[0]);
            });
        }
    }, [selectedCategory]);

    const handleCategoryChange = (catId: string) => {
        setSelectedCategory(catId);
        setShowAnswer(false);
        const filtered = sampleQuestions.filter(q => q.category === catId);
        if (filtered.length > 0) {
            setCurrentQuestion(filtered[0]);
        }
    };

    const getNextQuestion = () => {
        setIsGenerating(true);
        setShowAnswer(false);

        setTimeout(() => {
            const filtered = sampleQuestions.filter(q => q.category === selectedCategory);
            const randomIndex = Math.floor(Math.random() * filtered.length);
            setCurrentQuestion(filtered[randomIndex]);
            setIsGenerating(false);
        }, 500);
    };

    const startPractice = () => {
        toast("Practice mode started! Answer the question out loud.", "success");
    };

    return (
        <div className="max-w-6xl mx-auto px-6 py-8">
            {/* Header */}
            <motion.div {...FADE_IN} className="mb-8">
                <h1 className="text-4xl font-bold tracking-tight mb-2">Interview Prep</h1>
                <p className="text-lg text-muted-foreground">
                    Practice common interview questions and get AI-powered feedback
                </p>
                {currentJob && (
                    <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary text-sm">
                        <Building2 size={14} className="text-primary" />
                        Preparing for: <span className="font-medium">{currentJob.title}</span> at {currentJob.company}
                    </div>
                )}
            </motion.div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="lg:col-span-2 space-y-6"
                >
                    {/* Category Tabs */}
                    <div className="flex flex-wrap gap-2">
                        {categories.map((cat) => (
                            <motion.button
                                key={cat.id}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleCategoryChange(cat.id)}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all ${selectedCategory === cat.id
                                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                                    : "bg-secondary hover:bg-secondary/80"
                                    }`}
                            >
                                <cat.icon size={16} />
                                {cat.label}
                            </motion.button>
                        ))}
                    </div>

                    {/* Question Card */}
                    <AppleCard className="p-8">
                        {currentQuestion ? (
                            <div className="space-y-6">
                                {/* Question Header */}
                                <div className="flex items-start justify-between">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${currentQuestion.difficulty === "Easy" ? "bg-green-500/10 text-green-600" :
                                        currentQuestion.difficulty === "Medium" ? "bg-yellow-500/10 text-yellow-600" :
                                            "bg-red-500/10 text-red-600"
                                        }`}>
                                        {currentQuestion.difficulty}
                                    </span>
                                    <span className="text-xs text-muted-foreground capitalize">
                                        {currentQuestion.category}
                                    </span>
                                </div>

                                {/* Question */}
                                <h2 className="text-2xl font-semibold leading-relaxed">
                                    {currentQuestion.question}
                                </h2>

                                {/* Tips Section */}
                                <div className="space-y-3">
                                    <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                        <Lightbulb size={14} className="text-yellow-500" />
                                        Tips for Answering
                                    </h3>
                                    <ul className="space-y-2">
                                        {currentQuestion.tips.map((tip, idx) => (
                                            <li key={idx} className="flex items-start gap-2 text-sm">
                                                <CheckCircle2 size={14} className="text-green-500 mt-0.5 shrink-0" />
                                                <span>{tip}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Sample Answer (if available) */}
                                {currentQuestion.sampleAnswer && (
                                    <div className="space-y-3">
                                        <button
                                            onClick={() => setShowAnswer(!showAnswer)}
                                            className="text-sm font-semibold uppercase tracking-wider text-primary flex items-center gap-2 hover:underline"
                                        >
                                            <BookOpen size={14} />
                                            {showAnswer ? "Hide" : "Show"} Sample Answer
                                            <ChevronRight size={14} className={`transition-transform ${showAnswer ? "rotate-90" : ""}`} />
                                        </button>

                                        {showAnswer && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: "auto" }}
                                                className="p-4 bg-secondary/50 rounded-xl text-sm leading-relaxed"
                                            >
                                                {currentQuestion.sampleAnswer}
                                            </motion.div>
                                        )}
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="flex flex-wrap gap-3 pt-4 border-t border-border">
                                    <AppleButton
                                        variant="primary"
                                        onClick={startPractice}
                                        className="px-6"
                                    >
                                        <Mic size={16} />
                                        Practice Out Loud
                                    </AppleButton>
                                    <AppleButton
                                        variant="secondary"
                                        onClick={getNextQuestion}
                                        disabled={isGenerating}
                                        className="px-6"
                                    >
                                        {isGenerating ? (
                                            <>
                                                <RefreshCw size={16} className="animate-spin" />
                                                Loading...
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles size={16} />
                                                Next Question
                                            </>
                                        )}
                                    </AppleButton>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                                <p className="text-muted-foreground">No questions available for this category.</p>
                            </div>
                        )}
                    </AppleCard>
                </motion.div>

                {/* Sidebar */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="space-y-6"
                >
                    {/* Progress Card */}
                    <AppleCard className="p-6">
                        <h3 className="font-semibold mb-4">Your Progress</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Questions Practiced</span>
                                <span className="font-semibold">12</span>
                            </div>
                            <div className="h-2 bg-secondary rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: "60%" }}
                                    transition={{ duration: 0.8 }}
                                    className="h-full bg-gradient-to-r from-primary to-purple-500 rounded-full"
                                />
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Keep practicing! You&apos;re doing great.
                            </p>
                        </div>
                    </AppleCard>

                    {/* Quick Tips */}
                    <AppleCard className="p-6">
                        <h3 className="font-semibold mb-4 flex items-center gap-2">
                            <Lightbulb size={16} className="text-yellow-500" />
                            Quick Tips
                        </h3>
                        <ul className="space-y-3 text-sm">
                            <li className="flex items-start gap-2">
                                <Clock size={14} className="text-muted-foreground mt-0.5" />
                                <span>Keep answers to 2-3 minutes</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <Target size={14} className="text-muted-foreground mt-0.5" />
                                <span>Use STAR method for behavioral questions</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <Brain size={14} className="text-muted-foreground mt-0.5" />
                                <span>Prepare 5-7 stories that showcase your skills</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <Mic size={14} className="text-muted-foreground mt-0.5" />
                                <span>Practice out loud, not just in your head</span>
                            </li>
                        </ul>
                    </AppleCard>

                    {/* Resources */}
                    <AppleCard className="p-6">
                        <h3 className="font-semibold mb-4">Resources</h3>
                        <div className="space-y-2">
                            {["STAR Method Guide", "Common Questions PDF", "Body Language Tips"].map((resource, idx) => (
                                <motion.button
                                    key={idx}
                                    whileHover={{ x: 4 }}
                                    className="w-full flex items-center justify-between p-3 rounded-xl bg-secondary/50 hover:bg-secondary text-sm font-medium transition-colors"
                                >
                                    <span>{resource}</span>
                                    <ChevronRight size={14} className="text-muted-foreground" />
                                </motion.button>
                            ))}
                        </div>
                    </AppleCard>
                </motion.div>
            </div>
        </div>
    );
}
