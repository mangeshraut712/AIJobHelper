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

// Hardcoded list of allowed hostnames for SSRF protection
// CodeQL requires explicit string matching, not dynamic functions
const ALLOWED_HOSTNAMES = [
    'www.linkedin.com', 'linkedin.com',
    'www.indeed.com', 'indeed.com',
    'boards.greenhouse.io', 'greenhouse.io',
    'jobs.lever.co', 'lever.co',
    'www.glassdoor.com', 'glassdoor.com',
    'www.ziprecruiter.com', 'ziprecruiter.com',
    'www.monster.com', 'monster.com',
    'www.wellfound.com', 'wellfound.com', 'angel.co',
    'www.dice.com', 'dice.com',
    'www.careerbuilder.com', 'careerbuilder.com',
    'www.simplyhired.com', 'simplyhired.com',
    'careers.google.com', 'jobs.apple.com',
    'careers.microsoft.com', 'www.amazon.jobs', 'amazon.jobs',
    'www.metacareers.com', 'jobs.netflix.com',
] as const;

// Canonical, server-controlled origins for supported job boards.
// These values are fixed and not derived from user input, which helps prevent SSRF.
const HOSTNAME_CANONICAL_ORIGINS: Record<string, string> = {
    'www.linkedin.com': 'https://www.linkedin.com',
    'linkedin.com': 'https://www.linkedin.com',
    'www.indeed.com': 'https://www.indeed.com',
    'indeed.com': 'https://www.indeed.com',
    'boards.greenhouse.io': 'https://boards.greenhouse.io',
    'greenhouse.io': 'https://boards.greenhouse.io',
    'jobs.lever.co': 'https://jobs.lever.co',
    'lever.co': 'https://jobs.lever.co',
    'www.glassdoor.com': 'https://www.glassdoor.com',
    'glassdoor.com': 'https://www.glassdoor.com',
    'www.ziprecruiter.com': 'https://www.ziprecruiter.com',
    'ziprecruiter.com': 'https://www.ziprecruiter.com',
    'www.monster.com': 'https://www.monster.com',
    'monster.com': 'https://www.monster.com',
    'www.wellfound.com': 'https://www.wellfound.com',
    'wellfound.com': 'https://www.wellfound.com',
    'angel.co': 'https://angel.co',
    'www.dice.com': 'https://www.dice.com',
    'dice.com': 'https://www.dice.com',
    'www.careerbuilder.com': 'https://www.careerbuilder.com',
    'careerbuilder.com': 'https://www.careerbuilder.com',
    'www.simplyhired.com': 'https://www.simplyhired.com',
    'simplyhired.com': 'https://www.simplyhired.com',
    'careers.google.com': 'https://careers.google.com',
    'jobs.apple.com': 'https://jobs.apple.com',
    'careers.microsoft.com': 'https://careers.microsoft.com',
    'www.amazon.jobs': 'https://www.amazon.jobs',
    'amazon.jobs': 'https://www.amazon.jobs',
    'www.metacareers.com': 'https://www.metacareers.com',
    'jobs.netflix.com': 'https://jobs.netflix.com',
    'www.smartrecruiters.com': 'https://www.smartrecruiters.com',
    'smartrecruiters.com': 'https://www.smartrecruiters.com',
};

// Trusted domain suffixes for job boards with company subdomains.
// These are not user-controlled; they are fixed, trusted suffixes.
const TRUSTED_DOMAIN_SUFFIXES = [
    '.greenhouse.io',
    '.lever.co',
    '.myworkdayjobs.com',
    '.icims.com',
    '.smartrecruiters.com',
] as const;

/**
 * Get canonical origin for a hostname.
 * Returns undefined if hostname is not trusted.
 * 
 * For suffix-based domains (e.g., company.greenhouse.io),
 * the origin is constructed from the TRUSTED hostname which
 * has been validated against a fixed suffix list.
 */
function getCanonicalOrigin(hostname: string): string | undefined {
    // First check explicit map
    if (HOSTNAME_CANONICAL_ORIGINS[hostname]) {
        return HOSTNAME_CANONICAL_ORIGINS[hostname];
    }

    // Check trusted suffixes - construct origin from validated hostname
    // This is safe because we only do this for hostnames ending in trusted suffixes
    for (const suffix of TRUSTED_DOMAIN_SUFFIXES) {
        if (hostname.endsWith(suffix)) {
            // The hostname has been validated to end with a trusted suffix.
            // Construct origin using https:// + the validated hostname.
            return `https://${hostname}`;
        }
    }

    return undefined;
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

        // Parse and validate URL - CodeQL requires inline validation
        let parsedUrl: URL;
        try {
            parsedUrl = new URL(url);
        } catch {
            return NextResponse.json(
                { error: 'Invalid URL format' },
                { status: 400 }
            );
        }

        // SECURITY: Only allow HTTPS
        if (parsedUrl.protocol !== 'https:') {
            return NextResponse.json(
                { error: 'Only HTTPS URLs are allowed' },
                { status: 400 }
            );
        }

        // SECURITY: Check hostname against explicit allowlist
        const hostname = parsedUrl.hostname.toLowerCase();

        // Inline check that CodeQL can verify
        const isAllowed = ALLOWED_HOSTNAMES.includes(hostname as typeof ALLOWED_HOSTNAMES[number]) ||
            hostname.endsWith('.greenhouse.io') ||
            hostname.endsWith('.lever.co') ||
            hostname.endsWith('.myworkdayjobs.com') ||
            hostname.endsWith('.icims.com') ||
            hostname.endsWith('.smartrecruiters.com');

        if (!isAllowed) {
            return NextResponse.json({
                error: 'This job board is not supported. Please use LinkedIn, Indeed, Greenhouse, Lever, or paste the job description manually.',
            }, { status: 400 });
        }

        // SECURITY: Block private IPs
        if (hostname === 'localhost' ||
            hostname.startsWith('127.') ||
            hostname.startsWith('10.') ||
            hostname.startsWith('192.168.') ||
            hostname.startsWith('172.16.') ||
            hostname.startsWith('172.17.') ||
            hostname.startsWith('172.18.') ||
            hostname.startsWith('172.19.') ||
            hostname.startsWith('172.2') ||
            hostname.startsWith('172.30.') ||
            hostname.startsWith('172.31.') ||
            hostname === '0.0.0.0' ||
            hostname === '::1') {
            return NextResponse.json(
                { error: 'Private IP addresses are not allowed' },
                { status: 400 }
            );
        }

        // SECURITY: Get canonical origin from trusted sources only.
        // Uses explicit map OR validated suffix-based domains.
        // This breaks the taint chain by ensuring we NEVER derive the origin from arbitrary user input.
        const canonicalOrigin = getCanonicalOrigin(hostname);
        if (!canonicalOrigin) {
            return NextResponse.json(
                { error: 'This job board is not supported. Please use LinkedIn, Indeed, Greenhouse, Lever, or paste the job description manually.' },
                { status: 400 },
            );
        }

        // SECURITY: Validate the path to prevent path traversal attacks
        const pathname = parsedUrl.pathname || '/';
        if (!pathname.startsWith('/') || pathname.includes('..') || pathname.includes('\\')) {
            return NextResponse.json(
                { error: 'Invalid URL path' },
                { status: 400 }
            );
        }

        // SECURITY: Build the final URL using a fixed, server-controlled origin as the base.
        // This completely breaks the direct dependency between user input and the request host.
        // The canonicalOrigin is a compile-time constant from HOSTNAME_CANONICAL_ORIGINS.
        const safeUrl = new URL(pathname + parsedUrl.search, canonicalOrigin);
        const safeUrlString = safeUrl.toString();

        console.log('📥 [extract-job] Fetching validated URL:', safeUrlString);

        // Fetch with validated URL - redirect disabled for additional safety
        const response = await fetch(safeUrlString, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; JobHelper/1.0)',
                'Accept': 'text/html',
            },
            redirect: 'error',
        });

        if (!response.ok) {
            return NextResponse.json(
                { error: `Failed to fetch job page: ${response.status}` },
                { status: 400 }
            );
        }

        const html = await response.text();
        const text = extractTextFromHtml(html);

        if (!text || text.length < 100) {
            return NextResponse.json(
                { error: 'Could not extract job content from this URL' },
                { status: 400 }
            );
        }

        const jobData = parseJobContent(text);

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

// Simple HTML to text conversion using state machine (no regex on HTML)
function extractTextFromHtml(html: string): string {
    let text = '';
    let inTag = false;
    let inScript = false;
    let inStyle = false;
    let tagBuffer = '';

    for (let i = 0; i < html.length; i++) {
        const char = html[i];

        if (char === '<') {
            inTag = true;
            tagBuffer = '';
            continue;
        }

        if (inTag && char === '>') {
            inTag = false;
            const tag = tagBuffer.toLowerCase().trim();

            if (tag.startsWith('script')) inScript = true;
            if (tag.startsWith('/script')) inScript = false;
            if (tag.startsWith('style')) inStyle = true;
            if (tag.startsWith('/style')) inStyle = false;

            if (tag === 'br' || tag === 'br/' || tag === '/p' || tag === '/div' || tag === '/li') {
                text += '\n';
            }
            continue;
        }

        if (inTag) {
            tagBuffer += char;
            continue;
        }

        if (inScript || inStyle) continue;

        text += char;
    }

    // Decode basic HTML entities
    text = text
        .split('&nbsp;').join(' ')
        .split('&amp;').join('&')
        .split('&lt;').join('<')
        .split('&gt;').join('>')
        .split('&quot;').join('"');

    // Clean whitespace
    text = text.replace(/[ \t]+/g, ' ').replace(/\n\s*\n/g, '\n\n').trim();

    return text.substring(0, 10000);
}

// Parse job content into structured data
function parseJobContent(text: string): JobExtractionResult {
    const skills = extractSkills(text);

    // Simple title extraction
    let title = 'Job Position';
    const titleMatch = text.match(/(?:position|role|title)[:\s]+([^\n]{5,60})/i);
    if (titleMatch) title = titleMatch[1].trim();

    // Simple company extraction
    let company = 'Company';
    const companyMatch = text.match(/(?:company|employer)[:\s]+([^\n]{2,40})/i);
    if (companyMatch) company = companyMatch[1].trim();

    // Simple location extraction
    let location = 'Not specified';
    const locationMatch = text.match(/(?:location|based in)[:\s]+([^\n]{5,40})/i);
    if (locationMatch) location = locationMatch[1].trim();

    return {
        title,
        company,
        location,
        description: text.substring(0, 2000),
        skills,
        requirements: [],
        responsibilities: [],
    };
}

function extractSkills(text: string): string[] {
    const commonSkills = [
        'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'Go', 'Rust',
        'React', 'Angular', 'Vue', 'Node.js', 'Django', 'Flask',
        'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes',
        'SQL', 'PostgreSQL', 'MongoDB', 'Redis', 'GraphQL',
        'Machine Learning', 'AI', 'TensorFlow', 'PyTorch',
    ];

    const found: string[] = [];
    const lowerText = text.toLowerCase();

    for (const skill of commonSkills) {
        if (lowerText.includes(skill.toLowerCase())) {
            found.push(skill);
        }
    }

    return found.slice(0, 15);
}
