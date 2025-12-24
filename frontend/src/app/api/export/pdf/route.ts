import { NextRequest, NextResponse } from 'next/server';

// Note: Full PDF generation requires additional packages like @react-pdf/renderer
// For Vercel, we'll return an HTML representation that can be printed as PDF
// or provide instructions for PDF generation

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

function generateResumeHTML(resume: ResumeData): string {
    const name = resume.name || 'Your Name';
    const email = resume.email || '';
    const phone = resume.phone || '';
    const location = resume.location || '';
    const summary = resume.summary || '';

    const experienceHTML = (resume.experience || []).map(exp => `
        <div style="margin-bottom: 16px;">
            <div style="display: flex; justify-content: space-between; align-items: baseline;">
                <strong style="font-size: 14px;">${exp.role || 'Position'}</strong>
                <span style="font-size: 12px; color: #666;">${exp.duration || ''}</span>
            </div>
            <div style="font-style: italic; color: #333;">${exp.company || 'Company'}</div>
            <p style="margin-top: 8px; font-size: 13px; line-height: 1.5;">${exp.description || ''}</p>
        </div>
    `).join('');

    const educationHTML = (resume.education || []).map(edu => `
        <div style="margin-bottom: 12px;">
            <strong>${edu.degree || 'Degree'}</strong>
            <div>${edu.institution || 'Institution'} | ${edu.graduation_year || ''}</div>
        </div>
    `).join('');

    const skillsHTML = (resume.skills || []).map(skill =>
        `<span style="display: inline-block; padding: 4px 12px; margin: 4px; background: #f0f0f0; border-radius: 16px; font-size: 12px;">${skill}</span>`
    ).join('');

    return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${name} - Resume</title>
    <style>
        @media print {
            body { margin: 0; padding: 20px; }
            @page { margin: 0.5in; }
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
            ${[email, phone, location].filter(Boolean).join(' | ')}
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

    <script>
        // Auto-trigger print dialog for PDF generation
        // window.print();
    </script>
</body>
</html>`;
}

export async function POST(request: NextRequest) {
    try {
        const resume: ResumeData = await request.json();

        console.log('📄 [export/pdf] Generating PDF-ready HTML for:', resume.name);

        const htmlContent = generateResumeHTML(resume);

        // Return HTML that can be printed as PDF
        // In production, you'd use a PDF library like puppeteer or @react-pdf/renderer
        return new NextResponse(htmlContent, {
            status: 200,
            headers: {
                'Content-Type': 'text/html',
                'Content-Disposition': `inline; filename="${resume.name || 'resume'}_resume.html"`,
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
