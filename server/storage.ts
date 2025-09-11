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
  upsertUser(user: any): Promise<User>;

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

  // Provider Availability
  getProviderAvailability(providerId: string): Promise<ProviderAvailability[]>;
  createProviderAvailability(availability: InsertProviderAvailability): Promise<ProviderAvailability>;

  // Appointments
  getAppointmentsByProvider(providerId: string): Promise<Appointment[]>;
  getAppointmentsByUser(userId: string): Promise<Appointment[]>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;

  // Messages
  getMessagesByRequest(requestId: string): Promise<Message[]>;
  getConversation(userId1: string, userId2: string): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;

  // Verification Documents
  getVerificationDocuments(providerId: string): Promise<VerificationDocument[]>;
  createVerificationDocument(document: InsertVerificationDocument): Promise<VerificationDocument>;
  updateVerificationDocument(id: string, document: Partial<VerificationDocument>): Promise<VerificationDocument | undefined>;

  // Background Checks
  getBackgroundChecks(providerId: string): Promise<BackgroundCheck[]>;
  createBackgroundCheck(check: InsertBackgroundCheck): Promise<BackgroundCheck>;
  updateBackgroundCheck(id: string, check: Partial<BackgroundCheck>): Promise<BackgroundCheck | undefined>;

  // Verification Reviews
  getVerificationReviews(providerId: string): Promise<VerificationReview[]>;
  createVerificationReview(review: InsertVerificationReview): Promise<VerificationReview>;

  // Verification Requirements
  getVerificationRequirements(categoryId: string): Promise<VerificationRequirement[]>;
  getAllVerificationRequirements(): Promise<VerificationRequirement[]>;
  createVerificationRequirement(requirement: InsertVerificationRequirement): Promise<VerificationRequirement>;

  // Payment Methods
  getPaymentMethods(providerId: string): Promise<PaymentMethod[]>;
  createPaymentMethod(paymentMethod: InsertPaymentMethod): Promise<PaymentMethod>;
  updatePaymentMethod(id: string, paymentMethod: Partial<PaymentMethod>): Promise<PaymentMethod | undefined>;

  // Menu Items
  getMenuItems(providerId: string): Promise<MenuItem[]>;
  getMenuItem(id: string): Promise<MenuItem | undefined>;
  createMenuItem(menuItem: InsertMenuItem): Promise<MenuItem>;
  updateMenuItem(id: string, providerId: string, menuItem: Partial<MenuItem>): Promise<MenuItem | undefined>;
  deleteMenuItem(id: string, providerId: string): Promise<boolean>;
  
  // Menu Item Variations
  getMenuItemVariations(menuItemId: string): Promise<MenuItemVariation[]>;
  createMenuItemVariation(variation: InsertMenuItemVariation): Promise<MenuItemVariation>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private serviceCategories: Map<string, ServiceCategory>;
  private providers: Map<string, Provider>;
  private reviews: Map<string, Review>;
  private serviceRequests: Map<string, ServiceRequest>;
  private providerAvailability: Map<string, ProviderAvailability>;
  private appointments: Map<string, Appointment>;
  private messages: Map<string, Message>;
  private verificationDocuments: Map<string, VerificationDocument>;
  private backgroundChecks: Map<string, BackgroundCheck>;
  private verificationReviews: Map<string, VerificationReview>;
  private verificationRequirements: Map<string, VerificationRequirement>;
  private paymentMethods: Map<string, PaymentMethod>;
  private menuItems: Map<string, MenuItem>;
  private menuItemVariations: Map<string, MenuItemVariation>;

  constructor() {
    console.log("🏗️  Initializing MemStorage...");
    this.users = new Map();
    this.serviceCategories = new Map();
    this.providers = new Map();
    this.reviews = new Map();
    this.serviceRequests = new Map();
    this.providerAvailability = new Map();
    this.appointments = new Map();
    this.messages = new Map();
    this.verificationDocuments = new Map();
    this.backgroundChecks = new Map();
    this.verificationReviews = new Map();
    this.verificationRequirements = new Map();
    this.paymentMethods = new Map();
    this.menuItems = new Map();
    this.menuItemVariations = new Map();
    
    console.log("📦 Starting data seeding...");
    this.seedData();
    console.log("✅ Data seeding completed");
    
    // Call this after seeding to add availability for existing providers
    setTimeout(() => this.seedProviderAvailability(), 100);
  }

  private seedData() {
    // Seed comprehensive service categories
    const categories = [
      { name: "Limpieza", description: "Servicios de limpieza para el hogar", icon: "🧹", color: "#3B82F6" },
      { name: "Reparaciones", description: "Plomería, electricidad y reparaciones generales", icon: "🔧", color: "#10B981" },
      { name: "Jardinería", description: "Mantenimiento de plantas y jardines", icon: "🌱", color: "#22C55E" },
      { name: "Cocina", description: "Servicios de cocina y catering", icon: "👨‍🍳", color: "#8B5CF6" },
      { name: "Tutorías", description: "Clases particulares y apoyo académico", icon: "📚", color: "#F59E0B" },
      { name: "Idiomas", description: "Clases de idiomas, traducción e interpretación", icon: "🌍", color: "#0369A1" },
      { name: "Música y Entretenimiento", description: "Clases de música, DJ para eventos y entretenimiento en vivo", icon: "🎵", color: "#7C2D12" },
      { name: "Arte y Manualidades", description: "Clases de arte, manualidades y talleres creativos", icon: "🖌️", color: "#DB2777" },
      { name: "Medicina y Salud", description: "Servicios médicos a domicilio, enfermería y terapias", icon: "🩺", color: "#DC2626" },
      { name: "Psicología y Bienestar", description: "Terapia psicológica, coaching de vida y servicios de bienestar mental", icon: "🧠", color: "#7C3AED" },
      { name: "Belleza y Cuidado Personal", description: "Servicios de peluquería, manicure, pedicure y tratamientos estéticos", icon: "💅", color: "#EC4899" },
      { name: "Masajes y Spa", description: "Masajes terapéuticos, relajantes y tratamientos de spa a domicilio", icon: "💆", color: "#8B5A96" },
      { name: "Entrenamiento Personal", description: "Entrenadores personales y clases de fitness a domicilio", icon: "🏋️", color: "#DC2626" },
      { name: "Cuidado de Niños", description: "Niñeras, cuidado infantil y servicios de babysitting", icon: "👶", color: "#F59E0B" },
      { name: "Cuidado de Adultos Mayores", description: "Acompañamiento y cuidado especializado para personas mayores", icon: "👵", color: "#059669" },
      { name: "Cuidado de Mascotas", description: "Paseo, cuidado y servicios veterinarios", icon: "🐕", color: "#EF4444" },
      { name: "Veterinaria", description: "Servicios veterinarios a domicilio, consultas y cuidado animal", icon: "🐾", color: "#059669" },
      { name: "Tecnología y Computación", description: "Soporte técnico, reparación de equipos y configuración de dispositivos", icon: "💻", color: "#1E40AF" },
      { name: "Asesoría Legal", description: "Consultoría jurídica, trámites legales y asesoría profesional", icon: "⚖️", color: "#1F2937" },
      { name: "Contabilidad y Finanzas", description: "Servicios contables, declaración de impuestos y asesoría financiera", icon: "💰", color: "#166534" },
      { name: "Seguridad", description: "Servicios de seguridad privada, instalación de cámaras y cerrajería", icon: "🛡️", color: "#374151" },
      { name: "Fotografía y Video", description: "Servicios fotográficos para eventos, retratos y producción audiovisual", icon: "📸", color: "#0891B2" },
      { name: "Organización de Eventos", description: "Planificación y organización de fiestas, celebraciones y eventos", icon: "🎉", color: "#BE185D" },
      { name: "Decoración y Diseño", description: "Diseño de interiores, decoración y ambientación de espacios", icon: "🎨", color: "#065F46" },
      { name: "Transporte y Mudanzas", description: "Servicios de transporte, mudanzas y envío de paquetes", icon: "🚚", color: "#7C3AED" },
      { name: "Costura y Confección", description: "Reparación de ropa, confección a medida y arreglos textiles", icon: "🧵", color: "#92400E" },
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
        address: "Condominio Las Flores, Torre Norte",
        section: "Norte", 
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
        address: "Condominio Las Flores, Torre Sur", 
        section: "Sur",
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
        address: "Condominio Las Flores, Torre Este",
        section: "Este",
        apartment: "405",
        building: "Edificio C",
        phone: "+1234567892",
        isProvider: true,
      },
    ];

    const userIds: string[] = [];
    sampleUsers.forEach(userData => {
      const id = randomUUID();
      userIds.push(id);
      this.users.set(id, { 
        id, 
        ...userData, 
        avatar: null, 
        address: userData.address || null,
        section: userData.section || null,
        createdAt: new Date() 
      });
    });

    // Create providers for some users
    const availableCategories = Array.from(this.serviceCategories.values());
    const providerData = [
      {
        userId: userIds[0],
        categoryId: availableCategories[0]?.id, // Limpieza
        title: "Servicio de Limpieza Profesional",
        description: "Limpieza profunda de apartamentos, oficinas y espacios comerciales. Experiencia de 5 años.",
        hourlyRate: "1500",
        experience: "5 años de experiencia",
      },
      {
        userId: userIds[1],
        categoryId: availableCategories[1]?.id, // Reparaciones
        title: "Reparaciones Eléctricas y Plomería",
        description: "Especialista en instalaciones eléctricas y reparaciones de plomería. Certificado profesional.",
        hourlyRate: "2000",
        experience: "8 años de experiencia",
      },
      {
        userId: userIds[2],
        categoryId: availableCategories[4]?.id, // Tutorías
        title: "Clases de Matemáticas y Física",
        description: "Profesor universitario ofrece clases particulares de matemáticas y física para todos los niveles.",
        hourlyRate: "1800",
        experience: "10 años de experiencia",
      },
    ];

    providerData.forEach(provider => {
      if (provider.categoryId) {
        const id = randomUUID();
        const newProvider = {
          id,
          ...provider,
          isActive: true,
          isVerified: true,
          verificationStatus: "verified" as const,
          verificationLevel: "standard" as const,
          lastVerificationDate: new Date(),
          backgroundCheckStatus: "completed" as const,
          documentsSubmitted: true,
          verificationNotes: null,
          createdAt: new Date(),
        };
        this.providers.set(id, newProvider);
        console.log(`Created provider: ${newProvider.title} with ID: ${id}`);
      }
    });
    
    console.log(`=== PROVIDER SEEDING DEBUG ===`);
    console.log(`Available categories: ${availableCategories.length}`);
    console.log(`Provider data entries: ${providerData.length}`);
    console.log(`Total providers created: ${this.providers.size}`);
    console.log(`First category ID: ${availableCategories[0]?.id}`);
    console.log(`First user ID: ${userIds[0]}`);
    console.log(`=== END DEBUG ===`);
    
    // Also seed some sample reviews
    this.seedSampleReviews();
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
    // Check if user already exists by email
    const existingUser = await this.getUserByEmail(insertUser.email);
    if (existingUser) {
      throw new Error("User already exists");
    }
    
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id, 
      avatar: null,
      apartment: insertUser.apartment || null,
      building: insertUser.building || null,
      phone: insertUser.phone || null,
      isProvider: insertUser.isProvider || false,
      address: insertUser.address || null,
      section: insertUser.section || null,
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
      isActive: insertProvider.isActive !== false,
      isVerified: insertProvider.isVerified || false,
      verificationStatus: insertProvider.verificationStatus || "pending",
      verificationLevel: insertProvider.verificationLevel || "basic",
      lastVerificationDate: insertProvider.lastVerificationDate || null,
      backgroundCheckStatus: insertProvider.backgroundCheckStatus || "pending", 
      documentsSubmitted: insertProvider.documentsSubmitted || false,
      verificationNotes: insertProvider.verificationNotes || null,
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
    const review: Review = { 
      ...insertReview, 
      id, 
      isVerified: insertReview.isVerified || false,
      photos: insertReview.photos || null,
      serviceQuality: insertReview.serviceQuality || null,
      communication: insertReview.communication || null,
      punctuality: insertReview.punctuality || null,
      valueForMoney: insertReview.valueForMoney || null,
      wouldRecommend: insertReview.wouldRecommend || null,
      createdAt: new Date() 
    };
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
      status: insertRequest.status || "pending",
      preferredDate: insertRequest.preferredDate || null,
      preferredTime: insertRequest.preferredTime || null,
      urgency: insertRequest.urgency || null,
      budgetRange: insertRequest.budgetRange || null,
      contactPhone: insertRequest.contactPhone || null,
      specialRequirements: insertRequest.specialRequirements || null,
      confirmedDate: insertRequest.confirmedDate || null,
      confirmedTime: insertRequest.confirmedTime || null,
      updatedAt: new Date(),
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

  // Provider Availability
  async getProviderAvailability(providerId: string): Promise<ProviderAvailability[]> {
    return Array.from(this.providerAvailability.values()).filter(a => a.providerId === providerId);
  }

  async createProviderAvailability(insertAvailability: InsertProviderAvailability): Promise<ProviderAvailability> {
    const id = randomUUID();
    const availability: ProviderAvailability = { 
      ...insertAvailability, 
      id, 
      isAvailable: insertAvailability.isAvailable !== false,
      createdAt: new Date() 
    };
    this.providerAvailability.set(id, availability);
    return availability;
  }

  // Appointments
  async getAppointmentsByProvider(providerId: string): Promise<Appointment[]> {
    return Array.from(this.appointments.values()).filter(a => a.providerId === providerId);
  }

  async getAppointmentsByUser(userId: string): Promise<Appointment[]> {
    return Array.from(this.appointments.values()).filter(a => a.requesterId === userId);
  }

  async createAppointment(insertAppointment: InsertAppointment): Promise<Appointment> {
    const id = randomUUID();
    const appointment: Appointment = { 
      ...insertAppointment, 
      id, 
      status: insertAppointment.status || "pending",
      notes: insertAppointment.notes || null,
      createdAt: new Date(),
      updatedAt: new Date() 
    };
    this.appointments.set(id, appointment);
    return appointment;
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
    const message: Message = { 
      ...insertMessage, 
      id, 
      requestId: insertMessage.requestId || null,
      createdAt: new Date() 
    };
    this.messages.set(id, message);
    return message;
  }

  // Payment Methods - stubbed for MemStorage (not used in production)
  async getPaymentMethods(providerId: string): Promise<PaymentMethod[]> {
    return [];
  }

  async createPaymentMethod(paymentMethod: InsertPaymentMethod): Promise<PaymentMethod> {
    const id = randomUUID();
    return {
      ...paymentMethod,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    } as PaymentMethod;
  }

  async updatePaymentMethod(id: string, paymentMethod: Partial<PaymentMethod>): Promise<PaymentMethod | undefined> {
    return undefined;
  }

  // Menu Items - fully implemented for MemStorage
  async getMenuItems(providerId: string): Promise<MenuItem[]> {
    return Array.from(this.menuItems.values()).filter(item => item.providerId === providerId);
  }

  async getMenuItem(id: string): Promise<MenuItem | undefined> {
    return this.menuItems.get(id);
  }

  async createMenuItem(menuItem: InsertMenuItem): Promise<MenuItem> {
    const id = randomUUID();
    const newMenuItem: MenuItem = {
      ...menuItem,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.menuItems.set(id, newMenuItem);
    return newMenuItem;
  }

  async updateMenuItem(id: string, providerId: string, menuItem: Partial<MenuItem>): Promise<MenuItem | undefined> {
    const existing = this.menuItems.get(id);
    if (!existing || existing.providerId !== providerId) return undefined;
    
    const updated: MenuItem = {
      ...existing,
      ...menuItem,
      id,
      updatedAt: new Date()
    };
    this.menuItems.set(id, updated);
    return updated;
  }

  async deleteMenuItem(id: string, providerId: string): Promise<boolean> {
    const existing = this.menuItems.get(id);
    if (!existing || existing.providerId !== providerId) return false;
    
    return this.menuItems.delete(id);
  }

  async getMenuItemVariations(menuItemId: string): Promise<MenuItemVariation[]> {
    return Array.from(this.menuItemVariations.values()).filter(variation => variation.menuItemId === menuItemId);
  }

  async createMenuItemVariation(variation: InsertMenuItemVariation): Promise<MenuItemVariation> {
    const id = randomUUID();
    const newVariation: MenuItemVariation = {
      ...variation,
      id
    };
    this.menuItemVariations.set(id, newVariation);
    return newVariation;
  }

  // Verification Documents
  async getVerificationDocuments(providerId: string): Promise<VerificationDocument[]> {
    return Array.from(this.verificationDocuments.values()).filter(doc => doc.providerId === providerId);
  }

  async createVerificationDocument(doc: InsertVerificationDocument): Promise<VerificationDocument> {
    const id = randomUUID();
    const newDoc: VerificationDocument = {
      ...doc,
      id,
      uploadedAt: new Date()
    };
    this.verificationDocuments.set(id, newDoc);
    return newDoc;
  }

  async updateVerificationDocument(id: string, update: Partial<VerificationDocument>): Promise<VerificationDocument | undefined> {
    const existing = this.verificationDocuments.get(id);
    if (!existing) return undefined;
    
    const updated: VerificationDocument = {
      ...existing,
      ...update,
      id
    };
    this.verificationDocuments.set(id, updated);
    return updated;
  }

  // Background Checks
  async getBackgroundChecks(providerId: string): Promise<BackgroundCheck[]> {
    return Array.from(this.backgroundChecks.values()).filter(check => check.providerId === providerId);
  }

  async createBackgroundCheck(check: InsertBackgroundCheck): Promise<BackgroundCheck> {
    const id = randomUUID();
    const newCheck: BackgroundCheck = {
      ...check,
      id,
      requestedAt: new Date()
    };
    this.backgroundChecks.set(id, newCheck);
    return newCheck;
  }

  async updateBackgroundCheck(id: string, update: Partial<BackgroundCheck>): Promise<BackgroundCheck | undefined> {
    const existing = this.backgroundChecks.get(id);
    if (!existing) return undefined;
    
    const updated: BackgroundCheck = {
      ...existing,
      ...update,
      id
    };
    this.backgroundChecks.set(id, updated);
    return updated;
  }

  // Verification Reviews
  async getVerificationReviews(providerId: string): Promise<VerificationReview[]> {
    return Array.from(this.verificationReviews.values()).filter(review => review.providerId === providerId);
  }

  async createVerificationReview(review: InsertVerificationReview): Promise<VerificationReview> {
    const id = randomUUID();
    const newReview: VerificationReview = {
      ...review,
      id,
      createdAt: new Date()
    };
    this.verificationReviews.set(id, newReview);
    return newReview;
  }

  // Verification Requirements
  async getVerificationRequirements(categoryId: string): Promise<VerificationRequirement[]> {
    return Array.from(this.verificationRequirements.values()).filter(req => req.categoryId === categoryId);
  }

  async getAllVerificationRequirements(): Promise<VerificationRequirement[]> {
    return Array.from(this.verificationRequirements.values());
  }

  async createVerificationRequirement(requirement: InsertVerificationRequirement): Promise<VerificationRequirement> {
    const id = randomUUID();
    const newRequirement: VerificationRequirement = {
      ...requirement,
      id
    };
    this.verificationRequirements.set(id, newRequirement);
    return newRequirement;
  }

  // Required for Replit Auth
  async upsertUser(userData: any): Promise<User> {
    const existingUser = this.users.get(userData.id);
    const user: User = {
      id: userData.id,
      email: userData.email,
      username: userData.email?.split('@')[0] || userData.id,
      fullName: `${userData.firstName || ''} ${userData.lastName || ''}`.trim(),
      password: existingUser?.password || '',
      firstName: userData.firstName || null,
      lastName: userData.lastName || null,
      profileImageUrl: userData.profileImageUrl || null,
      address: existingUser?.address || null,
      section: existingUser?.section || null,
      apartment: existingUser?.apartment || null,
      building: existingUser?.building || null,
      phone: existingUser?.phone || null,
      avatar: userData.profileImageUrl || existingUser?.avatar || null,
      isOnline: existingUser?.isOnline || false,
      lastSeen: existingUser?.lastSeen || null,
      createdAt: existingUser?.createdAt || new Date(),
      updatedAt: new Date()
    };
    this.users.set(userData.id, user);
    return user;
  }

  private seedSampleReviews() {
    // Create some sample reviews for providers
    const providerIds = Array.from(this.providers.keys());
    const userIds = Array.from(this.users.keys()).filter(userId => {
      const user = this.users.get(userId);
      return user && !user.isProvider; // Only non-provider users can leave reviews
    });

    // If no regular users exist, create one for reviews
    if (userIds.length === 0) {
      const reviewerId = randomUUID();
      this.users.set(reviewerId, {
        id: reviewerId,
        username: "cliente.demo",
        email: "cliente@example.com", 
        password: "password123",
        fullName: "Cliente Demo",
        address: "Condominio Las Flores",
        section: "Centro",
        apartment: "102",
        building: "Edificio D",
        phone: "+1234567893",
        isProvider: false,
        avatar: null,
        createdAt: new Date()
      });
      userIds.push(reviewerId);
    }

    // Create sample reviews
    providerIds.forEach((providerId, index) => {
      if (userIds.length > 0) {
        const reviewId = randomUUID();
        this.reviews.set(reviewId, {
          id: reviewId,
          providerId,
          reviewerId: userIds[0],
          rating: 4.5 + (index * 0.2), // Varying ratings
          comment: `Excelente servicio profesional. Muy recomendado para la comunidad.`,
          photos: [],
          serviceQuality: 5,
          communication: 4,
          punctuality: 5,
          valueForMoney: 4,
          wouldRecommend: true,
          isVerified: true,
          createdAt: new Date()
        });
      }
    });
  }

  private seedProviderAvailability() {
    // Add default availability for all providers (Mon-Fri, 9 AM - 5 PM)
    const defaultSchedule = [
      { dayOfWeek: 1, startTime: "09:00", endTime: "17:00" }, // Monday
      { dayOfWeek: 2, startTime: "09:00", endTime: "17:00" }, // Tuesday
      { dayOfWeek: 3, startTime: "09:00", endTime: "17:00" }, // Wednesday
      { dayOfWeek: 4, startTime: "09:00", endTime: "17:00" }, // Thursday
      { dayOfWeek: 5, startTime: "09:00", endTime: "17:00" }, // Friday
    ];

    Array.from(this.providers.keys()).forEach(providerId => {
      defaultSchedule.forEach(schedule => {
        const id = randomUUID();
        this.providerAvailability.set(id, {
          id,
          providerId,
          ...schedule,
          isAvailable: true,
          createdAt: new Date(),
        });
      });
    });
  }
}

export class DatabaseStorage implements IStorage {
  constructor() {
    this.seedDatabase();
  }

  private async seedDatabase() {
    try {
      // Check if we need comprehensive categories (only 6 basic ones exist)
      const existingCategories = await db.select().from(serviceCategories);
      console.log(`🔍 Database check: Found ${existingCategories.length} existing categories`);
      
      if (existingCategories.length > 15) {
        console.log(`✅ Comprehensive categories already seeded (${existingCategories.length} > 15)`);
        
        // Check if providers exist, if not, seed them
        const existingProviders = await db.select().from(providers);
        console.log(`🔍 Found ${existingProviders.length} existing providers`);
        
        if (existingProviders.length === 0) {
          console.log(`📦 Seeding sample providers...`);
          await this.seedSampleProviders();
        }
        
        return; // Comprehensive categories already seeded
      }
      
      console.log(`📦 Starting comprehensive seeding process...`);
      
      // If we only have basic categories, clear everything and reseed with comprehensive list
      if (existingCategories.length > 0 && existingCategories.length <= 6) {
        console.log("Upgrading to comprehensive service categories...");
        
        // Clear all dependent data first to avoid foreign key constraints
        await db.delete(verificationReviews);
        await db.delete(verificationDocuments);
        await db.delete(backgroundChecks);
        await db.delete(providerAvailability);
        await db.delete(appointments);
        await db.delete(reviews);
        await db.delete(serviceRequests);
        await db.delete(messages);
        await db.delete(providers);
        await db.delete(serviceCategories);
        
        console.log("Cleared existing data for comprehensive reseeding");
      }

      // Seed service categories with comprehensive service offerings
      const sampleCategories = [
        // Essential Home Services
        { name: "Limpieza", description: "Servicios de limpieza para el hogar", icon: "🧹", color: "#3B82F6" },
        { name: "Reparaciones", description: "Plomería, electricidad y reparaciones generales", icon: "🔧", color: "#10B981" },
        { name: "Jardinería", description: "Mantenimiento de plantas y jardines", icon: "🌱", color: "#22C55E" },
        { name: "Cocina", description: "Servicios de cocina y catering", icon: "👨‍🍳", color: "#8B5CF6" },
        
        // Education & Learning
        { name: "Tutorías", description: "Clases particulares y apoyo académico", icon: "📚", color: "#F59E0B" },
        { name: "Idiomas", description: "Clases de idiomas, traducción e interpretación", icon: "🌍", color: "#0369A1" },
        { name: "Música y Entretenimiento", description: "Clases de música, DJ para eventos y entretenimiento en vivo", icon: "🎵", color: "#7C2D12" },
        { name: "Arte y Manualidades", description: "Clases de arte, manualidades y talleres creativos", icon: "🖌️", color: "#DB2777" },
        
        // Health & Wellness
        { name: "Medicina y Salud", description: "Servicios médicos a domicilio, enfermería y terapias", icon: "🩺", color: "#DC2626" },
        { name: "Psicología y Bienestar", description: "Terapia psicológica, coaching de vida y servicios de bienestar mental", icon: "🧠", color: "#7C3AED" },
        { name: "Belleza y Cuidado Personal", description: "Servicios de peluquería, manicure, pedicure y tratamientos estéticos", icon: "💅", color: "#EC4899" },
        { name: "Masajes y Spa", description: "Masajes terapéuticos, relajantes y tratamientos de spa a domicilio", icon: "💆", color: "#8B5A96" },
        { name: "Entrenamiento Personal", description: "Entrenadores personales y clases de fitness a domicilio", icon: "🏋️", color: "#DC2626" },
        
        // Care Services
        { name: "Cuidado de Niños", description: "Niñeras, cuidado infantil y servicios de babysitting", icon: "👶", color: "#F59E0B" },
        { name: "Cuidado de Adultos Mayores", description: "Acompañamiento y cuidado especializado para personas mayores", icon: "👵", color: "#059669" },
        { name: "Cuidado de Mascotas", description: "Paseo, cuidado y servicios veterinarios", icon: "🐕", color: "#EF4444" },
        { name: "Veterinaria", description: "Servicios veterinarios a domicilio, consultas y cuidado animal", icon: "🐾", color: "#059669" },
        
        // Technical & Professional Services
        { name: "Tecnología y Computación", description: "Soporte técnico, reparación de equipos y configuración de dispositivos", icon: "💻", color: "#1E40AF" },
        { name: "Asesoría Legal", description: "Consultoría jurídica, trámites legales y asesoría profesional", icon: "⚖️", color: "#1F2937" },
        { name: "Contabilidad y Finanzas", description: "Servicios contables, declaración de impuestos y asesoría financiera", icon: "💰", color: "#166534" },
        { name: "Seguridad", description: "Servicios de seguridad privada, instalación de cámaras y cerrajería", icon: "🛡️", color: "#374151" },
        
        // Creative & Event Services
        { name: "Fotografía y Video", description: "Servicios fotográficos para eventos, retratos y producción audiovisual", icon: "📸", color: "#0891B2" },
        { name: "Organización de Eventos", description: "Planificación y organización de fiestas, celebraciones y eventos", icon: "🎉", color: "#BE185D" },
        { name: "Decoración y Diseño", description: "Diseño de interiores, decoración y ambientación de espacios", icon: "🎨", color: "#065F46" },
        
        // Specialized Services
        { name: "Transporte y Mudanzas", description: "Servicios de transporte, mudanzas y envío de paquetes", icon: "🚚", color: "#7C3AED" },
        { name: "Costura y Confección", description: "Reparación de ropa, confección a medida y arreglos textiles", icon: "🧵", color: "#92400E" },
      ];

      await db.insert(serviceCategories).values(sampleCategories);
      console.log('Database seeded successfully');
    } catch (error) {
      console.error('Error seeding database:', error);
    }
  }

  private async seedSampleProviders() {
    try {
      // Get categories first
      const categories = await db.select().from(serviceCategories);
      console.log(`📂 Available categories for providers: ${categories.length}`);
      
      // Sample provider data
      const sampleProviders = [
        {
          title: "María Limpieza Pro",
          description: "Especialista en limpieza profunda de hogares. Con más de 8 años de experiencia, ofrezco servicios de limpieza confiables y detallados.",
          categoryId: categories.find(c => c.name === "Limpieza")?.id!,
          userId: "sample-user-1", // Will be replaced with actual user IDs
          hourlyRate: 25000,
          experience: "8 años de experiencia en limpieza profesional",
          skills: ["Limpieza profunda", "Desinfección", "Organización"],
          contactPhone: "+57 300 123 4567",
          availability: "Lunes a Sábado, 7:00 AM - 5:00 PM",
          isActive: true,
          isVerified: true,
          verificationStatus: "verified" as const,
          verificationLevel: "standard" as const,
          backgroundCheckStatus: "approved" as const,
          documentsSubmitted: true
        },
        {
          title: "Carlos Reparaciones Hogar", 
          description: "Electricista y plomero certificado. Arreglo cualquier problema eléctrico o de plomería en tu hogar con garantía.",
          categoryId: categories.find(c => c.name === "Reparaciones")?.id!,
          userId: "sample-user-2",
          hourlyRate: 45000,
          experience: "12 años en reparaciones eléctricas y plomería",
          skills: ["Instalaciones eléctricas", "Plomería", "Reparaciones generales"],
          contactPhone: "+57 301 234 5678",
          availability: "Lunes a Domingo, 8:00 AM - 6:00 PM",
          isActive: true,
          isVerified: true,
          verificationStatus: "verified" as const,
          verificationLevel: "premium" as const,
          backgroundCheckStatus: "approved" as const,
          documentsSubmitted: true
        },
        {
          title: "Ana Tutorías Matemáticas",
          description: "Profesora de matemáticas con experiencia en todos los niveles. Ayudo a estudiantes a mejorar sus notas y comprender mejor los conceptos.",
          categoryId: categories.find(c => c.name === "Tutorías")?.id!,
          userId: "sample-user-3",
          hourlyRate: 35000,
          experience: "6 años enseñando matemáticas",
          skills: ["Matemáticas básicas", "Álgebra", "Cálculo", "Estadística"],
          contactPhone: "+57 302 345 6789",
          availability: "Lunes a Viernes, 2:00 PM - 8:00 PM",
          isActive: true,
          isVerified: true,
          verificationStatus: "verified" as const,
          verificationLevel: "standard" as const,
          backgroundCheckStatus: "approved" as const,
          documentsSubmitted: true
        },
        {
          title: "Dr. Ricardo Consultas Médicas",
          description: "Médico general con consultas domiciliarias. Atención médica de calidad en la comodidad de tu hogar.",
          categoryId: categories.find(c => c.name === "Medicina y Salud")?.id!,
          userId: "sample-user-4",
          hourlyRate: 80000,
          experience: "15 años en medicina general",
          skills: ["Medicina general", "Consulta domiciliaria", "Primeros auxilios"],
          contactPhone: "+57 303 456 7890",
          availability: "Lunes a Viernes, 9:00 AM - 7:00 PM",
          isActive: true,
          isVerified: true,
          verificationStatus: "verified" as const,
          verificationLevel: "premium" as const,
          backgroundCheckStatus: "approved" as const,
          documentsSubmitted: true
        }
      ];

      // Create sample users first
      const sampleUsers = [
        {
          username: "maria.limpieza",
          email: "maria@ejemplolimpieza.com",
          password: "demo123",
          fullName: "María González",
          address: "Condominio Las Flores",
          section: "Torre A",
          apartment: "501",
          building: "Torre A",
          phone: "+57 300 123 4567",
          isProvider: true
        },
        {
          username: "carlos.reparaciones",
          email: "carlos@ejemploreparaciones.com", 
          password: "demo123",
          fullName: "Carlos Rodríguez",
          address: "Condominio Las Flores",
          section: "Torre B", 
          apartment: "302",
          building: "Torre B",
          phone: "+57 301 234 5678",
          isProvider: true
        },
        {
          username: "ana.tutorias",
          email: "ana@ejemplotutorias.com",
          password: "demo123", 
          fullName: "Ana Patricia López",
          address: "Condominio Las Flores",
          section: "Torre A",
          apartment: "205",
          building: "Torre A", 
          phone: "+57 302 345 6789",
          isProvider: true
        },
        {
          username: "dr.ricardo",
          email: "ricardo@ejemplomedico.com",
          password: "demo123",
          fullName: "Dr. Ricardo Méndez", 
          address: "Condominio Las Flores",
          section: "Torre C",
          apartment: "401",
          building: "Torre C",
          phone: "+57 303 456 7890",
          isProvider: true
        }
      ];

      // Insert users
      const createdUsers = [];
      for (const userData of sampleUsers) {
        const [user] = await db.insert(users).values(userData).returning();
        createdUsers.push(user);
        console.log(`👤 Created user: ${user.fullName}`);
      }

      // Insert providers with actual user IDs
      const providersWithUserIds = sampleProviders.map((provider, index) => ({
        ...provider,
        userId: createdUsers[index].id
      }));

      for (const providerData of providersWithUserIds) {
        const [provider] = await db.insert(providers).values(providerData).returning();
        console.log(`👨‍💼 Created provider: ${provider.title}`);
        
        // Add some sample availability for each provider
        const weekdays = [1, 2, 3, 4, 5]; // Monday to Friday
        for (const dayOfWeek of weekdays) {
          await db.insert(providerAvailability).values({
            providerId: provider.id,
            dayOfWeek,
            startTime: "09:00",
            endTime: "17:00",
            isAvailable: true
          });
        }
      }

      // Create some sample reviews
      const sampleReviews = [
        {
          userId: createdUsers[0].id,
          providerId: providersWithUserIds[0].title,
          rating: 5,
          comment: "Excelente servicio de limpieza. Muy detallista y puntual. Totalmente recomendado.",
          serviceQuality: 5,
          communication: 5, 
          punctuality: 5,
          valueForMoney: 5,
          wouldRecommend: true,
          isVerified: true
        }
      ];

      console.log(`✅ Sample providers and users seeded successfully!`);
      
    } catch (error) {
      console.error('❌ Error seeding sample providers:', error);
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

  // Provider Availability
  async getProviderAvailability(providerId: string): Promise<ProviderAvailability[]> {
    return await db.select().from(providerAvailability).where(eq(providerAvailability.providerId, providerId));
  }

  async createProviderAvailability(insertAvailability: InsertProviderAvailability): Promise<ProviderAvailability> {
    const [availability] = await db
      .insert(providerAvailability)
      .values(insertAvailability)
      .returning();
    return availability;
  }

  // Appointments
  async getAppointmentsByProvider(providerId: string): Promise<Appointment[]> {
    return await db.select().from(appointments).where(eq(appointments.providerId, providerId));
  }

  async getAppointmentsByUser(userId: string): Promise<Appointment[]> {
    return await db.select().from(appointments).where(eq(appointments.requesterId, userId));
  }

  async createAppointment(insertAppointment: InsertAppointment): Promise<Appointment> {
    const [appointment] = await db
      .insert(appointments)
      .values(insertAppointment)
      .returning();
    return appointment;
  }

  // Verification Documents
  async getVerificationDocuments(providerId: string): Promise<VerificationDocument[]> {
    return await db.select().from(verificationDocuments).where(eq(verificationDocuments.providerId, providerId));
  }

  async createVerificationDocument(insertDocument: InsertVerificationDocument): Promise<VerificationDocument> {
    const [document] = await db
      .insert(verificationDocuments)
      .values(insertDocument)
      .returning();
    return document;
  }

  async updateVerificationDocument(id: string, documentUpdate: Partial<VerificationDocument>): Promise<VerificationDocument | undefined> {
    const [document] = await db
      .update(verificationDocuments)
      .set(documentUpdate)
      .where(eq(verificationDocuments.id, id))
      .returning();
    return document || undefined;
  }

  // Background Checks
  async getBackgroundChecks(providerId: string): Promise<BackgroundCheck[]> {
    return await db.select().from(backgroundChecks).where(eq(backgroundChecks.providerId, providerId));
  }

  async createBackgroundCheck(insertCheck: InsertBackgroundCheck): Promise<BackgroundCheck> {
    const [check] = await db
      .insert(backgroundChecks)
      .values(insertCheck)
      .returning();
    return check;
  }

  async updateBackgroundCheck(id: string, checkUpdate: Partial<BackgroundCheck>): Promise<BackgroundCheck | undefined> {
    const [check] = await db
      .update(backgroundChecks)
      .set(checkUpdate)
      .where(eq(backgroundChecks.id, id))
      .returning();
    return check || undefined;
  }

  // Verification Reviews
  async getVerificationReviews(providerId: string): Promise<VerificationReview[]> {
    return await db.select().from(verificationReviews).where(eq(verificationReviews.providerId, providerId));
  }

  async createVerificationReview(insertReview: InsertVerificationReview): Promise<VerificationReview> {
    const [review] = await db
      .insert(verificationReviews)
      .values(insertReview)
      .returning();
    return review;
  }

  // Verification Requirements
  async getVerificationRequirements(categoryId: string): Promise<VerificationRequirement[]> {
    return await db.select().from(verificationRequirements).where(eq(verificationRequirements.categoryId, categoryId));
  }

  async getAllVerificationRequirements(): Promise<VerificationRequirement[]> {
    return await db.select().from(verificationRequirements);
  }

  async createVerificationRequirement(insertRequirement: InsertVerificationRequirement): Promise<VerificationRequirement> {
    const [requirement] = await db
      .insert(verificationRequirements)
      .values(insertRequirement)
      .returning();
    return requirement;
  }

  // Payment Methods
  async getPaymentMethods(providerId: string): Promise<PaymentMethod[]> {
    return await db.select().from(paymentMethods).where(eq(paymentMethods.providerId, providerId));
  }

  async createPaymentMethod(insertPaymentMethod: InsertPaymentMethod): Promise<PaymentMethod> {
    const [paymentMethod] = await db
      .insert(paymentMethods)
      .values(insertPaymentMethod)
      .returning();
    return paymentMethod;
  }

  async updatePaymentMethod(id: string, paymentMethodUpdate: Partial<PaymentMethod>): Promise<PaymentMethod | undefined> {
    const [paymentMethod] = await db
      .update(paymentMethods)
      .set(paymentMethodUpdate)
      .where(eq(paymentMethods.id, id))
      .returning();
    return paymentMethod || undefined;
  }

  // Menu Items
  async getMenuItems(providerId: string): Promise<MenuItem[]> {
    return await db.select().from(menuItems).where(eq(menuItems.providerId, providerId));
  }

  async createMenuItem(insertMenuItem: InsertMenuItem): Promise<MenuItem> {
    const [menuItem] = await db
      .insert(menuItems)
      .values(insertMenuItem)
      .returning();
    return menuItem;
  }

  async updateMenuItem(id: string, providerId: string, menuItemUpdate: Partial<MenuItem>): Promise<MenuItem | undefined> {
    const [menuItem] = await db
      .update(menuItems)
      .set(menuItemUpdate)
      .where(and(
        eq(menuItems.id, id),
        eq(menuItems.providerId, providerId)
      ))
      .returning();
    return menuItem || undefined;
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

  // Required for Replit Auth
  async upsertUser(userData: any): Promise<User> {
    const fullName = `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || userData.email.split('@')[0];
    const username = userData.email.split('@')[0];
    
    const existingUser = this.users.get(userData.id);
    const user: User = {
      id: userData.id,
      username: existingUser?.username || username,
      email: userData.email,
      password: existingUser?.password || 'oauth_user',
      fullName,
      avatar: userData.profileImageUrl,
      address: existingUser?.address || null,
      section: existingUser?.section || null,
      apartment: existingUser?.apartment || null,
      building: existingUser?.building || null,
      phone: existingUser?.phone || null,
      isProvider: existingUser?.isProvider || false,
      createdAt: existingUser?.createdAt || new Date(),
    };
    
    this.users.set(userData.id, user);
    return user;
  }

  // Menu Item Variations
  async getMenuItemVariations(menuItemId: string): Promise<MenuItemVariation[]> {
    return await db.select().from(menuItemVariations).where(eq(menuItemVariations.menuItemId, menuItemId));
  }

  async createMenuItemVariation(insertVariation: InsertMenuItemVariation): Promise<MenuItemVariation> {
    const [variation] = await db
      .insert(menuItemVariations)
      .values(insertVariation)
      .returning();
    return variation;
  }
}

export const storage = new DatabaseStorage();
