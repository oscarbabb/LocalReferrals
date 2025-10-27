import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, timestamp, boolean, jsonb, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  address: text("address"),
  section: text("section"),
  apartment: text("apartment"),
  building: text("building"),
  phone: text("phone"),
  country: text("country"), // Country of residence
  isProvider: boolean("is_provider").default(false),
  isAdmin: boolean("is_admin").default(false),
  avatar: text("avatar"),
  serviceRadiusKm: integer("service_radius_km"), // Service reception radius in km for consumers
  disclaimerAccepted: boolean("disclaimer_accepted").default(false),
  disclaimerAcceptedAt: timestamp("disclaimer_accepted_at"),
  // Detailed Mexican Address Fields
  condominioMaestro: text("condominio_maestro"),
  condominio: text("condominio"),
  edificioOArea: text("edificio_o_area"),
  calle: text("calle"),
  colonia: text("colonia"),
  codigoPostal: text("codigo_postal"),
  numeroExterior: text("numero_exterior"),
  numeroInterior: text("numero_interior"),
  municipio: text("municipio"),
  estado: text("estado"),
  addressNotes: text("address_notes"),
  resetToken: text("reset_token"),
  resetTokenExpiry: timestamp("reset_token_expiry"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const serviceCategories = pgTable("service_categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  icon: text("icon"),
  color: text("color"),
});

export const serviceSubcategories = pgTable("service_subcategories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  categoryId: varchar("category_id").references(() => serviceCategories.id).notNull(),
  name: text("name").notNull(),
  order: integer("order").default(0),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const providers = pgTable("providers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  categoryId: varchar("category_id").references(() => serviceCategories.id), // Nullable - serves as backwards compatibility for "primary" category
  subcategoryId: varchar("subcategory_id").references(() => serviceSubcategories.id), // Nullable - serves as backwards compatibility for "primary" subcategory
  title: text("title").notNull(),
  description: text("description").notNull(),
  hourlyRate: decimal("hourly_rate", { precision: 10, scale: 2 }),
  experience: text("experience"),
  serviceRadiusKm: integer("service_radius_km"), // Service delivery radius in km
  isVerified: boolean("is_verified").default(false),
  isActive: boolean("is_active").default(true),
  verificationStatus: varchar("verification_status").default("pending").notNull(), // pending, verified, rejected, suspended
  verificationLevel: varchar("verification_level").default("basic"), // basic, standard, premium
  backgroundCheckStatus: varchar("background_check_status").default("not_started"), // not_started, in_progress, passed, failed
  documentsSubmitted: boolean("documents_submitted").default(false),
  lastVerificationDate: timestamp("last_verification_date"),
  verificationNotes: text("verification_notes"),
  menuDocumentUrl: text("menu_document_url"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

// Junction table for many-to-many relationship between providers and categories
// Note: Only one isPrimary=true should exist per provider (enforced via app logic)
export const providerCategories = pgTable("provider_categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  providerId: varchar("provider_id").references(() => providers.id, { onDelete: "cascade" }).notNull(),
  categoryId: varchar("category_id").references(() => serviceCategories.id).notNull(),
  subcategoryId: varchar("subcategory_id").references(() => serviceSubcategories.id),
  isPrimary: boolean("is_primary").default(false), // Mark one as the primary service
  createdAt: timestamp("created_at").default(sql`now()`),
}, (table) => ({
  uniqueProviderCategory: unique("unique_provider_category").on(table.providerId, table.categoryId, table.subcategoryId),
}));

export const reviews = pgTable("reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  providerId: varchar("provider_id").references(() => providers.id).notNull(),
  reviewerId: varchar("reviewer_id").references(() => users.id).notNull(),
  reviewType: varchar("review_type").default("provider_review").notNull(), // "provider_review" or "customer_review"
  reviewedUserId: varchar("reviewed_user_id").references(() => users.id), // Used when provider reviews customer
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
  paymentIntentId: text("payment_intent_id"), // Stripe payment intent ID for idempotency
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
  isRead: boolean("is_read").default(false),
  deletedBySender: boolean("deleted_by_sender").default(false),
  deletedByReceiver: boolean("deleted_by_receiver").default(false),
  deletedAt: timestamp("deleted_at"),
  forwardedFrom: varchar("forwarded_from").references((): any => messages.id),
  createdAt: timestamp("created_at").default(sql`now()`),
});

// Provider verification documents table
export const verificationDocuments = pgTable("verification_documents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  providerId: varchar("provider_id").references(() => providers.id).notNull(),
  documentType: varchar("document_type").notNull(), // id_card, proof_of_address, professional_license, insurance, criminal_background
  documentUrl: text("document_url").notNull(),
  uploadedAt: timestamp("uploaded_at").default(sql`now()`),
  status: varchar("status").default("pending").notNull(), // pending, approved, rejected
  reviewedBy: varchar("reviewed_by").references(() => users.id),
  reviewedAt: timestamp("reviewed_at"),
  reviewNotes: text("review_notes"),
  expiryDate: timestamp("expiry_date"), // For licenses and certifications
});

// Background check results table
export const backgroundChecks = pgTable("background_checks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  providerId: varchar("provider_id").references(() => providers.id).notNull(),
  checkType: varchar("check_type").notNull(), // criminal, employment, education, reference
  status: varchar("status").default("pending").notNull(), // pending, in_progress, passed, failed, error
  result: jsonb("result"), // Detailed results from background check service
  thirdPartyId: varchar("third_party_id"), // Reference ID from background check service
  requestedAt: timestamp("requested_at").default(sql`now()`),
  completedAt: timestamp("completed_at"),
  validUntil: timestamp("valid_until"), // When this check expires
  notes: text("notes"),
});

// Verification reviews and admin actions
export const verificationReviews = pgTable("verification_reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  providerId: varchar("provider_id").references(() => providers.id).notNull(),
  reviewerId: varchar("reviewer_id").references(() => users.id).notNull(), // Admin who reviewed
  reviewType: varchar("review_type").notNull(), // document_review, background_check_review, manual_verification
  status: varchar("status").notNull(), // approved, rejected, requires_more_info
  comments: text("comments"),
  actionTaken: text("action_taken"), // What action was taken (e.g., status change, document request)
  createdAt: timestamp("created_at").default(sql`now()`),
});

// Verification requirements by service category
export const verificationRequirements = pgTable("verification_requirements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  categoryId: varchar("category_id").references(() => serviceCategories.id).notNull(),
  requirementType: varchar("requirement_type").notNull(), // document, background_check, reference
  isRequired: boolean("is_required").default(true),
  description: text("description").notNull(),
  verificationLevel: varchar("verification_level").notNull(), // basic, standard, premium
});

// Payment method configurations for providers
export const paymentMethods = pgTable("payment_methods", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  providerId: varchar("provider_id").references(() => providers.id).notNull(),
  paymentType: varchar("payment_type").notNull(), // hourly, fixed_job, menu_based
  isActive: boolean("is_active").default(true),
  
  // For hourly payments
  hourlyRate: decimal("hourly_rate", { precision: 10, scale: 2 }),
  minimumHours: decimal("minimum_hours", { precision: 3, scale: 1 }), // 0.5, 1.0, 2.0 etc
  
  // For fixed job payments
  fixedJobRate: decimal("fixed_job_rate", { precision: 10, scale: 2 }),
  jobDescription: text("job_description"),
  estimatedDuration: integer("estimated_duration"), // in minutes
  
  // For per-event payments
  eventRate: decimal("event_rate", { precision: 10, scale: 2 }),
  eventDescription: text("event_description"),
  
  // Configuration options
  requiresDeposit: boolean("requires_deposit").default(false),
  depositPercentage: integer("deposit_percentage").default(0), // 0-100%
  cancellationPolicy: text("cancellation_policy"),
  
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

// Menu items for menu-based providers (restaurants, nail salons, etc.)
export const menuItems = pgTable("menu_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  providerId: varchar("provider_id").references(() => providers.id).notNull(),
  categoryName: varchar("category_name").notNull(), // "Entrées", "Manicures", "Hair Cuts"
  itemName: varchar("item_name").notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  duration: integer("duration"), // service duration in minutes
  isAvailable: boolean("is_available").default(true),
  imageUrl: text("image_url"),
  
  // Additional options
  hasVariations: boolean("has_variations").default(false), // size options, add-ons
  minQuantity: integer("min_quantity").default(1),
  maxQuantity: integer("max_quantity"),
  
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

// Menu item variations (sizes, add-ons, etc.)
export const menuItemVariations = pgTable("menu_item_variations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  menuItemId: varchar("menu_item_id").references(() => menuItems.id).notNull(),
  variationType: varchar("variation_type").notNull(), // size, addon, customization
  variationName: varchar("variation_name").notNull(), // "Large", "Extra cheese", "Color choice"
  priceModifier: decimal("price_modifier", { precision: 10, scale: 2 }).default(sql`'0.00'`), // +/- price adjustment
  isRequired: boolean("is_required").default(false),
  sortOrder: integer("sort_order").default(0),
});

// Admin messages for community communication (lost & found, questions, etc.)
export const adminMessages = pgTable("admin_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  category: varchar("category").notNull(), // lost_and_found, question, general, complaint, suggestion
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  status: varchar("status").default("open").notNull(), // open, in_progress, resolved, closed
  priority: varchar("priority").default("medium"), // low, medium, high, urgent
  adminResponse: text("admin_response"),
  respondedBy: varchar("responded_by").references(() => users.id),
  respondedAt: timestamp("responded_at"),
  isReadByUser: boolean("is_read_by_user").default(false),
  isReadByAdmin: boolean("is_read_by_admin").default(false),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const categoryRequests = pgTable("category_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  requestType: varchar("request_type").notNull(), // category, subcategory
  categoryName: text("category_name").notNull(),
  subcategoryName: text("subcategory_name"),
  parentCategoryId: varchar("parent_category_id").references(() => serviceCategories.id), // For subcategory requests
  description: text("description").notNull(),
  status: varchar("status").default("pending").notNull(), // pending, approved, rejected
  adminResponse: text("admin_response"),
  reviewedBy: varchar("reviewed_by").references(() => users.id),
  reviewedAt: timestamp("reviewed_at"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertServiceCategorySchema = createInsertSchema(serviceCategories).omit({
  id: true,
});

export const insertServiceSubcategorySchema = createInsertSchema(serviceSubcategories).omit({
  id: true,
  createdAt: true,
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
}).extend({
  preferredDate: z.coerce.date().optional(),
  totalAmount: z.union([z.string(), z.number().transform(n => n.toString())]).optional(),
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

export const insertVerificationDocumentSchema = createInsertSchema(verificationDocuments).omit({
  id: true,
  uploadedAt: true,
  reviewedAt: true,
});

export const insertBackgroundCheckSchema = createInsertSchema(backgroundChecks).omit({
  id: true,
  requestedAt: true,
  completedAt: true,
});

export const insertVerificationReviewSchema = createInsertSchema(verificationReviews).omit({
  id: true,
  createdAt: true,
});

export const insertVerificationRequirementSchema = createInsertSchema(verificationRequirements).omit({
  id: true,
});

export const insertPaymentMethodSchema = createInsertSchema(paymentMethods).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMenuItemSchema = createInsertSchema(menuItems).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMenuItemVariationSchema = createInsertSchema(menuItemVariations).omit({
  id: true,
});

export const insertProviderCategorySchema = createInsertSchema(providerCategories).omit({
  id: true,
  createdAt: true,
});

export const insertAdminMessageSchema = createInsertSchema(adminMessages).omit({
  id: true,
  status: true,
  respondedAt: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCategoryRequestSchema = createInsertSchema(categoryRequests).omit({
  id: true,
  status: true,
  reviewedAt: true,
  createdAt: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type ServiceCategory = typeof serviceCategories.$inferSelect;
export type InsertServiceCategory = z.infer<typeof insertServiceCategorySchema>;
export type ServiceSubcategory = typeof serviceSubcategories.$inferSelect;
export type InsertServiceSubcategory = z.infer<typeof insertServiceSubcategorySchema>;
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
export type VerificationDocument = typeof verificationDocuments.$inferSelect;
export type InsertVerificationDocument = z.infer<typeof insertVerificationDocumentSchema>;
export type BackgroundCheck = typeof backgroundChecks.$inferSelect;
export type InsertBackgroundCheck = z.infer<typeof insertBackgroundCheckSchema>;
export type VerificationReview = typeof verificationReviews.$inferSelect;
export type InsertVerificationReview = z.infer<typeof insertVerificationReviewSchema>;
export type VerificationRequirement = typeof verificationRequirements.$inferSelect;
export type InsertVerificationRequirement = z.infer<typeof insertVerificationRequirementSchema>;
export type PaymentMethod = typeof paymentMethods.$inferSelect;
export type InsertPaymentMethod = z.infer<typeof insertPaymentMethodSchema>;
export type MenuItem = typeof menuItems.$inferSelect;
export type InsertMenuItem = z.infer<typeof insertMenuItemSchema>;
export type MenuItemVariation = typeof menuItemVariations.$inferSelect;
export type InsertMenuItemVariation = z.infer<typeof insertMenuItemVariationSchema>;
export type ProviderCategory = typeof providerCategories.$inferSelect;
export type InsertProviderCategory = z.infer<typeof insertProviderCategorySchema>;
export type AdminMessage = typeof adminMessages.$inferSelect;
export type InsertAdminMessage = z.infer<typeof insertAdminMessageSchema>;
export type CategoryRequest = typeof categoryRequests.$inferSelect;
export type InsertCategoryRequest = z.infer<typeof insertCategoryRequestSchema>;

// Conversation type for message inbox
export interface Conversation {
  otherUserId: string;
  otherUserName: string;
  otherUserEmail: string;
  otherUserAvatar?: string | null;
  lastMessage: string;
  lastMessageTime: Date;
  lastMessageSenderId: string;
}
