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

// Vercel serverless config - increase timeout for PDF processing
export const maxDuration = 30; // seconds

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
    ];
    for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match) return match[0];
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
        if (trimmed.includes('@') || /^\+?\d/.test(trimmed)) continue;
        if (skipWords.some(w => trimmed.toLowerCase().includes(w))) continue;

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

    const datePattern = /(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\w*\.?\s*\d{4}\s*[-–]\s*(?:Present|Current|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\w*\.?\s*\d{4})/gi;
    const dates = text.match(datePattern) || [];

    for (let i = 0; i < Math.min(dates.length, 5); i++) {
        experiences.push({
            role: '',
            company: '',
            duration: dates[i] || '',
            description: '',
        });
    }

    return experiences;
}

function extractEducation(text: string): Array<{ institution: string; degree: string; graduation_year: string }> {
    const education: Array<{ institution: string; degree: string; graduation_year: string }> = [];

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

        let cleanedResponse = aiResponse;
        if (cleanedResponse.includes('```json')) {
            cleanedResponse = cleanedResponse.split('```json')[1].split('```')[0].trim();
        } else if (cleanedResponse.includes('```')) {
            cleanedResponse = cleanedResponse.split('```')[1].split('```')[0].trim();
        }

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

// PDF text extraction with Vercel-compatible workaround
async function extractTextFromPDF(buffer: ArrayBuffer): Promise<string> {
    console.log('📄 [parse-resume] Starting PDF extraction, buffer size:', buffer.byteLength);

    // Timeout for PDF parsing (prevent serverless timeout)
    const PARSE_TIMEOUT = 25000; // 25 seconds

    const parseWithTimeout = new Promise<string>(async (resolve, reject) => {
        const timeoutId = setTimeout(() => {
            reject(new Error('PDF parsing timed out'));
        }, PARSE_TIMEOUT);

        try {
            // Dynamic import with error handling for Vercel
            // pdf-parse v1.1.1 exports a function directly
            let pdfParse;
            try {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const pdfModule = await import('pdf-parse') as any;
                // v1 exports function directly, v2 exports object
                pdfParse = typeof pdfModule === 'function' ? pdfModule : (pdfModule.default || pdfModule);

                if (typeof pdfParse !== 'function') {
                    throw new Error('pdf-parse module not a function');
                }
            } catch (importError) {
                clearTimeout(timeoutId);
                console.error('❌ pdf-parse import failed:', importError);
                reject(new Error('PDF parsing library not available'));
                return;
            }

            console.log('📄 [parse-resume] pdf-parse loaded, type:', typeof pdfParse);

            // Parse PDF with simple options (v1 API)
            const data = await pdfParse(Buffer.from(buffer));
            clearTimeout(timeoutId);

            if (!data.text || data.text.trim().length === 0) {
                reject(new Error('No text content extracted from PDF'));
                return;
            }

            console.log('📄 [parse-resume] Raw PDF text length:', data.text.length, 'pages:', data.numpages);

            // Clean up common PDF artifacts and special characters
            let cleanedText = data.text
                // Replace common icon placeholders with labels
                .replace(/I\+/g, 'Phone: +')
                .replace(/#/g, 'Email: ')
                .replace(/ð/g, 'LinkedIn: ')
                // Remove remaining icon characters
                .replace(/[♂¶⌢]/g, '')
                // Remove other unicode artifacts
                .replace(/[\uE000-\uF8FF]/g, '') // Private use area
                .replace(/[\u2022\u2023\u25E6\u2043\u2219]/g, '• ') // Bullet points
                // Clean whitespace but preserve newlines
                .replace(/[ \t]+/g, ' ')
                .replace(/\n\s*\n\s*\n/g, '\n\n')
                .trim();

            console.log('📄 [parse-resume] PDF extracted successfully, cleaned text length:', cleanedText.length);
            resolve(cleanedText);
        } catch (error) {
            clearTimeout(timeoutId);
            console.error('❌ PDF parsing error:', error);
            reject(error);
        }
    });

    return parseWithTimeout;
}

// Simple text extraction fallback - tries to read as UTF-8
async function extractTextFallback(buffer: ArrayBuffer): Promise<string> {
    try {
        // Try to decode as text (works for text-based PDFs sometimes)
        const decoder = new TextDecoder('utf-8', { fatal: false });
        const text = decoder.decode(buffer);

        // Extract readable text using basic patterns
        const textMatches = text.match(/[\x20-\x7E\n\r\t]+/g) || [];
        const cleanText = textMatches
            .filter(s => s.length > 3)
            .join(' ')
            .replace(/\s+/g, ' ')
            .trim();

        if (cleanText.length > 50) {
            console.log('📄 [parse-resume] Fallback extraction got text length:', cleanText.length);
            return cleanText;
        }

        throw new Error('Fallback extraction failed');
    } catch {
        throw new Error('Could not extract text from file');
    }
}

export async function POST(request: NextRequest) {
    console.log('📥 [parse-resume] Request received');

    try {
        const formData = await request.formData();
        const file = formData.get('file') as File | null;

        if (!file) {
            console.error('❌ No file in request');
            return NextResponse.json({ detail: 'No file provided' }, { status: 400 });
        }

        console.log('📥 [parse-resume] File received:', file.name, 'Size:', file.size, 'Type:', file.type);

        // Check file size (limit to 10MB)
        if (file.size > 10 * 1024 * 1024) {
            return NextResponse.json({ detail: 'File too large. Maximum size is 10MB.' }, { status: 400 });
        }

        const fileName = file.name.toLowerCase();
        let text = '';

        if (fileName.endsWith('.txt')) {
            console.log('📝 Processing TXT file...');
            text = await file.text();
        } else if (fileName.endsWith('.pdf')) {
            console.log('📄 Processing PDF file...');
            try {
                const buffer = await file.arrayBuffer();
                text = await extractTextFromPDF(buffer);
            } catch (pdfError) {
                console.error('❌ Primary PDF extraction failed, trying fallback...', pdfError);
                try {
                    const buffer = await file.arrayBuffer();
                    text = await extractTextFallback(buffer);
                } catch (fallbackError) {
                    console.error('❌ Fallback extraction also failed:', fallbackError);
                    return NextResponse.json({
                        detail: 'Could not parse PDF file. The PDF might be scanned or image-based. Please try a text-based PDF or copy the content to a TXT file.'
                    }, { status: 400 });
                }
            }
        } else {
            return NextResponse.json({
                detail: 'Unsupported file type. Please use PDF or TXT files.'
            }, { status: 400 });
        }

        if (!text || text.trim().length < 20) {
            console.error('❌ Extracted text too short:', text?.length || 0);
            return NextResponse.json({
                detail: 'Could not extract enough text from file. Please ensure the file contains readable text.'
            }, { status: 400 });
        }

        console.log('📝 [parse-resume] Text extracted, length:', text.length, 'attempting parse...');

        // Try AI parsing first if API key is available
        if (OPENROUTER_API_KEY) {
            try {
                console.log('🤖 [parse-resume] Attempting AI parsing...');
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

                console.log('✅ [parse-resume] AI parsing complete');
                return NextResponse.json(parsed);
            } catch (aiError) {
                console.error('⚠️ AI parsing failed, falling back to regex:', aiError);
            }
        } else {
            console.log('⚠️ No OPENROUTER_API_KEY, using regex fallback');
        }

        // Fallback to regex parsing
        console.log('⚙️ [parse-resume] Using regex fallback');
        const parsed = parseResumeWithRegex(text);

        console.log('✅ [parse-resume] Regex parsing complete');
        return NextResponse.json(parsed);

    } catch (error) {
        console.error('❌ Resume parse error:', error);
        return NextResponse.json({
            detail: 'Failed to process resume file. Please try again or use a different file format.'
        }, { status: 500 });
    }
}
