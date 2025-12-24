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

// Allowed domains for job extraction (SSRF protection)
const ALLOWED_DOMAINS = new Set([
    'linkedin.com', 'www.linkedin.com',
    'indeed.com', 'www.indeed.com',
    'greenhouse.io', 'boards.greenhouse.io',
    'lever.co', 'jobs.lever.co',
    'workday.com', 'myworkdayjobs.com',
    'glassdoor.com', 'www.glassdoor.com',
    'ziprecruiter.com', 'www.ziprecruiter.com',
    'monster.com', 'www.monster.com',
    'angel.co', 'www.wellfound.com', 'wellfound.com',
    'dice.com', 'www.dice.com',
    'careerbuilder.com', 'www.careerbuilder.com',
    'simplyhired.com', 'www.simplyhired.com',
    'google.com', 'careers.google.com',
    'apple.com', 'jobs.apple.com',
    'microsoft.com', 'careers.microsoft.com',
    'amazon.jobs', 'www.amazon.jobs',
    'meta.com', 'www.metacareers.com',
    'netflix.com', 'jobs.netflix.com',
]);

// Validate URL to prevent SSRF attacks
function validateUrl(urlString: string): { isValid: boolean; error?: string } {
    try {
        const url = new URL(urlString);

        // Only allow HTTPS
        if (url.protocol !== 'https:') {
            return { isValid: false, error: 'Only HTTPS URLs are allowed' };
        }

        // Extract domain without subdomains for main check
        const hostname = url.hostname.toLowerCase();

        // Check against allowlist
        const isAllowed = Array.from(ALLOWED_DOMAINS).some(domain =>
            hostname === domain || hostname.endsWith(`.${domain}`)
        );

        if (!isAllowed) {
            // Allow if it's a common job board pattern
            const jobBoardPatterns = [
                /^.*\.greenhouse\.io$/,
                /^.*\.lever\.co$/,
                /^.*\.workday\.com$/,
                /^.*\.myworkdayjobs\.com$/,
                /^careers?\./,
                /^jobs?\./,
                /^.*\.icims\.com$/,
                /^.*\.taleo\.net$/,
                /^.*\.smartrecruiters\.com$/,
            ];

            const isJobBoard = jobBoardPatterns.some(pattern => pattern.test(hostname));

            if (!isJobBoard) {
                return {
                    isValid: false,
                    error: 'This domain is not in our allowed job board list. Please use a direct link from LinkedIn, Indeed, Greenhouse, Lever, or other major job boards.'
                };
            }
        }

        // Block private/internal IPs (SSRF protection)
        const privateIpPatterns = [
            /^localhost$/i,
            /^127\./,
            /^10\./,
            /^192\.168\./,
            /^172\.(1[6-9]|2[0-9]|3[01])\./,
            /^169\.254\./,
            /^0\./,
            /^\[::1\]$/,
            /^\[fc/i,
            /^\[fd/i,
            /^\[fe80:/i,
        ];

        if (privateIpPatterns.some(pattern => pattern.test(hostname))) {
            return { isValid: false, error: 'Private IP addresses are not allowed' };
        }

        return { isValid: true };
    } catch {
        return { isValid: false, error: 'Invalid URL format' };
    }
}

async function fetchJobPage(url: string): Promise<string> {
    const response = await fetch(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
        // Prevent following redirects to potentially malicious URLs
        redirect: 'manual',
    });

    // Handle redirects safely
    if (response.status >= 300 && response.status < 400) {
        const redirectUrl = response.headers.get('location');
        if (redirectUrl) {
            // Validate redirect URL too
            const validation = validateUrl(redirectUrl);
            if (!validation.isValid) {
                throw new Error(`Redirect to unsafe URL blocked: ${validation.error}`);
            }
            // Follow the redirect safely
            return fetchJobPage(redirectUrl);
        }
    }

    if (!response.ok) {
        throw new Error(`Failed to fetch job page: ${response.status}`);
    }

    return response.text();
}

// Secure text extraction using DOM-safe approach (not regex on untrusted input)
function extractTextContent(html: string): string {
    // First remove dangerous content
    let text = html;

    // Remove script, style, and other dangerous tags completely
    const dangerousTags = ['script', 'style', 'noscript', 'iframe', 'object', 'embed', 'form', 'input'];
    for (const tag of dangerousTags) {
        const regex = new RegExp(`<${tag}[^>]*>[\\s\\S]*?<\\/${tag}>`, 'gi');
        text = text.replace(regex, '');
    }

    // Convert common block elements to newlines
    text = text.replace(/<br\s*\/?>/gi, '\n');
    text = text.replace(/<\/(p|div|li|h[1-6]|tr|section|article)>/gi, '\n');

    // Remove all remaining HTML tags
    text = text.replace(/<[^>]+>/g, ' ');

    // Decode HTML entities safely
    text = decodeHtmlEntities(text);

    // Clean up whitespace
    text = text.replace(/\s+/g, ' ');
    text = text.replace(/\n\s*\n/g, '\n\n');

    return text.trim();
}

// Safe HTML entity decoder
function decodeHtmlEntities(text: string): string {
    const entities: Record<string, string> = {
        '&nbsp;': ' ',
        '&amp;': '&',
        '&lt;': '<',
        '&gt;': '>',
        '&quot;': '"',
        '&#39;': "'",
        '&apos;': "'",
        '&copy;': '©',
        '&reg;': '®',
        '&trade;': '™',
        '&mdash;': '—',
        '&ndash;': '–',
        '&bull;': '•',
        '&hellip;': '…',
    };

    let result = text;
    for (const [entity, char] of Object.entries(entities)) {
        result = result.split(entity).join(char);
    }

    // Handle numeric entities
    result = result.replace(/&#(\d+);/g, (_, num) => {
        const code = parseInt(num, 10);
        if (code > 0 && code < 0x10FFFF) {
            return String.fromCodePoint(code);
        }
        return '';
    });

    result = result.replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => {
        const code = parseInt(hex, 16);
        if (code > 0 && code < 0x10FFFF) {
            return String.fromCodePoint(code);
        }
        return '';
    });

    return result;
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

    // Create a clean description (truncate for safety)
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

        // Validate URL for SSRF protection
        const validation = validateUrl(url);
        if (!validation.isValid) {
            return NextResponse.json(
                { error: validation.error },
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
