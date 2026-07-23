import { burgers, ratings, ingredients, type Burger, type InsertBurger, type Rating, type InsertRating, type Ingredient, type BurgerWithRatings } from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

// Интерфейс хранилища с CRUD операциями
export interface IStorage {
  // Операции с бургерами
  getBurger(id: number): Promise<BurgerWithRatings | undefined>;
  getAllBurgers(): Promise<BurgerWithRatings[]>;
  createBurger(burger: InsertBurger): Promise<Burger>;
  
  // Операции с рейтингами
  createRating(rating: InsertRating): Promise<Rating>;
  getBurgerRatings(burgerId: number): Promise<Rating[]>;
  
  // Операции с ингредиентами
  getAllIngredients(): Promise<Ingredient[]>;
  createIngredient(ingredient: Ingredient): Promise<Ingredient>;
  
  // Инициализация данных
  initializeIngredients(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  
  async getBurger(id: number): Promise<BurgerWithRatings | undefined> {
    const [burger] = await db.select().from(burgers).where(eq(burgers.id, id));
    if (!burger) return undefined;
    
    const burgerRatings = await this.getBurgerRatings(id);
    const averageRating = burgerRatings.length > 0 
      ? burgerRatings.reduce((sum, r) => sum + r.rating, 0) / burgerRatings.length 
      : 0;
    
    return {
      ...burger,
      ratings: burgerRatings,
      averageRating
    };
  }

  async getAllBurgers(): Promise<BurgerWithRatings[]> {
    const allBurgers = await db.select().from(burgers).orderBy(desc(burgers.createdAt));
    
    const burgersWithRatings = await Promise.all(
      allBurgers.map(async (burger) => {
        const burgerRatings = await this.getBurgerRatings(burger.id);
        const averageRating = burgerRatings.length > 0 
          ? burgerRatings.reduce((sum, r) => sum + r.rating, 0) / burgerRatings.length 
          : 0;
        
        return {
          ...burger,
          ratings: burgerRatings,
          averageRating
        };
      })
    );
    
    return burgersWithRatings;
  }

  async createBurger(insertBurger: InsertBurger): Promise<Burger> {
    const [burger] = await db
      .insert(burgers)
      .values(insertBurger)
      .returning();
    return burger;
  }

  async createRating(insertRating: InsertRating): Promise<Rating> {
    const [rating] = await db
      .insert(ratings)
      .values(insertRating)
      .returning();
    return rating;
  }

  async getBurgerRatings(burgerId: number): Promise<Rating[]> {
    return await db.select().from(ratings).where(eq(ratings.burgerId, burgerId));
  }

  async getAllIngredients(): Promise<Ingredient[]> {
    return await db.select().from(ingredients);
  }

  async createIngredient(ingredient: Ingredient): Promise<Ingredient> {
    const [created] = await db
      .insert(ingredients)
      .values(ingredient)
      .returning();
    return created;
  }

  // Инициализация шуточных ингредиентов
  async initializeIngredients(): Promise<void> {
    const defaultIngredients: Ingredient[] = [
      // Булочки
      { id: "time-bun", name: "Булочка времени", category: "buns", calories: 120, emoji: "🍞", description: "Выпечена в прошлом веке" },
      { id: "magic-bun", name: "Магическая булочка", category: "buns", calories: 150, emoji: "✨", description: "Светится в темноте" },
      
      // Котлеты
      { id: "unicorn-patty", name: "Котлета из единорога", category: "patties", calories: 250, emoji: "🦄", description: "100% мифическое мясо" },
      { id: "dragon-patty", name: "Котлета дракона", category: "patties", calories: 300, emoji: "🐉", description: "Обжигающе вкусная" },
      
      // Сыры
      { id: "mars-cheese", name: "Сыр с планеты Марс", category: "cheese", calories: 80, emoji: "🧀", description: "Доставлен космическим кораблем" },
      
      // Овощи
      { id: "happiness-lettuce", name: "Салат счастья", category: "vegetables", calories: 5, emoji: "🥬", description: "Выращен с любовью" },
      { id: "cosmic-tomato", name: "Космический помидор", category: "vegetables", calories: 15, emoji: "🍅", description: "Собран на орбите" },
      
      // Соусы
      { id: "oblivion-sauce", name: "Соус забвения", category: "sauces", calories: 30, emoji: "🥫", description: "Заставит забыть о калориях" },
    ];

    // Проверяем, есть ли уже ингредиенты
    const existingIngredients = await this.getAllIngredients();
    if (existingIngredients.length === 0) {
      // Вставляем по одному, чтобы избежать конфликтов
      for (const ingredient of defaultIngredients) {
        try {
          await this.createIngredient(ingredient);
        } catch (error) {
          // Игнорируем ошибки дублирования
          console.log(`Ингредиент ${ingredient.id} уже существует`);
        }
      }
    }
  }
}

export const storage = new DatabaseStorage();
