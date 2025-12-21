import { NextResponse } from 'next/server';

export async function GET() {
    return NextResponse.json({
        status: 'healthy',
        service: 'CareerAgentPro',
        version: '1.0.0',
        environment: process.env.VERCEL === '1' ? 'vercel' : 'development',
    });
}
