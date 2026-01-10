import { NextResponse } from 'next/server';

// Enable edge runtime for faster cold starts
export const runtime = 'edge';

// Cache health check for 60 seconds
export const revalidate = 60;

export async function GET() {
    const hasApiKey = !!process.env.OPENROUTER_API_KEY;
    const isVercel = process.env.VERCEL === '1';

    return NextResponse.json({
        status: hasApiKey ? 'healthy' : 'degraded',
        service: 'CareerAgentPro',
        version: '1.0.0',
        environment: isVercel ? 'vercel' : 'development',
        timestamp: new Date().toISOString(),
        checks: {
            api: 'ok',
            ai_service: hasApiKey ? 'configured' : 'not_configured',
        },
        features: {
            resume_parsing: true,
            resume_enhancement: hasApiKey,
            job_extraction: true,
            cover_letter_generation: hasApiKey,
            export_pdf: true,
            export_docx: true,
            export_latex: true
        }
    }, {
        headers: {
            'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
        }
    });
}
