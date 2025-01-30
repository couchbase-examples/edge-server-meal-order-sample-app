/* eslint-disable @typescript-eslint/no-explicit-any */
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { BusinessInventoryDoc, InventoryItem } from "../types";
import { api } from '../services/api';
import { store } from ".";
import { removeEconomyMeal } from "./economyMealSlice";
import { MEAL_CATEGORIES, isValidCategory } from "../constants";

interface OutOfStockItem {
  id: string;
  name: string;
  category: string;
}

interface EconomyInventoryState {
  data: BusinessInventoryDoc | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  outOfStockItems: OutOfStockItem[]; // NEW
}

const initialState: EconomyInventoryState = {
  data: null,
  status: "idle",
  error: null,
  outOfStockItems: [], // NEW
}

interface UpdateOrderPayload {
  items: Array<{
    id: string;
    category: string;
    name: string;
  }>;
  seatUserId: string;
}

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
    const seatId = localStorage.getItem("seatId") || "";
    
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
    // 1) Helper to remove old orders + add new ones for current user
    const applyOrdersToInventory = (
      doc: BusinessInventoryDoc,
      seatUserId: string,
      items: Array<{ id: string; category: string }>
    ): BusinessInventoryDoc => {
      const updatedDoc = { ...doc };

      // Remove existing orders for this user from ALL categories
      MEAL_CATEGORIES.forEach((category) => {
        updatedDoc[category] = updatedDoc[category].map((inventoryItem: InventoryItem) => {
          const mealKey = Object.keys(inventoryItem)[0];
          if (
            inventoryItem[mealKey].seatsOrdered &&
            inventoryItem[mealKey].seatsOrdered[seatUserId]
          ) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { [seatUserId]: _, ...rest } = inventoryItem[mealKey].seatsOrdered;
            return {
              [mealKey]: {
                ...inventoryItem[mealKey],
                seatsOrdered: rest,
              },
            };
          }
          return inventoryItem;
        });
      });

      // Add new orders
      items.forEach((item) => {
        const category = item.category.toLowerCase();
        if (isValidCategory(category)) {
          const categoryItems = updatedDoc[category];
          const mealItem = categoryItems.find(
            (mi: InventoryItem) => Object.keys(mi)[0] === item.id
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

    // 2) Helper to detect out-of-stock items
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

    // 3) The main logic with indefinite retry on 409 conflicts
    try {
      while (true) {
        try {
          // a) fetch current doc
          const currentDoc = await getCurrentInventory();

          // b) check for out-of-stock items
          const outOfStock = findOutOfStockItems(currentDoc, payload.items);
          if (outOfStock.length > 0) {
            return rejectWithValue({
              message: "Some items are already out of stock",
              outOfStockItems: outOfStock,
            });
          }

          // c) apply orders
          const updatedInventory = applyOrdersToInventory(
            currentDoc,
            payload.seatUserId,
            payload.items
          );

          // d) attempt to save
          await updateInventoryData(updatedInventory, currentDoc._rev);

          // e) if successful, re-fetch and return
          return getCurrentInventory();
        } catch (error: any) {
          // If conflict, loop again
          const parsed = JSON.parse(error.message);
          if (parsed.status === 409) {
            console.log("Conflict detected, retrying...");
            continue;
          } else {
            return rejectWithValue(
              error instanceof Error ? error.message : "Failed to update economy inventory"
            );
          }
        }
      }
    } catch (err) {
      return rejectWithValue(
        err instanceof Error ? err.message : "Failed to update economy inventory"
      );
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
