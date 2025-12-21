// Shared constants for CareerAgentPro

export const APP_NAME = "CareerAgentPro";
export const APP_DESCRIPTION = "AI-Powered Career Platform";

// Navigation items used across the app
export const NAV_ITEMS = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/profile", label: "Profile" },
    { href: "/jobs", label: "Jobs" },
    { href: "/resumes", label: "Resumes" },
    { href: "/communication", label: "Messages" },
] as const;

// Status colors for consistent styling
export const STATUS_COLORS = {
    applied: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    interviewing: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    offered: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    rejected: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    saved: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
    pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
} as const;

// Match score thresholds
export const MATCH_SCORE = {
    excellent: { min: 90, color: "text-green-500", bg: "bg-green-500" },
    good: { min: 75, color: "text-primary", bg: "bg-primary" },
    fair: { min: 60, color: "text-orange-500", bg: "bg-orange-500" },
    low: { min: 0, color: "text-red-500", bg: "bg-red-500" },
} as const;

// Get score styling based on value
export function getScoreStyle(score: number) {
    if (score >= MATCH_SCORE.excellent.min) return MATCH_SCORE.excellent;
    if (score >= MATCH_SCORE.good.min) return MATCH_SCORE.good;
    if (score >= MATCH_SCORE.fair.min) return MATCH_SCORE.fair;
    return MATCH_SCORE.low;
}

// Animation variants for Framer Motion
export const FADE_IN = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, ease: "easeOut" as const },
};

export const FADE_IN_DELAY = (delay: number) => ({
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, delay, ease: "easeOut" as const },
});

export const STAGGER_CHILDREN = {
    animate: {
        transition: {
            staggerChildren: 0.1,
        },
    },
};

// API endpoints
export const API_ENDPOINTS = {
    health: "/health",
    parseResume: "/parse-resume",
    analyzeResume: "/analyze-resume",
    extractJob: "/extract-job",
    generateContent: "/generate",
    exportResume: "/export",
} as const;

// Local storage keys
export const STORAGE_KEYS = {
    profile: "careerAgentProfile",
    theme: "theme",
    recentJobs: "recentJobs",
} as const;

// Default profile structure
export const DEFAULT_PROFILE = {
    name: "",
    email: "",
    phone: "",
    location: "",
    title: "",
    linkedin: "",
    github: "",
    portfolio: "",
    summary: "",
    skills: [] as string[],
    preferredSkills: [] as string[],
    experience: [] as Array<{
        id: string;
        company: string;
        role: string;
        startDate: string;
        endDate: string;
        current: boolean;
        description: string;
    }>,
    education: [] as Array<{
        id: string;
        school: string;
        degree: string;
        field: string;
        startDate: string;
        endDate: string;
    }>,
};

export type Profile = typeof DEFAULT_PROFILE;
