import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../store/store";
import { removeMeal } from "../store/mealSlice";

const Cart: React.FC = () => {
  const dispatch = useDispatch();
  const { items } = useSelector((state: RootState) => state.meal);

  return (
    <div className="h-full flex flex-col p-4 mt-10">
      <h2 className="text-xl font-semibold mb-4">Your Cart</h2>
      <div className="flex-1 overflow-y-auto">
        {items.length === 0 ? (
          <p className="text-gray-500">No meals in your cart</p>
        ) : (
          <ul className="space-y-3">
            {items.map((item, index) => (
              <li
                key={index}
                className="flex justify-between items-center p-3 bg-gray-50 rounded-lg shadow-sm"
              >
                <div>
                  <p className="font-medium">{item.name}</p>
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
        )}
      </div>
    </div>
  );
};

export default Cart;
