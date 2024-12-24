import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Meal {
  name: string;
  price: number;
  quantity: number;
}

interface MealState {
  items: Meal[];
  totalPrice: number;
}

const initialState: MealState = {
  items: [],
  totalPrice: 0
};

const mealSlice = createSlice({
  name: 'meal',
  initialState,
  reducers: {
    addMeal: (state, action: PayloadAction<Meal>) => {
      const existingIndex = state.items.findIndex(
        item => item.name === action.payload.name
      );
      if (existingIndex >= 0) {
        // Increase the quantity
        state.items[existingIndex].quantity += action.payload.quantity;
      } else {
        state.items.push(action.payload);
      }
      state.totalPrice += action.payload.price * action.payload.quantity;
    },
    removeMeal: (state, action: PayloadAction<string>) => {
      const existingIndex = state.items.findIndex(
        item => item.name === action.payload
      );
      if (existingIndex >= 0) {
        const item = state.items[existingIndex];
        state.totalPrice -= item.price * item.quantity;
        state.items.splice(existingIndex, 1);
      }
    },
    resetOrder: state => {
      state.items = [];
      state.totalPrice = 0;
    }
  }
});

export const { addMeal, removeMeal, resetOrder } = mealSlice.actions;
export default mealSlice.reducer;