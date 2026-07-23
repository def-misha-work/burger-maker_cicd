import { motion } from "framer-motion";
import { Zap, Heart, Target, Flame } from "lucide-react";

interface BurgerStatsProps {
  burger: {
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
  };
}

export default function BurgerStats({ burger }: BurgerStatsProps) {
  const getCalorieColor = (calories: number): string => {
    if (calories < 200) return "from-burger-green to-green-600";
    if (calories < 500) return "from-burger-yellow to-yellow-600";
    if (calories < 800) return "from-burger-orange to-orange-600";
    return "from-burger-red to-red-600";
  };

  const getDifficultyColor = (difficulty: string): string => {
    const colors = {
      "Новичок": "text-green-600",
      "Простой": "text-blue-600",
      "Средний": "text-yellow-600",
      "Мастер": "text-red-600",
    };
    return colors[difficulty as keyof typeof colors] || "text-gray-600";
  };

  return (
    <motion.div 
      className="grid grid-cols-2 gap-4 mt-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      {/* Калории */}
      <motion.div 
        className={`bg-gradient-to-r ${getCalorieColor(burger.calories)} p-4 rounded-lg text-center text-white shadow-lg`}
        whileHover={{ scale: 1.05 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <motion.div 
          className="text-2xl font-bold mb-1"
          key={burger.calories}
          initial={{ scale: 1.2, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          {burger.calories}
        </motion.div>
        <div className="text-sm font-medium flex items-center justify-center">
          <Flame className="w-4 h-4 mr-1" />
          Калорий
        </div>
      </motion.div>

      {/* Количество ингредиентов */}
      <motion.div 
        className="bg-gradient-to-r from-burger-green to-green-600 p-4 rounded-lg text-center text-white shadow-lg"
        whileHover={{ scale: 1.05 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <motion.div 
          className="text-2xl font-bold mb-1"
          key={burger.ingredients.length}
          initial={{ scale: 1.2, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          {burger.ingredients.length}
        </motion.div>
        <div className="text-sm font-medium flex items-center justify-center">
          <Target className="w-4 h-4 mr-1" />
          Ингредиентов
        </div>
      </motion.div>

      {/* Сложность */}
      <motion.div 
        className="bg-white border-2 border-gray-200 p-4 rounded-lg text-center shadow-lg"
        whileHover={{ scale: 1.05 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <motion.div 
          className={`text-lg font-bold mb-1 ${getDifficultyColor(burger.difficulty)}`}
          key={burger.difficulty}
          initial={{ scale: 1.2, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          {burger.difficulty}
        </motion.div>
        <div className="text-sm font-medium text-gray-600 flex items-center justify-center">
          <Zap className="w-4 h-4 mr-1" />
          Сложность
        </div>
      </motion.div>

      {/* Рейтинг */}
      <motion.div 
        className="bg-gradient-to-r from-purple-500 to-pink-500 p-4 rounded-lg text-center text-white shadow-lg"
        whileHover={{ scale: 1.05 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <motion.div 
          className="text-lg font-bold mb-1 flex items-center justify-center"
          key={burger.rating}
          initial={{ scale: 1.2, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          {burger.rating > 0 ? `${burger.rating}/5` : "Не оценен"}
          {burger.rating > 0 && <span className="ml-1">⭐</span>}
        </motion.div>
        <div className="text-sm font-medium flex items-center justify-center">
          <Heart className="w-4 h-4 mr-1" />
          Рейтинг
        </div>
      </motion.div>
    </motion.div>
  );
}
