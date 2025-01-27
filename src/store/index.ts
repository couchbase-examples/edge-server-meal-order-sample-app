import { configureStore, Middleware, Action, combineReducers } from "@reduxjs/toolkit";

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
    const businessMealState = localStorage.getItem('businessMeal');
    const economyMealState = localStorage.getItem('economyMeal');
    
    return {
      businessMeal: businessMealState ? JSON.parse(businessMealState) : undefined,
      economyMeal: economyMealState ? JSON.parse(economyMealState) : undefined
    };
  } catch {
    return undefined;
  }
};

// Create middleware to save state changes to localStorage
const persistStateMiddleware: Middleware = (store) => (next) => (action) => {
  const result = next(action);
  const state = store.getState();
  
  try {
    // Only persist the items array from each slice
    if (state.businessMeal?.items) {
      localStorage.setItem('businessMeal', JSON.stringify({
        ...state.businessMeal,
        data: null,  // Don't persist API data
        status: 'idle',
        error: null
      }));
    }
    if (state.economyMeal?.items) {
      localStorage.setItem('economyMeal', JSON.stringify({
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

// Create middleware to debounce inventory actions
const debounceInventoryMiddleware: Middleware = () => {
  let timeoutId: NodeJS.Timeout | null = null;
  
  return next => (action) => {
    // Check if this is an inventory fetch action
    const actionType = (action as Action).type;
    if (actionType?.includes('fetchInventory')) {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      
      return new Promise((resolve) => {
        timeoutId = setTimeout(() => {
          resolve(next(action));
          timeoutId = null;
        }, 300);
      });
    }
    
    return next(action);
  };
};

const rootReducer = combineReducers({
  // Business
  businessMeal: mealReducer,
  businessInventory: inventoryReducer,

  // Economy
  economyMeal: economyMealReducer,
  economyInventory: economyInventoryReducer,
});

export const store = configureStore({
  reducer: rootReducer,
  preloadedState: loadState(),
  middleware: (getDefaultMiddleware) => {
    const middlewares = getDefaultMiddleware();
    return middlewares.concat([persistStateMiddleware, debounceInventoryMiddleware]);
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
