"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
    User, GraduationCap, Briefcase, Code, ShieldCheck,
    Save, Globe, Linkedin, Mail, Phone, Layout,
    Plus, FileUp, Loader2, Sparkles, Building2
} from "lucide-react";
import axios from "axios";
import API_URL from "@/lib/api";

interface ProfileData {
    name: string;
    email: string;
    phone: string;
    location: string;
    linkedin: string;
    website: string;
    experience: any[];
    education: any[];
    skills: string[];
    summary: string;
}

export default function ProfilePage() {
    const [activeTab, setActiveTab] = useState("personal");
    const [isParsing, setIsParsing] = useState(false);
    const [profile, setProfile] = useState<ProfileData>({
        name: "Mangesh Raut",
        email: "mbr63drexel@gmail.com",
        phone: "+16095053500",
        location: "Philadelphia, PA",
        linkedin: "https://linkedin.com/in/mangeshraut71298",
        website: "https://mangeshraut.pro",
        experience: [
            { company: "Customized Energy Solutions", role: "Software Engineer", duration: "2024 - 2025", description: "Developed and optimized cloud-native energy trading platforms." }
        ],
        education: [
            { institution: "Drexel University", degree: "MS CS", graduation_year: 2023 }
        ],
        skills: ["React", "TypeScript", "Python", "Java", "Next.js", "Docker"],
        summary: "Forward-thinking Software Engineer with experience in full-stack development and cloud-native architectures."
    });

    const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsParsing(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await axios.post(`${API_URL}/parse-resume`, formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            const data = response.data;
            setProfile(prev => ({
                ...prev,
                name: data.name || prev.name,
                email: data.email || prev.email,
                phone: data.phone || prev.phone,
                location: data.location || prev.location,
                linkedin: data.linkedin || prev.linkedin,
                website: data.website || prev.website,
                summary: data.summary || prev.summary,
                experience: data.experience || prev.experience,
                education: data.education || prev.education,
                skills: data.skills || (data.skills?.length > 0 ? data.skills : prev.skills),
            }));
            alert("Profile synced successfully from resume!");
        } catch (error) {
            console.error("Parsing error:", error);
            alert("Failed to parse resume. Please ensure the backend is running.");
        } finally {
            setIsParsing(false);
        }
    };

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
                <div className="flex-1">
                    <h1 className="text-4xl font-bold tracking-tight">Your Profile</h1>
                    <p className="text-muted-foreground mt-2">Manage your core identity data used for AI enhancements and autofills.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <input
                            type="file"
                            onChange={handleResumeUpload}
                            accept=".pdf,.docx"
                            className="hidden"
                            id="resume-sync"
                            disabled={isParsing}
                        />
                        <label
                            htmlFor="resume-sync"
                            className={`px-6 py-3 rounded-full font-bold flex items-center gap-2 transition-all cursor-pointer border border-border group ${isParsing ? "bg-secondary text-muted-foreground" : "bg-secondary/50 text-foreground hover:bg-secondary"
                                }`}
                        >
                            {isParsing ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} className="text-amber-500 group-hover:scale-125 transition-transform" />}
                            {isParsing ? "Analyzing Strategy..." : "Sync from Resume"}
                        </label>
                    </div>
                    <button className="bg-foreground text-background px-8 py-3 rounded-full font-bold flex items-center gap-2 hover:opacity-90 transition-opacity">
                        <Save size={18} />
                        Save Changes
                    </button>
                </div>
            </header>

            <div className="flex flex-col md:flex-row gap-8">
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

                <main className="flex-1 glass border border-border rounded-3xl p-8 md:p-12 min-h-[600px] relative overflow-hidden">
                    <div className="japanese-dot-grid absolute inset-0 opacity-10 pointer-events-none" />
                    <div className="relative z-10">
                        {activeTab === "personal" && <PersonalInfoSection data={profile} onChange={(newData) => setProfile(prev => ({ ...prev, ...newData }))} />}
                        {activeTab === "education" && <EducationSection data={profile.education} />}
                        {activeTab === "experience" && <ExperienceSection data={profile.experience} />}
                        {activeTab === "skills" && <SkillsSection data={profile.skills} />}
                        {activeTab === "eeo" && <EEOSection />}
                        {activeTab === "learned" && <LearnedSection />}
                    </div>
                </main>
            </div>
        </div>
    );
}

function PersonalInfoSection({ data, onChange }: { data: ProfileData, onChange: (d: any) => void }) {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Full Name</label>
                    <div className="relative group">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-foreground transition-colors" size={18} />
                        <input
                            value={data.name}
                            onChange={(e) => onChange({ name: e.target.value })}
                            className="w-full bg-secondary/30 border border-border rounded-xl py-4 pl-12 pr-4 focus:outline-hidden focus:ring-2 focus:ring-foreground/10"
                        />
                    </div>
                </div>
                <div className="space-y-4">
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Email Address</label>
                    <div className="relative group">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-foreground transition-colors" size={18} />
                        <input
                            value={data.email}
                            onChange={(e) => onChange({ email: e.target.value })}
                            className="w-full bg-secondary/30 border border-border rounded-xl py-4 pl-12 pr-4 focus:outline-hidden focus:ring-2 focus:ring-foreground/10"
                        />
                    </div>
                </div>
                <div className="space-y-4">
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Phone Number</label>
                    <div className="relative group">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-foreground transition-colors" size={18} />
                        <input
                            value={data.phone}
                            onChange={(e) => onChange({ phone: e.target.value })}
                            className="w-full bg-secondary/30 border border-border rounded-xl py-4 pl-12 pr-4 focus:outline-hidden focus:ring-2 focus:ring-foreground/10"
                        />
                    </div>
                </div>
                <div className="space-y-4">
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Location</label>
                    <div className="relative group">
                        <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-foreground transition-colors" size={18} />
                        <input
                            value={data.location}
                            onChange={(e) => onChange({ location: e.target.value })}
                            className="w-full bg-secondary/30 border border-border rounded-xl py-4 pl-12 pr-4 focus:outline-hidden focus:ring-2 focus:ring-foreground/10"
                        />
                    </div>
                </div>
                <div className="space-y-4">
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">LinkedIn URL</label>
                    <div className="relative group">
                        <Linkedin className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-foreground transition-colors" size={18} />
                        <input
                            value={data.linkedin}
                            onChange={(e) => onChange({ linkedin: e.target.value })}
                            className="w-full bg-secondary/30 border border-border rounded-xl py-4 pl-12 pr-4 focus:outline-hidden focus:ring-2 focus:ring-foreground/10"
                        />
                    </div>
                </div>
                <div className="space-y-4">
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Portfolio Portfolio</label>
                    <div className="relative group">
                        <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-foreground transition-colors" size={18} />
                        <input
                            value={data.website}
                            onChange={(e) => onChange({ website: e.target.value })}
                            className="w-full bg-secondary/30 border border-border rounded-xl py-4 pl-12 pr-4 focus:outline-hidden focus:ring-2 focus:ring-foreground/10"
                        />
                    </div>
                </div>
            </div>
            <div className="space-y-4">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Summary</label>
                <textarea
                    value={data.summary}
                    onChange={(e) => onChange({ summary: e.target.value })}
                    className="w-full bg-secondary/30 border border-border rounded-xl py-4 px-4 h-32 focus:outline-hidden focus:ring-2 focus:ring-foreground/10 resize-none"
                />
            </div>
        </div>
    );
}

function ExperienceSection({ data }: { data: any[] }) {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Experience</h2>
                <button className="text-xs font-bold uppercase tracking-widest bg-secondary px-4 py-2 rounded-lg hover:bg-secondary/80 flex items-center gap-2">
                    <Plus size={14} /> Add Role
                </button>
            </div>
            <div className="space-y-4">
                {data.map((role, i) => (
                    <div key={i} className="p-6 rounded-2xl bg-secondary/20 border border-border space-y-3">
                        <div className="flex justify-between items-start">
                            <div>
                                <h4 className="font-bold text-lg">{role.role}</h4>
                                <p className="text-muted-foreground text-sm flex items-center gap-2">
                                    <Building2 size={14} /> {role.company} • {role.duration}
                                </p>
                            </div>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">{role.description || "No description provided."}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

function EducationSection({ data }: { data: any[] }) {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Education</h2>
                <button className="text-xs font-bold uppercase tracking-widest bg-secondary px-4 py-2 rounded-lg hover:bg-secondary/80 flex items-center gap-2">
                    <Plus size={14} /> Add Education
                </button>
            </div>
            <div className="space-y-4">
                {data.map((edu, i) => (
                    <div key={i} className="p-6 rounded-2xl bg-secondary/20 border border-border">
                        <h4 className="font-bold text-lg">{edu.degree}</h4>
                        <p className="text-muted-foreground text-sm">{edu.institution} • Class of {edu.graduation_year}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

function SkillsSection({ data }: { data: string[] }) {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-2xl font-bold">Skills</h2>
            <div className="flex flex-wrap gap-3">
                {data.map((skill, i) => (
                    <span key={skill} className="px-6 py-3 rounded-full bg-foreground text-background font-bold text-sm tracking-tight cursor-default hover:scale-105 transition-transform">
                        {skill}
                    </span>
                ))}
                <button className="px-6 py-3 rounded-full border border-dashed border-border text-muted-foreground hover:border-foreground/20 hover:text-foreground transition-all flex items-center gap-2 font-bold text-sm">
                    <Plus size={14} /> Add Skill
                </button>
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
            <p className="text-sm text-muted-foreground italic">These questions were automatically detected and saved from your previous application attempts.</p>
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
