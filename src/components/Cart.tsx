import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import { removeMeal, syncCartWithServer, CartMeal } from "../store/mealSlice";
import { useAppDispatch } from "../hooks/useAppDispatch";
import ConfirmedOrderPane from "./ConfirmedOrderPane";

const Cart: React.FC = () => {
  const dispatch = useAppDispatch();
  const { items } = useSelector((state: RootState) => state.meal);
  const [confirmedOrder, setConfirmedOrder] = useState<CartMeal[]>([]);
  const [showConfirmedPane, setShowConfirmedPane] = useState(false);

  useEffect(() => {
    const savedOrder = localStorage.getItem('confirmed_order');
    if (savedOrder) {
      const parsedOrder = JSON.parse(savedOrder);
      setConfirmedOrder(parsedOrder);
      setShowConfirmedPane(true);
    } else {
      setShowConfirmedPane(false);
    }
  }, [items]); // Re-run when items change (cart updates)

  // Sync active cart with server whenever items change
  useEffect(() => {
    if (items.length > 0) {
      dispatch(syncCartWithServer(items));
    }
  }, [items, dispatch]);

  // Show confirmed order pane if it's active
  if (showConfirmedPane && confirmedOrder.length > 0) {
    return <ConfirmedOrderPane order={confirmedOrder} />;
  }

  // Show cart UI if there's no confirmed order
  if (!showConfirmedPane) {
    return (
      <div className="h-full flex flex-col p-4">
        <h2 className="text-xl font-semibold mb-4">Your Cart</h2>
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <p className="text-gray-500">No meals in your cart</p>
          ) : (
            <>
              <p className="text-sm text-gray-600 mb-2">
                Your order is automatically saved locally and synced with the server
              </p>
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
            </>
          )}
        </div>
      </div>
    );
  }

  // If there's both a confirmed order and active items, we're in edit mode
  return (
    <div className="h-full flex flex-col p-4">
      <h2 className="text-xl font-semibold mb-4">Edit Your Order</h2>
      <div className="flex-1 overflow-y-auto">
        <p className="text-sm text-gray-600 mb-2">
          Make your changes and confirm to update your order
        </p>
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
      </div>
    </div>
  );
};

export default Cart;
