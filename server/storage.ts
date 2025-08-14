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
  verificationRequirements
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

  constructor() {
    this.users = new Map();
    this.serviceCategories = new Map();
    this.providers = new Map();
    this.reviews = new Map();
    this.serviceRequests = new Map();
    this.providerAvailability = new Map();
    this.appointments = new Map();
    this.messages = new Map();
    
    this.seedData();
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
        hourlyRate: "25",
        experience: "5 años de experiencia",
      },
      {
        userId: userIds[1],
        categoryId: availableCategories[1]?.id, // Reparaciones
        title: "Reparaciones Eléctricas y Plomería",
        description: "Especialista en instalaciones eléctricas y reparaciones de plomería. Certificado profesional.",
        hourlyRate: "40",
        experience: "8 años de experiencia",
      },
      {
        userId: userIds[2],
        categoryId: availableCategories[4]?.id, // Tutorías
        title: "Clases de Matemáticas y Física",
        description: "Profesor universitario ofrece clases particulares de matemáticas y física para todos los niveles.",
        hourlyRate: "30",
        experience: "10 años de experiencia",
      },
    ];

    providerData.forEach(provider => {
      if (provider.categoryId) {
        const id = randomUUID();
        const newProvider = {
          id,
          ...provider,
          isVerified: true,
          isActive: true,
          verificationStatus: "verified",
          verificationLevel: "standard",
          verificationDate: new Date(),
          serviceAreas: null,
          verificationNotes: null,
          createdAt: new Date(),
        };
        this.providers.set(id, newProvider);
        console.log(`Created provider: ${newProvider.title} with ID: ${id}`);
      }
    });
    
    console.log(`Total providers created: ${this.providers.size}`);
    console.log(`Available categories: ${availableCategories.length}`);
    console.log(`Provider data entries: ${providerData.length}`);
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
      hourlyRate: insertProvider.hourlyRate || null,
      experience: insertProvider.experience || null,
      isVerified: insertProvider.isVerified || false, 
      isActive: insertProvider.isActive !== false, 
      verificationStatus: insertProvider.verificationStatus || null,
      verificationLevel: insertProvider.verificationLevel || null,
      verificationDate: insertProvider.verificationDate || null,
      serviceAreas: insertProvider.serviceAreas || null,
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

  // Provider Availability
  async getProviderAvailability(providerId: string): Promise<ProviderAvailability[]> {
    return Array.from(this.providerAvailability.values()).filter(a => a.providerId === providerId);
  }

  async createProviderAvailability(insertAvailability: InsertProviderAvailability): Promise<ProviderAvailability> {
    const id = randomUUID();
    const availability: ProviderAvailability = { 
      ...insertAvailability, 
      id, 
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
    const message: Message = { ...insertMessage, id, createdAt: new Date() };
    this.messages.set(id, message);
    return message;
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
      if (existingCategories.length > 15) {
        return; // Comprehensive categories already seeded
      }
      
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
}

export const storage = new DatabaseStorage();
