import { NextRequest, NextResponse } from 'next/server';
import { callAI, extractJSON, OPENROUTER_API_KEY } from '@/lib/ai-config';

// Vercel serverless config
export const maxDuration = 60;

interface ParsedResume {
    name: string;
    email: string;
    phone: string;
    linkedin: string;
    github: string;
    location: string;
    summary: string;
    experience: {
        company: string;
        role: string;
        duration: string;
        description: string;
    }[];
    education: {
        institution: string;
        degree: string;
        graduation_year: string;
    }[];
    skills: string[];
    projects: {
        name: string;
        description: string;
    }[];
}

const SYSTEM_PROMPT = `You are a resume parser. Extract information from the resume text and return ONLY a valid JSON object.
Do not include any explanation or markdown formatting, just the raw JSON.

Return this exact JSON structure:
{
    "name": "full name",
    "email": "email address",
    "phone": "phone number",
    "linkedin": "linkedin url",
    "github": "github url",
    "location": "city, state",
    "summary": "professional summary",
    "experience": [{"company": "name", "role": "title", "duration": "dates", "description": "bullet points"}],
    "education": [{"institution": "school", "degree": "degree", "graduation_year": "year"}],
    "skills": ["skill1", "skill2"],
    "projects": [{"name": "project", "description": "description"}]
}`;

async function parseResumeWithAI(text: string): Promise<ParsedResume> {
    console.log('🤖 [parse-resume] Calling AI to parse resume...');

    const prompt = `Parse this resume and extract all information into JSON format:\n\n${text.substring(0, 8000)}`;

    const response = await callAI(prompt, SYSTEM_PROMPT, { temperature: 0.1, maxTokens: 2500 });

    const jsonStr = extractJSON(response);
    const parsed = JSON.parse(jsonStr);

    return {
        name: parsed.name || '',
        email: parsed.email || '',
        phone: parsed.phone || '',
        linkedin: parsed.linkedin || '',
        github: parsed.github || '',
        location: parsed.location || '',
        summary: parsed.summary || '',
        experience: Array.isArray(parsed.experience) ? parsed.experience : [],
        education: Array.isArray(parsed.education) ? parsed.education : [],
        skills: Array.isArray(parsed.skills) ? parsed.skills : [],
        projects: Array.isArray(parsed.projects) ? parsed.projects : [],
    };
}

function parseResumeWithRegex(text: string): ParsedResume {
    console.log('⚙️ [parse-resume] Using regex fallback');

    const emailMatch = text.match(/[\w.-]+@[\w.-]+\.\w+/);
    const phoneMatch = text.match(/(?:\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}/);
    const linkedinMatch = text.match(/linkedin\.com\/in\/[\w-]+/i);
    const githubMatch = text.match(/github\.com\/[\w-]+/i);

    // Extract name (usually first line or before email)
    const lines = text.split('\n').filter(l => l.trim());
    let name = '';
    for (const line of lines.slice(0, 5)) {
        const cleaned = line.trim();
        if (cleaned.length > 2 && cleaned.length < 50 && !cleaned.includes('@') && !cleaned.includes('http')) {
            name = cleaned;
            break;
        }
    }

    // Extract skills
    const skillsSection = text.match(/skills[:\s]*([\s\S]*?)(?:\n\n|experience|education|$)/i);
    const skills: string[] = [];
    if (skillsSection) {
        const skillText = skillsSection[1];
        const skillPatterns = skillText.match(/[\w\s.#+]+/g) || [];
        for (const s of skillPatterns) {
            const cleaned = s.trim();
            if (cleaned.length > 1 && cleaned.length < 30) {
                skills.push(cleaned);
            }
        }
    }

    return {
        name,
        email: emailMatch?.[0] || '',
        phone: phoneMatch?.[0] || '',
        linkedin: linkedinMatch?.[0] || '',
        github: githubMatch?.[0] || '',
        location: '',
        summary: '',
        experience: [],
        education: [],
        skills: skills.slice(0, 20),
        projects: [],
    };
}

// Fallback PDF text extraction (works when pdf-parse fails)
function extractTextFallback(buffer: Buffer): string {
    console.log('📄 [parse-resume] Using fallback PDF extraction');

    try {
        // Try to extract readable text from PDF buffer
        const text = buffer.toString('utf-8');

        // Extract text between parentheses (common PDF text encoding)
        const textMatches = text.match(/\(([^)]+)\)/g) || [];
        const extractedParts: string[] = [];

        for (const match of textMatches) {
            const content = match.slice(1, -1);
            // Filter for readable text
            if (/^[\x20-\x7E\s]+$/.test(content) && content.length > 1) {
                extractedParts.push(content);
            }
        }

        // Also try to find raw text patterns
        const rawTextPattern = /([A-Za-z][A-Za-z\s,.\-@0-9]+)/g;
        const rawMatches = text.match(rawTextPattern) || [];

        for (const match of rawMatches) {
            if (match.length > 10 && match.length < 200) {
                extractedParts.push(match);
            }
        }

        const result = extractedParts.join(' ').substring(0, 10000);
        console.log('📄 [parse-resume] Fallback extracted:', result.length, 'chars');
        return result;
    } catch (e) {
        console.error('📄 [parse-resume] Fallback extraction failed:', e);
        return '';
    }
}

// PDF text extraction with multiple fallbacks
async function extractTextFromPDF(buffer: ArrayBuffer): Promise<string> {
    console.log('📄 [parse-resume] Extracting PDF text, size:', buffer.byteLength);
    const nodeBuffer = Buffer.from(buffer);

    // Try pdf-parse first
    try {
        const pdfParseModule = await import('pdf-parse');
        const pdfParse = pdfParseModule.default || pdfParseModule;

        if (typeof pdfParse === 'function') {
            const data = await pdfParse(nodeBuffer);

            if (data.text && data.text.trim().length > 50) {
                // Clean the text
                const cleanedText = data.text
                    .replace(/I\+/g, 'Phone: +')
                    .replace(/#/g, 'Email: ')
                    .replace(/ð/g, 'LinkedIn: ')
                    .replace(/[♂¶⌢]/g, '')
                    .replace(/[\uE000-\uF8FF]/g, '')
                    .replace(/[ \t]+/g, ' ')
                    .trim();

                console.log('📄 [parse-resume] pdf-parse success, length:', cleanedText.length);
                return cleanedText;
            }
        }
    } catch (pdfError) {
        console.error('❌ [parse-resume] pdf-parse failed:', pdfError);
    }

    // Fallback extraction
    const fallbackText = extractTextFallback(nodeBuffer);
    if (fallbackText.length > 50) {
        return fallbackText;
    }

    throw new Error('Could not extract text from PDF');
}

export async function POST(request: NextRequest) {
    console.log('📥 [parse-resume] Request received');

    try {
        const formData = await request.formData();
        const file = formData.get('file') as File | null;

        if (!file) {
            return NextResponse.json({ detail: 'No file provided' }, { status: 400 });
        }

        console.log('📥 [parse-resume] File:', file.name, 'Size:', file.size, 'Type:', file.type);

        if (file.size > 10 * 1024 * 1024) {
            return NextResponse.json({ detail: 'File too large (max 10MB)' }, { status: 400 });
        }

        let text = '';
        const fileName = file.name.toLowerCase();

        if (fileName.endsWith('.txt')) {
            text = await file.text();
            console.log('📄 [parse-resume] TXT file, length:', text.length);
        } else if (fileName.endsWith('.pdf')) {
            const buffer = await file.arrayBuffer();
            text = await extractTextFromPDF(buffer);
        } else {
            return NextResponse.json({ detail: 'Unsupported file type. Use PDF or TXT.' }, { status: 400 });
        }

        if (!text || text.length < 20) {
            return NextResponse.json({ detail: 'Could not extract text from file. Try uploading a TXT file instead.' }, { status: 400 });
        }

        console.log('📝 [parse-resume] Text extracted, length:', text.length);

        let result: ParsedResume;

        // Try AI parsing if API key is available
        if (OPENROUTER_API_KEY) {
            try {
                result = await parseResumeWithAI(text);
                console.log('✅ [parse-resume] AI parsing succeeded');
            } catch (aiError) {
                console.error('❌ [parse-resume] AI failed:', aiError);
                result = parseResumeWithRegex(text);
            }
        } else {
            console.log('⚠️ [parse-resume] No API key, using regex');
            result = parseResumeWithRegex(text);
        }

        return NextResponse.json(result);

    } catch (error) {
        console.error('❌ [parse-resume] Error:', error);
        return NextResponse.json(
            { detail: 'Failed to parse resume. Try uploading a TXT file instead.' },
            { status: 500 }
        );
    }
}
