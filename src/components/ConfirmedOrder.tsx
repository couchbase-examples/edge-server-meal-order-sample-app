import EditIcon from "@mui/icons-material/Edit";
import { Button, useTheme } from "@mui/material";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { RootState } from "../store";
import { removeEconomyMeal } from "../store/economyMealSlice";
import { CartMeal, removeMeal } from "../store/mealSlice";
import { toSentenceCase } from "../utils/formatText";
import OrderSummaryDialog from "./OrderSummaryDialog";

interface ConfirmedOrderProps {
  onEditOrder: () => void;
  onEditComplete: () => void;
  onOrderSuccess: () => void;
  isEditing: boolean;
  isMobile?: boolean;
}

const ConfirmedOrder: React.FC<ConfirmedOrderProps> = ({ 
  onEditOrder,
  onEditComplete,
  onOrderSuccess,
  isEditing,
  isMobile = false
}) => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const { seatClass } = useParams();
  const isEconomy = seatClass === "economy";

  const { items } = useSelector((state: RootState) =>
    isEconomy ? state.economyMeal : state.businessMeal
  );

  return (
    <div className={`${isMobile ? 'p-4' : 'h-full flex flex-col p-4'}`}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Confirmed Order</h2>
        {!isEditing && (
          <Button
            variant="outlined"
            color="primary"
            onClick={onEditOrder}
            size="small"
            startIcon={<EditIcon />}
          >
            Edit
          </Button>
        )}
      </div>
      <div className="flex-1 overflow-y-auto">
        {items.length === 0 ? (
          <p className="text-gray-500">No items in your order</p>
        ) : (
          <ul className="space-y-3">
            {items.map((item: CartMeal, index: number) => (
              <li
                key={index}
                className="flex justify-between items-center p-3 bg-gray-50 rounded-lg shadow-sm"
              >
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-gray-500">{toSentenceCase(item.category)}</p>
                </div>
                {isEditing && (
                  <button
                    className="px-3 py-1 rounded-full hover:bg-opacity-10 active:bg-opacity-20 touch-manipulation"
                    style={{
                      color: theme.palette.primary.main,
                    }}
                    onClick={() => dispatch(isEconomy ? removeEconomyMeal(item.name) : removeMeal(item.name))}
                  >
                    Remove
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
      {isEditing && items.length > 0 && (
        <div className="sticky bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 mt-4">
          <div className="flex gap-2">
            <button 
              className="flex-1 px-4 py-2 text-gray-600 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
              onClick={onEditComplete}
            >
              Cancel
            </button>
            <div className="flex-1">
              <OrderSummaryDialog onOrderSuccess={onOrderSuccess} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConfirmedOrder;
