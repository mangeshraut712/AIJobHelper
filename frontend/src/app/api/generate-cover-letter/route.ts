import { NextRequest, NextResponse } from 'next/server';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '';
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

// Model priority chain - tries Grok first (if credits), then reliable free models
const MODELS = {
    grok: 'x-ai/grok-4.1-fast',
    primary: 'meta-llama/llama-3.2-3b-instruct:free',
    secondary: 'deepseek/deepseek-r1-0528:free',
    fallback: 'mistralai/mistral-7b-instruct:free',
};

const MODEL_FALLBACK_ORDER = [MODELS.grok, MODELS.primary, MODELS.secondary, MODELS.fallback];

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

async function generateWithAI(prompt: string, systemPrompt: string, modelIndex: number = 0): Promise<string> {
    const useModel = MODEL_FALLBACK_ORDER[modelIndex] || MODELS.primary;

    if (!OPENROUTER_API_KEY) {
        throw new Error('AI service not configured');
    }

    console.log('🤖 [cover-letter] Trying model:', useModel, `(attempt ${modelIndex + 1}/${MODEL_FALLBACK_ORDER.length})`);

    try {
        const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://ai-job-helper-steel.vercel.app',
                'X-Title': 'CareerAgentPro Cover Letter Generator',
            },
            body: JSON.stringify({
                model: useModel,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: prompt },
                ],
                temperature: 0.7,
                max_tokens: 2000,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ OpenRouter API error:', response.status, errorText);

            // Try next model on credits/rate limit issues
            if ((response.status === 402 || response.status === 429 || response.status === 500)
                && modelIndex < MODEL_FALLBACK_ORDER.length - 1) {
                console.log('🔄 Trying next fallback model...');
                return generateWithAI(prompt, systemPrompt, modelIndex + 1);
            }
            throw new Error(`AI API error: ${response.status}`);
        }

        const data = await response.json();
        console.log('✅ [cover-letter] Response received from:', useModel);
        return data.choices?.[0]?.message?.content || '';
    } catch (error) {
        // Try fallback on any error
        if (modelIndex < MODEL_FALLBACK_ORDER.length - 1) {
            console.log('🔄 Error occurred, trying next model...');
            return generateWithAI(prompt, systemPrompt, modelIndex + 1);
        }
        throw error;
    }
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
    try {
        const body = await request.json();
        const { resume_data, job_description, template_type = 'professional' } = body;

        console.log('📝 [generate-cover-letter] Request received');
        console.log('👤 Name:', resume_data?.name);
        console.log('💼 Job:', job_description?.title, 'at', job_description?.company);

        let coverLetter: string;

        if (OPENROUTER_API_KEY) {
            const systemPrompt = `You are an expert cover letter writer. Write compelling, personalized cover letters that:
1. Are tailored to the specific job and company
2. Highlight relevant skills and experience
3. Show enthusiasm and cultural fit
4. Are professional yet engaging
5. Are 3-4 paragraphs long
6. Do NOT include any markdown formatting - just plain text`;

            const prompt = `Write a ${template_type} cover letter for:

APPLICANT:
Name: ${resume_data?.name || 'Job Seeker'}
Summary: ${resume_data?.summary || 'Experienced professional'}
Skills: ${(resume_data?.skills || []).join(', ')}
Recent Experience: ${resume_data?.experience?.[0]?.role || 'Various roles'} at ${resume_data?.experience?.[0]?.company || 'Previous companies'}

TARGET JOB:
Title: ${job_description?.title || 'The position'}
Company: ${job_description?.company || 'The company'}
Description: ${(job_description?.description || '').slice(0, 500)}

Write a compelling cover letter that connects the applicant's experience to this specific role. Return ONLY the cover letter text, no other commentary.`;

            try {
                coverLetter = await generateWithAI(prompt, systemPrompt);
                console.log('✅ AI-generated cover letter, length:', coverLetter.length);
            } catch (aiError) {
                console.error('AI error, using fallback:', aiError);
                coverLetter = generateFallbackCoverLetter(resume_data, job_description);
            }
        } else {
            console.log('⚠️ No API key, using fallback template');
            coverLetter = generateFallbackCoverLetter(resume_data, job_description);
        }

        // Return both 'content' and 'cover_letter' for compatibility
        return NextResponse.json({
            content: coverLetter,
            cover_letter: coverLetter
        });

    } catch (error) {
        console.error('❌ [generate-cover-letter] Error:', error);
        return NextResponse.json(
            { error: 'Failed to generate cover letter', details: String(error) },
            { status: 500 }
        );
    }
}
