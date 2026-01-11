/**
 * Smart API URL Configuration
 * Works identically on localhost and Vercel without code changes
 * 
 * Usage: import API_URL from '@/lib/api'
 * Then: `${API_URL}/endpoint` works everywhere!
 */

class SmartAPIURL {
    private baseUrl: string;
    private isProd: boolean;

    constructor() {
        this.isProd = this.checkProduction();
        this.baseUrl = this.getBaseUrl();
    }

    private checkProduction(): boolean {
        if (typeof window === 'undefined') {
            return process.env.NODE_ENV === 'production';
        }
        const hostname = window.location.hostname;
        return hostname.includes('vercel.app') ||
            hostname.includes('yourdomain.com') ||
            process.env.NODE_ENV === 'production';
    }

    private getBaseUrl(): string {
        if (typeof window === 'undefined') {
            return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        }

        const hostname = window.location.hostname;

        if (this.isProd) {
            // Vercel: Same origin, endpoints at /api/*
            return window.location.origin + '/api';
        }

        // Localhost
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            return 'http://localhost:8000';
        }

        return 'http://localhost:8000';
    }

    // Make the object behave like a string
    toString(): string {
        return this.baseUrl;
    }

    valueOf(): string {
        return this.baseUrl;
    }

    // Allow concatenation
    concat(...args: string[]): string {
        return this.baseUrl + args.join('');
    }
}

// Create instance
const apiUrlInstance = new SmartAPIURL();

// Export as string-like object
const API_URL = apiUrlInstance.toString();

export default API_URL;

// Export helper functions
export const isProduction = (): boolean => {
    if (typeof window === 'undefined') {
        return process.env.NODE_ENV === 'production';
    }
    const hostname = window.location.hostname;
    return hostname.includes('vercel.app') || hostname.includes('yourdomain.com');
};

export const getApiEndpoint = (path: string): string => {
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return API_URL + cleanPath;
};
