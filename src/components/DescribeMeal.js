"use client"
import { useEffect, useState } from "react";
import { useNutritionState, updateServings } from "@/lib/NutritionState";

function GetMealData(meal_time) {
  const [mealData, setMealData] = useState(null);
  const [error, setError] = useState(null);

  const today = new Date();
  const formattedDate = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;

  useEffect(() => {
    fetch(`/api/menu?url=https://new.dineoncampus.com/uchicago/whats-on-the-menu/woodlawn-dining-commons/${formattedDate}/${meal_time}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setMealData(data);
        }
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        setError(err.message);
      });
  }, []);

  return { mealData, error };
}

const SKIP_STATION_KEYWORDS = [
  "breakfast cereal",
  "omelet",
  "sweet shoppe",
  "rooted",
  "composed salads",
  "sides",
  "crave global",
  "toppings",
  "cucina pizza",
  "cucina pasta",
  "fresh 52-soups"
];

function filterOut(arr, excludeKeywords) {
  if (!Array.isArray(arr) || !Array.isArray(excludeKeywords)) {
    throw new TypeError("Both arguments must be arrays.");
  }
  return arr.filter(item => {
    const lowerName = item.name.toLowerCase();
    
    // Exception to allow this specific station to show up even though it contains "sides"
    if (lowerName === "pure eats entrée and sides" || lowerName === "pure eats entree and sides") {
      return true;
    }
    
    return !excludeKeywords.some(keyword => lowerName.includes(keyword));
  });
}

export default function DescribeMeal({ meal_time, isMealCollapsed }) {
  const { mealData, error } = GetMealData(meal_time);
  const state = useNutritionState();
  const [collapsedStations, setCollapsedStations] = useState({});

  const toggleStation = (stationName) => {
    setCollapsedStations(prev => ({ ...prev, [stationName]: !prev[stationName] }));
  };

  if (error) {
    return null; // Suppress error display to keep UI clean
  }

  if (!mealData) {
    return <div>Loading...</div>;
  }

  const { sections } = mealData;
  const mealState = state?.meals?.[meal_time] || {};

  let mealCals = 0, mealPro = 0, mealCarb = 0, mealFat = 0;
  Object.values(mealState).forEach(i => {
    mealCals += i.nutrition.calories * i.servings;
    mealPro += i.nutrition.protein * i.servings;
    mealCarb += i.nutrition.carb * i.servings;
    mealFat += i.nutrition.fat * i.servings;
  });

  return (
    <div className="space-y-6">
      <div className="flex gap-4 mb-4 text-sm font-semibold bg-zinc-100 dark:bg-zinc-800 p-3 rounded-lg border border-zinc-200 dark:border-zinc-700">
        <div className="flex flex-col">
          <span className="text-zinc-500 dark:text-zinc-400 text-xs uppercase">Calories</span>
          <span className="text-orange-500 dark:text-orange-400">{Math.round(mealCals)}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-zinc-500 dark:text-zinc-400 text-xs uppercase">Protein</span>
          <span className="text-blue-500 dark:text-blue-400">{Math.round(mealPro)}g</span>
        </div>
        <div className="flex flex-col">
          <span className="text-zinc-500 dark:text-zinc-400 text-xs uppercase">Carbs</span>
          <span className="text-green-500 dark:text-green-400">{Math.round(mealCarb)}g</span>
        </div>
        <div className="flex flex-col">
          <span className="text-zinc-500 dark:text-zinc-400 text-xs uppercase">Fat</span>
          <span className="text-red-500 dark:text-red-400">{Math.round(mealFat)}g</span>
        </div>
      </div>
      {!isMealCollapsed && filterOut(sections, SKIP_STATION_KEYWORDS).map((section, s_idx) => {
        const isCollapsed = collapsedStations[section.name];
        return (
        <div key={s_idx}>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-2xl font-bold text-amber-600 dark:text-amber-200">{section.name}</h3>
            <button 
              onClick={() => toggleStation(section.name)}
              className="px-2 py-1 text-xs font-medium rounded bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-800/40 transition-colors"
            >
              {isCollapsed ? "Show" : "Hide"}
            </button>
          </div>
          {!isCollapsed && (
            <ul className="space-y-2">
              {section.items.map((item, i_idx) => (
                <li key={i_idx} className="flex flex-col border-b border-zinc-200 dark:border-zinc-800 pb-2 mb-2">
                  <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between">
                    <span className="font-medium text-zinc-900 dark:text-zinc-100">{item.name}</span>
                    <div className="text-sm text-zinc-500 dark:text-zinc-400 flex gap-4">
                      {item.portion && <span>{item.portion}</span>}
                      {item.calories && <span>{item.calories} cal</span>}
                    </div>
                  </div>
                  {item.nutrition && item.nutrition.length > 0 && (() => {
                    const prot = item.nutrition.find(n => n.name === "Protein (g)");
                    const carb = item.nutrition.find(n => n.name === "Total Carbohydrates (g)");
                    const sug = item.nutrition.find(n => n.name === "Sugar (g)");
                    const fat = item.nutrition.find(n => n.name === "Total Fat (g)");
                    
                    const protVal = parseFloat(prot?.value?.replace(/[^0-9.]/g, '')) || 0;
                    const carbVal = parseFloat(carb?.value?.replace(/[^0-9.]/g, '')) || 0;
                    const fatVal = parseFloat(fat?.value?.replace(/[^0-9.]/g, '')) || 0;
                    const calsVal = parseFloat(String(item.calories).replace(/[^0-9.]/g, '')) || 0;

                    const nutritionData = { calories: calsVal, protein: protVal, carb: carbVal, fat: fatVal };
                    const currentServings = state?.meals?.[meal_time]?.[item.name]?.servings || 0;

                    return (
                      <div className="flex flex-col sm:flex-row gap-2 mt-1 justify-between items-start sm:items-center">
                        <div className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800 rounded-md p-1">
                          <button 
                            onClick={() => updateServings(meal_time, item.name, Math.max(0, currentServings - 0.5), nutritionData)}
                            className="w-6 h-6 flex items-center justify-center bg-zinc-200 dark:bg-zinc-700 rounded text-zinc-700 dark:text-zinc-200 hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors"
                          >
                            -
                          </button>
                          <span className="text-sm font-medium w-6 text-center">{currentServings}</span>
                          <button 
                            onClick={() => updateServings(meal_time, item.name, currentServings + 0.5, nutritionData)}
                            className="w-6 h-6 flex items-center justify-center bg-zinc-200 dark:bg-zinc-700 rounded text-zinc-700 dark:text-zinc-200 hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors"
                          >
                            +
                          </button>
                        </div>

                        {(!prot && !carb && !sug && !fat) ? null : (
                          <div className="flex flex-wrap gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                            {prot && <span className="bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded shadow-sm">{prot.value}g Pro</span>}
                            {carb && <span className="bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded shadow-sm">{carb.value}g Carb</span>}
                            {sug && <span className="bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded shadow-sm">{sug.value}g Sug</span>}
                            {fat && <span className="bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded shadow-sm">{fat.value}g Fat</span>}
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </li>
              ))}
            </ul>
          )}
        </div>
      )})}
    </div>
  );
}