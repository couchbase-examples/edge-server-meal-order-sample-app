import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { BusinessMealDoc } from "../types";

// Reuse your "Meal" interface from the sample second slice
export interface CartMeal {
	name: string;
	price: number;
	quantity: number;
}

interface MealState {
	// from your original BusinessMeal part:
	data: BusinessMealDoc | null;
	status: "idle" | "loading" | "succeeded" | "failed";
	error: string | null;

	// from your cart logic:
	items: CartMeal[];
	totalPrice: number;
}

// INITIAL STATE
const initialState: MealState = {
	data: null,
	status: "idle",
	error: null,
	items: [],
	totalPrice: 0,
};

// Async Thunk to fetch business meal data:
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
		// -- CART LOGIC REDUCERS --

		addMeal: (state, action: PayloadAction<CartMeal>) => {
			// If you only want one meal of each type, either:
			// 1) disallow duplicates altogether, or
			// 2) increment quantity if found.

			// Example: allow multiple but increment quantity
			const existingIndex = state.items.findIndex(
				(item) => item.name === action.payload.name
			);
			if (existingIndex >= 0) {
				state.items[existingIndex].quantity += action.payload.quantity;
			} else {
				state.items.push(action.payload);
			}
			state.totalPrice += action.payload.price * action.payload.quantity;
		},

		removeMeal: (state, action: PayloadAction<string>) => {
			const existingIndex = state.items.findIndex(
				(item) => item.name === action.payload
			);
			if (existingIndex >= 0) {
				const item = state.items[existingIndex];
				state.totalPrice -= item.price * item.quantity;
				state.items.splice(existingIndex, 1);
			}
		},

		resetOrder: (state) => {
			state.items = [];
			state.totalPrice = 0;
		},
	},
	extraReducers(builder) {
		builder
			.addCase(fetchBusinessMeal.pending, (state) => {
				state.status = "loading";
				state.error = null;
			})
			.addCase(
				fetchBusinessMeal.fulfilled,
				(state, action: PayloadAction<BusinessMealDoc>) => {
					state.status = "succeeded";
					state.data = action.payload;
					state.error = null;
				}
			)
			.addCase(fetchBusinessMeal.rejected, (state, action) => {
				state.status = "failed";
				state.error = action.error.message ?? "Something went wrong";
			});
	},
});

export const { addMeal, removeMeal, resetOrder } = mealSlice.actions;
export default mealSlice.reducer;
