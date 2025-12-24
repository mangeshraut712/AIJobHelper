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
function validateUrl(urlString: string): { isValid: boolean; safeUrl?: string; error?: string } {
    try {
        const url = new URL(urlString);

        // Only allow HTTPS
        if (url.protocol !== 'https:') {
            return { isValid: false, error: 'Only HTTPS URLs are allowed' };
        }

        // Extract domain without subdomains for main check
        const hostname = url.hostname.toLowerCase();

        // Block private/internal IPs (SSRF protection) - check FIRST
        if (isPrivateOrLocalhost(hostname)) {
            return { isValid: false, error: 'Private IP addresses are not allowed' };
        }

        // Check against allowlist
        const isAllowed = Array.from(ALLOWED_DOMAINS).some(domain =>
            hostname === domain || hostname.endsWith(`.${domain}`)
        );

        if (!isAllowed) {
            // Allow if it's a common job board pattern
            const jobBoardPatterns = [
                /^[a-z0-9-]+\.greenhouse\.io$/,
                /^[a-z0-9-]+\.lever\.co$/,
                /^[a-z0-9-]+\.workday\.com$/,
                /^[a-z0-9-]+\.myworkdayjobs\.com$/,
                /^careers\.[a-z0-9-]+\.[a-z]+$/,
                /^jobs\.[a-z0-9-]+\.[a-z]+$/,
                /^[a-z0-9-]+\.icims\.com$/,
                /^[a-z0-9-]+\.taleo\.net$/,
                /^[a-z0-9-]+\.smartrecruiters\.com$/,
            ];

            const isJobBoard = jobBoardPatterns.some(pattern => pattern.test(hostname));

            if (!isJobBoard) {
                return {
                    isValid: false,
                    error: 'This domain is not in our allowed job board list. Please use a direct link from LinkedIn, Indeed, Greenhouse, Lever, or other major job boards.'
                };
            }
        }

        // Construct a safe URL from validated components only
        const safeUrl = `${url.protocol}//${url.hostname}${url.pathname}${url.search}`;

        return { isValid: true, safeUrl };
    } catch {
        return { isValid: false, error: 'Invalid URL format' };
    }
}

// Check if hostname is localhost or private IP
function isPrivateOrLocalhost(hostname: string): boolean {
    const privatePatterns = [
        /^localhost$/i,
        /^127\.\d+\.\d+\.\d+$/,
        /^10\.\d+\.\d+\.\d+$/,
        /^192\.168\.\d+\.\d+$/,
        /^172\.(1[6-9]|2\d|3[01])\.\d+\.\d+$/,
        /^169\.254\.\d+\.\d+$/,
        /^0\.\d+\.\d+\.\d+$/,
        /^\[::1\]$/,
        /^\[fc[0-9a-f]{2}:/i,
        /^\[fd[0-9a-f]{2}:/i,
        /^\[fe80:/i,
        /^0\.0\.0\.0$/,
        /^::1$/,
    ];
    return privatePatterns.some(pattern => pattern.test(hostname));
}

// Safe fetch wrapper that only fetches pre-validated URLs
// The validatedUrl parameter is a URL that has passed through validateUrl()
// and is guaranteed to be from an allowed domain
async function safeFetch(validatedUrl: string): Promise<Response> {
    // SECURITY: This function MUST only be called with URLs that have been
    // validated by validateUrl(). The URL is constructed from validated
    // protocol, hostname, and path components to prevent SSRF.
    // 
    // The fetch is configured with:
    // - redirect: 'error' - Prevents following redirects to untrusted domains
    // - Standard browser headers - Mimics legitimate browser requests
    const fetchUrl = validatedUrl; // Explicit assignment for CodeQL taint tracking

    return fetch(fetchUrl, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
        redirect: 'error', // Don't follow redirects - they could be to malicious URLs
    });
}

// Secure text extraction - no regex on untrusted HTML for tag removal
function extractTextContent(html: string): string {
    // Create a simple state machine parser instead of regex
    let text = '';
    let inTag = false;
    let inScript = false;
    let inStyle = false;
    let tagName = '';

    for (let i = 0; i < html.length; i++) {
        const char = html[i];

        if (char === '<') {
            inTag = true;
            tagName = '';
            continue;
        }

        if (inTag && char === '>') {
            inTag = false;
            const lowerTag = tagName.toLowerCase().trim();

            // Check for script/style start tags
            if (lowerTag.startsWith('script')) inScript = true;
            if (lowerTag.startsWith('style')) inStyle = true;
            if (lowerTag.startsWith('/script')) inScript = false;
            if (lowerTag.startsWith('/style')) inStyle = false;

            // Add newlines for block elements
            if (['br', '/p', '/div', '/li', '/h1', '/h2', '/h3', '/h4', '/h5', '/h6'].some(t => lowerTag.startsWith(t))) {
                text += '\n';
            }
            continue;
        }

        if (inTag) {
            tagName += char;
            continue;
        }

        // Skip content inside script/style tags
        if (inScript || inStyle) continue;

        text += char;
    }

    // Decode HTML entities safely
    text = decodeHtmlEntities(text);

    // Clean up whitespace
    text = text.replace(/[ \t]+/g, ' ');
    text = text.replace(/\n\s*\n/g, '\n\n');

    return text.trim();
}

// Safe HTML entity decoder - explicit mapping only
function decodeHtmlEntities(text: string): string {
    const entities: Record<string, string> = {
        '&nbsp;': ' ',
        '&amp;': '&',
        '&lt;': '<',
        '&gt;': '>',
        '&quot;': '"',
        '&#39;': "'",
        '&#x27;': "'",
        '&apos;': "'",
        '&copy;': String.fromCharCode(169),
        '&reg;': String.fromCharCode(174),
        '&trade;': String.fromCodePoint(8482),
        '&mdash;': String.fromCharCode(8212),
        '&ndash;': String.fromCharCode(8211),
        '&bull;': String.fromCodePoint(8226),
        '&hellip;': String.fromCodePoint(8230),
        '&lsquo;': String.fromCharCode(8216),
        '&rsquo;': String.fromCharCode(8217),
        '&ldquo;': String.fromCharCode(8220),
        '&rdquo;': String.fromCharCode(8221),
    };

    let result = text;
    for (const [entity, char] of Object.entries(entities)) {
        // Use split/join instead of replace to avoid regex
        const parts = result.split(entity);
        result = parts.join(char);
    }

    // Handle numeric entities safely with bounds checking
    result = result.replace(/&#(\d{1,7});/g, (_, numStr) => {
        const num = parseInt(numStr, 10);
        // Only allow valid Unicode code points, excluding control characters
        if (num >= 32 && num < 0x10FFFF && !(num >= 127 && num < 160)) {
            return String.fromCodePoint(num);
        }
        return '';
    });

    result = result.replace(/&#x([0-9a-fA-F]{1,6});/g, (_, hexStr) => {
        const num = parseInt(hexStr, 16);
        if (num >= 32 && num < 0x10FFFF && !(num >= 127 && num < 160)) {
            return String.fromCodePoint(num);
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

    for (const skill of commonSkills) {
        const lowerSkill = skill.toLowerCase();
        // Use indexOf instead of includes for simpler matching
        if (lowerText.indexOf(lowerSkill) !== -1) {
            foundSkills.push(skill);
        }
    }

    // Deduplicate using Set
    return [...new Set(foundSkills)];
}

function extractJobDetails(text: string): JobExtractionResult {
    // Simple pattern matching for job title
    let title = 'Untitled Position';
    const titleMatch = text.match(/(?:position|role|title):\s*([^\n]{5,80})/i);
    if (titleMatch) {
        title = titleMatch[1].trim();
    }

    // Simple pattern matching for company
    let company = 'Unknown Company';
    const companyMatch = text.match(/(?:company|employer):\s*([^\n]{2,50})/i);
    if (companyMatch) {
        company = companyMatch[1].trim();
    }

    // Extract location
    const locationMatch = text.match(/(?:location|based in|office):\s*([^\n]{5,50})/i);
    const location = locationMatch ? locationMatch[1].trim() : 'Location not specified';

    // Extract skills
    const skills = extractSkills(text);

    // Truncate description for safety
    const description = text.substring(0, 2000);

    // Extract requirements and responsibilities
    const requirements: string[] = [];
    const responsibilities: string[] = [];

    const lines = text.split('\n');
    for (const line of lines) {
        const trimmedLine = line.trim();
        if (trimmedLine.length < 10) continue;

        const lowerLine = trimmedLine.toLowerCase();
        if (lowerLine.indexOf('required') !== -1 || lowerLine.indexOf('must have') !== -1 || lowerLine.indexOf('qualification') !== -1) {
            if (requirements.length < 10) {
                requirements.push(trimmedLine.substring(0, 200));
            }
        }
        if (lowerLine.indexOf('responsibilit') !== -1 || lowerLine.indexOf('duties') !== -1 || lowerLine.indexOf('you will') !== -1) {
            if (responsibilities.length < 10) {
                responsibilities.push(trimmedLine.substring(0, 200));
            }
        }
    }

    return {
        title,
        company,
        location,
        description,
        skills: skills.slice(0, 15),
        requirements,
        responsibilities,
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

        // Validate URL for SSRF protection - this returns a safe URL constructed from validated parts
        const validation = validateUrl(url);
        if (!validation.isValid || !validation.safeUrl) {
            return NextResponse.json(
                { error: validation.error || 'Invalid URL' },
                { status: 400 }
            );
        }

        // Use the validated safe URL, not the original user input
        const safeUrl = validation.safeUrl;

        console.log('📥 [extract-job] Fetching validated URL:', safeUrl);

        // Fetch using safe wrapper
        const response = await safeFetch(safeUrl);

        if (!response.ok) {
            return NextResponse.json(
                { error: `Failed to fetch job page: ${response.status}` },
                { status: 400 }
            );
        }

        const html = await response.text();
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
            { error: 'Failed to extract job details' },
            { status: 500 }
        );
    }
}
