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
 * LaTeX special characters and their safe replacements
 * Using explicit character-by-character mapping for complete safety
 */
const LATEX_ESCAPE_MAP: Map<string, string> = new Map([
    ['\\', '\\textbackslash{}'],
    ['&', '\\&'],
    ['%', '\\%'],
    ['$', '\\$'],
    ['#', '\\#'],
    ['_', '\\_'],
    ['{', '\\{'],
    ['}', '\\}'],
    ['~', '\\textasciitilde{}'],
    ['^', '\\textasciicircum{}'],
    ['<', '\\textless{}'],
    ['>', '\\textgreater{}'],
    ['"', "''"],
    ['|', '\\textbar{}'],
]);

/**
 * Escape text for safe inclusion in LaTeX documents
 * Uses character-by-character processing to avoid regex issues
 */
function escapeLaTeX(str: string | undefined | null): string {
    if (!str) return '';

    const result: string[] = [];

    for (let i = 0; i < str.length; i++) {
        const char = str[i];
        const code = char.charCodeAt(0);

        // Skip control characters (0x00-0x1F and 0x7F)
        if (code < 32 || code === 127) {
            continue;
        }

        // Check if this character needs escaping
        const escaped = LATEX_ESCAPE_MAP.get(char);
        if (escaped !== undefined) {
            result.push(escaped);
        } else {
            result.push(char);
        }
    }

    return result.join('').trim();
}

/**
 * Sanitize a string to only contain safe characters for filenames
 */
function sanitizeForFilename(str: string): string {
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

function generateLatex(resume: ResumeData): string {
    const name = escapeLaTeX(resume.name) || 'Your Name';
    const email = escapeLaTeX(resume.email);
    const phone = escapeLaTeX(resume.phone);
    const location = escapeLaTeX(resume.location);
    const summary = escapeLaTeX(resume.summary);

    // Build experience section
    const experienceParts: string[] = [];
    if (resume.experience && resume.experience.length > 0) {
        for (const exp of resume.experience) {
            const role = escapeLaTeX(exp.role) || 'Position';
            const company = escapeLaTeX(exp.company) || 'Company';
            const duration = escapeLaTeX(exp.duration);
            const description = escapeLaTeX(exp.description);

            experienceParts.push(`
\\subsection*{${role}}
\\textit{${company}} \\hfill ${duration}

${description}
`);
        }
    }
    const experienceSection = experienceParts.join('\n');

    // Build education section
    const educationParts: string[] = [];
    if (resume.education && resume.education.length > 0) {
        for (const edu of resume.education) {
            const degree = escapeLaTeX(edu.degree) || 'Degree';
            const institution = escapeLaTeX(edu.institution) || 'Institution';
            const gradYear = escapeLaTeX(edu.graduation_year);

            educationParts.push(`
\\textbf{${degree}} \\\\
${institution} \\hfill ${gradYear}
`);
        }
    }
    const educationSection = educationParts.join('\n');

    // Build skills section
    let skillsSection = '';
    if (resume.skills && resume.skills.length > 0) {
        const escapedSkills: string[] = [];
        for (const skill of resume.skills) {
            escapedSkills.push(escapeLaTeX(skill));
        }
        skillsSection = escapedSkills.join(', ');
    }

    // Build contact line
    const contactParts: string[] = [];
    if (email) contactParts.push(email);
    if (phone) contactParts.push(phone);
    if (location) contactParts.push(location);
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

        // Sanitize filename
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
            { error: 'Failed to generate LaTeX' },
            { status: 500 }
        );
    }
}
