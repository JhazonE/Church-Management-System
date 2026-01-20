import { NextRequest, NextResponse } from 'next/server';
import { getAllExpenses, createExpense, updateExpense, deleteExpense } from '@/lib/database';
import { RawExpense } from '@/lib/types';

export async function GET() {
  try {
    const expenses = await getAllExpenses() as RawExpense[];
    // Transform field names to match frontend expectations
    const transformedExpenses = expenses.map((expense: RawExpense) => ({
      ...expense,
      amount: typeof expense.amount === 'string' ? parseFloat(expense.amount) : expense.amount, // Convert string to number for MySQL DECIMAL
      recordedById: expense.recorded_by_id
    })).sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return NextResponse.json(transformedExpenses);
  } catch (error) {
    console.error('Error fetching expenses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch expenses' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const expense = await request.json();

    const expenseToCreate = {
      id: expense.id,
      description: expense.description,
      amount: expense.amount,
      date: expense.date,
      category: expense.category,
      recorded_by_id: expense.recordedById || null
    };

    await createExpense(expenseToCreate);

    return NextResponse.json({ success: true, expense });
  } catch (error) {
    console.error('Error creating expense:', error);
    return NextResponse.json(
      { error: 'Failed to create expense' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const expense = await request.json();

    const expenseToUpdate = {
      id: expense.id,
      description: expense.description,
      amount: expense.amount,
      date: expense.date,
      category: expense.category,
      recorded_by_id: expense.recordedById || null
    };

    await updateExpense(expense.id, expenseToUpdate);

    return NextResponse.json({ success: true, expense });
  } catch (error) {
    console.error('Error updating expense:', error);
    return NextResponse.json(
      { error: 'Failed to update expense' },
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
        { error: 'Expense ID is required' },
        { status: 400 }
      );
    }

    await deleteExpense(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting expense:', error);
    return NextResponse.json(
      { error: 'Failed to delete expense' },
      { status: 500 }
    );
  }
}
