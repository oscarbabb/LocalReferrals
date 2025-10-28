# Overview

"Referencias Locales" is a full-stack TypeScript application designed as a local services marketplace. Its core purpose is to connect community residents with verified local service providers, enabling easy discovery, rating, and requesting of services. The platform aims to foster trust and stimulate local commerce within residential areas.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript (Vite)
- **Routing**: Wouter
- **UI Components**: Shadcn/ui (built on Radix UI) with Tailwind CSS
- **State Management**: TanStack Query (React Query)
- **Forms**: React Hook Form with Zod validation
- **UI/UX**: Animated navigation, smooth transitions, hover effects, mobile-first responsive design, multi-color gradient backgrounds, professional Lucide React icons, and full internationalization support for Spanish and English.

## Backend Architecture
- **Runtime**: Node.js with Express.js REST API
- **Database ORM**: Drizzle ORM with PostgreSQL

## Data Storage
- **Primary Database**: PostgreSQL via Neon Database serverless driver
- **ORM**: Drizzle ORM
- **Schema Design**: Relational model including users, categories, providers, reviews, service requests, messages, and admin messages.
- **Type Safety**: Drizzle Zod integration.
- **Object Storage**: Replit Object Storage for photo uploads.

## Authentication & Authorization
- **Session Management**: Express sessions with PostgreSQL store.
- **User Types**: Regular users, service providers, and Admin users with role-based access.
- **Provider Verification**: System for tracking verification status.

## Key Features Architecture
- **Service Discovery**: Categorized listings with search and filters, including intelligent autocomplete search.
- **Smart Search System**: Type-ahead autocomplete comboboxes for categories/subcategories, supporting bilingual search.
- **Provider Profiles**: Detailed pages with ratings, reviews, menu items, and availability.
- **Advanced Review System**: Detailed criteria, photo uploads, verification badges.
- **Mutual Rating System**: Bidirectional rating for providers and customers.
- **One-Click Booking**: Calendar interface with time slot selection.
- **Booking Management**: Unified scheduled appointments view that displays both confirmed service requests and formal appointments, with duplicate prevention logic to avoid showing the same booking twice.
- **Messaging System**: Comprehensive inbox for provider-consumer conversations with real-time synchronization, delete, and forward capabilities. Includes an unread message alert system with database-backed tracking.
- **Admin Communication & Dashboard System**: User-to-admin messaging and an Admin Dashboard for message management, secured by role-based access.
- **Category Request System**: User-driven feature for suggesting new service categories with admin review workflow.
- **Geographical Service Radius**: Slider-based radius filter for providers and consumers.
- **Provider Tools**: Availability Management, Menu Management, Multi-Category Registration, Menu Document Upload/Replacement/Deletion. File upload restrictions are implemented across all upload components.
- **Legal Documentation**: Comprehensive, bilingual Terms & Conditions and Privacy Policy pages.
- **Disclaimer System**: Non-dismissible disclaimer dialog for authenticated users on key pages.
- **Internationalization**: Full bilingual support (Spanish/English) with persistent language preferences.
- **Invite/Share Feature**: Sharing option via WhatsApp, Email, or link copy.

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

## Backend & Session
- **Express**: Web framework.
- **Connect PG Simple**: PostgreSQL session store.
- **SendGrid**: Email delivery system.
- **Twilio**: WhatsApp messaging integration for user notifications.