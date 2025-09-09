import { sql } from "drizzle-orm";
import { pgTable, text, varchar, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const cvProfiles = pgTable("cv_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  title: text("title").notNull(),
  location: text("location"),
  bio: text("bio"),
  profileImage: text("profile_image"),
  experience: jsonb("experience").$type<ExperienceItem[]>().default([]),
  skills: jsonb("skills").$type<string[]>().default([]),
  certificates: jsonb("certificates").$type<string[]>().default([]),
  languages: jsonb("languages").$type<LanguageItem[]>().default([]),
  memberships: jsonb("memberships").$type<string[]>().default([]),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const chatMessages = pgTable("chat_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  profileId: varchar("profile_id").references(() => cvProfiles.id).notNull(),
  message: text("message").notNull(),
  response: text("response").notNull(),
  section: text("section"),
  timestamp: timestamp("timestamp").defaultNow(),
});

// Types for CV data
export interface ExperienceItem {
  title: string;
  company: string;
  period: string;
  description: string;
}

export interface LanguageItem {
  name: string;
  level: string;
  context: string;
}

export interface CVSection {
  id: string;
  name: string;
  icon: string;
  description: string;
  colorClass: string;
}

export interface ChatMessage {
  id: string;
  message: string;
  response: string;
  timestamp: string;
  isUser: boolean;
}

// Zod schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertCVProfileSchema = createInsertSchema(cvProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  timestamp: true,
});

// Type exports
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type CVProfile = typeof cvProfiles.$inferSelect;
export type InsertCVProfile = z.infer<typeof insertCVProfileSchema>;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
