import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { removeMeal, setItems, resetOrder, CartMeal } from "../store/mealSlice";
import { removeEconomyMeal, setEconomyItems, resetEconomyOrder } from "../store/economyMealSlice";
import { useTheme } from "@mui/material/styles";
import { RootState } from "../store";
import { useParams } from "react-router-dom";
import ConfirmedOrder from "./ConfirmedOrder";
import OrderSummaryDialog from "./OrderSummaryDialog";
import { Snackbar, Alert } from "@mui/material";

const Cart: React.FC = () => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const { seatClass } = useParams();
  const isEconomy = seatClass === "economy";

  // Initialize states from localStorage
  const [isOrderConfirmed, setIsOrderConfirmed] = useState(() => {
    const saved = localStorage.getItem(`isOrderConfirmed-${seatClass}`);
    return saved ? JSON.parse(saved) : false;
  });
  const [isEditing, setIsEditing] = useState(() => {
    const wasEditing = localStorage.getItem(`isEditing-${seatClass}`);
    return wasEditing === 'true';
  });
  const [tempItems, setTempItems] = useState<CartMeal[]>(() => {
    const saved = localStorage.getItem(`tempItems-${seatClass}`);
    return saved ? JSON.parse(saved) : [];
  });
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [key, setKey] = useState(0);

  // On mount/refresh, load confirmed items
  useEffect(() => {
    const confirmedItems = localStorage.getItem(`cartItems-${seatClass}`);
    if (confirmedItems) {
      const parsedItems = JSON.parse(confirmedItems);
      if (isEconomy) {
        dispatch(setEconomyItems(parsedItems));
      } else {
        dispatch(setItems(parsedItems));
      }
    }
  }, [dispatch, isEconomy, seatClass]);

  // Update localStorage when order confirmation status changes
  useEffect(() => {
    if (!isEditing) {
      localStorage.setItem(`isOrderConfirmed-${seatClass}`, JSON.stringify(isOrderConfirmed));
    }
  }, [isOrderConfirmed, isEditing, seatClass]);

  // Pass state changes to parent
  useEffect(() => {
    const event = new CustomEvent('orderStateChange', { 
      detail: { 
        isOrderConfirmed,
        isEditing 
      } 
    });
    window.dispatchEvent(event);
  }, [isOrderConfirmed, isEditing]);

  const { items } = useSelector((state: RootState) => 
    isEconomy ? state.economyMeal : state.businessMeal
  );

  // Save items to localStorage only when explicitly confirmed
  useEffect(() => {
    if (!isEditing && isOrderConfirmed) {
      localStorage.setItem(`cartItems-${seatClass}`, JSON.stringify(items));
    }
  }, [isEditing, isOrderConfirmed, items, seatClass]);

  // Save the current items when starting edit mode
  const handleEditStart = () => {
    const currentItems = [...items];
    setTempItems(currentItems);
    setIsEditing(true);
    localStorage.setItem(`isEditing-${seatClass}`, 'true');
    localStorage.setItem(`tempItems-${seatClass}`, JSON.stringify(currentItems));
  };

  // Restore the original items when cancelling edit mode
  const handleEditComplete = () => {
    if (isEconomy) {
      dispatch(setEconomyItems(tempItems));
    } else {
      dispatch(setItems(tempItems));
    }
    setIsEditing(false);
    localStorage.setItem(`isEditing-${seatClass}`, 'false');
    localStorage.removeItem(`tempItems-${seatClass}`);
  };

  // Handle successful order confirmation
  const handleOrderConfirmation = () => {
    setIsOrderConfirmed(true);
    setIsEditing(false);
    localStorage.setItem(`isEditing-${seatClass}`, 'false');
    localStorage.removeItem(`tempItems-${seatClass}`);
    setTempItems([]);
    setSnackbarOpen(true);
    setKey(prev => prev + 1);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <>
      {isOrderConfirmed ? (
        <div className="h-full mt-12">
          <ConfirmedOrder 
            key={key} 
            onEditOrder={handleEditStart}
            onEditComplete={handleEditComplete}
            onOrderSuccess={handleOrderConfirmation}
            isEditing={isEditing}
          />
        </div>
      ) : (
        <div className="h-full flex flex-col p-4 mt-12">
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
                      className="px-3 py-1 rounded-full hover:bg-opacity-10 active:bg-opacity-20 touch-manipulation"
                      style={{
                        color: theme.palette.primary.main,
                      }}
                      onClick={() => dispatch(isEconomy ? removeEconomyMeal(item.name) : removeMeal(item.name))}
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {items.length > 0 && (
            <div className="sticky bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 mt-4">
              <div className="flex gap-2">
                {!isOrderConfirmed && !isEditing && (
                  <button 
                    className="flex-1 px-4 py-2 text-gray-600 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
                    onClick={() => dispatch(isEconomy ? resetEconomyOrder() : resetOrder())}
                  >
                    Reset
                  </button>
                )}
                <div className={!isOrderConfirmed && !isEditing ? "flex-1" : "w-full"}>
                  <OrderSummaryDialog onOrderSuccess={handleOrderConfirmation} />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity="success"
          variant="filled"
          sx={{ width: "100%" }}
        >
          Your order has been placed successfully! 🎉
        </Alert>
      </Snackbar>
    </>
  );
};

export default Cart;
