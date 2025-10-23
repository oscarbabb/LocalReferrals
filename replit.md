# Overview

"Referencias Locales" is a full-stack TypeScript application functioning as a local services marketplace. Its primary purpose is to connect residents with verified local service providers within their communities, facilitating the discovery, rating, and requesting of services. The platform aims to build trust and boost local commerce in residential areas.

# User Preferences

Preferred communication style: Simple, everyday language.

# Recent Changes

## October 23, 2025 - Real-Time Messaging Synchronization
- **Messaging System Enhancement**: Implemented automatic polling for real-time message synchronization
  - Added 3-second polling to conversation modal when open - recipients see new messages within 3 seconds
  - Added 5-second polling to messages page conversation list for real-time updates
  - Solved critical issue where message recipients couldn't see new messages without manual page refresh
  - Polling intervals optimized for performance - modal only polls when open, preventing unnecessary network traffic
  - React Query handles polling lifecycle - no memory leaks or lingering timers

## October 23, 2025 - Menu Document Management Enhancement
- **Enhanced Provider Profile**: Added comprehensive menu document upload, replace, and delete functionality
  - Upload interface with drag-and-drop UI for new menu documents (PDF, JPG, PNG up to 10MB)
  - Preview display for existing menu documents (PDF indicator or image preview)
  - Replace menu document with new file
  - Delete existing menu document
  - Fixed double `/objects/` prefix bug in menu document URLs
  - Added proper provider existence guards to prevent runtime errors
  - Integrated with existing ObjectStorage service and API endpoints

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
- **Service Discovery**: Categorized listings with search and filters, including intelligent autocomplete search for categories/subcategories.
- **Smart Search System**: Type-ahead autocomplete comboboxes on both Services and Providers pages using Shadcn Command component, allowing users to type first letters of any category or subcategory (e.g., "plom" for "Plomería") to instantly filter results across all 55 categories and 431 subcategories with bilingual support.
- **Provider Profiles**: Detailed pages with ratings, reviews, menu items, and availability.
- **Advanced Review System**: Detailed criteria, photo uploads, verification badges.
- **Mutual Rating System**: Bidirectional rating capability where providers can rate customers and customers can rate providers after completed bookings. Customer ratings (provider→customer reviews) are displayed on user profiles with the same detailed criteria as provider reviews.
- **One-Click Booking**: Calendar interface with time slot selection.
- **Messaging System**: Comprehensive inbox for provider-consumer conversations.
- **Admin Communication & Dashboard System**: User-to-admin messaging for support and inquiries; Admin Dashboard for message management with filters, response capabilities, and status updates, secured by role-based access.
- **Category Request System**: User-driven feature allowing authenticated users to suggest new service categories or subcategories with admin review workflow.
- **Geographical Service Radius**: Slider-based radius filter for providers (service delivery range) and consumers (service reception range).
- **Provider Tools**: Availability Management, Menu Management, Multi-Category Registration, Menu Document Upload/Replacement/Deletion.
- **Legal Documentation**: Comprehensive, bilingual Terms & Conditions and Privacy Policy pages.
- **Disclaimer System**: Non-dismissible disclaimer dialog for authenticated users on key pages and post-onboarding, tracking acceptance in the database.
- **Internationalization**: Full bilingual support (Spanish/English) with modular locale architecture, feature-based translation files, and persistent language preferences.
- **Invite/Share Feature**: Prominent sharing option via WhatsApp, Email, or link copy.

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

## Messaging & Notifications
- **Email Notifications**: SendGrid integration for welcome emails, booking confirmations, and password resets.
- **WhatsApp Notifications**: Twilio WhatsApp API for welcome messages to users and providers (requires phone number during registration).
  - **Configuration**: Uses `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, and `TWILIO_WHATSAPP_NUMBER` environment variables.
  - **Important**: Users must opt-in to receive WhatsApp messages (sandbox users need to send join code; production users must have previously messaged the business number).
  - **Integration Points**: Welcome messages sent during user registration and provider profile setup (only if phone number is provided).