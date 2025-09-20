import { 
  type User, 
  type InsertUser, 
  type ServiceCategory, 
  type InsertServiceCategory,
  type ServiceSubcategory,
  type InsertServiceSubcategory, 
  type Provider, 
  type InsertProvider, 
  type Review, 
  type InsertReview, 
  type ServiceRequest, 
  type InsertServiceRequest,
  type ProviderAvailability,
  type InsertProviderAvailability,
  type Appointment,
  type InsertAppointment,
  type Message, 
  type InsertMessage,
  type VerificationDocument,
  type InsertVerificationDocument,
  type BackgroundCheck,
  type InsertBackgroundCheck,
  type VerificationReview,
  type InsertVerificationReview,
  type VerificationRequirement,
  type InsertVerificationRequirement,
  type PaymentMethod,
  type InsertPaymentMethod,
  type MenuItem,
  type InsertMenuItem,
  type MenuItemVariation,
  type InsertMenuItemVariation,
  users,
  serviceCategories,
  serviceSubcategories,
  providers,
  reviews,
  serviceRequests,
  providerAvailability,
  appointments,
  messages,
  verificationDocuments,
  backgroundChecks,
  verificationReviews,
  verificationRequirements,
  paymentMethods,
  menuItems,
  menuItemVariations
} from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";
import type { IStorage } from "./storage";

export class DatabaseStorage implements IStorage {
  constructor() {
    console.log("🏗️  Initializing DatabaseStorage...");
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  async updateUser(id: string, user: Partial<User>): Promise<User | undefined> {
    const [updatedUser] = await db.update(users).set(user).where(eq(users.id, id)).returning();
    return updatedUser || undefined;
  }

  // Service Categories
  async getServiceCategories(): Promise<ServiceCategory[]> {
    return await db.select().from(serviceCategories);
  }

  async getServiceCategory(id: string): Promise<ServiceCategory | undefined> {
    const [category] = await db.select().from(serviceCategories).where(eq(serviceCategories.id, id));
    return category || undefined;
  }

  async createServiceCategory(category: InsertServiceCategory): Promise<ServiceCategory> {
    const [newCategory] = await db.insert(serviceCategories).values(category).returning();
    return newCategory;
  }

  // Service Subcategories
  async getServiceSubcategories(): Promise<ServiceSubcategory[]> {
    return await db.select().from(serviceSubcategories);
  }

  async getServiceSubcategoriesByCategory(categoryId: string): Promise<ServiceSubcategory[]> {
    return await db.select().from(serviceSubcategories).where(eq(serviceSubcategories.categoryId, categoryId));
  }

  async getServiceSubcategory(id: string): Promise<ServiceSubcategory | undefined> {
    const [subcategory] = await db.select().from(serviceSubcategories).where(eq(serviceSubcategories.id, id));
    return subcategory || undefined;
  }

  async createServiceSubcategory(subcategory: InsertServiceSubcategory): Promise<ServiceSubcategory> {
    const [newSubcategory] = await db.insert(serviceSubcategories).values(subcategory).returning();
    return newSubcategory;
  }

  // Providers
  async getProviders(): Promise<Provider[]> {
    return await db.select().from(providers);
  }

  async getProvidersByCategory(categoryId: string): Promise<Provider[]> {
    return await db.select().from(providers).where(eq(providers.categoryId, categoryId));
  }

  async getProvider(id: string): Promise<Provider | undefined> {
    const [provider] = await db.select().from(providers).where(eq(providers.id, id));
    return provider || undefined;
  }

  async getProviderByUserId(userId: string): Promise<Provider | undefined> {
    const [provider] = await db.select().from(providers).where(eq(providers.userId, userId));
    return provider || undefined;
  }

  async createProvider(provider: InsertProvider): Promise<Provider> {
    const [newProvider] = await db.insert(providers).values(provider).returning();
    return newProvider;
  }

  async updateProvider(id: string, provider: Partial<Provider>): Promise<Provider | undefined> {
    const [updatedProvider] = await db.update(providers).set(provider).where(eq(providers.id, id)).returning();
    return updatedProvider || undefined;
  }

  // Reviews
  async getReviewsByProvider(providerId: string): Promise<Review[]> {
    return await db.select().from(reviews).where(eq(reviews.providerId, providerId));
  }

  async createReview(review: InsertReview): Promise<Review> {
    const [newReview] = await db.insert(reviews).values(review).returning();
    return newReview;
  }

  // Service Requests
  async getServiceRequests(): Promise<ServiceRequest[]> {
    return await db.select().from(serviceRequests);
  }

  async getServiceRequestsByUser(userId: string): Promise<ServiceRequest[]> {
    return await db.select().from(serviceRequests).where(eq(serviceRequests.requesterId, userId));
  }

  async getServiceRequestsByProvider(providerId: string): Promise<ServiceRequest[]> {
    return await db.select().from(serviceRequests).where(eq(serviceRequests.providerId, providerId));
  }

  async createServiceRequest(request: InsertServiceRequest): Promise<ServiceRequest> {
    const [newRequest] = await db.insert(serviceRequests).values(request).returning();
    return newRequest;
  }

  async updateServiceRequest(id: string, request: Partial<ServiceRequest>): Promise<ServiceRequest | undefined> {
    const [updatedRequest] = await db.update(serviceRequests).set(request).where(eq(serviceRequests.id, id)).returning();
    return updatedRequest || undefined;
  }

  // Provider Availability
  async getProviderAvailability(providerId: string): Promise<ProviderAvailability[]> {
    return await db.select().from(providerAvailability).where(eq(providerAvailability.providerId, providerId));
  }

  async createProviderAvailability(availability: InsertProviderAvailability): Promise<ProviderAvailability> {
    const [newAvailability] = await db.insert(providerAvailability).values(availability).returning();
    return newAvailability;
  }

  // Appointments
  async getAppointmentsByProvider(providerId: string): Promise<Appointment[]> {
    return await db.select().from(appointments).where(eq(appointments.providerId, providerId));
  }

  async getAppointmentsByUser(userId: string): Promise<Appointment[]> {
    return await db.select().from(appointments).where(eq(appointments.requesterId, userId));
  }

  async createAppointment(appointment: InsertAppointment): Promise<Appointment> {
    const [newAppointment] = await db.insert(appointments).values(appointment).returning();
    return newAppointment;
  }

  // Messages
  async getMessagesByRequest(requestId: string): Promise<Message[]> {
    return await db.select().from(messages).where(eq(messages.requestId, requestId));
  }

  async getConversation(userId1: string, userId2: string): Promise<Message[]> {
    return await db.select().from(messages).where(
      and(
        eq(messages.senderId, userId1),
        eq(messages.receiverId, userId2)
      )
    );
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const [newMessage] = await db.insert(messages).values(message).returning();
    return newMessage;
  }

  // Verification Documents
  async getVerificationDocuments(providerId: string): Promise<VerificationDocument[]> {
    return await db.select().from(verificationDocuments).where(eq(verificationDocuments.providerId, providerId));
  }

  async createVerificationDocument(document: InsertVerificationDocument): Promise<VerificationDocument> {
    const [newDocument] = await db.insert(verificationDocuments).values(document).returning();
    return newDocument;
  }

  async updateVerificationDocument(id: string, document: Partial<VerificationDocument>): Promise<VerificationDocument | undefined> {
    const [updatedDocument] = await db.update(verificationDocuments).set(document).where(eq(verificationDocuments.id, id)).returning();
    return updatedDocument || undefined;
  }

  // Background Checks
  async getBackgroundChecks(providerId: string): Promise<BackgroundCheck[]> {
    return await db.select().from(backgroundChecks).where(eq(backgroundChecks.providerId, providerId));
  }

  async createBackgroundCheck(check: InsertBackgroundCheck): Promise<BackgroundCheck> {
    const [newCheck] = await db.insert(backgroundChecks).values(check).returning();
    return newCheck;
  }

  async updateBackgroundCheck(id: string, check: Partial<BackgroundCheck>): Promise<BackgroundCheck | undefined> {
    const [updatedCheck] = await db.update(backgroundChecks).set(check).where(eq(backgroundChecks.id, id)).returning();
    return updatedCheck || undefined;
  }

  // Verification Reviews
  async getVerificationReviews(providerId: string): Promise<VerificationReview[]> {
    return await db.select().from(verificationReviews).where(eq(verificationReviews.providerId, providerId));
  }

  async createVerificationReview(review: InsertVerificationReview): Promise<VerificationReview> {
    const [newReview] = await db.insert(verificationReviews).values(review).returning();
    return newReview;
  }

  // Verification Requirements
  async getVerificationRequirements(categoryId: string): Promise<VerificationRequirement[]> {
    return await db.select().from(verificationRequirements).where(eq(verificationRequirements.categoryId, categoryId));
  }

  async getAllVerificationRequirements(): Promise<VerificationRequirement[]> {
    return await db.select().from(verificationRequirements);
  }

  async createVerificationRequirement(requirement: InsertVerificationRequirement): Promise<VerificationRequirement> {
    const [newRequirement] = await db.insert(verificationRequirements).values(requirement).returning();
    return newRequirement;
  }

  // Payment Methods
  async getPaymentMethods(providerId: string): Promise<PaymentMethod[]> {
    return await db.select().from(paymentMethods).where(eq(paymentMethods.providerId, providerId));
  }

  async createPaymentMethod(paymentMethod: InsertPaymentMethod): Promise<PaymentMethod> {
    const [newPaymentMethod] = await db.insert(paymentMethods).values(paymentMethod).returning();
    return newPaymentMethod;
  }

  async updatePaymentMethod(id: string, paymentMethod: Partial<PaymentMethod>): Promise<PaymentMethod | undefined> {
    const [updatedPaymentMethod] = await db.update(paymentMethods).set(paymentMethod).where(eq(paymentMethods.id, id)).returning();
    return updatedPaymentMethod || undefined;
  }

  // Menu Items
  async getMenuItems(providerId: string): Promise<MenuItem[]> {
    return await db.select().from(menuItems).where(eq(menuItems.providerId, providerId));
  }

  async getMenuItem(id: string): Promise<MenuItem | undefined> {
    const [menuItem] = await db.select().from(menuItems).where(eq(menuItems.id, id));
    return menuItem || undefined;
  }

  async createMenuItem(menuItem: InsertMenuItem): Promise<MenuItem> {
    const [newMenuItem] = await db.insert(menuItems).values(menuItem).returning();
    return newMenuItem;
  }

  async updateMenuItem(id: string, providerId: string, menuItem: Partial<MenuItem>): Promise<MenuItem | undefined> {
    const [updatedMenuItem] = await db.update(menuItems).set(menuItem).where(
      and(
        eq(menuItems.id, id),
        eq(menuItems.providerId, providerId)
      )
    ).returning();
    return updatedMenuItem || undefined;
  }

  async deleteMenuItem(id: string, providerId: string): Promise<boolean> {
    const result = await db.delete(menuItems).where(
      and(
        eq(menuItems.id, id),
        eq(menuItems.providerId, providerId)
      )
    );
    return (result.rowCount ?? 0) > 0;
  }

  // Menu Item Variations
  async getMenuItemVariations(menuItemId: string): Promise<MenuItemVariation[]> {
    return await db.select().from(menuItemVariations).where(eq(menuItemVariations.menuItemId, menuItemId));
  }

  async createMenuItemVariation(variation: InsertMenuItemVariation): Promise<MenuItemVariation> {
    const [newVariation] = await db.insert(menuItemVariations).values(variation).returning();
    return newVariation;
  }

  // Required for Replit Auth
  async upsertUser(userData: any): Promise<User> {
    const fullName = `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || userData.email.split('@')[0];
    
    const [user] = await db
      .insert(users)
      .values({
        id: userData.id,
        email: userData.email,
        username: userData.email.split('@')[0], // Use email prefix as username
        password: 'oauth_user', // Placeholder for OAuth users
        fullName,
        avatar: userData.profileImageUrl,
      })
      .onConflictDoUpdate({
        target: users.id,
        set: {
          email: userData.email,
          fullName,
          avatar: userData.profileImageUrl,
        },
      })
      .returning();
    return user;
  }
}