import { configureStore } from '@reduxjs/toolkit';
import mealReducer from './mealSlice';

export const store = configureStore({
  reducer: {
    meal: mealReducer
  }
});

// Inferred RootState and AppDispatch types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;