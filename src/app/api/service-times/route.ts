import { NextRequest, NextResponse } from 'next/server';
import { ServiceController } from '@/controllers/ServiceController';

export async function GET() {
  try {
    const times = await ServiceController.getAll();
    return NextResponse.json(times);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch service times' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const serviceTime = await ServiceController.create(body.time);
    return NextResponse.json({ success: true, serviceTime });
  } catch (error: any) {
    const status = error.message === 'Service time is required' ? 400 : 500;
    return NextResponse.json(
      { error: error.message || 'Failed to create service time' },
      { status }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const serviceTime = await ServiceController.update(body.id, body.time);
    return NextResponse.json({ success: true, serviceTime });
  } catch (error: any) {
    const status = error.message === 'Service time ID and time are required' ? 400 : 500;
    return NextResponse.json(
      { error: error.message || 'Failed to update service time' },
      { status }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    
    // We can cast id to string because the controller checks for falsy values
    // but to be safe for the signature we can pass it as string | undefined/null and let controller handle or handle here
    // The controller expects string, so let's check validation here or let controller throw?
    // Controller throws "Service time ID is required" if !id.
    
    await ServiceController.delete(id as string);
    return NextResponse.json({ success: true });
  } catch (error: any) {
     const status = error.message === 'Service time ID is required' ? 400 : 500;
    return NextResponse.json(
      { error: error.message || 'Failed to delete service time' },
      { status }
    );
  }
}

