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
import { randomUUID } from "crypto";
import bcrypt from "bcrypt";
import { db } from "./db";
import { eq, and } from "drizzle-orm";
import { DatabaseStorage } from "./database-storage";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByResetToken(token: string): Promise<User | undefined>;
  getUsers(excludeUserId?: string): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<User>): Promise<User | undefined>;
  upsertUser(user: any): Promise<User>;

  // Service Categories
  getServiceCategories(): Promise<ServiceCategory[]>;
  getServiceCategory(id: string): Promise<ServiceCategory | undefined>;
  createServiceCategory(category: InsertServiceCategory): Promise<ServiceCategory>;

  // Service Subcategories
  getServiceSubcategories(): Promise<ServiceSubcategory[]>;
  getServiceSubcategoriesByCategory(categoryId: string): Promise<ServiceSubcategory[]>;
  getServiceSubcategory(id: string): Promise<ServiceSubcategory | undefined>;
  createServiceSubcategory(subcategory: InsertServiceSubcategory): Promise<ServiceSubcategory>;

  // Providers
  getProviders(): Promise<Provider[]>;
  getProvidersByCategory(categoryId: string): Promise<Provider[]>;
  getProvider(id: string): Promise<Provider | undefined>;
  getProviderByUserId(userId: string): Promise<Provider | undefined>;
  createProvider(provider: InsertProvider): Promise<Provider>;
  updateProvider(id: string, provider: Partial<Provider>): Promise<Provider | undefined>;

  // Reviews
  getReviewsByProvider(providerId: string): Promise<Review[]>;
  getReviewsByUser(userId: string): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;

  // Service Requests
  getServiceRequests(): Promise<ServiceRequest[]>;
  getServiceRequestsByUser(userId: string): Promise<ServiceRequest[]>;
  getServiceRequestsByProvider(providerId: string): Promise<ServiceRequest[]>;
  getServiceRequestByPaymentIntentId(paymentIntentId: string): Promise<ServiceRequest | undefined>;
  createServiceRequest(request: InsertServiceRequest): Promise<ServiceRequest>;
  updateServiceRequest(id: string, request: Partial<ServiceRequest>): Promise<ServiceRequest | undefined>;

  // Provider Availability
  getProviderAvailability(providerId: string): Promise<ProviderAvailability[]>;
  createProviderAvailability(availability: InsertProviderAvailability): Promise<ProviderAvailability>;
  updateProviderAvailability(id: string, data: Partial<InsertProviderAvailability>): Promise<ProviderAvailability | undefined>;
  deleteProviderAvailability(id: string): Promise<boolean>;
  deleteAllProviderAvailability(providerId: string): Promise<void>;

  // Appointments
  getAppointmentsByProvider(providerId: string): Promise<Appointment[]>;
  getAppointmentsByUser(userId: string): Promise<Appointment[]>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;

  // Messages
  getMessagesByRequest(requestId: string): Promise<Message[]>;
  getConversation(userId1: string, userId2: string, viewerId?: string): Promise<Message[]>;
  getUserConversations(userId: string): Promise<Conversation[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  getMessage(id: string): Promise<Message | undefined>;
  markMessageAsRead(id: string): Promise<Message | undefined>;
  getUnreadMessageCount(userId: string): Promise<number>;
  deleteMessage(messageId: string, userId: string): Promise<Message | undefined>;
  forwardMessage(messageId: string, newReceiverId: string, senderId: string): Promise<Message>;
  deleteConversation(forUserId: string, otherUserId: string): Promise<void>;

  // Admin Messages
  getAdminMessages(): Promise<AdminMessage[]>;
  getAdminMessagesByUser(userId: string): Promise<AdminMessage[]>;
  getAdminMessage(id: string): Promise<AdminMessage | undefined>;
  createAdminMessage(message: InsertAdminMessage): Promise<AdminMessage>;
  updateAdminMessage(id: string, message: Partial<AdminMessage>): Promise<AdminMessage | undefined>;
  markAdminMessageAsReadByUser(id: string): Promise<AdminMessage | undefined>;
  markAdminMessageAsReadByAdmin(id: string): Promise<AdminMessage | undefined>;
  getUnreadAdminMessageCountForUser(userId: string): Promise<number>;
  getUnreadAdminMessageCountForAdmin(): Promise<number>;

  // Category Requests
  getCategoryRequests(): Promise<CategoryRequest[]>;
  getCategoryRequestsByUser(userId: string): Promise<CategoryRequest[]>;
  getCategoryRequest(id: string): Promise<CategoryRequest | undefined>;
  createCategoryRequest(request: InsertCategoryRequest): Promise<CategoryRequest>;
  updateCategoryRequest(id: string, request: Partial<CategoryRequest>): Promise<CategoryRequest | undefined>;

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

  // Provider Categories (Many-to-Many)
  createProviderCategory(data: InsertProviderCategory): Promise<ProviderCategory>;
  getProviderCategories(providerId: string): Promise<ProviderCategory[]>;
  deleteProviderCategory(id: string): Promise<void>;
  deleteAllProviderCategories(providerId: string): Promise<void>;
  createProviderWithCategories(
    providerData: InsertProvider, 
    categories: Array<{categoryId: string, subcategoryId?: string, isPrimary?: boolean}>
  ): Promise<Provider>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private serviceCategories: Map<string, ServiceCategory>;
  private serviceSubcategories: Map<string, ServiceSubcategory>;
  private providers: Map<string, Provider>;
  private reviews: Map<string, Review>;
  private serviceRequests: Map<string, ServiceRequest>;
  private providerAvailability: Map<string, ProviderAvailability>;
  private appointments: Map<string, Appointment>;
  private messages: Map<string, Message>;
  private adminMessages: Map<string, AdminMessage>;
  private verificationDocuments: Map<string, VerificationDocument>;
  private backgroundChecks: Map<string, BackgroundCheck>;
  private verificationReviews: Map<string, VerificationReview>;
  private verificationRequirements: Map<string, VerificationRequirement>;
  private paymentMethods: Map<string, PaymentMethod>;
  private menuItems: Map<string, MenuItem>;
  private menuItemVariations: Map<string, MenuItemVariation>;
  private providerCategories: Map<string, ProviderCategory>;

  constructor() {
    console.log("🏗️  Initializing MemStorage...");
    this.users = new Map();
    this.serviceCategories = new Map();
    this.serviceSubcategories = new Map();
    this.providers = new Map();
    this.reviews = new Map();
    this.serviceRequests = new Map();
    this.providerAvailability = new Map();
    this.appointments = new Map();
    this.messages = new Map();
    this.adminMessages = new Map();
    this.verificationDocuments = new Map();
    this.backgroundChecks = new Map();
    this.verificationReviews = new Map();
    this.verificationRequirements = new Map();
    this.paymentMethods = new Map();
    this.menuItems = new Map();
    this.menuItemVariations = new Map();
    this.providerCategories = new Map();
    
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
        password: bcrypt.hashSync("password123", 10),
        fullName: "María García",
        address: "Condominio Las Flores, Torre Norte",
        section: "Norte", 
        apartment: "304",
        building: "Edificio A", 
        phone: "+1234567890",
        isProvider: true,
        condominioMaestro: "Las Flores",
        condominio: "Sección A",
        edificioOArea: "Torre Norte",
        calle: "Av. Insurgentes Sur",
        colonia: "Roma Norte",
        codigoPostal: "06700",
        numeroExterior: "123",
        numeroInterior: "304",
        municipio: "Cuauhtémoc",
        estado: "CDMX",
        addressNotes: "Portón verde",
      },
      {
        username: "carlos.mendoza",
        email: "carlos@example.com",
        password: bcrypt.hashSync("password123", 10),
        fullName: "Carlos Mendoza",
        address: "Condominio Las Flores, Torre Sur", 
        section: "Sur",
        apartment: "201",
        building: "Edificio B",
        phone: "+1234567891",
        isProvider: true,
        condominioMaestro: "Las Flores",
        condominio: "Sección B",
        edificioOArea: "Torre Sur",
        calle: "Av. Insurgentes Sur",
        colonia: "Roma Norte",
        codigoPostal: "06700",
        numeroExterior: "125",
        numeroInterior: "201",
        municipio: "Cuauhtémoc",
        estado: "CDMX",
        addressNotes: null,
      },
      {
        username: "ana.ruiz", 
        email: "ana@example.com",
        password: bcrypt.hashSync("password123", 10),
        fullName: "Ana Ruiz",
        address: "Condominio Las Flores, Torre Este",
        section: "Este",
        apartment: "405",
        building: "Edificio C",
        phone: "+1234567892",
        isProvider: true,
        condominioMaestro: "Las Flores",
        condominio: "Sección C",
        edificioOArea: "Torre Este",
        calle: "Av. Insurgentes Sur",
        colonia: "Roma Norte",
        codigoPostal: "06700",
        numeroExterior: "127",
        numeroInterior: "405",
        municipio: "Cuauhtémoc",
        estado: "CDMX",
        addressNotes: "Entrada lateral",
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
          subcategoryId: null,
          isActive: true,
          isVerified: true,
          verificationStatus: "verified" as const,
          verificationLevel: "standard" as const,
          lastVerificationDate: new Date(),
          backgroundCheckStatus: "completed" as const,
          documentsSubmitted: true,
          verificationNotes: null,
          menuDocumentUrl: null,
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
      condominioMaestro: insertUser.condominioMaestro || null,
      condominio: insertUser.condominio || null,
      edificioOArea: insertUser.edificioOArea || null,
      calle: insertUser.calle || null,
      colonia: insertUser.colonia || null,
      codigoPostal: insertUser.codigoPostal || null,
      numeroExterior: insertUser.numeroExterior || null,
      numeroInterior: insertUser.numeroInterior || null,
      municipio: insertUser.municipio || null,
      estado: insertUser.estado || null,
      addressNotes: insertUser.addressNotes || null,
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
    const category: ServiceCategory = { 
      ...insertCategory, 
      id,
      description: insertCategory.description ?? null,
      icon: insertCategory.icon ?? null,
      color: insertCategory.color ?? null,
    };
    this.serviceCategories.set(id, category);
    return category;
  }

  // Service Subcategories
  async getServiceSubcategories(): Promise<ServiceSubcategory[]> {
    return Array.from(this.serviceSubcategories.values());
  }

  async getServiceSubcategoriesByCategory(categoryId: string): Promise<ServiceSubcategory[]> {
    return Array.from(this.serviceSubcategories.values()).filter(sub => sub.categoryId === categoryId);
  }

  async getServiceSubcategory(id: string): Promise<ServiceSubcategory | undefined> {
    return this.serviceSubcategories.get(id);
  }

  async createServiceSubcategory(insertSubcategory: InsertServiceSubcategory): Promise<ServiceSubcategory> {
    const id = randomUUID();
    const subcategory: ServiceSubcategory = { 
      ...insertSubcategory, 
      id,
      order: insertSubcategory.order ?? null,
      createdAt: new Date()
    };
    this.serviceSubcategories.set(id, subcategory);
    return subcategory;
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
      categoryId: insertProvider.categoryId ?? null,
      subcategoryId: insertProvider.subcategoryId ?? null,
      hourlyRate: insertProvider.hourlyRate ?? null,
      experience: insertProvider.experience ?? null,
      isActive: insertProvider.isActive ?? true,
      isVerified: false,
      verificationStatus: insertProvider.verificationStatus ?? "pending",
      verificationLevel: insertProvider.verificationLevel ?? "basic",
      lastVerificationDate: insertProvider.lastVerificationDate ?? null,
      backgroundCheckStatus: insertProvider.backgroundCheckStatus ?? "not_started", 
      documentsSubmitted: insertProvider.documentsSubmitted ?? false,
      verificationNotes: insertProvider.verificationNotes ?? null,
      menuDocumentUrl: insertProvider.menuDocumentUrl ?? null,
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
    return Array.from(this.reviews.values()).filter(r => r.providerId === providerId && r.reviewType === 'provider_review');
  }

  async getReviewsByUser(userId: string): Promise<Review[]> {
    return Array.from(this.reviews.values()).filter(r => r.reviewedUserId === userId && r.reviewType === 'customer_review');
  }

  async createReview(insertReview: InsertReview): Promise<Review> {
    const id = randomUUID();
    const review: Review = { 
      ...insertReview, 
      id, 
      reviewType: insertReview.reviewType ?? 'provider_review',
      reviewedUserId: insertReview.reviewedUserId ?? null,
      comment: insertReview.comment ?? null,
      isVerified: insertReview.isVerified ?? false,
      photos: insertReview.photos ?? null,
      serviceQuality: insertReview.serviceQuality ?? null,
      communication: insertReview.communication ?? null,
      punctuality: insertReview.punctuality ?? null,
      valueForMoney: insertReview.valueForMoney ?? null,
      wouldRecommend: insertReview.wouldRecommend ?? null,
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

  async getServiceRequestByPaymentIntentId(paymentIntentId: string): Promise<ServiceRequest | undefined> {
    return Array.from(this.serviceRequests.values()).find(r => r.paymentIntentId === paymentIntentId);
  }

  async createServiceRequest(insertRequest: InsertServiceRequest): Promise<ServiceRequest> {
    const id = randomUUID();
    const request: ServiceRequest = { 
      ...insertRequest, 
      id, 
      status: "pending",
      preferredDate: insertRequest.preferredDate ?? null,
      preferredTime: insertRequest.preferredTime ?? null,
      estimatedDuration: insertRequest.estimatedDuration ?? null,
      location: insertRequest.location ?? null,
      notes: insertRequest.notes ?? null,
      totalAmount: insertRequest.totalAmount ?? null,
      confirmedDate: insertRequest.confirmedDate ?? null,
      confirmedTime: insertRequest.confirmedTime ?? null,
      paymentIntentId: insertRequest.paymentIntentId ?? null,
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

  async updateProviderAvailability(id: string, data: Partial<InsertProviderAvailability>): Promise<ProviderAvailability | undefined> {
    const existing = this.providerAvailability.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...data };
    this.providerAvailability.set(id, updated);
    return updated;
  }

  async deleteProviderAvailability(id: string): Promise<boolean> {
    return this.providerAvailability.delete(id);
  }

  async deleteAllProviderAvailability(providerId: string): Promise<void> {
    const toDelete = Array.from(this.providerAvailability.values())
      .filter(a => a.providerId === providerId)
      .map(a => a.id);
    toDelete.forEach(id => this.providerAvailability.delete(id));
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

  async getConversation(userId1: string, userId2: string, viewerId?: string): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(m => {
        // Check if message is part of this conversation
        const isInConversation = (m.senderId === userId1 && m.receiverId === userId2) ||
                                  (m.senderId === userId2 && m.receiverId === userId1);
        
        if (!isInConversation) return false;
        
        // If viewerId is provided, filter out deleted messages
        if (viewerId) {
          if (m.senderId === viewerId && m.deletedBySender) return false;
          if (m.receiverId === viewerId && m.deletedByReceiver) return false;
        }
        
        return true;
      })
      .sort((a, b) => a.createdAt!.getTime() - b.createdAt!.getTime());
  }

  async getUserConversations(userId: string): Promise<Conversation[]> {
    // Get all messages where user is sender or receiver
    const userMessages = Array.from(this.messages.values())
      .filter(m => m.senderId === userId || m.receiverId === userId)
      .sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime());

    // Group by conversation partner
    const conversationMap = new Map<string, Message>();
    for (const message of userMessages) {
      const otherUserId = message.senderId === userId ? message.receiverId : message.senderId;
      if (!conversationMap.has(otherUserId)) {
        conversationMap.set(otherUserId, message);
      }
    }

    // Build conversation objects with user details
    const conversations: Conversation[] = [];
    const conversationEntries = Array.from(conversationMap.entries());
    for (const [otherUserId, lastMessage] of conversationEntries) {
      const otherUser = this.users.get(otherUserId);
      if (otherUser) {
        conversations.push({
          otherUserId,
          otherUserName: otherUser.fullName,
          otherUserEmail: otherUser.email,
          otherUserAvatar: otherUser.avatar || null,
          lastMessage: lastMessage.content,
          lastMessageTime: lastMessage.createdAt!,
          lastMessageSenderId: lastMessage.senderId,
        });
      }
    }

    return conversations;
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = randomUUID();
    const message: Message = { 
      ...insertMessage, 
      id, 
      requestId: insertMessage.requestId || null,
      isRead: false,
      createdAt: new Date() 
    };
    this.messages.set(id, message);
    return message;
  }

  async getMessage(id: string): Promise<Message | undefined> {
    return this.messages.get(id);
  }

  async markMessageAsRead(id: string): Promise<Message | undefined> {
    const message = this.messages.get(id);
    if (message) {
      message.isRead = true;
      this.messages.set(id, message);
      return message;
    }
    return undefined;
  }

  async getUnreadMessageCount(userId: string): Promise<number> {
    let count = 0;
    for (const message of this.messages.values()) {
      if (message.receiverId === userId && !message.isRead) {
        count++;
      }
    }
    return count;
  }

  async deleteMessage(messageId: string, userId: string): Promise<Message | undefined> {
    const message = this.messages.get(messageId);
    if (!message) {
      return undefined;
    }
    
    if (message.senderId === userId) {
      message.deletedBySender = true;
    } else if (message.receiverId === userId) {
      message.deletedByReceiver = true;
    } else {
      return undefined;
    }
    
    message.deletedAt = new Date();
    this.messages.set(messageId, message);
    return message;
  }

  async forwardMessage(messageId: string, newReceiverId: string, senderId: string): Promise<Message> {
    const originalMessage = this.messages.get(messageId);
    if (!originalMessage) {
      throw new Error('Original message not found');
    }
    
    const id = randomUUID();
    const forwardedMessage: Message = {
      id,
      senderId,
      receiverId: newReceiverId,
      requestId: null,
      content: originalMessage.content,
      isRead: false,
      deletedBySender: false,
      deletedByReceiver: false,
      deletedAt: null,
      forwardedFrom: messageId,
      createdAt: new Date()
    };
    
    this.messages.set(id, forwardedMessage);
    return forwardedMessage;
  }

  async markAdminMessageAsReadByUser(id: string): Promise<AdminMessage | undefined> {
    const message = this.adminMessages.get(id);
    if (message) {
      message.isReadByUser = true;
      this.adminMessages.set(id, message);
      return message;
    }
    return undefined;
  }

  async markAdminMessageAsReadByAdmin(id: string): Promise<AdminMessage | undefined> {
    const message = this.adminMessages.get(id);
    if (message) {
      message.isReadByAdmin = true;
      this.adminMessages.set(id, message);
      return message;
    }
    return undefined;
  }

  async getUnreadAdminMessageCountForUser(userId: string): Promise<number> {
    let count = 0;
    for (const message of this.adminMessages.values()) {
      if (message.userId === userId && !message.isReadByUser) {
        count++;
      }
    }
    return count;
  }

  async getUnreadAdminMessageCountForAdmin(): Promise<number> {
    let count = 0;
    for (const message of this.adminMessages.values()) {
      if (!message.isReadByAdmin) {
        count++;
      }
    }
    return count;
  }

  // Admin Messages - stubbed for MemStorage (not used in production)
  async getAdminMessages(): Promise<AdminMessage[]> {
    return [];
  }

  async getAdminMessagesByUser(userId: string): Promise<AdminMessage[]> {
    return [];
  }

  async getAdminMessage(id: string): Promise<AdminMessage | undefined> {
    return undefined;
  }

  async createAdminMessage(message: InsertAdminMessage): Promise<AdminMessage> {
    const id = randomUUID();
    return {
      ...message,
      id,
      status: 'open',
      adminResponse: null,
      respondedBy: null,
      respondedAt: null,
      createdAt: new Date(),
      updatedAt: new Date()
    } as AdminMessage;
  }

  async updateAdminMessage(id: string, message: Partial<AdminMessage>): Promise<AdminMessage | undefined> {
    return undefined;
  }

  // Category Requests - stubbed for MemStorage (not used in production)
  async getCategoryRequests(): Promise<CategoryRequest[]> {
    return [];
  }

  async getCategoryRequestsByUser(userId: string): Promise<CategoryRequest[]> {
    return [];
  }

  async getCategoryRequest(id: string): Promise<CategoryRequest | undefined> {
    return undefined;
  }

  async createCategoryRequest(request: InsertCategoryRequest): Promise<CategoryRequest> {
    const id = randomUUID();
    return {
      ...request,
      id,
      status: 'pending',
      adminResponse: null,
      reviewedBy: null,
      reviewedAt: null,
      createdAt: new Date()
    } as CategoryRequest;
  }

  async updateCategoryRequest(id: string, request: Partial<CategoryRequest>): Promise<CategoryRequest | undefined> {
    return undefined;
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
      description: menuItem.description ?? null,
      imageUrl: menuItem.imageUrl ?? null,
      isAvailable: menuItem.isAvailable ?? null,
      duration: menuItem.duration ?? null,
      hasVariations: menuItem.hasVariations ?? null,
      minQuantity: menuItem.minQuantity ?? null,
      maxQuantity: menuItem.maxQuantity ?? null,
      sortOrder: menuItem.sortOrder ?? null,
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
      id,
      isRequired: variation.isRequired ?? null,
      sortOrder: variation.sortOrder ?? null,
      priceModifier: variation.priceModifier ?? null,
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
      status: doc.status ?? "pending",
      reviewedBy: doc.reviewedBy ?? null,
      reviewedAt: null,
      reviewNotes: doc.reviewNotes ?? null,
      expiryDate: doc.expiryDate ?? null,
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
      status: check.status ?? "pending",
      result: check.result ?? null,
      thirdPartyId: check.thirdPartyId ?? null,
      completedAt: null,
      validUntil: check.validUntil ?? null,
      notes: check.notes ?? null,
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
      comments: review.comments ?? null,
      actionTaken: review.actionTaken ?? null,
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
      id,
      isRequired: requirement.isRequired ?? null,
    };
    this.verificationRequirements.set(id, newRequirement);
    return newRequirement;
  }

  // Provider Categories (Many-to-Many)
  async createProviderCategory(data: InsertProviderCategory): Promise<ProviderCategory> {
    const id = randomUUID();
    const newProviderCategory: ProviderCategory = {
      ...data,
      id,
      subcategoryId: data.subcategoryId || null,
      isPrimary: data.isPrimary || false,
      createdAt: new Date()
    };
    this.providerCategories.set(id, newProviderCategory);
    return newProviderCategory;
  }

  async getProviderCategories(providerId: string): Promise<ProviderCategory[]> {
    return Array.from(this.providerCategories.values()).filter(pc => pc.providerId === providerId);
  }

  async deleteProviderCategory(id: string): Promise<void> {
    this.providerCategories.delete(id);
  }

  async deleteAllProviderCategories(providerId: string): Promise<void> {
    const toDelete = Array.from(this.providerCategories.entries())
      .filter(([_, pc]) => pc.providerId === providerId)
      .map(([id]) => id);
    
    toDelete.forEach(id => this.providerCategories.delete(id));
  }

  async createProviderWithCategories(
    providerData: InsertProvider, 
    categories: Array<{categoryId: string, subcategoryId?: string, isPrimary?: boolean}>
  ): Promise<Provider> {
    const firstCategory = categories[0];
    const providerToInsert = {
      ...providerData,
      categoryId: firstCategory?.categoryId || null,
      subcategoryId: firstCategory?.subcategoryId || null,
    };
    
    const provider = await this.createProvider(providerToInsert);
    
    if (categories.length > 0) {
      for (const cat of categories) {
        await this.createProviderCategory({
          providerId: provider.id,
          categoryId: cat.categoryId,
          subcategoryId: cat.subcategoryId,
          isPrimary: cat.isPrimary || false,
        });
      }
    }
    
    return provider;
  }

  // Required for Replit Auth
  async upsertUser(userData: any): Promise<User> {
    const existingUser = this.users.get(userData.id);
    const fullName = `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || userData.email?.split('@')[0] || userData.id;
    const user: User = {
      id: userData.id,
      email: userData.email,
      username: userData.email?.split('@')[0] || userData.id,
      fullName,
      password: existingUser?.password || '',
      address: existingUser?.address || null,
      section: existingUser?.section || null,
      apartment: existingUser?.apartment || null,
      building: existingUser?.building || null,
      phone: existingUser?.phone || null,
      isProvider: existingUser?.isProvider || false,
      avatar: userData.profileImageUrl || existingUser?.avatar || null,
      condominioMaestro: existingUser?.condominioMaestro || null,
      condominio: existingUser?.condominio || null,
      edificioOArea: existingUser?.edificioOArea || null,
      calle: existingUser?.calle || null,
      colonia: existingUser?.colonia || null,
      codigoPostal: existingUser?.codigoPostal || null,
      numeroExterior: existingUser?.numeroExterior || null,
      numeroInterior: existingUser?.numeroInterior || null,
      municipio: existingUser?.municipio || null,
      estado: existingUser?.estado || null,
      addressNotes: existingUser?.addressNotes || null,
      createdAt: existingUser?.createdAt || new Date(),
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
        condominioMaestro: "Las Flores",
        condominio: "Sección Central",
        edificioOArea: "Edificio D",
        calle: "Av. Insurgentes Sur",
        colonia: "Roma Norte",
        codigoPostal: "06700",
        numeroExterior: "129",
        numeroInterior: "102",
        municipio: "Cuauhtémoc",
        estado: "CDMX",
        addressNotes: null,
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

// Always use DatabaseStorage for consistent data source
console.log("🔧 Using DatabaseStorage as primary storage backend");
export const storage = new DatabaseStorage();
