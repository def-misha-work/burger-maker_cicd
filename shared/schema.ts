import { pgTable, text, serial, integer, json, timestamp, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Таблица бургеров
export const burgers = pgTable("burgers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  ingredients: json("ingredients").$type<string[]>().notNull(),
  calories: integer("calories").notNull().default(0),
  difficulty: text("difficulty").notNull().default("Новичок"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  version: text("version").notNull().default("1.0.0"),
});

// Таблица рейтингов (для feature flag)
export const ratings = pgTable("ratings", {
  id: serial("id").primaryKey(),
  burgerId: integer("burger_id").notNull().references(() => burgers.id),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Таблица ингредиентов
export const ingredients = pgTable("ingredients", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  calories: integer("calories").notNull(),
  emoji: text("emoji").notNull(),
  description: text("description"),
});

// Отношения
export const burgersRelations = relations(burgers, ({ many }) => ({
  ratings: many(ratings),
}));

export const ratingsRelations = relations(ratings, ({ one }) => ({
  burger: one(burgers, {
    fields: [ratings.burgerId],
    references: [burgers.id],
  }),
}));

// Схемы для валидации
export const insertBurgerSchema = createInsertSchema(burgers).omit({
  id: true,
  createdAt: true,
}).extend({
  ingredients: z.array(z.string()).min(1, "Бургер должен содержать хотя бы один ингредиент"),
  name: z.string().min(1, "Название бургера обязательно").max(100, "Название слишком длинное"),
});

export const insertRatingSchema = createInsertSchema(ratings).omit({
  id: true,
  createdAt: true,
}).extend({
  rating: z.number().min(1).max(5),
  comment: z.string().max(500).optional(),
});

export const insertIngredientSchema = createInsertSchema(ingredients);

// Типы
export type Burger = typeof burgers.$inferSelect;
export type InsertBurger = z.infer<typeof insertBurgerSchema>;
export type Rating = typeof ratings.$inferSelect;
export type InsertRating = z.infer<typeof insertRatingSchema>;
export type Ingredient = typeof ingredients.$inferSelect;
export type InsertIngredient = z.infer<typeof insertIngredientSchema>;

// Дополнительные типы для фронтенда
export interface BurgerWithRatings extends Burger {
  ratings: Rating[];
  averageRating?: number;
}

export interface BurgerStats {
  totalCalories: number;
  ingredientCount: number;
  difficulty: string;
  happinessLevel: string;
  luckProbability: string;
  cosmicEnergy: string;
}
