import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Basic health check - could be extended to check database connectivity
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'clc-finance'
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: 'Service unavailable'
      },
      { status: 503 }
    );
  }
}
