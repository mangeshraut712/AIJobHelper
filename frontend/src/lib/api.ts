/**
 * API Configuration for CareerAgentPro
 * 
 * Works seamlessly with:
 * - Local development (Next.js dev server)
 * - Vercel production deployment
 * - Any environment with NEXT_PUBLIC_API_URL override
 */

// Determine the API base URL
const getApiUrl = (): string => {
    // Allow explicit override via environment variable
    if (process.env.NEXT_PUBLIC_API_URL) {
        return process.env.NEXT_PUBLIC_API_URL;
    }

    // All environments use relative /api path
    // Next.js API routes handle everything
    return '/api';
};

const API_URL = getApiUrl();

export default API_URL;

/**
 * Generic API call helper with error handling
 */
export async function apiCall<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<{ data: T | null; error: string | null }> {
    try {
        const url = `${API_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

        const response = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.detail || errorData.error || `API Error: ${response.status}`);
        }

        const data = await response.json();
        return { data, error: null };
    } catch (error) {
        console.error(`API call failed for ${endpoint}:`, error);
        return {
            data: null,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
}

/**
 * API endpoints for the application
 */
export const endpoints = {
    health: '/health',
    parseResume: '/parse-resume',
    enhanceResume: '/enhance-resume',
    extractJob: '/extract-job',
    generateCoverLetter: '/generate-cover-letter',
    exportPdf: '/export/pdf',
    exportDocx: '/export/docx',
    exportLatex: '/export/latex',
} as const;
