import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { Card, useTheme } from "@mui/material";

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

const MealCard: React.FC<MealCardProps> = ({
  meal,
  isSelected,
  isOutOfStock,
  isOrderConfirmed,
  isEditing,
  onCardClick,
  getImagePath,
}) => {
  const theme = useTheme();

  return (
    <Card
      className={`
        transition-transform transform relative overflow-hidden rounded-3xl shadow-lg
        2xl:aspect-square flex 2xl:flex-col
        ${isOutOfStock ? "cursor-not-allowed hover:scale-100 [filter:grayscale(100%)]" : ""}
        ${(isOrderConfirmed && !isEditing && !isSelected) ? "cursor-not-allowed hover:scale-100 [filter:grayscale(100%)]" : ""}
        ${(!isOutOfStock && (!isOrderConfirmed || isEditing)) ? "cursor-pointer hover:scale-105 hover:shadow-xl" : ""}
        ${isSelected ? "border-4" : "border border-gray-200"}
      `}
      onClick={onCardClick}
      sx={{
        "&:active": {
          transform: "scale(0.98)",
        },
        touchAction: "manipulation",
        borderRadius: "24px",
        ...(isSelected && {
          borderColor: theme.palette.primary.main
        })
      }}
    >
      {/* Checkmark Icon for Selected Items */}
      {isSelected && !isOutOfStock && (
        <div className="absolute top-2 right-2 z-10">
          <CheckCircleIcon fontSize="small" color="primary" />
        </div>
      )}

      <div className="h-full w-1/4 2xl:w-full 2xl:h-3/4">
        <img
          src={getImagePath(meal.assetid)}
          alt={meal.meal}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = getImagePath("default");
          }}
        />
      </div>

      <div className="p-4 flex-1 2xl:h-1/5 flex flex-col justify-center">
        <h3 className="text-base sm:text-lg font-semibold mb-1">
          {meal.meal}
        </h3>
        <p className="text-sm text-gray-600 line-clamp-2">
          {meal.description}
        </p>
        {isOutOfStock && (
          <div className="mt-2 text-red-500 font-semibold text-sm">
            Currently Unavailable
          </div>
        )}
      </div>
    </Card>
  );
};

export default MealCard;
