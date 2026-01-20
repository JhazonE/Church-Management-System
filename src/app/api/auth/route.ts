import { NextRequest, NextResponse } from 'next/server';
import { getUserByUsername } from '@/lib/database';
import bcrypt from 'bcrypt';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    // Find user in database
    const user = await getUserByUsername(username);

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      );
    }

    // Check password (if user exists but not yet hashed, (for backward compatibility)
    let isValid = false;
    if (user.password && user.password.startsWith('$2') && bcrypt) {
      // Hashed password - compare
      isValid = await bcrypt.compare(password, user.password);
    } else {
      // Plain password (for existing users in placeholder data or when bcrypt not available)
      isValid = password === user.password;
    }

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      );
    }

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error('Authentication error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}
