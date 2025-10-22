import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { syncCategoriesToProduction } from "./production-sync";
import {
  ObjectStorageService,
  ObjectNotFoundError,
} from "./objectStorage";
import { z } from "zod";
import Stripe from "stripe";
import { randomBytes } from "crypto";
import { setupAuth, isAuthenticated, isAdmin } from "./replitAuth";
import { db } from "./db";
import { serviceCategories, serviceSubcategories } from "@shared/schema";
import { eq, sql } from "drizzle-orm";
import { 
  insertUserSchema, 
  insertProviderSchema, 
  insertReviewSchema, 
  insertServiceRequestSchema,
  insertProviderAvailabilitySchema,
  insertAppointmentSchema,
  insertMessageSchema,
  insertAdminMessageSchema,
  insertCategoryRequestSchema,
  insertPaymentMethodSchema,
  insertMenuItemSchema,
  insertMenuItemVariationSchema
} from "@shared/schema";
import { sendProfileConfirmationEmail, sendBookingConfirmationEmail, sendBookingNotificationEmail, sendPasswordResetEmail } from "./email.js";
import { sendWelcomeWhatsApp, sendBookingConfirmationWhatsApp, sendBookingNotificationWhatsApp } from "./whatsapp.js";
import bcrypt from "bcrypt";

// Lazy initialize Stripe - only when needed
let stripe: Stripe | null = null;

function getStripe(): Stripe {
  if (!stripe) {
    // Use test keys in development mode for better testing experience
    const isTestMode = process.env.NODE_ENV === 'development';
    const secretKey = isTestMode ? process.env.TESTING_STRIPE_SECRET_KEY : process.env.STRIPE_SECRET_KEY;
    
    if (!secretKey) {
      const keyType = isTestMode ? 'TESTING_STRIPE_SECRET_KEY' : 'STRIPE_SECRET_KEY';
      throw new Error(`Missing required Stripe secret: ${keyType}`);
    }
    
    stripe = new Stripe(secretKey, {
      apiVersion: "2025-07-30.basil",
    });
    
    console.log(`🔑 Stripe initialized in ${isTestMode ? 'TEST' : 'LIVE'} mode`);
  }
  return stripe;
}

// Temporary storage for provider setup tokens (in production, use Redis or database)
const providerSetupTokens = new Map<string, { userId: string, expiresAt: number }>();

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Health check endpoints
  app.get('/api/health', (req, res) => {
    const envVars = {
      DATABASE_URL: !!process.env.DATABASE_URL,
      STRIPE_SECRET_KEY: !!process.env.STRIPE_SECRET_KEY,
      NODE_ENV: process.env.NODE_ENV || 'development'
    };
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      environment: envVars,
      version: Date.now() // Simple version based on deployment time
    });
  });

  app.get('/api/version', (req, res) => {
    res.json({ 
      deployed: new Date().toISOString(),
      build: Date.now()
    });
  });

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

      // Securely compare passwords using bcrypt
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Create authenticated session
      const sessionUser = {
        claims: {
          sub: user.id,
          email: user.email,
          first_name: user.fullName?.split(' ')[0] || '',
          last_name: user.fullName?.split(' ').slice(1).join(' ') || '',
          profile_image_url: user.avatar
        },
        access_token: null,
        refresh_token: null,
        expires_at: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7 days
      };

      // Use Passport's login method to establish session
      req.login(sessionUser, (err) => {
        if (err) {
          console.error("Session creation error:", err);
          return res.status(500).json({ message: "Failed to create session" });
        }

        res.json({
          user: {
            id: user.id,
            email: user.email,
            username: user.username,
            fullName: user.fullName,
          },
          message: "Login successful"
        });
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/auth/logout", async (req, res) => {
    // Properly destroy session using Passport's logout method
    req.logout((err) => {
      if (err) {
        console.error("Logout error:", err);
        return res.status(500).json({ message: "Failed to logout" });
      }
      
      // Destroy the session completely
      req.session.destroy((destroyErr) => {
        if (destroyErr) {
          console.error("Session destroy error:", destroyErr);
          return res.status(500).json({ message: "Failed to clear session" });
        }
        
        // Clear the session cookie
        res.clearCookie('connect.sid');
        res.json({ message: "Logout successful" });
      });
    });
  });

  // Forgot password - send reset email
  app.post("/api/auth/forgot-password", async (req, res) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      // Find user by email
      const user = await storage.getUserByEmail(email);
      
      if (!user) {
        // Don't reveal if email exists for security
        return res.status(404).json({ message: "Email not found" });
      }

      // Generate secure reset token
      const crypto = await import("crypto");
      const resetToken = crypto.randomBytes(32).toString("hex");
      const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

      // Save token to database
      await storage.updateUser(user.id, {
        resetToken,
        resetTokenExpiry
      });

      // Send password reset email
      const appUrl = process.env.NODE_ENV === 'development' && process.env.REPLIT_DEV_DOMAIN
        ? `https://${process.env.REPLIT_DEV_DOMAIN}` 
        : "https://www.referenciaslocales.com.mx";
        
      const emailSent = await sendPasswordResetEmail(
        user.email,
        user.fullName,
        resetToken,
        appUrl
      );

      if (!emailSent) {
        return res.status(500).json({ message: "Failed to send reset email" });
      }

      res.json({ 
        message: "Password reset email sent successfully",
        email: user.email 
      });
    } catch (error) {
      console.error("Forgot password error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Reset password with token
  app.post("/api/auth/reset-password", async (req, res) => {
    try {
      const { token, newPassword } = req.body;

      if (!token || !newPassword) {
        return res.status(400).json({ message: "Token and new password are required" });
      }

      if (newPassword.length < 8) {
        return res.status(400).json({ message: "Password must be at least 8 characters" });
      }

      // Find user with this reset token
      const user = await storage.getUserByResetToken(token);

      if (!user) {
        return res.status(400).json({ message: "Invalid or expired reset token" });
      }

      // Check if token has expired
      if (!user.resetTokenExpiry || new Date() > new Date(user.resetTokenExpiry)) {
        return res.status(400).json({ message: "Reset token has expired" });
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update password and clear reset token
      await storage.updateUser(user.id, {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null
      });

      res.json({ message: "Password reset successfully" });
    } catch (error) {
      console.error("Reset password error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Stripe payment routes
  app.post("/api/create-payment-intent", isAuthenticated, async (req: any, res) => {
    try {
      const { amount, description, metadata } = req.body;
      
      if (!amount || amount < 50) { // Minimum 50 cents
        return res.status(400).json({ message: "Invalid amount" });
      }

      const paymentIntent = await getStripe().paymentIntents.create({
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

  // Get Stripe public key based on environment
  app.get("/api/stripe/public-key", (req, res) => {
    try {
      const isTestMode = process.env.NODE_ENV === 'development';
      const publicKey = isTestMode 
        ? process.env.TESTING_VITE_STRIPE_PUBLIC_KEY 
        : process.env.VITE_STRIPE_PUBLIC_KEY;
      
      if (!publicKey) {
        const keyType = isTestMode ? 'TESTING_VITE_STRIPE_PUBLIC_KEY' : 'VITE_STRIPE_PUBLIC_KEY';
        throw new Error(`Missing Stripe public key: ${keyType}`);
      }

      console.log(`🔑 Serving ${isTestMode ? 'TEST' : 'LIVE'} Stripe public key: ${publicKey.substring(0, 12)}...`);
      
      res.json({ 
        publicKey,
        isTestMode,
        keyType: publicKey.startsWith('pk_test_') ? 'test' : 'live'
      });
    } catch (error) {
      console.error('Error serving Stripe public key:', error);
      res.status(500).json({ 
        message: 'Failed to get Stripe public key', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });

  app.post("/api/webhook/stripe", async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
      // Webhook secret configuration with environment-aware handling
      if (process.env.STRIPE_WEBHOOK_SECRET) {
        event = getStripe().webhooks.constructEvent(req.body, sig!, process.env.STRIPE_WEBHOOK_SECRET);
        console.log('✅ Webhook signature verified');
      } else {
        // Development mode: Skip verification with warning
        console.warn('⚠️  STRIPE_WEBHOOK_SECRET not set - skipping webhook signature verification (development mode only)');
        event = req.body;
      }
    } catch (err: any) {
      console.error('❌ Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Wrap all webhook logic in try-catch and always return 200 (Stripe requirement)
    try {
      // Handle the event
      switch (event.type) {
        case 'payment_intent.succeeded':
          const paymentIntent = event.data.object;
          console.log('💳 Payment succeeded:', paymentIntent.id);
          
          try {
            // 1. Check idempotency - ensure we haven't already processed this payment
            const existingBooking = await storage.getServiceRequestByPaymentIntentId(paymentIntent.id);
            if (existingBooking) {
              console.log('✅ Booking already exists for payment intent:', paymentIntent.id);
              break;
            }

            // 2. Extract metadata from payment intent
            const metadata = paymentIntent.metadata;
            if (!metadata || !metadata.userId || !metadata.providerId) {
              console.error('❌ Missing required metadata in payment intent:', paymentIntent.id);
              break;
            }

            // 3. Get user and provider information for emails
            const user = await storage.getUser(metadata.userId);
            const provider = await storage.getProvider(metadata.providerId);
            
            if (!user || !provider) {
              console.error('❌ User or provider not found:', { userId: metadata.userId, providerId: metadata.providerId });
              break;
            }

            const providerUser = await storage.getUser(provider.userId);
            if (!providerUser) {
              console.error('❌ Provider user not found:', provider.userId);
              break;
            }

            // 4. Create service request in database
            const bookingData = {
              requesterId: metadata.userId,
              providerId: metadata.providerId,
              categoryId: metadata.categoryId,
              title: metadata.serviceTitle || 'Servicio',
              description: metadata.notes || '',
              preferredDate: metadata.date ? new Date(metadata.date) : null,
              preferredTime: metadata.time || null,
              estimatedDuration: metadata.duration ? parseInt(metadata.duration) : null,
              location: metadata.location || '',
              notes: metadata.notes || '',
              totalAmount: (paymentIntent.amount / 100).toString(), // Convert from centavos to pesos
              status: 'confirmed',
              paymentIntentId: paymentIntent.id,
              confirmedDate: new Date(),
              confirmedTime: metadata.time || null,
            };

            const newBooking = await storage.createServiceRequest(bookingData);
            console.log('✅ Booking created:', newBooking.id);

            // 5. Send confirmation email to customer (non-blocking)
            try {
              await sendBookingConfirmationEmail(
                user.email,
                user.fullName || user.username,
                providerUser.fullName || providerUser.username,
                metadata.serviceTitle || 'Servicio',
                metadata.date ? new Date(metadata.date).toLocaleDateString('es-MX') : 'Por confirmar',
                metadata.time || 'Por confirmar'
              );
              console.log('✅ Confirmation email sent to customer:', user.email);
            } catch (emailError) {
              console.error('⚠️  Failed to send confirmation email to customer:', emailError);
              // Don't block - email failure shouldn't prevent booking creation
            }

            // 6. Send notification email to provider (non-blocking)
            try {
              await sendBookingNotificationEmail(
                providerUser.email,
                providerUser.fullName || providerUser.username,
                user.fullName || user.username,
                metadata.serviceTitle || 'Servicio',
                metadata.date ? new Date(metadata.date).toLocaleDateString('es-MX') : 'Por confirmar',
                metadata.time || 'Por confirmar'
              );
              console.log('✅ Notification email sent to provider:', providerUser.email);
            } catch (emailError) {
              console.error('⚠️  Failed to send notification email to provider:', emailError);
              // Don't block - email failure shouldn't prevent booking creation
            }

            console.log('🎉 Payment processing complete for:', paymentIntent.id);
          } catch (processingError) {
            console.error('❌ Error processing payment_intent.succeeded:', processingError);
            // Log but don't throw - we still want to return 200 to Stripe
          }
          break;

        case 'payment_intent.payment_failed':
          const failedPayment = event.data.object;
          console.error('❌ Payment failed:', {
            paymentIntentId: failedPayment.id,
            amount: failedPayment.amount / 100,
            currency: failedPayment.currency,
            error: failedPayment.last_payment_error?.message || 'Unknown error'
          });
          
          // TODO: Send failure notification email to customer if user info available in metadata
          try {
            const metadata = failedPayment.metadata;
            if (metadata && metadata.userId) {
              const user = await storage.getUser(metadata.userId);
              if (user && user.email) {
                console.log('📧 Payment failure notification would be sent to:', user.email);
                // Implement failure email if needed
              }
            }
          } catch (err) {
            console.error('Error handling payment failure notification:', err);
          }
          break;

        default:
          console.log(`ℹ️  Unhandled event type: ${event.type}`);
      }
    } catch (error) {
      // Log all errors for debugging, but always return 200 (Stripe requirement)
      console.error('❌ Webhook processing error:', error);
    }

    // Always return 200 to Stripe to acknowledge receipt
    res.json({ received: true });
  });

  // Service Categories with on-demand seeding
  app.get("/api/categories", async (req, res) => {
    try {
      let categories = await storage.getServiceCategories();
      const subcategories = await storage.getServiceSubcategories();
      
      // Self-healing: Seed if database is empty
      const needsSeeding = categories.length === 0;
      
      if (needsSeeding) {
        console.log("🌱 Database empty - seeding on-demand...");
        
        const { seedCategoriesFromJSON } = await import("./seed-data");
        const seedResult = await seedCategoriesFromJSON();
        
        if (seedResult.success) {
          console.log(`✅ On-demand seeding successful: ${seedResult.importedCategories} categories, ${seedResult.importedSubcategories} subcategories`);
          // Re-fetch categories after seeding
          categories = await storage.getServiceCategories();
        } else {
          console.error("❌ On-demand seeding failed:", seedResult.error);
        }
      }
      
      res.json(categories);
    } catch (error) {
      console.error("❌ Error in /api/categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  // Service Subcategories
  app.get("/api/subcategories", async (req, res) => {
    try {
      const subcategories = await storage.getServiceSubcategories();
      res.json(subcategories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch subcategories" });
    }
  });

  app.get("/api/categories/:categoryId/subcategories", async (req, res) => {
    try {
      const { categoryId } = req.params;
      console.log("🔍 Fetching subcategories for category:", categoryId);
      const subcategories = await storage.getServiceSubcategoriesByCategory(categoryId);
      console.log("✅ Found subcategories:", subcategories.length);
      res.json(subcategories);
    } catch (error) {
      console.error("❌ Error fetching subcategories:", error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ message: "Failed to fetch subcategories for category", error: errorMessage });
    }
  });

  // Production sync endpoint - syncs categories from dev to production database
  app.post("/api/admin/sync-production", isAuthenticated, async (req: any, res) => {
    try {
      console.log("🚀 Production sync requested");
      const result = await syncCategoriesToProduction();
      if (result.success) {
        res.json(result);
      } else {
        res.status(500).json(result);
      }
    } catch (error) {
      console.error("❌ Production sync failed:", error);
      res.status(500).json({ 
        success: false, 
        message: "Production sync failed", 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });

  // Seed status endpoint for observability
  app.get("/api/admin/seed-status", async (req, res) => {
    try {
      const categories = await storage.getServiceCategories();
      const subcategories = await storage.getServiceSubcategories();
      
      res.json({
        categoryCount: categories.length,
        subcategoryCount: subcategories.length,
        seeded: categories.length > 0,
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({ 
        message: "Failed to fetch seed status",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Force reseed endpoint - clears and rebuilds category data from JSON
  app.post("/api/admin/force-reseed", isAuthenticated, async (req: any, res) => {
    try {
      console.log("🔄 FORCE RESEED REQUESTED");
      
      // Get current counts
      const oldCategories = await storage.getServiceCategories();
      const oldSubcategories = await storage.getServiceSubcategories();
      console.log(`📊 Current database: ${oldCategories.length} categories, ${oldSubcategories.length} subcategories`);
      
      // Import all schema tables
      const { 
        providers: providersTable,
        reviews,
        serviceRequests,
        providerAvailability,
        appointments,
        verificationDocuments,
        backgroundChecks,
        verificationReviews,
        paymentMethods,
        menuItems,
        menuItemVariations
      } = await import("@shared/schema");
      
      // Step 1: Clear all dependent tables (in correct order based on FK constraints)
      console.log("🧹 Clearing all dependent tables...");
      await db.delete(menuItemVariations); // No FK dependencies
      await db.delete(menuItems); // References providers
      await db.delete(paymentMethods); // References providers
      await db.delete(verificationReviews); // References providers
      await db.delete(backgroundChecks); // References providers
      await db.delete(verificationDocuments); // References providers
      await db.delete(appointments); // References providers and service_requests
      await db.delete(providerAvailability); // References providers
      await db.delete(reviews); // References providers
      await db.delete(serviceRequests); // References providers and categories
      
      // Step 2: Clear subcategories
      console.log("🧹 Clearing all subcategories...");
      await db.delete(serviceSubcategories);
      
      // Step 3: Clear providers
      console.log("🧹 Clearing providers...");
      await db.delete(providersTable);
      
      // Step 4: Clear categories
      console.log("🧹 Clearing categories...");
      await db.delete(serviceCategories);
      
      // Step 5: Reseed categories and subcategories from JSON
      console.log("🌱 Reseeding categories from JSON...");
      const { seedCategoriesFromJSON } = await import("./seed-data");
      const seedResult = await seedCategoriesFromJSON();
      
      if (!seedResult.success) {
        throw new Error(seedResult.error || 'Seeding failed');
      }
      
      console.log(`✅ FORCE RESEED COMPLETE: ${seedResult.importedCategories} categories, ${seedResult.importedSubcategories} subcategories`);
      res.json({
        success: true,
        message: "Database completely cleared and reseeded with fresh categories",
        before: {
          categories: oldCategories.length,
          subcategories: oldSubcategories.length
        },
        after: {
          categories: seedResult.importedCategories,
          subcategories: seedResult.importedSubcategories
        },
        note: "All provider data and related records were cleared to enable clean reseed. This is a fresh start for the database.",
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("❌ Force reseed failed:", error);
      res.status(500).json({ 
        success: false,
        message: "Force reseed failed",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Debug: List current production categories
  app.get("/api/admin/list-categories", async (req, res) => {
    try {
      const categories = await storage.getServiceCategories();
      const categoryNames = categories.map((c: any) => c.name).sort();
      res.json({
        count: categories.length,
        categories: categoryNames
      });
    } catch (error) {
      console.error("Error listing categories:", error);
      res.status(500).json({ error: "Failed to list categories" });
    }
  });

  // Export complete category dataset from development
  app.get("/api/admin/export-categories", async (req, res) => {
    try {
      const categories = await storage.getServiceCategories();
      const categoriesWithSubcategories = await Promise.all(
        categories.map(async (category: any) => {
          const subcategories = await storage.getServiceSubcategoriesByCategory(category.id);
          return {
            ...category,
            subcategories: subcategories
          };
        })
      );
      
      res.json({
        totalCategories: categories.length,
        totalSubcategories: categoriesWithSubcategories.reduce((sum: number, cat: any) => sum + cat.subcategories.length, 0),
        data: categoriesWithSubcategories
      });
    } catch (error) {
      console.error("Error exporting categories:", error);
      res.status(500).json({ error: "Failed to export categories" });
    }
  });

  // FORCE IMPORT complete category dataset (for production sync)
  app.post("/api/admin/force-import-categories", isAuthenticated, async (req: any, res) => {
    try {
      console.log("🚀 FORCE IMPORT: Starting safe category import...");
      
      const comprehensiveCategories = [
        { name: "Administración Condominal", description: "Servicios de administración de condominios y gestión comunitaria", icon: "🏢", color: "#1f2937" },
        { name: "Agencias de Viajes y Tours", description: "Servicios integrales de viajes, tours y experiencias turísticas", icon: "✈️", color: "#0ea5e9" },
        { name: "Agua y Tratamiento", description: "Servicios especializados en tratamiento y purificación de agua", icon: "💧", color: "#0891b2" },
        { name: "Albercas y Jacuzzis", description: "Mantenimiento, limpieza y construcción de albercas y jacuzzis", icon: "🏊", color: "#0284c7" },
        { name: "Altas de Servicios y Gestoría Domiciliaria", description: "Gestión de trámites y altas de servicios públicos", icon: "📋", color: "#0f766e" },
        { name: "Arte y Manualidades", description: "Clases de arte, manualidades y talleres creativos", icon: "🎨", color: "#c2410c" },
        { name: "Asesoría Legal", description: "Servicios legales y asesoría jurídica especializada", icon: "⚖️", color: "#1e40af" },
        { name: "Automotriz y Movilidad", description: "Servicios automotrices y soluciones de movilidad", icon: "🚗", color: "#b91c1c" },
        { name: "Belleza y Cuidado Personal", description: "Servicios de belleza, estética y cuidado personal", icon: "💄", color: "#e11d48" },
        { name: "Bienes Raíces y Property Management", description: "Servicios inmobiliarios y gestión de propiedades", icon: "🏠", color: "#047857" },
        { name: "Capacitación Empresarial y Desarrollo Humano", description: "Capacitación profesional y desarrollo de recursos humanos", icon: "📊", color: "#7c3aed" },
        { name: "Clases Particulares y Coaching Académico", description: "Clases particulares y apoyo académico personalizado", icon: "📚", color: "#1d4ed8" },
        { name: "Cocina y Catering", description: "Servicios de cocina, catering y eventos gastronómicos", icon: "👨‍🍳", color: "#ea580c" },
        { name: "Construcción, Remodelación y Arquitectura", description: "Servicios de construcción, remodelación y diseño arquitectónico", icon: "🏗️", color: "#a16207" },
        { name: "Contabilidad e Impuestos", description: "Servicios contables, fiscales y de declaración de impuestos", icon: "💰", color: "#059669" },
        { name: "Cuidado de Niños, Niñeras y Estimulación", description: "Servicios de cuidado infantil y estimulación temprana", icon: "👶", color: "#db2777" },
        { name: "Cuidado de Plantas e Invernaderos", description: "Jardinería, mantenimiento de plantas e invernaderos", icon: "🌱", color: "#16a34a" },
        { name: "Decoración de Eventos y Wedding Planning", description: "Planificación y decoración de eventos y bodas", icon: "🎉", color: "#be185d" },
        { name: "Deportes y Acondicionamiento Físico", description: "Entrenamiento personal y actividades deportivas", icon: "🏋️", color: "#dc2626" },
        { name: "Diseño Gráfico y Marketing Digital", description: "Servicios de diseño gráfico y marketing digital", icon: "🎨", color: "#7c2d12" },
        { name: "Electricidad y Sistemas Eléctricos", description: "Instalaciones eléctricas y mantenimiento de sistemas", icon: "⚡", color: "#facc15" },
        { name: "Entretenimiento y Animación de Eventos", description: "Servicios de entretenimiento y animación para eventos", icon: "🎭", color: "#f59e0b" },
        { name: "Estética Facial y Tratamientos de Belleza", description: "Tratamientos faciales y servicios de estética avanzada", icon: "✨", color: "#ec4899" },
        { name: "Fotografía y Video Profesional", description: "Servicios profesionales de fotografía y videografía", icon: "📸", color: "#6366f1" },
        { name: "Herrería, Soldadura y Estructuras Metálicas", description: "Trabajos de herrería, soldadura y estructuras metálicas", icon: "🔧", color: "#374151" },
        { name: "Idiomas y Interpretación", description: "Clases de idiomas, traducción e interpretación", icon: "🗣️", color: "#2563eb" },
        { name: "Informática y Desarrollo de Software", description: "Servicios informáticos y desarrollo de software", icon: "💻", color: "#1f2937" },
        { name: "Instrumentos Musicales y Audio", description: "Venta, reparación y mantenimiento de instrumentos musicales", icon: "🎵", color: "#7c3aed" },
        { name: "Limpieza y Sanitización", description: "Servicios de limpieza residencial y sanitización", icon: "🧽", color: "#0ea5e9" },
        { name: "Mascotas y Veterinaria", description: "Cuidado veterinario y servicios para mascotas", icon: "🐕", color: "#f97316" },
        { name: "Medicina y Enfermería", description: "Servicios médicos y de enfermería profesional", icon: "🏥", color: "#dc2626" },
        { name: "Mudanzas y Logística", description: "Servicios de mudanzas y logística especializada", icon: "📦", color: "#a16207" },
        { name: "Música y Entretenimiento", description: "Clases de música y servicios de entretenimiento", icon: "🎶", color: "#8b5cf6" },
        { name: "Nutrición y Medicina Alternativa", description: "Consultoría nutricional y medicina alternativa", icon: "🥗", color: "#10b981" },
        { name: "Organización y Consultoría", description: "Servicios de organización y consultoría empresarial", icon: "📋", color: "#6366f1" },
        { name: "Peluquería y Barbería", description: "Servicios de peluquería y barbería profesional", icon: "💇", color: "#f59e0b" },
        { name: "Plomería y Sanitarios", description: "Instalaciones de plomería y mantenimiento sanitario", icon: "🚿", color: "#0891b2" },
        { name: "Psicología y Salud Mental", description: "Servicios de psicología y apoyo en salud mental", icon: "🧠", color: "#8b5cf6" },
        { name: "Quiroprácticos, Fisioterapia y Rehabilitación", description: "Servicios de quiropráctica, fisioterapia y rehabilitación", icon: "🏥", color: "#059669" },
        { name: "Rentas Vacacionales y Co-Hosting", description: "Gestión de rentas vacacionales y servicios de co-hosting", icon: "🏖️", color: "#0ea5e9" },
        { name: "Reparación de Dispositivos y Electrónica", description: "Reparación de dispositivos electrónicos y equipos", icon: "🔧", color: "#374151" },
        { name: "Reparación de Electrodomésticos", description: "Reparación y mantenimiento de electrodomésticos", icon: "🔨", color: "#6b7280" },
        { name: "Restaurantes y Comida a Domicilio", description: "Servicios de restaurantes y entrega de comida", icon: "🍽️", color: "#f97316" },
        { name: "Rifas, Sorteos y Promociones", description: "Organización de rifas, sorteos y promociones", icon: "🎰", color: "#eab308" },
        { name: "Salud, Medicina y Enfermería", description: "Servicios integrales de salud y medicina", icon: "⚕️", color: "#dc2626" },
        { name: "Seguridad (CCTV y Accesos)", description: "Sistemas de seguridad, CCTV y control de accesos", icon: "🔒", color: "#1f2937" },
        { name: "Servicios Funerarios", description: "Servicios funerarios y ceremonias conmemorativas", icon: "🕊️", color: "#374151" },
        { name: "Servicios Legales y Notariales", description: "Servicios legales, notariales y jurídicos", icon: "📜", color: "#1e40af" },
        { name: "Servicios Náuticos y Marina", description: "Servicios náuticos, marina y embarcaciones", icon: "⛵", color: "#0284c7" },
        { name: "Servicios para Comercios y Oficinas", description: "Servicios especializados para comercios y oficinas", icon: "🏢", color: "#6366f1" },
        { name: "Tecnología, Redes y Smart Home", description: "Instalación de redes, tecnología y automatización del hogar", icon: "📡", color: "#1f2937" },
        { name: "Telecomunicaciones e Internet", description: "Servicios de telecomunicaciones e internet", icon: "📶", color: "#2563eb" },
        { name: "Traducción e Interpretación", description: "Servicios profesionales de traducción e interpretación", icon: "🗣️", color: "#7c3aed" },
        { name: "Transporte Terrestre y Conductores", description: "Servicios de transporte terrestre y conductores", icon: "🚐", color: "#b91c1c" },
        { name: "Servicios de Entretenimiento y Recreación", description: "Servicios diversos de entretenimiento y recreación", icon: "🎊", color: "#ec4899" }
      ];

      // Get existing categories to check what already exists
      const existingCategories = await storage.getServiceCategories();
      console.log(`📊 Found ${existingCategories.length} existing categories`);
      
      // Create a map of existing categories by name for quick lookup
      const existingCategoryMap = new Map(existingCategories.map(cat => [cat.name, cat]));
      
      let importedCount = 0;
      let updatedCount = 0;
      
      // Process each comprehensive category
      for (const category of comprehensiveCategories) {
        const existing = existingCategoryMap.get(category.name);
        
        if (existing) {
          // Update existing category with new data
          await db.update(serviceCategories)
            .set({
              description: category.description,
              icon: category.icon,
              color: category.color
            })
            .where(eq(serviceCategories.id, existing.id));
          console.log(`🔄 Updated: ${category.name}`);
          updatedCount++;
        } else {
          // Create new category
          await storage.createServiceCategory(category);
          console.log(`➕ Imported: ${category.name}`);
          importedCount++;
        }
      }

      console.log(`✅ SAFE IMPORT COMPLETE: ${importedCount} new categories imported, ${updatedCount} categories updated`);
      
      res.json({
        success: true,
        message: "Safe category import successful",
        importedCategories: importedCount,
        updatedCategories: updatedCount,
        totalCategories: comprehensiveCategories.length
      });
      
    } catch (error) {
      console.error("❌ Force import failed:", error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error",
        message: "Force import failed" 
      });
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

  // Get customer reviews for a user (reviews written by providers about this customer)
  app.get("/api/users/:userId/reviews", async (req, res) => {
    try {
      const reviews = await storage.getReviewsByUser(req.params.userId);
      
      // Get reviewer (provider) details for each review
      const reviewsWithReviewers = await Promise.all(
        reviews.map(async (review) => {
          const reviewer = await storage.getUser(review.reviewerId);
          const provider = await storage.getProvider(review.providerId);
          return {
            ...review,
            reviewer: reviewer ? {
              fullName: reviewer.fullName,
              avatar: reviewer.avatar,
              building: reviewer.building,
              apartment: reviewer.apartment
            } : null,
            provider: provider ? {
              title: provider.title
            } : null
          };
        })
      );
      
      res.json(reviewsWithReviewers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user reviews" });
    }
  });

  // Create new review (requires authentication)
  app.post("/api/reviews", isAuthenticated, async (req: any, res) => {
    try {
      const reviewerId = req.user.claims.sub;
      const reviewData = insertReviewSchema.parse({ ...req.body, reviewerId });
      const review = await storage.createReview(reviewData);
      res.status(201).json(review);
    } catch (error) {
      console.error("Review submission error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid review data", 
          errors: error.errors,
          details: process.env.NODE_ENV === 'development' ? error.errors : undefined
        });
      }
      res.status(400).json({ 
        message: "Invalid review data",
        error: process.env.NODE_ENV === 'development' && error instanceof Error ? error.message : undefined
      });
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

  // Set profile photo for authenticated users (consumer profile photos are public)
  app.put("/api/consumer-profile-photos", isAuthenticated, async (req, res) => {
    try {
      if (!req.body.photoURL) {
        return res.status(400).json({ error: "photoURL is required" });
      }
      
      const userId = (req.user as any).claims.sub;
      
      const objectStorageService = new ObjectStorageService();
      const objectPath = await objectStorageService.trySetObjectEntityAclPolicy(
        req.body.photoURL,
        {
          owner: "system",
          visibility: "public" // Profile photos are public
        }
      );

      // Update user's profilePicture field in database
      await storage.updateUser(userId, { avatar: objectPath });

      res.status(200).json({
        objectPath: objectPath,
      });
    } catch (error) {
      console.error("Error setting consumer profile photo:", error);
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
      const { providerSetupToken, profilePicture, categories, ...providerData } = req.body;
      
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
      
      // Handle profile picture upload BEFORE consuming token
      let profilePhotoPath = null;
      if (profilePicture) {
        try {
          const objectStorageService = new ObjectStorageService();
          profilePhotoPath = await objectStorageService.trySetObjectEntityAclPolicy(
            profilePicture,
            {
              owner: "system",
              visibility: "public" // Profile photos are public
            }
          );
          
          // Update user's avatar field in database
          await storage.updateUser(userId, { avatar: profilePhotoPath });
        } catch (error) {
          console.error("Error setting profile picture during provider creation:", error);
          // Don't fail provider creation if photo upload fails, just log it
          // The provider can upload a photo later
        }
      }
      
      // Create provider with multiple categories if provided
      let provider;
      if (categories && Array.isArray(categories) && categories.length > 0) {
        console.log(`🏷️  Creating provider with ${categories.length} categories`);
        
        // For multi-category creation, categoryId and subcategoryId are optional (set automatically)
        const validatedData = insertProviderSchema.partial({ categoryId: true, subcategoryId: true }).parse({
          ...providerData,
          userId: userId
        });
        
        provider = await storage.createProviderWithCategories(validatedData, categories);
      } else {
        // Fallback to single category creation for backwards compatibility
        const validatedData = insertProviderSchema.parse({
          ...providerData,
          userId: userId
        });
        provider = await storage.createProvider(validatedData);
      }
      
      // Consume the token (invalidate it after successful use)
      providerSetupTokens.delete(providerSetupToken);
      
      res.status(201).json({ 
        ...provider,
        profilePhotoPath: profilePhotoPath // Include photo path in response for confirmation
      });
    } catch (error) {
      console.error("Error creating provider:", error);
      res.status(400).json({ message: "Invalid provider data" });
    }
  });

  // Update provider profile - PROTECTED ENDPOINT
  app.patch("/api/providers/:id", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      
      // Get the provider to check ownership
      const provider = await storage.getProvider(id);
      if (!provider) {
        return res.status(404).json({ message: "Provider not found" });
      }
      
      // Authorization: Only the provider's owner can update it
      if (!(req.user as any)?.claims?.sub || (req.user as any).claims.sub !== provider.userId) {
        return res.status(403).json({ message: "Forbidden - You can only update your own provider profile" });
      }
      
      // Input validation: Allow specific provider profile fields to be updated
      const providerUpdateSchema = z.object({
        title: z.string().min(5, "El título debe tener al menos 5 caracteres").optional(),
        description: z.string().min(20, "La descripción debe tener al menos 20 caracteres").optional(),
        hourlyRate: z.string().optional(), // Accept as string from form, will be stored as decimal
        experience: z.string().optional(),
        serviceRadiusKm: z.number().int().min(1).max(100).nullable().optional(), // Service delivery radius (1-100 km)
      }).strict();
      
      const validatedData = providerUpdateSchema.parse(req.body);
      
      // Update provider data with only validated fields
      const updatedProvider = await storage.updateProvider(id, validatedData);
      if (!updatedProvider) {
        return res.status(500).json({ message: "Failed to update provider" });
      }
      
      res.json(updatedProvider);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(422).json({ 
          message: "Invalid request data", 
          errors: error.errors 
        });
      }
      console.error("Provider update error:", error);
      res.status(500).json({ message: "Failed to update provider" });
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
      
      // Hash password before storing
      const hashedPassword = await bcrypt.hash(validatedData.password, 10);
      const user = await storage.createUser({
        ...validatedData,
        password: hashedPassword
      });
      
      // Generate secure provider setup token if user is registering as provider
      let providerSetupToken = null;
      if (validatedData.isProvider) {
        providerSetupToken = randomBytes(32).toString('hex');
        const expiresAt = Date.now() + (120 * 60 * 1000); // 2 hours from now
        providerSetupTokens.set(providerSetupToken, { 
          userId: user.id, 
          expiresAt 
        });
      }
      
      // Auto-login the newly created user by establishing a session
      const sessionUser = {
        claims: {
          sub: user.id,
          email: user.email,
          first_name: user.fullName?.split(' ')[0] || '',
          last_name: user.fullName?.split(' ').slice(1).join(' ') || '',
          profile_image_url: user.avatar
        },
        access_token: null,
        refresh_token: null,
        expires_at: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7 days
      };

      // Use Passport's login method to establish session for auto-login
      req.login(sessionUser, async (err) => {
        if (err) {
          console.error("Auto-login session creation error:", err);
          // Still return success for user creation even if session fails
          return res.status(201).json({ 
            user,
            providerSetupToken, // Only included if user is a provider
            message: "Account created successfully, but session failed. Please log in manually."
          });
        }

        // Send welcome email after successful registration
        try {
          await sendProfileConfirmationEmail(user.email, user.fullName);
          console.log(`✅ Welcome email sent to ${user.email}`);
        } catch (emailError) {
          console.error("Failed to send welcome email:", emailError);
          // Don't fail registration if email fails
        }

        // Send welcome WhatsApp message if phone number is provided
        if (user.phone) {
          try {
            await sendWelcomeWhatsApp(user.phone, user.fullName);
            console.log(`✅ Welcome WhatsApp sent to ${user.phone}`);
          } catch (whatsappError) {
            console.error("Failed to send welcome WhatsApp:", whatsappError);
            // Don't fail registration if WhatsApp fails
          }
        }

        res.status(201).json({ 
          user,
          providerSetupToken, // Only included if user is a provider
          message: "Account created and logged in successfully"
        });
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(400).json({ message: "Invalid user data" });
    }
  });

  app.get("/api/users/:id", isAuthenticated, async (req: any, res) => {
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

  // Update user (including role switching) - PROTECTED ENDPOINT
  app.patch("/api/users/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      
      // Authorization: Users can only update their own profile
      if (!(req.user as any)?.claims?.sub || (req.user as any).claims.sub !== id) {
        return res.status(403).json({ message: "Forbidden - You can only update your own profile" });
      }
      
      // Input validation: Allow profile updates and role changes
      const profileUpdateSchema = z.object({
        // Role switching
        isProvider: z.boolean().optional(),
        
        // Profile fields
        fullName: z.string().min(2, "El nombre debe tener al menos 2 caracteres").optional(),
        username: z.string().min(3, "El nombre de usuario debe tener al menos 3 caracteres").optional(),
        email: z.string().email("Email inválido").optional(),
        phone: z.string().min(10, "Teléfono debe tener al menos 10 dígitos").optional(),
        building: z.string().min(1, "El edificio es requerido").optional(),
        apartment: z.string().min(1, "El apartamento es requerido").optional(),
        address: z.string().min(10, "La dirección debe ser más específica").optional(),
        profilePicture: z.string().optional(),
        serviceRadiusKm: z.number().int().min(1).max(100).nullable().optional(), // Service reception radius (1-100 km)
        disclaimerAccepted: z.boolean().optional(),
      }).strict(); // .strict() rejects extra keys
      
      const validatedData = profileUpdateSchema.parse(req.body);
      
      // Validate that user exists
      const existingUser = await storage.getUser(id);
      if (!existingUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // If accepting disclaimer, add timestamp
      const updateData: any = { ...validatedData };
      if (validatedData.disclaimerAccepted && !existingUser.disclaimerAccepted) {
        updateData.disclaimerAcceptedAt = new Date();
      }
      
      // Update user data with only validated fields
      const updatedUser = await storage.updateUser(id, updateData);
      if (!updatedUser) {
        return res.status(500).json({ message: "Failed to update user" });
      }
      
      // If switching to provider role, generate provider setup token
      let providerSetupToken = null;
      if (validatedData.isProvider && !existingUser.isProvider) {
        providerSetupToken = randomBytes(32).toString('hex');
        const expiresAt = Date.now() + (120 * 60 * 1000); // 2 hours from now
        providerSetupTokens.set(providerSetupToken, { 
          userId: id, 
          expiresAt 
        });
      }
      
      res.json({ 
        user: updatedUser,
        providerSetupToken // Only included when switching to provider
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(422).json({ 
          message: "Invalid request data", 
          errors: error.errors 
        });
      }
      console.error("User update error:", error);
      res.status(500).json({ message: "Failed to update user" });
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
  app.get("/api/service-requests", isAuthenticated, async (req: any, res) => {
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

  app.post("/api/service-requests", isAuthenticated, async (req: any, res) => {
    try {
      const requestData = insertServiceRequestSchema.parse(req.body);
      const serviceRequest = await storage.createServiceRequest(requestData);
      
      // Send service request emails
      try {
        // Get user and provider details for emails
        const user = await storage.getUser(serviceRequest.requesterId);
        const provider = await storage.getProvider(serviceRequest.providerId);
        
        if (user && provider) {
          // Get provider user details for email
          const providerUser = await storage.getUser(provider.userId);
          
          if (providerUser) {
            // Format the booking date and time from the actual service request
            const bookingDate = serviceRequest.preferredDate 
              ? new Date(serviceRequest.preferredDate).toLocaleDateString('es-MX', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })
              : 'Por coordinar';
            
            const bookingTime = serviceRequest.preferredTime || 'Por coordinar';
            
            // Send confirmation to user
            await sendBookingConfirmationEmail(
              user.email,
              user.fullName,
              provider.title,
              serviceRequest.title || 'Servicio solicitado',
              bookingDate,
              bookingTime
            );
            
            // Send notification to provider
            await sendBookingNotificationEmail(
              providerUser.email,
              provider.title,
              user.fullName,
              serviceRequest.title || 'Servicio solicitado',
              bookingDate,
              bookingTime
            );
            
            console.log(`✅ Service request emails sent for request ${serviceRequest.id}`);
          }
        }
      } catch (emailError) {
        console.error("❌ Failed to send service request emails:", emailError);
        // Don't fail service request creation if email fails
      }
      
      res.status(201).json(serviceRequest);
    } catch (error) {
      console.error("Service request creation error:", error);
      res.status(400).json({ message: "Invalid service request data" });
    }
  });

  // Update service request status (for confirming, cancelling, etc.)
  app.patch("/api/service-requests/:id", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.claims.sub;
      
      // Get the service request first
      const existingRequest = await storage.getServiceRequests();
      const request = existingRequest.find(r => r.id === id);
      
      if (!request) {
        return res.status(404).json({ message: "Service request not found" });
      }
      
      // Authorization: Users can update their own requests, providers can update requests to them
      if (request.requesterId !== userId) {
        // Check if user is the provider
        const provider = await storage.getProvider(request.providerId);
        if (!provider || provider.userId !== userId) {
          return res.status(403).json({ message: "Unauthorized: You can only update your own service requests or requests to your services" });
        }
      }
      
      // Validate update data
      const updateSchema = z.object({
        status: z.enum(["pending", "confirmed", "in_progress", "completed", "cancelled"]).optional(),
        confirmedDate: z.coerce.date().optional(),
        confirmedTime: z.string().optional(),
        notes: z.string().optional(),
      });
      
      const validatedData = updateSchema.parse(req.body);
      
      // Update the service request
      const updatedRequest = await storage.updateServiceRequest(id, validatedData);
      
      if (!updatedRequest) {
        return res.status(500).json({ message: "Failed to update service request" });
      }
      
      res.json(updatedRequest);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(422).json({ 
          message: "Invalid request data", 
          errors: error.errors 
        });
      }
      console.error("Service request update error:", error);
      res.status(500).json({ message: "Failed to update service request" });
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

  // Provider Availability
  app.get("/api/providers/:id/availability", async (req, res) => {
    try {
      const availability = await storage.getProviderAvailability(req.params.id);
      res.json(availability);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch availability" });
    }
  });

  app.post("/api/providers/:id/availability", isAuthenticated, async (req: any, res) => {
    try {
      // Validate user-provider ownership
      const userId = req.user.claims.sub;
      const ownership = await validateProviderOwnership(req.params.id, userId);
      if (!ownership.valid) {
        return res.status(ownership.status!).json({ error: ownership.error });
      }

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

  app.patch("/api/providers/:id/availability/:availabilityId", isAuthenticated, async (req: any, res) => {
    try {
      // Validate user-provider ownership
      const userId = req.user.claims.sub;
      const ownership = await validateProviderOwnership(req.params.id, userId);
      if (!ownership.valid) {
        return res.status(ownership.status!).json({ error: ownership.error });
      }

      const updateData = insertProviderAvailabilitySchema.partial().parse(req.body);
      const availability = await storage.updateProviderAvailability(req.params.availabilityId, updateData);
      
      if (!availability) {
        return res.status(404).json({ message: "Availability slot not found" });
      }
      
      res.json(availability);
    } catch (error) {
      res.status(400).json({ message: "Invalid availability data" });
    }
  });

  app.delete("/api/providers/:id/availability/:availabilityId", isAuthenticated, async (req: any, res) => {
    try {
      // Validate user-provider ownership
      const userId = req.user.claims.sub;
      const ownership = await validateProviderOwnership(req.params.id, userId);
      if (!ownership.valid) {
        return res.status(ownership.status!).json({ error: ownership.error });
      }

      const deleted = await storage.deleteProviderAvailability(req.params.availabilityId);
      
      if (!deleted) {
        return res.status(404).json({ message: "Availability slot not found" });
      }
      
      res.json({ success: true, message: "Availability slot deleted" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete availability slot" });
    }
  });

  // Appointments
  app.get("/api/appointments/:providerId", async (req: any, res) => {
    try {
      const appointments = await storage.getAppointmentsByProvider(req.params.providerId);
      
      // If user is authenticated, return full details
      if (req.user) {
        res.json(appointments);
      } else {
        // For non-authenticated users, only return minimal data needed for availability checking
        const minimalAppointments = appointments.map(apt => ({
          id: apt.id,
          appointmentDate: apt.appointmentDate,
          startTime: apt.startTime,
        }));
        res.json(minimalAppointments);
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch appointments" });
    }
  });

  app.post("/api/appointments", isAuthenticated, async (req: any, res) => {
    try {
      const appointmentData = insertAppointmentSchema.parse(req.body);
      const appointment = await storage.createAppointment(appointmentData);
      
      // Send booking confirmation and notification emails
      try {
        // Get user and provider details for emails
        const user = await storage.getUser(appointment.requesterId);
        const provider = await storage.getProvider(appointment.providerId);
        
        if (user && provider) {
          // Get provider user details for email
          const providerUser = await storage.getUser(provider.userId);
          
          if (providerUser) {
            const bookingDate = new Date(appointment.appointmentDate).toLocaleDateString('es-MX');
            const bookingTime = appointment.startTime;
            
            // Send confirmation to user
            await sendBookingConfirmationEmail(
              user.email,
              user.fullName,
              provider.title,
              'Cita programada',
              bookingDate,
              bookingTime
            );
            
            // Send notification to provider
            await sendBookingNotificationEmail(
              providerUser.email,
              provider.title,
              user.fullName,
              'Cita programada',
              bookingDate,
              bookingTime
            );
            
            console.log(`Booking emails sent for appointment ${appointment.id}`);
          }
        }
      } catch (emailError) {
        console.error("Failed to send booking emails:", emailError);
        // Don't fail appointment creation if email fails
      }
      
      res.status(201).json(appointment);
    } catch (error) {
      res.status(400).json({ message: "Invalid appointment data" });
    }
  });

  app.get("/api/appointments/user/:userId", isAuthenticated, async (req: any, res) => {
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

  app.get("/api/service-requests/user/:userId", isAuthenticated, async (req: any, res) => {
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

  app.get("/api/service-requests/provider/:providerId", async (req: any, res) => {
    try {
      const requests = await storage.getServiceRequestsByProvider(req.params.providerId);
      
      // If user is authenticated, return full details with requester info
      if (req.user) {
        const requestsWithRequesters = await Promise.all(
          requests.map(async (request) => {
            const requester = await storage.getUser(request.requesterId);
            return { ...request, requester };
          })
        );
        res.json(requestsWithRequesters);
      } else {
        // For non-authenticated users, only return minimal data needed for availability checking
        const minimalRequests = requests.map(request => ({
          id: request.id,
          status: request.status,
          preferredDate: request.preferredDate,
          preferredTime: request.preferredTime,
        }));
        res.json(minimalRequests);
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch service requests" });
    }
  });

  // Payment Methods management
  app.get("/api/providers/:providerId/payment-methods", isAuthenticated, async (req: any, res) => {
    try {
      const paymentMethods = await storage.getPaymentMethods(req.params.providerId);
      res.json(paymentMethods);
    } catch (error: any) {
      console.error("Failed to get payment methods:", error);
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/providers/:providerId/payment-methods", isAuthenticated, async (req: any, res) => {
    try {
      const insertPaymentMethodSchema = z.object({
        paymentType: z.enum(["hourly", "fixed_job", "menu_based", "per_event"]),
        isActive: z.boolean().default(true),
        hourlyRate: z.coerce.number().positive().nullable().optional(),
        minimumHours: z.coerce.number().positive().nullable().optional(),
        fixedJobRate: z.coerce.number().positive().nullable().optional(),
        eventRate: z.coerce.number().positive().nullable().optional(),
        eventDescription: z.string().nullable().optional(),
        jobDescription: z.string().nullable().optional(),
        estimatedDuration: z.coerce.number().positive().nullable().optional(),
        requiresDeposit: z.boolean().default(false),
        depositPercentage: z.number().default(0),
        cancellationPolicy: z.string().nullable().optional()
      });
      
      const validatedData = insertPaymentMethodSchema.parse(req.body);
      
      // Convert numbers to strings for decimal fields in database
      const paymentMethod = await storage.createPaymentMethod({
        ...validatedData,
        providerId: req.params.providerId,
        hourlyRate: validatedData.hourlyRate != null ? String(validatedData.hourlyRate) : null,
        minimumHours: validatedData.minimumHours != null ? String(validatedData.minimumHours) : null,
        fixedJobRate: validatedData.fixedJobRate != null ? String(validatedData.fixedJobRate) : null,
        eventRate: validatedData.eventRate != null ? String(validatedData.eventRate) : null,
      } as any);
      res.json(paymentMethod);
    } catch (error: any) {
      console.error("Failed to create payment method:", error);
      res.status(400).json({ error: error.message });
    }
  });

  app.put("/api/providers/:providerId/payment-methods/:id", isAuthenticated, async (req: any, res) => {
    try {
      const updatePaymentMethodSchema = z.object({
        paymentType: z.enum(["hourly", "fixed_job", "menu_based", "per_event"]).optional(),
        isActive: z.boolean().optional(),
        hourlyRate: z.coerce.number().positive().nullable().optional(),
        minimumHours: z.coerce.number().positive().nullable().optional(),
        fixedJobRate: z.coerce.number().positive().nullable().optional(),
        eventRate: z.coerce.number().positive().nullable().optional(),
        eventDescription: z.string().nullable().optional(),
        jobDescription: z.string().nullable().optional(),
        estimatedDuration: z.coerce.number().positive().nullable().optional(),
        requiresDeposit: z.boolean().optional(),
        depositPercentage: z.number().optional(),
        cancellationPolicy: z.string().nullable().optional()
      });
      
      const validatedData = updatePaymentMethodSchema.parse(req.body);
      
      // Convert numbers to strings for decimal fields in database
      const dataToUpdate = {
        ...validatedData,
        hourlyRate: validatedData.hourlyRate != null ? String(validatedData.hourlyRate) : undefined,
        minimumHours: validatedData.minimumHours != null ? String(validatedData.minimumHours) : undefined,
        fixedJobRate: validatedData.fixedJobRate != null ? String(validatedData.fixedJobRate) : undefined,
        eventRate: validatedData.eventRate != null ? String(validatedData.eventRate) : undefined,
      };
      
      const paymentMethod = await storage.updatePaymentMethod(req.params.id, dataToUpdate as any);
      res.json(paymentMethod);
    } catch (error: any) {
      console.error("Failed to update payment method:", error);
      res.status(400).json({ error: error.message });
    }
  });

  // Menu Items management
  // Public endpoint for customers to view menu items
  app.get("/api/menu-items/:providerId", async (req, res) => {
    try {
      const menuItems = await storage.getMenuItems(req.params.providerId);
      res.json(menuItems);
    } catch (error: any) {
      console.error("Failed to get menu items:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Protected endpoint for providers to manage their menu items
  app.get("/api/providers/:providerId/menu-items", isAuthenticated, async (req: any, res) => {
    try {
      // Validate user-provider ownership
      const userId = req.user.claims.sub;
      const ownership = await validateProviderOwnership(req.params.providerId, userId);
      if (!ownership.valid) {
        return res.status(ownership.status!).json({ error: ownership.error });
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
        return res.status(ownership.status!).json({ error: ownership.error });
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
        return res.status(ownership.status!).json({ error: ownership.error });
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
        return res.status(ownership.status!).json({ error: ownership.error });
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

  // Update provider's menu document URL
  app.patch("/api/providers/:id/menu-document", isAuthenticated, async (req: any, res) => {
    try {
      // Validate user-provider ownership
      const userId = req.user.claims.sub;
      const ownership = await validateProviderOwnership(req.params.id, userId);
      if (!ownership.valid) {
        return res.status(ownership.status!).json({ error: ownership.error });
      }

      const updateMenuDocumentSchema = z.object({
        menuDocumentUrl: z.string().nullable(),
      });

      const validatedData = updateMenuDocumentSchema.parse(req.body);
      const provider = await storage.updateProvider(req.params.id, validatedData);
      
      if (!provider) {
        return res.status(404).json({ error: "Provider not found" });
      }

      res.json(provider);
    } catch (error: any) {
      console.error("Failed to update menu document:", error);
      if (error.name === 'ZodError') {
        res.status(400).json({ error: "Invalid data", details: error.issues });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  });

  // Messages
  app.post("/api/messages", isAuthenticated, async (req: any, res) => {
    try {
      const validatedData = insertMessageSchema.parse(req.body);
      const message = await storage.createMessage(validatedData);
      res.status(201).json(message);
    } catch (error) {
      res.status(400).json({ message: "Invalid message data" });
    }
  });

  app.get("/api/messages/conversation/:userId1/:userId2", isAuthenticated, async (req: any, res) => {
    try {
      const messages = await storage.getConversation(req.params.userId1, req.params.userId2);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch conversation" });
    }
  });

  app.get("/api/messages/user/:userId", isAuthenticated, async (req: any, res) => {
    try {
      // Validate user can only access their own messages
      if (req.user.claims.sub !== req.params.userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const conversations = await storage.getUserConversations(req.params.userId);
      res.json(conversations);
    } catch (error) {
      console.error("Failed to fetch conversations:", error);
      res.status(500).json({ message: "Failed to fetch conversations" });
    }
  });

  // Admin Messages
  app.post("/api/admin-messages", isAuthenticated, async (req: any, res) => {
    try {
      console.log("📬 POST /api/admin-messages - Request received");
      console.log("👤 User ID:", req.user.claims.sub);
      console.log("📦 Request body:", req.body);
      
      const userId = req.user.claims.sub;
      const validatedData = insertAdminMessageSchema.parse({
        ...req.body,
        userId
      });
      
      console.log("✅ Data validated:", validatedData);
      
      const message = await storage.createAdminMessage(validatedData);
      
      console.log("✅ Message created in database:", message.id);
      res.status(201).json(message);
    } catch (error: any) {
      console.error("❌ Failed to create admin message:", error);
      if (error.name === 'ZodError') {
        console.error("❌ Zod validation error:", error.issues);
        res.status(400).json({ message: "Invalid message data", details: error.issues });
      } else {
        res.status(500).json({ message: "Failed to create admin message" });
      }
    }
  });

  app.get("/api/admin-messages/user/:userId", isAuthenticated, async (req: any, res) => {
    try {
      // Validate user can only access their own messages
      if (req.user.claims.sub !== req.params.userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const messages = await storage.getAdminMessagesByUser(req.params.userId);
      res.json(messages);
    } catch (error) {
      console.error("Failed to fetch admin messages:", error);
      res.status(500).json({ message: "Failed to fetch admin messages" });
    }
  });

  // ADMIN-ONLY ROUTES - Restricted to users with admin role
  
  app.get("/api/admin-messages", isAdmin, async (req: any, res) => {
    try {
      const messages = await storage.getAdminMessages();
      res.json(messages);
    } catch (error) {
      console.error("Failed to fetch all admin messages:", error);
      res.status(500).json({ message: "Failed to fetch admin messages" });
    }
  });

  app.patch("/api/admin-messages/:id", isAdmin, async (req: any, res) => {
    try {
      const adminId = req.user.claims.sub;
      const updateData = {
        ...req.body,
        respondedBy: adminId,
        respondedAt: new Date(),
      };
      const updatedMessage = await storage.updateAdminMessage(req.params.id, updateData);
      if (!updatedMessage) {
        return res.status(404).json({ message: "Message not found" });
      }
      res.json(updatedMessage);
    } catch (error) {
      console.error("Failed to update admin message:", error);
      res.status(500).json({ message: "Failed to update admin message" });
    }
  });

  // Category Requests
  app.post("/api/category-requests", isAuthenticated, async (req: any, res) => {
    try {
      const validatedData = insertCategoryRequestSchema.parse({
        ...req.body,
        userId: req.user.claims.sub,
      });
      const request = await storage.createCategoryRequest(validatedData);
      res.json(request);
    } catch (error) {
      console.error("Failed to create category request:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Validation error", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create category request" });
      }
    }
  });

  app.get("/api/category-requests/user/:userId", isAuthenticated, async (req: any, res) => {
    try {
      // Validate user can only access their own requests
      if (req.user.claims.sub !== req.params.userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const requests = await storage.getCategoryRequestsByUser(req.params.userId);
      res.json(requests);
    } catch (error) {
      console.error("Failed to fetch category requests:", error);
      res.status(500).json({ message: "Failed to fetch category requests" });
    }
  });

  app.get("/api/category-requests", isAdmin, async (req: any, res) => {
    try {
      const requests = await storage.getCategoryRequests();
      res.json(requests);
    } catch (error) {
      console.error("Failed to fetch all category requests:", error);
      res.status(500).json({ message: "Failed to fetch category requests" });
    }
  });

  app.patch("/api/category-requests/:id", isAdmin, async (req: any, res) => {
    try {
      const adminId = req.user.claims.sub;
      const updateData = {
        ...req.body,
        reviewedBy: adminId,
        reviewedAt: new Date(),
      };
      const updatedRequest = await storage.updateCategoryRequest(req.params.id, updateData);
      if (!updatedRequest) {
        return res.status(404).json({ message: "Request not found" });
      }
      res.json(updatedRequest);
    } catch (error) {
      console.error("Failed to update category request:", error);
      res.status(500).json({ message: "Failed to update category request" });
    }
  });

  // Photo upload endpoints
  app.post("/api/objects/upload", isAuthenticated, async (req: any, res) => {
    const objectStorageService = new ObjectStorageService();
    try {
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      res.json({ uploadURL });
    } catch (error) {
      console.error("Error generating upload URL:", error);
      res.status(500).json({ error: "Failed to generate upload URL" });
    }
  });

  app.put("/api/review-photos", isAuthenticated, async (req: any, res) => {
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

  app.put("/api/menu-documents", isAuthenticated, async (req: any, res) => {
    if (!req.body.documentURL) {
      return res.status(400).json({ error: "documentURL is required" });
    }

    try {
      const objectStorageService = new ObjectStorageService();
      const objectPath = objectStorageService.normalizeObjectEntityPath(
        req.body.documentURL,
      );

      // Set public visibility for menu documents so they can be viewed by everyone
      await objectStorageService.trySetObjectEntityAclPolicy(
        req.body.documentURL,
        {
          owner: "system",
          visibility: "public",
        }
      );

      res.status(200).json({
        objectPath: objectPath,
      });
    } catch (error) {
      console.error("Error setting menu document:", error);
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
  app.get("/api/providers/:providerId/verification-documents", isAuthenticated, async (req: any, res) => {
    try {
      const { providerId } = req.params;
      const documents = await storage.getVerificationDocuments(providerId);
      res.json(documents);
    } catch (error) {
      console.error("Error fetching verification documents:", error);
      res.status(500).json({ error: "Failed to fetch verification documents" });
    }
  });

  app.post("/api/verification-documents", isAuthenticated, async (req: any, res) => {
    try {
      const document = await storage.createVerificationDocument(req.body);
      res.status(201).json(document);
    } catch (error) {
      console.error("Error creating verification document:", error);
      res.status(500).json({ error: "Failed to create verification document" });
    }
  });

  app.patch("/api/verification-documents/:id", isAuthenticated, async (req: any, res) => {
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
  app.get("/api/providers/:providerId/background-checks", isAuthenticated, async (req: any, res) => {
    try {
      const { providerId } = req.params;
      const checks = await storage.getBackgroundChecks(providerId);
      res.json(checks);
    } catch (error) {
      console.error("Error fetching background checks:", error);
      res.status(500).json({ error: "Failed to fetch background checks" });
    }
  });

  app.post("/api/background-checks", isAuthenticated, async (req: any, res) => {
    try {
      const check = await storage.createBackgroundCheck(req.body);
      res.status(201).json(check);
    } catch (error) {
      console.error("Error creating background check:", error);
      res.status(500).json({ error: "Failed to create background check" });
    }
  });

  app.patch("/api/background-checks/:id", isAuthenticated, async (req: any, res) => {
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
  app.get("/api/providers/:providerId/verification-reviews", isAuthenticated, async (req: any, res) => {
    try {
      const { providerId } = req.params;
      const reviews = await storage.getVerificationReviews(providerId);
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching verification reviews:", error);
      res.status(500).json({ error: "Failed to fetch verification reviews" });
    }
  });

  app.post("/api/verification-reviews", isAuthenticated, async (req: any, res) => {
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

  app.post("/api/verification-requirements", isAuthenticated, async (req: any, res) => {
    try {
      const requirement = await storage.createVerificationRequirement(req.body);
      res.status(201).json(requirement);
    } catch (error) {
      console.error("Error creating verification requirement:", error);
      res.status(500).json({ error: "Failed to create verification requirement" });
    }
  });

  // Update provider verification status
  app.patch("/api/providers/:id/verification-status", isAuthenticated, async (req: any, res) => {
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

  // Import categories and subcategories from CSV file
  app.post("/api/admin/import-csv-categories", isAuthenticated, async (req: any, res) => {
    try {
      console.log("🚀 IMPORTING from CSV: Starting comprehensive import...");
      
      // Read the CSV file
      const fs = await import('fs');
      const csvPath = 'attached_assets/Categorias y subcategorias_referencias Locales v 1_1758391778764.csv';
      const csvContent = fs.readFileSync(csvPath, 'utf-8');
      
      // Parse CSV lines
      const lines = csvContent.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',');
      
      console.log(`📄 Found ${lines.length - 1} categories in CSV`);
      
      // Define category icons mapping
      const categoryIcons = {
        'Administración Condominal': '🏢',
        'Agencias de Viajes y Tours': '✈️',
        'Agua y Tratamiento': '💧',
        'Albercas y Jacuzzis': '🏊',
        'Altas de Servicios y Gestoría Domiciliaria': '📋',
        'Automotriz y Movilidad': '🚗',
        'Bienes Raíces y Property Management': '🏠',
        'Bolsa de Trabajo y Talento (Busco / Solicito)': '💼',
        'Carpintería y Muebles': '🔨',
        'Clasificados: Perdido y Encontrado': '🔍',
        'Cocina, Banquetes y Eventos': '🍽️',
        'Comercio Exterior y Aduanas': '📦',
        'Construcción y Remodelación': '🏗️',
        'Control de Plagas': '🐛',
        'Donativos, Voluntariado y ONG': '❤️',
        'Drones, Topografía e Inspecciones': '🚁',
        'Educación y Tutorías': '📚',
        'Electricidad': '⚡',
        'Electrodomésticos': '🔌',
        'Energía y Sustentabilidad': '🌱',
        'Eventos Corporativos y Sociales': '🎉',
        'Fitness y Belleza': '💪',
        'Fotografía y Video': '📸',
        'Gestión de Residuos y Reciclaje': '♻️',
        'Herrería, Aluminio y Vidrio': '🔧',
        'Idiomas y Certificaciones': '🗣️',
        'Impresión y Señalización': '🖨️',
        'Inmigración y Servicios Migratorios': '🛂',
        'Jardinería y Paisajismo': '🌿',
        'Lavandería y Tintorería': '👕',
        'Limpieza': '🧽',
        'Marketplace (Compra / Venta / Intercambio)': '🛒',
        'Mascotas y Veterinaria': '🐕',
        'Mensajería, Paquetería y Mandados': '📮',
        'Mudanzas y Logística': '📦',
        'Organizaciones Sociales y Asistencia': '🤝',
        'Pintura e Impermeabilización': '🎨',
        'Plomería': '🚿',
        'Psicología y Bienestar': '🧠',
        'Rentas (Corto, Mediano y Largo Plazo)': '🏠',
        'Rentas Vacacionales y Co-Hosting': '🏖️',
        'Reparación de Dispositivos y Electrónica': '💻',
        'Restaurantes y Comida a Domicilio': '🍕',
        'Rifas, Sorteos y Promociones': '🎲',
        'Salud, Medicina y Enfermería': '⚕️',
        'Seguridad (CCTV y Accesos)': '🔒',
        'Servicios Funerarios': '🕊️',
        'Servicios Legales y Notariales': '⚖️',
        'Servicios Náuticos y Marina': '⛵',
        'Servicios para Comercios y Oficinas': '🏢',
        'Tecnología, Redes y Smart Home': '💻',
        'Telecomunicaciones e Internet': '📡',
        'Traducción e Interpretación': '🌐',
        'Transporte Terrestre y Conductores': '🚌'
      };

      let importedCategories = 0;
      let importedSubcategories = 0;

      // Process each category row
      for (let i = 1; i < lines.length; i++) {
        const row = lines[i].split(',');
        const categoryName = row[0]?.trim();
        
        if (!categoryName) continue;

        // Insert category
        const categoryIcon = (categoryIcons as any)[categoryName] || '🔧';
        const categoryResult = await db.insert(serviceCategories).values({
          name: categoryName,
          description: `Servicios profesionales de ${categoryName.toLowerCase()}`,
          icon: categoryIcon,
          color: 'blue'
        }).returning();

        const category = categoryResult[0];
        importedCategories++;
        console.log(`✅ Imported category: ${categoryName}`);

        // Insert subcategories
        for (let j = 1; j < Math.min(row.length, 26); j++) { // Max 25 subcategories
          const subcategoryName = row[j]?.trim();
          if (subcategoryName && subcategoryName !== '') {
            await db.insert(serviceSubcategories).values({
              categoryId: category.id,
              name: subcategoryName,
              order: j - 1
            });
            importedSubcategories++;
            console.log(`   📝 Subcategory: ${subcategoryName}`);
          }
        }
      }

      console.log(`✅ CSV IMPORT COMPLETE: ${importedCategories} categories, ${importedSubcategories} subcategories`);
      
      res.json({
        success: true,
        message: "CSV import successful",
        importedCategories,
        importedSubcategories,
        totalItems: importedCategories + importedSubcategories
      });

    } catch (error: any) {
      console.error("❌ CSV Import failed:", error);
      res.status(500).json({
        success: false,
        message: "CSV import failed",
        error: error.message
      });
    }
  });

  // Test email endpoint
  app.post("/api/test-email", async (req, res) => {
    try {
      const { email, name } = req.body;
      
      if (!email || !name) {
        return res.status(400).json({ message: "Email and name are required" });
      }

      console.log(`🧪 Testing email to: ${email} for: ${name}`);
      const success = await sendProfileConfirmationEmail(email, name);
      
      if (success) {
        console.log(`✅ Test email sent successfully to ${email}`);
        res.json({ message: "Test email sent successfully", email, name });
      } else {
        console.log(`❌ Failed to send test email to ${email}`);
        res.status(500).json({ message: "Failed to send test email" });
      }
    } catch (error: any) {
      console.error("Test email error:", error);
      res.status(500).json({ message: "Error sending test email", error: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
