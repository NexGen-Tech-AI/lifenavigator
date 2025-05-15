'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/cards/Card';
import { Button } from '@/components/ui/buttons/Button';

// Mock data for activity tracking
const mockActivityData = {
  today: {
    steps: 8250,
    stepGoal: 10000,
    activeMinutes: 45,
    activeMinutesGoal: 60,
    distance: 6.7,
    caloriesBurned: 420,
    floors: 12
  },
  weeklySteps: [9200, 10500, 8100, 7400, 9800, 5200, 8250],
  weeklyActiveMinutes: [55, 62, 38, 45, 58, 30, 45],
  weeklyDistance: [7.2, 8.5, 6.5, 5.8, 7.9, 4.1, 6.7],
  weeklyCalories: [480, 520, 400, 380, 490, 310, 420],
  weeklyFloors: [14, 16, 10, 9, 15, 8, 12]
};

// Activity goals
const activityGoals = {
  dailyStepGoal: 10000,
  weeklyStepGoal: 70000,
  dailyActiveMinutesGoal: 60,
  weeklyActiveMinutesGoal: 420
};

export default function ActivityTracker() {
  const [data, setData] = useState(mockActivityData);
  const [goals, setGoals] = useState(activityGoals);
  
  // Calculate weekly totals
  const weeklyStepsTotal = data.weeklySteps.reduce((sum, steps) => sum + steps, 0);
  const weeklyActiveMinutesTotal = data.weeklyActiveMinutes.reduce((sum, minutes) => sum + minutes, 0);
  
  // Calculate percentages for progress bars
  const stepsPercentage = Math.min(100, (data.today.steps / goals.dailyStepGoal) * 100);
  const weeklyStepsPercentage = Math.min(100, (weeklyStepsTotal / goals.weeklyStepGoal) * 100);
  const activeMinutesPercentage = Math.min(100, (data.today.activeMinutes / goals.dailyActiveMinutesGoal) * 100);
  const weeklyActiveMinutesPercentage = Math.min(100, (weeklyActiveMinutesTotal / goals.weeklyActiveMinutesGoal) * 100);

  return (
    <div>
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Activity Tracker</h2>
        
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="text-lg font-medium mb-2">Today's Activity</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Steps</span>
                  <span>{data.today.steps} / {goals.dailyStepGoal}</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    style={{ width: `${stepsPercentage}%` }} 
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Active Minutes</span>
                  <span>{data.today.activeMinutes} / {goals.dailyActiveMinutesGoal}</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    style={{ width: `${activeMinutesPercentage}%` }} 
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500"
                  ></div>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-gray-100 p-3 rounded-lg">
                  <p className="text-gray-600 text-xs">Distance</p>
                  <p className="text-lg font-semibold">{data.today.distance} km</p>
                </div>
                <div className="bg-gray-100 p-3 rounded-lg">
                  <p className="text-gray-600 text-xs">Calories</p>
                  <p className="text-lg font-semibold">{data.today.caloriesBurned}</p>
                </div>
                <div className="bg-gray-100 p-3 rounded-lg">
                  <p className="text-gray-600 text-xs">Floors</p>
                  <p className="text-lg font-semibold">{data.today.floors}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-2">Weekly Progress</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Weekly Steps</span>
                  <span>{weeklyStepsTotal} / {goals.weeklyStepGoal}</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    style={{ width: `${weeklyStepsPercentage}%` }} 
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Weekly Active Minutes</span>
                  <span>{weeklyActiveMinutesTotal} / {goals.weeklyActiveMinutesGoal}</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    style={{ width: `${weeklyActiveMinutesPercentage}%` }} 
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-purple-500"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-4 flex justify-end">
          <Button variant="outline">Adjust Goals</Button>
        </div>
      </Card>
    </div>
  );
}