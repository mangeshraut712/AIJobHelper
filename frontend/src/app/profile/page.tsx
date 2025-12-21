"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { User, GraduationCap, Briefcase, Code, ShieldCheck, Save, Globe, Linkedin, Mail, Phone, Layout, Plus } from "lucide-react";

export default function ProfilePage() {
    const [activeTab, setActiveTab] = useState("personal");

    const tabs = [
        { id: "personal", label: "Personal Info", icon: <User size={18} /> },
        { id: "education", label: "Education", icon: <GraduationCap size={18} /> },
        { id: "experience", label: "Experience", icon: <Briefcase size={18} /> },
        { id: "skills", label: "Skills", icon: <Code size={18} /> },
        { id: "eeo", label: "Diversity & EEO", icon: <ShieldCheck size={18} /> },
        { id: "learned", label: "Learned Q&A", icon: <Layout size={18} /> },
    ];

    return (
        <div className="max-w-6xl mx-auto space-y-12 pb-20">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight">Your Profile</h1>
                    <p className="text-muted-foreground mt-2">Manage your core identity data used for AI enhancements and autofills.</p>
                </div>
                <button className="bg-foreground text-background px-8 py-3 rounded-full font-bold flex items-center gap-2 hover:opacity-90 transition-opacity">
                    <Save size={18} />
                    Save Changes
                </button>
            </header>

            <div className="flex flex-col md:flex-row gap-8">
                {/* Sidebar Navigation */}
                <aside className="w-full md:w-64 flex flex-col gap-2">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-3 px-6 py-4 rounded-2xl font-bold transition-all text-sm ${activeTab === tab.id
                                ? "bg-foreground text-background shadow-lg"
                                : "bg-secondary/30 text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                                }`}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </aside>

                {/* Content Area */}
                <main className="flex-1 glass border border-border rounded-3xl p-8 md:p-12 min-h-[600px] relative overflow-hidden">
                    <div className="japanese-dot-grid absolute inset-0 opacity-10 pointer-events-none" />

                    <div className="relative z-10">
                        {activeTab === "personal" && <PersonalInfoSection />}
                        {activeTab === "eeo" && <EEOSection />}
                        {activeTab === "learned" && <LearnedSection />}
                        {["education", "experience", "skills"].includes(activeTab) && (
                            <div className="flex flex-col items-center justify-center h-96 text-center space-y-4">
                                <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center text-muted-foreground">
                                    <Layout size={32} />
                                </div>
                                <h3 className="text-xl font-bold capitalize">{activeTab} Management</h3>
                                <p className="text-muted-foreground max-w-sm">This section is synced with your primary resume. You can add or remove items here to update your global profile.</p>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}

function PersonalInfoSection() {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Full Name</label>
                    <div className="relative group">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-foreground transition-colors" size={18} />
                        <input defaultValue="Mangesh Raut" className="w-full bg-secondary/30 border border-border rounded-xl py-4 pl-12 pr-4 focus:outline-hidden focus:ring-2 focus:ring-foreground/10" />
                    </div>
                </div>
                <div className="space-y-4">
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Email Address</label>
                    <div className="relative group">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-foreground transition-colors" size={18} />
                        <input defaultValue="mbr63drexel@gmail.com" className="w-full bg-secondary/30 border border-border rounded-xl py-4 pl-12 pr-4 focus:outline-hidden focus:ring-2 focus:ring-foreground/10" />
                    </div>
                </div>
                <div className="space-y-4">
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Phone Number</label>
                    <div className="relative group">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-foreground transition-colors" size={18} />
                        <input defaultValue="+16095053500" className="w-full bg-secondary/30 border border-border rounded-xl py-4 pl-12 pr-4 focus:outline-hidden focus:ring-2 focus:ring-foreground/10" />
                    </div>
                </div>
                <div className="space-y-4">
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Location</label>
                    <div className="relative group">
                        <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-foreground transition-colors" size={18} />
                        <input defaultValue="Philadelphia, PA" className="w-full bg-secondary/30 border border-border rounded-xl py-4 pl-12 pr-4 focus:outline-hidden focus:ring-2 focus:ring-foreground/10" />
                    </div>
                </div>
                <div className="space-y-4">
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">LinkedIn URL</label>
                    <div className="relative group">
                        <Linkedin className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-foreground transition-colors" size={18} />
                        <input defaultValue="https://linkedin.com/in/mangeshraut71298" className="w-full bg-secondary/30 border border-border rounded-xl py-4 pl-12 pr-4 focus:outline-hidden focus:ring-2 focus:ring-foreground/10" />
                    </div>
                </div>
                <div className="space-y-4">
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Portfolio Portfolio</label>
                    <div className="relative group">
                        <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-foreground transition-colors" size={18} />
                        <input defaultValue="https://mangeshraut.pro" className="w-full bg-secondary/30 border border-border rounded-xl py-4 pl-12 pr-4 focus:outline-hidden focus:ring-2 focus:ring-foreground/10" />
                    </div>
                </div>
            </div>
        </div>
    );
}

function EEOSection() {
    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-6">
                <h2 className="text-2xl font-bold">Standard Questions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <SelectField label="Are you authorized to work in the US?" options={["Yes", "No"]} />
                    <SelectField label="Will you require sponsorship?" options={["Yes", "No"]} />
                </div>
            </div>

            <div className="space-y-6">
                <h2 className="text-2xl font-bold">Diversity & Inclusion (EEO)</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <SelectField label="Gender" options={["Male", "Female", "Non-binary", "Decline to state"]} />
                    <SelectField label="Ethnicity/Race" options={["Asian", "White", "Black", "Hispanic", "Two or more", "Decline"]} />
                    <SelectField label="Hispanic/Latino" options={["No", "Yes", "Decline"]} />
                    <SelectField label="Veteran Status" options={["No", "Yes", "Decline"]} />
                    <SelectField label="Disability Status" options={["No", "Yes", "Decline"]} />
                    <SelectField label="Sexual Orientation" options={["Heterosexual", "LGBTQ+", "Decline"]} />
                </div>
            </div>
        </div>
    );
}

function LearnedSection() {
    const questions = [
        { q: "How many years of experience do you have with Python?", a: "4 years" },
        { q: "Are you willing to relocate?", a: "Yes" },
        { q: "What is your target salary?", a: "$150,000 - $180,000" },
    ];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Learned Q&A</h2>
                <button className="text-xs font-bold uppercase tracking-widest bg-secondary px-4 py-2 rounded-lg hover:bg-secondary/80">Add New</button>
            </div>
            <p className="text-sm text-muted-foreground italic">These questions were automatically detected and saved from your previous application attempts. Our AI agent uses these as a fallback for future applications.</p>
            <div className="space-y-4">
                {questions.map((item, i) => (
                    <div key={i} className="p-6 rounded-2xl bg-secondary/20 border border-border group hover:border-foreground/10 transition-colors">
                        <div className="flex justify-between items-start">
                            <p className="font-bold text-sm tracking-tight">{item.q}</p>
                            <button className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity">
                                <Plus size={14} className="rotate-45" />
                            </button>
                        </div>
                        <input defaultValue={item.a} className="mt-2 w-full bg-transparent border-none p-0 text-sm text-muted-foreground focus:ring-0" />
                    </div>
                ))}
            </div>
        </div>
    );
}

function SelectField({ label, options }: { label: string; options: string[] }) {
    return (
        <div className="space-y-3">
            <label className="text-sm font-medium text-muted-foreground">{label}</label>
            <div className="relative">
                <select className="w-full bg-secondary/30 border border-border rounded-xl py-4 px-4 focus:outline-hidden focus:ring-2 focus:ring-foreground/10 appearance-none cursor-pointer">
                    {options.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                    ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                    <Plus size={14} className="rotate-45" />
                </div>
            </div>
        </div>
    );
}
