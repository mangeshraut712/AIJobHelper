import { NextResponse } from 'next/server';

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
            database: 'not_applicable'
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
    });
}
