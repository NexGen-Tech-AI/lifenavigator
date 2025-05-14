import { NextRequest, NextResponse } from 'next/server';
import { healthService } from '@/lib/services/healthService';
import { createSecureHandlers } from '@/lib/auth/route-helpers';

// Handler for GET request - get health overview for current user
async function getHandler(request: NextRequest) {
  try {
    // User is guaranteed to be available by withAuth middleware
    const userId = (request as any).user.id;
    
    // Get health data
    const healthRecord = await healthService.getHealthRecord(userId);
    
    if (!healthRecord) {
      return NextResponse.json(
        { message: 'No health record found' },
        { status: 404 }
      );
    }
    
    // Prepare response data
    const vitalSigns = healthRecord.vitalSigns || [];
    const appointments = healthRecord.appointments || [];
    
    // Get most recent vitals
    const latestBloodPressure = vitalSigns
      .filter(vs => vs.type === 'blood_pressure')
      .sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime())[0];
      
    const latestHeartRate = vitalSigns
      .filter(vs => vs.type === 'heart_rate')
      .sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime())[0];
      
    const latestWeight = vitalSigns
      .filter(vs => vs.type === 'weight')
      .sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime())[0];
    
    // Get upcoming appointments
    const upcomingAppointments = appointments
      .filter(appt => new Date(appt.date) >= new Date() && !appt.completed)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    // Calculate BMI if height and weight are available
    let bmi = null;
    if (healthRecord.height && healthRecord.weight) {
      // BMI = weight(kg) / height(m)^2
      const heightInMeters = healthRecord.height / 100;
      bmi = healthRecord.weight / (heightInMeters * heightInMeters);
      bmi = Math.round(bmi * 10) / 10; // Round to 1 decimal place
    }
    
    // Log PHI access for compliance
    await logPhiAccess(userId, 'health_overview', request);
    
    return NextResponse.json({
      healthRecord: {
        id: healthRecord.id,
        height: healthRecord.height,
        weight: healthRecord.weight,
        bloodType: healthRecord.bloodType,
        allergies: healthRecord.allergies,
        medications: healthRecord.medications,
      },
      stats: {
        bmi,
        bmiCategory: getBmiCategory(bmi),
        latestVitals: {
          bloodPressure: latestBloodPressure,
          heartRate: latestHeartRate,
          weight: latestWeight,
        },
        upcomingAppointmentsCount: upcomingAppointments.length,
      },
      upcomingAppointments: upcomingAppointments.slice(0, 5),
    });
  } catch (error) {
    console.error('Error fetching health overview:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching health data' },
      { status: 500 }
    );
  }
}

// Helper function to categorize BMI
function getBmiCategory(bmi: number | null): string | null {
  if (bmi === null) return null;
  
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal weight';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
}

// Helper function to log PHI access for HIPAA compliance
async function logPhiAccess(userId: string, dataType: string, request: NextRequest) {
  try {
    // This would integrate with your compliance logging system
    // For now, we'll log to console as a placeholder
    console.log(`PHI ACCESS: User ${userId} accessed ${dataType} data from ${request.ip || 'unknown IP'}`);
    
    // In a real implementation, this would:
    // 1. Write to a secure audit log
    // 2. Include full request details
    // 3. Handle HIPAA-required metadata
  } catch (error) {
    // Log error but don't fail the main request
    console.error('Error logging PHI access:', error);
  }
}

// Create secure route handlers with additional protection for health data
export const { GET } = createSecureHandlers(
  { GET: getHandler },
  { 
    requireSetupComplete: true,
    // Additional permissions could be added here for healthcare data
    // For example: requiredPermissions: ['health.read']
  }
);