import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { BusinessInventoryDoc } from "../types";

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
    try {
      const response = await fetch(
        "/american234.AmericanAirlines.AA234/businessinventory",
        {
          headers: {
            "Authorization": "Basic " + btoa("seatuser:password"),
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || 'Failed to fetch businessinventory data');
      }

      return await response.json() as BusinessInventoryDoc;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to fetch businessinventory data: ${error.message}`);
      }
      throw new Error('An unknown error occurred');
    }
  }
);

interface UpdateInventoryArgs {
  mealId: string;
  seatNumber: string;
}

export const updateBusinessInventory = createAsyncThunk<
  BusinessInventoryDoc,
  UpdateInventoryArgs
>(
  "inventory/updateBusinessInventory",
  async (args) => {
    try {
      const { mealId, seatNumber } = args;
      const response = await fetch(
        "/american234.AmericanAirlines.AA234/businessinventory",
        {
          method: "PUT",
          headers: {
            "Authorization": "Basic " + btoa("seatuser:password"),
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            mealId,
            seatNumber,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || 'Failed to update businessinventory data');
      }

      return await response.json() as BusinessInventoryDoc;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to update businessinventory data: ${error.message}`);
      }
      throw new Error('An unknown error occurred');
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
      .addCase(
        fetchBusinessInventory.fulfilled,
        (state, action: PayloadAction<BusinessInventoryDoc>) => {
          state.status = "succeeded";
          state.data = action.payload;
          state.error = null;
        }
      )
      .addCase(fetchBusinessInventory.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message ?? "Something went wrong";
      })
      .addCase(updateBusinessInventory.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(
        updateBusinessInventory.fulfilled,
        (state, action: PayloadAction<BusinessInventoryDoc>) => {
          state.status = "succeeded";
          state.data = action.payload;
          state.error = null;
        }
      )
      .addCase(updateBusinessInventory.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message ?? "Something went wrong";
      });
  },
});

export default inventorySlice.reducer;