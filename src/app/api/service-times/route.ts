import { NextRequest, NextResponse } from 'next/server';
import {
  getAllServiceTimes,
  createServiceTime,
  updateServiceTime,
  deleteServiceTime
} from '@/lib/database';

export async function GET() {
  try {
    const times = await getAllServiceTimes();
    return NextResponse.json(times);
  } catch (error) {
    console.error('Error fetching service times:', error);
    return NextResponse.json(
      { error: 'Failed to fetch service times' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const serviceTime = await request.json();

    if (!serviceTime.time || !serviceTime.time.trim()) {
      return NextResponse.json(
        { error: 'Service time is required' },
        { status: 400 }
      );
    }

    const newServiceTime = {
      id: `st${Date.now()}`,
      time: serviceTime.time.trim()
    };

    await createServiceTime(newServiceTime);

    return NextResponse.json({ success: true, serviceTime: newServiceTime });
  } catch (error) {
    console.error('Error creating service time:', error);
    return NextResponse.json(
      { error: 'Failed to create service time' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const serviceTime = await request.json();

    if (!serviceTime.id || !serviceTime.time || !serviceTime.time.trim()) {
      return NextResponse.json(
        { error: 'Service time ID and time are required' },
        { status: 400 }
      );
    }

    await updateServiceTime(serviceTime.id, serviceTime.time.trim());

    return NextResponse.json({ success: true, serviceTime });
  } catch (error) {
    console.error('Error updating service time:', error);
    return NextResponse.json(
      { error: 'Failed to update service time' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Service time ID is required' },
        { status: 400 }
      );
    }

    await deleteServiceTime(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting service time:', error);
    return NextResponse.json(
      { error: 'Failed to delete service time' },
      { status: 500 }
    );
  }
}
