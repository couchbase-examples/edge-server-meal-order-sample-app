import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { BusinessInventoryDoc, InventoryItem } from "../types";

interface EconomyInventoryState {
	data: BusinessInventoryDoc | null;
	status: "idle" | "loading" | "succeeded" | "failed";
	error: string | null;
}

const initialState: EconomyInventoryState = {
	data: null,
	status: "idle",
	error: null,
};

// GET economy inventory
export const fetchEconomyInventory = createAsyncThunk<BusinessInventoryDoc>(
	"economyInventory/fetchEconomyInventory",
	async () => {
		const response = await fetch(
			"/american234.AmericanAirlines.AA234/economyinventory",
			{
				headers: {
					Authorization: "Basic " + btoa("seatuser:password"),
					"Content-Type": "application/json",
				},
				credentials: "include",
			}
		);

		if (!response.ok) {
			throw new Error("Failed to fetch economy inventory");
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

export const updateEconomyInventory = createAsyncThunk(
	"economyInventory/updateEconomyInventory",
	async (payload: UpdateOrderPayload, { rejectWithValue }) => {
		try {
			// 1) fetch the current economy inventory
			const getResponse = await fetch(
				"/american234.AmericanAirlines.AA234/economyinventory",
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

			// 3) PUT updated inventory
			const putResponse = await fetch(
				`/american234.AmericanAirlines.AA234/economyinventory?rev=${revId}`,
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
				throw new Error("Failed to update economy inventory");
			}

			// 4) fetch the updated doc
			const getNewResponse = await fetch(
				"/american234.AmericanAirlines.AA234/economyinventory",
				{
					headers: {
						Authorization: "Basic " + btoa("seatuser:password"),
						"Content-Type": "application/json",
					},
					credentials: "include",
				}
			);

			if (!getNewResponse.ok) {
				throw new Error("Failed to fetch updated economy inventory");
			}

			return getNewResponse.json();
		} catch (error) {
			return rejectWithValue(
				error instanceof Error
					? error.message
					: "Failed to update economy inventory"
			);
		}
	}
);

const economyInventorySlice = createSlice({
	name: "economyInventory",
	initialState,
	reducers: {},
	extraReducers: (builder) => {
		builder
			.addCase(fetchEconomyInventory.pending, (state) => {
				state.status = "loading";
				state.error = null;
			})
			.addCase(fetchEconomyInventory.fulfilled, (state, action) => {
				state.status = "succeeded";
				state.data = action.payload;
				state.error = null;
			})
			.addCase(fetchEconomyInventory.rejected, (state, action) => {
				state.status = "failed";
				state.error =
					action.error.message ?? "Failed to fetch economy inventory";
			})
			.addCase(updateEconomyInventory.pending, (state) => {
				state.status = "loading";
				state.error = null;
			})
			.addCase(updateEconomyInventory.fulfilled, (state, action) => {
				state.status = "succeeded";
				state.data = action.payload;
				state.error = null;
			})
			.addCase(updateEconomyInventory.rejected, (state, action) => {
				state.status = "failed";
				state.error =
					action.error.message ?? "Failed to update economy inventory";
			});
	},
});

export default economyInventorySlice.reducer;
