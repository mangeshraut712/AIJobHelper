"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, MapPin, Building2, Clock, Bookmark, ExternalLink, Filter, Briefcase, DollarSign, Star } from "lucide-react";

interface Job {
    id: string;
    title: string;
    company: string;
    location: string;
    salary: string;
    type: string;
    posted: string;
    match: number;
    description: string;
    skills: string[];
}

const mockJobs: Job[] = [
    {
        id: "1",
        title: "Senior Software Engineer",
        company: "Apple",
        location: "Cupertino, CA",
        salary: "$180k - $250k",
        type: "Full-time",
        posted: "2 days ago",
        match: 95,
        description: "Join our team to build the next generation of Apple products and services.",
        skills: ["Swift", "iOS", "SwiftUI", "Xcode"],
    },
    {
        id: "2",
        title: "Full Stack Developer",
        company: "Google",
        location: "Mountain View, CA",
        salary: "$160k - $220k",
        type: "Full-time",
        posted: "1 week ago",
        match: 88,
        description: "Work on Google Cloud Platform and help millions of developers build applications.",
        skills: ["React", "Node.js", "Python", "GCP"],
    },
    {
        id: "3",
        title: "Product Engineer",
        company: "Stripe",
        location: "San Francisco, CA",
        salary: "$170k - $230k",
        type: "Full-time",
        posted: "3 days ago",
        match: 82,
        description: "Build and scale payment infrastructure used by millions of businesses worldwide.",
        skills: ["Ruby", "React", "PostgreSQL", "AWS"],
    },
];

const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, ease: "easeOut" as const },
};

export default function JobsPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [jobs] = useState<Job[]>(mockJobs);
    const [savedJobs, setSavedJobs] = useState<string[]>([]);

    const toggleSave = (id: string) => {
        setSavedJobs(prev =>
            prev.includes(id) ? prev.filter(j => j !== id) : [...prev, id]
        );
    };

    return (
        <div className="max-w-6xl mx-auto px-6 py-8">
            {/* Header */}
            <motion.div {...fadeIn} className="mb-8">
                <h1 className="text-4xl font-bold tracking-tight mb-2">Find Your Next Role</h1>
                <p className="text-lg text-muted-foreground">AI-matched jobs based on your skills and preferences</p>
            </motion.div>

            {/* Search Bar */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="apple-card p-4 mb-8"
            >
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search jobs, companies, or skills..."
                            className="w-full pl-12 pr-4 py-3 bg-secondary rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                    </div>
                    <div className="flex gap-3">
                        <button className="apple-button-secondary px-4 py-3 text-sm">
                            <Filter size={16} />
                            Filters
                        </button>
                        <button className="apple-button-primary px-6 py-3 text-sm">
                            Search
                        </button>
                    </div>
                </div>
            </motion.div>

            {/* Results */}
            <div className="flex items-center justify-between mb-6">
                <p className="text-sm text-muted-foreground">{jobs.length} jobs found</p>
                <div className="flex gap-2">
                    <span className="apple-pill">
                        <Star size={12} className="text-primary" />
                        Best Match
                    </span>
                </div>
            </div>

            {/* Job List */}
            <div className="space-y-4">
                {jobs.map((job, index) => (
                    <motion.div
                        key={job.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 + index * 0.05 }}
                        whileHover={{ y: -2 }}
                        className="apple-card p-6"
                    >
                        <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                            {/* Company Logo */}
                            <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center font-bold text-xl text-primary shrink-0">
                                {job.company.charAt(0)}
                            </div>

                            {/* Job Details */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-4 mb-3">
                                    <div>
                                        <h3 className="text-lg font-semibold mb-1">{job.title}</h3>
                                        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <Building2 size={14} />
                                                {job.company}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <MapPin size={14} />
                                                {job.location}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <DollarSign size={14} />
                                                {job.salary}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Match Score */}
                                    <div className="text-right shrink-0">
                                        <div className={`text-2xl font-bold ${job.match >= 90 ? 'text-green-500' : job.match >= 80 ? 'text-primary' : 'text-orange-500'}`}>
                                            {job.match}%
                                        </div>
                                        <p className="text-xs text-muted-foreground">match</p>
                                    </div>
                                </div>

                                <p className="text-sm text-muted-foreground mb-4">{job.description}</p>

                                {/* Skills */}
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {job.skills.map((skill, idx) => (
                                        <span key={idx} className="apple-pill text-xs">
                                            {skill}
                                        </span>
                                    ))}
                                </div>

                                {/* Actions */}
                                <div className="flex items-center justify-between pt-4 border-t border-border">
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                        <span className="flex items-center gap-1">
                                            <Clock size={14} />
                                            {job.posted}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Briefcase size={14} />
                                            {job.type}
                                        </span>
                                    </div>
                                    <div className="flex gap-2">
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => toggleSave(job.id)}
                                            className={`p-2 rounded-xl transition-colors ${savedJobs.includes(job.id)
                                                ? 'bg-primary/10 text-primary'
                                                : 'bg-secondary text-muted-foreground hover:text-foreground'
                                                }`}
                                        >
                                            <Bookmark size={18} fill={savedJobs.includes(job.id) ? "currentColor" : "none"} />
                                        </motion.button>
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            className="apple-button-primary text-sm px-5 py-2"
                                        >
                                            Apply Now
                                            <ExternalLink size={14} />
                                        </motion.button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
