import { NextRequest, NextResponse } from 'next/server';

// OpenRouter API Configuration - Uses Vercel environment variables
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '';
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

// Model priority chain - tries Grok first (if credits), then reliable free models
const MODELS = {
    grok: 'x-ai/grok-4.1-fast',                           // Best quality (requires credits)
    primary: 'meta-llama/llama-3.2-3b-instruct:free',     // Reliable free - best for JSON
    secondary: 'deepseek/deepseek-r1-0528:free',          // Good reasoning (free)
    fallback: 'mistralai/mistral-7b-instruct:free',       // Backup free model
};

// Fallback order for parsing
const MODEL_FALLBACK_ORDER = [MODELS.grok, MODELS.primary, MODELS.secondary, MODELS.fallback];

async function callOpenRouter(prompt: string, systemPrompt: string, modelIndex: number = 0): Promise<string> {
    const useModel = MODEL_FALLBACK_ORDER[modelIndex] || MODELS.primary;

    if (!OPENROUTER_API_KEY) {
        throw new Error('OpenRouter API key not configured');
    }

    console.log('🤖 [parse-resume] Trying model:', useModel, `(attempt ${modelIndex + 1}/${MODEL_FALLBACK_ORDER.length})`);

    try {
        const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://ai-job-helper-steel.vercel.app',
                'X-Title': 'CareerAgentPro Resume Parser',
            },
            body: JSON.stringify({
                model: useModel,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: prompt },
                ],
                temperature: 0.1,
                max_tokens: 2000,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ OpenRouter API error:', response.status, errorText);

            // Try next model on credits/rate limit issues
            if ((response.status === 402 || response.status === 429 || response.status === 500)
                && modelIndex < MODEL_FALLBACK_ORDER.length - 1) {
                console.log('🔄 Trying next fallback model...');
                return callOpenRouter(prompt, systemPrompt, modelIndex + 1);
            }
            throw new Error(`OpenRouter API error: ${response.status}`);
        }

        const data = await response.json();
        console.log('✅ [parse-resume] Response received from:', useModel);
        return data.choices?.[0]?.message?.content || '';
    } catch (error) {
        // Try fallback on any error
        if (modelIndex < MODEL_FALLBACK_ORDER.length - 1) {
            console.log('🔄 Error occurred, trying next model...');
            return callOpenRouter(prompt, systemPrompt, modelIndex + 1);
        }
        throw error;
    }
}

// Enhanced regex extraction helpers
function extractEmail(text: string): string {
    const patterns = [
        /[\w.+-]+@[\w.-]+\.\w{2,}/gi,
        /email[:\s]*([^\s@]+@[^\s@]+\.[^\s@]+)/gi,
    ];
    for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match) return match[0].replace(/^email[:\s]*/i, '');
    }
    return '';
}

function extractPhone(text: string): string {
    const patterns = [
        /\+?1?[-.\s]?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/,
        /\+?\d{10,12}/,
        /\(\d{3}\)\s*\d{3}[-.\s]?\d{4}/,
    ];
    for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match) return match[0].trim();
    }
    return '';
}

function extractName(text: string): string {
    const lines = text.split('\n').filter(l => l.trim());
    const skipWords = ['summary', 'skills', 'experience', 'resume', 'cv', 'objective', 'education', 'profile', 'contact'];

    for (const line of lines.slice(0, 10)) {
        const trimmed = line.trim();
        // Skip lines with email, phone, or common headers
        if (trimmed.includes('@') || /^\+?\d/.test(trimmed)) continue;
        if (skipWords.some(w => trimmed.toLowerCase().includes(w))) continue;

        // Name likely starts with capital, 2-4 words, reasonable length
        if (/^[A-Z][a-z]+(\s+[A-Z][a-z]+){0,3}$/.test(trimmed) && trimmed.length < 40) {
            return trimmed;
        }
    }
    return '';
}

function extractLinkedIn(text: string): string {
    const match = text.match(/linkedin\.com\/in\/[\w-]+/i);
    return match ? `https://${match[0]}` : '';
}

function extractGitHub(text: string): string {
    const match = text.match(/github\.com\/[\w-]+/i);
    return match ? `https://${match[0]}` : '';
}

function extractSkills(text: string): string[] {
    // Common tech skills to look for
    const commonSkills = [
        'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Go', 'Rust', 'Swift', 'Kotlin',
        'React', 'Angular', 'Vue', 'Next.js', 'Node.js', 'Express', 'Django', 'Flask', 'FastAPI',
        'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Terraform', 'Jenkins', 'CI/CD',
        'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Elasticsearch', 'GraphQL', 'REST API',
        'Machine Learning', 'Deep Learning', 'TensorFlow', 'PyTorch', 'NLP', 'Computer Vision',
        'Git', 'Agile', 'Scrum', 'HTML', 'CSS', 'Tailwind', 'SASS', 'SQL', 'NoSQL',
    ];

    const found: string[] = [];
    const lowerText = text.toLowerCase();

    for (const skill of commonSkills) {
        if (lowerText.includes(skill.toLowerCase())) {
            found.push(skill);
        }
    }

    return [...new Set(found)].slice(0, 20);
}

function extractExperience(text: string): Array<{ role: string; company: string; duration: string; description: string }> {
    const experiences: Array<{ role: string; company: string; duration: string; description: string }> = [];

    // Look for common patterns like "Role at Company" or "Company | Role"
    const patterns = [
        /(?:^|\n)([A-Z][^,\n]+?)\s+(?:at|@)\s+([A-Z][^\n]+)/gm,
        /(?:^|\n)([A-Z][^|\n]+?)\s*\|\s*([A-Z][^\n]+)/gm,
    ];

    // Also look for date ranges
    const datePattern = /(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\w*\.?\s*\d{4}\s*[-–]\s*(?:Present|Current|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\w*\.?\s*\d{4})/gi;
    const dates = text.match(datePattern) || [];

    // Simple extraction - can be enhanced
    for (let i = 0; i < Math.min(dates.length, 3); i++) {
        experiences.push({
            role: 'Position ' + (i + 1),
            company: 'Company ' + (i + 1),
            duration: dates[i] || '',
            description: '',
        });
    }

    return experiences;
}

function extractEducation(text: string): Array<{ institution: string; degree: string; graduation_year: string }> {
    const education: Array<{ institution: string; degree: string; graduation_year: string }> = [];

    // Look for degree patterns
    const degreePatterns = [
        /(?:Bachelor|Master|B\.?S\.?|M\.?S\.?|B\.?A\.?|M\.?A\.?|Ph\.?D\.?|MBA)[^\n]{5,100}/gi,
    ];

    for (const pattern of degreePatterns) {
        const matches = text.match(pattern) || [];
        for (const match of matches.slice(0, 3)) {
            const yearMatch = match.match(/20\d{2}|19\d{2}/);
            education.push({
                institution: '',
                degree: match.trim(),
                graduation_year: yearMatch ? yearMatch[0] : '',
            });
        }
    }

    return education;
}

async function parseResumeWithAI(text: string) {
    const systemPrompt = `You are a resume parser. Extract data and return ONLY valid JSON, no explanation.`;

    const prompt = `Parse this resume text into JSON:

${text.slice(0, 6000)}

Return this exact structure:
{
  "name": "Full Name",
  "email": "email@example.com",
  "phone": "phone number",
  "linkedin": "linkedin url or empty",
  "github": "github url or empty", 
  "location": "City, State",
  "summary": "Professional summary text",
  "experience": [{"company": "", "role": "", "duration": "", "description": ""}],
  "education": [{"institution": "", "degree": "", "graduation_year": ""}],
  "skills": ["skill1", "skill2"],
  "projects": [{"name": "", "description": ""}]
}

Return ONLY JSON.`;

    try {
        console.log('🚀 [parse-resume] Calling OpenRouter for AI parsing...');
        const aiResponse = await callOpenRouter(prompt, systemPrompt);

        // Clean and extract JSON
        let cleanedResponse = aiResponse;
        if (cleanedResponse.includes('```json')) {
            cleanedResponse = cleanedResponse.split('```json')[1].split('```')[0].trim();
        } else if (cleanedResponse.includes('```')) {
            cleanedResponse = cleanedResponse.split('```')[1].split('```')[0].trim();
        }

        // Try to find JSON object in response
        const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            console.log('✅ [parse-resume] AI parsing successful');
            return parsed;
        }

        throw new Error('Could not find JSON in response');
    } catch (error) {
        console.error('❌ [parse-resume] AI Parsing failed:', error);
        throw error;
    }
}

function parseResumeWithRegex(text: string) {
    // Clean text
    text = text.replace(/[♂¶•·‣⁃∙○●]/g, ' ').replace(/\s+/g, ' ');

    return {
        name: extractName(text),
        email: extractEmail(text),
        phone: extractPhone(text),
        linkedin: extractLinkedIn(text),
        github: extractGitHub(text),
        location: '',
        summary: '',
        experience: extractExperience(text),
        education: extractEducation(text),
        skills: extractSkills(text),
        projects: [],
    };
}

async function extractTextFromPDF(buffer: ArrayBuffer): Promise<string> {
    try {
        // Dynamic import for pdf-parse
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const pdfParseModule = await import('pdf-parse') as any;
        const pdfParse = pdfParseModule.default ?? pdfParseModule;
        const data = await pdfParse(Buffer.from(buffer));
        console.log('📄 [parse-resume] PDF extracted, length:', data.text.length);
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

        console.log('📥 [parse-resume] File received:', file.name, 'Size:', file.size);

        const fileName = file.name.toLowerCase();
        let text = '';

        if (fileName.endsWith('.txt')) {
            text = await file.text();
        } else if (fileName.endsWith('.pdf')) {
            try {
                const buffer = await file.arrayBuffer();
                text = await extractTextFromPDF(buffer);
            } catch (e) {
                console.error('PDF extraction failed:', e);
                return NextResponse.json({ detail: 'Could not parse PDF file. Please try a text file.' }, { status: 400 });
            }
        } else {
            return NextResponse.json({ detail: 'Unsupported file type. Please use PDF or TXT.' }, { status: 400 });
        }

        if (!text || !text.trim()) {
            return NextResponse.json({ detail: 'Could not extract text from file.' }, { status: 400 });
        }

        console.log('📝 [parse-resume] Text extracted, attempting parse...');

        // Try AI parsing first if API key is available
        if (OPENROUTER_API_KEY) {
            try {
                const parsed = await parseResumeWithAI(text);
                // Supplement with regex for any missing fields
                if (!parsed.skills || parsed.skills.length === 0) {
                    parsed.skills = extractSkills(text);
                }
                if (!parsed.email) {
                    parsed.email = extractEmail(text);
                }
                if (!parsed.phone) {
                    parsed.phone = extractPhone(text);
                }
                return NextResponse.json(parsed);
            } catch (e) {
                console.error('AI parsing failed, falling back to regex:', e);
            }
        }

        // Fallback to regex parsing
        console.log('⚙️ [parse-resume] Using regex fallback');
        const parsed = parseResumeWithRegex(text);
        return NextResponse.json(parsed);

    } catch (error) {
        console.error('Resume parse error:', error);
        return NextResponse.json({ detail: 'Failed to process resume file' }, { status: 500 });
    }
}
