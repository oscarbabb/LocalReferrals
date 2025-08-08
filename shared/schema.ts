import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  apartment: text("apartment"),
  building: text("building"),
  phone: text("phone"),
  isProvider: boolean("is_provider").default(false),
  avatar: text("avatar"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const serviceCategories = pgTable("service_categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  color: text("color").notNull(),
});

export const providers = pgTable("providers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  categoryId: varchar("category_id").references(() => serviceCategories.id).notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  hourlyRate: decimal("hourly_rate", { precision: 10, scale: 2 }),
  experience: text("experience"),
  isVerified: boolean("is_verified").default(false),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const reviews = pgTable("reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  providerId: varchar("provider_id").references(() => providers.id).notNull(),
  reviewerId: varchar("reviewer_id").references(() => users.id).notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  photos: text("photos").array().default(sql`ARRAY[]::text[]`), // Array of photo URLs
  serviceQuality: integer("service_quality"), // 1-5 rating
  communication: integer("communication"), // 1-5 rating
  punctuality: integer("punctuality"), // 1-5 rating
  valueForMoney: integer("value_for_money"), // 1-5 rating
  wouldRecommend: boolean("would_recommend").default(true),
  isVerified: boolean("is_verified").default(false), // Verified by completed service
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const serviceRequests = pgTable("service_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  requesterId: varchar("requester_id").references(() => users.id).notNull(),
  providerId: varchar("provider_id").references(() => providers.id).notNull(),
  categoryId: varchar("category_id").references(() => serviceCategories.id).notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  preferredDate: timestamp("preferred_date"),
  preferredTime: text("preferred_time"), // "morning", "afternoon", "evening"
  estimatedDuration: integer("estimated_duration"), // in minutes
  location: text("location"), // apartment number or specific location
  notes: text("notes"),
  status: text("status").default("pending"), // pending, confirmed, in_progress, completed, cancelled
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }),
  confirmedDate: timestamp("confirmed_date"),
  confirmedTime: text("confirmed_time"),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

// New table for provider availability
export const providerAvailability = pgTable("provider_availability", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  providerId: varchar("provider_id").references(() => providers.id).notNull(),
  dayOfWeek: integer("day_of_week").notNull(), // 0-6 (Sunday-Saturday)
  startTime: text("start_time").notNull(), // "09:00"
  endTime: text("end_time").notNull(), // "17:00"
  isAvailable: boolean("is_available").default(true),
  createdAt: timestamp("created_at").default(sql`now()`),
});

// New table for booked appointments
export const appointments = pgTable("appointments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  serviceRequestId: varchar("service_request_id").references(() => serviceRequests.id).notNull(),
  providerId: varchar("provider_id").references(() => providers.id).notNull(),
  requesterId: varchar("requester_id").references(() => users.id).notNull(),
  appointmentDate: timestamp("appointment_date").notNull(),
  startTime: text("start_time").notNull(), // "14:00"
  endTime: text("end_time").notNull(), // "16:00"
  status: text("status").default("scheduled"), // scheduled, completed, cancelled
  notes: text("notes"),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  senderId: varchar("sender_id").references(() => users.id).notNull(),
  receiverId: varchar("receiver_id").references(() => users.id).notNull(),
  requestId: varchar("request_id").references(() => serviceRequests.id),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertServiceCategorySchema = createInsertSchema(serviceCategories).omit({
  id: true,
});

export const insertProviderSchema = createInsertSchema(providers).omit({
  id: true,
  isVerified: true,
  createdAt: true,
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true,
});

export const insertServiceRequestSchema = createInsertSchema(serviceRequests).omit({
  id: true,
  status: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProviderAvailabilitySchema = createInsertSchema(providerAvailability).omit({
  id: true,
  createdAt: true,
});

export const insertAppointmentSchema = createInsertSchema(appointments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type ServiceCategory = typeof serviceCategories.$inferSelect;
export type InsertServiceCategory = z.infer<typeof insertServiceCategorySchema>;
export type Provider = typeof providers.$inferSelect;
export type InsertProvider = z.infer<typeof insertProviderSchema>;
export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type ServiceRequest = typeof serviceRequests.$inferSelect;
export type InsertServiceRequest = z.infer<typeof insertServiceRequestSchema>;
export type ProviderAvailability = typeof providerAvailability.$inferSelect;
export type InsertProviderAvailability = z.infer<typeof insertProviderAvailabilitySchema>;
export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
