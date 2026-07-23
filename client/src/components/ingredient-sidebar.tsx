import { useState } from "react";
import { motion } from "framer-motion";
import { Dice6, Trash2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Ingredient } from "@shared/schema";

interface IngredientSidebarProps {
  ingredients: Ingredient[];
  onIngredientClick: (ingredientId: string) => void;
  onRandomBurger: () => void;
  onClearBurger: () => void;
}

export default function IngredientSidebar({ 
  ingredients, 
  onIngredientClick, 
  onRandomBurger, 
  onClearBurger 
}: IngredientSidebarProps) {
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  // Группировка ингредиентов по категориям
  const categorizedIngredients = ingredients.reduce((acc, ingredient) => {
    if (!acc[ingredient.category]) {
      acc[ingredient.category] = [];
    }
    acc[ingredient.category].push(ingredient);
    return acc;
  }, {} as Record<string, Ingredient[]>);

  // Названия и иконки категорий на русском
  const categoryConfig = {
    buns: { name: "Булочки", icon: "🍞", color: "bg-burger-yellow" },
    patties: { name: "Котлеты", icon: "🥩", color: "bg-burger-red" },
    cheese: { name: "Сыры", icon: "🧀", color: "bg-cheese-orange" },
    vegetables: { name: "Овощи", icon: "🥬", color: "bg-burger-green" },
    sauces: { name: "Соусы", icon: "🥫", color: "bg-red-500" },
  };

  const handleDragStart = (e: React.DragEvent, ingredientId: string) => {
    e.dataTransfer.setData("text/plain", ingredientId);
    setDraggedItem(ingredientId);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  const getIngredientGradient = (category: string): string => {
    const gradients = {
      buns: "from-yellow-100 to-yellow-200",
      patties: "from-red-100 to-red-200", 
      cheese: "from-orange-100 to-orange-200",
      vegetables: "from-green-100 to-green-200",
      sauces: "from-red-100 to-pink-200",
    };
    return gradients[category as keyof typeof gradients] || "from-gray-100 to-gray-200";
  };

  return (
    <Card className="bg-white rounded-2xl shadow-xl p-6 border-t-4 border-burger-orange sticky top-4">
      <h2 className="text-xl font-bold text-charcoal mb-4 flex items-center">
        <Sparkles className="text-burger-green mr-3" />
        Ингредиенты
      </h2>
      
      {/* Ingredient Categories */}
      <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
        {Object.entries(categorizedIngredients).map(([category, items]) => {
          const config = categoryConfig[category as keyof typeof categoryConfig];
          if (!config) return null;

          return (
            <motion.div 
              key={category}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="ingredient-category"
            >
              <h3 className="font-semibold text-charcoal mb-2 flex items-center text-sm">
                <span className={`w-3 h-3 ${config.color} rounded-full mr-2`}></span>
                {config.name}
              </h3>
              
              <div className="grid grid-cols-1 gap-2">
                {items.map((ingredient, index) => (
                  <motion.div
                    key={ingredient.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`
                      ingredient-item bg-gradient-to-r ${getIngredientGradient(category)} 
                      p-3 rounded-lg cursor-grab hover:shadow-md transition-all duration-300 
                      transform hover:scale-105 active:cursor-grabbing select-none
                      ${draggedItem === ingredient.id ? 'opacity-50 rotate-2' : ''}
                    `}
                    draggable={true}
                    onDragStart={(e) => handleDragStart(e, ingredient.id)}
                    onDragEnd={handleDragEnd}
                    onClick={() => onIngredientClick(ingredient.id)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center">
                      <div className={`
                        w-8 h-8 ${config.color} rounded-full flex items-center 
                        justify-center mr-3 shadow-sm text-sm
                      `}>
                        {ingredient.emoji}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm text-charcoal">{ingredient.name}</p>
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-gray-500">{ingredient.calories} кал</p>
                          {ingredient.description && (
                            <Badge variant="secondary" className="text-xs">
                              {ingredient.description.split(' ').slice(0, 2).join(' ')}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Controls */}
      <motion.div 
        className="mt-6 space-y-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <Button 
          onClick={onRandomBurger}
          className="w-full bg-gradient-to-r from-burger-orange to-burger-red text-white py-3 px-4 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105"
        >
          <Dice6 className="w-4 h-4 mr-2" />
          Случайный бургер
        </Button>
        
        <Button 
          onClick={onClearBurger}
          variant="outline"
          className="w-full bg-gray-100 hover:bg-gray-200 text-charcoal py-2 px-4 rounded-lg font-medium transition-all duration-300"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Очистить
        </Button>
      </motion.div>

      {/* Tips */}
      <motion.div 
        className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <p className="text-xs text-blue-600 font-medium mb-1">💡 Подсказка:</p>
        <p className="text-xs text-blue-500">
          Перетаскивай ингредиенты или кликай на них для добавления. 
          Кликай на слои бургера для удаления!
        </p>
      </motion.div>
    </Card>
  );
}
