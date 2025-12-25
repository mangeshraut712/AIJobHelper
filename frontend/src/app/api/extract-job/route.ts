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

// Vercel serverless config
export const maxDuration = 30;

export async function POST(request: NextRequest) {
    console.log('📥 [extract-job] Request received');

    try {
        const body = await request.json();
        const { url } = body;

        if (!url || typeof url !== 'string') {
            return NextResponse.json(
                { error: 'URL is required' },
                { status: 400 }
            );
        }

        console.log('🔗 [extract-job] Processing URL:', url);

        // Parse and validate URL
        let parsedUrl: URL;
        try {
            parsedUrl = new URL(url);
        } catch {
            return NextResponse.json(
                { error: 'Invalid URL format. Please paste a valid job posting URL.' },
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

        const hostname = parsedUrl.hostname.toLowerCase();
        const pathname = parsedUrl.pathname;

        // LinkedIn-specific validation
        if (hostname.includes('linkedin.com')) {
            // Reject URLs that require authentication
            if (pathname.includes('/collections/') ||
                pathname.includes('/my-jobs/') ||
                pathname.includes('/saved-jobs/') ||
                pathname.includes('/recommended/')) {
                return NextResponse.json({
                    error: 'This LinkedIn URL requires authentication. Please use a direct job link like: linkedin.com/jobs/view/123456789',
                    suggestion: 'Open the job posting and copy the URL from the browser address bar, it should look like: https://www.linkedin.com/jobs/view/[job-id]'
                }, { status: 400 });
            }

            // Check for valid LinkedIn job URL patterns
            const isValidLinkedInJob = pathname.startsWith('/jobs/view/') ||
                pathname.match(/\/jobs\/\d+/) ||
                pathname.includes('/jobs/') && parsedUrl.searchParams.has('currentJobId');

            if (!isValidLinkedInJob && !pathname.includes('/jobs/')) {
                return NextResponse.json({
                    error: 'Please provide a direct LinkedIn job URL.',
                    suggestion: 'The URL should look like: https://www.linkedin.com/jobs/view/[job-id]'
                }, { status: 400 });
            }
        }

        // Check hostname allowlist
        const isAllowed = ALLOWED_HOSTNAMES.includes(hostname as typeof ALLOWED_HOSTNAMES[number]) ||
            hostname.endsWith('.greenhouse.io') ||
            hostname.endsWith('.lever.co') ||
            hostname.endsWith('.myworkdayjobs.com') ||
            hostname.endsWith('.icims.com') ||
            hostname.endsWith('.smartrecruiters.com');

        if (!isAllowed) {
            return NextResponse.json({
                error: 'This job board is not supported.',
                supported: 'Supported: LinkedIn, Indeed, Greenhouse, Lever, Glassdoor, and major company career sites.',
                suggestion: 'You can paste the job description directly instead.'
            }, { status: 400 });
        }

        // Block private IPs
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

        // Get canonical origin
        const canonicalOrigin = getCanonicalOrigin(hostname);
        if (!canonicalOrigin) {
            return NextResponse.json(
                { error: 'This job board is not supported. Please use LinkedIn, Indeed, Greenhouse, Lever, or paste the job description manually.' },
                { status: 400 },
            );
        }

        // Validate path
        const safePath = pathname || '/';
        if (!safePath.startsWith('/') || safePath.includes('..') || safePath.includes('\\')) {
            return NextResponse.json(
                { error: 'Invalid URL path' },
                { status: 400 }
            );
        }

        // Build safe URL
        const safeUrl = new URL(safePath + parsedUrl.search, canonicalOrigin);
        const safeUrlString = safeUrl.toString();

        console.log('📥 [extract-job] Fetching:', safeUrlString);

        // Fetch with proper headers and redirect handling
        let response;
        try {
            response = await fetch(safeUrlString, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.9',
                    'Cache-Control': 'no-cache',
                },
                redirect: 'follow', // Allow redirects (LinkedIn uses them)
            });
        } catch (fetchError) {
            console.error('❌ Fetch error:', fetchError);
            return NextResponse.json({
                error: 'Could not connect to the job board. Please try again later.',
                details: 'Network error while fetching the job page.'
            }, { status: 500 });
        }

        console.log('📥 [extract-job] Response status:', response.status);

        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                return NextResponse.json({
                    error: 'This job posting requires authentication.',
                    suggestion: 'Please copy the job description text and paste it directly, or try a public job URL.'
                }, { status: 400 });
            }
            if (response.status === 404) {
                return NextResponse.json({
                    error: 'Job posting not found. It may have been removed or the URL is incorrect.'
                }, { status: 400 });
            }
            return NextResponse.json(
                { error: `Failed to fetch job page (status: ${response.status})` },
                { status: 400 }
            );
        }

        const html = await response.text();

        // Check if we got a login/auth page
        if (html.includes('Sign in') && html.includes('LinkedIn') && html.length < 50000) {
            return NextResponse.json({
                error: 'LinkedIn is requiring sign-in to view this job.',
                suggestion: 'Please copy the job description text and paste it manually, or use the direct job URL from the view page.'
            }, { status: 400 });
        }

        const text = extractTextFromHtml(html);

        if (!text || text.length < 100) {
            return NextResponse.json({
                error: 'Could not extract job content from this URL.',
                suggestion: 'The page might be dynamic or require JavaScript. Please copy and paste the job description manually.'
            }, { status: 400 });
        }

        const jobData = parseJobContent(text);

        console.log('✅ [extract-job] Extracted job:', jobData.title, 'at', jobData.company);

        return NextResponse.json(jobData);

    } catch (error) {
        console.error('❌ [extract-job] Error:', error);
        return NextResponse.json({
            error: 'Failed to extract job details. Please try again or paste the job description manually.',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
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
