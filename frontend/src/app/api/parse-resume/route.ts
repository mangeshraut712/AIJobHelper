import { NextRequest, NextResponse } from 'next/server';

// OpenRouter API Configuration
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '';
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

// Available models
const MODELS = {
    grok: 'x-ai/grok-2-vision-1212',
    gemini: 'google/gemini-2.0-flash-exp:free',
};

// For Vercel deployment: Use the local Python backend in development
// In production on Vercel, we use pdf-parse for PDFs and regex for parsing
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';

async function callOpenRouter(prompt: string, systemPrompt: string): Promise<string> {
    if (!OPENROUTER_API_KEY) {
        throw new Error('OpenRouter API key not configured');
    }

    const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://ai-job-helper-steel.vercel.app',
            'X-Title': 'CareerAgentPro Resume Parser',
        },
        body: JSON.stringify({
            model: MODELS.grok,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: prompt },
            ],
            temperature: 0.1,
            max_tokens: 4000,
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ OpenRouter API error:', response.status, errorText);
        throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || '';
}

// Regex extraction helpers (Fallback)
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

// ... other extractors kept simple or omitted for brevity if not strictly needed for fallback ...

async function parseResumeWithAI(text: string) {
    const systemPrompt = `You are a precise resume parser. Extract structured data from the resume text properly. Return ONLY valid JSON.
    Structure:
    {
        "name": "Full Name",
        "email": "email",
        "phone": "phone",
        "linkedin": "url",
        "github": "url",
        "location": "City, State",
        "summary": "Professional summary...",
        "experience": [{ "company": "", "role": "", "duration": "", "location": "", "description": "" }],
        "education": [{ "institution": "", "degree": "", "graduation_year": "", "field": "" }],
        "skills": ["skill1", "skill2"],
        "projects": [{ "name": "", "description": "" }]
    }`;

    const prompt = `Parse the following resume text into the specified JSON structure:\n\n${text.slice(0, 10000)}`;

    try {
        console.log('🚀 [parse-resume] Calling OpenRouter for parsing...');
        const aiResponse = await callOpenRouter(prompt, systemPrompt);

        let cleanedResponse = aiResponse;
        if (cleanedResponse.includes('```json')) {
            cleanedResponse = cleanedResponse.split('```json')[1].split('```')[0].trim();
        } else if (cleanedResponse.includes('```')) {
            cleanedResponse = cleanedResponse.split('```')[1].split('```')[0].trim();
        }

        return JSON.parse(cleanedResponse);
    } catch (error) {
        console.error('❌ [parse-resume] AI Parsing failed:', error);
        throw error;
    }
}

async function parseResumeText(text: string) {
    // Regex fallback
    text = text.replace(/[♂¶]/g, '');
    const name = extractName(text);
    const email = extractEmail(text);
    const phone = extractPhone(text);
    return {
        name, email, phone,
        summary: '',
        experience: [],
        education: [],
        skills: [],
    };
}

async function extractTextFromPDF(buffer: ArrayBuffer): Promise<string> {
    try {
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
            return NextResponse.json({ detail: 'No file provided' }, { status: 400 });
        }

        const fileName = file.name.toLowerCase();
        let text = '';

        if (fileName.endsWith('.txt')) {
            text = await file.text();
        } else if (fileName.endsWith('.pdf')) {
            try {
                const buffer = await file.arrayBuffer();
                text = await extractTextFromPDF(buffer);
            } catch {
                return NextResponse.json({ detail: 'Could not parse PDF file.' }, { status: 400 });
            }
        } else {
            // Fallback to python for docx if configured, else formatting error
            if (process.env.VERCEL !== '1' && fileName.endsWith('.docx')) {
                // Try backend
                try {
                    const backendFormData = new FormData();
                    backendFormData.append('file', file);
                    const response = await fetch(`${BACKEND_URL}/parse-resume`, { method: 'POST', body: backendFormData });
                    if (response.ok) return NextResponse.json(await response.json());
                } catch { }
            }
            return NextResponse.json({ detail: 'Unsupported file type. Please use PDF or TXT.' }, { status: 400 });
        }

        // Parse extracted text
        if (text && text.trim()) {
            // Try AI first
            if (OPENROUTER_API_KEY) {
                try {
                    const parsed = await parseResumeWithAI(text);
                    return NextResponse.json(parsed);
                } catch {
                    console.error('Fallback to regex due to AI error');
                }
            }

            // Fallback to Regex
            const parsed = await parseResumeText(text);
            return NextResponse.json(parsed);
        }

        return NextResponse.json({ detail: 'Could not extract text.' }, { status: 400 });

    } catch (error) {
        console.error('Resume parse error:', error);
        return NextResponse.json({ detail: 'Failed to process resume file' }, { status: 500 });
    }
}
