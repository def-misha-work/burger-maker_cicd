import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertBurgerSchema, insertRatingSchema } from "@shared/schema";
import { z } from "zod";

// Глобальные переменные для feature flags и версии
let appVersion = process.env.APP_VERSION || "1.0.0";
let socialSharingEnabled = (process.env.ENABLE_SOCIAL_SHARING || "").trim().toLowerCase() === "true";
let ratingSystemEnabled = (process.env.ENABLE_RATING_SYSTEM || "").trim().toLowerCase() === "true";

// Парсинг аргументов командной строки
function parseCommandLineArgs() {
  const args = process.argv.slice(2);

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--version' && i + 1 < args.length) {
      appVersion = args[i + 1];
      i++; // Пропускаем следующий аргумент
    }
  }

  console.log(`🍔 Burger Builder запущен:`);
  console.log(`   Версия: ${appVersion}`);
  console.log(`   Социальные сети: ${socialSharingEnabled ? 'ВКЛЮЧЕНЫ' : 'ВЫКЛЮЧЕНЫ'}`);
  console.log(`   Система рейтингов: ${ratingSystemEnabled ? 'ВКЛЮЧЕНА' : 'ВЫКЛЮЧЕНА'}`);
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Парсим аргументы при запуске
  parseCommandLineArgs();
  
  // Инициализируем ингредиенты при запуске
  await storage.initializeIngredients();

  // API Routes с префиксом /api
  
  // GET /api/version - текущая версия приложения
  app.get("/api/version", (req, res) => {
    res.json({
      version: appVersion,
      features: {
        socialSharing: socialSharingEnabled,
        ratingSystem: ratingSystemEnabled
      },
      timestamp: new Date().toISOString()
    });
  });

  // GET /api/ingredients - список доступных ингредиентов
  app.get("/api/ingredients", async (req, res) => {
    try {
      const ingredients = await storage.getAllIngredients();
      res.json(ingredients);
    } catch (error) {
      console.error("Ошибка получения ингредиентов:", error);
      res.status(500).json({ 
        message: "Не удалось получить список ингредиентов",
        error: error instanceof Error ? error.message : "Неизвестная ошибка"
      });
    }
  });

  // GET /api/burgers - список всех бургеров
  app.get("/api/burgers", async (req, res) => {
    try {
      const burgers = await storage.getAllBurgers();
      res.json(burgers);
    } catch (error) {
      console.error("Ошибка получения бургеров:", error);
      res.status(500).json({ 
        message: "Не удалось получить список бургеров",
        error: error instanceof Error ? error.message : "Неизвестная ошибка"
      });
    }
  });

  // POST /api/burgers - создать новый бургер
  app.post("/api/burgers", async (req, res) => {
    try {
      // Валидация входных данных
      const validatedData = insertBurgerSchema.parse({
        ...req.body,
        version: appVersion
      });

      // Подсчет калорий
      const ingredients = await storage.getAllIngredients();
      const totalCalories = validatedData.ingredients.reduce((sum, ingredientId) => {
        const ingredient = ingredients.find(i => i.id === ingredientId);
        return sum + (ingredient?.calories || 0);
      }, 0);

      // Определение сложности
      let difficulty = "Новичок";
      if (validatedData.ingredients.length > 6) {
        difficulty = "Мастер";
      } else if (validatedData.ingredients.length > 3) {
        difficulty = "Средний";
      } else if (validatedData.ingredients.length > 1) {
        difficulty = "Простой";
      }

      const burgerData = {
        ...validatedData,
        calories: totalCalories,
        difficulty
      };

      const newBurger = await storage.createBurger(burgerData);
      
      console.log(`✅ Создан новый бургер: "${newBurger.name}" (${newBurger.ingredients.length} ингредиентов, ${newBurger.calories} кал)`);
      
      res.status(201).json(newBurger);
    } catch (error) {
      console.error("Ошибка создания бургера:", error);
      
      if (error instanceof z.ZodError) {
        res.status(400).json({
          message: "Некорректные данные бургера", 
          errors: error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message
          }))
        });
      } else {
        res.status(500).json({ 
          message: "Не удалось создать бургер",
          error: error instanceof Error ? error.message : "Неизвестная ошибка"
        });
      }
    }
  });

  // GET /api/burgers/:id - получить бургер по ID
  app.get("/api/burgers/:id", async (req, res) => {
    try {
      const burgerId = parseInt(req.params.id);
      
      if (isNaN(burgerId)) {
        return res.status(400).json({ message: "Некорректный ID бургера" });
      }

      const burger = await storage.getBurger(burgerId);
      
      if (!burger) {
        return res.status(404).json({ message: "Бургер не найден" });
      }

      res.json(burger);
    } catch (error) {
      console.error("Ошибка получения бургера:", error);
      res.status(500).json({ 
        message: "Не удалось получить бургер",
        error: error instanceof Error ? error.message : "Неизвестная ошибка"
      });
    }
  });

  // POST /api/burgers/:id/rate - оценить бургер (только если включен feature flag)
  app.post("/api/burgers/:id/rate", async (req, res) => {
    if (!ratingSystemEnabled) {
      return res.status(403).json({ 
        message: "Система рейтингов отключена",
        hint: "Запустите приложение с нужной переменной окружения"
      });
    }

    try {
      const burgerId = parseInt(req.params.id);
      
      if (isNaN(burgerId)) {
        return res.status(400).json({ message: "Некорректный ID бургера" });
      }

      // Проверяем существование бургера
      const burger = await storage.getBurger(burgerId);
      if (!burger) {
        return res.status(404).json({ message: "Бургер не найден" });
      }

      // Валидация данных рейтинга
      const validatedRating = insertRatingSchema.parse({
        ...req.body,
        burgerId
      });

      const newRating = await storage.createRating(validatedRating);
      
      console.log(`⭐ Новый рейтинг для бургера "${burger.name}": ${newRating.rating}/5`);
      
      res.status(201).json(newRating);
    } catch (error) {
      console.error("Ошибка создания рейтинга:", error);
      
      if (error instanceof z.ZodError) {
        res.status(400).json({
          message: "Некорректные данные рейтинга",
          errors: error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message
          }))
        });
      } else {
        res.status(500).json({ 
          message: "Не удалось создать рейтинг",
          error: error instanceof Error ? error.message : "Неизвестная ошибка"
        });
      }
    }
  });

  // GET /api/social-share/:id - поделиться бургером (только если включен feature flag)
  app.get("/api/social-share/:id", async (req, res) => {
    if (!socialSharingEnabled) {
      return res.status(403).json({ 
        message: "Социальные функции отключены",
        hint: "Запустите приложение с нужной переменной окружения"
      });
    }

    try {
      const burgerId = parseInt(req.params.id);
      
      if (isNaN(burgerId)) {
        return res.status(400).json({ message: "Некорректный ID бургера" });
      }

      const burger = await storage.getBurger(burgerId);
      if (!burger) {
        return res.status(404).json({ message: "Бургер не найден" });
      }

      // Генерация ссылок для соцсетей
      const shareUrl = `${req.protocol}://${req.get('host')}/burger/${burgerId}`;
      const shareText = `Посмотри на мой невероятный бургер "${burger.name}"! ${burger.calories} калорий чистого удовольствия 🍔`;

      const socialLinks = {
        vk: `https://vk.com/share.php?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(shareText)}`,
        telegram: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`,
        twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
      };

      console.log(`🔗 Создана ссылка для sharing бургера "${burger.name}"`);

      res.json({
        burger,
        shareUrl,
        shareText,
        socialLinks
      });
    } catch (error) {
      console.error("Ошибка создания ссылки sharing:", error);
      res.status(500).json({ 
        message: "Не удалось создать ссылку для sharing",
        error: error instanceof Error ? error.message : "Неизвестная ошибка"
      });
    }
  });

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({
      status: "healthy",
      version: appVersion,
      timestamp: new Date().toISOString(),
      features: {
        socialSharing: socialSharingEnabled,
        ratingSystem: ratingSystemEnabled
      }
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}
