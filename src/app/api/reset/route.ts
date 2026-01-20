import { NextRequest, NextResponse } from 'next/server';
import { resetSystemData } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    // Get user from request headers (passed from frontend)
    const userId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role');

    if (!userId || !userRole) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (userRole !== 'Admin') {
      return NextResponse.json(
        { error: 'Admin privileges required for system reset' },
        { status: 403 }
      );
    }

    // Get confirmation from request body
    const { confirmReset } = await request.json();

    if (confirmReset !== true) {
      return NextResponse.json(
        { error: 'System reset must be explicitly confirmed' },
        { status: 400 }
      );
    }

    // Reset system data using the database abstraction
    await resetSystemData();

    return NextResponse.json({
      success: true,
      message: 'System data has been reset successfully',
      timestamp: new Date().toISOString(),
      resetBy: userId
    });
  } catch (error) {
    console.error('System reset error:', error);
    return NextResponse.json(
      { error: 'Failed to reset system data' },
      { status: 500 }
    );
  }
}
