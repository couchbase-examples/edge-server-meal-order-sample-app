import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { BusinessInventoryDoc, InventoryItem } from "../types";
import { api } from '../services/api';

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

interface UpdateOrderPayload {
	items: Array<{
		id: string;
		category: string;
	}>;
	seatUserId: string;
}

// Type guard to check if a category exists in BusinessInventoryDoc
const isValidCategory = (category: string): category is keyof Omit<BusinessInventoryDoc, '_id' | '_rev' | 'type' | 'flightno' | 'leg' | 'aircraft'> => {
  return ['breakfast', 'lunch', 'dinner', 'dessert', 'beverage', 'alcohol'].includes(category);
};

// API helper functions
const getCurrentInventory = async (): Promise<BusinessInventoryDoc> => {
  return api.fetch("/american234.AmericanAirlines.AA234/economyinventory");
};

const updateInventoryData = async (inventory: BusinessInventoryDoc, revId: string): Promise<BusinessInventoryDoc> => {
  return api.fetch(`/american234.AmericanAirlines.AA234/economyinventory?rev=${revId}`, {
    method: "PUT",
    body: JSON.stringify(inventory),
  });
};

// Thunks
export const fetchEconomyInventory = createAsyncThunk<BusinessInventoryDoc>(
  "economyInventory/fetchEconomyInventory",
  getCurrentInventory
);

export const updateEconomyInventory = createAsyncThunk(
  "economyInventory/updateEconomyInventory",
  async (payload: UpdateOrderPayload, { rejectWithValue }) => {
    try {
      // Get current inventory
      const currentInventory = await getCurrentInventory();
      const revId = currentInventory._rev;

      // Create updated inventory object
      const updatedInventory = { ...currentInventory };

      // Remove existing orders for this user
      const categoriesToUpdate = new Set(payload.items.map(item => item.category.toLowerCase()));
      
      categoriesToUpdate.forEach(category => {
        if (isValidCategory(category)) {
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

      // Add new orders
      payload.items.forEach((item) => {
        const category = item.category.toLowerCase();
        if (isValidCategory(category)) {
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
        }
      });

      // Update inventory and get fresh data
      await updateInventoryData(updatedInventory, revId);
      return getCurrentInventory();
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to update economy inventory"
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
				state.error = action.error.message ?? "Failed to fetch economy inventory";
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
				state.error = action.error.message ?? "Failed to update economy inventory";
			});
	},
});

export default economyInventorySlice.reducer;
