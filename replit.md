# Overview

This is a full-stack TypeScript application for a local services marketplace called "Referencias Locales" - a platform that connects residents within buildings or neighborhoods with service providers like cleaners, tutors, handymen, and other professionals. The application allows users to discover, rate, and request services from verified local providers, fostering trust within residential communities.

**Recent Changes (January 2025):**
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