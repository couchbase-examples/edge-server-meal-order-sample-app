import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { InventoryDoc, InventoryItem, InventoryState, OutOfStockItem, UpdateOrderPayload } from "../types";
import { store } from ".";
import { removeBusinessMeal } from "./businessMealSlice";
import { isValidCategory } from "../constants";
import { edgeInventoryDocStore, placeOrderWithConflictRetry } from "./inventoryOrders";

const initialState: InventoryState = {
	data: null,
	status: "idle",
	error: null,
	outOfStockItems: [],
};

// API helper functions
const inventoryDoc = edgeInventoryDocStore("businessinventory");

export const fetchBusinessInventory = createAsyncThunk<InventoryDoc>(
	"inventory/fetchBusinessInventory",
	() => inventoryDoc.load()
);

interface PartialInventoryUpdate {
	category: string;
	mealId: string;
	seatsOrdered: Record<string, number>;
	startingInventory: number;
}

// New thunk for partial inventory updates
export const updatePartialInventory = createAsyncThunk(
	"inventory/updatePartialInventory",
	async (updates: PartialInventoryUpdate[], { getState, dispatch }) => {
		const state = getState() as ReturnType<typeof store.getState>;
		const currentInventory = state.businessInventory.data;

		if (!currentInventory) return null;

		const updatedInventory = { ...currentInventory };
		const seatId = localStorage.getItem("cbmd:seatId") || "";

		// Track categories that have changes
		const changedCategories = new Set<string>();

		// First pass: collect all categories that need updating
		updates.forEach((update) => {
			if (isValidCategory(update.category)) {
				changedCategories.add(update.category);
			}
		});

		// Second pass: update all items in changed categories
		changedCategories.forEach((category) => {
			if (isValidCategory(category)) {
				updatedInventory[category] = updatedInventory[category].map(
					(item: InventoryItem) => {
						const mealKey = Object.keys(item)[0];
						const update = updates.find((u) => u.mealId === mealKey);

						if (update) {
							// Count active orders
							const orderedCount = Object.keys(update.seatsOrdered).length;
							const isNowOutOfStock =
								update.startingInventory - orderedCount <= 0;

							// Check if this item is in the current user's cart and should be removed
							if (isNowOutOfStock) {
								const cartItems = state.businessMeal.items;
								const itemInCart = cartItems.find(
									(item) => item.mealId === mealKey
								);
								if (itemInCart && !update.seatsOrdered[seatId]) {
									dispatch(removeBusinessMeal(itemInCart.name));
								}
							}

							return {
								[mealKey]: {
									seatsOrdered: update.seatsOrdered,
									startingInventory: update.startingInventory,
								},
							};
						}
						return item;
					}
				);
			}
		});

		return updatedInventory;
	}
);

export const updateBusinessInventory = createAsyncThunk(
	"inventory/updateBusinessInventory",
	async (payload: UpdateOrderPayload, { rejectWithValue }) => {
		const outcome = await placeOrderWithConflictRetry(inventoryDoc, payload);
		switch (outcome.kind) {
			case "saved":
				return outcome.doc;
			case "outOfStock":
				return rejectWithValue({
					message: "Some items are already out of stock",
					outOfStockItems: outcome.outOfStockItems,
				});
			case "failed":
				return rejectWithValue(outcome.message ?? "Failed to update inventory");
		}
	}
);

const inventorySlice = createSlice({
	name: "inventory",
	initialState,
	reducers: {
		clearOutOfStockItems: (state) => {
			state.outOfStockItems = [];
			state.error = null;
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(fetchBusinessInventory.pending, (state) => {
				state.status = "loading";
				state.error = null;
			})
			.addCase(fetchBusinessInventory.fulfilled, (state, action) => {
				state.status = "succeeded";
				state.data = action.payload;
				state.error = null;
			})
			.addCase(fetchBusinessInventory.rejected, (state, action) => {
				state.status = "failed";
				state.error = action.error.message ?? "Failed to fetch inventory";
			})
			.addCase(updateBusinessInventory.pending, (state) => {
				state.status = "loading";
				state.error = null;
			})
			.addCase(updateBusinessInventory.fulfilled, (state, action) => {
				state.status = "succeeded";
				state.data = action.payload;
				state.error = null;
			})
			.addCase(updatePartialInventory.fulfilled, (state, action) => {
				if (action.payload) {
					state.data = action.payload;
				}
			})
			.addCase(updateBusinessInventory.rejected, (state, action) => {
				state.status = "failed";
				if (action.payload && typeof action.payload === "object") {
					const { message, outOfStockItems } = action.payload as {
						message?: string;
						outOfStockItems?: OutOfStockItem[];
					};
					state.error = message ?? "Failed to update inventory";
					state.outOfStockItems = outOfStockItems ?? [];
				} else {
					state.error = action.error.message ?? "Failed to update inventory";
					state.outOfStockItems = [];
				}
			});
	},
});

export const { clearOutOfStockItems } = inventorySlice.actions;

export default inventorySlice.reducer;
