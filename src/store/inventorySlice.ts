import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { BusinessInventoryDoc, InventoryItem } from "../types";

interface InventoryState {
	data: BusinessInventoryDoc | null;
	status: "idle" | "loading" | "succeeded" | "failed";
	error: string | null;
}

const initialState: InventoryState = {
	data: null,
	status: "idle",
	error: null,
};

export const fetchBusinessInventory = createAsyncThunk<BusinessInventoryDoc>(
	"inventory/fetchBusinessInventory",
	async () => {
		const response = await fetch(
			"/american234.AmericanAirlines.AA234/businessinventory",
			{
				headers: {
					Authorization: "Basic " + btoa("seatuser:password"),
					"Content-Type": "application/json",
				},
				credentials: "include",
			}
		);

		if (!response.ok) {
			throw new Error("Failed to fetch inventory");
		}

		return response.json();
	}
);

interface UpdateOrderPayload {
	items: Array<{
		id: string;
		category: string;
	}>;
	seatUserId: string;
}

export const updateBusinessInventory = createAsyncThunk(
	"inventory/updateBusinessInventory",
	async (payload: UpdateOrderPayload, { rejectWithValue }) => {
		try {
			// First, get the current inventory
			const getResponse = await fetch(
				"/american234.AmericanAirlines.AA234/businessinventory",
				{
					headers: {
						Authorization: "Basic " + btoa("seatuser:password"),
						"Content-Type": "application/json",
					},
					credentials: "include",
				}
			);

			if (!getResponse.ok) {
				throw new Error("Failed to fetch current inventory");
			}

			const currentInventory = await getResponse.json();
			const revId = currentInventory._rev;

			// Create updated inventory object
			const updatedInventory = { ...currentInventory };

			// First, remove all existing orders for this user from the categories being updated
			const categoriesToUpdate = new Set(payload.items.map(item => item.category.toLowerCase()));
			
			Object.keys(updatedInventory).forEach(category => {
				if (categoriesToUpdate.has(category) && Array.isArray(updatedInventory[category])) {
					updatedInventory[category] = updatedInventory[category].map((item: InventoryItem) => {
						const mealKey = Object.keys(item)[0];
						if (item[mealKey].seatsOrdered && item[mealKey].seatsOrdered[payload.seatUserId]) {
							const newSeatsOrdered = { ...item[mealKey].seatsOrdered };
							delete newSeatsOrdered[payload.seatUserId];
							return {
								[mealKey]: {
									...item[mealKey],
									seatsOrdered: newSeatsOrdered
								}
							};
						}
						return item;
					});
				}
			});

			// Then add the new orders
			payload.items.forEach((item) => {
				const category = item.category.toLowerCase();
				const categoryItems = updatedInventory[category];

				const mealItem = categoryItems.find(
					(mealId: InventoryItem) => Object.keys(mealId)[0] === item.id
				);
				if (mealItem) {
					const mealKey = Object.keys(mealItem)[0];
					if (!mealItem[mealKey].seatsOrdered) {
						mealItem[mealKey].seatsOrdered = {};
					}
					mealItem[mealKey].seatsOrdered[payload.seatUserId] = 1;
				}
			});

			// Make PUT request with updated inventory
			const putResponse = await fetch(
				`/american234.AmericanAirlines.AA234/businessinventory?rev=${revId}`,
				{
					method: "PUT",
					headers: {
						Authorization: "Basic " + btoa("seatuser:password"),
						"Content-Type": "application/json",
					},
					credentials: "include",
					body: JSON.stringify(updatedInventory),
				}
			);

			if (!putResponse.ok) {
				throw new Error("Failed to update inventory");
			}

            const getNewResponse = await fetch(
				"/american234.AmericanAirlines.AA234/businessinventory",
				{
					headers: {
						Authorization: "Basic " + btoa("seatuser:password"),
						"Content-Type": "application/json",
					},
					credentials: "include",
				}
			);

			if (!getNewResponse.ok) {
				throw new Error("Failed to fetch current inventory");
			}

			return getNewResponse.json();
		} catch (error) {
			return rejectWithValue(
				error instanceof Error ? error.message : "Failed to update inventory"
			);
		}
	}
);

const inventorySlice = createSlice({
	name: "inventory",
	initialState,
	reducers: {},
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
			.addCase(updateBusinessInventory.rejected, (state, action) => {
				state.status = "failed";
				state.error = action.error.message ?? "Failed to update inventory";
			});
	},
});

export default inventorySlice.reducer;
