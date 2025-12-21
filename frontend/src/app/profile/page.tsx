"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import {
    User, Mail, Phone, MapPin, Globe, Linkedin, Github, Briefcase,
    GraduationCap, Code, Save, Upload, CheckCircle2, Plus,
    Edit3, X, Heart, ChevronRight, RefreshCw
} from "lucide-react";
import axios from "axios";
import API_URL from "@/lib/api";
import { AppleCard } from "@/components/ui/AppleCard";
import { useToast } from "@/components/ui/Toast";

interface Experience {
    id: string;
    company: string;
    role: string;
    location: string;
    startDate: string;
    endDate: string;
    type: string;
    description: string;
}

interface Education {
    id: string;
    institution: string;
    degree: string;
    field: string;
    startDate: string;
    endDate: string;
}

interface ProfileData {
    name: string;
    title: string;
    email: string;
    phone: string;
    location: string;
    linkedin: string;
    github: string;
    portfolio: string;
    jobSearchStatus: string;
    experience: Experience[];
    education: Education[];
    skills: string[];
    preferredSkills: string[];
    summary: string;
}

const generateId = () => Math.random().toString(36).substr(2, 9);

const EMPTY_PROFILE: ProfileData = {
    name: "",
    title: "",
    email: "",
    phone: "",
    location: "",
    linkedin: "",
    github: "",
    portfolio: "",
    jobSearchStatus: "actively_looking",
    experience: [],
    education: [],
    skills: [],
    preferredSkills: [],
    summary: ""
};

const navItems = [
    { id: "info", icon: User, label: "Personal Info" },
    { id: "experience", icon: Briefcase, label: "Experience" },
    { id: "education", icon: GraduationCap, label: "Education" },
    { id: "skills", icon: Code, label: "Skills" },
];

const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, ease: "easeOut" as const },
};

export default function ProfilePage() {
    const { toast } = useToast();
    const [activeSection, setActiveSection] = useState("info");
    const [isSaving, setIsSaving] = useState(false);
    const [isParsing, setIsParsing] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [editMode, setEditMode] = useState<string | null>(null);
    const [newSkill, setNewSkill] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [profile, setProfile] = useState<ProfileData>(EMPTY_PROFILE);

    useEffect(() => {
        const saved = localStorage.getItem("careerAgentProfile");
        if (saved) {
            try {
                setProfile(JSON.parse(saved));
            } catch {
                console.log("Failed to load profile");
            }
        }
    }, []);

    const handleInputChange = (field: string, value: string) => {
        setProfile(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        await new Promise(r => setTimeout(r, 500));
        localStorage.setItem("careerAgentProfile", JSON.stringify(profile));
        toast("Profile saved successfully!", "success");
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2000);
        setIsSaving(false);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setIsParsing(true);
        try {
            const formData = new FormData();
            formData.append("file", file);
            const response = await axios.post(`${API_URL}/parse-resume`, formData);
            const parsed = response.data;
            setProfile(prev => ({
                ...prev,
                name: parsed.name || prev.name,
                email: parsed.email || prev.email,
                phone: parsed.phone || prev.phone,
                location: parsed.location || prev.location,
                linkedin: parsed.linkedin || prev.linkedin,
                github: parsed.github || prev.github,
                skills: parsed.skills?.length ? parsed.skills : prev.skills,
                summary: parsed.summary || prev.summary,
            }));
            toast("Resume parsed successfully!", "success");
        } catch (error) {
            console.error("Parse error:", error);
            // Extract detailed error message from API response
            let errorMessage = "Failed to parse resume. Please try again.";
            if (axios.isAxiosError(error) && error.response?.data?.detail) {
                errorMessage = error.response.data.detail;
            }
            toast(errorMessage, "error");
        } finally {
            setIsParsing(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    // Experience CRUD
    const addExperience = () => {
        const newExp: Experience = { id: generateId(), company: "", role: "", location: "", startDate: "", endDate: "", type: "Full-time", description: "" };
        setProfile(prev => ({ ...prev, experience: [...prev.experience, newExp] }));
        setEditMode(`exp-${newExp.id}`);
    };

    const updateExperience = (id: string, field: keyof Experience, value: string) => {
        setProfile(prev => ({
            ...prev,
            experience: prev.experience.map(exp => exp.id === id ? { ...exp, [field]: value } : exp)
        }));
    };

    const deleteExperience = (id: string) => {
        setProfile(prev => ({ ...prev, experience: prev.experience.filter(exp => exp.id !== id) }));
    };

    // Education CRUD
    const addEducation = () => {
        const newEdu: Education = { id: generateId(), institution: "", degree: "", field: "", startDate: "", endDate: "" };
        setProfile(prev => ({ ...prev, education: [...prev.education, newEdu] }));
        setEditMode(`edu-${newEdu.id}`);
    };

    const updateEducation = (id: string, field: keyof Education, value: string) => {
        setProfile(prev => ({
            ...prev,
            education: prev.education.map(edu => edu.id === id ? { ...edu, [field]: value } : edu)
        }));
    };

    const deleteEducation = (id: string) => {
        setProfile(prev => ({ ...prev, education: prev.education.filter(edu => edu.id !== id) }));
    };

    // Skills
    const addSkill = () => {
        if (newSkill.trim() && !profile.skills.includes(newSkill.trim())) {
            setProfile(prev => ({ ...prev, skills: [...prev.skills, newSkill.trim()] }));
            setNewSkill("");
        }
    };

    const removeSkill = (skill: string) => {
        setProfile(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skill) }));
    };

    const togglePreferred = (skill: string) => {
        setProfile(prev => ({
            ...prev,
            preferredSkills: prev.preferredSkills.includes(skill)
                ? prev.preferredSkills.filter(s => s !== skill)
                : [...prev.preferredSkills, skill]
        }));
    };

    const completeness = calculateCompleteness(profile);

    return (
        <div className="max-w-6xl mx-auto px-6 py-8">
            {/* Header */}
            <motion.div {...fadeIn} className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
                <div className="flex items-center gap-6">
                    <div className="w-20 h-20 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground text-2xl font-bold">
                        {profile.name ? profile.name.split(" ").map(n => n[0]).join("").toUpperCase() : <User size={32} />}
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{profile.name || "Your Profile"}</h1>
                        <p className="text-muted-foreground">{profile.title || "Add your job title"}</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx,.txt" onChange={handleFileUpload} className="hidden" />
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isParsing}
                        className="apple-button-secondary px-5 py-2.5"
                    >
                        {isParsing ? <RefreshCw size={16} className="animate-spin" /> : <Upload size={16} />}
                        {isParsing ? "Parsing..." : "Upload Resume"}
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleSave}
                        disabled={isSaving}
                        className={`apple-button-primary px-6 py-2.5 ${saveSuccess ? "bg-green-500" : ""}`}
                    >
                        {isSaving ? <RefreshCw size={16} className="animate-spin" /> : saveSuccess ? <CheckCircle2 size={16} /> : <Save size={16} />}
                        {isSaving ? "Saving..." : saveSuccess ? "Saved!" : "Save"}
                    </motion.button>
                </div>
            </motion.div>

            <div className="grid lg:grid-cols-4 gap-8">
                {/* Sidebar */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="lg:col-span-1 space-y-6"
                >
                    {/* Navigation */}
                    <AppleCard noPadding className="overflow-hidden">
                        {navItems.map((item) => (
                            <motion.button
                                key={item.id}
                                whileHover={{ x: 4 }}
                                onClick={() => setActiveSection(item.id)}
                                className={`w-full flex items-center gap-3 p-4 transition-colors ${activeSection === item.id ? "bg-primary/10 text-primary" : "hover:bg-secondary"
                                    }`}
                            >
                                <item.icon size={18} />
                                <span className="font-medium text-sm">{item.label}</span>
                                <ChevronRight size={14} className="ml-auto text-muted-foreground" />
                            </motion.button>
                        ))}
                    </AppleCard>

                    {/* Profile Strength */}
                    <AppleCard className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold">Profile Strength</h3>
                            <span className="text-xl font-bold text-primary">{completeness}%</span>
                        </div>
                        <div className="h-2 bg-secondary rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${completeness}%` }}
                                transition={{ duration: 0.8 }}
                                className="h-full bg-primary rounded-full"
                            />
                        </div>
                    </AppleCard>
                </motion.div>

                {/* Main Content */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="lg:col-span-3"
                >
                    <AppleCard className="p-8">
                        {/* Personal Info */}
                        {activeSection === "info" && (
                            <div className="space-y-6">
                                <h2 className="text-xl font-semibold mb-6">Personal Information</h2>
                                <div className="grid md:grid-cols-2 gap-6">
                                    <InputField id="name" name="name" icon={<User size={16} />} label="Full Name" value={profile.name} onChange={v => handleInputChange("name", v)} placeholder="John Doe" autoComplete="name" />
                                    <InputField id="title" name="title" icon={<Briefcase size={16} />} label="Job Title" value={profile.title} onChange={v => handleInputChange("title", v)} placeholder="Software Engineer" autoComplete="organization-title" />
                                    <InputField id="email" name="email" icon={<Mail size={16} />} label="Email" value={profile.email} onChange={v => handleInputChange("email", v)} placeholder="john@example.com" autoComplete="email" />
                                    <InputField id="phone" name="phone" icon={<Phone size={16} />} label="Phone" value={profile.phone} onChange={v => handleInputChange("phone", v)} placeholder="+1 (555) 123-4567" autoComplete="tel" />
                                    <InputField id="location" name="location" icon={<MapPin size={16} />} label="Location" value={profile.location} onChange={v => handleInputChange("location", v)} placeholder="San Francisco, CA" autoComplete="address-level2" />
                                    <InputField id="linkedin" name="linkedin" icon={<Linkedin size={16} />} label="LinkedIn" value={profile.linkedin} onChange={v => handleInputChange("linkedin", v)} placeholder="linkedin.com/in/johndoe" autoComplete="url" />
                                    <InputField id="github" name="github" icon={<Github size={16} />} label="GitHub" value={profile.github} onChange={v => handleInputChange("github", v)} placeholder="github.com/johndoe" autoComplete="url" />
                                    <InputField id="portfolio" name="portfolio" icon={<Globe size={16} />} label="Portfolio" value={profile.portfolio} onChange={v => handleInputChange("portfolio", v)} placeholder="johndoe.com" autoComplete="url" />
                                </div>
                                <div className="pt-4">
                                    <label htmlFor="summary" className="text-sm font-medium text-muted-foreground block mb-2 cursor-pointer">Summary</label>
                                    <textarea
                                        id="summary"
                                        name="summary"
                                        value={profile.summary}
                                        onChange={(e) => handleInputChange("summary", e.target.value)}
                                        rows={4}
                                        className="w-full apple-input resize-none"
                                        placeholder="Write a brief summary about yourself..."
                                    />
                                </div>
                            </div>
                        )}

                        {/* Experience */}
                        {activeSection === "experience" && (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-semibold">Work Experience</h2>
                                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={addExperience} className="apple-button-primary text-sm px-4 py-2">
                                        <Plus size={14} /> Add
                                    </motion.button>
                                </div>
                                {profile.experience.length === 0 ? (
                                    <EmptyState message="No experience added yet" action="Add Experience" onAction={addExperience} />
                                ) : (
                                    <div className="space-y-4">
                                        {profile.experience.map(exp => (
                                            <ExperienceCard key={exp.id} exp={exp} isEditing={editMode === `exp-${exp.id}`} onEdit={() => setEditMode(`exp-${exp.id}`)} onSave={() => setEditMode(null)} onUpdate={updateExperience} onDelete={() => deleteExperience(exp.id)} />
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Education */}
                        {activeSection === "education" && (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-semibold">Education</h2>
                                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={addEducation} className="apple-button-primary text-sm px-4 py-2">
                                        <Plus size={14} /> Add
                                    </motion.button>
                                </div>
                                {profile.education.length === 0 ? (
                                    <EmptyState message="No education added yet" action="Add Education" onAction={addEducation} />
                                ) : (
                                    <div className="space-y-4">
                                        {profile.education.map(edu => (
                                            <EducationCard key={edu.id} edu={edu} isEditing={editMode === `edu-${edu.id}`} onEdit={() => setEditMode(`edu-${edu.id}`)} onSave={() => setEditMode(null)} onUpdate={updateEducation} onDelete={() => deleteEducation(edu.id)} />
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Skills */}
                        {activeSection === "skills" && (
                            <div className="space-y-6">
                                <h2 className="text-xl font-semibold">Skills</h2>
                                <p className="text-sm text-muted-foreground">Click the heart to mark preferred skills</p>
                                {profile.skills.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {profile.skills.map((skill, idx) => (
                                            <motion.span
                                                key={idx}
                                                whileHover={{ scale: 1.05 }}
                                                className={`apple-pill cursor-pointer group ${profile.preferredSkills.includes(skill) ? "bg-primary/10 text-primary" : ""}`}
                                                onClick={() => togglePreferred(skill)}
                                            >
                                                {profile.preferredSkills.includes(skill) && <Heart size={12} className="fill-current" />}
                                                {skill}
                                                <button onClick={(e) => { e.stopPropagation(); removeSkill(skill); }} className="opacity-0 group-hover:opacity-100 ml-1 hover:text-red-500">
                                                    <X size={12} />
                                                </button>
                                            </motion.span>
                                        ))}
                                    </div>
                                )}
                                <div className="flex gap-3">
                                    <input
                                        type="text"
                                        value={newSkill}
                                        onChange={(e) => setNewSkill(e.target.value)}
                                        onKeyPress={(e) => e.key === "Enter" && addSkill()}
                                        placeholder="Add a skill..."
                                        className="flex-1 apple-input"
                                    />
                                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={addSkill} className="apple-button-primary px-6">
                                        Add
                                    </motion.button>
                                </div>
                            </div>
                        )}
                    </AppleCard>
                </motion.div>
            </div>
        </div>
    );
}

function calculateCompleteness(profile: ProfileData): number {
    let score = 0;
    if (profile.name && profile.email) score += 25;
    if (profile.experience.length > 0) score += 25;
    if (profile.education.length > 0) score += 25;
    if (profile.skills.length >= 3) score += 25;
    return Math.min(score, 100);
}

interface InputFieldProps {
    id: string;
    name: string;
    icon: React.ReactNode;
    label: string;
    value: string;
    onChange: (v: string) => void;
    placeholder: string;
    autoComplete?: string;
}

function InputField({ id, name, icon, label, value, onChange, placeholder, autoComplete }: InputFieldProps) {
    return (
        <div>
            <label htmlFor={id} className="text-sm font-medium text-muted-foreground block mb-2 cursor-pointer">{label}</label>
            <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
                    {icon}
                </div>
                <input
                    id={id}
                    name={name}
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    autoComplete={autoComplete}
                    className="w-full apple-input !pl-10"
                />
            </div>
        </div>
    );
}

function EmptyState({ message, action, onAction }: { message: string; action: string; onAction: () => void }) {
    return (
        <div className="py-12 text-center border-2 border-dashed border-border rounded-2xl">
            <p className="text-muted-foreground mb-4">{message}</p>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={onAction} className="apple-button-secondary px-6 py-2">
                {action}
            </motion.button>
        </div>
    );
}

function ExperienceCard({ exp, isEditing, onEdit, onSave, onUpdate, onDelete }: { exp: Experience; isEditing: boolean; onEdit: () => void; onSave: () => void; onUpdate: (id: string, field: keyof Experience, value: string) => void; onDelete: () => void }) {
    if (isEditing) {
        return (
            <div className="p-4 border border-primary rounded-xl space-y-4 bg-secondary/30">
                <div className="grid grid-cols-2 gap-4">
                    <input value={exp.role} onChange={(e) => onUpdate(exp.id, "role", e.target.value)} placeholder="Job Title" className="apple-input" />
                    <input value={exp.company} onChange={(e) => onUpdate(exp.id, "company", e.target.value)} placeholder="Company" className="apple-input" />
                    <input value={exp.location} onChange={(e) => onUpdate(exp.id, "location", e.target.value)} placeholder="Location" className="apple-input" />
                    <input value={exp.startDate} onChange={(e) => onUpdate(exp.id, "startDate", e.target.value)} placeholder="Start Date" className="apple-input" />
                    <input value={exp.endDate} onChange={(e) => onUpdate(exp.id, "endDate", e.target.value)} placeholder="End Date" className="apple-input" />
                    <select value={exp.type} onChange={(e) => onUpdate(exp.id, "type", e.target.value)} className="apple-input">
                        <option>Full-time</option>
                        <option>Part-time</option>
                        <option>Internship</option>
                        <option>Contract</option>
                    </select>
                </div>
                <textarea value={exp.description} onChange={(e) => onUpdate(exp.id, "description", e.target.value)} placeholder="Description" rows={3} className="w-full apple-input resize-none" />
                <div className="flex justify-end gap-2">
                    <button onClick={onDelete} className="text-sm text-red-500 px-3 py-1.5">Delete</button>
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={onSave} className="apple-button-primary text-sm px-4 py-1.5">Done</motion.button>
                </div>
            </div>
        );
    }
    return (
        <motion.div whileHover={{ x: 4 }} onClick={onEdit} className="p-4 border border-border rounded-xl hover:border-primary cursor-pointer transition-colors group">
            <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center font-bold text-primary shrink-0">{exp.company?.charAt(0) || "?"}</div>
                <div className="flex-1">
                    <h4 className="font-medium">{exp.role || "Job Title"}</h4>
                    <p className="text-sm text-muted-foreground">{exp.company || "Company"} • {exp.location || "Location"}</p>
                    <p className="text-xs text-muted-foreground mt-1">{exp.startDate || "Start"} - {exp.endDate || "End"}</p>
                </div>
                <Edit3 size={14} className="text-muted-foreground opacity-0 group-hover:opacity-100" />
            </div>
        </motion.div>
    );
}

function EducationCard({ edu, isEditing, onEdit, onSave, onUpdate, onDelete }: { edu: Education; isEditing: boolean; onEdit: () => void; onSave: () => void; onUpdate: (id: string, field: keyof Education, value: string) => void; onDelete: () => void }) {
    if (isEditing) {
        return (
            <div className="p-4 border border-primary rounded-xl space-y-4 bg-secondary/30">
                <div className="grid grid-cols-2 gap-4">
                    <input value={edu.institution} onChange={(e) => onUpdate(edu.id, "institution", e.target.value)} placeholder="Institution" className="apple-input" />
                    <input value={edu.degree} onChange={(e) => onUpdate(edu.id, "degree", e.target.value)} placeholder="Degree" className="apple-input" />
                    <input value={edu.field} onChange={(e) => onUpdate(edu.id, "field", e.target.value)} placeholder="Field of Study" className="apple-input" />
                    <input value={edu.startDate} onChange={(e) => onUpdate(edu.id, "startDate", e.target.value)} placeholder="Start Year" className="apple-input" />
                    <input value={edu.endDate} onChange={(e) => onUpdate(edu.id, "endDate", e.target.value)} placeholder="End Year" className="apple-input" />
                </div>
                <div className="flex justify-end gap-2">
                    <button onClick={onDelete} className="text-sm text-red-500 px-3 py-1.5">Delete</button>
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={onSave} className="apple-button-primary text-sm px-4 py-1.5">Done</motion.button>
                </div>
            </div>
        );
    }
    return (
        <motion.div whileHover={{ x: 4 }} onClick={onEdit} className="p-4 border border-border rounded-xl hover:border-primary cursor-pointer transition-colors group">
            <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0"><GraduationCap size={18} className="text-primary" /></div>
                <div className="flex-1">
                    <h4 className="font-medium">{edu.degree || "Degree"} {edu.field && `in ${edu.field}`}</h4>
                    <p className="text-sm text-muted-foreground">{edu.institution || "Institution"}</p>
                    <p className="text-xs text-muted-foreground mt-1">{edu.startDate || "Start"} - {edu.endDate || "End"}</p>
                </div>
                <Edit3 size={14} className="text-muted-foreground opacity-0 group-hover:opacity-100" />
            </div>
        </motion.div>
    );
}
