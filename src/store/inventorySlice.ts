import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { BusinessInventoryDoc, InventoryItem } from "../types";
import { api } from "../services/api";
import { store } from ".";
import { removeMeal } from "./mealSlice";
import { MEAL_CATEGORIES, isValidCategory } from "../constants";

interface OutOfStockItem {
	id: string;
	name: string;
	category: string;
}

interface InventoryState {
	data: BusinessInventoryDoc | null;
	status: "idle" | "loading" | "succeeded" | "failed";
	error: string | null;
	outOfStockItems: OutOfStockItem[];
}

const initialState: InventoryState = {
	data: null,
	status: "idle",
	error: null,
	outOfStockItems: [],
};

interface UpdateOrderPayload {
	items: Array<{
		id: string;
		name: string;
		category: string;
	}>;
	seatUserId: string;
}

// API helper functions
const getCurrentInventory = async (): Promise<BusinessInventoryDoc> => {
	return api.fetch("/american234.AmericanAirlines.AA234/businessinventory");
};

const updateInventoryData = async (
	inventory: BusinessInventoryDoc,
	revId: string
): Promise<BusinessInventoryDoc> => {
	return api.fetch(
		`/american234.AmericanAirlines.AA234/businessinventory?rev=${revId}`,
		{
			method: "PUT",
			body: JSON.stringify(inventory),
		}
	);
};

// Thunks
export const fetchBusinessInventory = createAsyncThunk<BusinessInventoryDoc>(
	"inventory/fetchBusinessInventory",
	getCurrentInventory
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
									dispatch(removeMeal(itemInCart.name));
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
		// Helper function to do the "remove old orders + add new orders"
		const applyOrdersToInventory = (
			doc: BusinessInventoryDoc,
			seatUserId: string,
			items: Array<{ id: string; category: string }>
		): BusinessInventoryDoc => {
			const updatedDoc = { ...doc };

			// Remove all existing orders for this user
			MEAL_CATEGORIES.forEach((category) => {
				updatedDoc[category] = updatedDoc[category].map((it: InventoryItem) => {
					const mealKey = Object.keys(it)[0];
					if (
						it[mealKey].seatsOrdered &&
						it[mealKey].seatsOrdered[seatUserId]
					) {
						// eslint-disable-next-line @typescript-eslint/no-unused-vars
						const { [seatUserId]: _, ...rest } = it[mealKey].seatsOrdered;
						return {
							[mealKey]: {
								...it[mealKey],
								seatsOrdered: rest,
							},
						};
					}
					return it;
				});
			});

			// Add new orders
			items.forEach((item) => {
				const category = item.category.toLowerCase();
				if (isValidCategory(category)) {
					const categoryItems = updatedDoc[category];
					const mealItem = categoryItems.find(
						(mealId: InventoryItem) => Object.keys(mealId)[0] === item.id
					);
					if (mealItem) {
						const mealKey = Object.keys(mealItem)[0];
						if (!mealItem[mealKey].seatsOrdered) {
							mealItem[mealKey].seatsOrdered = {};
						}
						mealItem[mealKey].seatsOrdered[seatUserId] = 1;
					}
				}
			});

			return updatedDoc;
		};

		// Helper function to see if any payload item is truly out of stock
		// based on the latest doc from the server.
		const findOutOfStockItems = (
			doc: BusinessInventoryDoc,
			items: Array<{ id: string; name: string; category: string }>
		): OutOfStockItem[] => {
			const outOfStockItems: OutOfStockItem[] = [];

			items.forEach(({ id, name, category }) => {
				const lowerCategory = category.toLowerCase();
				if (isValidCategory(lowerCategory)) {
					const categoryList = doc[lowerCategory];
					const mealItem = categoryList.find(
						(mi: InventoryItem) => Object.keys(mi)[0] === id
					);

					if (mealItem) {
						const mealKey = Object.keys(mealItem)[0];
						const { seatsOrdered, startingInventory } = mealItem[mealKey];
						const totalSeatsOrdered = Object.keys(seatsOrdered ?? {}).length;
						if (startingInventory - totalSeatsOrdered <= 0) {
							outOfStockItems.push({ id, name, category: lowerCategory });
						}
					}
				}
			});
			return outOfStockItems;
		};

		try {
			while (true) {
				try {
					// 1. Get the current doc
					const currentDoc = await getCurrentInventory();
					// 2. Check if items we want to order are already out of stock
					const outOfStock = findOutOfStockItems(currentDoc, payload.items);
					if (outOfStock.length > 0) {
						// If anything is out of stock, reject immediately
						return rejectWithValue({
							message: "Some items are already out of stock",
							outOfStockItems: outOfStock,
						});
					}

					// 3. Mutate the doc with remove+add orders
					const updatedInventory = applyOrdersToInventory(
						currentDoc,
						payload.seatUserId,
						payload.items
					);

					// 4. Attempt to save (PUT) the doc
					await updateInventoryData(updatedInventory, currentDoc._rev);

					// If PUT succeeds, fetch again and return the new doc
					return getCurrentInventory();
				} catch (error: unknown) {
					if (error instanceof Error) {
						const parsed = JSON.parse(error.message);
						const newstatus = parsed.status;
						if (newstatus === 409) {
							continue;
						} else {
							return rejectWithValue(error.message);
						}
					} else {
						return rejectWithValue("Failed to update inventory");
					}
				}
			}
		} catch (err) {
			return rejectWithValue(
				err instanceof Error ? err.message : "Failed to update inventory"
			);
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
