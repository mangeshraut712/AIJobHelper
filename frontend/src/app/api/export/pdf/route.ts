import { NextRequest, NextResponse } from 'next/server';

interface Experience {
    role?: string;
    company?: string;
    duration?: string;
    description?: string;
}

interface Education {
    degree?: string;
    institution?: string;
    graduation_year?: string;
}

interface ResumeData {
    name?: string;
    email?: string;
    phone?: string;
    location?: string;
    summary?: string;
    skills?: string[];
    experience?: Experience[];
    education?: Education[];
}

/**
 * HTML entity map for safe escaping
 */
const HTML_ESCAPE_MAP: Map<string, string> = new Map([
    ['&', '&amp;'],
    ['<', '&lt;'],
    ['>', '&gt;'],
    ['"', '&quot;'],
    ["'", '&#x27;'],
    ['/', '&#x2F;'],
    ['`', '&#x60;'],
    ['=', '&#x3D;'],
]);

/**
 * Escape HTML special characters using character-by-character processing
 * This prevents XSS attacks by ensuring user content cannot inject HTML/JS
 */
function escapeHtml(str: string | undefined | null): string {
    if (!str) return '';

    const result: string[] = [];

    for (let i = 0; i < str.length; i++) {
        const char = str[i];
        const escaped = HTML_ESCAPE_MAP.get(char);
        if (escaped !== undefined) {
            result.push(escaped);
        } else {
            result.push(char);
        }
    }

    return result.join('');
}

/**
 * Sanitize filename - only allow safe characters
 */
function sanitizeFilename(str: string): string {
    if (!str) return 'resume';

    const result: string[] = [];

    for (let i = 0; i < str.length && result.length < 50; i++) {
        const char = str[i];
        const code = char.charCodeAt(0);

        // Only allow alphanumeric, underscore, hyphen
        if ((code >= 48 && code <= 57) ||  // 0-9
            (code >= 65 && code <= 90) ||  // A-Z
            (code >= 97 && code <= 122) || // a-z
            code === 95 || code === 45) {  // _ -
            result.push(char);
        } else if (code === 32) {  // space -> underscore
            result.push('_');
        }
    }

    return result.length > 0 ? result.join('') : 'resume';
}

function generateResumeHTML(resume: ResumeData): string {
    // All user content MUST be escaped
    const name = escapeHtml(resume.name) || 'Your Name';
    const email = escapeHtml(resume.email);
    const phone = escapeHtml(resume.phone);
    const location = escapeHtml(resume.location);
    const summary = escapeHtml(resume.summary);

    // Build experience section with all content escaped
    const experienceParts: string[] = [];
    if (resume.experience && resume.experience.length > 0) {
        for (const exp of resume.experience) {
            const role = escapeHtml(exp.role) || 'Position';
            const company = escapeHtml(exp.company) || 'Company';
            const duration = escapeHtml(exp.duration);
            const description = escapeHtml(exp.description);

            experienceParts.push(`
        <div style="margin-bottom: 16px;">
            <div style="display: flex; justify-content: space-between; align-items: baseline;">
                <strong style="font-size: 14px;">${role}</strong>
                <span style="font-size: 12px; color: #666;">${duration}</span>
            </div>
            <div style="font-style: italic; color: #333;">${company}</div>
            <p style="margin-top: 8px; font-size: 13px; line-height: 1.5;">${description}</p>
        </div>`);
        }
    }
    const experienceHTML = experienceParts.join('');

    // Build education section with all content escaped
    const educationParts: string[] = [];
    if (resume.education && resume.education.length > 0) {
        for (const edu of resume.education) {
            const degree = escapeHtml(edu.degree) || 'Degree';
            const institution = escapeHtml(edu.institution) || 'Institution';
            const gradYear = escapeHtml(edu.graduation_year);

            educationParts.push(`
        <div style="margin-bottom: 12px;">
            <strong>${degree}</strong>
            <div>${institution} | ${gradYear}</div>
        </div>`);
        }
    }
    const educationHTML = educationParts.join('');

    // Build skills section with all content escaped
    const skillParts: string[] = [];
    if (resume.skills && resume.skills.length > 0) {
        for (const skill of resume.skills) {
            const escapedSkill = escapeHtml(skill);
            skillParts.push(`<span style="display: inline-block; padding: 4px 12px; margin: 4px; background: #f0f0f0; border-radius: 16px; font-size: 12px;">${escapedSkill}</span>`);
        }
    }
    const skillsHTML = skillParts.join('');

    // Build contact line
    const contactParts: string[] = [];
    if (email) contactParts.push(email);
    if (phone) contactParts.push(phone);
    if (location) contactParts.push(location);
    const contactLine = contactParts.join(' | ');

    // The HTML template uses ONLY escaped values
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'none';">
    <title>${name} - Resume</title>
    <style>
        @media print {
            body { margin: 0; padding: 20px; }
            @page { margin: 0.5in; }
            .no-print { display: none; }
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 40px;
            color: #1a1a1a;
            line-height: 1.6;
        }
        h1 { margin-bottom: 8px; }
        h2 { 
            font-size: 16px; 
            text-transform: uppercase; 
            letter-spacing: 1px; 
            border-bottom: 2px solid #333; 
            padding-bottom: 4px;
            margin-top: 24px;
        }
    </style>
</head>
<body>
    <header style="text-align: center; margin-bottom: 24px;">
        <h1 style="margin: 0; font-size: 28px;">${name}</h1>
        <p style="color: #666; margin: 8px 0;">${contactLine}</p>
    </header>

    ${summary ? `
    <section>
        <h2>Professional Summary</h2>
        <p>${summary}</p>
    </section>` : ''}

    ${experienceHTML ? `
    <section>
        <h2>Experience</h2>
        ${experienceHTML}
    </section>` : ''}

    ${educationHTML ? `
    <section>
        <h2>Education</h2>
        ${educationHTML}
    </section>` : ''}

    ${skillsHTML ? `
    <section>
        <h2>Skills</h2>
        <div>${skillsHTML}</div>
    </section>` : ''}

    <div class="no-print" style="margin-top: 40px; padding: 20px; background: #f5f5f5; border-radius: 8px; text-align: center;">
        <p style="margin: 0 0 10px 0; color: #666;">To save as PDF, use <strong>Print</strong> then <strong>Save as PDF</strong></p>
    </div>
</body>
</html>`;
}

export async function POST(request: NextRequest) {
    try {
        const resume: ResumeData = await request.json();

        console.log('📄 [export/pdf] Generating HTML for:', resume.name);

        const htmlContent = generateResumeHTML(resume);

        // Sanitize filename
        const safeName = sanitizeFilename(resume.name || 'resume');

        return new NextResponse(htmlContent, {
            status: 200,
            headers: {
                'Content-Type': 'text/html; charset=utf-8',
                'Content-Disposition': `inline; filename="${safeName}_resume.html"`,
                'X-Content-Type-Options': 'nosniff',
                'X-XSS-Protection': '1; mode=block',
                'X-Frame-Options': 'DENY',
            },
        });

    } catch (error) {
        console.error('❌ [export/pdf] Error:', error);
        return NextResponse.json(
            { error: 'Failed to generate resume HTML' },
            { status: 500 }
        );
    }
}
