export const MEAL_CATEGORIES = [
  'breakfast',
  'lunch',
  'dinner',
  'dessert',
  'beverage',
  'alcohol'
] as const;

export type MealCategory = typeof MEAL_CATEGORIES[number];

// Helper function to check if a string is a valid meal category
export const isValidCategory = (category: string): category is MealCategory => {
  return MEAL_CATEGORIES.includes(category as MealCategory);
};
