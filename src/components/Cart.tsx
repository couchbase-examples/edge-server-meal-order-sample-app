import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { removeMeal, setItems } from "../store/mealSlice";
import { removeEconomyMeal, setEconomyItems } from "../store/economyMealSlice";
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
  const [isOrderConfirmed, setIsOrderConfirmed] = useState(() => {
    const saved = localStorage.getItem(`isOrderConfirmed-${seatClass}`);
    return saved ? JSON.parse(saved) : false;
  });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    // Pass both order confirmation and edit mode state to parent
    const event = new CustomEvent('orderStateChange', { 
      detail: { 
        isOrderConfirmed,
        isEditing 
      } 
    });
    window.dispatchEvent(event);
  }, [isOrderConfirmed, isEditing]);

  const handleEditStart = () => {
    setIsEditing(true);
  };

  const handleEditComplete = () => {
    setIsEditing(false);
  };

  useEffect(() => {
    localStorage.setItem(`isOrderConfirmed-${seatClass}`, JSON.stringify(isOrderConfirmed));
  }, [isOrderConfirmed, seatClass]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  // Load saved items from localStorage
  useEffect(() => {
    const savedItems = localStorage.getItem(`cartItems-${seatClass}`);
    if (savedItems) {
      const parsedItems = JSON.parse(savedItems);
      if (isEconomy) {
        dispatch(setEconomyItems(parsedItems));
      } else {
        dispatch(setItems(parsedItems));
      }
    }
  }, [dispatch, isEconomy, seatClass]);

  const { items } = useSelector((state: RootState) => 
    isEconomy ? state.economyMeal : state.businessMeal
  );

  // Save items to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(`cartItems-${seatClass}`, JSON.stringify(items));
  }, [items, seatClass]);

  const handleOrderSuccess = () => {
    setIsOrderConfirmed(true);
    setSnackbarOpen(true);
    // Reset edit mode in ConfirmedOrder by remounting it
    setKey(prev => prev + 1);
  };

  const [key, setKey] = useState(0);

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <>
      {!isOrderConfirmed ? (
        <div className="h-full flex flex-col p-4 mt-12">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Your Cart</h2>
            {items.length > 0 && (
              <OrderSummaryDialog onOrderSuccess={handleOrderSuccess} />
            )}
          </div>
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
        </div>
      ) : (
        <div className="h-full mt-12">
          <ConfirmedOrder 
            key={key} 
            onEditOrder={handleEditStart}
            onEditComplete={handleEditComplete}
            isEditing={isEditing}
          />
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
