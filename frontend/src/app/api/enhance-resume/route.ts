import { NextRequest, NextResponse } from 'next/server';

// OpenRouter API Configuration
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '';
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

// Available models - Grok is default for testing
const MODELS = {
    grok: 'x-ai/grok-2-vision-1212',
    gemini: 'google/gemini-2.0-flash-exp:free',
    deepseek: 'deepseek/deepseek-chat-v3-0324:free',
};

interface ExperienceItem {
    role?: string;
    company?: string;
    duration?: string;
    description?: string;
}

interface ResumeData {
    name?: string;
    email?: string;
    summary?: string;
    skills?: string[];
    experience?: ExperienceItem[];
    education?: { degree?: string; institution?: string; graduation_year?: string }[];
    projects?: { name?: string; description?: string }[];
}

interface JobDescription {
    title?: string;
    company?: string;
    description?: string;
    skills?: string[];
    requirements?: string[];
    responsibilities?: string[];
}

async function callOpenRouter(prompt: string, systemPrompt: string): Promise<string> {
    console.log('🔑 [OpenRouter] API Key configured:', !!OPENROUTER_API_KEY);
    console.log('🤖 [OpenRouter] Using model: grok');

    if (!OPENROUTER_API_KEY) {
        console.error('❌ OPENROUTER_API_KEY not found in environment');
        throw new Error('OpenRouter API key not configured');
    }

    const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://ai-job-helper-steel.vercel.app',
            'X-Title': 'CareerAgentPro Resume Enhancer',
        },
        body: JSON.stringify({
            model: MODELS.grok,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: prompt },
            ],
            temperature: 0.2,
            max_tokens: 4000,
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ OpenRouter API error:', response.status, errorText);
        throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ [OpenRouter] Response received successfully');
    return data.choices?.[0]?.message?.content || '';
}

function calculateATSScore(resume: ResumeData, job: JobDescription): { score: number; breakdown: Record<string, number> } {
    const jobSkills = new Set((job.skills || []).map(s => s.toLowerCase()));
    const resumeSkills = new Set((resume.skills || []).map(s => s.toLowerCase()));

    const matchedSkills = [...resumeSkills].filter(s => jobSkills.has(s));
    const skillsMatch = jobSkills.size > 0 ? Math.round((matchedSkills.length / jobSkills.size) * 100) : 50;

    // Calculate experience relevance
    const expRelevance = resume.experience?.length ? 60 : 30;

    // Calculate keyword density
    const keywordDensity = jobSkills.size > 0 ? Math.min(100, Math.round((matchedSkills.length / Math.max(1, jobSkills.size)) * 100)) : 50;

    // Education score
    const educationScore = resume.education?.length ? 100 : 70;

    // Format quality
    const formatQuality = resume.summary && resume.skills?.length ? 100 : 80;

    const breakdown = {
        skills_match: skillsMatch,
        experience_relevance: expRelevance,
        keyword_density: keywordDensity,
        education: educationScore,
        format_quality: formatQuality,
    };

    const totalScore = Math.round(
        skillsMatch * 0.30 +
        expRelevance * 0.30 +
        keywordDensity * 0.20 +
        educationScore * 0.10 +
        formatQuality * 0.10
    );

    return { score: totalScore, breakdown };
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { resume_data, job_description } = body;

        console.log('📥 [enhance-resume] Request received');
        console.log('👤 [enhance-resume] Resume name:', resume_data?.name);
        console.log('💼 [enhance-resume] Job title:', job_description?.title);

        // Calculate ATS score
        const { score, breakdown } = calculateATSScore(resume_data, job_description);

        // Prepare experience details for the prompt
        const experienceDetails = (resume_data.experience || [])
            .map((exp: ExperienceItem, i: number) => `
Experience #${i + 1}:
- Role: ${exp.role || 'N/A'}
- Company: ${exp.company || 'N/A'}
- Duration: ${exp.duration || 'N/A'}
- Current Description: ${exp.description || 'N/A'}
`).join('\n');

        const jobSkillsList = (job_description.skills || []).join(', ');

        // AI Enhancement Prompt
        const prompt = `You are an expert resume writer and ATS optimization specialist. Analyze and enhance this resume for a ${job_description.title} position at ${job_description.company || 'the company'}.

TARGET JOB:
- Title: ${job_description.title}
- Company: ${job_description.company || 'Not specified'}
- Required Skills: ${jobSkillsList}
- Description: ${(job_description.description || '').substring(0, 500)}

CURRENT RESUME:
- Name: ${resume_data.name}
- Summary: ${resume_data.summary || 'None'}
- Skills: ${(resume_data.skills || []).join(', ')}

${experienceDetails}

TASK: Generate enhanced bullet points for each experience that:
1. Start with powerful action verbs (Architected, Engineered, Led, Developed, Optimized)
2. Include specific metrics (%, $, time saved, users impacted)
3. Incorporate keywords: ${jobSkillsList}
4. Are 15-25 words each
5. Show business impact and results

Return a JSON object with this exact structure:
{
    "enhanced_summary": "A 3-4 sentence professional summary tailored to the ${job_description.title} role",
    "experience_enhancements": [
        {
            "experience_index": 0,
            "role": "role name",
            "ai_suggested_bullets": [
                "Enhanced bullet 1 with metrics and keywords...",
                "Enhanced bullet 2 with metrics and keywords...",
                "Enhanced bullet 3 with metrics and keywords...",
                "Enhanced bullet 4 with metrics and keywords...",
                "Enhanced bullet 5 with metrics and keywords..."
            ]
        }
    ],
    "skills_to_add": ["skill1", "skill2"],
    "ats_tips": ["tip1", "tip2", "tip3"]
}

Return ONLY valid JSON, no markdown or explanation.`;

        const systemPrompt = `You are a world-class technical resume writer. Your bullet points are legendary for being specific, metric-driven, and ATS-optimized. Return ONLY valid JSON.`;

        let aiEnhancements = null;

        try {
            if (OPENROUTER_API_KEY) {
                console.log('🚀 [enhance-resume] Calling OpenRouter API...');
                const aiResponse = await callOpenRouter(prompt, systemPrompt);

                // Parse AI response
                let cleanedResponse = aiResponse;
                if (cleanedResponse.includes('```json')) {
                    cleanedResponse = cleanedResponse.split('```json')[1].split('```')[0].trim();
                } else if (cleanedResponse.includes('```')) {
                    cleanedResponse = cleanedResponse.split('```')[1].split('```')[0].trim();
                }

                aiEnhancements = JSON.parse(cleanedResponse);
                console.log('✅ [enhance-resume] AI enhancements parsed successfully');
            } else {
                console.log('⚠️ [enhance-resume] No API key, using local enhancements');
            }
        } catch (aiError) {
            console.error('❌ [enhance-resume] AI enhancement error:', aiError);
        }

        // Build response
        const response = {
            ats_score: score,
            score_breakdown: breakdown,
            enhanced_summary: aiEnhancements?.enhanced_summary || `Results-driven professional with expertise in ${(resume_data.skills || []).slice(0, 3).join(', ')}. Seeking ${job_description.title} role where I can leverage my experience to drive impact.`,
            section_improvements: {
                summary: {
                    ai_enhanced: aiEnhancements?.enhanced_summary,
                },
                experience: {
                    items: (resume_data.experience || []).map((exp: ExperienceItem, i: number) => {
                        const aiExp = aiEnhancements?.experience_enhancements?.find(
                            (e: { experience_index: number }) => e.experience_index === i
                        );
                        return {
                            original: exp,
                            ai_suggested_bullets: aiExp?.ai_suggested_bullets || [
                                `• Architected scalable solutions using ${jobSkillsList.split(',')[0] || 'modern technologies'}, improving system performance by 40%`,
                                `• Led cross-functional team initiatives resulting in 30% efficiency improvements`,
                                `• Implemented automated testing achieving 95% code coverage and reducing bugs by 70%`,
                                `• Developed RESTful APIs serving 50K+ daily requests with 99.9% uptime`,
                                `• Collaborated with stakeholders to deliver agile sprints exceeding velocity targets by 25%`,
                            ],
                        };
                    }),
                },
                skills: {
                    matched: (resume_data.skills || []).filter((s: string) =>
                        (job_description.skills || []).map((js: string) => js.toLowerCase()).includes(s.toLowerCase())
                    ),
                    missing: (job_description.skills || []).filter((s: string) =>
                        !(resume_data.skills || []).map((rs: string) => rs.toLowerCase()).includes(s.toLowerCase())
                    ),
                    ai_recommended: aiEnhancements?.skills_to_add || [],
                },
            },
            ats_tips: aiEnhancements?.ats_tips || [
                'Add more specific metrics to your experience bullet points',
                'Include keywords from the job description naturally',
                'Quantify achievements with numbers and percentages',
            ],
        };

        console.log('📤 [enhance-resume] Response sent successfully');
        return NextResponse.json(response);

    } catch (error) {
        console.error('❌ [enhance-resume] Error:', error);
        return NextResponse.json(
            { error: 'Failed to enhance resume', details: String(error) },
            { status: 500 }
        );
    }
}

export async function OPTIONS() {
    return new NextResponse(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
    });
}
