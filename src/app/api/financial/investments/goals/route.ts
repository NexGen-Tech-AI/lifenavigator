import { NextResponse } from 'next/server';

// GET /api/financial/investments/goals - Return financial goals
export async function GET() {
  const goals = [
    {
      id: '1',
      name: 'Retirement',
      targetAmount: 2000000,
      currentAmount: 487250,
      targetDate: '2055-01-01',
      priority: 'High',
      progress: 24.4,
      monthlyContribution: 2500,
      category: 'retirement',
      status: 'on_track',
      requiredMonthlyContribution: 2350,
      projectedShortfall: 0
    },
    {
      id: '2',
      name: 'House Down Payment',
      targetAmount: 100000,
      currentAmount: 35000,
      targetDate: '2027-06-01',
      priority: 'Medium',
      progress: 35.0,
      monthlyContribution: 1500,
      category: 'major_purchase',
      status: 'at_risk',
      requiredMonthlyContribution: 1750,
      projectedShortfall: 8500
    },
    {
      id: '3',
      name: 'Emergency Fund',
      targetAmount: 50000,
      currentAmount: 15420,
      targetDate: '2025-12-01',
      priority: 'High',
      progress: 30.8,
      monthlyContribution: 800,
      category: 'emergency',
      status: 'behind',
      requiredMonthlyContribution: 1200,
      projectedShortfall: 12000
    },
    {
      id: '4',
      name: 'Children\'s Education',
      targetAmount: 150000,
      currentAmount: 25000,
      targetDate: '2035-09-01',
      priority: 'Medium',
      progress: 16.7,
      monthlyContribution: 500,
      category: 'education',
      status: 'on_track',
      requiredMonthlyContribution: 480,
      projectedShortfall: 0
    }
  ];

  return NextResponse.json(goals);
}

// POST /api/financial/investments/goals - Create a new goal
export async function POST(request: Request) {
  const body = await request.json();
  
  // In a real app, validate and save to database
  const newGoal = {
    id: Date.now().toString(),
    ...body,
    currentAmount: 0,
    progress: 0,
    status: 'new',
    createdAt: new Date().toISOString()
  };

  return NextResponse.json(newGoal, { status: 201 });
}

// PUT /api/financial/investments/goals/[id] - Update a goal
export async function PUT(request: Request) {
  const body = await request.json();
  const { id, ...updates } = body;

  // In a real app, update in database
  const updatedGoal = {
    id,
    ...updates,
    updatedAt: new Date().toISOString()
  };

  return NextResponse.json(updatedGoal);
}

// DELETE /api/financial/investments/goals/[id] - Delete a goal
export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  // In a real app, delete from database
  return NextResponse.json({ success: true, deletedId: id });
}