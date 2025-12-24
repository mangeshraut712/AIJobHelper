import { NextRequest, NextResponse } from 'next/server';

interface JobExtractionResult {
    title: string;
    company: string;
    location: string;
    description: string;
    skills: string[];
    requirements: string[];
    responsibilities: string[];
    salary?: string;
    job_type?: string;
}

// Note: Future enhancement - add platform-specific parsing for LinkedIn, Greenhouse, etc.

async function fetchJobPage(url: string): Promise<string> {
    const response = await fetch(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch job page: ${response.status}`);
    }

    return response.text();
}

function extractTextContent(html: string): string {
    // Remove script and style tags
    let text = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
    text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
    // Remove HTML tags but keep some structure
    text = text.replace(/<br\s*\/?>/gi, '\n');
    text = text.replace(/<\/p>/gi, '\n\n');
    text = text.replace(/<\/div>/gi, '\n');
    text = text.replace(/<\/li>/gi, '\n');
    text = text.replace(/<[^>]+>/g, ' ');
    // Clean up whitespace
    text = text.replace(/&nbsp;/g, ' ');
    text = text.replace(/&amp;/g, '&');
    text = text.replace(/&lt;/g, '<');
    text = text.replace(/&gt;/g, '>');
    text = text.replace(/\s+/g, ' ');
    return text.trim();
}

function extractSkills(text: string): string[] {
    const commonSkills = [
        'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Go', 'Rust', 'Ruby',
        'React', 'Angular', 'Vue', 'Next.js', 'Node.js', 'Express', 'Django', 'Flask',
        'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'CI/CD', 'Git',
        'SQL', 'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'GraphQL', 'REST',
        'Machine Learning', 'AI', 'Data Science', 'TensorFlow', 'PyTorch',
        'Agile', 'Scrum', 'Jira', 'Leadership', 'Communication'
    ];

    const foundSkills: string[] = [];
    const lowerText = text.toLowerCase();

    commonSkills.forEach(skill => {
        if (lowerText.includes(skill.toLowerCase())) {
            foundSkills.push(skill);
        }
    });

    return [...new Set(foundSkills)];
}

function extractJobDetails(text: string): JobExtractionResult {
    // Try to find job title
    const titlePatterns = [
        /(?:job title|position|role):\s*([^\n]{5,80})/i,
        /^([A-Z][^\n]{10,60})\s*(?:at|@)/m,
    ];

    let title = 'Untitled Position';
    for (const pattern of titlePatterns) {
        const match = text.match(pattern);
        if (match) {
            title = match[1].trim();
            break;
        }
    }

    // Try to find company name
    const companyPatterns = [
        /(?:company|employer):\s*([^\n]{2,50})/i,
        /(?:at|@)\s+([A-Z][A-Za-z0-9\s]{2,40}?)(?:\s|$|,)/,
    ];

    let company = 'Unknown Company';
    for (const pattern of companyPatterns) {
        const match = text.match(pattern);
        if (match) {
            company = match[1].trim();
            break;
        }
    }

    // Extract location
    const locationMatch = text.match(/(?:location|based in|office in):\s*([^\n]{5,50})/i);
    const location = locationMatch ? locationMatch[1].trim() : 'Location not specified';

    // Extract skills
    const skills = extractSkills(text);

    // Create a clean description
    const description = text.slice(0, 2000);

    // Extract requirements and responsibilities
    const requirements: string[] = [];
    const responsibilities: string[] = [];

    const lines = text.split('\n').filter(l => l.trim().length > 10);
    lines.forEach(line => {
        if (line.match(/required|must have|qualifications/i)) {
            requirements.push(line.trim().slice(0, 200));
        }
        if (line.match(/responsibilities|duties|you will/i)) {
            responsibilities.push(line.trim().slice(0, 200));
        }
    });

    return {
        title,
        company,
        location,
        description,
        skills: skills.slice(0, 15),
        requirements: requirements.slice(0, 10),
        responsibilities: responsibilities.slice(0, 10),
    };
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { url } = body;

        if (!url || typeof url !== 'string') {
            return NextResponse.json(
                { error: 'URL is required' },
                { status: 400 }
            );
        }

        // Validate URL format
        try {
            new URL(url);
        } catch {
            return NextResponse.json(
                { error: 'Invalid URL format' },
                { status: 400 }
            );
        }

        console.log('📥 [extract-job] Fetching URL:', url);

        // Fetch the job page
        const html = await fetchJobPage(url);
        const text = extractTextContent(html);

        if (!text || text.length < 100) {
            return NextResponse.json(
                { error: 'Could not extract job content from this URL' },
                { status: 400 }
            );
        }

        // Extract job details
        const jobData = extractJobDetails(text);

        console.log('✅ [extract-job] Extracted job:', jobData.title, 'at', jobData.company);

        return NextResponse.json(jobData);

    } catch (error) {
        console.error('❌ [extract-job] Error:', error);
        return NextResponse.json(
            { error: 'Failed to extract job details', details: String(error) },
            { status: 500 }
        );
    }
}
