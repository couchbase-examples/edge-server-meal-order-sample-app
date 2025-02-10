import { configureStore, Middleware } from "@reduxjs/toolkit";

// Business slices
import mealReducer from "./mealSlice";
import inventoryReducer from "./inventorySlice";

// Economy slices
import economyMealReducer from "./economyMealSlice";
import economyInventoryReducer from "./economyInventorySlice";

import { useDispatch, useSelector } from "react-redux";
import type { TypedUseSelectorHook } from "react-redux";

// Load persisted state from localStorage
const loadState = () => {
  try {
    const businessMealState = localStorage.getItem('cbmd:businessMeal');
    const economyMealState = localStorage.getItem('cbmd:economyMeal');
    
    return {
      businessMeal: businessMealState ? JSON.parse(businessMealState) : undefined,
      economyMeal: economyMealState ? JSON.parse(economyMealState) : undefined
    };
  } catch {
    return undefined;
  }
};

// Clear persisted state from localStorage
const clearPersistedState = () => {
  localStorage.removeItem('cbmd:businessMeal');
  localStorage.removeItem('cbmd:economyMeal');
};

// Create middleware to save state changes to localStorage
const persistStateMiddleware: Middleware = (store) => (next) => (action) => {
  const result = next(action);
  const state = store.getState();
  
  try {
    // Only persist the items array from each slice
    if (state.businessMeal?.items) {
      localStorage.setItem('cbmd:businessMeal', JSON.stringify({
        ...state.businessMeal,
        data: null,  // Don't persist API data
        status: 'idle',
        error: null
      }));
    }
    if (state.economyMeal?.items) {
      localStorage.setItem('cbmd:economyMeal', JSON.stringify({
        ...state.economyMeal,
        data: null,  // Don't persist API data
        status: 'idle',
        error: null
      }));
    }
  } catch (error) {
    console.error('Failed to save state to localStorage:', error);
  }
  
  return result;
};

// Clear local storage keys related to the app's state when the application starts
clearPersistedState();

export const store = configureStore({
  preloadedState: loadState(),
  reducer: {
    // Business
    businessMeal: mealReducer,
    businessInventory: inventoryReducer,

    // Economy
    economyMeal: economyMealReducer,
    economyInventory: economyInventoryReducer,
  },
  middleware: (getDefaultMiddleware) => 
    getDefaultMiddleware().concat(persistStateMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
