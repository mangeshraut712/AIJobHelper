import { NextRequest, NextResponse } from 'next/server';

// Note: Full PDF generation requires additional packages like @react-pdf/renderer
// For Vercel, we'll return an HTML representation that can be printed as PDF

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
 * Escape HTML special characters to prevent XSS attacks
 * This is crucial for user-generated content in HTML output
 */
function escapeHtml(str: string | undefined | null): string {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;')
        .replace(/`/g, '&#x60;')
        .replace(/=/g, '&#x3D;');
}

/**
 * Sanitize filename to prevent header injection
 */
function sanitizeFilename(str: string): string {
    if (!str) return 'resume';
    return str
        .replace(/[^a-zA-Z0-9_\- ]/g, '')
        .replace(/\s+/g, '_')
        .slice(0, 50);
}

function generateResumeHTML(resume: ResumeData): string {
    // Escape all user-provided content
    const name = escapeHtml(resume.name) || 'Your Name';
    const email = escapeHtml(resume.email);
    const phone = escapeHtml(resume.phone);
    const location = escapeHtml(resume.location);
    const summary = escapeHtml(resume.summary);

    // Build experience section with escaped content
    const experienceHTML = (resume.experience || []).map(exp => `
        <div style="margin-bottom: 16px;">
            <div style="display: flex; justify-content: space-between; align-items: baseline;">
                <strong style="font-size: 14px;">${escapeHtml(exp.role) || 'Position'}</strong>
                <span style="font-size: 12px; color: #666;">${escapeHtml(exp.duration)}</span>
            </div>
            <div style="font-style: italic; color: #333;">${escapeHtml(exp.company) || 'Company'}</div>
            <p style="margin-top: 8px; font-size: 13px; line-height: 1.5;">${escapeHtml(exp.description)}</p>
        </div>
    `).join('');

    // Build education section with escaped content
    const educationHTML = (resume.education || []).map(edu => `
        <div style="margin-bottom: 12px;">
            <strong>${escapeHtml(edu.degree) || 'Degree'}</strong>
            <div>${escapeHtml(edu.institution) || 'Institution'} | ${escapeHtml(edu.graduation_year)}</div>
        </div>
    `).join('');

    // Build skills section with escaped content
    const skillsHTML = (resume.skills || []).map(skill =>
        `<span style="display: inline-block; padding: 4px 12px; margin: 4px; background: #f0f0f0; border-radius: 16px; font-size: 12px;">${escapeHtml(skill)}</span>`
    ).join('');

    // Build contact line
    const contactParts = [email, phone, location].filter(Boolean);
    const contactLine = contactParts.join(' | ');

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Security-Policy" content="default-src 'self'; style-src 'unsafe-inline';">
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
        <p style="color: #666; margin: 8px 0;">
            ${contactLine}
        </p>
    </header>

    ${summary ? `
    <section>
        <h2>Professional Summary</h2>
        <p>${summary}</p>
    </section>
    ` : ''}

    ${experienceHTML ? `
    <section>
        <h2>Experience</h2>
        ${experienceHTML}
    </section>
    ` : ''}

    ${educationHTML ? `
    <section>
        <h2>Education</h2>
        ${educationHTML}
    </section>
    ` : ''}

    ${skillsHTML ? `
    <section>
        <h2>Skills</h2>
        <div>${skillsHTML}</div>
    </section>
    ` : ''}

    <div class="no-print" style="margin-top: 40px; padding: 20px; background: #f5f5f5; border-radius: 8px; text-align: center;">
        <p style="margin: 0 0 10px 0; color: #666;">To save as PDF, use <strong>Print → Save as PDF</strong> in your browser</p>
        <button onclick="window.print()" style="padding: 10px 20px; font-size: 14px; cursor: pointer; background: #333; color: white; border: none; border-radius: 4px;">
            Print Resume
        </button>
    </div>
</body>
</html>`;
}

export async function POST(request: NextRequest) {
    try {
        const resume: ResumeData = await request.json();

        console.log('📄 [export/pdf] Generating PDF-ready HTML for:', resume.name);

        const htmlContent = generateResumeHTML(resume);

        // Sanitize filename to prevent header injection
        const safeName = sanitizeFilename(resume.name || 'resume');

        // Return HTML that can be printed as PDF
        return new NextResponse(htmlContent, {
            status: 200,
            headers: {
                'Content-Type': 'text/html; charset=utf-8',
                'Content-Disposition': `inline; filename="${safeName}_resume.html"`,
                // Security headers
                'X-Content-Type-Options': 'nosniff',
                'X-XSS-Protection': '1; mode=block',
            },
        });

    } catch (error) {
        console.error('❌ [export/pdf] Error:', error);
        return NextResponse.json(
            { error: 'Failed to generate PDF. Use Print > Save as PDF in your browser.', details: String(error) },
            { status: 500 }
        );
    }
}
