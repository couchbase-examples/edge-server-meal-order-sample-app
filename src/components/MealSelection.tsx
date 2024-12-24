import React from 'react';
import { useDispatch } from 'react-redux';
import { addMeal } from '../store/mealSlice';

const MealSelection: React.FC = () => {
  const dispatch = useDispatch();

  const handleAddMeal = (mealName: string, mealPrice: number) => {
    dispatch(addMeal({ name: mealName, price: mealPrice, quantity: 1 }));
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-2">Select a Meal</h2>

      <div className="flex items-center justify-between p-4 border rounded">
        <div>
          <p className="font-medium">Standard Meal</p>
          <p className="text-sm text-gray-500">\$10</p>
        </div>
        <button
          className="bg-cb-red text-white px-4 py-2 rounded"
          onClick={() => handleAddMeal('Standard Meal', 10)}
        >
          Add
        </button>
      </div>

      <div className="flex items-center justify-between p-4 border rounded">
        <div>
          <p className="font-medium">Vegetarian Meal</p>
          <p className="text-sm text-gray-500">\$12</p>
        </div>
        <button
          className="bg-cb-red text-white px-4 py-2 rounded"
          onClick={() => handleAddMeal('Vegetarian Meal', 12)}
        >
          Add
        </button>
      </div>

      <div className="flex items-center justify-between p-4 border rounded">
        <div>
          <p className="font-medium">Kosher Meal</p>
          <p className="text-sm text-gray-500">\$13</p>
        </div>
        <button
          className="bg-cb-red text-white px-4 py-2 rounded"
          onClick={() => handleAddMeal('Kosher Meal', 13)}
        >
          Add
        </button>
      </div>

      {/* Add more options as needed */}
    </div>
  );
};

export default MealSelection;