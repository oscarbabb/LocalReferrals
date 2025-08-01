# Overview

This is a full-stack TypeScript application for a local services marketplace called "Referencias Locales" - a platform that connects residents within buildings or neighborhoods with service providers like cleaners, tutors, handymen, and other professionals. The application allows users to discover, rate, and request services from verified local providers, fostering trust within residential communities.

**Recent Changes (January 2025):**
- Integrated PostgreSQL database using Neon Database with Drizzle ORM
- Replaced in-memory storage with persistent database storage
- Added automatic database seeding for service categories
- Enhanced visual design with larger logo and more orange branding accents

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

## Authentication & Authorization
- **Session Management**: Express sessions with PostgreSQL session store (connect-pg-simple)
- **User Types**: Regular users and service providers with role-based access
- **Profile Management**: User profiles with building/apartment information for local community features

## Key Features Architecture
- **Service Discovery**: Categorized service listings with search and filtering capabilities
- **Provider Profiles**: Detailed provider pages with ratings, reviews, and service descriptions
- **Review System**: Star-based rating system with written reviews for quality assurance
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