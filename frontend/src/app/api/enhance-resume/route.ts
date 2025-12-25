import { NextRequest, NextResponse } from 'next/server';

// OpenRouter API Configuration - Uses Vercel environment variables
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '';
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

// Model priority chain - tries Grok first (if credits), then reliable free models
// Grok models require OpenRouter credits, free models work without
const MODELS = {
    grok: 'x-ai/grok-4.1-fast',                            // Best quality (requires credits)
    primary: 'meta-llama/llama-3.2-3b-instruct:free',      // Reliable free - best for JSON
    secondary: 'deepseek/deepseek-r1-0528:free',           // Good reasoning (free)
    fallback: 'mistralai/mistral-7b-instruct:free',        // Backup free model
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
    phone?: string;
    summary?: string;
    skills?: string[];
    experience?: ExperienceItem[];
    education?: { degree?: string; institution?: string; graduation_year?: string }[];
    projects?: { name?: string; description?: string; technologies?: string[] }[];
}

interface JobDescription {
    title?: string;
    company?: string;
    description?: string;
    skills?: string[];
    requirements?: string[];
    responsibilities?: string[];
}

// Model fallback order: Grok (paid) -> Llama (free) -> DeepSeek (free) -> Mistral (free)
const MODEL_FALLBACK_ORDER = [MODELS.grok, MODELS.primary, MODELS.secondary, MODELS.fallback];

async function callOpenRouter(prompt: string, systemPrompt: string, modelIndex: number = 0): Promise<string> {
    const useModel = MODEL_FALLBACK_ORDER[modelIndex] || MODELS.primary;
    console.log('🔑 [OpenRouter] API Key configured:', !!OPENROUTER_API_KEY);
    console.log('🤖 [OpenRouter] Trying model:', useModel, `(attempt ${modelIndex + 1}/${MODEL_FALLBACK_ORDER.length})`);

    if (!OPENROUTER_API_KEY) {
        console.error('❌ OPENROUTER_API_KEY not found in environment');
        throw new Error('OpenRouter API key not configured');
    }

    try {
        const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://ai-job-helper-steel.vercel.app',
                'X-Title': 'CareerAgentPro Resume Enhancer',
            },
            body: JSON.stringify({
                model: useModel,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: prompt },
                ],
                temperature: 0.3,
                max_tokens: 2000,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ OpenRouter API error:', response.status, errorText);

            // Check if it's a credits issue (402) or rate limit (429)
            if (response.status === 402 || response.status === 429 || response.status === 500) {
                // Try next model in fallback chain
                if (modelIndex < MODEL_FALLBACK_ORDER.length - 1) {
                    console.log('🔄 Trying next fallback model...');
                    return callOpenRouter(prompt, systemPrompt, modelIndex + 1);
                }
            }
            throw new Error(`OpenRouter API error: ${response.status}`);
        }

        const data = await response.json();
        console.log('✅ [OpenRouter] Response received from:', useModel);
        return data.choices?.[0]?.message?.content || '';
    } catch (error) {
        // Network or other error - try fallback
        if (modelIndex < MODEL_FALLBACK_ORDER.length - 1) {
            console.log('🔄 Error occurred, trying next model...');
            return callOpenRouter(prompt, systemPrompt, modelIndex + 1);
        }
        throw error;
    }
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

        // AI Enhancement Prompt - Optimized for smaller models
        const prompt = `Analyze and enhance this resume for a ${job_description.title} position.

JOB REQUIREMENTS:
- Title: ${job_description.title}
- Company: ${job_description.company || 'Company'}
- Key Skills: ${jobSkillsList}

CURRENT RESUME:
- Name: ${resume_data.name}
- Summary: ${resume_data.summary || 'None'}
- Skills: ${(resume_data.skills || []).join(', ')}
${experienceDetails}

TASK: Return ONLY a JSON object with:
{
  "enhanced_summary": "3-4 sentence professional summary",
  "experience_enhancements": [
    {
      "experience_index": 0,
      "ai_suggested_bullets": ["bullet 1", "bullet 2", "bullet 3"]
    }
  ],
  "skills_to_add": ["skill1", "skill2"],
  "ats_tips": ["tip1", "tip2"]
}

Return ONLY valid JSON, no explanation.`;

        const systemPrompt = `You are a resume optimization expert. Always return valid JSON only.`;

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

                // Try to extract JSON from response
                const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    aiEnhancements = JSON.parse(jsonMatch[0]);
                    console.log('✅ [enhance-resume] AI enhancements parsed successfully');
                }
            } else {
                console.log('⚠️ [enhance-resume] No API key, using local enhancements');
            }
        } catch (aiError) {
            console.error('❌ [enhance-resume] AI enhancement error:', aiError);
        }

        // Build response with fallback content
        const response = {
            ats_score: score,
            score_breakdown: breakdown,
            enhanced_summary: aiEnhancements?.enhanced_summary || `Results-driven ${job_description.title || 'professional'} with expertise in ${(resume_data.skills || []).slice(0, 3).join(', ')}. Seeking to leverage experience to drive impact at ${job_description.company || 'your organization'}.`,
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
                                `• Delivered key results using ${jobSkillsList.split(',')[0] || 'technical expertise'}`,
                                `• Collaborated with cross-functional teams to achieve business objectives`,
                                `• Implemented solutions improving efficiency and quality metrics`,
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
                'Add specific metrics and numbers to bullet points',
                'Include keywords from the job description naturally',
                'Quantify achievements where possible',
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
