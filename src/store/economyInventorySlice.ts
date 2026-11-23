import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { InventoryDoc, InventoryItem, InventoryState, OutOfStockItem, UpdateOrderPayload } from "../types";
import { store } from ".";
import { removeEconomyMeal } from "./economyMealSlice";
import { isValidCategory } from "../constants";
import { edgeInventoryDocStore, placeOrderWithConflictRetry } from "./inventoryOrders";

const initialState: InventoryState = {
  data: null,
  status: "idle",
  error: null,
  outOfStockItems: [],
}
// API helper functions
const inventoryDoc = edgeInventoryDocStore("economyinventory");

export const fetchEconomyInventory = createAsyncThunk<InventoryDoc>(
  "economyInventory/fetchEconomyInventory",
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
  "economyInventory/updatePartialInventory",
  async (updates: PartialInventoryUpdate[], { getState, dispatch }) => {
    const state = getState() as ReturnType<typeof store.getState>;
    const currentInventory = state.economyInventory.data;
    
    if (!currentInventory) return null;

    const updatedInventory = { ...currentInventory };
    const seatId = localStorage.getItem("cbmd:seatId") || "";
    
    // Track categories that have changes
    const changedCategories = new Set<string>();
    
    // First pass: collect all categories that need updating
    updates.forEach(update => {
      if (isValidCategory(update.category)) {
        changedCategories.add(update.category);
      }
    });

    // Second pass: update all items in changed categories
    changedCategories.forEach(category => {
      if (isValidCategory(category)) {
        updatedInventory[category] = updatedInventory[category].map((item: InventoryItem) => {
          const mealKey = Object.keys(item)[0];
          const update = updates.find(u => u.mealId === mealKey);
          
          if (update) {
            // Count active orders
            const orderedCount = Object.keys(update.seatsOrdered).length;
            const isNowOutOfStock = update.startingInventory - orderedCount <= 0;
            
            // Check if this item is in the current user's cart and should be removed
            if (isNowOutOfStock) {
              const cartItems = state.economyMeal.items;
              const itemInCart = cartItems.find(item => item.mealId === mealKey);
              if (itemInCart && !update.seatsOrdered[seatId]) {
                dispatch(removeEconomyMeal(itemInCart.name));
              }
            }

            return {
              [mealKey]: {
                seatsOrdered: update.seatsOrdered,
                startingInventory: update.startingInventory
              }
            };
          }
          return item;
        });
      }
    });

    return updatedInventory;
  }
);

export const updateEconomyInventory = createAsyncThunk(
  "economyInventory/updateEconomyInventory",
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
        return rejectWithValue(outcome.message ?? "Failed to update economy inventory");
    }
  }
);

const economyInventorySlice = createSlice({
  name: "economyInventory",
  initialState,
  reducers: {
    // Clear outOfStock array and error
    clearOutOfStockItems: (state) => {
      state.outOfStockItems = [];
      state.error = null;
    },
  },
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
        // If we had a custom payload from the thunk with outOfStock info:
        if (action.payload && typeof action.payload === "object") {
          const { message, outOfStockItems } = action.payload as {
            message?: string;
            outOfStockItems?: OutOfStockItem[];
          };
          state.error = message ?? "Failed to update economy inventory";
          state.outOfStockItems = outOfStockItems ?? [];
        } else {
          // Generic fallback
          state.error = action.error.message ?? "Failed to update economy inventory";
          state.outOfStockItems = [];
        }
      })
      .addCase(updatePartialInventory.fulfilled, (state, action) => {
        if (action.payload) {
          state.data = action.payload;
        }
      });
  },
});

export const { clearOutOfStockItems } = economyInventorySlice.actions;

export default economyInventorySlice.reducer;
