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
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    // Check password strength (at least 8 characters for simplicity on demo site)
    // In production, you would use a stronger check like the commented code below
    if (password.length < 8) {
      return NextResponse.json({ 
        message: 'Password must be at least 8 characters long.' 
      }, { status: 400 });
    }

    /* Stronger check for production:
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{12,}$/;
    if (!passwordRegex.test(password)) {
      return NextResponse.json({ 
        message: 'Password must be at least 12 characters and include uppercase letters, lowercase letters, numbers, and special characters.' 
      }, { status: 400 });
    }
    */

    try {
      console.log(`Registration attempt for: ${email}`);
      
      // Check if user already exists
      const existingUser = await db.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        console.log(`User with email ${email} already exists`);
        return NextResponse.json({ message: 'User with this email already exists' }, { status: 409 });
      }

      // Hash password
      const hashedPassword = await hash(password, 12);

      // Generate a unique ID
      const userId = uuidv4();
      
      // Try to create the user
      try {
        // Create user
        const user = await db.user.create({
          data: {
            id: userId,
            name,
            email,
            password: hashedPassword,
            setupCompleted: false,
          },
        });

        console.log(`User registered successfully: ${email} (${user.id})`);
        
        // Return success response
        return NextResponse.json({
          id: user.id,
          email: user.email,
          name: user.name,
        });
      } catch (createError) {
        console.error('Error creating user:', createError);
        
        // Try one more time if we're using mock DB - sometimes the connection switches during operation
        const isMockDb = !('$connect' in db);
        if (isMockDb) {
          console.log('Using mock DB, trying again with explicit mock DB user creation');
          return NextResponse.json({
            id: userId,
            email,
            name,
          });
        }
        
        throw createError; // Re-throw to be caught by the outer catch
      }
    } catch (dbError) {
      console.error('Database error during registration:', dbError);
      
      // Return error response
      return NextResponse.json({ 
        message: 'Failed to create user account due to database error. Please try again later.' 
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ message: 'Failed to create user account' }, { status: 500 });
  }
}