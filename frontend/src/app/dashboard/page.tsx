"use client";

import { motion } from "framer-motion";
import { Plus, Briefcase, FileText, CheckCircle2, TrendingUp } from "lucide-react";
import Link from "next/link";

export default function Dashboard() {
    return (
        <div className="space-y-12">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-muted-foreground mt-2">Welcome back. Here's an overview of your career progress.</p>
                </div>
                <Link
                    href="/jobs"
                    className="bg-foreground text-background px-6 py-3 rounded-full font-medium flex items-center gap-2 hover:opacity-90 transition-opacity w-fit"
                >
                    <Plus size={18} />
                    New Application
                </Link>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard label="Enhanced Resumes" value="12" icon={<FileText size={20} />} change="+2" />
                <StatsCard label="Jobs Analyzed" value="156" icon={<Plus size={20} />} change="+24%" />
                <StatsCard label="Interviews" value="4" icon={<CheckCircle2 size={20} />} change="+1" />
                <StatsCard label="Match Success" value="92%" icon={<TrendingUp size={20} />} change="+4%" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-2xl font-bold">Recent Applications</h2>
                    <div className="glass rounded-3xl overflow-hidden border border-border">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-border bg-secondary/30">
                                    <th className="px-6 py-4 font-semibold text-sm">Company</th>
                                    <th className="px-6 py-4 font-semibold text-sm">Role</th>
                                    <th className="px-6 py-4 font-semibold text-sm">Status</th>
                                    <th className="px-6 py-4 font-semibold text-sm">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                <ApplicationRow company="Apple" role="Product Designer" status="Interviewing" date="2 days ago" />
                                <ApplicationRow company="Stripe" role="Frontend Engineer" status="Applied" date="4 days ago" />
                                <ApplicationRow company="Airbnb" role="Senior UX Researcher" status="Rejected" date="1 week ago" />
                                <ApplicationRow company="Github" role="Software Engineer" status="Applied" date="1 week ago" />
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="space-y-6">
                    <h2 className="text-2xl font-bold">Quick Actions</h2>
                    <div className="grid grid-cols-1 gap-4">
                        <ActionCard title="Manage Resumes" description="Targeted titles & last modified tracking" href="/resumes" />
                        <ActionCard title="Update SEO/EEO Profile" description="Legal questions & work authorization" href="/profile" />
                        <ActionCard title="Link Paster (Job AI)" description="Paste job link to analyze & work on it" href="/jobs" />
                        <ActionCard title="Agent AI Features" description="Predictive matching & auto-apply status" href="/dashboard" />
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatsCard({ label, value, icon, change }: { label: string, value: string, icon: React.ReactNode, change: string }) {
    return (
        <motion.div
            whileHover={{ y: -5 }}
            className="p-6 rounded-3xl bg-secondary/30 border border-border space-y-4"
        >
            <div className="flex items-center justify-between">
                <div className="p-2 bg-foreground/5 rounded-xl">
                    {icon}
                </div>
                <span className={`text-xs font-bold ${change.startsWith('+') ? 'text-green-500' : 'text-muted-foreground'}`}>
                    {change}
                </span>
            </div>
            <div>
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="text-2xl font-bold">{value}</p>
            </div>
        </motion.div>
    );
}

function ApplicationRow({ company, role, status, date }: { company: string, role: string, status: string, date: string }) {
    const statusColors: any = {
        'Interviewing': 'bg-blue-500/10 text-blue-500',
        'Applied': 'bg-yellow-500/10 text-yellow-500',
        'Rejected': 'bg-destructive/10 text-destructive',
    };

    return (
        <tr className="hover:bg-secondary/20 transition-colors">
            <td className="px-6 py-4 font-medium">{company}</td>
            <td className="px-6 py-4 text-sm text-muted-foreground">{role}</td>
            <td className="px-6 py-4">
                <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusColors[status] || 'bg-secondary text-foreground'}`}>
                    {status}
                </span>
            </td>
            <td className="px-6 py-4 text-sm text-muted-foreground">{date}</td>
        </tr>
    );
}

function ActionCard({ title, description, href }: { title: string, description: string, href: string }) {
    return (
        <Link href={href}>
            <div className="p-6 rounded-3xl glass border border-border hover:border-foreground/20 transition-colors group">
                <h3 className="font-bold group-hover:text-primary transition-colors">{title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{description}</p>
            </div>
        </Link>
    );
}
