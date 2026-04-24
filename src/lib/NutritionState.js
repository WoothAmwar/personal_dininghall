"use client";
import { useState, useEffect } from "react";

export function getTodayDateString() {
  const today = new Date();
  return `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
}

export function getNutritionState() {
  if (typeof window === "undefined") return null;
  const key = "meal_tracker";
  const raw = localStorage.getItem(key);
  const todayDate = getTodayDateString();
  let state = { date: todayDate, meals: { breakfast: {}, lunch: {}, dinner: {} } };
  
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (parsed.date === todayDate) {
        state = parsed;
      }
    } catch (e) {
      console.error("Error parsing nutrition state", e);
    }
  }
  return state;
}

export function saveNutritionState(state) {
  if (typeof window === "undefined") return;
  const key = "meal_tracker";
  localStorage.setItem(key, JSON.stringify(state));
  window.dispatchEvent(new Event('nutrition-changed'));
}

export function updateServings(meal_time, item_name, servings, nutritionData) {
  const state = getNutritionState();
  if (!state) return;
  
  if (!state.meals[meal_time]) {
    state.meals[meal_time] = {};
  }

  if (servings <= 0) {
    delete state.meals[meal_time][item_name];
  } else {
    state.meals[meal_time][item_name] = {
      servings,
      nutrition: nutritionData // { calories, protein, carb, fat }
    };
  }
  
  saveNutritionState(state);
}

export function useNutritionState() {
  const [state, setState] = useState({ date: getTodayDateString(), meals: { breakfast: {}, lunch: {}, dinner: {} } });

  useEffect(() => {
    setState(getNutritionState() || { date: getTodayDateString(), meals: { breakfast: {}, lunch: {}, dinner: {} } });

    const handleUpdate = () => {
      setState(getNutritionState());
    };

    window.addEventListener('nutrition-changed', handleUpdate);
    return () => window.removeEventListener('nutrition-changed', handleUpdate);
  }, []);

  return state;
}
