import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Images, Star, Eye, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { BurgerWithRatings } from "@shared/schema";

export default function BurgerGallery() {
  const { data: burgers = [], isLoading, error } = useQuery({
    queryKey: ["/api/burgers"],
    refetchInterval: 30000, // Обновляем каждые 30 секунд
  });

  if (error) {
    return (
      <Card className="bg-white rounded-2xl shadow-xl p-6 border-t-4 border-burger-red">
        <h3 className="text-lg font-bold text-charcoal mb-4 flex items-center">
          <Images className="text-burger-red mr-3" />
          Галерея бургеров
        </h3>
        <div className="text-center text-red-500">
          <p className="text-sm">Не удалось загрузить галерею</p>
          <p className="text-xs text-gray-500 mt-1">Попробуйте обновить страницу</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-white rounded-2xl shadow-xl p-6 border-t-4 border-burger-red">
      <h3 className="text-lg font-bold text-charcoal mb-4 flex items-center">
        <Images className="text-burger-red mr-3" />
        Галерея бургеров
        <Badge variant="secondary" className="ml-2 text-xs">
          {isLoading ? "..." : burgers.length}
        </Badge>
      </h3>
      
      <div className="grid grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2">
        {isLoading ? (
          // Loading skeletons
          Array.from({ length: 4 }).map((_, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <Skeleton className="aspect-square rounded-lg mb-2" />
              <Skeleton className="h-3 w-20 mb-1" />
              <Skeleton className="h-2 w-16" />
            </motion.div>
          ))
        ) : burgers.length === 0 ? (
          // Empty state
          <div className="col-span-2 text-center py-8">
            <div className="text-4xl mb-2">🍔</div>
            <p className="text-sm text-gray-500 font-medium">Пока нет бургеров</p>
            <p className="text-xs text-gray-400">Создай первый!</p>
          </div>
        ) : (
          // Gallery items
          burgers.slice(0, 6).map((burger: BurgerWithRatings, index) => (
            <motion.div
              key={burger.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              className="gallery-item bg-gradient-to-br from-burger-yellow to-burger-orange rounded-lg p-3 cursor-pointer hover:shadow-md transition-all duration-300"
            >
              {/* Burger Visual Representation */}
              <div className="aspect-square bg-white rounded-md mb-2 flex items-center justify-center relative overflow-hidden">
                {/* Простое визуальное представление бургера */}
                <div className="flex flex-col items-center space-y-1">
                  <div className="w-8 h-2 bg-yellow-400 rounded-full"></div>
                  {burger.ingredients.slice(0, 3).map((_, i) => (
                    <div 
                      key={i} 
                      className={`w-6 h-1 rounded-full ${
                        i % 3 === 0 ? 'bg-red-500' : 
                        i % 3 === 1 ? 'bg-green-500' : 'bg-orange-400'
                      }`}
                    ></div>
                  ))}
                  <div className="w-8 h-2 bg-yellow-400 rounded-full"></div>
                </div>
                
                {/* Difficulty badge */}
                <Badge 
                  variant="secondary" 
                  className="absolute top-1 right-1 text-xs"
                >
                  {burger.difficulty}
                </Badge>
              </div>
              
              {/* Burger Info */}
              <p className="text-xs font-medium text-white text-center truncate" title={burger.name}>
                {burger.name || "Безымянный бургер"}
              </p>
              
              {/* Stats */}
              <div className="flex justify-between items-center mt-1 text-xs text-white/80">
                <span>{burger.calories} кал</span>
                <span>{burger.ingredients.length} инг.</span>
              </div>
              
              {/* Rating */}
              <div className="flex justify-center mt-1">
                {burger.averageRating && burger.averageRating > 0 ? (
                  <div className="flex items-center text-xs text-yellow-200">
                    <Star className="w-3 h-3 mr-1 fill-current" />
                    <span>{burger.averageRating.toFixed(1)}</span>
                  </div>
                ) : (
                  <div className="flex text-xs text-yellow-200/50">
                    <Star className="w-3 h-3" />
                  </div>
                )}
              </div>
              
              {/* Creation date */}
              <p className="text-xs text-white/60 text-center mt-1">
                {new Date(burger.createdAt).toLocaleDateString('ru-RU')}
              </p>
            </motion.div>
          ))
        )}
        
        {/* Show more placeholder */}
        {!isLoading && burgers.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="gallery-item bg-gray-200 rounded-lg p-3 cursor-pointer hover:shadow-md transition-all duration-300 border-2 border-dashed border-gray-400"
          >
            <div className="aspect-square flex items-center justify-center">
              <Plus className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-xs font-medium text-gray-500 text-center mt-2">Создать еще</p>
          </motion.div>
        )}
      </div>
      
      {/* View All Button */}
      {!isLoading && burgers.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Button 
            className="w-full mt-4 bg-burger-red hover:bg-red-600 text-white py-2 px-4 rounded-lg font-medium transition-all duration-300"
            size="sm"
          >
            <Eye className="w-4 h-4 mr-2" />
            Посмотреть все ({burgers.length})
          </Button>
        </motion.div>
      )}
    </Card>
  );
}
