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
    portfolio?: string;
    location: string;
    jobTitle?: string;
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
        gpa?: string;
    }[];
    skills: string[];
    certifications?: string[];
    projects: {
        name: string;
        description: string;
        technologies?: string;
    }[];
    awards?: string[];
}

const SYSTEM_PROMPT = `You are an EXPERT resume parser AI. Your job is to extract EVERY SINGLE piece of information from resumes with 100% accuracy.

CRITICAL RULES:
1. Extract ALL experience entries - never skip any job, even internships or part-time work
2. Extract ALL education entries - every degree, certificate, or course mentioned
3. Extract EVERY skill mentioned anywhere in the resume
4. Combine all bullet points in experience into a single detailed paragraph
5. Return ONLY valid JSON, NO markdown, NO explanations

REQUIRED OUTPUT FORMAT:
{
    "name": "FULL NAME - usually the first line of resume",
    "email": "email@example.com - REQUIRED",
    "phone": "+1-xxx-xxx-xxxx or any format found",
    "linkedin": "linkedin.com/in/username OR just username",
    "github": "github.com/username OR just username",
    "portfolio": "personal website URL if any",
    "location": "City, State/Country",
    "jobTitle": "current title OR title they're applying for",
    "summary": "COMPLETE professional summary - include EVERY sentence from objective/summary section",
    "experience": [
        {
            "company": "Company Name Inc.",
            "role": "Job Title / Position",
            "duration": "Jan 2020 - Present (or any date format)",
            "description": "Combine ALL bullet points into detailed paragraph. Include achievements, technologies, metrics, responsibilities."
        }
    ],
    "education": [
        {
            "institution": "University/College Full Name",
            "degree": "Bachelor of Science, Master of Arts, PhD, etc.",
            "graduation_year": "2024 or Expected 2025",
            "gpa": "3.8/4.0 if mentioned"
        }
    ],
    "skills": ["Extract EVERY technical skill", "soft skill", "programming language", "framework", "tool", "certification", "language spoken"],
    "certifications": ["AWS Certified Solutions Architect", "PMP", "Include issuing org if mentioned"],
    "projects": [
        {
            "name": "Project Name",
            "description": "Full description with impact/results",
            "technologies": "React, Node.js, AWS, etc."
        }
    ],
    "awards": ["Dean's List 2023", "Employee of the Month", "Any achievement/honor"]
}

EMPHASIS:
- EXPERIENCE: Extract EVERY job, internship, volunteer role. Don't skip anything!
- EDUCATION: Extract EVERY degree, certificate, bootcamp, online course
- If field not present: use empty string "" or empty array []
- Be COMPREHENSIVE - more data is better than less!`;

async function parseResumeWithAI(text: string): Promise<ParsedResume> {
    console.log('🤖 [parse-resume] Calling AI to parse resume...');

    const prompt = `Parse this resume and extract ALL information into JSON format. Be comprehensive and don't miss anything:\n\nRESUME TEXT:\n${text.substring(0, 15000)}`;

    const response = await callAI(prompt, SYSTEM_PROMPT, { temperature: 0.1, maxTokens: 4500 });

    const jsonStr = extractJSON(response);
    const parsed = JSON.parse(jsonStr);

    return {
        name: parsed.name || '',
        email: parsed.email || '',
        phone: parsed.phone || '',
        linkedin: parsed.linkedin || '',
        github: parsed.github || '',
        portfolio: parsed.portfolio || '',
        location: parsed.location || '',
        jobTitle: parsed.jobTitle || '',
        summary: parsed.summary || '',
        experience: Array.isArray(parsed.experience) ? parsed.experience : [],
        education: Array.isArray(parsed.education) ? parsed.education : [],
        skills: Array.isArray(parsed.skills) ? parsed.skills : [],
        certifications: Array.isArray(parsed.certifications) ? parsed.certifications : [],
        projects: Array.isArray(parsed.projects) ? parsed.projects : [],
        awards: Array.isArray(parsed.awards) ? parsed.awards : [],
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

// PDF text extraction using pdf-parse (simple and reliable)
async function extractTextFromPDF(buffer: ArrayBuffer): Promise<string> {
    console.log('📄 [parse-resume] Extracting PDF text, size:', buffer.byteLength);

    try {
        const pdfParseModule = await import('pdf-parse');
        const pdfParse = pdfParseModule.default || pdfParseModule;

        if (typeof pdfParse === 'function') {
            // Use Buffer.from() instead of Buffer() to avoid deprecation warning
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

                console.log('📄 [parse-resume] Extracted:', cleanedText.length, 'chars');
                return cleanedText;
            }
        }
    } catch (error) {
        console.error('❌ [parse-resume] pdf-parse failed:', error);
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
