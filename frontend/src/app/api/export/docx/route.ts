import { NextRequest, NextResponse } from 'next/server';

// Note: DOCX generation would typically use docx npm package
// For Vercel serverless, we return RTF format which is compatible with Word

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

function generateRTF(resume: ResumeData): string {
    const name = resume.name || 'Your Name';
    const email = resume.email || '';
    const phone = resume.phone || '';
    const location = resume.location || '';
    const summary = resume.summary || '';

    const experienceRTF = (resume.experience || []).map(exp => `
{\\b ${exp.role || 'Position'}} - {\\i ${exp.company || 'Company'}}\\par
${exp.duration || ''}\\par
${exp.description || ''}\\par
\\par
`).join('');

    const educationRTF = (resume.education || []).map(edu => `
{\\b ${edu.degree || 'Degree'}}\\par
${edu.institution || 'Institution'} | ${edu.graduation_year || ''}\\par
\\par
`).join('');

    const skillsRTF = (resume.skills || []).join(', ');

    return `{\\rtf1\\ansi\\deff0
{\\fonttbl{\\f0 Arial;}}
{\\colortbl;\\red0\\green0\\blue0;}
\\paperw12240\\paperh15840\\margl1440\\margr1440\\margt1440\\margb1440

{\\pard\\qc\\fs36\\b ${name}\\par}
{\\pard\\qc\\fs20 ${[email, phone, location].filter(Boolean).join(' | ')}\\par}
\\par

${summary ? `{\\pard\\fs24\\b PROFESSIONAL SUMMARY\\par}
{\\pard ${summary}\\par}
\\par` : ''}

${experienceRTF ? `{\\pard\\fs24\\b EXPERIENCE\\par}
${experienceRTF}` : ''}

${educationRTF ? `{\\pard\\fs24\\b EDUCATION\\par}
${educationRTF}` : ''}

${skillsRTF ? `{\\pard\\fs24\\b SKILLS\\par}
{\\pard ${skillsRTF}\\par}` : ''}

}`;
}

export async function POST(request: NextRequest) {
    try {
        const resume: ResumeData = await request.json();

        console.log('📄 [export/docx] Generating RTF for:', resume.name);

        const rtfContent = generateRTF(resume);

        // Return RTF format which is compatible with Word
        return new NextResponse(rtfContent, {
            status: 200,
            headers: {
                'Content-Type': 'application/rtf',
                'Content-Disposition': `attachment; filename="${resume.name || 'resume'}_resume.rtf"`,
            },
        });

    } catch (error) {
        console.error('❌ [export/docx] Error:', error);
        return NextResponse.json(
            { error: 'Failed to generate document', details: String(error) },
            { status: 500 }
        );
    }
}
