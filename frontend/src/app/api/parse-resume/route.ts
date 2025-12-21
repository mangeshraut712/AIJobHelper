import { NextRequest, NextResponse } from 'next/server';

// For Vercel deployment: Use the local Python backend in development
// In production on Vercel, we'll use a simplified regex-based parser
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';

// Helper to extract text patterns from resume
function extractEmail(text: string): string {
    const match = text.match(/[\w.+-]+@[\w.-]+\.\w+/);
    return match ? match[0] : '';
}

function extractPhone(text: string): string {
    const match = text.match(/\+?1?\d{10,11}|\+?\d{1,3}[\s-]?\d{3}[\s-]?\d{3}[\s-]?\d{4}/);
    return match ? match[0].trim() : '';
}

function extractName(text: string): string {
    const lines = text.split('\n').filter(l => l.trim());
    for (const line of lines.slice(0, 5)) {
        const trimmed = line.trim();
        if (!trimmed.includes('@') && !trimmed.match(/^\d/) && !trimmed.includes('+')) {
            if (trimmed.length > 3 && trimmed.length < 50 && /^[A-Z]/.test(trimmed)) {
                const skipWords = ['summary', 'skills', 'experience', 'resume', 'cv', 'objective', 'education'];
                if (!skipWords.some(w => trimmed.toLowerCase().includes(w))) {
                    return trimmed;
                }
            }
        }
    }
    return '';
}

function extractLinkedIn(text: string): string {
    const match = text.match(/linkedin\.com\/in\/([a-zA-Z0-9\-_]+)/i);
    return match ? `linkedin.com/in/${match[1]}` : '';
}

function extractGitHub(text: string): string {
    const match = text.match(/github\.com\/([a-zA-Z0-9\-_]+)/i);
    return match ? `github.com/${match[1]}` : '';
}

function extractLocation(text: string): string {
    const cities = ['Philadelphia', 'Pune', 'Boston', 'New York', 'San Francisco', 'Seattle', 'Los Angeles', 'Chicago', 'Austin', 'Denver', 'Remote'];
    for (const city of cities) {
        const match = text.match(new RegExp(`${city}[,\\s]*([A-Z]{2})?`, 'i'));
        if (match) {
            return match[0].trim();
        }
    }
    return '';
}

function extractSection(text: string, sectionNames: string[], nextSections: string[]): string {
    const startPattern = sectionNames.join('|');
    const endPattern = nextSections.join('|');
    const regex = new RegExp(`(?:${startPattern})\\s*\\n(.*?)(?=(?:${endPattern})\\s*\\n|$)`, 'is');
    const match = text.match(regex);
    return match ? match[1].trim() : '';
}

function parseSkills(text: string): string[] {
    const skills: string[] = [];
    for (const line of text.split('\n')) {
        let cleanLine = line.trim();
        if (!cleanLine) continue;

        // Remove category labels
        if (cleanLine.includes(':')) {
            cleanLine = cleanLine.split(':')[1] || '';
        }

        // Split by delimiters
        const parts = cleanLine.split(/[,|•]/);
        for (const part of parts) {
            const skill = part.trim().replace(/\([^)]+\)/g, '').trim();
            if (skill && skill.length > 2 && skill.length < 40) {
                skills.push(skill);
            }
        }
    }

    // Remove duplicates
    return [...new Set(skills)].slice(0, 25);
}

async function parseResumeText(text: string) {
    // Clean up text
    text = text.replace(/[♂¶]/g, '');
    text = text.replace(/obile-alt/g, '');
    text = text.replace(/envel⌢/g, '');

    const result = {
        name: extractName(text),
        email: extractEmail(text),
        phone: extractPhone(text),
        linkedin: extractLinkedIn(text),
        github: extractGitHub(text),
        website: '',
        location: extractLocation(text),
        summary: '',
        experience: [] as Array<{ company: string; role: string; duration: string; location: string; description: string }>,
        education: [] as Array<{ institution: string; degree: string; graduation_year: string; gpa: string }>,
        skills: [] as string[],
        projects: [] as Array<{ name: string; description: string }>,
        certifications: [] as string[],
    };

    // Extract summary
    const summarySection = extractSection(text, ['Summary', 'Objective', 'Profile', 'About'], ['Skills', 'Experience', 'Education', 'Technical']);
    if (summarySection) {
        result.summary = summarySection.replace(/\s+/g, ' ').trim().slice(0, 600);
    }

    // Extract skills
    const skillsSection = extractSection(text, ['Skills', 'Technical Skills', 'Skills and Technical Proficiencies'], ['Experience', 'Education', 'Projects', 'Work History']);
    if (skillsSection) {
        result.skills = parseSkills(skillsSection);
    }

    return result;
}

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File | null;

        if (!file) {
            return NextResponse.json(
                { detail: 'No file provided' },
                { status: 400 }
            );
        }

        // For production on Vercel, use regex-based parsing directly
        // since Python serverless functions require separate configuration
        const isVercel = process.env.VERCEL === '1';

        if (isVercel) {
            // Read file as text (works for .txt files)
            // For PDF/DOCX, we need the Python backend
            const fileName = file.name.toLowerCase();

            if (fileName.endsWith('.txt')) {
                const text = await file.text();
                const parsed = await parseResumeText(text);
                return NextResponse.json(parsed);
            } else {
                // For PDF/DOCX on Vercel, return a helpful message
                // In a full implementation, you'd use a Node.js PDF parser like pdf-parse
                return NextResponse.json(
                    { detail: 'PDF and DOCX parsing requires the backend server. Please use a .txt file or run the app locally with the Python backend.' },
                    { status: 400 }
                );
            }
        }

        // In development, proxy to the Python backend
        try {
            const backendFormData = new FormData();
            backendFormData.append('file', file);

            const response = await fetch(`${BACKEND_URL}/parse-resume`, {
                method: 'POST',
                body: backendFormData,
            });

            if (!response.ok) {
                const error = await response.json().catch(() => ({ detail: 'Backend request failed' }));
                return NextResponse.json(error, { status: response.status });
            }

            const data = await response.json();
            return NextResponse.json(data);
        } catch {
            // If backend is not available, fall back to local parsing
            const fileName = file.name.toLowerCase();
            if (fileName.endsWith('.txt')) {
                const text = await file.text();
                const parsed = await parseResumeText(text);
                return NextResponse.json(parsed);
            }
            return NextResponse.json(
                { detail: 'Backend server not available. Please ensure the Python backend is running on port 8000.' },
                { status: 503 }
            );
        }
    } catch (error) {
        console.error('Resume parse error:', error);
        return NextResponse.json(
            { detail: 'Failed to process resume file' },
            { status: 500 }
        );
    }
}
