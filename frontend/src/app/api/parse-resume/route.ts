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

    // Extract name (usually first non-empty line that looks like a name)
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    let name = '';
    for (const line of lines.slice(0, 10)) {
        // Name usually has 2-4 words, no special chars except spaces
        if (/^[A-Z][a-z]+(\s+[A-Z][a-z]+){1,3}$/.test(line) && line.length < 40) {
            name = line;
            break;
        }
    }
    // Fallback: first line if no proper name found
    if (!name && lines.length > 0) {
        const firstLine = lines[0];
        if (firstLine.length > 2 && firstLine.length < 50 && !firstLine.includes('@')) {
            name = firstLine;
        }
    }

    // Extract skills from known skill keywords
    const commonSkills = ['Python', 'Java', 'JavaScript', 'TypeScript', 'React', 'Angular', 'Vue',
        'Node.js', 'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'SQL', 'MongoDB', 'PostgreSQL',
        'Git', 'Linux', 'Spring', 'Django', 'Flask', 'TensorFlow', 'PyTorch', 'C++', 'C#', 'Go',
        'Ruby', 'PHP', 'Swift', 'Kotlin', 'Scala', 'Rust', 'Redis', 'Kafka', 'Jenkins', 'CI/CD',
        'Machine Learning', 'Deep Learning', 'Data Science', 'Tableau', 'Power BI', 'Excel'];

    const skills: string[] = [];
    const textLower = text.toLowerCase();
    for (const skill of commonSkills) {
        if (textLower.includes(skill.toLowerCase())) {
            skills.push(skill);
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
        skills: [...new Set(skills)].slice(0, 25),
        projects: [],
    };
}

// PDF text extraction using pdfjs-dist (works in serverless)
async function extractTextFromPDF(buffer: ArrayBuffer): Promise<string> {
    console.log('📄 [parse-resume] Extracting PDF text, size:', buffer.byteLength);

    // Try pdfjs-dist first (works well in serverless)
    try {
        const pdfjsLib = await import('pdfjs-dist');

        // Load the PDF document
        const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(buffer) });
        const pdf = await loadingTask.promise;

        console.log('📄 [parse-resume] PDF loaded, pages:', pdf.numPages);

        let fullText = '';

        // Extract text from each page
        for (let i = 1; i <= Math.min(pdf.numPages, 10); i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const pageText = textContent.items.map((item: any) => item.str || '').join(' ');
            fullText += pageText + '\n';
        }

        // Clean up the extracted text
        const cleanedText = fullText
            .replace(/\s+/g, ' ')
            .replace(/\n\s*\n/g, '\n')
            .trim();

        console.log('📄 [parse-resume] pdfjs-dist extracted:', cleanedText.length, 'chars');

        if (cleanedText.length > 100) {
            return cleanedText;
        }
    } catch (pdfjsError) {
        console.error('❌ [parse-resume] pdfjs-dist failed:', pdfjsError);
    }

    // Fallback: try pdf-parse
    try {
        const pdfParseModule = await import('pdf-parse');
        const pdfParse = pdfParseModule.default || pdfParseModule;

        if (typeof pdfParse === 'function') {
            const data = await pdfParse(Buffer.from(buffer));

            if (data.text && data.text.trim().length > 50) {
                const cleanedText = data.text
                    .replace(/I\+/g, 'Phone: +')
                    .replace(/#/g, 'Email: ')
                    .replace(/ð/g, 'LinkedIn: ')
                    .replace(/[♂¶⌢]/g, '')
                    .replace(/[\uE000-\uF8FF]/g, '')
                    .replace(/[ \t]+/g, ' ')
                    .trim();

                console.log('📄 [parse-resume] pdf-parse fallback:', cleanedText.length, 'chars');
                return cleanedText;
            }
        }
    } catch (pdfParseError) {
        console.error('❌ [parse-resume] pdf-parse fallback failed:', pdfParseError);
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
            return NextResponse.json({
                detail: 'Could not extract text from file. Try copying your resume text and saving as a .txt file.'
            }, { status: 400 });
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
