// src/features/mealSlice.ts

import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { BusinessMealDoc } from "../types";

interface MealState {
  data: BusinessMealDoc | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: MealState = {
  data: null,
  status: "idle",
  error: null,
};

export const fetchBusinessMeal = createAsyncThunk<BusinessMealDoc>(
  "meal/fetchBusinessMeal",
  async () => {
    try {
      const response = await fetch(
        "/american234.AmericanAirlines.AA234/businessmeal",
        {
          headers: {
            "Authorization": "Basic " + btoa("seatuser:password"),
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || 'Failed to fetch businessmeal data');
      }

      return await response.json() as BusinessMealDoc;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to fetch businessmeal data: ${error.message}`);
      }
      throw new Error('An unknown error occurred');
    }
  }
);

const mealSlice = createSlice({
  name: "meal",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBusinessMeal.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchBusinessMeal.fulfilled, (state, action: PayloadAction<BusinessMealDoc>) => {
        state.status = "succeeded";
        state.data = action.payload;
        state.error = null;
      })
      .addCase(fetchBusinessMeal.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message ?? "Something went wrong";
      });
  },
});

export default mealSlice.reducer;