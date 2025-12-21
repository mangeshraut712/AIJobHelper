"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { Plus, FileText, CheckCircle2, TrendingUp, Brain, Sparkles, ArrowRight, Calendar, Clock, Target, Zap } from "lucide-react";
import Link from "next/link";

function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
}

export default function Dashboard() {
    const greeting = useMemo(() => getGreeting(), []);

    return (
        <div className="space-y-12 pb-12">
            {/* Header with AI Status */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-xs font-medium text-green-500">AI System Online</span>
                    </div>
                    <h1 className="text-4xl font-bold tracking-tight">{greeting}, Mangesh! 👋</h1>
                    <p className="text-muted-foreground mt-2">Your AI career co-pilot is ready. Here&apos;s your career progress overview.</p>
                </div>
                <Link
                    href="/jobs"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-full font-medium flex items-center gap-2 hover:opacity-90 transition-opacity w-fit shadow-lg shadow-blue-500/25"
                >
                    <Plus size={18} />
                    Analyze New Job
                </Link>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                    label="AI Enhancements"
                    value="12"
                    icon={<Sparkles size={20} />}
                    change="+2 this week"
                    color="blue"
                />
                <StatsCard
                    label="Jobs Analyzed"
                    value="156"
                    icon={<Brain size={20} />}
                    change="+24 this month"
                    color="purple"
                />
                <StatsCard
                    label="Interview Calls"
                    value="4"
                    icon={<CheckCircle2 size={20} />}
                    change="+1 scheduled"
                    color="green"
                />
                <StatsCard
                    label="Match Success"
                    value="92%"
                    icon={<TrendingUp size={20} />}
                    change="+4% improved"
                    color="orange"
                />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Applications Table */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold">Recent Applications</h2>
                        <Link href="/jobs" className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
                            View all <ArrowRight size={14} />
                        </Link>
                    </div>
                    <div className="glass rounded-3xl overflow-hidden border border-border">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-border bg-secondary/30">
                                    <th className="px-6 py-4 font-semibold text-sm">Company</th>
                                    <th className="px-6 py-4 font-semibold text-sm">Role</th>
                                    <th className="px-6 py-4 font-semibold text-sm">Status</th>
                                    <th className="px-6 py-4 font-semibold text-sm">Match</th>
                                    <th className="px-6 py-4 font-semibold text-sm">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                <ApplicationRow company="Apple" role="Product Designer" status="Interviewing" match={94} date="2 days ago" />
                                <ApplicationRow company="Stripe" role="Frontend Engineer" status="Applied" match={88} date="4 days ago" />
                                <ApplicationRow company="Airbnb" role="Senior UX Researcher" status="Rejected" match={72} date="1 week ago" />
                                <ApplicationRow company="GitHub" role="Software Engineer" status="Applied" match={91} date="1 week ago" />
                                <ApplicationRow company="Vercel" role="Solutions Engineer" status="Offered" match={96} date="3 days ago" />
                            </tbody>
                        </table>
                    </div>

                    {/* AI Insights */}
                    <div className="p-6 rounded-3xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20">
                        <div className="flex items-start gap-4">
                            <div className="p-3 rounded-2xl bg-blue-500/20">
                                <Brain size={24} className="text-blue-500" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-lg mb-1">AI Career Insight</h3>
                                <p className="text-muted-foreground text-sm leading-relaxed">
                                    Based on your recent applications, you have a <strong className="text-foreground">78% higher</strong> success rate
                                    with roles that emphasize <strong className="text-foreground">React</strong> and <strong className="text-foreground">TypeScript</strong>.
                                    Consider optimizing your resume to highlight these skills more prominently.
                                </p>
                                <Link href="/resumes" className="inline-flex items-center gap-1 mt-3 text-sm font-medium text-blue-500 hover:text-blue-400">
                                    Optimize Resume <ArrowRight size={14} />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Sidebar */}
                <div className="space-y-6">
                    <h2 className="text-2xl font-bold">Quick Actions</h2>
                    <div className="grid grid-cols-1 gap-4">
                        <ActionCard
                            icon={<FileText size={20} />}
                            title="Resume Studio"
                            description="AI-powered resume optimization"
                            href="/resumes"
                            color="blue"
                        />
                        <ActionCard
                            icon={<Target size={20} />}
                            title="Job Analyzer"
                            description="Paste URL to extract requirements"
                            href="/jobs"
                            color="purple"
                        />
                        <ActionCard
                            icon={<Zap size={20} />}
                            title="Outreach Studio"
                            description="Generate emails & LinkedIn messages"
                            href="/communication"
                            color="green"
                        />
                        <ActionCard
                            icon={<CheckCircle2 size={20} />}
                            title="Profile Setup"
                            description="Complete your career profile"
                            href="/profile"
                            color="orange"
                        />
                    </div>

                    {/* Upcoming */}
                    <div className="p-6 rounded-3xl border border-border bg-secondary/20">
                        <h3 className="font-bold mb-4 flex items-center gap-2">
                            <Calendar size={18} />
                            Upcoming
                        </h3>
                        <div className="space-y-4">
                            <UpcomingItem
                                title="Apple Interview"
                                subtitle="Technical Round"
                                time="Tomorrow, 2:00 PM"
                            />
                            <UpcomingItem
                                title="Follow-up: Stripe"
                                subtitle="Send thank you email"
                                time="In 3 days"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatsCard({ label, value, icon, change, color }: { label: string, value: string, icon: React.ReactNode, change: string, color: string }) {
    const colorClasses: Record<string, string> = {
        blue: "from-blue-600 to-blue-400",
        purple: "from-purple-600 to-purple-400",
        green: "from-green-600 to-green-400",
        orange: "from-orange-600 to-orange-400",
    };

    return (
        <motion.div
            whileHover={{ y: -5, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="p-6 rounded-3xl bg-secondary/30 border border-border space-y-4 hover:border-foreground/20 transition-colors"
        >
            <div className="flex items-center justify-between">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${colorClasses[color]} text-white shadow-lg`}>
                    {icon}
                </div>
                <span className="text-xs font-medium text-green-500 bg-green-500/10 px-2 py-1 rounded-full">
                    {change}
                </span>
            </div>
            <div>
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="text-3xl font-bold">{value}</p>
            </div>
        </motion.div>
    );
}

function ApplicationRow({ company, role, status, match, date }: { company: string, role: string, status: string, match: number, date: string }) {
    const statusColors: Record<string, string> = {
        'Interviewing': 'bg-blue-500/10 text-blue-500',
        'Applied': 'bg-yellow-500/10 text-yellow-500',
        'Rejected': 'bg-destructive/10 text-destructive',
        'Offered': 'bg-green-500/10 text-green-500',
    };

    const matchColor = match >= 90 ? 'text-green-500' : match >= 80 ? 'text-blue-500' : match >= 70 ? 'text-yellow-500' : 'text-destructive';

    return (
        <tr className="hover:bg-secondary/20 transition-colors cursor-pointer">
            <td className="px-6 py-4 font-medium">{company}</td>
            <td className="px-6 py-4 text-sm text-muted-foreground">{role}</td>
            <td className="px-6 py-4">
                <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusColors[status] || 'bg-secondary text-foreground'}`}>
                    {status}
                </span>
            </td>
            <td className="px-6 py-4">
                <span className={`font-bold ${matchColor}`}>{match}%</span>
            </td>
            <td className="px-6 py-4 text-sm text-muted-foreground">{date}</td>
        </tr>
    );
}

function ActionCard({ icon, title, description, href, color }: { icon: React.ReactNode, title: string, description: string, href: string, color: string }) {
    const colorClasses: Record<string, string> = {
        blue: "from-blue-600 to-blue-400",
        purple: "from-purple-600 to-purple-400",
        green: "from-green-600 to-green-400",
        orange: "from-orange-600 to-orange-400",
    };

    return (
        <Link href={href}>
            <div className="p-4 rounded-2xl glass border border-border hover:border-foreground/20 transition-all group flex items-center gap-4">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${colorClasses[color]} text-white shadow-lg group-hover:scale-110 transition-transform`}>
                    {icon}
                </div>
                <div className="flex-1">
                    <h3 className="font-bold text-sm">{title}</h3>
                    <p className="text-xs text-muted-foreground">{description}</p>
                </div>
                <ArrowRight size={16} className="text-muted-foreground group-hover:text-foreground transition-colors" />
            </div>
        </Link>
    );
}

function UpcomingItem({ title, subtitle, time }: { title: string, subtitle: string, time: string }) {
    return (
        <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-secondary">
                <Clock size={14} className="text-muted-foreground" />
            </div>
            <div className="flex-1">
                <p className="font-medium text-sm">{title}</p>
                <p className="text-xs text-muted-foreground">{subtitle}</p>
            </div>
            <span className="text-[10px] font-medium text-muted-foreground">{time}</span>
        </div>
    );
}
