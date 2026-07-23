// Утилиты для работы с ингредиентами
import type { Ingredient } from "@shared/schema";

export const INGREDIENT_CATEGORIES = {
  buns: {
    name: "Булочки",
    icon: "🍞",
    color: "bg-burger-yellow",
    gradient: "from-yellow-100 to-yellow-200",
  },
  patties: {
    name: "Котлеты", 
    icon: "🥩",
    color: "bg-burger-red",
    gradient: "from-red-100 to-red-200",
  },
  cheese: {
    name: "Сыры",
    icon: "🧀", 
    color: "bg-cheese-orange",
    gradient: "from-orange-100 to-orange-200",
  },
  vegetables: {
    name: "Овощи",
    icon: "🥬",
    color: "bg-burger-green", 
    gradient: "from-green-100 to-green-200",
  },
  sauces: {
    name: "Соусы",
    icon: "🥫",
    color: "bg-red-500",
    gradient: "from-red-100 to-pink-200",
  },
} as const;

export type IngredientCategory = keyof typeof INGREDIENT_CATEGORIES;

export function getCategoryConfig(category: string) {
  return INGREDIENT_CATEGORIES[category as IngredientCategory] || {
    name: "Другое",
    icon: "❓",
    color: "bg-gray-400",
    gradient: "from-gray-100 to-gray-200",
  };
}

export function groupIngredientsByCategory(ingredients: Ingredient[]) {
  return ingredients.reduce((acc, ingredient) => {
    if (!acc[ingredient.category]) {
      acc[ingredient.category] = [];
    }
    acc[ingredient.category].push(ingredient);
    return acc;
  }, {} as Record<string, Ingredient[]>);
}

export function getIngredientVisualStyle(category: string): string {
  const styleMap = {
    buns: "bg-gradient-to-r from-yellow-400 to-yellow-500",
    patties: "bg-gradient-to-r from-red-500 to-red-600",
    cheese: "bg-gradient-to-r from-orange-300 to-orange-400",
    vegetables: "bg-gradient-to-r from-green-400 to-green-500", 
    sauces: "bg-gradient-to-r from-red-600 to-red-700 h-2",
  };
  
  return styleMap[category as keyof typeof styleMap] || "bg-gray-400";
}

export function calculateBurgerComplexity(ingredientCount: number): string {
  if (ingredientCount === 0) return "Новичок";
  if (ingredientCount <= 3) return "Простой";
  if (ingredientCount <= 6) return "Средний";
  return "Мастер";
}

export function generateMagicalStats(ingredientCount: number) {
  const stats = {
    happinessLevel: "😐 Нейтральный",
    luckProbability: "🍀 50%", 
    cosmicEnergy: "⭐ Низкая",
  };

  // Уровень счастья
  if (ingredientCount === 0) {
    stats.happinessLevel = "😢 Грустный";
  } else if (ingredientCount <= 2) {
    stats.happinessLevel = "😐 Нейтральный";
  } else if (ingredientCount <= 4) {
    stats.happinessLevel = "😊 Радостный";
  } else if (ingredientCount <= 6) {
    stats.happinessLevel = "😄 Счастливый";
  } else {
    stats.happinessLevel = "🤩 Экстатичный";
  }

  // Вероятность удачи
  const luckPercentage = Math.min(30 + ingredientCount * 10, 95);
  stats.luckProbability = `🍀 ${luckPercentage}%`;

  // Космическая энергия
  if (ingredientCount === 0) {
    stats.cosmicEnergy = "⭐ Отсутствует";
  } else if (ingredientCount <= 2) {
    stats.cosmicEnergy = "⭐ Низкая";
  } else if (ingredientCount <= 4) {
    stats.cosmicEnergy = "⭐⭐ Средняя";
  } else if (ingredientCount <= 6) {
    stats.cosmicEnergy = "⭐⭐⭐ Высокая";
  } else {
    stats.cosmicEnergy = "⭐⭐⭐⭐ Космическая";
  }

  return stats;
}

// Генераторы случайных названий для бургеров
export const BURGER_ADJECTIVES = [
  "Магический", "Космический", "Легендарный", "Мистический", "Великолепный",
  "Волшебный", "Фантастический", "Невероятный", "Эпический", "Божественный",
  "Супер", "Мега", "Ультра", "Гипер", "Экстра"
];

export const BURGER_NOUNS = [
  "Деликатес", "Шедевр", "Творение", "Сюрприз", "Взрыв",
  "Чудо", "Мечта", "Фантазия", "Экстаз", "Восторг",
  "Бургер", "Создание", "Произведение", "Изобретение", "Открытие"
];

export function generateRandomBurgerName(): string {
  const adjective = BURGER_ADJECTIVES[Math.floor(Math.random() * BURGER_ADJECTIVES.length)];
  const noun = BURGER_NOUNS[Math.floor(Math.random() * BURGER_NOUNS.length)];
  return `${adjective} ${noun}`;
}
