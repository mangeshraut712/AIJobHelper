// API Configuration for CareerAgentPro
// Works with both localhost development and Vercel production

const getApiUrl = (): string => {
    // Check for explicit environment variable override
    const envApiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (envApiUrl) {
        console.log('[API] Using configured API URL:', envApiUrl);
        return envApiUrl;
    }

    // On Vercel or production, use relative /api path
    // This works because Next.js API routes are at /api/*
    if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
        console.log('[API] Production mode: Using /api');
        return '/api';
    }

    // In browser during development
    if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;

        // If running on Vercel preview/production
        if (hostname.includes('vercel.app')) {
            return '/api';
        }

        // Local development - use Next.js API routes (not Python backend)
        console.log('[API] Local dev: Using /api (Next.js routes)');
        return '/api';
    }

    // Server-side rendering fallback
    return '/api';
};

const API_URL = getApiUrl();
console.log('[API] Final API URL:', API_URL);

export default API_URL;

// Helper function to make API calls with error handling
export async function apiCall<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<{ data: T | null; error: string | null }> {
    try {
        const response = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return { data, error: null };
    } catch (error) {
        console.error(`API call failed for ${endpoint}:`, error);
        return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
    }
}
