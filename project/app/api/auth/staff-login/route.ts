import { NextRequest, NextResponse } from 'next/server';

const ALLOWED_CREDENTIALS = {
  usernames: ['admin', 'admin@quevaa.com'],
  password: process.env.STAFF_PASSWORD || 'Quevaa@2026',
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: 'Username and password are required.' },
        { status: 400 }
      );
    }

    const cleanUsername = String(username).trim().toLowerCase();
    const cleanPassword = String(password).trim();

    // Verify against single allowed credentials
    const isUsernameValid =
      cleanUsername === ALLOWED_CREDENTIALS.usernames[0] ||
      cleanUsername === ALLOWED_CREDENTIALS.usernames[1] ||
      cleanUsername === (process.env.STAFF_USERNAME || 'admin').toLowerCase() ||
      cleanUsername === (process.env.STAFF_EMAIL || 'admin@quevaa.com').toLowerCase();

    const isPasswordValid = cleanPassword === ALLOWED_CREDENTIALS.password;

    if (!isUsernameValid || !isPasswordValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid username or password. Please try again.' },
        { status: 401 }
      );
    }

    // Login successful
    return NextResponse.json({
      success: true,
      user: {
        username: 'admin',
        email: 'admin@quevaa.com',
        role: 'staff',
      },
    });
  } catch (error) {
    console.error('Staff login error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error occurred during login.' },
      { status: 500 }
    );
  }
}
