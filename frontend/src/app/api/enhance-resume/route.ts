import { NextRequest, NextResponse } from 'next/server';
import { callAI, extractJSON, OPENROUTER_API_KEY } from '@/lib/ai-config';

// Vercel serverless config
export const maxDuration = 30;

interface ResumeData {
    name?: string;
    email?: string;
    phone?: string;
    summary?: string;
    skills?: string[];
    experience?: {
        role?: string;
        company?: string;
        duration?: string;
        description?: string;
    }[];
    education?: {
        institution?: string;
        degree?: string;
        graduation_year?: string;
    }[];
}

interface JobDescription {
    title?: string;
    company?: string;
    description?: string;
    skills?: string[];
    requirements?: string[];
}

const SYSTEM_PROMPT = `You are an expert resume consultant and ATS optimization specialist.
Analyze the resume against the job description and provide detailed improvements.
Return ONLY valid JSON without any markdown or explanation.`;

async function enhanceWithAI(resume: ResumeData, job: JobDescription): Promise<object> {
    const prompt = `Analyze this resume for the target job and provide improvements:

RESUME:
Name: ${resume.name || 'N/A'}
Summary: ${resume.summary || 'N/A'}
Skills: ${(resume.skills || []).join(', ')}
Experience: ${JSON.stringify(resume.experience || [])}
Education: ${JSON.stringify(resume.education || [])}

TARGET JOB:
Title: ${job.title || 'Software Engineer'}
Company: ${job.company || 'Company'}
Required Skills: ${(job.skills || []).join(', ')}
Description: ${(job.description || '').substring(0, 1000)}

Return JSON with this structure:
{
    "ats_score": 75,
    "score_breakdown": {
        "skills_match": 80,
        "experience_relevance": 70,
        "keyword_density": 75,
        "education": 80,
        "format_quality": 80
    },
    "enhanced_summary": "improved professional summary",
    "section_improvements": {
        "summary": {"ai_enhanced": "improved summary"},
        "experience": {"items": [{"original": {...}, "ai_suggested_bullets": ["bullet1", "bullet2"]}]},
        "skills": {"matched": ["skill1"], "missing": ["skill2"], "ai_recommended": ["skill3"]}
    },
    "ats_tips": ["tip1", "tip2", "tip3"]
}`;

    const response = await callAI(prompt, SYSTEM_PROMPT, { temperature: 0.3, maxTokens: 2500 });
    const jsonStr = extractJSON(response);
    return JSON.parse(jsonStr);
}

function generateFallbackEnhancement(resume: ResumeData, job: JobDescription): object {
    const resumeSkills = (resume.skills || []).map(s => s.toLowerCase());
    const jobSkills = (job.skills || []).map(s => s.toLowerCase());

    const matched = jobSkills.filter(s => resumeSkills.some(rs => rs.includes(s) || s.includes(rs)));
    const missing = jobSkills.filter(s => !resumeSkills.some(rs => rs.includes(s) || s.includes(rs)));

    const skillsScore = jobSkills.length > 0 ? Math.round((matched.length / jobSkills.length) * 100) : 50;
    const atsScore = Math.round((skillsScore + 70 + 60 + 75 + 80) / 5);

    return {
        ats_score: atsScore,
        score_breakdown: {
            skills_match: skillsScore,
            experience_relevance: 70,
            keyword_density: 60,
            education: 75,
            format_quality: 80,
        },
        enhanced_summary: resume.summary || `Professional with expertise in ${(resume.skills || []).slice(0, 3).join(', ')}.`,
        section_improvements: {
            summary: { ai_enhanced: 'Complete your profile for AI-powered suggestions.' },
            experience: { items: [] },
            skills: {
                matched: matched.slice(0, 10),
                missing: missing.slice(0, 5),
                ai_recommended: ['Communication', 'Problem Solving'],
            },
        },
        ats_tips: [
            'Add more keywords from the job description',
            'Quantify your achievements with numbers',
            'Use action verbs to describe your experience',
        ],
    };
}

export async function POST(request: NextRequest) {
    console.log('📥 [enhance-resume] Request received');

    try {
        const body = await request.json();
        const { resume_data, job_description } = body;

        if (!resume_data) {
            return NextResponse.json({ error: 'Resume data required' }, { status: 400 });
        }

        console.log('👤 Resume for:', resume_data.name || 'Unknown');
        console.log('💼 Target job:', job_description?.title || 'Not specified');

        let result: object;

        if (OPENROUTER_API_KEY) {
            try {
                result = await enhanceWithAI(resume_data, job_description || {});
                console.log('✅ [enhance-resume] AI enhancement succeeded');
            } catch (aiError) {
                console.error('❌ [enhance-resume] AI failed:', aiError);
                result = generateFallbackEnhancement(resume_data, job_description || {});
            }
        } else {
            result = generateFallbackEnhancement(resume_data, job_description || {});
        }

        return NextResponse.json(result);

    } catch (error) {
        console.error('❌ [enhance-resume] Error:', error);
        return NextResponse.json(
            { error: 'Failed to enhance resume' },
            { status: 500 }
        );
    }
}
