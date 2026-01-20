import { NextRequest, NextResponse } from 'next/server';
import {
  getAllGivingTypes,
  createGivingType,
  updateGivingType,
  deleteGivingType
} from '@/lib/database';

export async function GET() {
  try {
    const types = await getAllGivingTypes();
    return NextResponse.json(types);
  } catch (error) {
    console.error('Error fetching giving types:', error);
    return NextResponse.json(
      { error: 'Failed to fetch giving types' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const givingType = await request.json();

    if (!givingType.name || !givingType.name.trim()) {
      return NextResponse.json(
        { error: 'Giving type name is required' },
        { status: 400 }
      );
    }

    const newGivingType = {
      id: `gt${Date.now()}`,
      name: givingType.name.trim()
    };

    await createGivingType(newGivingType);

    return NextResponse.json({ success: true, givingType: newGivingType });
  } catch (error) {
    console.error('Error creating giving type:', error);
    return NextResponse.json(
      { error: 'Failed to create giving type' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const givingType = await request.json();

    if (!givingType.id || !givingType.name || !givingType.name.trim()) {
      return NextResponse.json(
        { error: 'Giving type ID and name are required' },
        { status: 400 }
      );
    }

    await updateGivingType(givingType.id, givingType.name.trim());

    return NextResponse.json({ success: true, givingType });
  } catch (error) {
    console.error('Error updating giving type:', error);
    return NextResponse.json(
      { error: 'Failed to update giving type' },
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
        { error: 'Giving type ID is required' },
        { status: 400 }
      );
    }

    await deleteGivingType(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting giving type:', error);
    return NextResponse.json(
      { error: 'Failed to delete giving type' },
      { status: 500 }
    );
  }
}
