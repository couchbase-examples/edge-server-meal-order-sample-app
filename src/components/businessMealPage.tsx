/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../store";
import { fetchBusinessMeal } from "../store/mealSlice";
import { fetchBusinessInventory } from "../store/inventorySlice";
import { Card, CardContent, Typography } from "@mui/material"; // Material UI

function BusinessMealPage() {
  const dispatch = useAppDispatch();
  const mealState = useAppSelector((state) => state.meal);
  const inventoryState = useAppSelector((state) => state.inventory);

  useEffect(() => {
    dispatch(fetchBusinessMeal());
    dispatch(fetchBusinessInventory());
  }, [dispatch]);

  if (mealState.status === "loading" || inventoryState.status === "loading") {
    return <div>Loading...</div>;
  }

  if (!mealState.data || !inventoryState.data) {
    return <div>No data available</div>;
  }

  const getImagePath = (assetId: string) => {
    try {
      return new URL(`../assets/images/${assetId}.png`, import.meta.url).href;
    } catch {
      return new URL('../assets/images/default.png', import.meta.url).href;
    }
  };

  const { breakfast, lunch, dinner, dessert, beverage, alcohol } = mealState.data;
  const inventory = inventoryState.data;

  const renderMealCategory = (categoryName: string, items: any[]) => {
    // items are array of MealItems
    return (
      <div className="mb-4">
        <Typography variant="h5" className="font-bold">{categoryName.toUpperCase()}</Typography>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
          {items.map((item) => {
            // item is: { mealid, meal, description, assetid } 
            // Find inventory for this item
            // inventory[categoryName] is an array of objects e.g. [ { "businessmeal1": {...}}, { "businessmeal2": {...}} ]
            // item.mealid is something like "businessmeal1"
            // We find the corresponding object in inventoryState

            let matchedInventory: { startingInventory: number } | null = null as { startingInventory: number } | null;
            const invArray = (inventory as any)[categoryName] || [];
            // invArray = [{ businessmeal1: { seatsOrdered: {}, startingInventory: 10 } }, { businessmeal2: ... }...]
            invArray.forEach((invObj: any) => {
              if (Object.keys(invObj)[0] === item.mealid) {
                matchedInventory = invObj[item.mealid];
              }
            });

            return (
              <Card key={item.mealid} className="shadow-md">
                <CardContent>
                  <Typography variant="h6">{item.meal}</Typography>
                  <Typography variant="body2" className="text-gray-600">
                    {item.description}
                  </Typography>
                  <Typography variant="body2" color="secondary">
                    Available: {matchedInventory?.startingInventory ?? 0}
                  </Typography>
                  <img 
                    src={getImagePath(item.assetid)}
                    alt={item.meal}
                    className="w-full h-48 object-cover mt-2"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = getImagePath('default'); // Fallback to default image
                    }}
                  />
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="p-4">

      {renderMealCategory("breakfast", breakfast)}
      {renderMealCategory("lunch", lunch)}
      {renderMealCategory("dinner", dinner)}
      {renderMealCategory("dessert", dessert)}
      {renderMealCategory("beverage", beverage)}
      {renderMealCategory("alcohol", alcohol)}
    </div>
  );
}

export default BusinessMealPage;