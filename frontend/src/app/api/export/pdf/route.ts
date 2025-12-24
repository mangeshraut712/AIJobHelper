import { NextRequest, NextResponse } from 'next/server';

// This endpoint returns JSON data that the client renders safely
// This approach avoids XSS entirely by never generating HTML on the server

interface Experience {
    role?: string;
    company?: string;
    duration?: string;
    description?: string;
}

interface Education {
    degree?: string;
    institution?: string;
    graduation_year?: string;
}

interface ResumeData {
    name?: string;
    email?: string;
    phone?: string;
    location?: string;
    summary?: string;
    skills?: string[];
    experience?: Experience[];
    education?: Education[];
}

interface SafeResumeData {
    name: string;
    email: string;
    phone: string;
    location: string;
    summary: string;
    skills: string[];
    experience: Array<{
        role: string;
        company: string;
        duration: string;
        description: string;
    }>;
    education: Array<{
        degree: string;
        institution: string;
        graduation_year: string;
    }>;
}

/**
 * Sanitize string for safe output - removes any potentially dangerous characters
 * Returns plain text only, no HTML or script injection possible
 */
function sanitizeString(str: string | undefined | null): string {
    if (!str || typeof str !== 'string') return '';

    // Remove any HTML tags completely
    let result = str.replace(/<[^>]*>/g, '');

    // Remove control characters
    result = result.replace(/[\x00-\x1F\x7F]/g, '');

    // Trim and limit length
    return result.trim().substring(0, 1000);
}

/**
 * Process resume data to ensure all fields are sanitized strings
 */
function sanitizeResumeData(data: ResumeData): SafeResumeData {
    return {
        name: sanitizeString(data.name) || 'Your Name',
        email: sanitizeString(data.email),
        phone: sanitizeString(data.phone),
        location: sanitizeString(data.location),
        summary: sanitizeString(data.summary),
        skills: (data.skills || []).map(s => sanitizeString(s)).filter(Boolean),
        experience: (data.experience || []).map(exp => ({
            role: sanitizeString(exp.role) || 'Position',
            company: sanitizeString(exp.company) || 'Company',
            duration: sanitizeString(exp.duration),
            description: sanitizeString(exp.description),
        })),
        education: (data.education || []).map(edu => ({
            degree: sanitizeString(edu.degree) || 'Degree',
            institution: sanitizeString(edu.institution) || 'Institution',
            graduation_year: sanitizeString(edu.graduation_year),
        })),
    };
}

export async function POST(request: NextRequest) {
    try {
        const resume: ResumeData = await request.json();

        console.log('📄 [export/pdf] Processing resume for:', resume.name);

        // Sanitize all data - output is safe JSON, not HTML
        const safeData = sanitizeResumeData(resume);

        // Return JSON that the client will render safely
        // This avoids reflected XSS since we never generate HTML
        return NextResponse.json({
            success: true,
            data: safeData,
            // Include a print-friendly template URL for the client to use
            instructions: 'Use window.print() on the client side to generate PDF',
        }, {
            status: 200,
            headers: {
                'X-Content-Type-Options': 'nosniff',
            },
        });

    } catch (error) {
        console.error('❌ [export/pdf] Error:', error);
        return NextResponse.json(
            { error: 'Failed to process resume data' },
            { status: 500 }
        );
    }
}
