import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { removeMeal } from "../store/mealSlice";
import { useTheme } from "@mui/material/styles";
import { RootState } from "../store";
import { useParams } from "react-router-dom";

const Cart: React.FC = () => {
  const dispatch = useDispatch();
  const theme = useTheme();
	const { seatClass } = useParams();
	const isEconomy = seatClass === "economy";

	const { items } = useSelector((state: RootState) => isEconomy? state.economyMeal : state.businessMeal);

  return (
    <div className="h-full flex flex-col p-4">
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
