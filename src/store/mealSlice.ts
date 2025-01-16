import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { BusinessMealDoc } from "../types";
import { api } from "../services/api";

// Local Storage key
const CART_STORAGE_KEY = 'meal_cart';

/** We only store meal name and category now. */
export interface CartMeal {
	name: string;
	category: string;
  mealId: string;
}

interface MealState {
	// BusinessMeal data
	data: BusinessMealDoc | null;
	status: "idle" | "loading" | "succeeded" | "failed";
	error: string | null;
	// Cart items (one meal per category)
	items: CartMeal[];
}

// Load initial state from localStorage
const loadInitialState = (): MealState => {
  try {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);
    return {
      data: null,
      status: "idle",
      error: null,
      items: savedCart ? JSON.parse(savedCart) : [],
    };
  } catch (error) {
    console.error('Failed to load cart from localStorage:', error);
    return {
      data: null,
      status: "idle",
      error: null,
      items: [],
    };
  }
};

const initialState: MealState = loadInitialState();

// Async thunk for syncing cart with server
export const syncCartWithServer = createAsyncThunk(
  'meal/syncCart',
  async (items: CartMeal[]) => {
    try {
      await api.fetch('/american234.AmericanAirlines.AA234/cart', {
        method: 'POST',
        body: JSON.stringify({ items }),
      });
      return items;
    } catch (error) {
      console.error('Failed to sync cart with server:', error);
      // Don't throw error to prevent UI disruption
      // Instead, we'll rely on local storage as backup
      return items;
    }
  }
);

export const fetchBusinessMeal = createAsyncThunk<BusinessMealDoc>(
	"meal/fetchBusinessMeal",
	async () => {
		try {
			const response = await fetch(
				"/american234.AmericanAirlines.AA234/businessmeal",
				{
					headers: {
						Authorization: "Basic " + btoa("seatuser:password"),
						"Content-Type": "application/json",
					},
					credentials: "include",
				}
			);

			if (!response.ok) {
				const errorData = await response.text();
				throw new Error(errorData || "Failed to fetch businessmeal data");
			}

			return (await response.json()) as BusinessMealDoc;
		} catch (error) {
			if (error instanceof Error) {
				throw new Error(`Failed to fetch businessmeal data: ${error.message}`);
			}
			throw new Error("An unknown error occurred");
		}
	}
);

const mealSlice = createSlice({
	name: "meal",
	initialState,
	reducers: {
		addMeal: (state, action: PayloadAction<CartMeal>) => {
			// In order to ensure only one meal can be selected per category,
			// remove any existing meal with the same category:
			const existingIndex = state.items.findIndex(
				(item) => item.category === action.payload.category
			);
			if (existingIndex >= 0) {
				// Remove the old meal from that category
				state.items.splice(existingIndex, 1);
			}

			// Now push the newly selected meal
			state.items.push(action.payload);

      // Sync with localStorage
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state.items));
		},

		removeMeal: (state, action: PayloadAction<string>) => {
			// action.payload is the meal name
			const existingIndex = state.items.findIndex(
				(item) => item.name === action.payload
			);
			if (existingIndex >= 0) {
				state.items.splice(existingIndex, 1);
			}
      
      // Sync with localStorage
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state.items));
		},

		resetOrder: (state) => {
			state.items = [];
      // Sync with localStorage
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify([]));
		},
	},
	extraReducers(builder) {
		builder
			.addCase(fetchBusinessMeal.pending, (state) => {
				state.status = "loading";
				state.error = null;
			})
			.addCase(fetchBusinessMeal.fulfilled, (state, action) => {
				state.status = "succeeded";
				state.data = action.payload;
				state.error = null;
			})
			.addCase(fetchBusinessMeal.rejected, (state, action) => {
				state.status = "failed";
				state.error = action.error.message ?? "Something went wrong";
			})
			// Add cases for syncCartWithServer
			.addCase(syncCartWithServer.fulfilled, () => {
				// Server sync successful, no need to update state since it's already in sync
			})
			.addCase(syncCartWithServer.rejected, () => {
				// Server sync failed, but we'll keep the local state as is
				console.warn('Failed to sync cart with server. Changes saved locally.');
			});
	},
});

export const { addMeal, removeMeal, resetOrder } = mealSlice.actions;
export default mealSlice.reducer;
