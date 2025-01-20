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
	// Confirmed order
	confirmedOrder: CartMeal[];
}

const initialState: MealState = {
  data: null,
  status: "idle",
  error: null,
  items: [],
  confirmedOrder: [],
};

// Async thunk for syncing cart with server
export const fetchExistingOrder = createAsyncThunk(
  'meal/fetchExistingOrder',
  async (seatId: string) => {
    try {
      const response = await api.fetch(`/american234.AmericanAirlines.AA234/cart/${seatId}`, {
        method: 'GET'
      });
      const data = await response.json();
      return data.items as CartMeal[];
    } catch (error) {
      console.error('Failed to fetch existing order:', error);
      return [];
    }
  }
);

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

      // Use localStorage as backup only
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state.items));
      } catch (error) {
        console.warn('Failed to backup to localStorage:', error);
      }
		},

		removeMeal: (state, action: PayloadAction<string>) => {
			// action.payload is the meal name
			const existingIndex = state.items.findIndex(
				(item) => item.name === action.payload
			);
			if (existingIndex >= 0) {
				state.items.splice(existingIndex, 1);
			}
      
      // Use localStorage as backup only
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state.items));
      } catch (error) {
        console.warn('Failed to backup to localStorage:', error);
      }
		},

		resetOrder: (state) => {
			state.items = [];
      // Use localStorage as backup only
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify([]));
      } catch (error) {
        console.warn('Failed to backup to localStorage:', error);
      }
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
			.addCase(syncCartWithServer.fulfilled, (state, action) => {
				// Update state with server response
				state.confirmedOrder = action.payload;
				state.items = []; // Clear cart after confirmation
				// Backup to localStorage
				try {
					localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(action.payload));
				} catch (error) {
					console.warn('Failed to backup to localStorage:', error);
				}
			})
			.addCase(syncCartWithServer.rejected, (state) => {
				// Server sync failed, try to restore from localStorage backup
				try {
					const backup = localStorage.getItem(CART_STORAGE_KEY);
					if (backup) {
						state.confirmedOrder = JSON.parse(backup);
					}
				} catch (error) {
					console.warn('Failed to restore from localStorage:', error);
				}
			})
			// Add cases for fetchExistingOrder
			.addCase(fetchExistingOrder.fulfilled, (state, action) => {
				state.confirmedOrder = action.payload;
			});
	},
});

export const { addMeal, removeMeal, resetOrder } = mealSlice.actions;
export default mealSlice.reducer;
