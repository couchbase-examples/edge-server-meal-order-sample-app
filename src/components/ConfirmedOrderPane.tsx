import React from "react";
import { useAppDispatch } from "../hooks/useAppDispatch";
import { CartMeal, addMeal } from "../store/mealSlice";

interface ConfirmedOrderPaneProps {
  order: CartMeal[];
}

const ConfirmedOrderPane: React.FC<ConfirmedOrderPaneProps> = ({ order }) => {
  const dispatch = useAppDispatch();

  const handleEditOrder = () => {
    // Move confirmed order back to cart for editing
    order.forEach(item => {
      dispatch(addMeal(item));
    });
  };

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-auto">
      <div className="max-w-4xl mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Your Confirmed Order</h2>
          <button
            className="px-4 py-2 text-blue-600 rounded-lg hover:bg-blue-50 active:bg-blue-100 touch-manipulation border border-blue-600"
            onClick={handleEditOrder}
          >
            Edit Order
          </button>
        </div>
        <div className="space-y-4">
          {order.map((item, index) => (
            <div
              key={index}
              className="p-4 bg-gray-50 rounded-lg shadow-sm"
            >
              <p className="font-medium text-lg">{item.name}</p>
              <p className="text-gray-600">{item.category}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ConfirmedOrderPane;
