import { useState, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Ingredient, InsertBurger } from "@shared/schema";

interface BurgerState {
  name: string;
  ingredients: string[];
  calories: number;
  difficulty: string;
  rating: number;
  stats: {
    happinessLevel: string;
    luckProbability: string;
    cosmicEnergy: string;
  };
}

export function useBurgerBuilder(ingredients: Ingredient[]) {
  const queryClient = useQueryClient();
  
  const [currentBurger, setCurrentBurger] = useState<BurgerState>({
    name: "",
    ingredients: [],
    calories: 0,
    difficulty: "Новичок",
    rating: 0,
    stats: {
      happinessLevel: "😐 Нейтральный",
      luckProbability: "🍀 50%",
      cosmicEnergy: "⭐ Низкая",
    },
  });

  // Мутация для сохранения бургера
  const saveMutation = useMutation({
    mutationFn: async (burgerData: InsertBurger) => {
      const response = await apiRequest("POST", "/api/burgers", burgerData);
      return response.json();
    },
    onSuccess: () => {
      // Инвалидируем кэш галереи бургеров
      queryClient.invalidateQueries({ queryKey: ["/api/burgers"] });
    },
  });

  // Рассчет статистик на основе ингредиентов
  const calculateStats = useCallback((ingredientIds: string[]) => {
    const stats = {
      happinessLevel: "😐 Нейтральный",
      luckProbability: "🍀 50%",
      cosmicEnergy: "⭐ Низкая",
    };

    const count = ingredientIds.length;
    
    // Уровень счастья
    if (count === 0) {
      stats.happinessLevel = "😢 Грустный";
    } else if (count <= 2) {
      stats.happinessLevel = "😐 Нейтральный";
    } else if (count <= 4) {
      stats.happinessLevel = "😊 Радостный";
    } else if (count <= 6) {
      stats.happinessLevel = "😄 Счастливый";
    } else {
      stats.happinessLevel = "🤩 Экстатичный";
    }

    // Вероятность удачи
    const luckPercentage = Math.min(30 + count * 10, 95);
    stats.luckProbability = `🍀 ${luckPercentage}%`;

    // Космическая энергия
    if (count === 0) {
      stats.cosmicEnergy = "⭐ Отсутствует";
    } else if (count <= 2) {
      stats.cosmicEnergy = "⭐ Низкая";
    } else if (count <= 4) {
      stats.cosmicEnergy = "⭐⭐ Средняя";
    } else if (count <= 6) {
      stats.cosmicEnergy = "⭐⭐⭐ Высокая";
    } else {
      stats.cosmicEnergy = "⭐⭐⭐⭐ Космическая";
    }

    return stats;
  }, []);

  // Рассчет калорий и сложности
  const calculateBurgerData = useCallback((ingredientIds: string[]) => {
    const totalCalories = ingredientIds.reduce((sum, ingredientId) => {
      const ingredient = ingredients.find(i => i.id === ingredientId);
      return sum + (ingredient?.calories || 0);
    }, 0);

    let difficulty = "Новичок";
    if (ingredientIds.length > 6) {
      difficulty = "Мастер";
    } else if (ingredientIds.length > 3) {
      difficulty = "Средний";
    } else if (ingredientIds.length > 1) {
      difficulty = "Простой";
    }

    const stats = calculateStats(ingredientIds);

    return { totalCalories, difficulty, stats };
  }, [ingredients, calculateStats]);

  // Добавление ингредиента
  const addIngredient = useCallback((ingredientId: string) => {
    setCurrentBurger(prev => {
      const newIngredients = [...prev.ingredients, ingredientId];
      const { totalCalories, difficulty, stats } = calculateBurgerData(newIngredients);
      
      return {
        ...prev,
        ingredients: newIngredients,
        calories: totalCalories,
        difficulty,
        stats,
      };
    });
  }, [calculateBurgerData]);

  // Удаление ингредиента по индексу
  const removeIngredient = useCallback((index: number) => {
    setCurrentBurger(prev => {
      const newIngredients = prev.ingredients.filter((_, i) => i !== index);
      const { totalCalories, difficulty, stats } = calculateBurgerData(newIngredients);
      
      return {
        ...prev,
        ingredients: newIngredients,
        calories: totalCalories,
        difficulty,
        stats,
      };
    });
  }, [calculateBurgerData]);

  // Очистка бургера
  const clearBurger = useCallback(() => {
    setCurrentBurger({
      name: "",
      ingredients: [],
      calories: 0,
      difficulty: "Новичок",
      rating: 0,
      stats: {
        happinessLevel: "😐 Нейтральный",
        luckProbability: "🍀 50%",
        cosmicEnergy: "⭐ Низкая",
      },
    });
  }, []);

  // Генерация случайного бургера
  const generateRandomBurger = useCallback(() => {
    if (ingredients.length === 0) return;

    const randomIngredients = ingredients
      .sort(() => 0.5 - Math.random())
      .slice(0, Math.floor(Math.random() * 5) + 3)
      .map(ingredient => ingredient.id);

    const { totalCalories, difficulty, stats } = calculateBurgerData(randomIngredients);

    // Генерируем случайное название
    const adjectives = ["Магический", "Космический", "Легендарный", "Мистический", "Великолепный"];
    const nouns = ["Деликатес", "Шедевр", "Творение", "Сюрприз", "Взрыв"];
    const randomName = `${adjectives[Math.floor(Math.random() * adjectives.length)]} ${nouns[Math.floor(Math.random() * nouns.length)]}`;

    setCurrentBurger(prev => ({
      ...prev,
      name: randomName,
      ingredients: randomIngredients,
      calories: totalCalories,
      difficulty,
      stats,
    }));
  }, [ingredients, calculateBurgerData]);

  // Сохранение бургера
  const saveBurger = useCallback(async () => {
    if (currentBurger.ingredients.length === 0) {
      throw new Error("Нельзя сохранить пустой бургер");
    }

    const burgerData: InsertBurger = {
      name: currentBurger.name || "Мой бургер",
      ingredients: currentBurger.ingredients,
    };

    await saveMutation.mutateAsync(burgerData);
  }, [currentBurger, saveMutation]);

  // Установка названия бургера
  const setBurgerName = useCallback((name: string) => {
    setCurrentBurger(prev => ({
      ...prev,
      name,
    }));
  }, []);

  // Установка рейтинга бургера
  const setBurgerRating = useCallback((rating: number) => {
    setCurrentBurger(prev => ({
      ...prev,
      rating,
    }));
  }, []);

  return {
    currentBurger,
    addIngredient,
    removeIngredient,
    clearBurger,
    generateRandomBurger,
    saveBurger,
    setBurgerName,
    setBurgerRating,
    isSaving: saveMutation.isPending,
  };
}
