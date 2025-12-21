"use client";

import React, { useState, useRef } from "react";
import { User, Mail, Phone, MapPin, Globe, Linkedin, Briefcase, GraduationCap, Code, Save, RefreshCw, Upload, Brain, Sparkles, CheckCircle2, Plus, Trash2, Edit3, FileText, ArrowRight, Target, Zap, Calendar, Building2 } from "lucide-react";
import axios from "axios";
import API_URL from "@/lib/api";
import Link from "next/link";

interface Experience {
    company: string;
    role: string;
    duration: string;
    description: string;
}

interface Education {
    institution: string;
    degree: string;
    graduation_year: number;
}

interface ProfileData {
    name: string;
    email: string;
    phone: string;
    location: string;
    linkedin: string;
    website: string;
    experience: Experience[];
    education: Education[];
    skills: string[];
    summary: string;
}

export default function ProfilePage() {
    const [activeTab, setActiveTab] = useState("personal");
    const [isSaving, setIsSaving] = useState(false);
    const [isParsing, setIsParsing] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [newSkill, setNewSkill] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [profile, setProfile] = useState<ProfileData>({
        name: "Mangesh Raut",
        email: "mbr63drexel@gmail.com",
        phone: "+1 (609) 505-3500",
        location: "Philadelphia, PA",
        linkedin: "linkedin.com/in/mangeshraut71298",
        website: "mangeshraut.pro",
        experience: [
            {
                company: "Customized Energy Solutions",
                role: "Software Engineer",
                duration: "2024 - Present",
                description: "Led full-stack development of energy trading platforms, improving system performance by 40% and reducing deployment time by 60% through CI/CD automation."
            },
            {
                company: "Drexel University",
                role: "Graduate Research Assistant",
                duration: "2022 - 2024",
                description: "Developed machine learning models for energy consumption prediction achieving 92% accuracy. Published research on sustainable computing."
            }
        ],
        education: [
            { institution: "Drexel University", degree: "MS Computer Science", graduation_year: 2024 },
            { institution: "Mumbai University", degree: "BE Information Technology", graduation_year: 2019 }
        ],
        skills: ["React", "TypeScript", "Python", "Java", "Next.js", "Docker", "AWS", "Node.js", "PostgreSQL"],
        summary: "Results-driven Software Engineer with 3+ years of experience building scalable web applications. Expert in React, TypeScript, Python, and cloud technologies. Proven track record of delivering high-impact features and optimizing system performance."
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setProfile((prev: ProfileData) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        setSaveSuccess(false);
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            // In production, this would save to the backend
            console.log("Profile saved:", profile);
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (error) {
            console.error("Save error:", error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsParsing(true);
        try {
            const formData = new FormData();
            formData.append("file", file);

            const response = await axios.post(`${API_URL}/parse-resume`, formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            const parsed = response.data;
            setProfile(prev => ({
                ...prev,
                name: parsed.name || prev.name,
                email: parsed.email || prev.email,
                phone: parsed.phone || prev.phone,
                location: parsed.location || prev.location,
                linkedin: parsed.linkedin || prev.linkedin,
                website: parsed.website || prev.website,
                experience: parsed.experience?.length ? parsed.experience : prev.experience,
                education: parsed.education?.length ? parsed.education : prev.education,
                skills: parsed.skills?.length ? parsed.skills : prev.skills,
                summary: parsed.summary || prev.summary,
            }));
        } catch (error) {
            console.log("Resume parsing error:", error);
            alert("Resume parsing requires backend connection. Using demo data.");
        } finally {
            setIsParsing(false);
        }
    };

    const addSkill = () => {
        if (newSkill.trim() && !profile.skills.includes(newSkill.trim())) {
            setProfile(prev => ({
                ...prev,
                skills: [...prev.skills, newSkill.trim()]
            }));
            setNewSkill("");
        }
    };

    const removeSkill = (skillToRemove: string) => {
        setProfile(prev => ({
            ...prev,
            skills: prev.skills.filter(s => s !== skillToRemove)
        }));
    };

    const addExperience = () => {
        setProfile(prev => ({
            ...prev,
            experience: [...prev.experience, { company: "", role: "", duration: "", description: "" }]
        }));
    };

    const addEducation = () => {
        setProfile(prev => ({
            ...prev,
            education: [...prev.education, { institution: "", degree: "", graduation_year: new Date().getFullYear() }]
        }));
    };

    const completeness = calculateCompleteness(profile);

    return (
        <div className="max-w-6xl mx-auto space-y-12 pb-20">
            {/* Header */}
            <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                    <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-orange-500/25">
                        {profile.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-xs font-medium text-green-500">Profile Active</span>
                        </div>
                        <h1 className="text-4xl font-bold tracking-tight">{profile.name}</h1>
                        <p className="text-muted-foreground flex items-center gap-2 flex-wrap">
                            <span className="flex items-center gap-1"><MapPin size={14} /> {profile.location}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1"><Mail size={14} /> {profile.email}</span>
                        </p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileUpload}
                        className="hidden"
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isParsing}
                        className="bg-secondary text-foreground px-6 py-3 rounded-full font-bold flex items-center gap-2 hover:bg-secondary/80 transition-colors disabled:opacity-50"
                    >
                        {isParsing ? <RefreshCw size={18} className="animate-spin" /> : <Upload size={18} />}
                        {isParsing ? "Parsing..." : "Upload Resume"}
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className={`${saveSuccess ? 'bg-green-600' : 'bg-gradient-to-r from-orange-500 to-pink-500'} text-white px-8 py-3 rounded-full font-bold flex items-center gap-2 hover:opacity-90 transition-all disabled:opacity-50 shadow-lg shadow-orange-500/25`}
                    >
                        {isSaving ? <RefreshCw size={18} className="animate-spin" /> : saveSuccess ? <CheckCircle2 size={18} /> : <Save size={18} />}
                        {isSaving ? "Saving..." : saveSuccess ? "Saved!" : "Save Profile"}
                    </button>
                </div>
            </header>

            {/* AI Resume Parser Banner */}
            <div className="p-6 rounded-3xl bg-gradient-to-br from-orange-500/10 to-pink-500/10 border border-orange-500/20 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-start gap-4">
                    <div className="p-3 rounded-2xl bg-orange-500/20">
                        <Brain size={24} className="text-orange-500" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg mb-1">AI-Powered Profile Builder</h3>
                        <p className="text-muted-foreground text-sm leading-relaxed max-w-lg">
                            Upload your resume and our AI will automatically extract your information, skills, and experience.
                            Save time and ensure accuracy with intelligent parsing.
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-6 py-3 bg-orange-500 text-white rounded-full font-bold flex items-center gap-2 hover:opacity-90 transition-opacity whitespace-nowrap shadow-lg"
                >
                    <Sparkles size={18} />
                    Auto-Fill from Resume
                </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-border gap-2 overflow-x-auto no-scrollbar">
                <TabLink active={activeTab === "personal"} onClick={() => setActiveTab("personal")} icon={<User size={16} />} label="Personal Info" />
                <TabLink active={activeTab === "experience"} onClick={() => setActiveTab("experience")} icon={<Briefcase size={16} />} label="Experience" />
                <TabLink active={activeTab === "education"} onClick={() => setActiveTab("education")} icon={<GraduationCap size={16} />} label="Education" />
                <TabLink active={activeTab === "skills"} onClick={() => setActiveTab("skills")} icon={<Code size={16} />} label="Skills & Summary" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">
                    {activeTab === "personal" && <PersonalInfoSection data={profile} onChange={handleInputChange} />}
                    {activeTab === "experience" && <ExperienceSection data={profile.experience} onAdd={addExperience} />}
                    {activeTab === "education" && <EducationSection data={profile.education} onAdd={addEducation} />}
                    {activeTab === "skills" && (
                        <SkillsSection
                            skills={profile.skills}
                            summary={profile.summary}
                            onChange={handleInputChange}
                            newSkill={newSkill}
                            setNewSkill={setNewSkill}
                            addSkill={addSkill}
                            removeSkill={removeSkill}
                        />
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Profile Completeness */}
                    <div className="glass p-8 rounded-3xl border border-border space-y-6">
                        <h3 className="font-bold text-lg flex items-center gap-2">
                            <Target size={20} />
                            Profile Completeness
                        </h3>
                        <div className="text-center space-y-3">
                            <div className="relative inline-flex items-center justify-center">
                                <svg className="w-28 h-28 transform -rotate-90">
                                    <circle className="text-secondary" strokeWidth="8" stroke="currentColor" fill="transparent" r="50" cx="56" cy="56" />
                                    <circle
                                        className={completeness >= 80 ? "text-green-500" : completeness >= 50 ? "text-yellow-500" : "text-orange-500"}
                                        strokeWidth="8"
                                        strokeLinecap="round"
                                        stroke="currentColor"
                                        fill="transparent"
                                        r="50"
                                        cx="56"
                                        cy="56"
                                        strokeDasharray={`${(completeness / 100) * 314} 314`}
                                    />
                                </svg>
                                <span className="absolute text-2xl font-bold">{completeness}%</span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                {completeness >= 80 ? "Looking great!" : completeness >= 50 ? "Almost there!" : "Keep building!"}
                            </p>
                        </div>
                        <ul className="space-y-3">
                            <CompletenessItem label="Full Name" done={!!profile.name} />
                            <CompletenessItem label="Contact Details" done={!!profile.email && !!profile.phone} />
                            <CompletenessItem label="Work Experience" done={profile.experience.length > 0 && !!profile.experience[0].company} />
                            <CompletenessItem label="Education" done={profile.education.length > 0} />
                            <CompletenessItem label="Skills (5+)" done={profile.skills.length >= 5} />
                            <CompletenessItem label="Summary" done={profile.summary.length > 50} />
                        </ul>
                    </div>

                    {/* Quick Actions */}
                    <div className="space-y-4">
                        <h3 className="font-bold text-lg flex items-center gap-2">
                            <Zap size={20} />
                            Quick Actions
                        </h3>
                        <Link href="/resumes">
                            <ActionCard
                                icon={<FileText size={20} />}
                                title="Generate Resume"
                                description="Create ATS-optimized resume"
                                color="purple"
                            />
                        </Link>
                        <Link href="/jobs">
                            <ActionCard
                                icon={<Target size={20} />}
                                title="Find Matching Jobs"
                                description="AI-powered job matching"
                                color="blue"
                            />
                        </Link>
                        <Link href="/communication">
                            <ActionCard
                                icon={<Mail size={20} />}
                                title="Create Cover Letter"
                                description="Personalized outreach"
                                color="green"
                            />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

function calculateCompleteness(profile: ProfileData): number {
    let score = 0;
    if (profile.name) score += 15;
    if (profile.email && profile.phone) score += 15;
    if (profile.experience.length > 0 && profile.experience[0].company) score += 20;
    if (profile.education.length > 0) score += 15;
    if (profile.skills.length >= 5) score += 20;
    if (profile.summary.length > 50) score += 15;
    return score;
}

function TabLink({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
    return (
        <button
            onClick={onClick}
            className={`pb-4 px-4 font-bold text-sm transition-all relative flex items-center gap-2 whitespace-nowrap ${active ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
        >
            {icon}
            {label}
            {active && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-orange-500 to-pink-500" />}
        </button>
    );
}

function CompletenessItem({ label, done = false }: { label: string, done?: boolean }) {
    return (
        <li className="flex items-center gap-3 text-sm">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center ${done ? 'bg-green-500' : 'bg-secondary border border-border'}`}>
                {done && <CheckCircle2 size={12} className="text-white" />}
            </div>
            <span className={done ? 'text-foreground' : 'text-muted-foreground'}>{label}</span>
        </li>
    );
}

function ActionCard({ icon, title, description, color }: { icon: React.ReactNode, title: string, description: string, color: string }) {
    const colorClasses: Record<string, string> = {
        purple: "from-purple-600 to-purple-400",
        blue: "from-blue-600 to-blue-400",
        green: "from-green-600 to-green-400",
        orange: "from-orange-600 to-orange-400",
    };

    return (
        <div className="p-4 rounded-2xl glass border border-border hover:border-foreground/20 transition-all group flex items-center gap-4 cursor-pointer">
            <div className={`p-3 rounded-xl bg-gradient-to-br ${colorClasses[color]} text-white shadow-lg group-hover:scale-110 transition-transform`}>
                {icon}
            </div>
            <div className="flex-1">
                <h4 className="font-bold text-sm">{title}</h4>
                <p className="text-xs text-muted-foreground">{description}</p>
            </div>
            <ArrowRight size={16} className="text-muted-foreground group-hover:text-foreground transition-colors" />
        </div>
    );
}

function PersonalInfoSection({ data, onChange }: { data: ProfileData, onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void }) {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <h2 className="text-2xl font-bold flex items-center gap-2">
                <User size={24} />
                Personal Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField icon={<User size={18} />} label="Full Name" name="name" value={data.name} onChange={onChange} />
                <InputField icon={<Mail size={18} />} label="Email Address" name="email" value={data.email} onChange={onChange} type="email" />
                <InputField icon={<Phone size={18} />} label="Phone Number" name="phone" value={data.phone} onChange={onChange} type="tel" />
                <InputField icon={<MapPin size={18} />} label="Location" name="location" value={data.location} onChange={onChange} />
                <InputField icon={<Linkedin size={18} />} label="LinkedIn URL" name="linkedin" value={data.linkedin} onChange={onChange} type="url" />
                <InputField icon={<Globe size={18} />} label="Personal Website" name="website" value={data.website} onChange={onChange} type="url" />
            </div>
        </div>
    );
}

function InputField({ icon, label, name, value, onChange, type = "text" }: { icon: React.ReactNode, label: string, name: string, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void, type?: string }) {
    return (
        <div className="space-y-2">
            <label htmlFor={name} className="text-sm font-bold text-muted-foreground ml-1">{label}</label>
            <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-foreground transition-colors">
                    {icon}
                </div>
                <input
                    type={type}
                    id={name}
                    name={name}
                    value={value}
                    onChange={onChange}
                    autoComplete={name === "email" ? "email" : name === "phone" ? "tel" : name === "name" ? "name" : "off"}
                    className="w-full bg-secondary/30 border border-border rounded-2xl py-3 pl-12 pr-4 focus:outline-hidden focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500/50 transition-all font-medium"
                />
            </div>
        </div>
    );
}

function ExperienceSection({ data, onAdd }: { data: Experience[], onAdd: () => void }) {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Briefcase size={24} />
                    Work Experience
                </h2>
                <button
                    onClick={onAdd}
                    className="px-4 py-2 bg-secondary text-foreground rounded-full text-sm font-bold flex items-center gap-2 hover:bg-secondary/80 transition-colors"
                >
                    <Plus size={16} />
                    Add Experience
                </button>
            </div>
            <div className="space-y-4">
                {data.map((exp, idx) => (
                    <div key={idx} className="p-6 rounded-3xl border border-border bg-secondary/20 space-y-4 group hover:border-orange-500/30 transition-colors">
                        <div className="flex justify-between items-start">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center text-white font-bold shadow-lg">
                                    {exp.company.charAt(0) || <Building2 size={20} />}
                                </div>
                                <div>
                                    <h4 className="font-bold text-lg">{exp.role || "Job Title"}</h4>
                                    <p className="text-muted-foreground font-medium">{exp.company || "Company Name"}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold px-3 py-1.5 bg-foreground/5 rounded-full flex items-center gap-1">
                                    <Calendar size={12} />
                                    {exp.duration || "Duration"}
                                </span>
                                <button className="p-2 rounded-lg hover:bg-secondary transition-colors opacity-0 group-hover:opacity-100">
                                    <Edit3 size={14} className="text-muted-foreground" />
                                </button>
                            </div>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed pl-16">
                            {exp.description || "Describe your responsibilities and achievements..."}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}

function EducationSection({ data, onAdd }: { data: Education[], onAdd: () => void }) {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                    <GraduationCap size={24} />
                    Education
                </h2>
                <button
                    onClick={onAdd}
                    className="px-4 py-2 bg-secondary text-foreground rounded-full text-sm font-bold flex items-center gap-2 hover:bg-secondary/80 transition-colors"
                >
                    <Plus size={16} />
                    Add Education
                </button>
            </div>
            <div className="space-y-4">
                {data.map((edu, idx) => (
                    <div key={idx} className="p-6 rounded-3xl border border-border bg-secondary/20 group hover:border-orange-500/30 transition-colors">
                        <div className="flex justify-between items-start">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-lg">
                                    <GraduationCap size={20} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-lg">{edu.degree || "Degree"}</h4>
                                    <p className="text-muted-foreground font-medium">{edu.institution || "Institution"}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold px-3 py-1.5 bg-foreground/5 rounded-full">
                                    {edu.graduation_year || "Year"}
                                </span>
                                <button className="p-2 rounded-lg hover:bg-secondary transition-colors opacity-0 group-hover:opacity-100">
                                    <Edit3 size={14} className="text-muted-foreground" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function SkillsSection({
    skills,
    summary,
    onChange,
    newSkill,
    setNewSkill,
    addSkill,
    removeSkill
}: {
    skills: string[],
    summary: string,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void,
    newSkill: string,
    setNewSkill: (s: string) => void,
    addSkill: () => void,
    removeSkill: (s: string) => void
}) {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
            {/* Skills */}
            <div className="space-y-6">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Code size={24} />
                    Technical Skills
                    <span className="text-sm font-normal text-muted-foreground ml-2">({skills.length} skills)</span>
                </h2>
                <div className="flex flex-wrap gap-3">
                    {skills.map((skill, idx) => (
                        <span
                            key={idx}
                            className="px-4 py-2 bg-gradient-to-r from-orange-500/10 to-pink-500/10 border border-orange-500/20 rounded-xl text-sm font-bold flex items-center gap-2 group hover:border-orange-500/40 transition-colors"
                        >
                            {skill}
                            <button
                                onClick={() => removeSkill(skill)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500"
                            >
                                <Trash2 size={14} />
                            </button>
                        </span>
                    ))}
                </div>
                <div className="flex gap-3">
                    <input
                        type="text"
                        id="newSkill"
                        name="newSkill"
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                        placeholder="Add a skill..."
                        className="flex-1 bg-secondary/30 border border-border rounded-2xl py-3 px-4 focus:outline-hidden focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500/50 transition-all font-medium"
                    />
                    <button
                        onClick={addSkill}
                        className="px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-2xl font-bold flex items-center gap-2 hover:opacity-90 transition-opacity shadow-lg"
                    >
                        <Plus size={18} />
                        Add
                    </button>
                </div>
            </div>

            {/* Summary */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <Briefcase size={24} />
                        Professional Summary
                    </h2>
                    <span className="text-xs text-muted-foreground">{summary.length}/500 characters</span>
                </div>
                <div className="relative">
                    <textarea
                        id="summary"
                        name="summary"
                        value={summary}
                        onChange={onChange}
                        rows={6}
                        maxLength={500}
                        placeholder="Write a compelling summary of your professional background, key skills, and career goals..."
                        className="w-full bg-secondary/30 border border-border rounded-3xl p-6 md:p-8 text-sm text-foreground focus:outline-hidden focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500/50 transition-all resize-none leading-relaxed"
                    />
                    <div className="absolute bottom-4 right-4 flex gap-2">
                        <button className="p-2 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground">
                            <Sparkles size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
