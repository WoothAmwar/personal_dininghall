"use client";
import { useNutritionState } from "@/lib/NutritionState";

export default function DailyTotals() {
  const state = useNutritionState();

  let totalCalories = 0;
  let totalProtein = 0;
  let totalCarb = 0;
  let totalFat = 0;

  if (state && state.meals) {
    Object.values(state.meals).forEach(meal => {
      Object.values(meal).forEach(item => {
        const servings = item.servings;
        totalCalories += item.nutrition.calories * servings;
        totalProtein += item.nutrition.protein * servings;
        totalCarb += item.nutrition.carb * servings;
        totalFat += item.nutrition.fat * servings;
      });
    });
  }

  return (
    <div className="bg-white dark:bg-zinc-900 shadow-md rounded-xl p-6 mb-8 border border-zinc-200 dark:border-zinc-800">
      <h2 className="text-2xl font-bold mb-4 text-center text-zinc-800 dark:text-zinc-200">Daily Totals</h2>
      <div className="flex flex-wrap justify-center gap-6 text-lg font-semibold">
        <div className="flex flex-col items-center">
          <span className="text-zinc-500 dark:text-zinc-400 text-sm uppercase tracking-wider">Calories</span>
          <span className="text-orange-500 dark:text-orange-400 text-3xl">{Math.round(totalCalories)}</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-zinc-500 dark:text-zinc-400 text-sm uppercase tracking-wider">Protein</span>
          <span className="text-blue-500 dark:text-blue-400 text-3xl">{Math.round(totalProtein)}g</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-zinc-500 dark:text-zinc-400 text-sm uppercase tracking-wider">Carbs</span>
          <span className="text-green-500 dark:text-green-400 text-3xl">{Math.round(totalCarb)}g</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-zinc-500 dark:text-zinc-400 text-sm uppercase tracking-wider">Fat</span>
          <span className="text-red-500 dark:text-red-400 text-3xl">{Math.round(totalFat)}g</span>
        </div>
      </div>
    </div>
  );
}
