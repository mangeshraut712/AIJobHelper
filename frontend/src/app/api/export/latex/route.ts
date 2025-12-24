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
 * Escape text for safe inclusion in LaTeX documents
 * This prevents LaTeX injection and ensures proper rendering
 */
function escapeLaTeX(str: string | undefined | null): string {
    if (!str) return '';

    // Order matters - backslash must be escaped first
    return str
        // Escape backslash first (before we add more backslashes)
        .replace(/\\/g, '\\textbackslash{}')
        // Escape special characters that have meaning in LaTeX
        .replace(/&/g, '\\&')
        .replace(/%/g, '\\%')
        .replace(/\$/g, '\\$')
        .replace(/#/g, '\\#')
        .replace(/_/g, '\\_')
        .replace(/\{/g, '\\{')
        .replace(/\}/g, '\\}')
        // Escape tilde and caret
        .replace(/~/g, '\\textasciitilde{}')
        .replace(/\^/g, '\\textasciicircum{}')
        // Escape less than and greater than
        .replace(/</g, '\\textless{}')
        .replace(/>/g, '\\textgreater{}')
        // Escape quotes
        .replace(/"/g, "''")
        // Remove or escape any remaining problematic characters
        .replace(/[\x00-\x1F\x7F]/g, '') // Remove control characters
        .trim();
}

/**
 * Sanitize a string to only contain safe characters for LaTeX identifiers
 */
function sanitizeForFilename(str: string): string {
    if (!str) return 'resume';
    return str
        .replace(/[^a-zA-Z0-9_-]/g, '_')
        .slice(0, 50);
}

function generateLatex(resume: ResumeData): string {
    const name = escapeLaTeX(resume.name) || 'Your Name';
    const email = escapeLaTeX(resume.email);
    const phone = escapeLaTeX(resume.phone);
    const location = escapeLaTeX(resume.location);
    const summary = escapeLaTeX(resume.summary);

    let experienceSection = '';
    if (resume.experience && resume.experience.length > 0) {
        experienceSection = resume.experience.map(exp => `
\\subsection*{${escapeLaTeX(exp.role) || 'Position'}}
\\textit{${escapeLaTeX(exp.company) || 'Company'}} \\hfill ${escapeLaTeX(exp.duration)}

${escapeLaTeX(exp.description)}
`).join('\n');
    }

    let educationSection = '';
    if (resume.education && resume.education.length > 0) {
        educationSection = resume.education.map(edu => `
\\textbf{${escapeLaTeX(edu.degree) || 'Degree'}} \\\\
${escapeLaTeX(edu.institution) || 'Institution'} \\hfill ${escapeLaTeX(edu.graduation_year)}
`).join('\n');
    }

    let skillsSection = '';
    if (resume.skills && resume.skills.length > 0) {
        skillsSection = resume.skills.map(s => escapeLaTeX(s)).join(', ');
    }

    // Build contact line safely
    const contactParts = [email, phone, location].filter(Boolean);
    const contactLine = contactParts.join(' | ');

    return `\\documentclass[11pt,a4paper]{article}
\\usepackage[utf8]{inputenc}
\\usepackage[T1]{fontenc}
\\usepackage[margin=1in]{geometry}
\\usepackage{titlesec}
\\usepackage{enumitem}
\\usepackage{hyperref}

\\titleformat{\\section}{\\large\\bfseries}{}{0em}{}[\\titlerule]
\\titlespacing*{\\section}{0pt}{12pt}{6pt}

\\begin{document}

\\begin{center}
{\\LARGE\\bfseries ${name}}

${contactLine}
\\end{center}

${summary ? `\\section*{Summary}\n${summary}` : ''}

${experienceSection ? `\\section*{Experience}\n${experienceSection}` : ''}

${educationSection ? `\\section*{Education}\n${educationSection}` : ''}

${skillsSection ? `\\section*{Skills}\n${skillsSection}` : ''}

\\end{document}`;
}

export async function POST(request: NextRequest) {
    try {
        const resume: ResumeData = await request.json();

        console.log('📄 [export/latex] Generating LaTeX for:', resume.name);

        const latexContent = generateLatex(resume);

        // Sanitize filename to prevent header injection
        const safeName = sanitizeForFilename(resume.name || 'resume');

        return new NextResponse(latexContent, {
            status: 200,
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
                'Content-Disposition': `attachment; filename="${safeName}_resume.tex"`,
            },
        });

    } catch (error) {
        console.error('❌ [export/latex] Error:', error);
        return NextResponse.json(
            { error: 'Failed to generate LaTeX', details: String(error) },
            { status: 500 }
        );
    }
}
