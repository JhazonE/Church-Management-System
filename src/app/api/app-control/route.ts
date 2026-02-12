import { NextRequest, NextResponse } from 'next/server';
import { AppController } from '@/controllers/AppController';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'shutdown':
        await AppController.shutdown();
        return NextResponse.json({ success: true, message: 'Shutting down...' });
      
      case 'restart':
        await AppController.restart();
        return NextResponse.json({ success: true, message: 'Restarting...' });
      
      case 'start':
        await AppController.start();
        return NextResponse.json({ success: true, message: 'App is running.' });
        
      default:
        return NextResponse.json(
          { error: 'Invalid action. Use "shutdown", "restart", or "start".' },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error('AppControl Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
