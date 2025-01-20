import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import { addMeal, removeMeal } from "../store/mealSlice";
import { useAppDispatch } from "../hooks/useAppDispatch";

const Cart: React.FC = () => {
  const dispatch = useAppDispatch();
  const { items, confirmedOrder } = useSelector((state: RootState) => state.meal);

  useEffect(() => {
    // If we have a confirmed order in localStorage but not in state, restore it
    if (confirmedOrder.length === 0) {
      try {
        const backup = localStorage.getItem('meal_cart');
        if (backup) {
          const items = JSON.parse(backup);
          if (Array.isArray(items) && items.length > 0) {
            items.forEach(item => {
              dispatch(addMeal(item));
            });
          }
        }
      } catch (error) {
        console.warn('Failed to restore from localStorage:', error);
      }
    }
  }, [confirmedOrder.length, dispatch]);

  const handleEdit = () => {
    if (confirmedOrder && confirmedOrder.length > 0) {
      // Move confirmed items back to cart
      confirmedOrder.forEach(item => {
        dispatch(addMeal(item));
      });
    }
  };

  // Show confirmed order if it exists
  if (confirmedOrder && confirmedOrder.length > 0) {
    return (
      <div className="h-full flex flex-col p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Your Confirmed Order</h2>
          <button
            className="px-4 py-2 text-[#EA2328] rounded-lg hover:bg-red-50 active:bg-red-100 touch-manipulation border border-[#EA2328]"
            onClick={handleEdit}
          >
            Edit Order
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          <ul className="space-y-3">
            {confirmedOrder.map((item, index) => (
              <li
                key={index}
                className="p-3 bg-gray-50 rounded-lg shadow-sm"
              >
                <p className="font-medium text-gray-800">{item.name}</p>
                <p className="text-sm text-gray-500">{item.category}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  // Show cart UI if no confirmed order
  return (
    <div className="h-full flex flex-col p-4">
      <h2 className="text-xl font-semibold mb-4">Your Cart</h2>
      <div className="flex-1 overflow-y-auto">
        {items.length === 0 ? (
          <p className="text-gray-500">No meals in your cart</p>
        ) : (
          <>
            <p className="text-sm text-gray-600 mb-2">
              Your order is automatically synced with the server
            </p>
            <ul className="space-y-3">
              {items.map((item, index) => (
                <li
                  key={index}
                  className="flex justify-between items-center p-3 bg-gray-50 rounded-lg shadow-sm"
                >
                  <div>
                <p className="font-medium text-gray-800">{item.name}</p>
                <p className="text-sm text-gray-500">{item.category}</p>
                  </div>
                  <button
                    className="px-3 py-1 text-red-600 rounded-full hover:bg-red-50 active:bg-red-100 touch-manipulation"
                    onClick={() => dispatch(removeMeal(item.name))}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
};

export default Cart;
