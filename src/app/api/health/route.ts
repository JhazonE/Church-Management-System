import { NextResponse } from 'next/server';
import { getDbStatus } from '@/lib/database';

export async function GET() {
  try {
    const dbStatus = getDbStatus();
    
    return NextResponse.json({
      status: dbStatus.dbInitError ? 'unhealthy' : 'healthy',
      timestamp: new Date().toISOString(),
      service: 'clc-finance',
      database: dbStatus
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: error.message || 'Service unavailable'
      },
      { status: 503 }
    );
  }
}
