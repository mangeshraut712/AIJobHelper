// Shared AI configuration for the entire project
// Use ONE model across all features for consistency

export const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '';
export const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

// Using meta-llama/llama-3.2-3b-instruct:free as the single model
// This is the most reliable FREE model that works well for:
// - JSON structured output
// - Resume parsing
// - Cover letter generation
// - Job analysis
export const AI_MODEL = 'meta-llama/llama-3.2-3b-instruct:free';

// Helper function to call OpenRouter with the standard model
export async function callAI(
    prompt: string,
    systemPrompt: string,
    options?: {
        temperature?: number;
        maxTokens?: number;
    }
): Promise<string> {
    if (!OPENROUTER_API_KEY) {
        throw new Error('OpenRouter API key not configured');
    }

    console.log('🤖 [AI] Calling model:', AI_MODEL);

    const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://ai-job-helper-steel.vercel.app',
            'X-Title': 'CareerAgentPro',
        },
        body: JSON.stringify({
            model: AI_MODEL,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: prompt },
            ],
            temperature: options?.temperature ?? 0.1,
            max_tokens: options?.maxTokens ?? 2000,
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [AI] Error:', response.status, errorText);
        throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

    console.log('✅ [AI] Response received, length:', content.length);
    return content;
}

// Extract JSON from AI response (handles markdown code blocks)
export function extractJSON(text: string): string {
    // Try to find JSON in code blocks
    const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (codeBlockMatch) {
        return codeBlockMatch[1].trim();
    }

    // Try to find raw JSON object
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
        return jsonMatch[0];
    }

    return text;
}
