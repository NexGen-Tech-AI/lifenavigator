'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/cards/Card';
import { Button } from '@/components/ui/buttons/Button';
import { Input } from '@/components/ui/forms/Input';

// Mock data for nutrition tracking
const mockNutritionData = {
  dailyGoals: {
    calories: 2100,
    protein: 120,
    carbs: 230,
    fat: 70
  },
  meals: [
    {
      id: '1',
      name: 'Breakfast',
      time: '07:30',
      foods: [
        { name: 'Oatmeal', calories: 150, protein: 5, carbs: 27, fat: 3 },
        { name: 'Banana', calories: 105, protein: 1, carbs: 27, fat: 0 },
        { name: 'Almond Milk', calories: 30, protein: 1, carbs: 1, fat: 2 }
      ]
    },
    {
      id: '2',
      name: 'Lunch',
      time: '12:30',
      foods: [
        { name: 'Chicken Salad', calories: 350, protein: 30, carbs: 10, fat: 20 },
        { name: 'Whole Grain Bread', calories: 120, protein: 4, carbs: 20, fat: 2 },
        { name: 'Apple', calories: 95, protein: 0, carbs: 25, fat: 0 }
      ]
    },
    {
      id: '3',
      name: 'Dinner',
      time: '18:45',
      foods: [
        { name: 'Salmon', calories: 280, protein: 39, carbs: 0, fat: 13 },
        { name: 'Brown Rice', calories: 215, protein: 5, carbs: 45, fat: 2 },
        { name: 'Steamed Broccoli', calories: 55, protein: 4, carbs: 11, fat: 0 }
      ]
    },
    {
      id: '4',
      name: 'Snack',
      time: '15:30',
      foods: [
        { name: 'Greek Yogurt', calories: 130, protein: 12, carbs: 8, fat: 4 },
        { name: 'Mixed Berries', calories: 85, protein: 1, carbs: 21, fat: 0 }
      ]
    }
  ]
};

// Calculate daily totals
const calculateDailyTotals = (meals) => {
  return meals.reduce((totals, meal) => {
    const mealTotals = meal.foods.reduce((mealAcc, food) => {
      return {
        calories: mealAcc.calories + food.calories,
        protein: mealAcc.protein + food.protein,
        carbs: mealAcc.carbs + food.carbs,
        fat: mealAcc.fat + food.fat
      };
    }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
    
    return {
      calories: totals.calories + mealTotals.calories,
      protein: totals.protein + mealTotals.protein,
      carbs: totals.carbs + mealTotals.carbs,
      fat: totals.fat + mealTotals.fat
    };
  }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
};

export default function NutritionLog() {
  const [data, setData] = useState(mockNutritionData);
  const [newFood, setNewFood] = useState({ name: '', calories: '', protein: '', carbs: '', fat: '' });
  const [selectedMealId, setSelectedMealId] = useState('');
  
  const dailyTotals = calculateDailyTotals(data.meals);
  
  // Calculate percentages for nutrient progress bars
  const caloriesPercentage = Math.min(100, (dailyTotals.calories / data.dailyGoals.calories) * 100);
  const proteinPercentage = Math.min(100, (dailyTotals.protein / data.dailyGoals.protein) * 100);
  const carbsPercentage = Math.min(100, (dailyTotals.carbs / data.dailyGoals.carbs) * 100);
  const fatPercentage = Math.min(100, (dailyTotals.fat / data.dailyGoals.fat) * 100);
  
  // Handler for adding a new food item (not fully implemented)
  const handleAddFood = () => {
    // This would add a new food to the selected meal
    console.log('Adding food to meal:', selectedMealId);
  };

  return (
    <div>
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Nutrition Log</h2>
        
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-3">Today's Meals</h3>
          
          {data.meals.map((meal) => (
            <div key={meal.id} className="mb-4 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium">{meal.name} <span className="text-gray-500 text-sm">({meal.time})</span></h4>
                <Button variant="text" size="sm">
                  Add Food
                </Button>
              </div>
              
              <table className="w-full text-sm">
                <thead className="text-gray-500 border-b">
                  <tr>
                    <th className="text-left pb-2 font-normal">Food</th>
                    <th className="text-right pb-2 font-normal">Calories</th>
                    <th className="text-right pb-2 font-normal">Protein</th>
                    <th className="text-right pb-2 font-normal">Carbs</th>
                    <th className="text-right pb-2 font-normal">Fat</th>
                  </tr>
                </thead>
                <tbody>
                  {meal.foods.map((food, index) => (
                    <tr key={index} className="border-b border-gray-100 dark:border-gray-700">
                      <td className="py-2">{food.name}</td>
                      <td className="text-right py-2">{food.calories}</td>
                      <td className="text-right py-2">{food.protein}g</td>
                      <td className="text-right py-2">{food.carbs}g</td>
                      <td className="text-right py-2">{food.fat}g</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
          
          <div className="mt-4 flex justify-end">
            <Button variant="outline">Record New Meal</Button>
          </div>
        </div>
        
        <div className="mt-8">
          <h3 className="text-lg font-medium mb-4">Daily Nutrition Summary</h3>
          
          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Calories</span>
                    <span>{dailyTotals.calories} / {data.dailyGoals.calories} kcal</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      style={{ width: `${caloriesPercentage}%` }} 
                      className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-orange-500"
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Protein</span>
                    <span>{dailyTotals.protein} / {data.dailyGoals.protein}g</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      style={{ width: `${proteinPercentage}%` }} 
                      className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Carbs</span>
                    <span>{dailyTotals.carbs} / {data.dailyGoals.carbs}g</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      style={{ width: `${carbsPercentage}%` }} 
                      className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500"
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Fat</span>
                    <span>{dailyTotals.fat} / {data.dailyGoals.fat}g</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      style={{ width: `${fatPercentage}%` }} 
                      className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-yellow-500"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 grid grid-cols-4 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-center">
              <p className="text-blue-800 dark:text-blue-200 text-xs">Daily Calorie Goal</p>
              <p className="text-lg font-medium">{mockNutritionData.dailyGoals.calories} kcal</p>
            </div>
            
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 text-center">
              <p className="text-green-800 dark:text-green-200 text-xs">Protein Goal</p>
              <p className="text-lg font-medium">{mockNutritionData.dailyGoals.protein}g</p>
            </div>
            
            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3 text-center">
              <p className="text-yellow-800 dark:text-yellow-200 text-xs">Carbs Goal</p>
              <p className="text-lg font-medium">{mockNutritionData.dailyGoals.carbs}g</p>
            </div>
            
            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3 text-center">
              <p className="text-orange-800 dark:text-orange-200 text-xs">Fat Goal</p>
              <p className="text-lg font-medium">{mockNutritionData.dailyGoals.fat}g</p>
            </div>
          </div>
        
          <div className="mt-4 text-sm">
            <p className="text-gray-500">These goals are based on your profile information and activity level.</p>
          </div>
        </div>
      </Card>
    </div>
  );
}