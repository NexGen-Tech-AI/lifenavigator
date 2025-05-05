// app/api/integrations/services/[id]/route.ts
import { NextResponse } from 'next/server';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const serviceId = params.id;
    
    if (!serviceId) {
      return NextResponse.json({ error: 'Service ID is required' }, { status: 400 });
    }
    
    // In a real app, delete the service from the database
    // For now, we'll just return success
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error disconnecting service:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}