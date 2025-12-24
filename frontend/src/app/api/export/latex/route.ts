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

function generateLatex(resume: ResumeData): string {
    const escapeTex = (str: string): string => {
        if (!str) return '';
        return str
            .replace(/\\/g, '\\textbackslash{}')
            .replace(/[&%$#_{}]/g, '\\$&')
            .replace(/~/g, '\\textasciitilde{}')
            .replace(/\^/g, '\\textasciicircum{}');
    };

    const name = escapeTex(resume.name || 'Your Name');
    const email = escapeTex(resume.email || '');
    const phone = escapeTex(resume.phone || '');
    const location = escapeTex(resume.location || '');
    const summary = escapeTex(resume.summary || '');

    let experienceSection = '';
    if (resume.experience && resume.experience.length > 0) {
        experienceSection = resume.experience.map(exp => `
\\subsection*{${escapeTex(exp.role || 'Position')}}
\\textit{${escapeTex(exp.company || 'Company')}} \\hfill ${escapeTex(exp.duration || '')}

${escapeTex(exp.description || '')}
`).join('\n');
    }

    let educationSection = '';
    if (resume.education && resume.education.length > 0) {
        educationSection = resume.education.map(edu => `
\\textbf{${escapeTex(edu.degree || 'Degree')}} \\\\
${escapeTex(edu.institution || 'Institution')} \\hfill ${escapeTex(edu.graduation_year || '')}
`).join('\n');
    }

    let skillsSection = '';
    if (resume.skills && resume.skills.length > 0) {
        skillsSection = resume.skills.map(s => escapeTex(s)).join(', ');
    }

    return `\\documentclass[11pt,a4paper]{article}
\\usepackage[utf8]{inputenc}
\\usepackage[margin=1in]{geometry}
\\usepackage{titlesec}
\\usepackage{enumitem}
\\usepackage{hyperref}

\\titleformat{\\section}{\\large\\bfseries}{}{0em}{}[\\titlerule]
\\titlespacing*{\\section}{0pt}{12pt}{6pt}

\\begin{document}

\\begin{center}
{\\LARGE\\bfseries ${name}}

${email}${phone ? ` | ${phone}` : ''}${location ? ` | ${location}` : ''}
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

        return new NextResponse(latexContent, {
            status: 200,
            headers: {
                'Content-Type': 'text/plain',
                'Content-Disposition': `attachment; filename="${resume.name || 'resume'}_resume.tex"`,
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
