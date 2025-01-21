import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { BusinessInventoryDoc, InventoryItem } from "../types";
import { api } from '../services/api';

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
  return api.fetch("/american234.AmericanAirlines.AA234/businessinventory");
};

const updateInventoryData = async (inventory: BusinessInventoryDoc, revId: string): Promise<BusinessInventoryDoc> => {
  return api.fetch(`/american234.AmericanAirlines.AA234/businessinventory?rev=${revId}`, {
    method: "PUT",
    body: JSON.stringify(inventory),
  });
};

// Thunks
export const fetchBusinessInventory = createAsyncThunk<BusinessInventoryDoc>(
  "inventory/fetchBusinessInventory",
  getCurrentInventory
);

export const updateBusinessInventory = createAsyncThunk(
  "inventory/updateBusinessInventory",
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
