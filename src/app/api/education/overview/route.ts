import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import { educationService } from '@/lib/services/educationService';

// Get education overview for current user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    
    // Get education data
    const educationRecord = await educationService.getEducationRecord(userId);
    
    if (!educationRecord) {
      return NextResponse.json(
        { message: 'No education record found' },
        { status: 404 }
      );
    }
    
    // Prepare response data
    const courses = educationRecord.courses || [];
    const certifications = educationRecord.certifications || [];
    
    // Calculate some stats
    const activeCourses = courses.filter(course => course.status === 'in_progress');
    const completedCourses = courses.filter(course => course.status === 'completed');
    
    const validCertifications = certifications.filter(cert => {
      if (!cert.expirationDate) return true;
      return new Date(cert.expirationDate) >= new Date();
    });
    
    const expiringCertifications = certifications.filter(cert => {
      if (!cert.expirationDate) return false;
      const expiryDate = new Date(cert.expirationDate);
      const threeMonthsFromNow = new Date();
      threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);
      
      return expiryDate <= threeMonthsFromNow && expiryDate >= new Date();
    });
    
    return NextResponse.json({
      educationRecord,
      stats: {
        totalCourses: courses.length,
        activeCourses: activeCourses.length,
        completedCourses: completedCourses.length,
        validCertifications: validCertifications.length,
        expiringCertifications: expiringCertifications.length,
      },
      activeCourses,
      validCertifications,
      expiringCertifications,
    });
  } catch (error) {
    console.error('Error fetching education overview:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching education data' },
      { status: 500 }
    );
  }
}