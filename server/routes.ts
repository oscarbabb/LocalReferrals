import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  ObjectStorageService,
  ObjectNotFoundError,
} from "./objectStorage";
import { z } from "zod";
import Stripe from "stripe";
import { randomBytes } from "crypto";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { 
  insertUserSchema, 
  insertProviderSchema, 
  insertReviewSchema, 
  insertServiceRequestSchema,
  insertProviderAvailabilitySchema,
  insertAppointmentSchema,
  insertMessageSchema,
  insertPaymentMethodSchema,
  insertMenuItemSchema,
  insertMenuItemVariationSchema
} from "@shared/schema";

// Initialize Stripe
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Temporary storage for provider setup tokens (in production, use Redis or database)
const providerSetupTokens = new Map<string, { userId: string, expiresAt: number }>();

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Authentication routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Get current user's provider profile
  app.get('/api/auth/provider', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const provider = await storage.getProviderByUserId(userId);
      if (!provider) {
        return res.status(404).json({ message: "Provider profile not found" });
      }
      res.json(provider);
    } catch (error) {
      console.error("Error fetching provider:", error);
      res.status(500).json({ message: "Failed to fetch provider" });
    }
  });
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // In a real app, you would hash and compare passwords
      // For now, we'll implement basic validation
      if (user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Create session or JWT token here
      // For now, return user data
      res.json({
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          fullName: user.fullName,
        },
        message: "Login successful"
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/auth/logout", async (req, res) => {
    // Clear session or invalidate token
    res.json({ message: "Logout successful" });
  });

  // Stripe payment routes
  app.post("/api/create-payment-intent", async (req, res) => {
    try {
      const { amount, description, metadata } = req.body;
      
      if (!amount || amount < 50) { // Minimum 50 cents
        return res.status(400).json({ message: "Invalid amount" });
      }

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert pesos to centavos
        currency: "mxn",
        description: description || "Servicio Referencias Locales",
        metadata: metadata || {},
        automatic_payment_methods: {
          enabled: true,
        },
      });
      
      res.json({ 
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id 
      });
    } catch (error: any) {
      console.error("Stripe error:", error);
      res.status(500).json({ 
        message: "Error creating payment intent", 
        error: error.message 
      });
    }
  });

  app.post("/api/webhook/stripe", async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
      // For development, if no webhook secret is set, skip verification
      if (process.env.STRIPE_WEBHOOK_SECRET) {
        event = stripe.webhooks.constructEvent(req.body, sig!, process.env.STRIPE_WEBHOOK_SECRET);
      } else {
        event = req.body;
      }
    } catch (err: any) {
      console.log(`Webhook signature verification failed.`, err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        console.log('Payment succeeded:', paymentIntent.id);
        // TODO: Update booking status, send confirmation emails
        break;
      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object;
        console.log('Payment failed:', failedPayment.id);
        // TODO: Handle failed payment
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  });

  // Service Categories
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getServiceCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  // Providers
  app.get("/api/providers", async (req, res) => {
    try {
      const { categoryId } = req.query;
      let providers;
      
      if (categoryId) {
        providers = await storage.getProvidersByCategory(categoryId as string);
      } else {
        providers = await storage.getProviders();
      }
      
      // Get user details for each provider
      const providersWithUsers = await Promise.all(
        providers.map(async (provider) => {
          const user = await storage.getUser(provider.userId);
          const reviews = await storage.getReviewsByProvider(provider.id);
          const averageRating = reviews.length > 0 
            ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
            : 0;
          
          return {
            ...provider,
            user,
            reviewCount: reviews.length,
            averageRating: Math.round(averageRating * 10) / 10,
          };
        })
      );
      
      res.json(providersWithUsers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch providers" });
    }
  });

  // Get single provider by ID
  app.get("/api/providers/:id", async (req, res) => {
    try {
      const provider = await storage.getProvider(req.params.id);
      if (!provider) {
        return res.status(404).json({ message: "Provider not found" });
      }
      res.json(provider);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch provider" });
    }
  });

  // Reviews
  app.get("/api/reviews/:providerId", async (req, res) => {
    try {
      const reviews = await storage.getReviewsByProvider(req.params.providerId);
      
      // Get reviewer details for each review
      const reviewsWithReviewers = await Promise.all(
        reviews.map(async (review) => {
          const reviewer = await storage.getUser(review.reviewerId);
          return {
            ...review,
            reviewer: reviewer ? {
              fullName: reviewer.fullName,
              avatar: reviewer.avatar,
              building: reviewer.building,
              apartment: reviewer.apartment
            } : null
          };
        })
      );
      
      res.json(reviewsWithReviewers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  // Create new review
  app.post("/api/reviews", async (req, res) => {
    try {
      const reviewData = insertReviewSchema.parse(req.body);
      const review = await storage.createReview(reviewData);
      res.status(201).json(review);
    } catch (error) {
      res.status(400).json({ message: "Invalid review data" });
    }
  });

  // Object Storage endpoints for photo uploads
  app.get("/public-objects/:filePath(*)", async (req, res) => {
    const filePath = req.params.filePath;
    const objectStorageService = new ObjectStorageService();
    try {
      const file = await objectStorageService.searchPublicObject(filePath);
      if (!file) {
        return res.status(404).json({ error: "File not found" });
      }
      objectStorageService.downloadObject(file, res);
    } catch (error) {
      console.error("Error searching for public object:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/objects/upload", async (req, res) => {
    const objectStorageService = new ObjectStorageService();
    const uploadURL = await objectStorageService.getObjectEntityUploadURL();
    res.json({ uploadURL });
  });

  app.put("/api/review-photos", async (req, res) => {
    if (!req.body.photoURL) {
      return res.status(400).json({ error: "photoURL is required" });
    }

    try {
      const objectStorageService = new ObjectStorageService();
      const objectPath = await objectStorageService.trySetObjectEntityAclPolicy(
        req.body.photoURL,
        {
          owner: "system",
          visibility: "public" // Review photos are public
        }
      );

      res.status(200).json({
        objectPath: objectPath,
      });
    } catch (error) {
      console.error("Error setting review photo:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/profile-photos", async (req, res) => {
    if (!req.body.photoURL) {
      return res.status(400).json({ error: "photoURL is required" });
    }

    if (!req.body.providerSetupToken) {
      return res.status(401).json({ error: "Provider setup token is required" });
    }

    try {
      // Security: Validate the setup token and get userId server-side
      const tokenData = providerSetupTokens.get(req.body.providerSetupToken);
      if (!tokenData) {
        return res.status(401).json({ error: "Invalid or expired setup token" });
      }

      // Check if token has expired
      if (Date.now() > tokenData.expiresAt) {
        providerSetupTokens.delete(req.body.providerSetupToken);
        return res.status(401).json({ error: "Setup token has expired" });
      }

      const userId = tokenData.userId; // Get userId from server-side token, not client

      const objectStorageService = new ObjectStorageService();
      const objectPath = await objectStorageService.trySetObjectEntityAclPolicy(
        req.body.photoURL,
        {
          owner: "system",
          visibility: "public" // Profile photos are public
        }
      );

      // Update user's avatar field in database
      await storage.updateUser(userId, { avatar: objectPath });

      res.status(200).json({
        objectPath: objectPath,
      });
    } catch (error) {
      console.error("Error setting profile photo:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/providers/:id", async (req, res) => {
    try {
      const provider = await storage.getProvider(req.params.id);
      if (!provider) {
        return res.status(404).json({ message: "Provider not found" });
      }
      
      const user = await storage.getUser(provider.userId);
      const reviews = await storage.getReviewsByProvider(provider.id);
      const averageRating = reviews.length > 0 
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
        : 0;

      const reviewsWithUsers = await Promise.all(
        reviews.map(async (review) => {
          const reviewer = await storage.getUser(review.reviewerId);
          return { ...review, reviewer };
        })
      );
      
      res.json({
        ...provider,
        user,
        reviews: reviewsWithUsers,
        reviewCount: reviews.length,
        averageRating: Math.round(averageRating * 10) / 10,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch provider details" });
    }
  });

  app.post("/api/providers", async (req, res) => {
    try {
      const { providerSetupToken, ...providerData } = req.body;
      
      // Security: Validate the setup token instead of trusting client-supplied userId
      if (!providerSetupToken) {
        return res.status(400).json({ message: "Provider setup token is required" });
      }
      
      const tokenData = providerSetupTokens.get(providerSetupToken);
      if (!tokenData) {
        return res.status(400).json({ message: "Invalid or expired setup token" });
      }
      
      // Check if token has expired
      if (Date.now() > tokenData.expiresAt) {
        providerSetupTokens.delete(providerSetupToken);
        return res.status(400).json({ message: "Setup token has expired" });
      }
      
      // Get userId from server-side token storage (not from client)
      const userId = tokenData.userId;
      
      // Validate that the user exists and is a provider
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(400).json({ message: "Invalid user" });
      }
      
      if (!user.isProvider) {
        return res.status(400).json({ message: "User is not registered as a provider" });
      }
      
      // Check if provider already exists for this user
      const existingProvider = await storage.getProviderByUserId(userId);
      if (existingProvider) {
        return res.status(400).json({ message: "Provider profile already exists for this user" });
      }
      
      // Validate provider data and include the server-determined userId
      const validatedData = insertProviderSchema.parse({
        ...providerData,
        userId: userId
      });
      
      const provider = await storage.createProvider(validatedData);
      
      // Consume the token (invalidate it after successful use)
      providerSetupTokens.delete(providerSetupToken);
      
      res.status(201).json(provider);
    } catch (error) {
      res.status(400).json({ message: "Invalid provider data" });
    }
  });

  // Users
  app.post("/api/users", async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(validatedData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }
      
      const user = await storage.createUser(validatedData);
      
      // Generate secure provider setup token if user is registering as provider
      let providerSetupToken = null;
      if (validatedData.isProvider) {
        providerSetupToken = randomBytes(32).toString('hex');
        const expiresAt = Date.now() + (30 * 60 * 1000); // 30 minutes from now
        providerSetupTokens.set(providerSetupToken, { 
          userId: user.id, 
          expiresAt 
        });
      }
      
      res.status(201).json({ 
        user,
        providerSetupToken // Only included if user is a provider
      });
    } catch (error) {
      res.status(400).json({ message: "Invalid user data" });
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Reviews
  app.post("/api/reviews", async (req, res) => {
    try {
      const validatedData = insertReviewSchema.parse(req.body);
      const review = await storage.createReview(validatedData);
      res.status(201).json(review);
    } catch (error) {
      res.status(400).json({ message: "Invalid review data" });
    }
  });

  app.get("/api/providers/:id/reviews", async (req, res) => {
    try {
      const reviews = await storage.getReviewsByProvider(req.params.id);
      const reviewsWithUsers = await Promise.all(
        reviews.map(async (review) => {
          const reviewer = await storage.getUser(review.reviewerId);
          return { ...review, reviewer };
        })
      );
      res.json(reviewsWithUsers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  // Service Requests and Booking System
  app.get("/api/service-requests", async (req, res) => {
    try {
      const { userId, providerId } = req.query;
      let requests;
      
      if (userId) {
        requests = await storage.getServiceRequestsByUser(userId as string);
      } else if (providerId) {
        requests = await storage.getServiceRequestsByProvider(providerId as string);
      } else {
        requests = await storage.getServiceRequests();
      }
      
      res.json(requests);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch service requests" });
    }
  });

  app.post("/api/service-requests", async (req, res) => {
    try {
      const requestData = insertServiceRequestSchema.parse(req.body);
      const serviceRequest = await storage.createServiceRequest(requestData);
      res.status(201).json(serviceRequest);
    } catch (error) {
      console.error("Service request creation error:", error);
      res.status(400).json({ message: "Invalid service request data" });
    }
  });

  // Provider Availability
  app.get("/api/providers/:id/availability", async (req, res) => {
    try {
      const availability = await storage.getProviderAvailability(req.params.id);
      res.json(availability);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch availability" });
    }
  });

  app.post("/api/providers/:id/availability", async (req, res) => {
    try {
      const availabilityData = insertProviderAvailabilitySchema.parse({
        ...req.body,
        providerId: req.params.id
      });
      const availability = await storage.createProviderAvailability(availabilityData);
      res.status(201).json(availability);
    } catch (error) {
      res.status(400).json({ message: "Invalid availability data" });
    }
  });

  // Appointments
  app.get("/api/appointments/:providerId", async (req, res) => {
    try {
      const appointments = await storage.getAppointmentsByProvider(req.params.providerId);
      res.json(appointments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch appointments" });
    }
  });

  app.post("/api/appointments", async (req, res) => {
    try {
      const appointmentData = insertAppointmentSchema.parse(req.body);
      const appointment = await storage.createAppointment(appointmentData);
      res.status(201).json(appointment);
    } catch (error) {
      res.status(400).json({ message: "Invalid appointment data" });
    }
  });

  app.get("/api/appointments/user/:userId", async (req, res) => {
    try {
      const appointments = await storage.getAppointmentsByUser(req.params.userId);
      
      // Populate with provider details
      const appointmentsWithProviders = await Promise.all(
        appointments.map(async (appointment) => {
          const provider = await storage.getProvider(appointment.providerId);
          return { ...appointment, provider };
        })
      );
      
      res.json(appointmentsWithProviders);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch appointments" });
    }
  });

  app.get("/api/service-requests/user/:userId", async (req, res) => {
    try {
      const requests = await storage.getServiceRequestsByUser(req.params.userId);
      
      // Populate with provider details
      const requestsWithProviders = await Promise.all(
        requests.map(async (request) => {
          const provider = await storage.getProvider(request.providerId);
          return { ...request, provider };
        })
      );
      
      res.json(requestsWithProviders);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch service requests" });
    }
  });

  app.get("/api/service-requests/provider/:providerId", async (req, res) => {
    try {
      const requests = await storage.getServiceRequestsByProvider(req.params.providerId);
      
      // Populate with requester details
      const requestsWithRequesters = await Promise.all(
        requests.map(async (request) => {
          const requester = await storage.getUser(request.requesterId);
          return { ...request, requester };
        })
      );
      
      res.json(requestsWithRequesters);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch service requests" });
    }
  });

  // Payment Methods management
  app.get("/api/providers/:providerId/payment-methods", async (req, res) => {
    try {
      const paymentMethods = await storage.getPaymentMethods(req.params.providerId);
      res.json(paymentMethods);
    } catch (error: any) {
      console.error("Failed to get payment methods:", error);
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/providers/:providerId/payment-methods", async (req, res) => {
    try {
      const insertPaymentMethodSchema = z.object({
        paymentType: z.enum(["hourly", "fixed_job", "menu_based", "per_event"]),
        isActive: z.boolean().default(true),
        hourlyRate: z.coerce.number().nullable().optional(),
        minimumHours: z.coerce.number().nullable().optional(),
        fixedJobRate: z.coerce.number().nullable().optional(),
        eventRate: z.coerce.number().nullable().optional(),
        eventDescription: z.string().nullable().optional(),
        jobDescription: z.string().nullable().optional(),
        estimatedDuration: z.number().nullable().optional(),
        requiresDeposit: z.boolean().default(false),
        depositPercentage: z.number().default(0),
        cancellationPolicy: z.string().nullable().optional()
      });
      
      const validatedData = insertPaymentMethodSchema.parse(req.body);
      const paymentMethod = await storage.createPaymentMethod({
        ...validatedData,
        providerId: req.params.providerId
      });
      res.json(paymentMethod);
    } catch (error: any) {
      console.error("Failed to create payment method:", error);
      res.status(400).json({ error: error.message });
    }
  });

  app.put("/api/providers/:providerId/payment-methods/:id", async (req, res) => {
    try {
      const updatePaymentMethodSchema = z.object({
        paymentType: z.enum(["hourly", "fixed_job", "menu_based", "per_event"]).optional(),
        isActive: z.boolean().optional(),
        hourlyRate: z.coerce.number().nullable().optional(),
        minimumHours: z.coerce.number().nullable().optional(),
        fixedJobRate: z.coerce.number().nullable().optional(),
        eventRate: z.coerce.number().nullable().optional(),
        eventDescription: z.string().nullable().optional(),
        jobDescription: z.string().nullable().optional(),
        estimatedDuration: z.number().nullable().optional(),
        requiresDeposit: z.boolean().optional(),
        depositPercentage: z.number().optional(),
        cancellationPolicy: z.string().nullable().optional()
      });
      
      const validatedData = updatePaymentMethodSchema.parse(req.body);
      const paymentMethod = await storage.updatePaymentMethod(req.params.id, validatedData);
      res.json(paymentMethod);
    } catch (error: any) {
      console.error("Failed to update payment method:", error);
      res.status(400).json({ error: error.message });
    }
  });

  // Helper function to validate user-provider ownership
  const validateProviderOwnership = async (providerId: string, userId: string) => {
    const provider = await storage.getProvider(providerId);
    if (!provider) {
      return { valid: false, error: "Provider not found", status: 404 };
    }
    if (provider.userId !== userId) {
      return { valid: false, error: "Unauthorized: You can only access your own provider data", status: 403 };
    }
    return { valid: true, provider };
  };

  // Menu Items management
  app.get("/api/providers/:providerId/menu-items", isAuthenticated, async (req: any, res) => {
    try {
      // Validate user-provider ownership
      const userId = req.user.claims.sub;
      const ownership = await validateProviderOwnership(req.params.providerId, userId);
      if (!ownership.valid) {
        return res.status(ownership.status).json({ error: ownership.error });
      }

      const menuItems = await storage.getMenuItems(req.params.providerId);
      res.json(menuItems);
    } catch (error: any) {
      console.error("Failed to get menu items:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/providers/:providerId/menu-items", isAuthenticated, async (req: any, res) => {
    try {
      // Validate user-provider ownership
      const userId = req.user.claims.sub;
      const ownership = await validateProviderOwnership(req.params.providerId, userId);
      if (!ownership.valid) {
        return res.status(ownership.status).json({ error: ownership.error });
      }

      const insertMenuItemSchema = z.object({
        categoryName: z.string(),
        itemName: z.string(),
        description: z.string().nullable().optional(),
        price: z.string(),
        duration: z.number().nullable().optional(),
        isAvailable: z.boolean().default(true),
        imageUrl: z.string().nullable().optional(),
        hasVariations: z.boolean().default(false),
        minQuantity: z.number().default(1),
        maxQuantity: z.number().nullable().optional(),
        sortOrder: z.number().default(0)
      });
      
      const validatedData = insertMenuItemSchema.parse(req.body);
      const menuItem = await storage.createMenuItem({
        ...validatedData,
        providerId: req.params.providerId
      });
      res.status(201).json(menuItem);
    } catch (error: any) {
      console.error("Failed to create menu item:", error);
      if (error.name === 'ZodError') {
        res.status(400).json({ error: "Invalid menu item data", details: error.issues });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  });

  app.put("/api/providers/:providerId/menu-items/:id", isAuthenticated, async (req: any, res) => {
    try {
      // Validate user-provider ownership FIRST
      const userId = req.user.claims.sub;
      const ownership = await validateProviderOwnership(req.params.providerId, userId);
      if (!ownership.valid) {
        return res.status(ownership.status).json({ error: ownership.error });
      }
      
      const updateMenuItemSchema = z.object({
        categoryName: z.string().optional(),
        itemName: z.string().optional(),
        description: z.string().nullable().optional(),
        price: z.string().optional(),
        duration: z.number().nullable().optional(),
        isAvailable: z.boolean().optional(),
        imageUrl: z.string().nullable().optional(),
        hasVariations: z.boolean().optional(),
        minQuantity: z.number().optional(),
        maxQuantity: z.number().nullable().optional(),
        sortOrder: z.number().optional()
      });
      
      const validatedData = updateMenuItemSchema.parse(req.body);
      // Use storage method with providerId constraint for security
      const menuItem = await storage.updateMenuItem(req.params.id, req.params.providerId, validatedData);
      if (!menuItem) {
        return res.status(404).json({ error: "Menu item not found" });
      }
      res.json(menuItem);
    } catch (error: any) {
      console.error("Failed to update menu item:", error);
      if (error.name === 'ZodError') {
        res.status(400).json({ error: "Invalid menu item data", details: error.issues });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  });

  app.delete("/api/providers/:providerId/menu-items/:id", isAuthenticated, async (req: any, res) => {
    try {
      // Validate user-provider ownership FIRST
      const userId = req.user.claims.sub;
      const ownership = await validateProviderOwnership(req.params.providerId, userId);
      if (!ownership.valid) {
        return res.status(ownership.status).json({ error: ownership.error });
      }
      
      // Use storage method with providerId constraint for security
      const deleted = await storage.deleteMenuItem(req.params.id, req.params.providerId);
      if (deleted) {
        res.status(200).json({ message: "Menu item deleted successfully" });
      } else {
        res.status(404).json({ error: "Menu item not found" });
      }
    } catch (error: any) {
      console.error("Failed to delete menu item:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Messages
  app.post("/api/messages", async (req, res) => {
    try {
      const validatedData = insertMessageSchema.parse(req.body);
      const message = await storage.createMessage(validatedData);
      res.status(201).json(message);
    } catch (error) {
      res.status(400).json({ message: "Invalid message data" });
    }
  });

  app.get("/api/messages/conversation/:userId1/:userId2", async (req, res) => {
    try {
      const messages = await storage.getConversation(req.params.userId1, req.params.userId2);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch conversation" });
    }
  });

  // Photo upload endpoints
  app.post("/api/objects/upload", async (req, res) => {
    const objectStorageService = new ObjectStorageService();
    try {
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      res.json({ uploadURL });
    } catch (error) {
      console.error("Error generating upload URL:", error);
      res.status(500).json({ error: "Failed to generate upload URL" });
    }
  });

  app.put("/api/review-photos", async (req, res) => {
    if (!req.body.photoURL) {
      return res.status(400).json({ error: "photoURL is required" });
    }

    try {
      const objectStorageService = new ObjectStorageService();
      const objectPath = objectStorageService.normalizeObjectEntityPath(
        req.body.photoURL,
      );

      // Set public visibility for review photos so they can be viewed by everyone
      await objectStorageService.trySetObjectEntityAclPolicy(
        req.body.photoURL,
        {
          owner: "system", // System owns review photos
          visibility: "public",
        }
      );

      res.status(200).json({
        objectPath: objectPath,
      });
    } catch (error) {
      console.error("Error setting review photo:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Serve uploaded photos
  app.get("/objects/:objectPath(*)", async (req, res) => {
    const objectStorageService = new ObjectStorageService();
    try {
      const objectFile = await objectStorageService.getObjectEntityFile(
        req.path,
      );
      objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error("Error serving object:", error);
      if (error instanceof ObjectNotFoundError) {
        return res.sendStatus(404);
      }
      return res.sendStatus(500);
    }
  });

  // Verification System Routes
  // Verification Documents
  app.get("/api/providers/:providerId/verification-documents", async (req, res) => {
    try {
      const { providerId } = req.params;
      const documents = await storage.getVerificationDocuments(providerId);
      res.json(documents);
    } catch (error) {
      console.error("Error fetching verification documents:", error);
      res.status(500).json({ error: "Failed to fetch verification documents" });
    }
  });

  app.post("/api/verification-documents", async (req, res) => {
    try {
      const document = await storage.createVerificationDocument(req.body);
      res.status(201).json(document);
    } catch (error) {
      console.error("Error creating verification document:", error);
      res.status(500).json({ error: "Failed to create verification document" });
    }
  });

  app.patch("/api/verification-documents/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const document = await storage.updateVerificationDocument(id, req.body);
      if (!document) {
        return res.status(404).json({ error: "Verification document not found" });
      }
      res.json(document);
    } catch (error) {
      console.error("Error updating verification document:", error);
      res.status(500).json({ error: "Failed to update verification document" });
    }
  });

  // Background Checks
  app.get("/api/providers/:providerId/background-checks", async (req, res) => {
    try {
      const { providerId } = req.params;
      const checks = await storage.getBackgroundChecks(providerId);
      res.json(checks);
    } catch (error) {
      console.error("Error fetching background checks:", error);
      res.status(500).json({ error: "Failed to fetch background checks" });
    }
  });

  app.post("/api/background-checks", async (req, res) => {
    try {
      const check = await storage.createBackgroundCheck(req.body);
      res.status(201).json(check);
    } catch (error) {
      console.error("Error creating background check:", error);
      res.status(500).json({ error: "Failed to create background check" });
    }
  });

  app.patch("/api/background-checks/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const check = await storage.updateBackgroundCheck(id, req.body);
      if (!check) {
        return res.status(404).json({ error: "Background check not found" });
      }
      res.json(check);
    } catch (error) {
      console.error("Error updating background check:", error);
      res.status(500).json({ error: "Failed to update background check" });
    }
  });

  // Verification Reviews
  app.get("/api/providers/:providerId/verification-reviews", async (req, res) => {
    try {
      const { providerId } = req.params;
      const reviews = await storage.getVerificationReviews(providerId);
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching verification reviews:", error);
      res.status(500).json({ error: "Failed to fetch verification reviews" });
    }
  });

  app.post("/api/verification-reviews", async (req, res) => {
    try {
      const review = await storage.createVerificationReview(req.body);
      res.status(201).json(review);
    } catch (error) {
      console.error("Error creating verification review:", error);
      res.status(500).json({ error: "Failed to create verification review" });
    }
  });

  // Verification Requirements
  app.get("/api/categories/:categoryId/verification-requirements", async (req, res) => {
    try {
      const { categoryId } = req.params;
      const requirements = await storage.getVerificationRequirements(categoryId);
      res.json(requirements);
    } catch (error) {
      console.error("Error fetching verification requirements:", error);
      res.status(500).json({ error: "Failed to fetch verification requirements" });
    }
  });

  app.get("/api/verification-requirements", async (req, res) => {
    try {
      const requirements = await storage.getAllVerificationRequirements();
      res.json(requirements);
    } catch (error) {
      console.error("Error fetching all verification requirements:", error);
      res.status(500).json({ error: "Failed to fetch verification requirements" });
    }
  });

  app.post("/api/verification-requirements", async (req, res) => {
    try {
      const requirement = await storage.createVerificationRequirement(req.body);
      res.status(201).json(requirement);
    } catch (error) {
      console.error("Error creating verification requirement:", error);
      res.status(500).json({ error: "Failed to create verification requirement" });
    }
  });

  // Update provider verification status
  app.patch("/api/providers/:id/verification-status", async (req, res) => {
    try {
      const { id } = req.params;
      const { verificationStatus, verificationLevel, backgroundCheckStatus, verificationNotes } = req.body;
      
      const updateData: any = {};
      if (verificationStatus) updateData.verificationStatus = verificationStatus;
      if (verificationLevel) updateData.verificationLevel = verificationLevel;
      if (backgroundCheckStatus) updateData.backgroundCheckStatus = backgroundCheckStatus;
      if (verificationNotes) updateData.verificationNotes = verificationNotes;
      if (verificationStatus === 'verified') updateData.lastVerificationDate = new Date();

      const provider = await storage.updateProvider(id, updateData);
      if (!provider) {
        return res.status(404).json({ error: "Provider not found" });
      }
      res.json(provider);
    } catch (error) {
      console.error("Error updating provider verification status:", error);
      res.status(500).json({ error: "Failed to update verification status" });
    }
  });

  // Geocoding API endpoint for address autocomplete
  app.get("/api/geocoding/search", async (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query || query.length < 3) {
        return res.json({ features: [] });
      }

      const mapboxToken = process.env.MAPBOX_ACCESS_TOKEN;
      if (!mapboxToken) {
        return res.status(500).json({ error: "Mapbox token not configured" });
      }

      // Use Mapbox Geocoding API focused on Mexico
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?` +
        `access_token=${mapboxToken}&` +
        `country=mx&` +
        `limit=5&` +
        `language=es&` +
        `types=address,poi,place,neighborhood,locality,district`
      );

      if (!response.ok) {
        throw new Error(`Mapbox API error: ${response.status}`);
      }

      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Geocoding error:", error);
      res.status(500).json({ error: "Failed to search addresses" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
