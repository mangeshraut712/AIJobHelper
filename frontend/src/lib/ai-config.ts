// Shared AI configuration for the entire project
// Optimized for FREE tier compatibility on Vercel

// AI Configuration
export const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '';
export const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

// Using Qwen 2.5 Coder 32B - BEST for structured data extraction (JSON, parsing)
// Specifically trained for code and structured output - perfect for resume parsing
// Better rate limits than Gemini, excellent at following JSON schemas
export const AI_MODEL = 'qwen/qwen-2.5-coder-32b-instruct:free';

console.log(`🤖 [AI] Using model: ${AI_MODEL} (free, optimized for structured output)`);

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
    }
): Promise<string> {
    if (!OPENROUTER_API_KEY) {
        throw new Error('OpenRouter API key not configured');
    }

    console.log('🤖 [AI] Calling model:', AI_MODEL);

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
                model: AI_MODEL,
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
