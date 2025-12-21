"use client";

import React, { useState } from "react";
import { User, Mail, Phone, MapPin, Globe, Linkedin, Briefcase, GraduationCap, Code, Save, RefreshCw } from "lucide-react";

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

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setProfile((prev: ProfileData) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            console.log("Profile saved:", profile);
            alert("Profile saved successfully!");
        } catch (error) {
            console.error("Save error:", error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-12 pb-20">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                    <div className="w-24 h-24 rounded-3xl bg-foreground/5 flex items-center justify-center border border-border">
                        <User size={48} className="text-foreground/20" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight">{profile.name}</h1>
                        <p className="text-muted-foreground">{profile.location} • {profile.email}</p>
                    </div>
                </div>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-foreground text-background px-8 py-4 rounded-full font-bold flex items-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 shadow-xl"
                >
                    {isSaving ? <RefreshCw size={18} className="animate-spin" /> : <Save size={18} />}
                    {isSaving ? "Saving..." : "Save Profile"}
                </button>
            </header>

            <div className="flex border-b border-border gap-8 overflow-x-auto no-scrollbar">
                <TabLink active={activeTab === "personal"} onClick={() => setActiveTab("personal")} label="Personal Info" />
                <TabLink active={activeTab === "experience"} onClick={() => setActiveTab("experience")} label="Experience" />
                <TabLink active={activeTab === "education"} onClick={() => setActiveTab("education")} label="Education" />
                <TabLink active={activeTab === "skills"} onClick={() => setActiveTab("skills")} label="Skills & Summary" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2 space-y-8">
                    {activeTab === "personal" && <PersonalInfoSection data={profile} onChange={handleInputChange} />}
                    {activeTab === "experience" && <ExperienceSection data={profile.experience} />}
                    {activeTab === "education" && <EducationSection data={profile.education} />}
                    {activeTab === "skills" && <SkillsSection skills={profile.skills} summary={profile.summary} onChange={handleInputChange} />}
                </div>

                <div className="space-y-6">
                    <div className="glass p-8 rounded-3xl border border-border space-y-6">
                        <h3 className="font-bold text-lg">Profile Completeness</h3>
                        <div className="space-y-2">
                            <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                                <div className="h-full bg-foreground w-[85%]" />
                            </div>
                            <p className="text-sm text-muted-foreground font-medium">85% Complete</p>
                        </div>
                        <ul className="space-y-3">
                            <CompletenessItem label="Full Name" done />
                            <CompletenessItem label="Contact Details" done />
                            <CompletenessItem label="Work Experience" done />
                            <CompletenessItem label="Education" done />
                            <CompletenessItem label="Portfolio Link" />
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}

function TabLink({ active, onClick, label }: { active: boolean, onClick: () => void, label: string }) {
    return (
        <button
            onClick={onClick}
            className={`pb-4 px-2 font-bold text-sm transition-all relative ${active ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
        >
            {label}
            {active && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground" />}
        </button>
    );
}

function CompletenessItem({ label, done = false }: { label: string, done?: boolean }) {
    return (
        <li className="flex items-center gap-3 text-sm">
            <div className={`w-4 h-4 rounded-full border ${done ? 'bg-foreground border-foreground' : 'border-border'}`} />
            <span className={done ? 'text-foreground' : 'text-muted-foreground'}>{label}</span>
        </li>
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
                <InputField icon={<Mail size={18} />} label="Email Address" name="email" value={data.email} onChange={onChange} />
                <InputField icon={<Phone size={18} />} label="Phone Number" name="phone" value={data.phone} onChange={onChange} />
                <InputField icon={<MapPin size={18} />} label="Location" name="location" value={data.location} onChange={onChange} />
                <InputField icon={<Linkedin size={18} />} label="LinkedIn URL" name="linkedin" value={data.linkedin} onChange={onChange} />
                <InputField icon={<Globe size={18} />} label="Personal Website" name="website" value={data.website} onChange={onChange} />
            </div>
        </div>
    );
}

function InputField({ icon, label, name, value, onChange }: { icon: React.ReactNode, label: string, name: string, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void }) {
    return (
        <div className="space-y-2">
            <label className="text-sm font-bold text-muted-foreground ml-1">{label}</label>
            <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-foreground transition-colors">
                    {icon}
                </div>
                <input
                    type="text"
                    name={name}
                    value={value}
                    onChange={onChange}
                    className="w-full bg-secondary/30 border border-border rounded-2xl py-3 pl-12 pr-4 focus:outline-hidden focus:ring-2 focus:ring-foreground/10 transition-all font-medium"
                />
            </div>
        </div>
    );
}

function ExperienceSection({ data }: { data: Experience[] }) {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Briefcase size={24} />
                    Work Experience
                </h2>
                <button className="text-sm font-bold text-foreground/60 hover:text-foreground transition-colors">+ Add Experience</button>
            </div>
            <div className="space-y-4">
                {data.map((exp, idx) => (
                    <div key={idx} className="p-6 rounded-3xl border border-border bg-secondary/20 space-y-3">
                        <div className="flex justify-between items-start">
                            <div>
                                <h4 className="font-bold text-lg">{exp.role}</h4>
                                <p className="text-muted-foreground font-medium">{exp.company}</p>
                            </div>
                            <span className="text-xs font-bold px-3 py-1 bg-foreground/5 rounded-full">{exp.duration}</span>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed italic line-clamp-2">
                            &quot;{exp.description}&quot;
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}

function EducationSection({ data }: { data: Education[] }) {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                    <GraduationCap size={24} />
                    Education
                </h2>
                <button className="text-sm font-bold text-foreground/60 hover:text-foreground transition-colors">+ Add Education</button>
            </div>
            <div className="space-y-4">
                {data.map((edu, idx) => (
                    <div key={idx} className="p-6 rounded-3xl border border-border bg-secondary/20 space-y-2">
                        <div className="flex justify-between items-start">
                            <h4 className="font-bold text-lg">{edu.institution}</h4>
                            <span className="text-xs font-bold px-3 py-1 bg-foreground/5 rounded-full">{edu.graduation_year}</span>
                        </div>
                        <p className="text-muted-foreground font-medium">{edu.degree}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

function SkillsSection({ skills, summary, onChange }: { skills: string[], summary: string, onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void }) {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <div className="space-y-6">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Code size={24} />
                    Technical Skills
                </h2>
                <div className="flex flex-wrap gap-3">
                    {skills.map((skill, idx) => (
                        <span key={idx} className="px-4 py-2 bg-foreground/5 border border-border rounded-xl text-sm font-bold hover:bg-foreground/10 transition-colors cursor-default">
                            {skill}
                        </span>
                    ))}
                    <button className="px-4 py-2 border border-dashed border-border rounded-xl text-sm font-bold text-muted-foreground hover:border-foreground/20 hover:text-foreground transition-all">
                        + Add Skill
                    </button>
                </div>
            </div>

            <div className="space-y-4">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Briefcase size={24} />
                    Professional Summary
                </h2>
                <textarea
                    name="summary"
                    value={summary}
                    onChange={onChange}
                    rows={6}
                    className="w-full bg-secondary/30 border border-border rounded-3xl p-6 md:p-8 text-sm text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-foreground/10 transition-all resize-none leading-relaxed italic"
                />
            </div>
        </div>
    );
}
