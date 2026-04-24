"use client";
import { useState } from "react";
import DescribeMeal from "@/components/DescribeMeal";
import DailyTotals from "@/components/DailyTotals";

export default function Home() {
  const [collapsedMeals, setCollapsedMeals] = useState({});

  const toggleMeal = (meal) => {
    setCollapsedMeals(prev => ({ ...prev, [meal]: !prev[meal] }));
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 p-8">
      <main className="max-w-7xl mx-auto">
        <DailyTotals />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* Breakfast Column */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b-2 border-orange-100 dark:border-zinc-800 py-4 top-0 bg-zinc-50 dark:bg-zinc-950 z-10">
              <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-600">
                BREAKFAST
              </h1>
              <button 
                onClick={() => toggleMeal("breakfast")}
                className="px-3 py-1 text-sm font-semibold rounded bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 hover:bg-orange-200 dark:hover:bg-orange-800/40 transition-colors"
              >
                {collapsedMeals["breakfast"] ? "Show" : "Hide"}
              </button>
            </div>
            <DescribeMeal meal_time={"breakfast"} isMealCollapsed={collapsedMeals["breakfast"]} />
          </div>

          {/* Lunch Column */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b-2 border-green-100 dark:border-zinc-800 py-4 top-0 bg-zinc-50 dark:bg-zinc-950 z-10">
              <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">
                LUNCH
              </h1>
              <button 
                onClick={() => toggleMeal("lunch")}
                className="px-3 py-1 text-sm font-semibold rounded bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-800/40 transition-colors"
              >
                {collapsedMeals["lunch"] ? "Show" : "Hide"}
              </button>
            </div>
            <DescribeMeal meal_time={"lunch"} isMealCollapsed={collapsedMeals["lunch"]} />
          </div>

          {/* Dinner Column */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b-2 border-blue-100 dark:border-zinc-800 py-4 top-0 bg-zinc-50 dark:bg-zinc-950 z-10">
              <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-600">
                DINNER
              </h1>
              <button 
                onClick={() => toggleMeal("dinner")}
                className="px-3 py-1 text-sm font-semibold rounded bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800/40 transition-colors"
              >
                {collapsedMeals["dinner"] ? "Show" : "Hide"}
              </button>
            </div>
            <DescribeMeal meal_time={"dinner"} isMealCollapsed={collapsedMeals["dinner"]} />
          </div>

        </div>
      </main>
    </div>
  );
}
