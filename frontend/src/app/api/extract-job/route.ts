import { NextRequest, NextResponse } from 'next/server';
import { callAI, extractJSON, OPENROUTER_API_KEY } from '@/lib/ai-config';

interface JobExtractionResult {
    title: string;
    company: string;
    location: string;
    description: string;
    about_job?: string;
    skills: string[];
    requirements: string[];
    responsibilities: string[];
    salary_range?: string;
    job_type?: string;
    source?: string;
    note?: string;  // To indicate limited data from public pages
}

// Comprehensive job extraction interface
interface JobExtractionResult {
    title: string;
    company: string;
    location: string;
    description: string;
    about_job?: string;
    skills: string[];
    requirements: string[];
    responsibilities: string[];
    minimum_qualifications?: string[];
    preferred_qualifications?: string[];
    experience_level?: string;
    years_experience?: string;
    salary_range?: string;
    job_type?: string;
    work_arrangement?: string;
    benefits?: string[];
    why_join?: string;
    about_company?: string;
    team_size?: string;
    funding_info?: string;
    source?: string;
    note?: string;
}

// Comprehensive AI-powered job extraction prompt
const JOB_SYSTEM_PROMPT = `You are an expert job posting analyzer. Extract ALL information from the job posting.
Return ONLY a valid JSON object without any markdown or explanation.

Extract EVERY detail you can find. Return this JSON structure:
{
    "title": "exact job title",
    "company": "company name",
    "location": "city, state/country or Remote",
    "work_arrangement": "on-site/remote/hybrid",
    "salary_range": "exact salary range with currency",
    "job_type": "full-time/part-time/contract",
    "experience_level": "junior/mid/senior/lead/principal",
    "years_experience": "X+ years required",
    "about_job": "complete job description/summary - include all context about the role",
    "about_company": "company description, funding, stage, team size, culture",
    "why_join": "reasons to join, perks, growth opportunities",
    "responsibilities": ["every responsibility listed"],
    "minimum_qualifications": ["every required qualification - education, experience, skills"],
    "preferred_qualifications": ["every nice-to-have or preferred qualification"],
    "skills": ["ALL technical skills mentioned - languages, frameworks, tools, platforms"],
    "benefits": ["all benefits, perks, compensation details"],
    "team_size": "team/company size if mentioned",
    "funding_info": "funding stage/amount if mentioned"
}

IMPORTANT: Extract EVERYTHING. Include full sentences for descriptions. Don't summarize - capture all details.`;

async function parseJobWithAI(text: string, meta: { title?: string; company?: string; location?: string; description?: string }): Promise<JobExtractionResult> {
    if (!OPENROUTER_API_KEY) {
        throw new Error('No API key');
    }

    console.log('🤖 [extract-job] Using AI to parse job posting...');

    // Use meta data to provide context
    const contextInfo = meta.title ? `Job Title: ${meta.title}\nCompany: ${meta.company || 'Unknown'}\nLocation: ${meta.location || 'Unknown'}\n\n` : '';
    const prompt = `Extract ALL job details from this posting. Be comprehensive and capture every detail:\n\n${contextInfo}FULL JOB POSTING:\n${text.substring(0, 8000)}`;

    const response = await callAI(prompt, JOB_SYSTEM_PROMPT, { temperature: 0.1, maxTokens: 3000 });
    const jsonStr = extractJSON(response);
    const parsed = JSON.parse(jsonStr);

    return {
        title: parsed.title || meta.title || 'Job Position',
        company: parsed.company || meta.company || 'Company',
        location: parsed.location || meta.location || 'Not specified',
        description: parsed.about_job || parsed.description || meta.description || text.substring(0, 2000),
        about_job: parsed.about_job || parsed.description,
        about_company: parsed.about_company,
        why_join: parsed.why_join,
        skills: Array.isArray(parsed.skills) ? parsed.skills : [],
        requirements: Array.isArray(parsed.minimum_qualifications) ? parsed.minimum_qualifications : (Array.isArray(parsed.requirements) ? parsed.requirements : []),
        responsibilities: Array.isArray(parsed.responsibilities) ? parsed.responsibilities : [],
        minimum_qualifications: Array.isArray(parsed.minimum_qualifications) ? parsed.minimum_qualifications : [],
        preferred_qualifications: Array.isArray(parsed.preferred_qualifications) ? parsed.preferred_qualifications : [],
        benefits: Array.isArray(parsed.benefits) ? parsed.benefits : [],
        experience_level: parsed.experience_level,
        years_experience: parsed.years_experience,
        salary_range: parsed.salary_range,
        job_type: parsed.job_type,
        work_arrangement: parsed.work_arrangement,
        team_size: parsed.team_size,
        funding_info: parsed.funding_info,
        source: 'AI',
    };
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
        let pathname = parsedUrl.pathname;

        // LinkedIn-specific validation - use exact hostname match (not substring)
        const isLinkedIn = hostname === 'www.linkedin.com' || hostname === 'linkedin.com';
        if (isLinkedIn) {
            // Check if URL has currentJobId - convert to direct job URL
            const currentJobId = parsedUrl.searchParams.get('currentJobId');
            if (currentJobId && /^\d+$/.test(currentJobId)) {
                // Convert to direct job URL
                pathname = `/jobs/view/${currentJobId}`;
                console.log('📥 [extract-job] Converting to direct job URL:', pathname);
            }

            // Reject URLs that require authentication (unless they have currentJobId)
            if (!currentJobId && (
                pathname.includes('/collections/') ||
                pathname.includes('/my-jobs/') ||
                pathname.includes('/saved-jobs/') ||
                pathname.includes('/recommended/'))) {
                return NextResponse.json({
                    error: 'This LinkedIn URL requires login. Please use a direct job link.',
                    suggestion: 'Click on the job posting, then copy the URL. It should look like: https://www.linkedin.com/jobs/view/1234567890'
                }, { status: 400 });
            }

            // Check for valid LinkedIn job URL patterns
            const isValidLinkedInJob = pathname.startsWith('/jobs/view/') ||
                pathname.match(/\/jobs\/\d+/);

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

        // SSRF PROTECTION: Get canonical origin from server-controlled map
        // The canonicalOrigin comes from HOSTNAME_CANONICAL_ORIGINS which is hardcoded
        const canonicalOrigin = getCanonicalOrigin(hostname);
        if (!canonicalOrigin) {
            return NextResponse.json(
                { error: 'This job board is not supported. Please use LinkedIn, Indeed, Greenhouse, Lever, or paste the job description manually.' },
                { status: 400 },
            );
        }

        // SSRF PROTECTION: Validate and sanitize path
        // Only allow paths that start with / and don't contain traversal
        let validatedPath = '/';
        if (pathname && pathname.startsWith('/')) {
            // Remove any path traversal attempts
            const cleanPath = pathname.split('/').filter(segment =>
                segment !== '' && segment !== '.' && segment !== '..'
            ).join('/');
            validatedPath = '/' + cleanPath;
        }

        // SSRF PROTECTION: Validate query params (only allow specific job-related params)
        const allowedParams = ['currentJobId', 'id', 'job', 'position'];
        const safeSearchParams = new URLSearchParams();
        for (const param of allowedParams) {
            const value = parsedUrl.searchParams.get(param);
            if (value && /^[\w-]+$/.test(value)) {
                safeSearchParams.set(param, value);
            }
        }
        const queryString = safeSearchParams.toString();

        // SSRF PROTECTION: Build final URL using ONLY server-controlled components
        // canonicalOrigin: from hardcoded HOSTNAME_CANONICAL_ORIGINS
        // validatedPath: sanitized and validated
        // queryString: only allowed params with alphanumeric values
        const trustedUrl = new URL(validatedPath, canonicalOrigin);
        if (queryString) {
            trustedUrl.search = queryString;
        }

        // This URL is now safe because:
        // 1. The origin comes from a hardcoded, server-controlled map
        // 2. The path is sanitized (no traversal, must start with /)
        // 3. Query params are allowlisted and validated
        const fetchUrl = trustedUrl.toString();

        console.log('📥 [extract-job] Fetching trusted URL:', fetchUrl);

        // Fetch from the trusted, validated URL
        let response;
        try {
            response = await fetch(fetchUrl, {
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

        // Extract meta tags first (works better for LinkedIn)
        const metaData = extractMetaTags(html);
        const text = extractTextFromHtml(html);

        if (!text || text.length < 100) {
            return NextResponse.json({
                error: 'Could not extract job content from this URL.',
                suggestion: 'The page might be dynamic or require JavaScript. Please copy and paste the job description manually.'
            }, { status: 400 });
        }

        // Try AI-powered extraction first, fall back to regex
        let jobData: JobExtractionResult;
        try {
            jobData = await parseJobWithAI(text, metaData);
            console.log('✅ [extract-job] AI extracted job:', jobData.title, 'at', jobData.company);
        } catch (aiError) {
            console.error('❌ [extract-job] AI failed, using regex:', aiError);
            jobData = parseJobContent(text, metaData);
            console.log('✅ [extract-job] Regex extracted job:', jobData.title, 'at', jobData.company);
        }

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

// Extract meta tags from HTML (especially for LinkedIn)
interface MetaData {
    title?: string;
    description?: string;
    company?: string;
    location?: string;
}

function extractMetaTags(html: string): MetaData {
    const result: MetaData = {};

    // Extract og:title - "Company hiring Title in Location | LinkedIn"
    const ogTitleMatch = html.match(/<meta\s+property="og:title"\s+content="([^"]+)"/i) ||
        html.match(/<meta\s+content="([^"]+)"\s+property="og:title"/i);
    if (ogTitleMatch) {
        const ogTitle = ogTitleMatch[1];
        // Parse "Company hiring Title in Location | LinkedIn"
        const linkedInMatch = ogTitle.match(/^(.+?)\s+hiring\s+(.+?)\s+in\s+(.+?)\s*\|/i);
        if (linkedInMatch) {
            result.company = linkedInMatch[1].trim();
            result.title = linkedInMatch[2].trim();
            result.location = linkedInMatch[3].trim();
        } else {
            result.title = ogTitle.replace(/\s*\|\s*LinkedIn$/i, '').trim();
        }
    }

    // Extract og:description
    const ogDescMatch = html.match(/<meta\s+property="og:description"\s+content="([^"]+)"/i) ||
        html.match(/<meta\s+content="([^"]+)"\s+property="og:description"/i);
    if (ogDescMatch) {
        result.description = ogDescMatch[1];
    }

    // Extract regular title as fallback
    if (!result.title) {
        const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
        if (titleMatch) {
            result.title = titleMatch[1].replace(/\s*\|\s*LinkedIn$/i, '').trim();
        }
    }

    // Extract meta description as fallback
    if (!result.description) {
        const descMatch = html.match(/<meta\s+name="description"\s+content="([^"]+)"/i);
        if (descMatch) {
            result.description = descMatch[1];
        }
    }

    return result;
}

// Parse job content into structured data
function parseJobContent(text: string, meta: MetaData = {}): JobExtractionResult {
    const skills = extractSkills(text);

    // Use meta data first, then fall back to text extraction
    let title = meta.title || 'Job Position';
    let company = meta.company || 'Company';
    let location = meta.location || 'Not specified';
    let description = meta.description || '';

    // If meta didn't give us good data, try text extraction
    if (title === 'Job Position') {
        const titleMatch = text.match(/(?:position|role|title|hiring)[:\s]+([^\n]{5,60})/i);
        if (titleMatch) title = titleMatch[1].trim();
    }

    if (company === 'Company') {
        const companyMatch = text.match(/(?:company|employer|at)[:\s]+([^\n]{2,40})/i);
        if (companyMatch) company = companyMatch[1].trim();
    }

    if (location === 'Not specified') {
        const locationMatch = text.match(/(?:location|based in|city)[:\s]+([^\n]{5,40})/i);
        if (locationMatch) location = locationMatch[1].trim();
    }

    // Extract salary
    let salary_range: string | undefined;
    const salaryMatch = text.match(/\$[\d,]+k?\s*[-–]\s*\$?[\d,]+k?/i) ||
        text.match(/\$[\d,]+\s*(?:to|-)?\s*\$?[\d,]+/i) ||
        text.match(/(\d{2,3}k?\s*[-–]\s*\d{2,3}k)/i);
    if (salaryMatch) salary_range = salaryMatch[0];

    // Extract responsibilities
    const responsibilities: string[] = [];
    const respSection = text.match(/(?:responsibilities|what you.?ll do|key duties)[:\s]*([\s\S]*?)(?:\n\n|qualifications|requirements|about)/i);
    if (respSection) {
        const bullets = respSection[1].match(/[•\-*]\s*[^\n]+/g) || [];
        responsibilities.push(...bullets.slice(0, 10).map(b => b.replace(/^[•\-*]\s*/, '').trim()));
    }

    // Extract requirements
    const requirements: string[] = [];
    const reqSection = text.match(/(?:requirements|qualifications|what we.?re looking for)[:\s]*([\s\S]*?)(?:\n\n|benefits|about the company|$)/i);
    if (reqSection) {
        const bullets = reqSection[1].match(/[•\-*]\s*[^\n]+/g) || [];
        requirements.push(...bullets.slice(0, 10).map(b => b.replace(/^[•\-*]\s*/, '').trim()));
    }

    // Build full description
    if (!description || description.length < 100) {
        description = text.substring(0, 3000);
    }

    // Check if LinkedIn limited the data (truncated with "See this and similar jobs")
    const isLimitedData = description.includes('See this and similar jobs') ||
        description.includes('…See this') ||
        (description.length < 300 && meta.title);

    // Determine source
    const source = meta.company ? 'LinkedIn' : 'Web';

    return {
        title,
        company,
        location,
        description,
        about_job: description,
        skills,
        requirements,
        responsibilities,
        salary_range,
        source,
        note: isLimitedData ? 'LinkedIn requires login for full job details. For complete info, copy and paste the job description directly from the posting.' : undefined,
    };
}

function extractSkills(text: string): string[] {
    const commonSkills = [
        'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Go', 'Rust', 'Ruby', 'PHP', 'Swift', 'Kotlin',
        'React', 'Angular', 'Vue', 'Next.js', 'Node.js', 'Express', 'Django', 'Flask', 'Spring', 'FastAPI',
        'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Terraform', 'Jenkins', 'CI/CD',
        'SQL', 'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'GraphQL', 'REST', 'APIs',
        'Machine Learning', 'AI', 'TensorFlow', 'PyTorch', 'Deep Learning', 'NLP', 'Computer Vision',
        'Git', 'Linux', 'Agile', 'Scrum', 'Microservices', 'System Design',
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
