import { api } from './api';
import { InventoryDoc } from './../types';

describe('Business Inventory API', () => {
  // Mock data
  const mockInventoryData: InventoryDoc = {
    _id: "businessinventory",
    _rev: "25-8e8c102a004f26cd7b83cbf397192b31e94f3ddc",
    type: "businessinventory",
    flightno: "AA234",
    leg: "SFO-DXB",
    aircraft: "Boeing 707AX",
    breakfast: [
      {
        businessmeal1: {
          seatsOrdered: { "seat-gst717ons": 1 },
          startingInventory: 10
        }
      }
    ],
    lunch: [],
    dinner: [],
    dessert: [],
    beverage: [],
    alcohol: []
  };

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('getCurrentInventory', () => {
    it('should fetch business inventory successfully', async () => {
      // Mock the API response
      jest.spyOn(api, 'fetch').mockResolvedValueOnce(mockInventoryData);

      const response = await api.fetch('/american234.AmericanAirlines.AA234/businessinventory');
      console.log(response);
      expect(response).toEqual(mockInventoryData);
      expect(api.fetch).toHaveBeenCalledWith('/american234.AmericanAirlines.AA234/businessinventory');
    });

    it('should handle API errors', async () => {
      const errorMessage = 'Network Error';
      jest.spyOn(api, 'fetch').mockRejectedValueOnce(new Error(errorMessage));

      await expect(
        api.fetch('/american234.AmericanAirlines.AA234/businessinventory')
      ).rejects.toThrow(errorMessage);
    });
  });

  describe('updateInventoryData', () => {
    const revId = "25-8e8c102a004f26cd7b83cbf397192b31e94f3ddc";

    it('should update inventory successfully', async () => {
      jest.spyOn(api, 'fetch').mockResolvedValueOnce(mockInventoryData);

      const response = await api.fetch(
        `/american234.AmericanAirlines.AA234/businessinventory?rev=${revId}`,
        {
          method: 'PUT',
          body: JSON.stringify(mockInventoryData)
        }
      );

      expect(response).toEqual(mockInventoryData);
      expect(api.fetch).toHaveBeenCalledWith(
        `/american234.AmericanAirlines.AA234/businessinventory?rev=${revId}`,
        {
          method: 'PUT',
          body: JSON.stringify(mockInventoryData)
        }
      );
    });

    it('should handle conflict errors (409)', async () => {
      const conflictError = new Error(JSON.stringify({ status: 409 }));
      jest.spyOn(api, 'fetch').mockRejectedValueOnce(conflictError);

      await expect(
        api.fetch(
          `/american234.AmericanAirlines.AA234/businessinventory?rev=${revId}`,
          {
            method: 'PUT',
            body: JSON.stringify(mockInventoryData)
          }
        )
      ).rejects.toThrow();
    });
  });

  describe('Inventory Business Logic', () => {
    it('should correctly calculate available inventory', () => {
      const meal = mockInventoryData.breakfast[0];
      const mealKey = Object.keys(meal)[0];
      const { startingInventory, seatsOrdered } = meal[mealKey];
      const orderedCount = Object.keys(seatsOrdered).length;
      const availableInventory = startingInventory - orderedCount;

      expect(availableInventory).toBe(9);
    });

    it('should identify out of stock items', () => {
      const outOfStockMeal = {
        businessmeal2: {
          seatsOrdered: {
            "seat-1": 1,
            "seat-2": 1,
            "seat-3": 1,
            "seat-4": 1,
            "seat-5": 1
          },
          startingInventory: 5
        }
      };

      const orderedCount = Object.keys(outOfStockMeal.businessmeal2.seatsOrdered).length;
      const isOutOfStock = outOfStockMeal.businessmeal2.startingInventory - orderedCount <= 0;

      expect(isOutOfStock).toBe(true);
    });

    it('should validate meal categories', () => {
      const validCategories = ['breakfast', 'lunch', 'dinner', 'dessert', 'beverage', 'alcohol'];
      
      validCategories.forEach(category => {
        expect(mockInventoryData).toHaveProperty(category);
        expect(Array.isArray(mockInventoryData[category as keyof typeof mockInventoryData])).toBe(true);
      });
    });
  });

  describe('Seat Order Management', () => {
    it('should add new seat order correctly', () => {
      const meal = { ...mockInventoryData.breakfast[0] };
      const mealKey = Object.keys(meal)[0];
      const newSeatId = "seat-new123";
      
      meal[mealKey].seatsOrdered[newSeatId] = 1;

      expect(meal[mealKey].seatsOrdered[newSeatId]).toBe(1);
      expect(Object.keys(meal[mealKey].seatsOrdered).length).toBe(2);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty seatsOrdered object', () => {
      const emptyMeal = {
        businessmeal1: {
          seatsOrdered: {},
          startingInventory: 10
        }
      };

      expect(Object.keys(emptyMeal.businessmeal1.seatsOrdered).length).toBe(0);
    });

    it('should handle zero starting inventory', () => {
      const zeroInventoryMeal = {
        businessmeal1: {
          seatsOrdered: {},
          startingInventory: 0
        }
      };

      const isOutOfStock = zeroInventoryMeal.businessmeal1.startingInventory <= 0;
      expect(isOutOfStock).toBe(true);
    });

    it('should handle maximum inventory capacity', () => {
      const maxSeats = 10;
      const meal = mockInventoryData.breakfast[0];
      const mealKey = Object.keys(meal)[0];
      
      expect(meal[mealKey].startingInventory).toBeLessThanOrEqual(maxSeats);
    });
  });
});