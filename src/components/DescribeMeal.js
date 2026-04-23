"use client"
import { useEffect, useState } from "react";

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

const SKIP_SECTIONS = ["BREAKFAST CEREAL", "OMELET", "SWEET SHOPPE", "ROOTED ENTREES AND SIDES", "ROOTED CREATIONS",
  "ROOTED SOUPS", "ROOTED DESSERTS", "PURE EATS COMPOSED SALADS", "KOSHER COMPOSED SALADS", "HALAL COMPOSED SALADS",
  "CRAVE GLOBAL", "CRAVE GLOBAL TOPPINGS", "FLAME TOPPINGS", "FRESH 52-SOUPS"];

function filterOut(arr, exclude) {
  if (!Array.isArray(arr) || !Array.isArray(exclude)) {
    throw new TypeError("Both arguments must be arrays.");
  }
  return arr.filter(item => !exclude.includes(item.name));
}

export default function DescribeMeal({ meal_time }) {
  const { mealData, error } = GetMealData(meal_time);

  if (error) {
    return null; // Suppress error display to keep UI clean
  }

  if (!mealData) {
    return <div>Loading...</div>;
  }

  const { sections } = mealData;

  return (
    <div className="space-y-6">
      {filterOut(sections, SKIP_SECTIONS).map((section, s_idx) => (
        <div key={s_idx}>
          <h3 className="text-2xl font-bold mb-2 text-amber-600 dark:text-amber-200">{section.name}</h3>
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
                  
                  if (!prot && !carb && !sug && !fat) return null;
                  
                  return (
                    <div className="flex flex-wrap gap-2 mt-1 text-xs sm:justify-end text-zinc-500 dark:text-zinc-400">
                      {prot && <span className="bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded shadow-sm">{prot.value}g Pro</span>}
                      {carb && <span className="bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded shadow-sm">{carb.value}g Carb</span>}
                      {sug && <span className="bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded shadow-sm">{sug.value}g Sug</span>}
                      {fat && <span className="bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded shadow-sm">{fat.value}g Fat</span>}
                    </div>
                  );
                })()}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}