/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../store";
import { fetchBusinessMeal, addMeal, removeMeal } from "../store/mealSlice";
import { fetchBusinessInventory } from "../store/inventorySlice";
import { Card, CardContent, Typography } from "@mui/material";

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

	const handleCardClick = (
		meal: string,
		price: number,
		mealId: string,
		inventoryCount: number
	) => {
		if (inventoryCount <= 0) {
			alert("This meal is out of stock.");
			return;
		}
		// If you only want to add once, check if it's already selected.
		// If you want to toggle, you might also remove if it's already selected.
		const isSelected = mealState.items.some((item) => item.name === meal);
		if (!isSelected) {
			// Dispatch addMeal only if not already in cart
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
						let matchedInventory: { startingInventory: number } | undefined =
							undefined as { startingInventory: number } | undefined;
						const invArray = (inventory as any)[categoryName] || [];

						invArray.forEach((invObj: any) => {
							if (Object.keys(invObj)[0] === item.mealid) {
								matchedInventory = invObj[item.mealid];
							}
						});

						const available = matchedInventory?.startingInventory ?? 0;

						// Check if this meal is in the cart (already selected)
						const isSelected = mealState.items.some(
							(cartItem) => cartItem.name === item.meal
						);

						return (
							<Card
								key={item.mealid}
								// Conditionally apply extra styles if selected
								className={`shadow-md cursor-pointer transition-transform transform hover:scale-105 
              ${
								isSelected
									? "border-4 border-blue-500" // or your highlight color
									: "border border-gray-200"
							}`}
								onClick={() =>
									handleCardClick(item.meal, 12, item.mealid, available)
								}
							>
								<CardContent>
									<Typography variant="h6">{item.meal}</Typography>
									<Typography variant="body2" className="text-gray-600">
										{item.description}
									</Typography>
									<Typography variant="body2" color="secondary">
										Available: {available}
									</Typography>
									<img
										src={getImagePath(item.assetid)}
										alt={item.meal}
										className="w-full h-48 object-cover mt-2"
										onError={(e) => {
											const target = e.target as HTMLImageElement;
											target.src = getImagePath("default"); // fallback for missing images
										}}
									/>
									{/* Optional visual cue if selected */}
									{isSelected && (
										<div className="mt-2 text-green-600 font-semibold">
											Selected!
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
			<Typography variant="h4" className="mb-4">
				Business Meal Menu
			</Typography>

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
