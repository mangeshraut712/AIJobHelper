"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Briefcase, FileText, MessageSquare, Target, TrendingUp, CheckCircle2, ArrowUpRight, Sparkles, Calendar, Users } from "lucide-react";
import { AppleCard } from "@/components/ui/AppleCard";
import { AppleButton } from "@/components/ui/AppleButton";
import { FADE_IN, FADE_IN_DELAY, STATUS_COLORS } from "@/lib/constants";

const stats = [
    { label: "Applications", value: "24", change: "+12%", icon: Briefcase },
    { label: "Interviews", value: "8", change: "+33%", icon: Users },
    { label: "Response Rate", value: "67%", change: "+8%", icon: TrendingUp },
    { label: "Saved Jobs", value: "156", change: "+24", icon: Target },
];

const recentActivity = [
    { type: "application", company: "Google", role: "Software Engineer", time: "2 hours ago", status: "applied" as keyof typeof STATUS_COLORS },
    { type: "interview", company: "Apple", role: "iOS Developer", time: "Yesterday", status: "interviewing" as keyof typeof STATUS_COLORS },
    { type: "response", company: "Meta", role: "Full Stack Engineer", time: "2 days ago", status: "pending" as keyof typeof STATUS_COLORS },
];

const quickActions = [
    { href: "/resumes", icon: FileText, label: "Resume Studio", desc: "Optimize your resume" },
    { href: "/jobs", icon: Target, label: "Job Finder", desc: "Find matching jobs" },
    { href: "/communication", icon: MessageSquare, label: "Messages", desc: "Generate outreach" },
];

export default function DashboardPage() {
    const greeting = new Date().getHours() < 12 ? "Good morning" : new Date().getHours() < 18 ? "Good afternoon" : "Good evening";

    return (
        <div className="max-w-6xl mx-auto px-6 py-8">
            {/* Header */}
            <motion.div {...FADE_IN} className="mb-10">
                <h1 className="text-4xl font-bold tracking-tight mb-2">{greeting}</h1>
                <p className="text-lg text-muted-foreground">Here&apos;s what&apos;s happening with your job search.</p>
            </motion.div>

            {/* Stats Grid */}
            <motion.div
                {...FADE_IN_DELAY(0.1)}
                className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10"
            >
                {stats.map((stat, index) => (
                    <AppleCard key={index} className="p-6">
                        <motion.div whileHover={{ y: -2 }}>
                            <div className="flex items-start justify-between mb-4">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                    <stat.icon className="w-5 h-5 text-primary" />
                                </div>
                                <span className="text-xs font-medium text-green-600 bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded-full">
                                    {stat.change}
                                </span>
                            </div>
                            <div className="text-3xl font-bold mb-1">{stat.value}</div>
                            <div className="text-sm text-muted-foreground">{stat.label}</div>
                        </motion.div>
                    </AppleCard>
                ))}
            </motion.div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">
                    {/* AI Insights */}
                    <motion.div {...FADE_IN_DELAY(0.2)}>
                        <AppleCard className="p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                                    <Sparkles className="w-5 h-5 text-primary-foreground" />
                                </div>
                                <div>
                                    <h2 className="font-semibold">AI Insights</h2>
                                    <p className="text-sm text-muted-foreground">Personalized recommendations</p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="p-4 rounded-xl bg-secondary/50 flex items-start gap-4">
                                    <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
                                    <div>
                                        <p className="font-medium text-sm mb-1">Your resume is well-optimized</p>
                                        <p className="text-sm text-muted-foreground">85% match rate with your target roles. Consider adding more quantified achievements.</p>
                                    </div>
                                </div>
                                <div className="p-4 rounded-xl bg-secondary/50 flex items-start gap-4">
                                    <Target className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                                    <div>
                                        <p className="font-medium text-sm mb-1">12 new jobs match your profile</p>
                                        <p className="text-sm text-muted-foreground">Based on your skills and preferences. <Link href="/jobs" className="text-primary hover:underline">View matches →</Link></p>
                                    </div>
                                </div>
                            </div>
                        </AppleCard>
                    </motion.div>

                    {/* Recent Activity */}
                    <motion.div {...FADE_IN_DELAY(0.3)}>
                        <AppleCard className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-semibold">Recent Activity</h2>
                                <Link href="/jobs" className="text-sm text-primary hover:underline flex items-center gap-1">
                                    View all <ArrowUpRight size={14} />
                                </Link>
                            </div>
                            <div className="space-y-4">
                                {recentActivity.map((activity, index) => (
                                    <motion.div
                                        key={index}
                                        whileHover={{ x: 4 }}
                                        className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center font-bold text-primary">
                                                {activity.company.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm">{activity.role}</p>
                                                <p className="text-sm text-muted-foreground">{activity.company}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${STATUS_COLORS[activity.status]}`}>
                                                {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
                                            </span>
                                            <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </AppleCard>
                    </motion.div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Quick Actions */}
                    <motion.div {...FADE_IN_DELAY(0.4)}>
                        <AppleCard className="p-6">
                            <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
                            <div className="space-y-3">
                                {quickActions.map((action, index) => (
                                    <Link key={index} href={action.href}>
                                        <motion.div
                                            whileHover={{ x: 4 }}
                                            className="flex items-center gap-4 p-3 rounded-xl hover:bg-secondary/50 transition-colors cursor-pointer"
                                        >
                                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                                <action.icon className="w-5 h-5 text-primary" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm">{action.label}</p>
                                                <p className="text-xs text-muted-foreground">{action.desc}</p>
                                            </div>
                                        </motion.div>
                                    </Link>
                                ))}
                            </div>
                        </AppleCard>
                    </motion.div>

                    {/* Upcoming */}
                    <motion.div {...FADE_IN_DELAY(0.5)}>
                        <AppleCard className="p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <Calendar className="w-5 h-5 text-primary" />
                                <h2 className="text-lg font-semibold">Upcoming</h2>
                            </div>
                            <div className="space-y-4">
                                <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                                    <p className="font-medium text-sm text-green-700 dark:text-green-400">Interview with Apple</p>
                                    <p className="text-xs text-green-600 dark:text-green-500 mt-1">Tomorrow at 2:00 PM PST</p>
                                </div>
                                <div className="p-4 rounded-xl bg-secondary/30">
                                    <p className="font-medium text-sm">Follow up with Meta</p>
                                    <p className="text-xs text-muted-foreground mt-1">Due in 2 days</p>
                                </div>
                            </div>
                        </AppleCard>
                    </motion.div>

                    {/* Profile Completion */}
                    <motion.div {...FADE_IN_DELAY(0.6)}>
                        <AppleCard className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="font-semibold">Profile Strength</h2>
                                <span className="text-2xl font-bold text-primary">85%</span>
                            </div>
                            <div className="h-2 bg-secondary rounded-full overflow-hidden mb-4">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: "85%" }}
                                    transition={{ duration: 1, delay: 0.8 }}
                                    className="h-full bg-primary rounded-full"
                                />
                            </div>
                            <Link href="/profile">
                                <AppleButton variant="secondary" className="w-full">
                                    Complete Profile
                                </AppleButton>
                            </Link>
                        </AppleCard>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
