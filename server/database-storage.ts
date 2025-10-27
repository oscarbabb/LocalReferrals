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
  type ProviderCategory,
  type InsertProviderCategory,
  type Conversation,
  type AdminMessage,
  type InsertAdminMessage,
  type CategoryRequest,
  type InsertCategoryRequest,
  users,
  serviceCategories,
  serviceSubcategories,
  providers,
  reviews,
  serviceRequests,
  providerAvailability,
  appointments,
  messages,
  adminMessages,
  categoryRequests,
  verificationDocuments,
  backgroundChecks,
  verificationReviews,
  verificationRequirements,
  paymentMethods,
  menuItems,
  menuItemVariations,
  providerCategories
} from "@shared/schema";
import { db } from "./db";
import { eq, and, or, sql, ne } from "drizzle-orm";
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

  async getUserByResetToken(token: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.resetToken, token));
    return user || undefined;
  }

  async getUsers(excludeUserId?: string): Promise<User[]> {
    if (excludeUserId) {
      return await db
        .select({
          id: users.id,
          username: users.username,
          email: users.email,
          fullName: users.fullName,
          avatar: users.avatar,
          isProvider: users.isProvider,
          isAdmin: users.isAdmin,
          createdAt: users.createdAt,
        })
        .from(users)
        .where(ne(users.id, excludeUserId));
    }
    return await db
      .select({
        id: users.id,
        username: users.username,
        email: users.email,
        fullName: users.fullName,
        avatar: users.avatar,
        isProvider: users.isProvider,
        isAdmin: users.isAdmin,
        createdAt: users.createdAt,
      })
      .from(users);
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

  async getReviewsByUser(userId: string): Promise<Review[]> {
    return await db.select().from(reviews).where(
      and(
        eq(reviews.reviewedUserId, userId),
        eq(reviews.reviewType, 'customer_review')
      )
    );
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

  async getServiceRequestByPaymentIntentId(paymentIntentId: string): Promise<ServiceRequest | undefined> {
    const [request] = await db.select().from(serviceRequests).where(eq(serviceRequests.paymentIntentId, paymentIntentId));
    return request || undefined;
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

  async updateProviderAvailability(id: string, data: Partial<InsertProviderAvailability>): Promise<ProviderAvailability | undefined> {
    const [updatedAvailability] = await db.update(providerAvailability).set(data).where(eq(providerAvailability.id, id)).returning();
    return updatedAvailability || undefined;
  }

  async deleteProviderAvailability(id: string): Promise<boolean> {
    const result = await db.delete(providerAvailability).where(eq(providerAvailability.id, id)).returning();
    return result.length > 0;
  }

  async deleteAllProviderAvailability(providerId: string): Promise<void> {
    await db.delete(providerAvailability).where(eq(providerAvailability.providerId, providerId));
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

  async getConversation(userId1: string, userId2: string, viewerId?: string): Promise<Message[]> {
    const result = await db.select().from(messages).where(
      or(
        and(
          eq(messages.senderId, userId1),
          eq(messages.receiverId, userId2)
        ),
        and(
          eq(messages.senderId, userId2),
          eq(messages.receiverId, userId1)
        )
      )
    ).orderBy(messages.createdAt);
    
    // Filter out deleted messages based on viewer
    if (viewerId) {
      return result.filter(m => {
        if (m.senderId === viewerId && m.deletedBySender) return false;
        if (m.receiverId === viewerId && m.deletedByReceiver) return false;
        return true;
      });
    }
    
    return result;
  }

  async getUserConversations(userId: string): Promise<Conversation[]> {
    // Get all unique conversation partners with their latest message
    const result = await db.execute(sql`
      WITH user_messages AS (
        SELECT 
          CASE 
            WHEN sender_id = ${userId} THEN receiver_id
            ELSE sender_id
          END as other_user_id,
          content as last_message,
          created_at as last_message_time,
          sender_id as last_message_sender_id,
          ROW_NUMBER() OVER (
            PARTITION BY 
              CASE 
                WHEN sender_id = ${userId} THEN receiver_id
                ELSE sender_id
              END 
            ORDER BY created_at DESC
          ) as rn
        FROM messages
        WHERE sender_id = ${userId} OR receiver_id = ${userId}
      )
      SELECT 
        um.other_user_id,
        u.full_name as other_user_name,
        u.email as other_user_email,
        u.avatar as other_user_avatar,
        um.last_message,
        um.last_message_time,
        um.last_message_sender_id
      FROM user_messages um
      JOIN users u ON u.id = um.other_user_id
      WHERE um.rn = 1
      ORDER BY um.last_message_time DESC
    `);

    return (result.rows as any[]).map(row => ({
      otherUserId: row.other_user_id,
      otherUserName: row.other_user_name,
      otherUserEmail: row.other_user_email,
      otherUserAvatar: row.other_user_avatar,
      lastMessage: row.last_message,
      lastMessageTime: new Date(row.last_message_time),
      lastMessageSenderId: row.last_message_sender_id,
    }));
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const [newMessage] = await db.insert(messages).values(message).returning();
    return newMessage;
  }

  async getMessage(id: string): Promise<Message | undefined> {
    const [message] = await db.select().from(messages).where(eq(messages.id, id));
    return message;
  }

  async markMessageAsRead(id: string): Promise<Message | undefined> {
    const [updated] = await db
      .update(messages)
      .set({ isRead: true })
      .where(eq(messages.id, id))
      .returning();
    return updated;
  }

  async getUnreadMessageCount(userId: string): Promise<number> {
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(messages)
      .where(and(
        eq(messages.receiverId, userId),
        eq(messages.isRead, false)
      ));
    return Number(result[0]?.count || 0);
  }

  async deleteMessage(messageId: string, userId: string): Promise<Message | undefined> {
    const message = await this.getMessage(messageId);
    if (!message) {
      return undefined;
    }
    
    let updateData: Partial<Message> = { deletedAt: new Date() };
    
    if (message.senderId === userId) {
      updateData.deletedBySender = true;
    } else if (message.receiverId === userId) {
      updateData.deletedByReceiver = true;
    } else {
      return undefined;
    }
    
    const [updated] = await db
      .update(messages)
      .set(updateData)
      .where(eq(messages.id, messageId))
      .returning();
    
    return updated;
  }

  async forwardMessage(messageId: string, newReceiverId: string, senderId: string): Promise<Message> {
    const originalMessage = await this.getMessage(messageId);
    if (!originalMessage) {
      throw new Error('Original message not found');
    }
    
    const [forwardedMessage] = await db.insert(messages).values({
      senderId,
      receiverId: newReceiverId,
      content: originalMessage.content,
      forwardedFrom: messageId,
    }).returning();
    
    return forwardedMessage;
  }

  // Admin Messages
  async getAdminMessages(): Promise<AdminMessage[]> {
    const results = await db
      .select({
        message: adminMessages,
        user: {
          id: users.id,
          username: users.username,
          email: users.email,
          fullName: users.fullName,
        }
      })
      .from(adminMessages)
      .leftJoin(users, eq(adminMessages.userId, users.id))
      .orderBy(adminMessages.createdAt);
    
    return results.map(r => ({
      ...r.message,
      user: r.user
    })) as any;
  }

  async getAdminMessagesByUser(userId: string): Promise<AdminMessage[]> {
    return await db.select().from(adminMessages).where(eq(adminMessages.userId, userId)).orderBy(adminMessages.createdAt);
  }

  async getAdminMessage(id: string): Promise<AdminMessage | undefined> {
    const [message] = await db.select().from(adminMessages).where(eq(adminMessages.id, id));
    return message || undefined;
  }

  async createAdminMessage(message: InsertAdminMessage): Promise<AdminMessage> {
    const [newMessage] = await db.insert(adminMessages).values(message).returning();
    return newMessage;
  }

  async updateAdminMessage(id: string, message: Partial<AdminMessage>): Promise<AdminMessage | undefined> {
    const [updatedMessage] = await db.update(adminMessages).set({...message, updatedAt: new Date()}).where(eq(adminMessages.id, id)).returning();
    return updatedMessage || undefined;
  }

  async markAdminMessageAsReadByUser(id: string): Promise<AdminMessage | undefined> {
    const [updated] = await db
      .update(adminMessages)
      .set({ isReadByUser: true })
      .where(eq(adminMessages.id, id))
      .returning();
    return updated;
  }

  async markAdminMessageAsReadByAdmin(id: string): Promise<AdminMessage | undefined> {
    const [updated] = await db
      .update(adminMessages)
      .set({ isReadByAdmin: true })
      .where(eq(adminMessages.id, id))
      .returning();
    return updated;
  }

  async getUnreadAdminMessageCountForUser(userId: string): Promise<number> {
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(adminMessages)
      .where(and(
        eq(adminMessages.userId, userId),
        eq(adminMessages.isReadByUser, false)
      ));
    return Number(result[0]?.count || 0);
  }

  async getUnreadAdminMessageCountForAdmin(): Promise<number> {
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(adminMessages)
      .where(eq(adminMessages.isReadByAdmin, false));
    return Number(result[0]?.count || 0);
  }

  // Category Requests
  async getCategoryRequests(): Promise<CategoryRequest[]> {
    const results = await db
      .select({
        request: categoryRequests,
        user: {
          id: users.id,
          username: users.username,
          email: users.email,
          fullName: users.fullName,
        }
      })
      .from(categoryRequests)
      .leftJoin(users, eq(categoryRequests.userId, users.id))
      .orderBy(categoryRequests.createdAt);
    
    return results.map(r => ({
      ...r.request,
      user: r.user
    })) as any;
  }

  async getCategoryRequestsByUser(userId: string): Promise<CategoryRequest[]> {
    return await db.select().from(categoryRequests).where(eq(categoryRequests.userId, userId)).orderBy(categoryRequests.createdAt);
  }

  async getCategoryRequest(id: string): Promise<CategoryRequest | undefined> {
    const [request] = await db.select().from(categoryRequests).where(eq(categoryRequests.id, id));
    return request || undefined;
  }

  async createCategoryRequest(request: InsertCategoryRequest): Promise<CategoryRequest> {
    const [newRequest] = await db.insert(categoryRequests).values(request).returning();
    return newRequest;
  }

  async updateCategoryRequest(id: string, request: Partial<CategoryRequest>): Promise<CategoryRequest | undefined> {
    const [updatedRequest] = await db.update(categoryRequests).set(request).where(eq(categoryRequests.id, id)).returning();
    return updatedRequest || undefined;
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

  // Provider Categories (Many-to-Many)
  async createProviderCategory(data: InsertProviderCategory): Promise<ProviderCategory> {
    const [newProviderCategory] = await db.insert(providerCategories).values(data).returning();
    return newProviderCategory;
  }

  async getProviderCategories(providerId: string): Promise<ProviderCategory[]> {
    const results = await db
      .select({
        id: providerCategories.id,
        providerId: providerCategories.providerId,
        categoryId: providerCategories.categoryId,
        subcategoryId: providerCategories.subcategoryId,
        isPrimary: providerCategories.isPrimary,
        createdAt: providerCategories.createdAt,
        category: serviceCategories,
        subcategory: serviceSubcategories,
      })
      .from(providerCategories)
      .leftJoin(serviceCategories, eq(providerCategories.categoryId, serviceCategories.id))
      .leftJoin(serviceSubcategories, eq(providerCategories.subcategoryId, serviceSubcategories.id))
      .where(eq(providerCategories.providerId, providerId));
    
    return results as any;
  }

  async deleteProviderCategory(id: string): Promise<void> {
    await db.delete(providerCategories).where(eq(providerCategories.id, id));
  }

  async deleteAllProviderCategories(providerId: string): Promise<void> {
    await db.delete(providerCategories).where(eq(providerCategories.providerId, providerId));
  }

  async createProviderWithCategories(
    providerData: InsertProvider, 
    categories: Array<{categoryId: string, subcategoryId?: string, isPrimary?: boolean}>
  ): Promise<Provider> {
    return await db.transaction(async (tx) => {
      // Ensure exactly one isPrimary
      const hasPrimary = categories.some(c => c.isPrimary);
      const processedCategories = categories.map((cat, index) => ({
        ...cat,
        isPrimary: hasPrimary ? cat.isPrimary : index === 0
      }));

      // Ensure only first primary remains primary
      let foundPrimary = false;
      const finalCategories = processedCategories.map(cat => {
        if (cat.isPrimary && !foundPrimary) {
          foundPrimary = true;
          return cat;
        }
        return { ...cat, isPrimary: false };
      });

      const [provider] = await tx.insert(providers).values({
        ...providerData,
        categoryId: finalCategories[0].categoryId,
        subcategoryId: finalCategories[0].subcategoryId || null
      }).returning();

      for (const category of finalCategories) {
        await tx.insert(providerCategories).values({
          providerId: provider.id,
          categoryId: category.categoryId,
          subcategoryId: category.subcategoryId || null,
          isPrimary: category.isPrimary || false
        });
      }

      return provider;
    });
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