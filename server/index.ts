import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { autoSeedFromCSV } from "./auto-seed";
import { migrateSlugsToExistingRecords } from "./migrate-slugs";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Simple health check endpoint - responds immediately
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Migrate slugs first - adds columns and populates existing records
  // This must run BEFORE auto-seed since auto-seed now expects slug columns
  try {
    const migrateResult = await migrateSlugsToExistingRecords();
    if (migrateResult.success) {
      log(`✅ Slug migration complete: ${migrateResult.categoriesUpdated} categories, ${migrateResult.subcategoriesUpdated} subcategories`);
    } else {
      log(`⚠️  Slug migration warning: ${migrateResult.error || 'Unknown error'}`);
    }
  } catch (error: any) {
    log(`❌ Slug migration error: ${error?.message || 'Unknown error'}`);
  }

  // Automatically seed database from CSV on startup if needed
  // This runs AFTER slug migration to ensure columns exist
  try {
    const result = await autoSeedFromCSV();
    if (result.success) {
      if (result.skipped) {
        log('✅ Database seeding check complete (already seeded)');
      } else {
        log(`✅ Database auto-seeded: ${result.importedCategories} categories, ${result.importedSubcategories} subcategories`);
      }
    } else {
      log(`⚠️  Auto-seed warning: ${result.error || 'Unknown error'}`);
    }
  } catch (error: any) {
    log(`❌ Auto-seed error: ${error?.message || 'Unknown error'}`);
  }

  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})().catch((error) => {
  console.error('Fatal error during server initialization:', error);
  process.exit(1);
});
