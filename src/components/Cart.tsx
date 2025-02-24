import { Alert, Snackbar } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { RootState } from "../store";
import { removeEconomyMeal, resetEconomyOrder, setEconomyItems } from "../store/economyMealSlice";
import { removeBusinessMeal, resetBusinessOrder, setBusinessItems } from "../store/businessMealSlice";
import { toSentenceCase } from "../utils/formatText";
import ConfirmedOrder from "./ConfirmedOrder";
import OrderSummaryDialog from "./OrderSummaryDialog";
import { CartMeal } from "../types";

interface CartProps {
  isMobile?: boolean;
}

const Cart: React.FC<CartProps> = ({ isMobile = false }) => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const { seatClass } = useParams();
  const isEconomy = seatClass === "economy";
  const [isCartExpanded, setIsCartExpanded] = useState(false);

  // Initialize states from localStorage
  const [isOrderConfirmed, setIsOrderConfirmed] = useState(() => {
    const saved = localStorage.getItem(`cbmd:isOrderConfirmed-${seatClass}`);
    return saved ? JSON.parse(saved) : false;
  });
  const [isEditing, setIsEditing] = useState(() => {
    const wasEditing = localStorage.getItem(`cbmd:isEditing-${seatClass}`);
    return wasEditing === 'true';
  });
  const [tempItems, setTempItems] = useState<CartMeal[]>(() => {
    const saved = localStorage.getItem(`cbmd:tempItems-${seatClass}`);
    return saved ? JSON.parse(saved) : [];
  });
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [orderKey, setOrderKey] = useState(0);

  // On mount/refresh, load confirmed items
  useEffect(() => {
    const confirmedItems = localStorage.getItem(`cbmd:cartItems-${seatClass}`);
    if (confirmedItems) {
      const parsedItems = JSON.parse(confirmedItems);
      if (isEconomy) {
        dispatch(setEconomyItems(parsedItems));
      } else {
        dispatch(setBusinessItems(parsedItems));
      }
    }
  }, [dispatch, isEconomy, seatClass]);

  // Update localStorage when order confirmation status changes
  useEffect(() => {
    if (!isEditing) {
      localStorage.setItem(`cbmd:isOrderConfirmed-${seatClass}`, JSON.stringify(isOrderConfirmed));
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
      localStorage.setItem(`cbmd:cartItems-${seatClass}`, JSON.stringify(items));
    }
  }, [isEditing, isOrderConfirmed, items, seatClass]);

  // Save the current items when starting edit mode
  const startEditing = () => {
    const currentItems = [...items];
    setTempItems(currentItems);
    setIsEditing(true);
    localStorage.setItem(`cbmd:isEditing-${seatClass}`, 'true');
    localStorage.setItem(`cbmd:tempItems-${seatClass}`, JSON.stringify(currentItems));
  };

  // Restore the original items when cancelling edit mode
  const cancelEdit = () => {
    if (isEconomy) {
      dispatch(setEconomyItems(tempItems));
    } else {
      dispatch(setBusinessItems(tempItems));
    }
    setIsEditing(false);
    localStorage.setItem(`cbmd:isEditing-${seatClass}`, 'false');
    localStorage.removeItem(`cbmd:tempItems-${seatClass}`);
  };

  // Handle successful order confirmation
  const handleOrderConfirmation = () => {
    if (items.length === 0) {
      setIsOrderConfirmed(false);
    } else {
      setIsOrderConfirmed(true);
    }
    setIsEditing(false);
    localStorage.setItem(`cbmd:isEditing-${seatClass}`, 'false');
    localStorage.removeItem(`cbmd:tempItems-${seatClass}`);
    if (items.length > 0) {
      localStorage.setItem(`cbmd:cartItems-${seatClass}`, JSON.stringify(items));
    } else {
      localStorage.removeItem(`cbmd:cartItems-${seatClass}`);
    }
    setTempItems([]);
    setSnackbarOpen(true);
    setOrderKey(prev => prev + 1);
  };
  
  const closeSnackbar = () => {
    setSnackbarOpen(false);
  };

  return (
    <>
      {isOrderConfirmed ? (
        <div className={`${isMobile ? 'bg-white shadow-lg' : 'h-full mt-12'}`}>
          <ConfirmedOrder 
            key={orderKey} 
            onEditOrder={startEditing}
            onEditComplete={cancelEdit}
            onOrderSuccess={handleOrderConfirmation}
            isEditing={isEditing}
            isMobile={isMobile}
          />
        </div>
      ) : (
        <div 
          className={`bg-white ${
            isMobile 
              ? `${isCartExpanded ? 'h-[80vh]' : 'h-[72px]'} transition-all duration-300` 
              : 'h-full flex flex-col p-4 mt-12'
          }`}
        >
          {isMobile && (
            <div 
              className="h-[72px] flex items-center justify-between px-4 cursor-pointer border-t border-gray-200 shadow-lg"
              onClick={() => setIsCartExpanded(!isCartExpanded)}
            >
              <div className="flex items-center">
                <h2 className="text-xl font-semibold">Your Cart</h2>
                <span className="ml-2 text-sm text-gray-500">
                  ({items.length} {items.length === 1 ? 'item' : 'items'})
                </span>
              </div>
              <button
                className="px-4 py-2 text-white rounded hover:bg-opacity-90 transition-colors"
                style={{ backgroundColor: theme.palette.primary.main }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (items.length > 0) setIsCartExpanded(true);
                }}
              >
                View Cart
              </button>
            </div>
          )}
          {(!isMobile || isCartExpanded) && (
            <>
              {!isMobile && <h2 className="text-xl font-semibold mb-4">Your Cart</h2>}
              <div className={`flex-1 overflow-y-auto ${isMobile ? 'p-4' : ''}`}>
                {items.length === 0 ? (
                  <p className="text-gray-500">No meals in your cart</p>
                ) : (
                  <ul className="space-y-3">
                    {items.map((item, index) => (
                      <li
                        id={`cart-item-${item.name.replace(/\s+/g, '-')}`}
                        key={index}
                        className="flex justify-between items-center p-3 bg-gray-50 rounded-lg shadow-sm"
                      >
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-gray-500">{toSentenceCase(item.category)}</p>
                        </div>
                        <button
                          className="px-3 py-1 rounded-full hover:bg-opacity-10 active:bg-opacity-20 touch-manipulation"
                          style={{
                            color: theme.palette.primary.main,
                          }}
                          onClick={() => dispatch(isEconomy ? removeEconomyMeal(item.name) : removeBusinessMeal(item.name))}
                        >
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              {items.length > 0 && (
                <div className={`sticky bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 ${isMobile ? '' : 'mt-4'}`}>
                  <div className="flex gap-2">
                    {!isOrderConfirmed && !isEditing && (
                      <button 
                        className="flex-1 px-4 py-2 text-gray-600 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
                        onClick={() => dispatch(isEconomy ? resetEconomyOrder() : resetBusinessOrder())}
                      >
                        Reset
                      </button>
                    )}
                    <div className={!isOrderConfirmed && !isEditing ? "flex-1" : "w-full"}>
                      <OrderSummaryDialog onOrderSuccess={handleOrderConfirmation} isEditing={false}/>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={closeSnackbar}
        anchorOrigin={{ vertical: isMobile ? "top" : "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={closeSnackbar}
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
