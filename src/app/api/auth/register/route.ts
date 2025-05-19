/**
 * Registration API Route
 * Handles user account creation
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hash } from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    // Validate inputs
    if (!email || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check password strength (at least 12 characters, uppercase, lowercase, number, special char)
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{12,}$/;
    if (!passwordRegex.test(password)) {
      return NextResponse.json({ 
        error: 'Password must be at least 12 characters and include uppercase letters, lowercase letters, numbers, and special characters.' 
      }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 409 });
    }

    // Hash password
    const hashedPassword = await hash(password, 12);

    // Create user
    const user = await db.user.create({
      data: {
        id: uuidv4(),
        name,
        email,
        password: hashedPassword,
        setupCompleted: false,
      },
    });

    // Return success response
    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Failed to create user account' }, { status: 500 });
  }
}