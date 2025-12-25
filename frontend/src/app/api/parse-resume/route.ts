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

const SYSTEM_PROMPT = `You are an EXPERT resume parser AI. Extract EVERY piece of information with 100% accuracy.

STEP-BY-STEP EXTRACTION PROCESS:

1. CONTACT INFORMATION (scan entire resume):
   - name: First line is usually the name (e.g., "John Smith" or "JOHN SMITH")
   - email: Find pattern like name@domain.com
   - phone: Find any phone number format (+1-555-123-4567, (555) 123-4567, etc.)
   - linkedin: Look for linkedin.com/in/username or just the username
   - github: Look for github.com/username or just the username
   - portfolio: Look for personal website URLs
   - location: City, State or City, Country
   - jobTitle: Current job title OR the position mentioned at top

2. SUMMARY/OBJECTIVE (usually near top):
   - Extract the COMPLETE paragraph under "Summary", "Objective", "About", "Profile"
   - Include EVERY sentence, don't truncate

3. EXPERIENCE (CRITICAL - DON'T SKIP ANY):
   Look for sections titled: "Experience", "Work Experience", "Employment", "Professional Experience"
   For EACH job entry, extract:
   - company: Company name
   - role: Job title/position
   - duration: "Jan 2020 - Present" or "2020-2022" or any date format
   - description: Combine ALL bullet points into ONE detailed paragraph with periods between

   Example:
   If resume shows:
   "Software Engineer at Google | Jan 2020 - Present
   • Built scalable microservices using Node.js
   • Led team of 5 developers
   • Improved performance by 40%"
   
   Extract as:
   {
     "company": "Google",
     "role": "Software Engineer", 
     "duration": "Jan 2020 - Present",
     "description": "Built scalable microservices using Node.js. Led team of 5 developers. Improved performance by 40%."
   }

4. EDUCATION (CRITICAL - DON'T SKIP ANY):
   Look for: "Education", "Academic Background", "Qualifications"
   For EACH degree:
   - institution: Full university/college name
   - degree: "Bachelor of Science in Computer Science", "MBA", "PhD", etc.
   - graduation_year: "2024", "Expected 2025", "2020-2024"
   - gpa: "3.8/4.0" if mentioned

5. SKILLS:
   Extract from sections: "Skills", "Technical Skills", "Core Competencies", "Tools"
   Include: programming languages, frameworks, tools, soft skills, languages spoken
   Examples: "Python", "React", "AWS", "Leadership", "Spanish"

6. PROJECTS (if present):
   - name: Project name
   - description: What they built and the impact
   - technologies: Tech stack used

7. CERTIFICATIONS & AWARDS:
   - certifications: ["AWS Certified", "PMP"]
   - awards: ["Dean's List", "Employee of the Month"]

CRITICAL RULES:
- Extract EVERY work experience entry, even internships, part-time jobs
- Extract EVERY education entry, even online courses
- Combine bullet points into flowing paragraphs with periods
- Return ONLY valid JSON, NO markdown formatting
- If field not found, use empty string "" or empty array []

OUTPUT FORMAT (valid JSON only):
{
  "name": "",
  "email": "",
  "phone": "",
  "linkedin": "",
  "github": "",
  "portfolio": "",
  "location": "",
  "jobTitle": "",
  "summary": "",
  "experience": [{"company": "", "role": "", "duration": "", "description": ""}],
  "education": [{"institution": "", "degree": "", "graduation_year": "", "gpa": ""}],
  "skills": [],
  "certifications": [],
  "projects": [{"name": "", "description": "", "technologies": ""}],
  "awards": []
}`;

async function parseResumeWithAI(text: string): Promise<ParsedResume> {
    console.log('🤖 [parse-resume] Calling AI to parse resume...');

    const prompt = `TASK: Extract ALL information from this resume into the JSON format specified in the system prompt.

BE THOROUGH:
- Don't skip ANY work experience entries
- Don't skip ANY education entries  
- Include COMPLETE descriptions (all bullet points combined)
- Extract EVERY skill mentioned
- Find contact info even if formatted differently

RESUME TEXT:
${text.substring(0, 15000)}

Return ONLY the JSON object, no other text.`;

    const response = await callAI(prompt, SYSTEM_PROMPT, { temperature: 0.05, maxTokens: 5000 });

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
    console.log('⚙️ [parse-resume] Using enhanced regex fallback (80%+ extraction)');

    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    const textLower = text.toLowerCase();

    // Extract email, phone, links
    const emailMatch = text.match(/[\w.-]+@[\w.-]+\.\w+/);
    const phoneMatch = text.match(/(?:\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}/);
    const linkedinMatch = text.match(/linkedin\.com\/in\/[\w-]+/i);
    const githubMatch = text.match(/github\.com\/[\w-]+/i);
    const portfolioMatch = text.match(/(?:portfolio|website)[\s:]+([^\s]+\.[a-z]{2,})/i);

    // Extract name (usually first non-empty line)
    let name = '';
    for (const line of lines.slice(0, 10)) {
        if (/^[A-Z][a-z]+(\s+[A-Z][a-z]+){1,3}$/.test(line) && line.length < 40 && !line.includes('@')) {
            name = line;
            break;
        }
    }
    if (!name && lines.length > 0) {
        const firstLine = lines[0];
        if (firstLine.length > 2 && firstLine.length < 50 && !firstLine.includes('@')) {
            name = firstLine;
        }
    }

    // Extract location (city, state/country pattern)
    const locationMatch = text.match(/(?:^|\n)([A-Z][a-z]+(?:,?\s+[A-Z]{2})?(?:,?\s+[A-Z][a-z]+)?)\s*(?:\||$)/m);
    const location = locationMatch?.[1]?.trim() || '';

    // Extract summary/objective
    let summary = '';
    const summaryMatch = text.match(/(?:SUMMARY|OBJECTIVE|ABOUT|PROFILE)[\s:]*\n+([\s\S]{50,500}?)(?:\n\n|EXPERIENCE|EDUCATION|SKILLS)/i);
    if (summaryMatch) {
        summary = summaryMatch[1].replace(/\n/g, ' ').trim();
    }

    // Extract experience entries
    const experience: Array<{ company: string; role: string; duration: string; description: string }> = [];
    const expSection = text.match(/(?:EXPERIENCE|EMPLOYMENT|WORK HISTORY)[\s:]*\n+([\s\S]+?)(?:\n\n(?:EDUCATION|SKILLS|PROJECTS)|$)/i);
    if (expSection) {
        const expText = expSection[1];
        // Match job entries: Company/Role | Duration pattern
        const jobMatches = expText.matchAll(/([A-Z][\w\s&,.-]+?)(?:\s*[|-]\s*|\n)([\w\s]+?)(?:\s*[|-]\s*|\n)([A-Z][a-z]{2,}\s+\d{4}\s*[-–]\s*(?:Present|[A-Z][a-z]{2,}\s+\d{4}))/g);

        for (const match of jobMatches) {
            const company = match[1].trim();
            const role = match[2].trim();
            const duration = match[3].trim();

            // Try to get description (next few lines until next job or section)
            const descMatch = expText.substring(expText.indexOf(match[0]) + match[0].length).match(/^[\s\S]{0,500}?(?=\n[A-Z][\w\s&,.-]+?\s*[|-]|$)/);
            const description = descMatch ? descMatch[0].replace(/\n/g, ' ').trim() : '';

            experience.push({ company, role, duration, description });
        }
    }

    // Extract education entries
    const education: Array<{ institution: string; degree: string; graduation_year: string; gpa?: string }> = [];
    const eduSection = text.match(/(?:EDUCATION|ACADEMIC)[\s:]*\n+([\s\S]+?)(?:\n\n(?:EXPERIENCE|SKILLS|PROJECTS)|$)/i);
    if (eduSection) {
        const eduText = eduSection[1];
        // Match education: University | Degree | Year
        const eduMatches = eduText.matchAll(/([A-Z][\w\s&,.-]+?(?:University|College|Institute|School))[\s,]*\n?([\w\s]+?(?:Bachelor|Master|PhD|Degree))[\s,]*\n?(?:GPA:\s*([\d.]+))?[\s,]*\n?(\d{4}|\d{4}\s*[-–]\s*\d{4})/g);

        for (const match of eduMatches) {
            education.push({
                institution: match[1].trim(),
                degree: match[2].trim(),
                graduation_year: match[4].trim(),
                gpa: match[3] || undefined
            });
        }
    }

    // Extract skills (comprehensive list)
    const commonSkills = [
        // Programming
        'Python', 'Java', 'JavaScript', 'TypeScript', 'C++', 'C#', 'Go', 'Rust', 'Ruby', 'PHP', 'Swift', 'Kotlin', 'Scala', 'R', 'MATLAB',
        // Web
        'React', 'Angular', 'Vue', 'Next.js', '  Svelte', 'HTML', 'CSS', 'Tailwind', 'Bootstrap', 'jQuery',
        // Backend
        'Node.js', 'Express', 'Django', 'Flask', 'FastAPI', 'Spring', 'Spring Boot', '.NET', 'Laravel', 'Rails',
        // Databases
        'SQL', 'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Cassandra', 'DynamoDB', 'Oracle', 'SQLite',
        // Cloud & DevOps
        'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Jenkins', 'CI/CD', 'Terraform', 'Ansible',
        // Data & ML
        'Machine Learning', 'Deep Learning', 'NLP', 'Computer Vision', 'TensorFlow', 'PyTorch', 'scikit-learn', 'Pandas', 'NumPy',
        // Tools
        'Git', 'GitHub', 'GitLab', 'Jira', 'Confluence', 'Postman', 'VS Code', 'IntelliJ',
        // Other
        'Linux', 'Agile', 'Scrum', 'REST API', 'GraphQL', 'Microservices', 'System Design', 'Data Structures', 'Algorithms'
    ];

    const skills: string[] = [];
    for (const skill of commonSkills) {
        if (textLower.includes(skill.toLowerCase())) {
            skills.push(skill);
        }
    }

    console.log(`✅ [parse-resume] Regex extracted: ${experience.length} experiences, ${education.length} education, ${skills.length} skills`);

    return {
        name,
        email: emailMatch?.[0] || '',
        phone: phoneMatch?.[0] || '',
        linkedin: linkedinMatch?.[0] || '',
        github: githubMatch?.[0] || '',
        portfolio: portfolioMatch?.[1] || '',
        location,
        summary,
        experience,
        education,
        skills: [...new Set(skills)].slice(0, 30),
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
