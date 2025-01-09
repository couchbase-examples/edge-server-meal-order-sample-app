/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../store";
import { fetchBusinessMeal, addMeal, removeMeal } from "../store/mealSlice";
import { fetchBusinessInventory } from "../store/inventorySlice";
import { Card, CardContent, Typography } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

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
			return new URL(`../assets/images/default.png`, import.meta.url).href;
		}
	};

	const handleCardClick = (
		meal: string,
		price: number,
		mealId: string,
		inventoryCount: number
	) => {
		// If out of stock, do nothing
		if (inventoryCount <= 0) {
			return;
		}
		// If you only want to add once, check if it's already selected => toggle
		const isSelected = mealState.items.some((item) => item.name === meal);
		if (!isSelected) {
			dispatch(addMeal({ name: meal, price, quantity: 1 }));
		} else {
			dispatch(removeMeal(meal));
		}
	};

	const { breakfast, lunch, dinner, dessert, beverage, alcohol } =
		mealState.data!;
	const inventory = inventoryState.data!;

	const renderMealCategory = (categoryName: string, items: any[]) => {
		return (
			<div className="mb-4">
				<Typography variant="h5" className="font-bold">
					{categoryName.toUpperCase()}
				</Typography>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
					{items.map((item) => {
						let matchedInventory: { startingInventory: number } | undefined;
						const invArray = (inventory as any)[categoryName] || [];

						invArray.forEach((invObj: any) => {
							if (Object.keys(invObj)[0] === item.mealid) {
								matchedInventory = invObj[item.mealid];
							}
						});

						const available = matchedInventory?.startingInventory ?? 0;
						const isSelected = mealState.items.some(
							(cartItem) => cartItem.name === item.meal
						);

						// Generate dynamic CSS classes based on availability and selection
						const isOutOfStock = available <= 0;
						const cardClass = `
          shadow-md transition-transform transform relative
          ${
						isOutOfStock
							? "cursor-not-allowed grayscale hover:scale-100"
							: "cursor-pointer hover:scale-105"
					}
          ${isSelected ? "border-4 border-blue-500" : "border border-gray-200"}
        `;

						return (
							<Card
								key={item.mealid}
								className={cardClass}
								onClick={() =>
									handleCardClick(item.meal, 0, item.mealid, available)
								}
							>
								{/* Checkmark Icon for Selected Items */}
								{isSelected && !isOutOfStock && (
									<div className="absolute top-2 right-2">
										<CheckCircleIcon
											fontSize="small"
											className="text-green-500"
										/>
									</div>
								)}

								<CardContent>
									<Typography variant="h6">{item.meal}</Typography>
									<Typography variant="body2" className="text-gray-600">
										{item.description}
									</Typography>
									<Typography variant="body2" color="secondary">
										{/* Available: {available} */}
									</Typography>
									<img
										src={getImagePath(item.assetid)}
										alt={item.meal}
										className="w-full h-48 object-cover mt-2"
										onError={(e) => {
											const target = e.target as HTMLImageElement;
											target.src = getImagePath("default");
										}}
									/>
									{isOutOfStock && (
										<div className="mt-2 text-red-500 font-semibold">
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
