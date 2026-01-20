import { NextRequest, NextResponse } from 'next/server';
import {
  getAllDonationCategories,
  createDonationCategory,
  updateDonationCategory,
  deleteDonationCategory
} from '@/lib/database';

export async function GET() {
  try {
    const categories = await getAllDonationCategories();
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching donation categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch donation categories' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const category = await request.json();

    if (!category.name || !category.name.trim()) {
      return NextResponse.json(
        { error: 'Category name is required' },
        { status: 400 }
      );
    }

    const newCategory = {
      id: `dc${Date.now()}`,
      name: category.name.trim()
    };

    await createDonationCategory(newCategory);

    return NextResponse.json({ success: true, category: newCategory });
  } catch (error) {
    console.error('Error creating donation category:', error);
    return NextResponse.json(
      { error: 'Failed to create donation category' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const category = await request.json();

    if (!category.id || !category.name || !category.name.trim()) {
      return NextResponse.json(
        { error: 'Category ID and name are required' },
        { status: 400 }
      );
    }

    await updateDonationCategory(category.id, category.name.trim());

    return NextResponse.json({ success: true, category });
  } catch (error) {
    console.error('Error updating donation category:', error);
    return NextResponse.json(
      { error: 'Failed to update donation category' },
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
        { error: 'Category ID is required' },
        { status: 400 }
      );
    }

    await deleteDonationCategory(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting donation category:', error);
    return NextResponse.json(
      { error: 'Failed to delete donation category' },
      { status: 500 }
    );
  }
}
