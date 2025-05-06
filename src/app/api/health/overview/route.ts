import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import { healthService } from '@/lib/services/healthService';

// Get health overview for current user
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