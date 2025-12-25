// Centralized storage keys to ensure consistency across all pages
export const STORAGE_KEYS = {
    // Profile data
    PROFILE: 'profile',

    // Jobs data
    ANALYZED_JOBS: 'analyzedJobs',
    CURRENT_JOB_FOR_RESUME: 'currentJobForResume',

    // Resume data
    ENHANCEMENT_RESULT: 'enhancementResult',

    // Interview data
    MOCK_INTERVIEW_DATA: 'mockInterviewData',
} as const;

// Load data with automatic fallback to old keys for migration
export function loadWithFallback<T>(primaryKey: string, fallbackKeys: string[] = []): T | null {
    // Try primary key first
    const primaryData = localStorage.getItem(primaryKey);
    if (primaryData) {
        try {
            return JSON.parse(primaryData);
        } catch {
            return null;
        }
    }

    // Try fallback keys
    for (const fallbackKey of fallbackKeys) {
        const fallbackData = localStorage.getItem(fallbackKey);
        if (fallbackData) {
            try {
                const parsed = JSON.parse(fallbackData);
                // Migrate to primary key
                localStorage.setItem(primaryKey, fallbackData);
                localStorage.removeItem(fallbackKey);
                return parsed;
            } catch {
                continue;
            }
        }
    }

    return null;
}

// Enhanced secure storage with migration support
export function migrateOldKeys() {
    // Migrate profile keys
    const oldProfileKeys = ['cap_profile', 'careerAgentProfile', 'user_profile'];
    const profile = loadWithFallback(STORAGE_KEYS.PROFILE, oldProfileKeys);
    if (profile) {
        localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
        oldProfileKeys.forEach(key => localStorage.removeItem(key));
    }

    // Migrate job keys
    const oldJobKeys = ['savedJobs', 'jobs', 'analyzed_jobs'];
    const jobs = loadWithFallback(STORAGE_KEYS.ANALYZED_JOBS, oldJobKeys);
    if (jobs) {
        localStorage.setItem(STORAGE_KEYS.ANALYZED_JOBS, JSON.stringify(jobs));
        oldJobKeys.forEach(key => localStorage.removeItem(key));
    }

    // Migrate current job keys
    const oldCurrentJobKeys = ['currentJob', 'selectedJob', 'targetJob', 'jobForResume'];
    const currentJob = loadWithFallback(STORAGE_KEYS.CURRENT_JOB_FOR_RESUME, oldCurrentJobKeys);
    if (currentJob) {
        localStorage.setItem(STORAGE_KEYS.CURRENT_JOB_FOR_RESUME, JSON.stringify(currentJob));
        oldCurrentJobKeys.forEach(key => localStorage.removeItem(key));
    }
}
