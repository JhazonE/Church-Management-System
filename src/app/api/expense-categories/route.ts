import { NextRequest, NextResponse } from 'next/server';
import {
  getAllExpenseCategories,
  createExpenseCategory,
  updateExpenseCategory,
  deleteExpenseCategory
} from '@/lib/database';

export async function GET() {
  try {
    const categories = await getAllExpenseCategories();
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching expense categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch expense categories' },
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
      id: `ec${Date.now()}`,
      name: category.name.trim()
    };

    await createExpenseCategory(newCategory);

    return NextResponse.json({ success: true, category: newCategory });
  } catch (error) {
    console.error('Error creating expense category:', error);
    return NextResponse.json(
      { error: 'Failed to create expense category' },
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

    await updateExpenseCategory(category.id, category.name.trim());

    return NextResponse.json({ success: true, category });
  } catch (error) {
    console.error('Error updating expense category:', error);
    return NextResponse.json(
      { error: 'Failed to update expense category' },
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

    await deleteExpenseCategory(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting expense category:', error);
    return NextResponse.json(
      { error: 'Failed to delete expense category' },
      { status: 500 }
    );
  }
}
