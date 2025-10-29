# Overview

"Referencias Locales" is a full-stack TypeScript application designed as a local services marketplace. Its core purpose is to connect community residents with verified local service providers, enabling easy discovery, rating, and requesting of services. The platform aims to foster trust and stimulate local commerce within residential areas.

# Recent Changes (October 2025)

- **Implemented slug-based translation system** for categories/subcategories to fix production translation issues
  - Added slug columns to database schema with automatic migration on startup
  - Converted serviceTaxonomy.ts to use slugs instead of UUIDs as keys (55 categories, 431 subcategories)
  - Updated all translation function calls across frontend to use slugs with ID fallbacks for backwards compatibility
  - Auto-seed now generates slugs with category prefixes for subcategories to ensure uniqueness
  - Subcategory slugs follow pattern: `{category-slug}-{subcategory-slug}` for global uniqueness
- Fixed bilateral review notification emails routing based on reviewType
- Fixed rating button visibility logic in bookings page using robust provider identification
- Added status filter system (All/Pending/Completed) to "Received Requests" tab with bilingual support
- **Fixed "Remember Me" checkbox functionality** - Session cookies now properly persist (1 day default, 30 days when checked)
- **Fixed "Become a Provider" button** on testimonials page - Now navigates to registration with provider checkbox pre-selected via URL parameters
- **Fixed geolocation-based provider filtering** - Complete implementation and validation of distance-based provider discovery
  - Added serviceRadiusKm to provider creation API request (was missing from frontend form submission)
  - Made serviceRadiusKm required in frontend form schema with default value of 10km
  - Added backend validation requiring serviceRadiusKm between 1-100km in insertProviderSchema
  - Verified complete flow: user registration with coordinates, provider setup with service radius, and distance-based filtering at multiple radius levels
  - All geolocation features now working correctly: users and providers have coordinates, distance calculation via Haversine formula, dual-filter system (provider service radius + user radius filter)
- **Implemented Service Workflow Management** - Added provider controls for service lifecycle tracking
  - Added "Start Service" button for confirmed requests → changes status to in_progress
  - Added "Finish Service" button for in_progress requests → changes status to completed
  - Automatic feedback email sent to customers when service is marked completed
  - Email template includes personalized message, service details, and direct link to leave review
  - Bilingual button translations (Spanish: Iniciar Servicio / Finalizar Servicio, English: Start Service / Finish Service)
  - Complete workflow: pending → confirmed → in_progress → completed
- **Fixed critical subcategory display bug on Services page** (October 29, 2025) - Completely rewrote component with simple dropdown approach
  - **Root cause**: Radix UI Popover component had inconsistent behavior between development and production environments
  - **Solution**: Replaced Popover entirely with simple React state-based dropdown using basic div element
  - **Implementation**:
    - Simple onClick handler on Card component toggles dropdown visibility
    - Dropdown appears as absolutely positioned div below the card
    - Click-outside detection using useRef and useEffect to close dropdown
    - No complex component interactions or asChild patterns
  - **Benefits**: Works identically in both development and production, simpler code, no framework-specific quirks
  - **Testing**: All automated playwright tests pass - dropdown opens/closes correctly, navigation works
  - **Production Ready**: Fresh build completed (hash: BRN2ntYD), ready for deployment

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
- **Advanced Review System**: Detailed criteria, photo uploads, verification badges, with automatic bilateral email notifications (providers receive emails when customers review them, customers receive emails when providers review them).
- **Mutual Rating System**: Bidirectional rating for providers and customers with full email notification support.
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
- **SendGrid**: Email delivery system for notifications (profile confirmation, booking confirmations, service request notifications, review notifications with HTML sanitization).
- **Twilio**: WhatsApp messaging integration for user notifications.