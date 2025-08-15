# Overview

This is a full-stack TypeScript application for a local services marketplace called "Referencias Locales" - a platform that connects residents within buildings or neighborhoods with service providers like cleaners, tutors, handymen, and other professionals. The application allows users to discover, rate, and request services from verified local providers, fostering trust within residential communities.

**Recent Changes (January 2025):**
- **Animated Navigation Micro-interactions (January 15, 2025):**
  - Implemented sophisticated tab navigation animations with smooth underline effects
  - Added hover micro-interactions with translateY animations and color transitions
  - Created animated gradient underlines that expand on hover and glow for active tabs
  - Enhanced button interactions with ripple effects and smooth scaling
  - Added staggered entrance animations for navigation items (0.1s delays)
  - Implemented mobile menu item animations with slide-in-from-right effects
  - Added gentle pulse animation for active navigation tabs
  - Enhanced user experience with smooth cubic-bezier transitions
- **Currency Conversion to Mexican Pesos (January 15, 2025):**
  - Completed comprehensive conversion from Colombian pesos to Mexican pesos throughout entire platform
  - Updated all frontend currency displays to use "MXN $" format for clear identification
  - Updated backend sample provider data with realistic Mexican peso hourly rates (1500-2500 MXN/hour)
  - Updated database provider records with realistic Mexican market pricing
  - Updated all form placeholders and examples to reflect realistic Mexican pricing (1500-5000 MXN ranges)
  - Entire platform now consistently uses Mexican peso pricing across all components and calculations
- Integrated PostgreSQL database using Neon Database with Drizzle ORM
- Replaced in-memory storage with persistent database storage
- Added automatic database seeding for service categories
- Enhanced visual design with larger logo and more orange branding accents
- **Advanced Review System Implementation (January 8, 2025):**
  - Enhanced database schema with detailed rating fields (service quality, communication, punctuality, value for money)
  - Integrated object storage for photo uploads in reviews
  - Created advanced review form with photo upload capabilities
  - Built enhanced review cards displaying detailed ratings and photo galleries
  - Added review demo page showcasing new features at `/review-demo`
- **Service Category Icon Enhancement (January 8, 2025):**
  - Replaced emoji icons with professional Lucide React vector icons
  - Implemented vibrant multi-color gradient backgrounds for service cards
  - Added smooth hover animations with scaling and rotation effects
  - Enhanced visual design with shine effects and improved shadows
  - Fixed icon mapping to use actual database values (emoji to Lucide icon conversion)
- **One-Click Service Booking System (January 8, 2025):**
  - Implemented complete booking calendar with time slot selection and availability checking
  - Added QuickBookingButton component for instant booking from provider detail pages
  - Built comprehensive database schemas for provider availability, appointments, and booking management
  - Created API endpoints for availability checking, appointment scheduling, and booking workflows
  - Integrated calendar interface with date/time selection and conflict detection
  - Added automated provider availability seeding for all service providers
  - Reverted service category icons back to original emoji display for better visual appeal
- **Complete Spanish Localization and New Pages (January 8, 2025):**
  - Completed comprehensive Spanish translation of entire platform
  - Created dedicated Testimonials page with real customer testimonies and people's images
  - Built interactive "Cómo Funciona" (How It Works) page with detailed platform explanation
  - Added stylish step-by-step process visualization with interactive elements
  - Enhanced navigation with direct links to new dedicated pages
- **Provider Verification and Background Check System (January 8, 2025):**
  - Implemented comprehensive database schema for verification documents, background checks, and reviews
  - Added verification status tracking (pending, verified, rejected, suspended) with multiple levels (basic, standard, premium)
  - Created background check integration with status tracking and third-party service support
  - Built admin verification dashboard with provider management and status updates
  - Added verification requirements system configurable by service categories
  - Enhanced provider profiles with verification badges and status displays
- **Comprehensive Service Category Expansion (January 8, 2025):**
  - Expanded from 6 basic service categories to 26+ comprehensive categories
  - Added professional services: Legal advice, accounting, technology support, security services
  - Included health & wellness: Medical services, psychology, beauty, massages, personal training
  - Added creative services: Photography, event planning, interior design, art classes
  - Included specialized care: Childcare, elderly care, pet services, veterinary care
  - Added educational services: Languages, music lessons, tutoring, art workshops
  - Created complete local services marketplace covering all residential community needs

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **Routing**: Wouter for client-side routing with pages for home, services, providers, authentication, and user profiles
- **UI Components**: Shadcn/ui component library built on Radix UI primitives with Tailwind CSS for styling
- **State Management**: TanStack Query (React Query) for server state management and API caching
- **Forms**: React Hook Form with Zod validation for type-safe form handling

## Backend Architecture
- **Runtime**: Node.js with Express.js REST API server
- **Database ORM**: Drizzle ORM with PostgreSQL for type-safe database operations
- **API Structure**: RESTful endpoints for categories, providers, reviews, service requests, and messaging
- **Development Setup**: Hot reloading with Vite integration and custom middleware for request logging

## Data Storage
- **Primary Database**: PostgreSQL accessed through Neon Database serverless driver with WebSocket support
- **ORM**: Drizzle ORM with type-safe database operations and automatic schema synchronization
- **Schema Design**: Relational model with tables for users, service categories, providers, reviews, service requests, and messages
- **Type Safety**: Database schema definitions shared between frontend and backend using Drizzle Zod integration
- **Data Management**: DatabaseStorage class implementing all CRUD operations with automatic seeding
- **Object Storage**: Replit Object Storage for photo uploads with public visibility for review photos
- **Enhanced Reviews**: Review schema supports photo arrays, detailed ratings, verification status, and recommendation flags

## Authentication & Authorization
- **Session Management**: Express sessions with PostgreSQL session store (connect-pg-simple)
- **User Types**: Regular users and service providers with role-based access
- **Profile Management**: User profiles with building/apartment information for local community features

## Key Features Architecture
- **Service Discovery**: Categorized service listings with search and filtering capabilities
- **Provider Profiles**: Detailed provider pages with ratings, reviews, and service descriptions
- **Advanced Review System**: Enhanced rating system with detailed criteria (service quality, communication, punctuality, value for money), photo uploads, verification badges, and recommendation tracking
- **Photo Upload**: Object storage integration for review photos with automatic ACL management
- **Request Management**: Service request workflow for booking and communication between users and providers
- **Responsive Design**: Mobile-first approach with responsive components and mobile navigation

# External Dependencies

## Database & Storage
- **Neon Database**: Serverless PostgreSQL database hosting
- **Drizzle ORM**: Type-safe SQL query builder and migration tool

## UI & Styling
- **Tailwind CSS**: Utility-first CSS framework for responsive design
- **Shadcn/ui**: Pre-built accessible component library based on Radix UI
- **Radix UI**: Unstyled, accessible UI primitives for custom component development
- **Lucide React**: Icon library for consistent iconography

## Development Tools
- **Vite**: Fast development server and build tool with TypeScript support
- **PostCSS**: CSS processing with Tailwind CSS integration
- **ESBuild**: Fast JavaScript bundler for production builds

## Frontend Libraries
- **TanStack Query**: Server state management and data fetching
- **React Hook Form**: Form handling with validation
- **Zod**: Runtime type validation and schema definition
- **Date-fns**: Date manipulation and formatting utilities
- **Class Variance Authority**: Type-safe component variant management

## Session & State
- **Connect PG Simple**: PostgreSQL session store for Express sessions
- **Express**: Web framework for API endpoints and middleware