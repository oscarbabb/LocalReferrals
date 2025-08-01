import { 
  type User, 
  type InsertUser, 
  type ServiceCategory, 
  type InsertServiceCategory, 
  type Provider, 
  type InsertProvider, 
  type Review, 
  type InsertReview, 
  type ServiceRequest, 
  type InsertServiceRequest, 
  type Message, 
  type InsertMessage,
  users,
  serviceCategories,
  providers,
  reviews,
  serviceRequests,
  messages
} from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<User>): Promise<User | undefined>;

  // Service Categories
  getServiceCategories(): Promise<ServiceCategory[]>;
  getServiceCategory(id: string): Promise<ServiceCategory | undefined>;
  createServiceCategory(category: InsertServiceCategory): Promise<ServiceCategory>;

  // Providers
  getProviders(): Promise<Provider[]>;
  getProvidersByCategory(categoryId: string): Promise<Provider[]>;
  getProvider(id: string): Promise<Provider | undefined>;
  getProviderByUserId(userId: string): Promise<Provider | undefined>;
  createProvider(provider: InsertProvider): Promise<Provider>;
  updateProvider(id: string, provider: Partial<Provider>): Promise<Provider | undefined>;

  // Reviews
  getReviewsByProvider(providerId: string): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;

  // Service Requests
  getServiceRequests(): Promise<ServiceRequest[]>;
  getServiceRequestsByUser(userId: string): Promise<ServiceRequest[]>;
  getServiceRequestsByProvider(providerId: string): Promise<ServiceRequest[]>;
  createServiceRequest(request: InsertServiceRequest): Promise<ServiceRequest>;
  updateServiceRequest(id: string, request: Partial<ServiceRequest>): Promise<ServiceRequest | undefined>;

  // Messages
  getMessagesByRequest(requestId: string): Promise<Message[]>;
  getConversation(userId1: string, userId2: string): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private serviceCategories: Map<string, ServiceCategory>;
  private providers: Map<string, Provider>;
  private reviews: Map<string, Review>;
  private serviceRequests: Map<string, ServiceRequest>;
  private messages: Map<string, Message>;

  constructor() {
    this.users = new Map();
    this.serviceCategories = new Map();
    this.providers = new Map();
    this.reviews = new Map();
    this.serviceRequests = new Map();
    this.messages = new Map();
    
    this.seedData();
  }

  private seedData() {
    // Seed service categories
    const categories = [
      { name: "Limpieza", description: "Servicios de limpieza profesional", icon: "fas fa-broom", color: "blue" },
      { name: "Reparaciones", description: "Electricidad, plomería y más", icon: "fas fa-tools", color: "green" },
      { name: "Tutorías", description: "Clases particulares y apoyo", icon: "fas fa-graduation-cap", color: "amber" },
      { name: "Cuidado", description: "Niñeras y cuidado de mascotas", icon: "fas fa-baby", color: "purple" },
      { name: "Cocina", description: "Chef personal y catering", icon: "fas fa-utensils", color: "red" },
      { name: "Tecnología", description: "Soporte técnico y instalación", icon: "fas fa-laptop", color: "indigo" },
      { name: "Belleza", description: "Peluquería y estética", icon: "fas fa-cut", color: "pink" },
      { name: "Fitness", description: "Entrenadores personales", icon: "fas fa-dumbbell", color: "teal" },
    ];

    categories.forEach(cat => {
      const id = randomUUID();
      this.serviceCategories.set(id, { id, ...cat });
    });

    // Seed some users and providers
    const sampleUsers = [
      {
        username: "maria.garcia",
        email: "maria@example.com",
        password: "password123",
        fullName: "María García",
        apartment: "304",
        building: "Edificio A",
        phone: "+1234567890",
        isProvider: true,
      },
      {
        username: "carlos.mendoza",
        email: "carlos@example.com",
        password: "password123",
        fullName: "Carlos Mendoza",
        apartment: "201",
        building: "Edificio B",
        phone: "+1234567891",
        isProvider: true,
      },
      {
        username: "ana.ruiz",
        email: "ana@example.com",
        password: "password123",
        fullName: "Ana Ruiz",
        apartment: "405",
        building: "Edificio C",
        phone: "+1234567892",
        isProvider: true,
      },
    ];

    sampleUsers.forEach(user => {
      const id = randomUUID();
      this.users.set(id, { id, ...user, avatar: null, createdAt: new Date() });
    });
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id, 
      avatar: null, 
      createdAt: new Date() 
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, userUpdate: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    const updatedUser = { ...user, ...userUpdate };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Service Categories
  async getServiceCategories(): Promise<ServiceCategory[]> {
    return Array.from(this.serviceCategories.values());
  }

  async getServiceCategory(id: string): Promise<ServiceCategory | undefined> {
    return this.serviceCategories.get(id);
  }

  async createServiceCategory(insertCategory: InsertServiceCategory): Promise<ServiceCategory> {
    const id = randomUUID();
    const category: ServiceCategory = { ...insertCategory, id };
    this.serviceCategories.set(id, category);
    return category;
  }

  // Providers
  async getProviders(): Promise<Provider[]> {
    return Array.from(this.providers.values()).filter(p => p.isActive);
  }

  async getProvidersByCategory(categoryId: string): Promise<Provider[]> {
    return Array.from(this.providers.values()).filter(
      p => p.categoryId === categoryId && p.isActive
    );
  }

  async getProvider(id: string): Promise<Provider | undefined> {
    return this.providers.get(id);
  }

  async getProviderByUserId(userId: string): Promise<Provider | undefined> {
    return Array.from(this.providers.values()).find(p => p.userId === userId);
  }

  async createProvider(insertProvider: InsertProvider): Promise<Provider> {
    const id = randomUUID();
    const provider: Provider = { 
      ...insertProvider, 
      id, 
      isVerified: false, 
      isActive: true, 
      createdAt: new Date() 
    };
    this.providers.set(id, provider);
    return provider;
  }

  async updateProvider(id: string, providerUpdate: Partial<Provider>): Promise<Provider | undefined> {
    const provider = this.providers.get(id);
    if (!provider) return undefined;
    const updatedProvider = { ...provider, ...providerUpdate };
    this.providers.set(id, updatedProvider);
    return updatedProvider;
  }

  // Reviews
  async getReviewsByProvider(providerId: string): Promise<Review[]> {
    return Array.from(this.reviews.values()).filter(r => r.providerId === providerId);
  }

  async createReview(insertReview: InsertReview): Promise<Review> {
    const id = randomUUID();
    const review: Review = { ...insertReview, id, createdAt: new Date() };
    this.reviews.set(id, review);
    return review;
  }

  // Service Requests
  async getServiceRequests(): Promise<ServiceRequest[]> {
    return Array.from(this.serviceRequests.values());
  }

  async getServiceRequestsByUser(userId: string): Promise<ServiceRequest[]> {
    return Array.from(this.serviceRequests.values()).filter(r => r.requesterId === userId);
  }

  async getServiceRequestsByProvider(providerId: string): Promise<ServiceRequest[]> {
    return Array.from(this.serviceRequests.values()).filter(r => r.providerId === providerId);
  }

  async createServiceRequest(insertRequest: InsertServiceRequest): Promise<ServiceRequest> {
    const id = randomUUID();
    const request: ServiceRequest = { 
      ...insertRequest, 
      id, 
      status: "pending", 
      createdAt: new Date() 
    };
    this.serviceRequests.set(id, request);
    return request;
  }

  async updateServiceRequest(id: string, requestUpdate: Partial<ServiceRequest>): Promise<ServiceRequest | undefined> {
    const request = this.serviceRequests.get(id);
    if (!request) return undefined;
    const updatedRequest = { ...request, ...requestUpdate };
    this.serviceRequests.set(id, updatedRequest);
    return updatedRequest;
  }

  // Messages
  async getMessagesByRequest(requestId: string): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(m => m.requestId === requestId)
      .sort((a, b) => a.createdAt!.getTime() - b.createdAt!.getTime());
  }

  async getConversation(userId1: string, userId2: string): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(m => 
        (m.senderId === userId1 && m.receiverId === userId2) ||
        (m.senderId === userId2 && m.receiverId === userId1)
      )
      .sort((a, b) => a.createdAt!.getTime() - b.createdAt!.getTime());
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = randomUUID();
    const message: Message = { ...insertMessage, id, createdAt: new Date() };
    this.messages.set(id, message);
    return message;
  }
}

export class DatabaseStorage implements IStorage {
  constructor() {
    this.seedDatabase();
  }

  private async seedDatabase() {
    try {
      // Check if data already exists
      const existingCategories = await db.select().from(serviceCategories);
      if (existingCategories.length > 0) {
        return; // Data already seeded
      }

      // Seed service categories
      const sampleCategories = [
        { name: "Limpieza", description: "Servicios de limpieza para el hogar", icon: "🧹", color: "#3B82F6" },
        { name: "Reparaciones", description: "Plomería, electricidad y reparaciones generales", icon: "🔧", color: "#10B981" },
        { name: "Tutorías", description: "Clases particulares y apoyo académico", icon: "📚", color: "#F59E0B" },
        { name: "Cuidado de Mascotas", description: "Paseo, cuidado y servicios veterinarios", icon: "🐕", color: "#EF4444" },
        { name: "Jardinería", description: "Mantenimiento de plantas y jardines", icon: "🌱", color: "#22C55E" },
        { name: "Cocina", description: "Servicios de cocina y catering", icon: "👨‍🍳", color: "#8B5CF6" },
      ];

      await db.insert(serviceCategories).values(sampleCategories);
      console.log('Database seeded successfully');
    } catch (error) {
      console.error('Error seeding database:', error);
    }
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

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: string, userUpdate: Partial<User>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set(userUpdate)
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  // Service Categories
  async getServiceCategories(): Promise<ServiceCategory[]> {
    return await db.select().from(serviceCategories);
  }

  async getServiceCategory(id: string): Promise<ServiceCategory | undefined> {
    const [category] = await db.select().from(serviceCategories).where(eq(serviceCategories.id, id));
    return category || undefined;
  }

  async createServiceCategory(insertCategory: InsertServiceCategory): Promise<ServiceCategory> {
    const [category] = await db
      .insert(serviceCategories)
      .values(insertCategory)
      .returning();
    return category;
  }

  // Providers
  async getProviders(): Promise<Provider[]> {
    return await db.select().from(providers).where(eq(providers.isActive, true));
  }

  async getProvidersByCategory(categoryId: string): Promise<Provider[]> {
    return await db.select().from(providers)
      .where(and(eq(providers.categoryId, categoryId), eq(providers.isActive, true)));
  }

  async getProvider(id: string): Promise<Provider | undefined> {
    const [provider] = await db.select().from(providers).where(eq(providers.id, id));
    return provider || undefined;
  }

  async getProviderByUserId(userId: string): Promise<Provider | undefined> {
    const [provider] = await db.select().from(providers).where(eq(providers.userId, userId));
    return provider || undefined;
  }

  async createProvider(insertProvider: InsertProvider): Promise<Provider> {
    const [provider] = await db
      .insert(providers)
      .values(insertProvider)
      .returning();
    return provider;
  }

  async updateProvider(id: string, providerUpdate: Partial<Provider>): Promise<Provider | undefined> {
    const [provider] = await db
      .update(providers)
      .set(providerUpdate)
      .where(eq(providers.id, id))
      .returning();
    return provider || undefined;
  }

  // Reviews
  async getReviewsByProvider(providerId: string): Promise<Review[]> {
    return await db.select().from(reviews).where(eq(reviews.providerId, providerId));
  }

  async createReview(insertReview: InsertReview): Promise<Review> {
    const [review] = await db
      .insert(reviews)
      .values(insertReview)
      .returning();
    return review;
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

  async createServiceRequest(insertRequest: InsertServiceRequest): Promise<ServiceRequest> {
    const [request] = await db
      .insert(serviceRequests)
      .values(insertRequest)
      .returning();
    return request;
  }

  async updateServiceRequest(id: string, requestUpdate: Partial<ServiceRequest>): Promise<ServiceRequest | undefined> {
    const [request] = await db
      .update(serviceRequests)
      .set(requestUpdate)
      .where(eq(serviceRequests.id, id))
      .returning();
    return request || undefined;
  }

  // Messages
  async getMessagesByRequest(requestId: string): Promise<Message[]> {
    return await db.select().from(messages).where(eq(messages.requestId, requestId));
  }

  async getConversation(userId1: string, userId2: string): Promise<Message[]> {
    return await db.select().from(messages)
      .where(
        and(
          eq(messages.senderId, userId1),
          eq(messages.receiverId, userId2)
        )
      );
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const [message] = await db
      .insert(messages)
      .values(insertMessage)
      .returning();
    return message;
  }
}

export const storage = new DatabaseStorage();
