import React from "react";
import { useAppDispatch } from "../hooks/useAppDispatch";
import { CartMeal, addMeal } from "../store/mealSlice";

interface ConfirmedOrderPaneProps {
  order: CartMeal[];
}

const ConfirmedOrderPane: React.FC<ConfirmedOrderPaneProps> = ({ order }) => {
  const dispatch = useAppDispatch();

  const handleEdit = (item: CartMeal) => {
    // Add item back to cart for editing
    dispatch(addMeal(item));
  };

  return (
    <div className="h-full flex flex-col p-4">
      <h2 className="text-xl font-semibold mb-4">Your Confirmed Order</h2>
      <div className="flex-1 overflow-y-auto">
        <p className="text-sm text-gray-600 mb-4">
          You can edit your order by clicking the Edit button
        </p>
        <ul className="space-y-3">
          {order.map((item, index) => (
            <li
              key={index}
              className="flex justify-between items-center p-3 bg-gray-50 rounded-lg shadow-sm"
            >
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-gray-500">{item.category}</p>
              </div>
              <button
                className="px-3 py-1 text-blue-600 rounded-full hover:bg-blue-50 active:bg-blue-100 touch-manipulation"
                onClick={() => handleEdit(item)}
              >
                Edit
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ConfirmedOrderPane;
