import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { MealDoc, CartMeal, MealState } from "../types";

const initialState: MealState = {
	data: null,
	status: "idle",
	error: null,
	items: [],
};

export const fetchBusinessMeal = createAsyncThunk<MealDoc>(
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

			return (await response.json()) as MealDoc;
		} catch (error) {
			if (error instanceof Error) {
				throw new Error(`Failed to fetch businessmeal data: ${error.message}`);
			}
			throw new Error("An unknown error occurred");
		}
	}
);

const businessMealSlice = createSlice({
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
		},

		removeMeal: (state, action: PayloadAction<string>) => {
			// action.payload is the meal name
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

		setItems: (state, action: PayloadAction<CartMeal[]>) => {
			state.items = action.payload;
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
			});
	},
});

export const {
	addMeal: addBusinessMeal,
	removeMeal: removeBusinessMeal,
	resetOrder: resetBusinessOrder,
	setItems: setBusinessItems,
} = businessMealSlice.actions;

export default businessMealSlice.reducer;
