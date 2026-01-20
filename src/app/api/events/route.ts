import { NextRequest, NextResponse } from 'next/server';
import { getAllEvents, createEvent, updateEvent, deleteEvent } from '@/lib/database';

export async function GET() {
  try {
    const events = await getAllEvents();
    // Convert date strings back to Date objects and sort by date
    const transformedEvents = events
      .map((event: any) => ({
        ...event,
        date: new Date(event.date),
      }))
      .sort((a: any, b: any) => a.date.getTime() - b.date.getTime());
    return NextResponse.json(transformedEvents);
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const event = await request.json();

    const eventToCreate = {
      id: event.id,
      title: event.title,
      // Convert to MySQL datetime format (YYYY-MM-DD HH:MM:SS)
      date: new Date(event.date).toISOString().slice(0, 19).replace('T', ' '),
      description: event.description,
      resource: event.resource
    };

    await createEvent(eventToCreate);

    return NextResponse.json({ success: true, event });
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const event = await request.json();

    const eventToUpdate = {
      id: event.id,
      title: event.title,
      date: new Date(event.date).toISOString().slice(0, 19).replace('T', ' '),
      description: event.description,
      resource: event.resource
    };

    await updateEvent(event.id, eventToUpdate);

    return NextResponse.json({ success: true, event });
  } catch (error) {
    console.error('Error updating event:', error);
    return NextResponse.json(
      { error: 'Failed to update event' },
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
        { error: 'Event ID is required' },
        { status: 400 }
      );
    }

    await deleteEvent(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting event:', error);
    return NextResponse.json(
      { error: 'Failed to delete event' },
      { status: 500 }
    );
  }
}
