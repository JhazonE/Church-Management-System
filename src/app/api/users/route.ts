import { NextRequest, NextResponse } from 'next/server';
import { getAllUsers, createUser, updateUser, deleteUser } from '@/lib/database';
import bcrypt from 'bcrypt';

export async function GET() {
  try {
    const users = await getAllUsers();
    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await request.json();

    let hashedPassword = null;
    if (user.password) {
      if (bcrypt) {
        const saltRounds = 10;
        hashedPassword = await bcrypt.hash(user.password, saltRounds);
      } else {
        // Fallback to plain text when bcrypt not available
        hashedPassword = user.password;
      }
    }

    const userToCreate = {
      ...user,
      password: hashedPassword
    };

    await createUser(userToCreate);

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await request.json();

    let hashedPassword = null;
    if (user.password) {
      if (bcrypt) {
        const saltRounds = 10;
        hashedPassword = await bcrypt.hash(user.password, saltRounds);
      } else {
        // Fallback to plain text when bcrypt not available
        hashedPassword = user.password;
      }
    }

    const userToUpdate = {
      ...user,
      password: hashedPassword
    };

    await updateUser(user.id, userToUpdate);

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
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
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    await deleteUser(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}
