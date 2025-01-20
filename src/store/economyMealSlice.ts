import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { BusinessMealDoc } from "../types";

/** We'll use the same types if they only differ by name in the Couchbase doc.
If you'd like a separate "EconomyMealDoc," you can define that too. **/
export type EconomyMealDoc = BusinessMealDoc

export interface CartMeal {
	name: string;
	category: string;
	mealId: string;
}

interface EconomyMealState {
	data: BusinessMealDoc | null;
	status: "idle" | "loading" | "succeeded" | "failed";
	error: string | null;
	items: CartMeal[];
}

const initialState: EconomyMealState = {
	data: null,
	status: "idle",
	error: null,
	items: [],
};

// GET economy meal from different path
export const fetchEconomyMeal = createAsyncThunk<EconomyMealDoc>(
	"economyMeal/fetchEconomyMeal",
	async () => {
		try {
			const response = await fetch(
				"/american234.AmericanAirlines.AA234/economymeal",
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
				throw new Error(errorData || "Failed to fetch economyMeal data");
			}

			return (await response.json()) as EconomyMealDoc;
		} catch (error) {
			if (error instanceof Error) {
				throw new Error(`Failed to fetch economyMeal data: ${error.message}`);
			}
			throw new Error("An unknown error occurred");
		}
	}
);

const economyMealSlice = createSlice({
	name: "economyMeal",
	initialState,
	reducers: {
		addMeal: (state, action: PayloadAction<CartMeal>) => {
			// same logic as in your businessMeal slice
			const existingIndex = state.items.findIndex(
				(item) => item.category === action.payload.category
			);
			if (existingIndex >= 0) {
				state.items.splice(existingIndex, 1);
			}
			state.items.push(action.payload);
		},
		removeMeal: (state, action: PayloadAction<string>) => {
			const existingIndex = state.items.findIndex(
				(item) => item.name === action.payload
			);
			if (existingIndex >= 0) {
				state.items.splice(existingIndex, 1);
			}
		},
		resetOrder: (state) => {
			state.items = [];
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(fetchEconomyMeal.pending, (state) => {
				state.status = "loading";
				state.error = null;
			})
			.addCase(fetchEconomyMeal.fulfilled, (state, action) => {
				state.status = "succeeded";
				state.data = action.payload;
				state.error = null;
			})
			.addCase(fetchEconomyMeal.rejected, (state, action) => {
				state.status = "failed";
				state.error = action.error.message ?? "Something went wrong";
			});
	},
});

export const {
	addMeal: addEconomyMeal,
	removeMeal: removeEconomyMeal,
	resetOrder: resetEconomyOrder,
} = economyMealSlice.actions;
export default economyMealSlice.reducer;
