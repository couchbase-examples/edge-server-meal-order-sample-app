import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { Card, useTheme } from "@mui/material";
import React, { useEffect, useState } from "react";

interface MealCardProps {
	meal: {
		meal: string;
		description: string;
		assetid: string;
		mealid: string;
	};
	isSelected: boolean;
	isOutOfStock: boolean;
	isOrderConfirmed: boolean;
	isEditing: boolean;
	onCardClick: () => void;
	getImagePath: (assetId: string) => string;
}

const MealCard: React.FC<MealCardProps> = React.memo(
	({
		meal,
		isSelected,
		isOutOfStock,
		isOrderConfirmed,
		isEditing,
		onCardClick,
		getImagePath,
	}) => {
		const theme = useTheme();
		const [isTransitioning, setIsTransitioning] = useState(false);
		const [showUnavailable, setShowUnavailable] = useState(isOutOfStock);

		// Handle smooth transitions when availability changes
		useEffect(() => {
			if (showUnavailable !== isOutOfStock) {
				setIsTransitioning(true);
				const timer = setTimeout(() => {
					setShowUnavailable(isOutOfStock);
					setIsTransitioning(false);
				}, 300);
				return () => clearTimeout(timer);
			}
		}, [isOutOfStock, showUnavailable]);

		// Determine if we should show the item as faded
		const shouldShowFaded = !isSelected && isOrderConfirmed && !isEditing;

		return (
			<Card
				className={`
        transition-all duration-300 ease-in-out relative overflow-hidden rounded-3xl shadow-lg
        flex items-stretch 2xl:aspect-square 2xl:flex-col
        ${showUnavailable ? "cursor-not-allowed hover:scale-100" : ""}
        ${
					!showUnavailable && !isSelected && (!isOrderConfirmed || isEditing)
						? "cursor-pointer hover:scale-104 hover:shadow-xl"
						: ""
				}
        ${
					!showUnavailable && isSelected
						? "cursor-pointer hover:scale-104 hover:shadow-xl"
						: ""
				}
        ${isSelected ? "border-4" : "border border-gray-200"}
        ${isTransitioning ? "animate-pulse" : ""}
      `}
				onClick={onCardClick}
				sx={{
					"&:active": {
						transform: "scale(0.98)",
					},
					touchAction: "manipulation",
					borderRadius: "24px",
					transition: "all 0.3s ease-in-out",
					...(isSelected && {
						borderColor: theme.palette.primary.main,
					}),
				}}
			>
				{/* Checkmark Icon for Selected Items */}
				{isSelected && !showUnavailable && (
					<div
						className={`
            absolute top-2 right-2 z-10 
            transition-all duration-300 ease-in-out
            ${isTransitioning ? "opacity-0 scale-95" : "opacity-100 scale-100"}
          `}
					>
						<CheckCircleIcon fontSize="small" color="primary" />
					</div>
				)}

				{/* Updated image container with self-stretch */}
				<div className="w-1/4 self-stretch 2xl:w-full 2xl:h-3/4">
					<img
						src={getImagePath(meal.assetid)}
						alt={meal.meal}
						className={`
            w-full h-full object-cover 
            transition-all duration-300 ease-in-out
            ${showUnavailable ? "opacity-70 [filter:grayscale(100%)]" : ""}
            ${shouldShowFaded ? "opacity-70" : ""}
            ${isTransitioning ? "scale-95" : "scale-100"}
          `}
						loading="lazy"
						onError={(e) => {
							const target = e.target as HTMLImageElement;
							target.src = getImagePath("default");
						}}
					/>
				</div>

				<div className="p-4 flex-1 2xl:h-1/5 flex flex-col justify-center">
					<h3 className="text-base sm:text-lg font-semibold mb-1 text-gray-700">
						{meal.meal}
					</h3>
					<p className="text-sm text-gray-600">{meal.description}</p>
					{showUnavailable && (
						<div
							className={`
              mt-2 text-red-500 font-semibold text-sm 
              transition-all duration-300 ease-in-out
              ${
								isTransitioning
									? "opacity-0 transform translate-y-2"
									: "opacity-100 transform translate-y-0"
							}
            `}
						>
							Currently Unavailable
						</div>
					)}
				</div>
			</Card>
		);
	},
	(prevProps, nextProps) => {
		// Only re-render if these specific props change
		return (
			prevProps.meal.meal === nextProps.meal.meal &&
			prevProps.isSelected === nextProps.isSelected &&
			prevProps.isOutOfStock === nextProps.isOutOfStock &&
			prevProps.isOrderConfirmed === nextProps.isOrderConfirmed &&
			prevProps.isEditing === nextProps.isEditing
		);
	}
);

export default MealCard;
