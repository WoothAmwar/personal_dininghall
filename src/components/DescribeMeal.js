"use client"
import { useEffect, useState } from "react";

function GetMealData(meal_time) {
    const [mealData, setMealData] = useState(null);
    const [error, setError] = useState(null);

    const today = new Date();
    const formattedDate = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}}`;

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

export default function DescribeMeal({meal_time}) {
    const { mealData, error } = GetMealData(meal_time);

    if (error) {
      return <div className="text-red-500">Error: {error}</div>;
    }

    if (!mealData) {
      return <div>Loading...</div>;
    }

    const { date, location, meal, sections } = mealData;
    console.log(filterOut(sections, SKIP_SECTIONS));
  
    return (
      <div>
        <h1 className="text-2xl">{meal}</h1>
        <h2>{date}</h2>
        <h2>{location}</h2>
        {filterOut(sections, SKIP_SECTIONS).map((section, s_idx) => (
          <div key={s_idx}>
            <h3 className="text-xl font-semibold">{section.name}</h3>
            <ul>
              {section.items.map((item, i_idx) => (
                <li key={i_idx}>
                  {i_idx+1}. {item.name}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    );
}