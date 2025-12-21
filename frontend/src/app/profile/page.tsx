"use client";

import React, { useState, useRef, useEffect } from "react";
import { User, Mail, Phone, MapPin, Globe, Linkedin, Github, Briefcase, GraduationCap, Code, Save, RefreshCw, Upload, CheckCircle2, Plus, Trash2, Edit3, X, Heart, ExternalLink, Building2, FolderGit2, Link as LinkIcon, ChevronRight, Eye } from "lucide-react";
import axios from "axios";
import API_URL from "@/lib/api";

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
    location: string;
    startDate: string;
    endDate: string;
}

interface Project {
    id: string;
    title: string;
    role: string;
    startDate: string;
    endDate: string;
    location: string;
    description: string;
    link: string;
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
    website: string;
    jobSearchStatus: string;
    experience: Experience[];
    education: Education[];
    projects: Project[];
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
    website: "",
    jobSearchStatus: "actively_looking",
    experience: [],
    education: [],
    projects: [],
    skills: [],
    preferredSkills: [],
    summary: ""
};

export default function ProfilePage() {
    const [activeSection, setActiveSection] = useState("profile");
    const [isSaving, setIsSaving] = useState(false);
    const [isParsing, setIsParsing] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [editMode, setEditMode] = useState<string | null>(null);
    const [newSkill, setNewSkill] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [profile, setProfile] = useState<ProfileData>(EMPTY_PROFILE);

    // Load from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem('careerAgentProfile');
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
        setSaveSuccess(false);
        try {
            localStorage.setItem('careerAgentProfile', JSON.stringify(profile));
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
                skills: parsed.skills || prev.skills,
                summary: parsed.summary || prev.summary,
            }));
            alert("Resume parsed! Review and complete your profile.");
        } catch (error) {
            console.error("Parse error:", error);
            alert("Resume parsing requires the backend. Please fill in manually.");
        } finally {
            setIsParsing(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    // Experience CRUD
    const addExperience = () => {
        const newExp: Experience = { id: generateId(), company: "", role: "", location: "", startDate: "", endDate: "", type: "Full-Time", description: "" };
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
        if (confirm("Delete this experience?")) {
            setProfile(prev => ({ ...prev, experience: prev.experience.filter(exp => exp.id !== id) }));
        }
    };

    // Education CRUD
    const addEducation = () => {
        const newEdu: Education = { id: generateId(), institution: "", degree: "", field: "", location: "", startDate: "", endDate: "" };
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
        if (confirm("Delete this education?")) {
            setProfile(prev => ({ ...prev, education: prev.education.filter(edu => edu.id !== id) }));
        }
    };

    // Projects CRUD
    const addProject = () => {
        const newProj: Project = { id: generateId(), title: "", role: "", startDate: "", endDate: "", location: "", description: "", link: "" };
        setProfile(prev => ({ ...prev, projects: [...prev.projects, newProj] }));
        setEditMode(`proj-${newProj.id}`);
    };

    const updateProject = (id: string, field: keyof Project, value: string) => {
        setProfile(prev => ({
            ...prev,
            projects: prev.projects.map(proj => proj.id === id ? { ...proj, [field]: value } : proj)
        }));
    };

    const deleteProject = (id: string) => {
        if (confirm("Delete this project?")) {
            setProfile(prev => ({ ...prev, projects: prev.projects.filter(proj => proj.id !== id) }));
        }
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

    const togglePreferredSkill = (skill: string) => {
        setProfile(prev => ({
            ...prev,
            preferredSkills: prev.preferredSkills.includes(skill)
                ? prev.preferredSkills.filter(s => s !== skill)
                : [...prev.preferredSkills, skill]
        }));
    };

    const completeness = calculateCompleteness(profile);

    return (
        <div className="max-w-7xl mx-auto pb-20">
            {/* Top Banner */}
            <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-teal-500/10 to-cyan-500/10 border border-teal-500/20">
                <p className="text-center font-medium">
                    <span className="text-teal-600 dark:text-teal-400">Your profile is used directly to autofill your job applications!</span>
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Left Sidebar */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Profile Card */}
                    <div className="p-6 rounded-2xl border border-border bg-card text-center relative">
                        <button
                            onClick={() => setEditMode(editMode === 'basic' ? null : 'basic')}
                            className="absolute top-4 right-4 p-2 hover:bg-secondary rounded-lg"
                        >
                            <Edit3 size={16} />
                        </button>

                        <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center text-white text-2xl font-bold mb-4">
                            {profile.name ? profile.name.split(' ').map(n => n[0]).join('').toUpperCase() : <User size={32} />}
                        </div>

                        {editMode === 'basic' ? (
                            <div className="space-y-3 text-left">
                                <input value={profile.name} onChange={e => handleInputChange('name', e.target.value)} placeholder="Full Name" className="w-full p-2 border rounded-lg text-sm" />
                                <input value={profile.title} onChange={e => handleInputChange('title', e.target.value)} placeholder="Job Title" className="w-full p-2 border rounded-lg text-sm" />
                                <button onClick={() => setEditMode(null)} className="w-full py-2 bg-teal-500 text-white rounded-lg text-sm font-medium">Done</button>
                            </div>
                        ) : (
                            <>
                                <h2 className="text-xl font-bold">{profile.name || "Your Name"}</h2>
                                <p className="text-muted-foreground text-sm">{profile.title || "Job Title"}</p>
                            </>
                        )}

                        <div className="mt-4 pt-4 border-t border-border">
                            <p className="text-xs text-muted-foreground mb-1">Job Search Status</p>
                            <select
                                value={profile.jobSearchStatus}
                                onChange={e => handleInputChange('jobSearchStatus', e.target.value)}
                                className="w-full p-2 text-sm border rounded-lg bg-background text-teal-600 font-medium"
                            >
                                <option value="actively_looking">Actively looking</option>
                                <option value="open_to_offers">Open to offers</option>
                                <option value="not_looking">Not looking</option>
                            </select>
                        </div>
                    </div>

                    {/* Navigation */}
                    <div className="rounded-2xl border border-border overflow-hidden">
                        <p className="px-4 py-3 bg-secondary/50 text-xs font-bold uppercase tracking-widest text-muted-foreground">My Career Hub</p>
                        <NavItem icon={<User size={18} />} label="Profile" sublabel="Edit autofill information" active={activeSection === 'profile'} onClick={() => setActiveSection('profile')} color="teal" />
                        <NavItem icon={<Briefcase size={18} />} label="Experience" sublabel="Work history" active={activeSection === 'experience'} onClick={() => setActiveSection('experience')} color="blue" />
                        <NavItem icon={<FolderGit2 size={18} />} label="Projects" sublabel="Portfolio & side projects" active={activeSection === 'projects'} onClick={() => setActiveSection('projects')} color="purple" />
                        <NavItem icon={<GraduationCap size={18} />} label="Education" sublabel="Academic background" active={activeSection === 'education'} onClick={() => setActiveSection('education')} color="orange" />
                        <NavItem icon={<Code size={18} />} label="Skills" sublabel="Technical abilities" active={activeSection === 'skills'} onClick={() => setActiveSection('skills')} color="pink" />
                        <NavItem icon={<LinkIcon size={18} />} label="Links" sublabel="Portfolio & social" active={activeSection === 'links'} onClick={() => setActiveSection('links')} color="green" />
                    </div>

                    {/* Profile Strength */}
                    <div className="p-6 rounded-2xl border border-border bg-card">
                        <h3 className="font-bold mb-4">My Profile Strength</h3>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Career Builder 💪</span>
                                <span>{completeness}%</span>
                            </div>
                            <div className="h-2 bg-secondary rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-teal-500 to-cyan-500 transition-all duration-500" style={{ width: `${completeness}%` }} />
                            </div>
                        </div>
                        <ul className="mt-4 space-y-2 text-sm">
                            <ChecklistItem label="Add your contact info" done={!!profile.email} points="+10%" />
                            <ChecklistItem label="Add your education" done={profile.education.length > 0} points="+10%" />
                            <ChecklistItem label="Add your work experience" done={profile.experience.length > 0} points="+20%" />
                            <ChecklistItem label="Add your skills" done={profile.skills.length >= 5} points="+10%" />
                            <ChecklistItem label="Add your personal links" done={!!profile.linkedin || !!profile.github} points="+10%" />
                        </ul>
                    </div>
                </div>

                {/* Main Content */}
                <div className="lg:col-span-3 space-y-6">
                    {/* Action Bar */}
                    <div className="flex flex-wrap gap-4 justify-between items-center">
                        <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx,.txt" onChange={handleFileUpload} className="hidden" />
                        <button onClick={() => fileInputRef.current?.click()} disabled={isParsing} className="px-4 py-2 bg-secondary rounded-lg font-medium flex items-center gap-2 hover:bg-secondary/80 disabled:opacity-50">
                            {isParsing ? <RefreshCw size={16} className="animate-spin" /> : <Upload size={16} />}
                            {isParsing ? "Parsing..." : "Upload Resume"}
                        </button>
                        <button onClick={handleSave} disabled={isSaving} className={`px-6 py-2 ${saveSuccess ? 'bg-green-500' : 'bg-teal-500'} text-white rounded-lg font-medium flex items-center gap-2 hover:opacity-90 disabled:opacity-50`}>
                            {isSaving ? <RefreshCw size={16} className="animate-spin" /> : saveSuccess ? <CheckCircle2 size={16} /> : <Save size={16} />}
                            {isSaving ? "Saving..." : saveSuccess ? "Saved!" : "Save Profile"}
                        </button>
                    </div>

                    {/* Resume Section */}
                    {activeSection === 'profile' && (
                        <div className="rounded-2xl border border-border overflow-hidden">
                            <div className="p-6 flex items-center justify-between">
                                <div>
                                    <h3 className="text-xl font-bold">Resume</h3>
                                    <p className="text-sm text-muted-foreground">Upload your resume to auto-fill your profile</p>
                                </div>
                                <button onClick={() => fileInputRef.current?.click()} className="px-4 py-2 bg-teal-500 text-white rounded-lg font-medium flex items-center gap-2">
                                    <Eye size={16} /> Upload Resume
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Contact Info */}
                    {activeSection === 'profile' && (
                        <div className="rounded-2xl border border-border p-6 space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-bold">Contact Information</h3>
                                <button onClick={() => setEditMode(editMode === 'contact' ? null : 'contact')} className="p-2 hover:bg-secondary rounded-lg">
                                    <Edit3 size={16} />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <InputField icon={<Mail size={16} />} label="Email" value={profile.email} onChange={v => handleInputChange('email', v)} placeholder="you@email.com" disabled={editMode !== 'contact'} />
                                <InputField icon={<Phone size={16} />} label="Phone" value={profile.phone} onChange={v => handleInputChange('phone', v)} placeholder="+1 (555) 123-4567" disabled={editMode !== 'contact'} />
                                <InputField icon={<MapPin size={16} />} label="Location" value={profile.location} onChange={v => handleInputChange('location', v)} placeholder="City, State, Country" disabled={editMode !== 'contact'} />
                            </div>

                            {editMode === 'contact' && (
                                <button onClick={() => setEditMode(null)} className="px-4 py-2 bg-teal-500 text-white rounded-lg text-sm font-medium">Done Editing</button>
                            )}
                        </div>
                    )}

                    {/* Work Experience */}
                    {(activeSection === 'profile' || activeSection === 'experience') && (
                        <div className="rounded-2xl border border-border p-6 space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-bold">Work Experience</h3>
                                <button onClick={addExperience} className="p-2 hover:bg-secondary rounded-lg"><Plus size={20} /></button>
                            </div>

                            {profile.experience.length === 0 ? (
                                <EmptyState icon={<Briefcase />} message="No work experience added" action="Add Experience" onAction={addExperience} />
                            ) : (
                                <div className="space-y-6">
                                    {profile.experience.map(exp => (
                                        <ExperienceCard
                                            key={exp.id}
                                            exp={exp}
                                            isEditing={editMode === `exp-${exp.id}`}
                                            onEdit={() => setEditMode(`exp-${exp.id}`)}
                                            onSave={() => setEditMode(null)}
                                            onUpdate={(f, v) => updateExperience(exp.id, f as keyof Experience, v)}
                                            onDelete={() => deleteExperience(exp.id)}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Projects */}
                    {(activeSection === 'profile' || activeSection === 'projects') && (
                        <div className="rounded-2xl border border-border p-6 space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-bold">Projects & Outside Experience</h3>
                                <button onClick={addProject} className="p-2 hover:bg-secondary rounded-lg"><Plus size={20} /></button>
                            </div>

                            {profile.projects.length === 0 ? (
                                <EmptyState icon={<FolderGit2 />} message="No projects added" action="Add Project" onAction={addProject} />
                            ) : (
                                <div className="space-y-6">
                                    {profile.projects.map(proj => (
                                        <ProjectCard
                                            key={proj.id}
                                            proj={proj}
                                            isEditing={editMode === `proj-${proj.id}`}
                                            onEdit={() => setEditMode(`proj-${proj.id}`)}
                                            onSave={() => setEditMode(null)}
                                            onUpdate={(f, v) => updateProject(proj.id, f as keyof Project, v)}
                                            onDelete={() => deleteProject(proj.id)}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Education */}
                    {(activeSection === 'profile' || activeSection === 'education') && (
                        <div className="rounded-2xl border border-border p-6 space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-bold">Education</h3>
                                <button onClick={addEducation} className="p-2 hover:bg-secondary rounded-lg"><Plus size={20} /></button>
                            </div>

                            {profile.education.length === 0 ? (
                                <EmptyState icon={<GraduationCap />} message="No education added" action="Add Education" onAction={addEducation} />
                            ) : (
                                <div className="space-y-6">
                                    {profile.education.map(edu => (
                                        <EducationCard
                                            key={edu.id}
                                            edu={edu}
                                            isEditing={editMode === `edu-${edu.id}`}
                                            onEdit={() => setEditMode(`edu-${edu.id}`)}
                                            onSave={() => setEditMode(null)}
                                            onUpdate={(f, v) => updateEducation(edu.id, f as keyof Education, v)}
                                            onDelete={() => deleteEducation(edu.id)}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Portfolio & Links */}
                    {(activeSection === 'profile' || activeSection === 'links') && (
                        <div className="rounded-2xl border border-border p-6 space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-bold">Portfolio & Links</h3>
                                <button onClick={() => setEditMode(editMode === 'links' ? null : 'links')} className="p-2 hover:bg-secondary rounded-lg">
                                    <Edit3 size={16} />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <LinkCard icon={<Linkedin />} label="LinkedIn URL" value={profile.linkedin} onChange={v => handleInputChange('linkedin', v)} placeholder="linkedin.com/in/yourname" editing={editMode === 'links'} color="blue" />
                                <LinkCard icon={<Github />} label="GitHub URL" value={profile.github} onChange={v => handleInputChange('github', v)} placeholder="github.com/yourname" editing={editMode === 'links'} color="gray" />
                                <LinkCard icon={<Globe />} label="Portfolio URL" value={profile.portfolio} onChange={v => handleInputChange('portfolio', v)} placeholder="yourportfolio.com" editing={editMode === 'links'} color="orange" />
                                <LinkCard icon={<ExternalLink />} label="Other URL" value={profile.website} onChange={v => handleInputChange('website', v)} placeholder="other-link.com" editing={editMode === 'links'} color="pink" />
                            </div>

                            {editMode === 'links' && (
                                <button onClick={() => setEditMode(null)} className="px-4 py-2 bg-teal-500 text-white rounded-lg text-sm font-medium">Done Editing</button>
                            )}
                        </div>
                    )}

                    {/* Skills */}
                    {(activeSection === 'profile' || activeSection === 'skills') && (
                        <div className="rounded-2xl border border-border p-6 space-y-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-xl font-bold">Skills</h3>
                                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                                        Skills you prefer are highlighted with <Heart size={14} className="text-teal-500 fill-teal-500" />
                                    </p>
                                </div>
                                <button onClick={() => setEditMode(editMode === 'skills' ? null : 'skills')} className="p-2 hover:bg-secondary rounded-lg">
                                    <Edit3 size={16} />
                                </button>
                            </div>

                            {profile.skills.length === 0 ? (
                                <EmptyState icon={<Code />} message="No skills added" action="Add Skills" onAction={() => setEditMode('skills')} />
                            ) : (
                                <div className="flex flex-wrap gap-2">
                                    {profile.skills.map((skill, idx) => (
                                        <span
                                            key={idx}
                                            onClick={() => editMode === 'skills' && togglePreferredSkill(skill)}
                                            className={`px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-2 transition-colors cursor-pointer ${profile.preferredSkills.includes(skill)
                                                ? 'bg-teal-500/10 text-teal-600 border border-teal-500/30'
                                                : 'bg-secondary hover:bg-secondary/80'
                                                }`}
                                        >
                                            {profile.preferredSkills.includes(skill) && <Heart size={12} className="fill-current" />}
                                            {skill}
                                            {editMode === 'skills' && (
                                                <button onClick={(e) => { e.stopPropagation(); removeSkill(skill); }} className="ml-1 hover:text-red-500">
                                                    <X size={12} />
                                                </button>
                                            )}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {editMode === 'skills' && (
                                <div className="flex gap-2 pt-4 border-t border-border">
                                    <input
                                        type="text"
                                        value={newSkill}
                                        onChange={e => setNewSkill(e.target.value)}
                                        onKeyPress={e => e.key === 'Enter' && addSkill()}
                                        placeholder="Add a skill..."
                                        className="flex-1 p-2 border rounded-lg text-sm"
                                    />
                                    <button onClick={addSkill} className="px-4 py-2 bg-teal-500 text-white rounded-lg text-sm font-medium">Add</button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function calculateCompleteness(profile: ProfileData): number {
    let score = 0;
    if (profile.name && profile.email) score += 20;
    if (profile.experience.length > 0) score += 25;
    if (profile.education.length > 0) score += 20;
    if (profile.skills.length >= 5) score += 20;
    if (profile.linkedin || profile.github) score += 15;
    return Math.min(score, 100);
}

function NavItem({ icon, label, sublabel, active, onClick, color }: { icon: React.ReactNode, label: string, sublabel: string, active: boolean, onClick: () => void, color: string }) {
    const colors: Record<string, string> = {
        teal: 'bg-teal-500',
        blue: 'bg-blue-500',
        purple: 'bg-purple-500',
        orange: 'bg-orange-500',
        pink: 'bg-pink-500',
        green: 'bg-green-500',
    };

    return (
        <button onClick={onClick} className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-secondary/50 transition-colors ${active ? 'bg-secondary' : ''}`}>
            <div className={`p-2 rounded-lg ${colors[color]} text-white`}>{icon}</div>
            <div className="flex-1 text-left">
                <p className="font-medium text-sm">{label}</p>
                <p className="text-xs text-muted-foreground">{sublabel}</p>
            </div>
            <ChevronRight size={16} className="text-muted-foreground" />
        </button>
    );
}

function ChecklistItem({ label, done, points }: { label: string, done: boolean, points: string }) {
    return (
        <li className="flex items-center gap-2">
            <div className={`w-4 h-4 rounded-full flex items-center justify-center ${done ? 'bg-teal-500' : 'border border-border'}`}>
                {done && <CheckCircle2 size={10} className="text-white" />}
            </div>
            <span className={`flex-1 ${done ? 'line-through text-muted-foreground' : ''}`}>{label}</span>
            <span className={`text-xs ${done ? 'text-muted-foreground' : 'text-teal-500'}`}>{points}</span>
        </li>
    );
}

function InputField({ icon, label, value, onChange, placeholder, disabled }: { icon: React.ReactNode, label: string, value: string, onChange: (v: string) => void, placeholder: string, disabled: boolean }) {
    return (
        <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">{label}</label>
            <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">{icon}</div>
                <input
                    type="text"
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    placeholder={placeholder}
                    disabled={disabled}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm disabled:bg-secondary/50 disabled:cursor-not-allowed"
                />
            </div>
        </div>
    );
}

function EmptyState({ icon, message, action, onAction }: { icon: React.ReactNode, message: string, action: string, onAction: () => void }) {
    return (
        <div className="py-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-secondary flex items-center justify-center text-muted-foreground">{icon}</div>
            <p className="text-muted-foreground mb-4">{message}</p>
            <button onClick={onAction} className="px-4 py-2 bg-teal-500 text-white rounded-lg text-sm font-medium">{action}</button>
        </div>
    );
}

function ExperienceCard({ exp, isEditing, onEdit, onSave, onUpdate, onDelete }: { exp: Experience, isEditing: boolean, onEdit: () => void, onSave: () => void, onUpdate: (f: string, v: string) => void, onDelete: () => void }) {
    if (isEditing) {
        return (
            <div className="p-4 border rounded-xl space-y-4 bg-secondary/30">
                <div className="grid grid-cols-2 gap-4">
                    <input value={exp.role} onChange={e => onUpdate('role', e.target.value)} placeholder="Job Title" className="p-2 border rounded-lg" />
                    <input value={exp.company} onChange={e => onUpdate('company', e.target.value)} placeholder="Company" className="p-2 border rounded-lg" />
                    <input value={exp.location} onChange={e => onUpdate('location', e.target.value)} placeholder="Location" className="p-2 border rounded-lg" />
                    <select value={exp.type} onChange={e => onUpdate('type', e.target.value)} className="p-2 border rounded-lg">
                        <option>Full-Time</option>
                        <option>Part-Time</option>
                        <option>Internship</option>
                        <option>Contract</option>
                    </select>
                    <input value={exp.startDate} onChange={e => onUpdate('startDate', e.target.value)} placeholder="Start (e.g., Jan 2023)" className="p-2 border rounded-lg" />
                    <input value={exp.endDate} onChange={e => onUpdate('endDate', e.target.value)} placeholder="End (e.g., Present)" className="p-2 border rounded-lg" />
                </div>
                <textarea value={exp.description} onChange={e => onUpdate('description', e.target.value)} placeholder="Describe your responsibilities and achievements..." rows={3} className="w-full p-2 border rounded-lg" />
                <div className="flex justify-end gap-2">
                    <button onClick={onDelete} className="px-3 py-1.5 text-red-500 text-sm">Delete</button>
                    <button onClick={onSave} className="px-4 py-1.5 bg-teal-500 text-white rounded-lg text-sm">Done</button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex gap-4 group">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold shrink-0">
                {exp.company ? exp.company.charAt(0).toUpperCase() : <Building2 size={20} />}
            </div>
            <div className="flex-1">
                <div className="flex items-start justify-between">
                    <div>
                        <h4 className="font-bold">{exp.role || "Job Title"} <span className="font-normal text-muted-foreground">• {exp.company || "Company"}</span></h4>
                        <div className="flex flex-wrap gap-2 mt-1">
                            {exp.location && <span className="text-xs px-2 py-0.5 bg-secondary rounded">📍 {exp.location}</span>}
                            {exp.startDate && <span className="text-xs px-2 py-0.5 bg-secondary rounded">{exp.startDate} - {exp.endDate || "Present"}</span>}
                            {exp.type && <span className="text-xs px-2 py-0.5 bg-secondary rounded">{exp.type}</span>}
                        </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={onEdit} className="p-1.5 hover:bg-secondary rounded"><Edit3 size={14} /></button>
                        <button onClick={onDelete} className="p-1.5 hover:bg-secondary rounded text-red-500"><Trash2 size={14} /></button>
                    </div>
                </div>
                {exp.description && <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{exp.description}</p>}
            </div>
        </div>
    );
}

function EducationCard({ edu, isEditing, onEdit, onSave, onUpdate, onDelete }: { edu: Education, isEditing: boolean, onEdit: () => void, onSave: () => void, onUpdate: (f: string, v: string) => void, onDelete: () => void }) {
    if (isEditing) {
        return (
            <div className="p-4 border rounded-xl space-y-4 bg-secondary/30">
                <div className="grid grid-cols-2 gap-4">
                    <input value={edu.institution} onChange={e => onUpdate('institution', e.target.value)} placeholder="University/School" className="p-2 border rounded-lg" />
                    <input value={edu.degree} onChange={e => onUpdate('degree', e.target.value)} placeholder="Degree (e.g., B.S.)" className="p-2 border rounded-lg" />
                    <input value={edu.field} onChange={e => onUpdate('field', e.target.value)} placeholder="Field of Study" className="p-2 border rounded-lg" />
                    <input value={edu.location} onChange={e => onUpdate('location', e.target.value)} placeholder="Location" className="p-2 border rounded-lg" />
                    <input value={edu.startDate} onChange={e => onUpdate('startDate', e.target.value)} placeholder="Start Year" className="p-2 border rounded-lg" />
                    <input value={edu.endDate} onChange={e => onUpdate('endDate', e.target.value)} placeholder="End Year" className="p-2 border rounded-lg" />
                </div>
                <div className="flex justify-end gap-2">
                    <button onClick={onDelete} className="px-3 py-1.5 text-red-500 text-sm">Delete</button>
                    <button onClick={onSave} className="px-4 py-1.5 bg-teal-500 text-white rounded-lg text-sm">Done</button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex gap-4 group">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white shrink-0">
                <GraduationCap size={20} />
            </div>
            <div className="flex-1">
                <div className="flex items-start justify-between">
                    <div>
                        <h4 className="font-bold">{edu.degree || "Degree"} {edu.field && `in ${edu.field}`}</h4>
                        <p className="text-sm text-muted-foreground">{edu.institution || "Institution"}</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                            {edu.location && <span className="text-xs px-2 py-0.5 bg-secondary rounded">📍 {edu.location}</span>}
                            {edu.startDate && <span className="text-xs px-2 py-0.5 bg-secondary rounded">{edu.startDate} - {edu.endDate}</span>}
                        </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={onEdit} className="p-1.5 hover:bg-secondary rounded"><Edit3 size={14} /></button>
                        <button onClick={onDelete} className="p-1.5 hover:bg-secondary rounded text-red-500"><Trash2 size={14} /></button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ProjectCard({ proj, isEditing, onEdit, onSave, onUpdate, onDelete }: { proj: Project, isEditing: boolean, onEdit: () => void, onSave: () => void, onUpdate: (f: string, v: string) => void, onDelete: () => void }) {
    if (isEditing) {
        return (
            <div className="p-4 border rounded-xl space-y-4 bg-secondary/30">
                <div className="grid grid-cols-2 gap-4">
                    <input value={proj.role} onChange={e => onUpdate('role', e.target.value)} placeholder="Your Role" className="p-2 border rounded-lg" />
                    <input value={proj.title} onChange={e => onUpdate('title', e.target.value)} placeholder="Project Name" className="p-2 border rounded-lg" />
                    <input value={proj.location} onChange={e => onUpdate('location', e.target.value)} placeholder="Location" className="p-2 border rounded-lg" />
                    <input value={proj.link} onChange={e => onUpdate('link', e.target.value)} placeholder="Project Link" className="p-2 border rounded-lg" />
                    <input value={proj.startDate} onChange={e => onUpdate('startDate', e.target.value)} placeholder="Start Date" className="p-2 border rounded-lg" />
                    <input value={proj.endDate} onChange={e => onUpdate('endDate', e.target.value)} placeholder="End Date" className="p-2 border rounded-lg" />
                </div>
                <textarea value={proj.description} onChange={e => onUpdate('description', e.target.value)} placeholder="Describe the project..." rows={3} className="w-full p-2 border rounded-lg" />
                <div className="flex justify-end gap-2">
                    <button onClick={onDelete} className="px-3 py-1.5 text-red-500 text-sm">Delete</button>
                    <button onClick={onSave} className="px-4 py-1.5 bg-teal-500 text-white rounded-lg text-sm">Done</button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex gap-4 group">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white shrink-0">
                <FolderGit2 size={20} />
            </div>
            <div className="flex-1">
                <div className="flex items-start justify-between">
                    <div>
                        <h4 className="font-bold">{proj.role || "Role"} <span className="font-normal text-muted-foreground">• {proj.title || "Project"}</span></h4>
                        <div className="flex flex-wrap gap-2 mt-1">
                            {proj.startDate && <span className="text-xs px-2 py-0.5 bg-secondary rounded">{proj.startDate} - {proj.endDate}</span>}
                            {proj.location && <span className="text-xs px-2 py-0.5 bg-secondary rounded">📍 {proj.location}</span>}
                        </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={onEdit} className="p-1.5 hover:bg-secondary rounded"><Edit3 size={14} /></button>
                        <button onClick={onDelete} className="p-1.5 hover:bg-secondary rounded text-red-500"><Trash2 size={14} /></button>
                    </div>
                </div>
                {proj.description && <p className="text-sm text-muted-foreground mt-2">{proj.description}</p>}
                {proj.link && <a href={proj.link} target="_blank" rel="noopener noreferrer" className="text-sm text-teal-500 hover:underline mt-1 inline-block">{proj.link}</a>}
            </div>
        </div>
    );
}

function LinkCard({ icon, label, value, onChange, placeholder, editing, color }: { icon: React.ReactNode, label: string, value: string, onChange: (v: string) => void, placeholder: string, editing: boolean, color: string }) {
    const colors: Record<string, string> = {
        blue: 'bg-blue-500',
        gray: 'bg-gray-700',
        orange: 'bg-orange-500',
        pink: 'bg-pink-500',
    };

    return (
        <div className="p-4 border rounded-xl flex items-center gap-4">
            <div className={`w-10 h-10 rounded-lg ${colors[color]} text-white flex items-center justify-center shrink-0`}>{icon}</div>
            <div className="flex-1">
                <p className="text-xs text-muted-foreground mb-1">{label}</p>
                {editing ? (
                    <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="w-full p-1 border rounded text-sm" />
                ) : (
                    <p className="text-sm text-teal-500">{value || <span className="text-muted-foreground">Not added</span>}</p>
                )}
            </div>
        </div>
    );
}
