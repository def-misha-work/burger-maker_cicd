import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Sandwich } from "lucide-react";
import type { Ingredient } from "@shared/schema";

interface BurgerBuilderProps {
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
  ingredients: Ingredient[];
  onAddIngredient: (ingredientId: string) => void;
  onRemoveIngredient: (index: number) => void;
  isKonamiActive?: boolean;
}

export default function BurgerBuilder({ 
  burger, 
  ingredients, 
  onAddIngredient, 
  onRemoveIngredient,
  isKonamiActive = false 
}: BurgerBuilderProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  // Стили для разных типов ингредиентов
  const getIngredientStyle = (ingredientId: string): string => {
    const ingredient = ingredients.find(i => i.id === ingredientId);
    if (!ingredient) return "bg-gray-400";

    const styleMap: Record<string, string> = {
      "buns": "bg-gradient-to-r from-yellow-400 to-yellow-500",
      "patties": "bg-gradient-to-r from-red-500 to-red-600", 
      "cheese": "bg-gradient-to-r from-orange-300 to-orange-400",
      "vegetables": "bg-gradient-to-r from-green-400 to-green-500",
      "sauces": "bg-gradient-to-r from-red-600 to-red-700 h-2"
    };

    return styleMap[ingredient.category] || "bg-gray-400";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (!dropZoneRef.current?.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const ingredientId = e.dataTransfer.getData("text/plain");
    if (ingredientId) {
      onAddIngredient(ingredientId);
    }
  };

  const handleLayerClick = (index: number) => {
    onRemoveIngredient(index);
  };

  return (
    <div
      ref={dropZoneRef}
      className={`
        relative min-h-[400px] bg-gradient-to-b from-blue-50 to-blue-100 rounded-xl border-2 border-dashed
        flex flex-col justify-end items-center p-8 transition-all duration-300
        ${isDragOver ? 'border-burger-yellow bg-burger-yellow/20 scale-105' : 'border-blue-300'}
        ${isKonamiActive ? 'animate-gradient' : ''}
      `}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      
      {/* Burger Layers Container */}
      <div className="burger-stack flex flex-col-reverse items-center space-y-reverse space-y-2">
        
        {/* Animated Burger Layers */}
        <AnimatePresence>
          {burger.ingredients.map((ingredientId, index) => {
            const ingredient = ingredients.find(i => i.id === ingredientId);
            return (
              <motion.div
                key={`${ingredientId}-${index}`}
                initial={{ 
                  scale: 0.3, 
                  y: 30, 
                  opacity: 0,
                  rotate: Math.random() * 20 - 10 
                }}
                animate={{ 
                  scale: 1, 
                  y: 0, 
                  opacity: 1,
                  rotate: 0 
                }}
                exit={{ 
                  scale: 0.3, 
                  y: -30, 
                  opacity: 0,
                  rotate: Math.random() * 20 - 10 
                }}
                whileHover={{ 
                  scale: 1.05, 
                  y: -2,
                  transition: { duration: 0.2 }
                }}
                whileTap={{ scale: 0.95 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 260, 
                  damping: 20,
                  delay: index * 0.1 
                }}
                className={`
                  burger-layer w-24 h-6 rounded-full shadow-md cursor-pointer
                  transition-all duration-300 hover:shadow-lg
                  ${getIngredientStyle(ingredientId)}
                  ${isKonamiActive ? 'animate-wiggle' : ''}
                `}
                onClick={() => handleLayerClick(index)}
                title={`${ingredient?.emoji} ${ingredient?.name} - Кликни чтобы удалить`}
              >
                {/* Добавляем эмодзи ингредиента */}
                <div className="flex items-center justify-center h-full text-xs">
                  {ingredient?.emoji}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        
        {/* Base Plate */}
        <motion.div 
          className="w-32 h-4 bg-gradient-to-r from-gray-300 to-gray-400 rounded-full shadow-lg opacity-50"
          animate={{ 
            rotate: isKonamiActive ? [0, 5, -5, 0] : 0 
          }}
          transition={{ 
            duration: 2, 
            repeat: isKonamiActive ? Infinity : 0 
          }}
        />
      </div>

      {/* Drop Zone Indicator */}
      <AnimatePresence>
        {isDragOver && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute inset-0 bg-burger-yellow/20 border-2 border-burger-yellow rounded-xl flex items-center justify-center"
          >
            <div className="text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Plus className="w-12 h-12 text-burger-yellow mb-2" />
              </motion.div>
              <p className="text-burger-yellow font-semibold">Добавь ингредиент сюда!</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty State */}
      <AnimatePresence>
        {burger.ingredients.length === 0 && !isDragOver && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center text-gray-400"
          >
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0] 
              }}
              transition={{ 
                duration: 3, 
                repeat: Infinity,
                ease: "easeInOut" 
              }}
            >
              <Sandwich className="w-16 h-16 mb-4 mx-auto" />
            </motion.div>
            <h3 className="text-lg font-medium mb-2">Начни создавать свой бургер!</h3>
            <p className="text-sm">Перетащи ингредиенты из списка слева</p>
            <p className="text-xs mt-2 text-gray-500">
              💡 Подсказка: можно кликать на ингредиенты вместо перетаскивания
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Animation для полного бургера */}
      <AnimatePresence>
        {burger.ingredients.length >= 5 && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            className="absolute top-4 right-4 bg-burger-green text-white px-3 py-1 rounded-full text-sm font-bold"
          >
            🎉 Мастер-шеф!
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
