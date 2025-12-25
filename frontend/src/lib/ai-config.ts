// Shared AI configuration for the entire project
// Optimized for FREE tier compatibility on Vercel

export const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '';
export const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

// Model selection - using GPT-4 mini for best quality with reasonable cost
// With API key, this provides excellent parsing without rate limits
const AI_MODEL_FAST = 'openai/gpt-4o-mini'; // Fast, affordable, high quality
const AI_MODEL_FREE = 'meta-llama/llama-3.2-3b-instruct:free'; // Free but rate-limited

// Use fast model if API key is available, otherwise free
export const AI_MODEL = OPENROUTER_API_KEY ? AI_MODEL_FAST : AI_MODEL_FREE;

console.log(`🤖 [AI] Using model: ${AI_MODEL}${OPENROUTER_API_KEY ? ' (with your API key)' : ' (free, may have rate limits)'}`);

interface AIOptions {
    temperature?: number;
    maxTokens?: number;
}

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
