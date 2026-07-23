import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Sandwich, Star, Share2, History, Clock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useBurgerBuilder } from "@/hooks/use-burger-builder";
import BurgerBuilder from "@/components/burger-builder";
import IngredientSidebar from "@/components/ingredient-sidebar";
import BurgerStats from "@/components/burger-stats";
import BurgerGallery from "@/components/burger-gallery";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const { toast } = useToast();
  const [konamiCode, setKonamiCode] = useState("");
  const [isKonamiActive, setIsKonamiActive] = useState(false);

  // Получение информации о версии и feature flags
  const { data: versionInfo } = useQuery({
    queryKey: ["/api/version"],
    refetchInterval: false,
  });

  // Получение списка ингредиентов
  const { data: ingredients = [] } = useQuery({
    queryKey: ["/api/ingredients"],
  });

  // Хук для управления состоянием бургера
  const {
    currentBurger,
    addIngredient,
    removeIngredient,
    clearBurger,
    generateRandomBurger,
    saveBurger,
    isSaving,
    setBurgerName,
    setBurgerRating,
  } = useBurgerBuilder(ingredients);

  // Easter egg - Konami code
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const newCode = konamiCode + e.key;
      setKonamiCode(newCode);
      
      if (newCode.includes('konami')) {
        setIsKonamiActive(true);
        document.body.classList.add('konami-mode');
        
        toast({
          title: "🎉 Konami Code активирован!",
          description: "Ты нашел секретный режим радужного бургера!",
        });
        
        setTimeout(() => {
          setIsKonamiActive(false);
          document.body.classList.remove('konami-mode');
        }, 10000);
        
        setKonamiCode('');
      }
      
      if (newCode.length > 20) {
        setKonamiCode(newCode.slice(-10));
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [konamiCode, toast]);

  const handleSaveBurger = async () => {
    if (currentBurger.ingredients.length === 0) {
      toast({
        title: "Ошибка",
        description: "Нельзя сохранить пустой бургер!",
        variant: "destructive",
      });
      return;
    }

    try {
      await saveBurger();
      toast({
        title: "🍔 Бургер сохранен!",
        description: `"${currentBurger.name}" добавлен в галерею`,
      });
    } catch (error) {
      toast({
        title: "Ошибка сохранения",
        description: "Не удалось сохранить бургер. Попробуйте еще раз.",
        variant: "destructive",
      });
    }
  };

  const handleRandomBurger = () => {
    generateRandomBurger();
    toast({
      title: "🎲 Случайный бургер!",
      description: "Создан уникальный рецепт для тебя",
    });
  };

  const handleClearBurger = () => {
    clearBurger();
    toast({
      title: "🧹 Бургер очищен",
      description: "Начни создавать новый шедевр!",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-burger-yellow/20 to-burger-orange/20">
      {/* Header */}
      <header className="bg-white shadow-lg border-b-4 border-burger-orange">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-burger-orange to-burger-red rounded-full flex items-center justify-center shadow-lg">
                <Sandwich className="text-white text-xl" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-charcoal">Собери свой бургер</h1>
                <p className="text-sm text-gray-500">
                  DevOps Course Demo v{versionInfo?.version || "1.0.0"}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Feature Flags Indicators */}
              <div className="hidden md:flex items-center space-x-2">
                {versionInfo?.features?.socialSharing && (
                  <Badge className="bg-burger-green text-white">
                    <Share2 className="w-3 h-3 mr-1" />
                    Sharing ON
                  </Badge>
                )}
                {versionInfo?.features?.ratingSystem && (
                  <Badge className="bg-burger-red text-white">
                    <Star className="w-3 h-3 mr-1" />
                    Rating ON
                  </Badge>
                )}
              </div>
              
              <Button 
                variant="outline" 
                className="bg-burger-orange hover:bg-burger-red text-white border-none"
              >
                <History className="w-4 h-4 mr-2" />
                История
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          
          {/* Ingredients Sidebar */}
          <div className="lg:col-span-1">
            <IngredientSidebar 
              ingredients={ingredients}
              onIngredientClick={addIngredient}
              onRandomBurger={handleRandomBurger}
              onClearBurger={handleClearBurger}
            />
          </div>

          {/* Main Building Area */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl p-8 border-t-4 border-burger-yellow min-h-[600px]">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-charcoal mb-2">
                  Твой идеальный бургер
                </h2>
                <p className="text-gray-500">Перетащи ингредиенты сюда или кликни на них</p>
              </div>

              {/* Burger Name Input */}
              <div className="mb-6">
                <Input
                  placeholder="Название твоего бургера..."
                  value={currentBurger.name}
                  onChange={(e) => setBurgerName(e.target.value)}
                  className="text-center font-medium text-lg border-burger-orange/30 focus:border-burger-orange"
                />
              </div>

              {/* Burger Construction Area */}
              <BurgerBuilder
                burger={currentBurger}
                ingredients={ingredients}
                onAddIngredient={addIngredient}
                onRemoveIngredient={removeIngredient}
                isKonamiActive={isKonamiActive}
              />

              {/* Burger Stats */}
              <BurgerStats burger={currentBurger} />

              {/* Action Buttons */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <Button 
                  onClick={handleSaveBurger}
                  disabled={currentBurger.ingredients.length === 0 || isSaving}
                  className="bg-gradient-to-r from-burger-green to-green-600 hover:from-green-600 hover:to-green-700 text-white py-3 px-6 rounded-lg font-bold transition-all duration-300 transform hover:scale-105"
                >
                  {isSaving ? (
                    <>
                      <Clock className="w-4 h-4 mr-2 animate-spin" />
                      Сохраняется...
                    </>
                  ) : (
                    <>
                      <Star className="w-4 h-4 mr-2" />
                      Сохранить рецепт
                    </>
                  )}
                </Button>
                
                {versionInfo?.features?.socialSharing && (
                  <Button 
                    disabled={currentBurger.ingredients.length === 0}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-3 px-6 rounded-lg font-bold transition-all duration-300 transform hover:scale-105"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Поделиться
                  </Button>
                )}
              </div>

              {/* Rating Section - показываем только если включен feature flag */}
              {versionInfo?.features?.ratingSystem && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-700 mb-2">Оцени свой бургер:</p>
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setBurgerRating(star)}
                        className="text-2xl transition-colors duration-200"
                      >
                        <Star 
                          className={`w-6 h-6 ${
                            star <= currentBurger.rating 
                              ? 'text-burger-yellow fill-burger-yellow' 
                              : 'text-gray-300'
                          }`} 
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Stats & Gallery Sidebar */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              
              {/* Current Burger Info */}
              <div className="bg-white rounded-2xl shadow-xl p-6 border-t-4 border-burger-green">
                <h3 className="text-lg font-bold text-charcoal mb-4 flex items-center">
                  <Sparkles className="text-burger-green mr-3" />
                  Информация
                </h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Ингредиентов:</span>
                    <span className="text-sm font-medium">{currentBurger.ingredients.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Калории:</span>
                    <span className="text-sm font-medium">{currentBurger.calories}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Сложность:</span>
                    <span className="text-sm font-medium text-burger-orange">{currentBurger.difficulty}</span>
                  </div>
                </div>
              </div>

              {/* Easter Egg Stats */}
              <div className="bg-gradient-to-r from-purple-400 to-pink-400 rounded-2xl shadow-xl p-6 text-white">
                <h3 className="text-lg font-bold mb-4 flex items-center">
                  <Sparkles className="mr-3" />
                  Магические свойства
                </h3>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Уровень счастья:</span>
                    <span className="font-bold">{currentBurger.stats.happinessLevel}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Вероятность удачи:</span>
                    <span className="font-bold">{currentBurger.stats.luckProbability}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Космическая энергия:</span>
                    <span className="font-bold">{currentBurger.stats.cosmicEnergy}</span>
                  </div>
                </div>
              </div>

              {/* Recent Burgers Gallery */}
              <BurgerGallery />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-charcoal text-white py-8 mt-16">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="flex justify-center items-center space-x-4 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-burger-orange to-burger-red rounded-full flex items-center justify-center">
                <Sandwich className="text-white text-sm" />
              </div>
              <span className="font-bold text-lg">DevOps Burger Builder</span>
            </div>
            <p className="text-gray-400 text-sm mb-4">Создано для демонстрации CI/CD процессов</p>
            <div className="flex justify-center space-x-6 text-sm">
              <span>Version: <strong>{versionInfo?.version || "1.0.0"}</strong></span>
              <span>Node.js + TypeScript + PostgreSQL</span>
              <span>Feature Flags: <strong className="text-burger-green">
                {versionInfo?.features?.socialSharing || versionInfo?.features?.ratingSystem ? 'Enabled' : 'Disabled'}
              </strong></span>
            </div>
          </div>
        </div>
      </footer>

      {/* Easter Egg Message */}
      {isKonamiActive && (
        <div className="fixed top-4 right-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 rounded-lg shadow-lg animate-bounce-in z-50">
          <p className="text-sm font-bold">🌈 Режим единорога активирован!</p>
        </div>
      )}
    </div>
  );
}
