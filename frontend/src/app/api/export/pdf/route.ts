import { NextRequest, NextResponse } from 'next/server';

// Reverting to HTML generation to restore client download functionality
// while maintaining strict XSS protection via escaping.

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

interface Project {
    name?: string;
    description?: string;
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
    projects?: Project[];
}

// XSS Protection: Character-by-character escaping or strict replacement
function escapeHtml(str: string | undefined | null): string {
    if (!str) return '';
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function generateResumeHTML(resume: ResumeData): string {
    // Sanitize all inputs
    const name = escapeHtml(resume.name || 'Resume');
    const email = escapeHtml(resume.email);
    const phone = escapeHtml(resume.phone);
    const location = escapeHtml(resume.location);
    const summary = escapeHtml(resume.summary);

    // Generate HTML
    // We use a clean, professional template
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${name}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 40px;
        }
        h1 { font-size: 32px; font-weight: 700; color: #1a1a1a; margin: 0 0 10px 0; }
        .contact-info { margin-bottom: 30px; color: #666; font-size: 14px; }
        .contact-info span { margin-right: 15px; }
        h2 { font-size: 18px; text-transform: uppercase; letter-spacing: 1px; color: #1a1a1a; border-bottom: 2px solid #eee; padding-bottom: 10px; margin: 30px 0 20px 0; }
        h3 { font-size: 16px; font-weight: 600; margin: 0 0 5px 0; }
        .meta { color: #666; font-size: 14px; margin-bottom: 10px; display: flex; justify-content: space-between; }
        p { margin: 0 0 15px 0; }
        ul { margin: 0 0 15px 0; padding-left: 20px; }
        li { margin-bottom: 5px; }
        .skills { display: flex; flex-wrap: wrap; gap: 8px; }
        .skill-tag { background: #f5f5f7; padding: 4px 12px; border-radius: 15px; font-size: 13px; color: #333; }
        @media print {
            body { padding: 0; }
            .no-print { display: none; }
        }
    </style>
</head>
<body onload="window.print()">
    <div id="resume-content">
        <header>
            <h1>${name}</h1>
            <div class="contact-info">
                ${email ? `<span>${email}</span>` : ''}
                ${phone ? `<span>${phone}</span>` : ''}
                ${location ? `<span>${location}</span>` : ''}
            </div>
        </header>

        ${summary ? `
        <section>
            <h2>Summary</h2>
            <p>${summary}</p>
        </section>
        ` : ''}

        ${resume.experience?.length ? `
        <section>
            <h2>Experience</h2>
            ${resume.experience.map(exp => `
                <div class="item">
                    <h3>${escapeHtml(exp.role)}</h3>
                    <div class="meta">
                        <span>${escapeHtml(exp.company)}</span>
                        <span>${escapeHtml(exp.duration)}</span>
                    </div>
                    <p>${escapeHtml(exp.description)}</p>
                </div>
            `).join('')}
        </section>
        ` : ''}

        ${resume.education?.length ? `
        <section>
            <h2>Education</h2>
            ${resume.education.map(edu => `
                <div class="item">
                    <h3>${escapeHtml(edu.institution)}</h3>
                    <div class="meta">
                        <span>${escapeHtml(edu.degree)}</span>
                        <span>${escapeHtml(edu.graduation_year)}</span>
                    </div>
                </div>
            `).join('')}
        </section>
        ` : ''}

        ${resume.projects?.length ? `
        <section>
            <h2>Projects</h2>
            ${resume.projects.map(proj => `
                <div class="item">
                    <h3>${escapeHtml(proj.name)}</h3>
                    <p>${escapeHtml(proj.description)}</p>
                </div>
            `).join('')}
        </section>
        ` : ''}

        ${resume.skills?.length ? `
        <section>
            <h2>Skills</h2>
            <div class="skills">
                ${resume.skills.map(skill => `
                    <span class="skill-tag">${escapeHtml(skill)}</span>
                `).join('')}
            </div>
        </section>
        ` : ''}
    </div>
</body>
</html>`;
}

export async function POST(request: NextRequest) {
    try {
        const resume: ResumeData = await request.json();

        console.log('📄 [export/pdf] Generating HTML for:', resume.name);

        const htmlContent = generateResumeHTML(resume);

        // Use a safe filename
        const safeName = escapeHtml(resume.name || 'resume').replace(/[^a-zA-Z0-9_-]/g, '_');

        return new NextResponse(htmlContent, {
            status: 200,
            headers: {
                'Content-Type': 'text/html; charset=utf-8',
                'Content-Disposition': `inline; filename="${safeName}_resume.html"`,
                // Security headers
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
