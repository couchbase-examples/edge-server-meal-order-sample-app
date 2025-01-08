export interface MealItem {
    mealid: string;
    meal: string;
    description: string;
    assetid: string;
  }
  
  export interface MealCategory {
    breakfast: MealItem[];
    lunch: MealItem[];
    dinner: MealItem[];
    dessert: MealItem[];
    beverage: MealItem[];
    alcohol: MealItem[];
  }
  
  // Shape of the "businessmeal" document
  export interface BusinessMealDoc extends MealCategory {
    _id: string;
    _rev: string;
    type: string;         // "businessmeal"
    flightno: string;
    leg: string;
    aircraft: string;
  }
  
  // For "businessinventory" data
  export interface InventoryItem {
    // Example: {"businessmeal1": {seatsOrdered: {}, startingInventory: 10}}
    [mealId: string]: {
      seatsOrdered: Record<string, unknown>; // or define the shape if known
      startingInventory: number;
    };
  }
  
  export interface InventoryCategory {
    breakfast: InventoryItem[];
    lunch: InventoryItem[];
    dinner: InventoryItem[];
    dessert: InventoryItem[];
    beverage: InventoryItem[];
    alcohol: InventoryItem[];
  }
  
  // Shape of the "businessinventory" document
  export interface BusinessInventoryDoc extends InventoryCategory {
    _id: string;
    _rev: string;
    type: string;           // "businessinventory"
    flightno: string;
    leg: string;
    aircraft: string;
  }