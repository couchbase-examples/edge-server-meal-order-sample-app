import { configureStore } from "@reduxjs/toolkit";

// Business slices
import mealReducer from "./mealSlice";
import inventoryReducer from "./inventorySlice";

// Economy slices
import economyMealReducer from "./economyMealSlice";
import economyInventoryReducer from "./economyInventorySlice";

import { useDispatch, useSelector } from "react-redux";
import type { TypedUseSelectorHook } from "react-redux";

export const store = configureStore({
	reducer: {
		// Business
		businessMeal: mealReducer,
		businessInventory: inventoryReducer,

		// Economy
		economyMeal: economyMealReducer,
		economyInventory: economyInventoryReducer,
	},
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
