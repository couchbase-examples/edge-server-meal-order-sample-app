/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../store";
import { fetchBusinessMeal, addMeal, removeMeal } from "../store/mealSlice";
import { fetchBusinessInventory } from "../store/inventorySlice";
import { Typography } from "@mui/material";
import MealCard from "./MealCard";
import { useParams } from "react-router-dom";
import {
	addEconomyMeal,
	fetchEconomyMeal,
	removeEconomyMeal,
} from "../store/economyMealSlice";
import { fetchEconomyInventory } from "../store/economyInventorySlice";

function BusinessMealPage() {
	const [isOrderConfirmed, setIsOrderConfirmed] = useState(false);
	const [isEditing, setIsEditing] = useState(false);

	useEffect(() => {
		const handleOrderStateChange = (event: CustomEvent<{ isOrderConfirmed: boolean; isEditing: boolean }>) => {
			setIsOrderConfirmed(event.detail.isOrderConfirmed);
			setIsEditing(event.detail.isEditing);
		};

		window.addEventListener('orderStateChange', handleOrderStateChange as EventListener);
		return () => {
			window.removeEventListener('orderStateChange', handleOrderStateChange as EventListener);
		};
	}, []);
	const dispatch = useAppDispatch();
	const { seatClass } = useParams();
	// Determine which slice to use
	const isEconomy = seatClass === "economy";

	// If economy => economyMeal, else => businessMeal
	const mealState = useAppSelector((state) =>
		isEconomy ? state.economyMeal : state.businessMeal
	);
	const inventoryState = useAppSelector((state) =>
		isEconomy ? state.economyInventory : state.businessInventory
	);
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

	const getImagePath = (assetId: string) => {
		try {
			return new URL(`../assets/images/${assetId}.png`, import.meta.url).href;
		} catch {
			return new URL(`../assets/images/default.png`, import.meta.url).href;
		}
	};

	const handleCardClick = (
		mealName: string,
		categoryName: string,
		mealId: string,
		inventoryCount: number,
		isSelected: boolean
	) => {
		if ((inventoryCount <= 0 && !isSelected) || (isOrderConfirmed && !isEditing)) {
			return;
		}
		// If already selected, remove it; otherwise add it.
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
	};

	// From the data object
	const { breakfast, lunch, dinner, dessert, beverage, alcohol } =
		mealState.data;
	const inventory = inventoryState.data;

	// A helper to render each category
	const renderMealCategory = (categoryName: string, items: any[]) => {
		return (
			<div className="w-full max-w-[2000px] mx-auto px-4">
				<Typography variant="h5" className="font-bold px-2 pt-2">
					{categoryName.toUpperCase()}
				</Typography>
				<div className="flex flex-col 2xl:grid 2xl:grid-cols-3 gap-3 sm:gap-4 mt-2">
					{items.map((item) => {
            const matchedInventory = (inventory as any)[categoryName]?.find(
              (invObj: any) => Object.keys(invObj)[0] === item.mealid
            )?.[item.mealid] || { startingInventory: 0, seatsOrdered: {} };

            const seatId = localStorage.getItem('seatId') || '';
            const isSelected = mealState.items.some(
              (cartItem) => cartItem.name === item.meal
            );

            const orderedCount = Object.keys(matchedInventory.seatsOrdered)
              .filter(id => id !== seatId).length;
            const totalAvailable = matchedInventory.startingInventory - orderedCount;
            const isOutOfStock = totalAvailable <= 0 && !isSelected;

            return (
              <MealCard
                key={item.mealid}
                meal={item}
                isSelected={isSelected}
                isOutOfStock={isOutOfStock}
                isOrderConfirmed={isOrderConfirmed}
                isEditing={isEditing}
                onCardClick={() => handleCardClick(
                  item.meal,
                  categoryName,
                  item.mealid,
                  totalAvailable,
                  isSelected
                )}
                getImagePath={getImagePath}
              />
						);
					})}
				</div>
			</div>
		);
	};

	return (
		<div className="p-2 sm:p-4">
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
