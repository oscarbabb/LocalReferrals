import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  ObjectStorageService,
  ObjectNotFoundError,
} from "./objectStorage";
import { z } from "zod";
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

export async function registerRoutes(app: Express): Promise<Server> {
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
      const validatedData = insertProviderSchema.parse(req.body);
      const provider = await storage.createProvider(validatedData);
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
      res.status(201).json(user);
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
        paymentType: z.enum(["hourly", "fixed_job", "menu_based"]),
        isActive: z.boolean().default(true),
        hourlyRate: z.string().nullable().optional(),
        minimumHours: z.string().nullable().optional(),
        fixedJobRate: z.string().nullable().optional(),
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
        paymentType: z.enum(["hourly", "fixed_job", "menu_based"]).optional(),
        isActive: z.boolean().optional(),
        hourlyRate: z.string().nullable().optional(),
        minimumHours: z.string().nullable().optional(),
        fixedJobRate: z.string().nullable().optional(),
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

  // Menu Items management
  app.get("/api/providers/:providerId/menu-items", async (req, res) => {
    try {
      const menuItems = await storage.getMenuItems(req.params.providerId);
      res.json(menuItems);
    } catch (error: any) {
      console.error("Failed to get menu items:", error);
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/providers/:providerId/menu-items", async (req, res) => {
    try {
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
      res.json(menuItem);
    } catch (error: any) {
      console.error("Failed to create menu item:", error);
      res.status(400).json({ error: error.message });
    }
  });

  app.put("/api/providers/:providerId/menu-items/:id", async (req, res) => {
    try {
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
      const menuItem = await storage.updateMenuItem(req.params.id, validatedData);
      res.json(menuItem);
    } catch (error: any) {
      console.error("Failed to update menu item:", error);
      res.status(400).json({ error: error.message });
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

  const httpServer = createServer(app);
  return httpServer;
}
