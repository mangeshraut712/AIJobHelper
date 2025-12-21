"use client";

import React, { useState, useRef } from "react";
import { User, Mail, Phone, MapPin, Globe, Linkedin, Briefcase, GraduationCap, Code, Save, RefreshCw, Upload, Brain, Sparkles, CheckCircle2, Plus, Trash2, Edit3, FileText, ArrowRight, Target, Zap, Calendar, X } from "lucide-react";
import axios from "axios";
import API_URL from "@/lib/api";
import Link from "next/link";

interface Experience {
    id: string;
    company: string;
    role: string;
    duration: string;
    description: string;
}

interface Education {
    id: string;
    institution: string;
    degree: string;
    graduation_year: string;
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

// Generate unique ID
const generateId = () => Math.random().toString(36).substr(2, 9);

// Empty profile template
const EMPTY_PROFILE: ProfileData = {
    name: "",
    email: "",
    phone: "",
    location: "",
    linkedin: "",
    website: "",
    experience: [],
    education: [],
    skills: [],
    summary: ""
};

export default function ProfilePage() {
    const [activeTab, setActiveTab] = useState("personal");
    const [isSaving, setIsSaving] = useState(false);
    const [isParsing, setIsParsing] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [newSkill, setNewSkill] = useState("");
    const [editingExpId, setEditingExpId] = useState<string | null>(null);
    const [editingEduId, setEditingEduId] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Load from localStorage or start empty
    const [profile, setProfile] = useState<ProfileData>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('careerAgentProfile');
            if (saved) {
                try {
                    return JSON.parse(saved);
                } catch {
                    return EMPTY_PROFILE;
                }
            }
        }
        return EMPTY_PROFILE;
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
            // Save to localStorage
            localStorage.setItem('careerAgentProfile', JSON.stringify(profile));

            // Also try to save to backend
            try {
                await axios.post(`${API_URL}/profile`, profile);
            } catch (e) {
                console.log("Backend save skipped:", e);
            }

            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (error) {
            console.error("Save error:", error);
            alert("Failed to save profile");
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

            // Update profile with parsed data
            setProfile(prev => ({
                ...prev,
                name: parsed.name || prev.name,
                email: parsed.email || prev.email,
                phone: parsed.phone || prev.phone,
                location: parsed.location || prev.location,
                linkedin: parsed.linkedin || prev.linkedin,
                website: parsed.website || prev.website,
                experience: parsed.experience?.map((exp: Partial<Experience>) => ({
                    id: generateId(),
                    company: exp.company || "",
                    role: exp.role || "",
                    duration: exp.duration || "",
                    description: exp.description || ""
                })) || prev.experience,
                education: parsed.education?.map((edu: Partial<Education>) => ({
                    id: generateId(),
                    institution: edu.institution || "",
                    degree: edu.degree || "",
                    graduation_year: String(edu.graduation_year || "")
                })) || prev.education,
                skills: parsed.skills || prev.skills,
                summary: parsed.summary || prev.summary,
            }));

            alert("Resume parsed successfully! Review and edit the extracted information.");
        } catch (error) {
            console.error("Resume parsing error:", error);
            alert("Failed to parse resume. Please ensure the backend is running at " + API_URL);
        } finally {
            setIsParsing(false);
            // Reset file input
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    // Skills CRUD
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

    // Experience CRUD
    const addExperience = () => {
        const newExp: Experience = {
            id: generateId(),
            company: "",
            role: "",
            duration: "",
            description: ""
        };
        setProfile(prev => ({
            ...prev,
            experience: [...prev.experience, newExp]
        }));
        setEditingExpId(newExp.id);
    };

    const updateExperience = (id: string, field: keyof Experience, value: string) => {
        setProfile(prev => ({
            ...prev,
            experience: prev.experience.map(exp =>
                exp.id === id ? { ...exp, [field]: value } : exp
            )
        }));
    };

    const deleteExperience = (id: string) => {
        if (confirm("Are you sure you want to delete this experience?")) {
            setProfile(prev => ({
                ...prev,
                experience: prev.experience.filter(exp => exp.id !== id)
            }));
        }
    };

    // Education CRUD
    const addEducation = () => {
        const newEdu: Education = {
            id: generateId(),
            institution: "",
            degree: "",
            graduation_year: ""
        };
        setProfile(prev => ({
            ...prev,
            education: [...prev.education, newEdu]
        }));
        setEditingEduId(newEdu.id);
    };

    const updateEducation = (id: string, field: keyof Education, value: string) => {
        setProfile(prev => ({
            ...prev,
            education: prev.education.map(edu =>
                edu.id === id ? { ...edu, [field]: value } : edu
            )
        }));
    };

    const deleteEducation = (id: string) => {
        if (confirm("Are you sure you want to delete this education entry?")) {
            setProfile(prev => ({
                ...prev,
                education: prev.education.filter(edu => edu.id !== id)
            }));
        }
    };

    // Clear all data
    const clearProfile = () => {
        if (confirm("Are you sure you want to clear all profile data? This cannot be undone.")) {
            setProfile(EMPTY_PROFILE);
            localStorage.removeItem('careerAgentProfile');
        }
    };

    const completeness = calculateCompleteness(profile);

    return (
        <div className="max-w-6xl mx-auto space-y-12 pb-20">
            {/* Header */}
            <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                    <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-orange-500/25">
                        {profile.name ? profile.name.split(' ').map(n => n[0]).join('').toUpperCase() : <User size={40} />}
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <div className={`w-2 h-2 rounded-full ${completeness > 50 ? 'bg-green-500' : 'bg-yellow-500'} animate-pulse`} />
                            <span className={`text-xs font-medium ${completeness > 50 ? 'text-green-500' : 'text-yellow-500'}`}>
                                {completeness > 50 ? 'Profile Active' : 'Incomplete Profile'}
                            </span>
                        </div>
                        <h1 className="text-4xl font-bold tracking-tight">{profile.name || "Your Profile"}</h1>
                        <p className="text-muted-foreground flex items-center gap-2 flex-wrap">
                            {profile.location && <span className="flex items-center gap-1"><MapPin size={14} /> {profile.location}</span>}
                            {profile.location && profile.email && <span>•</span>}
                            {profile.email && <span className="flex items-center gap-1"><Mail size={14} /> {profile.email}</span>}
                            {!profile.name && !profile.email && <span>Fill in your details below</span>}
                        </p>
                    </div>
                </div>
                <div className="flex gap-3 flex-wrap">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.doc,.docx,.txt"
                        onChange={handleFileUpload}
                        className="hidden"
                    />
                    <button
                        onClick={clearProfile}
                        className="bg-red-500/10 text-red-500 px-4 py-3 rounded-full font-bold flex items-center gap-2 hover:bg-red-500/20 transition-colors"
                    >
                        <Trash2 size={18} />
                        Clear All
                    </button>
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
                        <h3 className="font-bold text-lg mb-1">AI-Powered Resume Parser</h3>
                        <p className="text-muted-foreground text-sm leading-relaxed max-w-lg">
                            Upload your resume (PDF, DOC, DOCX, or TXT) and our AI will automatically extract your information.
                            <strong className="text-foreground"> All fields are fully editable</strong> - you have complete control!
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-6 py-3 bg-orange-500 text-white rounded-full font-bold flex items-center gap-2 hover:opacity-90 transition-opacity whitespace-nowrap shadow-lg"
                >
                    <Sparkles size={18} />
                    Parse Resume
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
                    {activeTab === "experience" && (
                        <ExperienceSection
                            data={profile.experience}
                            onAdd={addExperience}
                            onUpdate={updateExperience}
                            onDelete={deleteExperience}
                            editingId={editingExpId}
                            setEditingId={setEditingExpId}
                        />
                    )}
                    {activeTab === "education" && (
                        <EducationSection
                            data={profile.education}
                            onAdd={addEducation}
                            onUpdate={updateEducation}
                            onDelete={deleteEducation}
                            editingId={editingEduId}
                            setEditingId={setEditingEduId}
                        />
                    )}
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
                            <CompletenessItem label="Work Experience" done={profile.experience.length > 0 && !!profile.experience[0]?.company} />
                            <CompletenessItem label="Education" done={profile.education.length > 0 && !!profile.education[0]?.institution} />
                            <CompletenessItem label="Skills (3+)" done={profile.skills.length >= 3} />
                            <CompletenessItem label="Summary" done={profile.summary.length > 20} />
                        </ul>
                    </div>

                    {/* Quick Actions */}
                    <div className="space-y-4">
                        <h3 className="font-bold text-lg flex items-center gap-2">
                            <Zap size={20} />
                            Quick Actions
                        </h3>
                        <Link href="/resumes">
                            <ActionCard icon={<FileText size={20} />} title="Generate Resume" description="Create ATS-optimized resume" color="purple" />
                        </Link>
                        <Link href="/jobs">
                            <ActionCard icon={<Target size={20} />} title="Find Matching Jobs" description="AI-powered job matching" color="blue" />
                        </Link>
                        <Link href="/communication">
                            <ActionCard icon={<Mail size={20} />} title="Create Cover Letter" description="Personalized outreach" color="green" />
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
    if (profile.experience.length > 0 && profile.experience[0]?.company) score += 20;
    if (profile.education.length > 0 && profile.education[0]?.institution) score += 15;
    if (profile.skills.length >= 3) score += 20;
    if (profile.summary.length > 20) score += 15;
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
            <p className="text-muted-foreground text-sm">Fill in your contact details. All fields are editable.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField icon={<User size={18} />} label="Full Name" name="name" value={data.name} onChange={onChange} placeholder="John Doe" />
                <InputField icon={<Mail size={18} />} label="Email Address" name="email" value={data.email} onChange={onChange} type="email" placeholder="john@example.com" />
                <InputField icon={<Phone size={18} />} label="Phone Number" name="phone" value={data.phone} onChange={onChange} type="tel" placeholder="+1 (555) 123-4567" />
                <InputField icon={<MapPin size={18} />} label="Location" name="location" value={data.location} onChange={onChange} placeholder="San Francisco, CA" />
                <InputField icon={<Linkedin size={18} />} label="LinkedIn URL" name="linkedin" value={data.linkedin} onChange={onChange} type="url" placeholder="linkedin.com/in/johndoe" />
                <InputField icon={<Globe size={18} />} label="Personal Website" name="website" value={data.website} onChange={onChange} type="url" placeholder="johndoe.com" />
            </div>
        </div>
    );
}

function InputField({ icon, label, name, value, onChange, type = "text", placeholder = "" }: { icon: React.ReactNode, label: string, name: string, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void, type?: string, placeholder?: string }) {
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
                    placeholder={placeholder}
                    autoComplete={name === "email" ? "email" : name === "phone" ? "tel" : name === "name" ? "name" : "off"}
                    className="w-full bg-secondary/30 border border-border rounded-2xl py-3 pl-12 pr-4 focus:outline-hidden focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500/50 transition-all font-medium placeholder:text-muted-foreground/50"
                />
            </div>
        </div>
    );
}

function ExperienceSection({
    data,
    onAdd,
    onUpdate,
    onDelete,
    editingId,
    setEditingId
}: {
    data: Experience[],
    onAdd: () => void,
    onUpdate: (id: string, field: keyof Experience, value: string) => void,
    onDelete: (id: string) => void,
    editingId: string | null,
    setEditingId: (id: string | null) => void
}) {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <Briefcase size={24} />
                        Work Experience
                    </h2>
                    <p className="text-muted-foreground text-sm mt-1">Add your work history. Click on any card to edit.</p>
                </div>
                <button
                    onClick={onAdd}
                    className="px-4 py-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-full text-sm font-bold flex items-center gap-2 hover:opacity-90 transition-opacity shadow-lg"
                >
                    <Plus size={16} />
                    Add Experience
                </button>
            </div>

            {data.length === 0 ? (
                <div className="p-12 rounded-3xl border-2 border-dashed border-border text-center">
                    <Briefcase size={48} className="mx-auto text-muted-foreground/30 mb-4" />
                    <p className="text-muted-foreground">No work experience added yet.</p>
                    <button
                        onClick={onAdd}
                        className="mt-4 px-6 py-2 bg-secondary text-foreground rounded-full text-sm font-bold hover:bg-secondary/80 transition-colors"
                    >
                        Add Your First Experience
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {data.map((exp) => (
                        <div key={exp.id} className={`p-6 rounded-3xl border ${editingId === exp.id ? 'border-orange-500' : 'border-border'} bg-secondary/20 space-y-4 transition-colors`}>
                            {editingId === exp.id ? (
                                // Edit Mode
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-bold text-orange-500 uppercase tracking-widest">Editing</span>
                                        <button onClick={() => setEditingId(null)} className="p-2 hover:bg-secondary rounded-lg">
                                            <X size={16} />
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <input
                                            type="text"
                                            value={exp.role}
                                            onChange={(e) => onUpdate(exp.id, 'role', e.target.value)}
                                            placeholder="Job Title"
                                            className="bg-secondary/50 border border-border rounded-xl py-2 px-4 font-bold"
                                        />
                                        <input
                                            type="text"
                                            value={exp.company}
                                            onChange={(e) => onUpdate(exp.id, 'company', e.target.value)}
                                            placeholder="Company Name"
                                            className="bg-secondary/50 border border-border rounded-xl py-2 px-4"
                                        />
                                        <input
                                            type="text"
                                            value={exp.duration}
                                            onChange={(e) => onUpdate(exp.id, 'duration', e.target.value)}
                                            placeholder="e.g., Jan 2022 - Present"
                                            className="bg-secondary/50 border border-border rounded-xl py-2 px-4 md:col-span-2"
                                        />
                                    </div>
                                    <textarea
                                        value={exp.description}
                                        onChange={(e) => onUpdate(exp.id, 'description', e.target.value)}
                                        placeholder="Describe your responsibilities and achievements..."
                                        rows={3}
                                        className="w-full bg-secondary/50 border border-border rounded-xl py-2 px-4 resize-none"
                                    />
                                    <div className="flex justify-end gap-2">
                                        <button onClick={() => onDelete(exp.id)} className="px-4 py-2 text-red-500 hover:bg-red-500/10 rounded-lg text-sm font-medium">
                                            Delete
                                        </button>
                                        <button onClick={() => setEditingId(null)} className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-bold">
                                            Done
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                // View Mode
                                <div onClick={() => setEditingId(exp.id)} className="cursor-pointer">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-start gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center text-white font-bold shadow-lg shrink-0">
                                                {exp.company ? exp.company.charAt(0).toUpperCase() : <Briefcase size={20} />}
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
                                            <Edit3 size={14} className="text-muted-foreground" />
                                        </div>
                                    </div>
                                    {exp.description && (
                                        <p className="text-sm text-muted-foreground leading-relaxed mt-4 pl-16">{exp.description}</p>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function EducationSection({
    data,
    onAdd,
    onUpdate,
    onDelete,
    editingId,
    setEditingId
}: {
    data: Education[],
    onAdd: () => void,
    onUpdate: (id: string, field: keyof Education, value: string) => void,
    onDelete: (id: string) => void,
    editingId: string | null,
    setEditingId: (id: string | null) => void
}) {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <GraduationCap size={24} />
                        Education
                    </h2>
                    <p className="text-muted-foreground text-sm mt-1">Add your educational background. Click on any card to edit.</p>
                </div>
                <button
                    onClick={onAdd}
                    className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full text-sm font-bold flex items-center gap-2 hover:opacity-90 transition-opacity shadow-lg"
                >
                    <Plus size={16} />
                    Add Education
                </button>
            </div>

            {data.length === 0 ? (
                <div className="p-12 rounded-3xl border-2 border-dashed border-border text-center">
                    <GraduationCap size={48} className="mx-auto text-muted-foreground/30 mb-4" />
                    <p className="text-muted-foreground">No education added yet.</p>
                    <button
                        onClick={onAdd}
                        className="mt-4 px-6 py-2 bg-secondary text-foreground rounded-full text-sm font-bold hover:bg-secondary/80 transition-colors"
                    >
                        Add Your First Education
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {data.map((edu) => (
                        <div key={edu.id} className={`p-6 rounded-3xl border ${editingId === edu.id ? 'border-blue-500' : 'border-border'} bg-secondary/20 transition-colors`}>
                            {editingId === edu.id ? (
                                // Edit Mode
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-bold text-blue-500 uppercase tracking-widest">Editing</span>
                                        <button onClick={() => setEditingId(null)} className="p-2 hover:bg-secondary rounded-lg">
                                            <X size={16} />
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <input
                                            type="text"
                                            value={edu.degree}
                                            onChange={(e) => onUpdate(edu.id, 'degree', e.target.value)}
                                            placeholder="Degree (e.g., BS Computer Science)"
                                            className="bg-secondary/50 border border-border rounded-xl py-2 px-4 font-bold"
                                        />
                                        <input
                                            type="text"
                                            value={edu.institution}
                                            onChange={(e) => onUpdate(edu.id, 'institution', e.target.value)}
                                            placeholder="University/Institution"
                                            className="bg-secondary/50 border border-border rounded-xl py-2 px-4"
                                        />
                                        <input
                                            type="text"
                                            value={edu.graduation_year}
                                            onChange={(e) => onUpdate(edu.id, 'graduation_year', e.target.value)}
                                            placeholder="Graduation Year (e.g., 2024)"
                                            className="bg-secondary/50 border border-border rounded-xl py-2 px-4"
                                        />
                                    </div>
                                    <div className="flex justify-end gap-2">
                                        <button onClick={() => onDelete(edu.id)} className="px-4 py-2 text-red-500 hover:bg-red-500/10 rounded-lg text-sm font-medium">
                                            Delete
                                        </button>
                                        <button onClick={() => setEditingId(null)} className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-bold">
                                            Done
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                // View Mode
                                <div onClick={() => setEditingId(edu.id)} className="cursor-pointer flex justify-between items-center">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-lg shrink-0">
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
                                        <Edit3 size={14} className="text-muted-foreground" />
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
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
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <Code size={24} />
                        Technical Skills
                        <span className="text-sm font-normal text-muted-foreground ml-2">({skills.length} skills)</span>
                    </h2>
                    <p className="text-muted-foreground text-sm mt-1">Add skills and remove ones you don&apos;t need.</p>
                </div>

                {skills.length > 0 ? (
                    <div className="flex flex-wrap gap-3">
                        {skills.map((skill, idx) => (
                            <span
                                key={idx}
                                className="px-4 py-2 bg-gradient-to-r from-orange-500/10 to-pink-500/10 border border-orange-500/20 rounded-xl text-sm font-bold flex items-center gap-2 group hover:border-orange-500/40 transition-colors"
                            >
                                {skill}
                                <button
                                    onClick={() => removeSkill(skill)}
                                    className="opacity-50 group-hover:opacity-100 transition-opacity hover:text-red-500"
                                    title="Remove skill"
                                >
                                    <X size={14} />
                                </button>
                            </span>
                        ))}
                    </div>
                ) : (
                    <div className="p-8 rounded-2xl border-2 border-dashed border-border text-center">
                        <p className="text-muted-foreground">No skills added yet. Start typing below to add skills.</p>
                    </div>
                )}

                <div className="flex gap-3">
                    <input
                        type="text"
                        id="newSkill"
                        name="newSkill"
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                        placeholder="Type a skill and press Enter or click Add..."
                        className="flex-1 bg-secondary/30 border border-border rounded-2xl py-3 px-4 focus:outline-hidden focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500/50 transition-all font-medium"
                    />
                    <button
                        onClick={addSkill}
                        disabled={!newSkill.trim()}
                        className="px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-2xl font-bold flex items-center gap-2 hover:opacity-90 transition-opacity shadow-lg disabled:opacity-50"
                    >
                        <Plus size={18} />
                        Add
                    </button>
                </div>
            </div>

            {/* Summary */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                            <Briefcase size={24} />
                            Professional Summary
                        </h2>
                        <p className="text-muted-foreground text-sm mt-1">Write a compelling summary of your background.</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{summary.length}/500</span>
                </div>
                <textarea
                    id="summary"
                    name="summary"
                    value={summary}
                    onChange={onChange}
                    rows={6}
                    maxLength={500}
                    placeholder="Write a compelling summary of your professional background, key skills, and career goals. Example: Experienced software engineer with 5+ years building scalable web applications..."
                    className="w-full bg-secondary/30 border border-border rounded-3xl p-6 md:p-8 text-sm text-foreground focus:outline-hidden focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500/50 transition-all resize-none leading-relaxed placeholder:text-muted-foreground/50"
                />
            </div>
        </div>
    );
}
