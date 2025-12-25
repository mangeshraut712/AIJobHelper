// Shared AI configuration for the entire project
// Optimized for FREE tier compatibility on Vercel

export const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '';
export const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

// Fast models for different use cases
// Primary: gpt-4o-mini (fast, cheap, good at JSON) - PAID
// Default: llama-3.2-3b-instruct:free - FREE (use this for Vercel)
export const AI_MODEL_FAST = 'openai/gpt-4o-mini';
export const AI_MODEL_FREE = 'meta-llama/llama-3.2-3b-instruct:free';

// Use FREE model by default for Vercel compatibility
// Can opt-in to fast model with useFastModel option
export const AI_MODEL = AI_MODEL_FREE;

// Helper function to call OpenRouter with timeout and retry
export async function callAI(
    prompt: string,
    systemPrompt: string,
    options?: {
        temperature?: number;
        maxTokens?: number;
        useFreeModel?: boolean;
    }
): Promise<string> {
    if (!OPENROUTER_API_KEY) {
        throw new Error('OpenRouter API key not configured');
    }

    const model = options?.useFreeModel ? AI_MODEL_FREE : AI_MODEL;
    console.log('🤖 [AI] Calling model:', model);

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    try {
        const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://ai-job-helper-steel.vercel.app',
                'X-Title': 'CareerAgentPro',
            },
            body: JSON.stringify({
                model: model,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: prompt },
                ],
                temperature: options?.temperature ?? 0.1,
                max_tokens: options?.maxTokens ?? 1500,
            }),
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ [AI] Error:', response.status, errorText);
            throw new Error(`AI API error: ${response.status}`);
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content || '';

        console.log('✅ [AI] Response received, length:', content.length);
        return content;
    } catch (error) {
        clearTimeout(timeoutId);
        throw error;
    }
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
