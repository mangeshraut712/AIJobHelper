// API Configuration for CareerAgentPro
// Works with both localhost development and Vercel production

const getApiUrl = (): string => {
    // Check for environment variable first
    if (process.env.NEXT_PUBLIC_API_URL) {
        return process.env.NEXT_PUBLIC_API_URL;
    }

    // In browser, detect based on current location
    if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;

        // Vercel deployment
        if (hostname.includes('vercel.app') || hostname.includes('ai-job-helper')) {
            return '/api';
        }

        // Local development
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            return 'http://localhost:8000';
        }
    }

    // Server-side rendering fallback
    if (process.env.NODE_ENV === 'production') {
        return '/api';
    }

    return 'http://localhost:8000';
};

const API_URL = getApiUrl();

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
