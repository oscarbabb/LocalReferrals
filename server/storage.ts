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
  type InsertMessage 
} from "@shared/schema";
import { randomUUID } from "crypto";

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

    const userIds: string[] = [];
    sampleUsers.forEach(user => {
      const id = randomUUID();
      this.users.set(id, { id, ...user, avatar: null, createdAt: new Date() });
      userIds.push(id);
    });

    // Create sample providers for each user
    const categoryIds = Array.from(this.serviceCategories.keys());
    const sampleProviders = [
      {
        userId: userIds[0],
        categoryId: categoryIds[0], // Limpieza
        title: "Servicio de Limpieza Profesional",
        description: "Ofrezco servicios de limpieza profunda para apartamentos. Incluye cocina, baños, habitaciones y áreas comunes. Uso productos ecológicos y tengo 5 años de experiencia.",
        hourlyRate: "25.00",
        experience: "5 años de experiencia en limpieza residencial. Certificada en uso de productos de limpieza ecológicos.",
      },
      {
        userId: userIds[1],
        categoryId: categoryIds[1], // Reparaciones
        title: "Reparaciones Eléctricas y Plomería",
        description: "Electricista y plomero certificado. Reparo grifos, instalaciones eléctricas, y mantenimiento general del hogar. Disponible para emergencias.",
        hourlyRate: "35.00",
        experience: "8 años como técnico certificado. Especializado en sistemas residenciales.",
      },
      {
        userId: userIds[2],
        categoryId: categoryIds[2], // Tutorías
        title: "Clases Particulares de Matemáticas",
        description: "Profesora de matemáticas con experiencia en primaria y secundaria. Métodos didácticos personalizados para cada estudiante.",
        hourlyRate: "20.00",
        experience: "Licenciada en Educación Matemática con 3 años de experiencia en tutoría privada.",
      },
    ];

    sampleProviders.forEach(provider => {
      const id = randomUUID();
      this.providers.set(id, { 
        id, 
        ...provider, 
        isVerified: true, 
        isActive: true, 
        createdAt: new Date() 
      });
    });

    // Add sample reviews
    const providerIds = Array.from(this.providers.keys());
    const sampleReviews = [
      {
        providerId: providerIds[0],
        reviewerId: userIds[1],
        rating: 5,
        comment: "Excelente servicio! María es muy profesional y deja todo impecable. Muy recomendada.",
      },
      {
        providerId: providerIds[0],
        reviewerId: userIds[2],
        rating: 5,
        comment: "Súper confiable y puntual. El apartamento quedó perfecto.",
      },
      {
        providerId: providerIds[1],
        reviewerId: userIds[0],
        rating: 5,
        comment: "Carlos arregló mi grifo rápidamente y a buen precio. Muy profesional.",
      },
      {
        providerId: providerIds[2],
        reviewerId: userIds[0],
        rating: 5,
        comment: "Ana es una excelente tutora. Mi hija mejoró mucho en matemáticas gracias a ella.",
      },
    ];

    sampleReviews.forEach(review => {
      const id = randomUUID();
      this.reviews.set(id, { id, ...review, createdAt: new Date() });
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

export const storage = new MemStorage();
