import { NextRequest, NextResponse } from 'next/server';
import { callAI } from '@/lib/ai-config';

export const maxDuration = 60;

interface ResumeData {
    name: string;
    email: string;
    summary: string;
    skills: string[];
    experience: Array<{ role: string; company: string; description: string }>;
}

interface JobDescription {
    title: string;
    company: string;
    description: string;
    requirements: string;
    skills: string;
}

const COVER_LETTER_PROMPT = `You are an expert cover letter writer. Generate a professional, personalized cover letter.

REQUIREMENTS:
1. Professional tone, enthusiastic but not over-the-top
2. Highlight SPECIFIC achievements from experience
3. Connect skills to job requirements
4. Show knowledge about the company
5. Clear structure: opening, body (2-3 paragraphs), closing
6. 250-350 words total

STRUCTURE:
- Opening: Express interest, mention how you found the role
- Body Paragraph 1: Highlight most relevant experience + quantified achievement
- Body Paragraph 2: Connect your skills to job requirements
- Closing: Express enthusiasm, call to action

Return ONLY the cover letter text, no markdown formatting.`;

const EMAIL_PROMPT = `Generate a professional job application email. Keep it concise (150-200 words).

INCLUDE:
- Professional subject line suggestion
- Brief introduction
- Why you're a good fit (1-2 sentences)
- Mention attached resume
- Professional closing

Format as:
Subject: [your subject line]

[email body]`;

const LINKEDIN_PROMPT = `Generate a professional LinkedIn connection request message.

REQUIREMENTS:
- Maximum 300 characters (LinkedIn limit)
- Mention the specific role
- Show genuine interest
- Professional but friendly tone

Return ONLY the message text.`;

const FOLLOW_UP_PROMPT = `Generate a professional follow-up email after job application/interview.

REQUIREMENTS:
- Polite and professional
- Re-express interest
- Reference specific discussion points (if applicable)
- Ask about next steps
- 150-200 words

Return ONLY the email text.`;

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { resume_data, job_description, template_type } = body as {
            resume_data: ResumeData;
            job_description: JobDescription;
            template_type: 'cover_letter' | 'email' | 'linkedin' | 'follow_up';
        };

        console.log(`📝 [generate-cover-letter] Generating ${template_type} for ${job_description.title} at ${job_description.company}`);

        // Select appropriate system prompt
        const systemPromptMap = {
            cover_letter: COVER_LETTER_PROMPT,
            email: EMAIL_PROMPT,
            linkedin: LINKEDIN_PROMPT,
            follow_up: FOLLOW_UP_PROMPT,
        };

        const systemPrompt = systemPromptMap[template_type];

        // Build user prompt with context
        const userPrompt = `Generate a ${template_type.replace('_', ' ')} for this application:

JOB DETAILS:
- Position: ${job_description.title}
- Company: ${job_description.company}
- Requirements: ${job_description.requirements}
- Key Skills Needed: ${job_description.skills}

CANDIDATE PROFILE:
- Name: ${resume_data.name}
- Summary: ${resume_data.summary}
- Top Skills: ${resume_data.skills.slice(0, 8).join(', ')}
- Recent Experience: ${resume_data.experience.slice(0, 2).map(exp => `${exp.role} at ${exp.company}`).join('; ')}

KEY ACHIEVEMENTS:
${resume_data.experience.slice(0, 2).map((exp, idx) => `${idx + 1}. ${exp.description.split('.')[0]}`).join('\n')}

Generate a compelling, personalized ${template_type.replace('_', ' ')} that highlights the match between this candidate and the role.`;

        // Call AI
        const response = await callAI(userPrompt, systemPrompt, {
            temperature: 0.7, // Slightly creative for writing
            maxTokens: 800,
        });

        console.log(`✅ [generate-cover-letter] Generated ${template_type}, length: ${response.length} chars`);

        return NextResponse.json({
            content: response.trim(),
            type: template_type,
        });

    } catch (error) {
        console.error('❌ [generate-cover-letter] Error:', error);
        return NextResponse.json(
            { detail: 'Failed to generate content. Please try again.' },
            { status: 500 }
        );
    }
}
