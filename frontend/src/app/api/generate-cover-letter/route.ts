import { NextRequest, NextResponse } from 'next/server';
import { callAI, OPENROUTER_API_KEY } from '@/lib/ai-config';

// Vercel serverless config
export const maxDuration = 30;

interface ResumeData {
    name?: string;
    email?: string;
    summary?: string;
    skills?: string[];
    experience?: { role?: string; company?: string; description?: string }[];
}

interface JobDescription {
    title?: string;
    company?: string;
    description?: string;
}

const SYSTEM_PROMPT = `You are an expert cover letter writer. Write compelling, personalized cover letters that:
1. Are tailored to the specific job and company
2. Highlight relevant skills and experience
3. Show enthusiasm and cultural fit
4. Are professional yet engaging
5. Are 3-4 paragraphs long
6. Return ONLY the cover letter text, no explanation or formatting`;

async function generateWithAI(resume: ResumeData, job: JobDescription): Promise<string> {
    const prompt = `Write a professional cover letter for:

APPLICANT:
Name: ${resume.name || 'Job Seeker'}
Summary: ${resume.summary || 'Experienced professional'}
Skills: ${(resume.skills || []).join(', ')}
Recent Role: ${resume.experience?.[0]?.role || 'Professional'} at ${resume.experience?.[0]?.company || 'Previous Company'}

TARGET JOB:
Title: ${job.title || 'The position'}
Company: ${job.company || 'The company'}
Description: ${(job.description || '').slice(0, 500)}

Write a compelling cover letter connecting their experience to this role.`;

    return await callAI(prompt, SYSTEM_PROMPT, { temperature: 0.7, maxTokens: 1500 });
}

function generateFallbackCoverLetter(resume: ResumeData, job: JobDescription): string {
    const name = resume.name || 'Your Name';
    const jobTitle = job.title || 'the position';
    const company = job.company || 'your company';
    const skills = (resume.skills || []).slice(0, 5).join(', ') || 'relevant skills';

    return `Dear Hiring Manager,

I am writing to express my strong interest in the ${jobTitle} position at ${company}. With my background in ${skills}, I believe I would be a valuable addition to your team.

${resume.summary || 'I am a dedicated professional with a passion for excellence and continuous learning.'}

Throughout my career, I have developed expertise in ${skills}. I am excited about the opportunity to bring my experience and skills to ${company} and contribute to your continued success.

I am particularly drawn to ${company} because of your commitment to innovation and excellence. I am confident that my skills and enthusiasm make me an ideal candidate for this role.

Thank you for considering my application. I look forward to the opportunity to discuss how I can contribute to your team.

Sincerely,
${name}`;
}

export async function POST(request: NextRequest) {
    console.log('📝 [cover-letter] Request received');

    try {
        const body = await request.json();
        const { resume_data, job_description } = body;

        console.log('👤 Name:', resume_data?.name);
        console.log('💼 Job:', job_description?.title, 'at', job_description?.company);

        let coverLetter: string;

        if (OPENROUTER_API_KEY) {
            try {
                coverLetter = await generateWithAI(resume_data || {}, job_description || {});
                console.log('✅ [cover-letter] AI generated, length:', coverLetter.length);
            } catch (aiError) {
                console.error('❌ [cover-letter] AI failed:', aiError);
                coverLetter = generateFallbackCoverLetter(resume_data || {}, job_description || {});
            }
        } else {
            coverLetter = generateFallbackCoverLetter(resume_data || {}, job_description || {});
        }

        return NextResponse.json({
            content: coverLetter,
            cover_letter: coverLetter
        });

    } catch (error) {
        console.error('❌ [cover-letter] Error:', error);
        return NextResponse.json(
            { error: 'Failed to generate cover letter' },
            { status: 500 }
        );
    }
}
