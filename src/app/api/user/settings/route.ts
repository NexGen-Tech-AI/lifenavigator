import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/NextAuth';
import { prisma } from '@/lib/db';
import { userService } from '@/lib/services/userService';

export async function GET(request: NextRequest) {
  try {
    // Get the session
    const session = await getServerSession(authOptions);

    // Check if user is authenticated
    if (!session || !session.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user ID from session
    const userId = session.user.id;

    // Fetch user settings from the database
    const userSettings = await prisma.userSettings.findUnique({
      where: { userId },
    });

    if (!userSettings) {
      // Create default settings if none exist
      const defaultSettings = await prisma.userSettings.create({
        data: {
          userId,
          theme: 'system',
          currency: 'USD',
          notificationsEnabled: true,
        },
      });
      
      return NextResponse.json(defaultSettings);
    }

    return NextResponse.json(userSettings);
  } catch (error) {
    console.error('Error fetching user settings:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Get the session
    const session = await getServerSession(authOptions);

    // Check if user is authenticated
    if (!session || !session.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user ID from session
    const userId = session.user.id;

    // Parse request body
    const body = await request.json();
    
    // Validate input
    const validThemes = ['light', 'dark', 'system'];
    const validCurrencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD'];
    const validTimeFormats = ['12h', '24h'];
    const validDateFormats = ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'];
    const validLanguages = ['en', 'es', 'fr', 'de', 'zh', 'ja'];
    const validDashboardLayouts = ['default', 'compact', 'expanded'];
    
    const settings = {
      theme: validThemes.includes(body.theme) ? body.theme : 'system',
      currency: validCurrencies.includes(body.currency) ? body.currency : 'USD',
      notificationsEnabled: Boolean(body.notificationsEnabled),
      timeFormat: validTimeFormats.includes(body.timeFormat) ? body.timeFormat : '12h',
      dateFormat: validDateFormats.includes(body.dateFormat) ? body.dateFormat : 'MM/DD/YYYY',
      language: validLanguages.includes(body.language) ? body.language : 'en',
      dashboardLayout: validDashboardLayouts.includes(body.dashboardLayout) ? body.dashboardLayout : 'default',
    };

    // Update user settings
    const updatedSettings = await userService.updateUserSettings(userId, settings);

    return NextResponse.json(updatedSettings);
  } catch (error) {
    console.error('Error updating user settings:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}