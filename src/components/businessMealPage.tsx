/* eslint-disable @typescript-eslint/no-explicit-any */
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import { Typography } from "@mui/material";
import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store";
import { fetchEconomyInventory } from "../store/economyInventorySlice";
import {
  addEconomyMeal,
  fetchEconomyMeal,
  removeEconomyMeal,
} from "../store/economyMealSlice";
import useInventoryChanges from "../hooks/useInventoryChanges";
import { fetchBusinessInventory } from "../store/inventorySlice";
import { addMeal, fetchBusinessMeal, removeMeal } from "../store/mealSlice";
import MealCard from "./MealCard";
import { toSentenceCase } from "../utils/formatText";

function BusinessMealPage() {
  const [isOrderConfirmed, setIsOrderConfirmed] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [updateKey, setUpdateKey] = useState(0); // Force re-render key
  const [expandedCategories, setExpandedCategories] = useState<
    Record<string, boolean>
  >({
    breakfast: true,
    lunch: true,
    dinner: true,
    dessert: true,
    beverage: true,
    alcohol: true,
  });

  const dispatch = useAppDispatch();
  const { seatClass } = useParams();
  const isEconomy = seatClass === "economy";
  
  // Call hook but don't use the return value since we're handling updates through Redux
  useInventoryChanges(isEconomy);

  const mealState = useAppSelector((state) =>
    isEconomy ? state.economyMeal : state.businessMeal
  );
  const inventoryState = useAppSelector((state) =>
    isEconomy ? state.economyInventory : state.businessInventory
  );

  const getImagePath = useCallback((assetId: string) => {
    try {
      return new URL(`../assets/images/${assetId}.png`, import.meta.url).href;
    } catch {
      return new URL(`../assets/images/default.png`, import.meta.url).href;
    }
  }, []);

  const handleCardClick = useCallback((
    mealName: string,
    categoryName: string,
    mealId: string,
    inventoryCount: number,
    isSelected: boolean
  ) => {
    if (
      (inventoryCount <= 0 && !isSelected) ||
      (isOrderConfirmed && !isEditing)
    ) {
      return;
    }
    if (isSelected) {
      if (isEconomy) dispatch(removeEconomyMeal(mealName));
      else dispatch(removeMeal(mealName));
    } else {
      if (isEconomy)
        dispatch(
          addEconomyMeal({ name: mealName, category: categoryName, mealId })
        );
      else
        dispatch(addMeal({ name: mealName, category: categoryName, mealId }));
    }
  }, [dispatch, isEconomy, isOrderConfirmed, isEditing]);

  // Calculate availability for a meal item
  const calculateAvailability = useCallback((categoryName: string, mealId: string, inventory: any) => {
    const matchedInventory = inventory[categoryName]?.find(
      (invObj: any) => Object.keys(invObj)[0] === mealId
    )?.[mealId];

    if (!matchedInventory) return { totalAvailable: 0, isOutOfStock: true };

    const seatId = localStorage.getItem("seatId") || "";
    const seatsOrdered = matchedInventory.seatsOrdered || {};
    
    // Count only active orders (non-null values)
    const orderedCount = Object.entries(seatsOrdered)
      .filter(([, value]) => value !== null && value !== undefined)
      .length;
    
    const totalAvailable = matchedInventory.startingInventory - orderedCount;
    
    // An item is out of stock only if:
    // 1. Total available is <= 0 AND
    // 2. This seat hasn't ordered it OR their order was removed (null value)
    const isOutOfStock = totalAvailable <= 0 && (!seatsOrdered[seatId] || seatsOrdered[seatId] === null);

    return { 
      totalAvailable: isOutOfStock ? 0 : Math.max(totalAvailable, 0), 
      isOutOfStock 
    };
  }, []);

  const toggleCategory = useCallback((category: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  }, []);

  // A helper to render each category
  const renderMealCategory = useCallback((categoryName: string, items: any[], inventory: any) => {
    return (
      <div className="w-full max-w-[2000px] mx-auto mb-4" key={`${categoryName}-${updateKey}`}>
        <div
          className="flex items-center justify-between cursor-pointer py-2"
          onClick={() => toggleCategory(categoryName)}
        >
          <div className="flex items-center gap-2">
            <Typography variant="h5" className="font-bold">
              {toSentenceCase(categoryName)}
            </Typography>
            {expandedCategories[categoryName] ? (
              <KeyboardArrowUpIcon className="text-gray-600" />
            ) : (
              <KeyboardArrowDownIcon className="text-gray-600" />
            )}
          </div>
        </div>
        <div
          className={`
            flex flex-col 2xl:grid 2xl:grid-cols-3 gap-3 sm:gap-4
            transition-[max-height,padding] duration-500 ease-in-out overflow-hidden
            ${
              expandedCategories[categoryName]
                ? "max-h-[2000px] pt-4 pb-12"
                : "max-h-0 pt-0 pb-0"
            }
          `}
        >
          {items.map((item) => {
            const { totalAvailable, isOutOfStock } = calculateAvailability(
              categoryName,
              item.mealid,
              inventory
            );

            const isSelected = mealState.items.some(
              (cartItem) => cartItem.name === item.meal
            );

            return (
              <MealCard
                key={`${item.mealid}-${updateKey}`}
                meal={item}
                isSelected={isSelected}
                isOutOfStock={isOutOfStock}
                isOrderConfirmed={isOrderConfirmed}
                isEditing={isEditing}
                onCardClick={() =>
                  handleCardClick(
                    item.meal,
                    categoryName,
                    item.mealid,
                    totalAvailable,
                    isSelected
                  )
                }
                getImagePath={getImagePath}
              />
            );
          })}
        </div>
      </div>
    );
  }, [updateKey, expandedCategories, mealState.items, isOrderConfirmed, isEditing, calculateAvailability, handleCardClick, toggleCategory, getImagePath]);

  useEffect(() => {
    const handleOrderStateChange = (
      event: CustomEvent<{ isOrderConfirmed: boolean; isEditing: boolean }>
    ) => {
      setIsOrderConfirmed(event.detail.isOrderConfirmed);
      setIsEditing(event.detail.isEditing);
    };

    window.addEventListener(
      "orderStateChange",
      handleOrderStateChange as EventListener
    );
    return () => {
      window.removeEventListener(
        "orderStateChange",
        handleOrderStateChange as EventListener
      );
    };
  }, []);

  // Force update when inventory changes
  useEffect(() => {
    if (inventoryState.data) {
      setUpdateKey(prev => prev + 1);
    }
  }, [inventoryState.data]);

  useEffect(() => {
    if (isEconomy) {
      dispatch(fetchEconomyMeal());
      dispatch(fetchEconomyInventory());
    } else {
      dispatch(fetchBusinessMeal());
      dispatch(fetchBusinessInventory());
    }
  }, [dispatch, isEconomy]);

  if (mealState.status === "loading" || inventoryState.status === "loading") {
    return <div>Loading...</div>;
  }

  if (!mealState.data || !inventoryState.data) {
    return <div>No data available</div>;
  }

  const { breakfast, lunch, dinner, dessert, beverage, alcohol } =
    mealState.data;
  const inventory = inventoryState.data;

  return (
    <div>
      {renderMealCategory("breakfast", breakfast, inventory)}
      {renderMealCategory("lunch", lunch, inventory)}
      {renderMealCategory("dinner", dinner, inventory)}
      {renderMealCategory("dessert", dessert, inventory)}
      {renderMealCategory("beverage", beverage, inventory)}
      {renderMealCategory("alcohol", alcohol, inventory)}
    </div>
  );
}

export default BusinessMealPage;
