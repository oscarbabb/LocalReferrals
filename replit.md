# Overview

"Referencias Locales" is a full-stack TypeScript application functioning as a local services marketplace. It connects residents within communities with verified local service providers (cleaners, tutors, handymen, etc.), enabling users to discover, rate, and request services. The platform aims to foster trust and facilitate local commerce within residential areas.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript (Vite)
- **Routing**: Wouter
- **UI Components**: Shadcn/ui (built on Radix UI) with Tailwind CSS
- **State Management**: TanStack Query (React Query) for server state
- **Forms**: React Hook Form with Zod validation
- **UI/UX**: Animated navigation with smooth transitions, hover effects, and mobile-first responsive design. Multi-color gradient backgrounds for service cards, professional Lucide React icons, and Spanish localization.

## Backend Architecture
- **Runtime**: Node.js with Express.js REST API
- **Database ORM**: Drizzle ORM with PostgreSQL
- **API Structure**: RESTful endpoints for core functionalities (categories, providers, reviews, requests, messaging).
- **Development Setup**: Hot reloading with Vite, custom middleware.

## Data Storage
- **Primary Database**: PostgreSQL via Neon Database serverless driver
- **ORM**: Drizzle ORM for type-safe operations and schema synchronization.
- **Schema Design**: Relational model including users, categories, providers, reviews, service requests, and messages.
- **Type Safety**: Drizzle Zod integration for shared schema definitions.
- **Object Storage**: Replit Object Storage for photo uploads (reviews, menus).
- **Advanced Features**: Enhanced review schema (detailed ratings, photos), provider availability management, menu management (items, documents), multi-category provider registration.

## Authentication & Authorization
- **Session Management**: Express sessions with PostgreSQL store.
- **User Types**: Regular users and service providers with role-based access.
- **Profile Management**: User profiles with community-specific information.
- **Provider Verification**: System for tracking verification status (basic, standard, premium) and background checks.

## Key Features Architecture
- **Service Discovery**: Categorized listings with search and filters.
- **Provider Profiles**: Detailed pages with ratings, reviews, menu items, and availability.
- **Advanced Review System**: Detailed criteria, photo uploads, verification badges.
- **One-Click Booking**: Calendar interface with time slot selection and availability checking.
- **Provider Tools**: Availability Management (weekly schedules, CRUD operations), Menu Management (items, document uploads), Multi-Category Registration (many-to-many relationship).
- **Localization**: Complete Spanish translation of the platform.

# External Dependencies

## Database & Storage
- **Neon Database**: Serverless PostgreSQL hosting.
- **Drizzle ORM**: Type-safe SQL query builder.
- **Replit Object Storage**: For photo and document uploads.

## UI & Styling
- **Tailwind CSS**: Utility-first CSS framework.
- **Shadcn/ui**: Pre-built accessible React components.
- **Radix UI**: Unstyled, accessible UI primitives.
- **Lucide React**: Icon library.

## Development Tools
- **Vite**: Fast development server and build tool.
- **PostCSS**: CSS processing.
- **ESBuild**: Fast JavaScript bundler.

## Frontend Libraries
- **TanStack Query**: Server state management.
- **React Hook Form**: Form handling.
- **Zod**: Runtime type validation.
- **Date-fns**: Date manipulation.
- **Class Variance Authority**: Type-safe component variant management.

## Backend & Session
- **Express**: Web framework.
- **Connect PG Simple**: PostgreSQL session store.