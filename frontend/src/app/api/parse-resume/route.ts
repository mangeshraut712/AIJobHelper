import { NextRequest, NextResponse } from 'next/server';

// For Vercel deployment: Use the local Python backend in development
// In production on Vercel, we use pdf-parse for PDFs and regex for parsing
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

async function extractTextFromPDF(buffer: ArrayBuffer): Promise<string> {
    try {
        // Dynamic import for pdf-parse to avoid issues with SSR
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const pdfParseModule = await import('pdf-parse') as any;
        const pdfParse = pdfParseModule.default ?? pdfParseModule;
        const data = await pdfParse(Buffer.from(buffer));
        return data.text;
    } catch (error) {
        console.error('PDF parsing error:', error);
        throw new Error('Failed to parse PDF file');
    }
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

        const fileName = file.name.toLowerCase();
        const isVercel = process.env.VERCEL === '1';

        // First, try to extract text from the file
        let text = '';

        if (fileName.endsWith('.txt')) {
            text = await file.text();
        } else if (fileName.endsWith('.pdf')) {
            try {
                const buffer = await file.arrayBuffer();
                text = await extractTextFromPDF(buffer);
            } catch {
                return NextResponse.json(
                    { detail: 'Could not parse PDF file. Please ensure the PDF contains readable text (not scanned images).' },
                    { status: 400 }
                );
            }
        } else if (fileName.endsWith('.docx')) {
            // DOCX parsing on Vercel is more complex - suggest using .txt or .pdf
            if (isVercel) {
                return NextResponse.json(
                    { detail: 'DOCX files are not fully supported on Vercel. Please upload a PDF or TXT file instead.' },
                    { status: 400 }
                );
            }
        }

        // If we have text, parse it locally
        if (text && text.trim()) {
            const parsed = await parseResumeText(text);
            return NextResponse.json(parsed);
        }

        // Fall back to Python backend (for DOCX or if local parsing fails)
        if (!isVercel) {
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
                return NextResponse.json(
                    { detail: 'Backend server not available. Please ensure the Python backend is running on port 8000.' },
                    { status: 503 }
                );
            }
        }

        return NextResponse.json(
            { detail: 'Could not extract text from the file. Please try a PDF or TXT file.' },
            { status: 400 }
        );
    } catch (error) {
        console.error('Resume parse error:', error);
        return NextResponse.json(
            { detail: 'Failed to process resume file' },
            { status: 500 }
        );
    }
}
