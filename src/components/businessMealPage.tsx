/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../store";
import { fetchBusinessMeal, addMeal, removeMeal } from "../store/mealSlice";
import { fetchBusinessInventory } from "../store/inventorySlice";
import { Card, CardContent, Typography, useTheme } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
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
	const theme = useTheme();

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
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mt-2">
					{items.map((item) => {
						let matchedInventory: {
							startingInventory: number;
							seatsOrdered: Record<string, number>;
						} = {
							startingInventory: 0,
							seatsOrdered: {},
						};
						const invArray = (inventory as any)[categoryName] || [];
						invArray.forEach((invObj: any) => {
							if (Object.keys(invObj)[0] === item.mealid) {
								matchedInventory = invObj[item.mealid];
							}
						});

						const seatId = localStorage.getItem('seatId') || '';
						const isSelected = mealState.items.some(
							(cartItem) => cartItem.name === item.meal
						);

						// Calculate number of orders excluding current user's selection
						const orderedCount = Object.keys(
							matchedInventory?.seatsOrdered || {}
						).filter(id => id !== seatId).length;

						// Calculate available count
						const totalAvailable = (matchedInventory?.startingInventory || 0) - orderedCount;
						
						// Item is out of stock if no more available AND user hasn't already selected it
						const isOutOfStock = totalAvailable <= 0 && !isSelected;

						const cardClass = `
              shadow-md transition-transform transform relative
              ${
								isOutOfStock
									? "cursor-not-allowed grayscale hover:scale-100"
									: "cursor-pointer hover:scale-105"
							}
              ${
								isSelected
									? "border-4 border-green-500"
									: "border border-gray-200"
							}
            `;

						return (
							<Card
								key={item.mealid}
								className={`${cardClass} ${(isOrderConfirmed && !isEditing) ? 'pointer-events-none opacity-50' : ''}`}
								style={{
									// If selected, the border color is the theme's primary color
									borderColor: isSelected
										? theme.palette.primary.main
										: "rgb(229 231 235)",
								}}
								onClick={() =>
									handleCardClick(
										item.meal,
										categoryName,
										item.mealid,
										totalAvailable,
										isSelected
									)
								}
								sx={{
									"&:active": {
										transform: "scale(0.98)",
									},
									touchAction: "manipulation",
								}}
							>
								{/* Checkmark Icon for Selected Items */}
								{isSelected && !isOutOfStock && (
									<div className="absolute top-2 right-2">
										<CheckCircleIcon fontSize="small" color="primary" />
									</div>
								)}
								<CardContent className="p-3 sm:p-4">
									<Typography variant="h6" className="text-base sm:text-lg">
										{item.meal}
									</Typography>
									<Typography variant="body2" className="text-sm text-gray-600">
										{item.description}
									</Typography>
									<div className="aspect-w-16 aspect-h-9 mt-2">
										<img
											src={getImagePath(item.assetid)}
											alt={item.meal}
											className="w-full h-full object-cover rounded"
											loading="lazy"
											onError={(e) => {
												const target = e.target as HTMLImageElement;
												target.src = getImagePath("default");
											}}
										/>
									</div>
									{isOutOfStock && (
										<div className="mt-2 text-red-500 font-semibold text-sm">
											Currently Unavailable
										</div>
									)}
								</CardContent>
							</Card>
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
