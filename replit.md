# Overview

"Referencias Locales" is a full-stack TypeScript application designed as a local services marketplace. It connects residents within communities with verified local service providers (e.g., cleaners, tutors, handymen). The platform enables users to discover, rate, and request services, aiming to foster trust and facilitate local commerce within residential areas.

# User Preferences

Preferred communication style: Simple, everyday language.

# Recent Changes

- **Reusable Footer Component Implementation** (October 21, 2025): Created professional footer component with improved design featuring three-section layout: brand section (logo, description, social media icons), quick links (Services, How It Works, Providers, FAQ), and legal links (Terms, Privacy, Cookies hash link, Contact mailto). Features gradient background (gray-900 to gray-800), hover effects with smooth transitions, scale animation on social icons, and copyright message with "Made with ❤️" tagline. Fully bilingual using existing translation keys from home.footer* namespace. Footer integrated into FAQ, Terms, Privacy, and Services pages. Fixed nested anchor tag issue identified by architect review - Wouter Link components now render correctly without invalid HTML nesting. Responsive design collapses to single column on mobile. Architect-approved - consistent footer navigation now available across key pages.

- **FAQ Section Integration** (October 21, 2025): Implemented comprehensive FAQ (Frequently Asked Questions) page with 10 detailed Q&A pairs covering platform policies, payment processing, account verification, cancellation/refund policy, prohibited content, reviews, copyright infringement, data protection, dispute resolution, and user reporting. Features real-time search functionality filtering both questions and answers, Shadcn Accordion UI for clean presentation, bilingual support (Spanish/English) with 40+ translation keys, "no results" state, contact support CTA linking to admin contact, and responsive design. Accessible from header's "More" dropdown menu and mobile navigation. E2E tested and architect-approved - users can now find answers to common questions without contacting support.

- **Email System Migration to SendGrid** (October 17, 2025): Migrated email delivery system from MailerSend to SendGrid due to MailerSend API authentication issues. Complete replacement of server/email.ts to use @sendgrid/mail package while maintaining all existing email templates (welcome, booking confirmation, provider notification). Email addresses remain unchanged (FROM_EMAIL: hello@referenciaslocales.com.mx, SUPPORT_EMAIL: support@referenciaslocales.com.mx). All three email types verified working via E2E tests. System logs "✅ Email sent successfully to <email>" for successful deliveries. Test endpoint available at POST /api/test-email. Architect-reviewed and approved - email delivery now fully functional for user registration, booking confirmations, and provider notifications.

- **Disclaimer Dialog Integration** (October 16, 2025): Implemented comprehensive disclaimer system to inform users about platform responsibilities and safety recommendations. DisclaimerDialog component automatically displays to authenticated users who haven't accepted the disclaimer on key pages (how-it-works, providers) and after completing the onboarding tour. Features bilingual support (Spanish/English) with 15+ translation keys covering user responsibilities, platform limitations, and safety recommendations. Database tracking via disclaimerAccepted and disclaimerAcceptedAt fields with PATCH /api/users/:id endpoint support. Dialog is non-dismissible until accepted, ensuring all users acknowledge important platform policies. E2E tested - users see disclaimer once, acceptance persists across sessions.

- **Provider Radius Filter** (October 16, 2025): Added slider-based radius filter (1-100 km) to providers page enabling users to filter providers by their service delivery range. Uses existing serviceRadiusKm field to show providers whose delivery range meets or exceeds selected radius. Fully bilingual with "Service Radius"/"Radio de Servicio" label and "Any distance"/"Cualquier distancia" for 100km setting. E2E tested and architect-approved - users can now narrow provider search by geographical service coverage.

- **Subcategory Counter Addition** (October 16, 2025): Added subcategory counter display on services page alongside category counter. Shows "431 subcategories available" (or Spanish equivalent). Queries `/api/subcategories` endpoint, includes bilingual translation support, and matches existing UI styling. E2E tested and architect-approved - users can now see both category (55) and subcategory (431) counts at a glance.

- **Category/Subcategory Request System** (October 16, 2025): Implemented user-driven category request feature enabling users to suggest new service categories and subcategories. Added database schema (category_requests table), API endpoints (POST/GET/PATCH with auth protection), RequestCategoryDialog component with form validation, and UI integration on services page with category counter and request button. Full bilingual support (English/Spanish) with 20+ translation keys. E2E tested and architect-approved - users can now request new categories/subcategories which admins can review and approve.

- **Database Connection Error Fix** (October 15, 2025): Fixed critical crash caused by Neon serverless database connection terminations. Added error handling to PostgreSQL connection pool to gracefully handle idle connection closures without crashing the application. App now recovers automatically from database connection errors.

- **Complete Bilingual Translation Implementation** (October 15, 2025): Comprehensive platform-wide translation to Spanish/English across 26 pages and 6 shared components (600+ translation keys). Systematic domain-based rollout covering public pages, user management, provider tools, payment flows, and components. All Zod validation schemas converted to translation-aware functions. Fixed Email label translation bug in auth page. E2E tested and architect-approved - no hardcoded strings remain, all UI elements translate correctly.

- **Subcategory Header Translation Fix** (October 16, 2025): Added translation key for "Subcategories" header in service card dropdown. Previously hardcoded as "Subcategorías", now properly translates between Spanish ("Subcategorías") and English ("Subcategories"). Translation keys added to both locale files and service-card component updated to use translation function.

- **Header Navigation Refactoring** (October 15, 2025): Complete redesign with two-tier layout to eliminate overlap issues. Top utility bar (desktop-only) contains language toggle, invite button, and auth controls. Main navigation displays primary links inline (Services, Como Funciona, Providers, Testimonials) with "More" dropdown for secondary items (Bookings, Messages, Contact Admin, Admin Dashboard). Mobile uses hamburger menu. Fully tested and architect-approved.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript (Vite)
- **Routing**: Wouter
- **UI Components**: Shadcn/ui (built on Radix UI) with Tailwind CSS
- **State Management**: TanStack Query (React Query) for server state
- **Forms**: React Hook Form with Zod validation
- **UI/UX**: Animated navigation, smooth transitions, hover effects, mobile-first responsive design, multi-color gradient backgrounds for service cards, professional Lucide React icons, and full internationalization support for Spanish and English.

## Backend Architecture
- **Runtime**: Node.js with Express.js REST API
- **Database ORM**: Drizzle ORM with PostgreSQL
- **API Structure**: RESTful endpoints for core functionalities.

## Data Storage
- **Primary Database**: PostgreSQL via Neon Database serverless driver
- **ORM**: Drizzle ORM for type-safe operations and schema synchronization.
- **Schema Design**: Relational model including users, categories, providers, reviews, service requests, messages, and admin messages.
- **Type Safety**: Drizzle Zod integration for shared schema definitions.
- **Object Storage**: Replit Object Storage for photo uploads.

## Authentication & Authorization
- **Session Management**: Express sessions with PostgreSQL store.
- **User Types**: Regular users and service providers with role-based access; Admin users with role-based access.
- **Provider Verification**: System for tracking verification status.

## Key Features Architecture
- **Service Discovery**: Categorized listings with search and filters.
- **Provider Profiles**: Detailed pages with ratings, reviews, menu items, and availability.
- **Advanced Review System**: Detailed criteria, photo uploads, verification badges.
- **One-Click Booking**: Calendar interface with time slot selection.
- **Messaging System**: Comprehensive inbox page for conversations between providers and consumers.
- **Admin Communication & Dashboard System**: Contact Admin page for users to submit lost & found, questions, complaints, suggestions, and general inquiries with category and priority selection. Admin Dashboard (`/admin-dashboard`) for admins to view all messages with filters (category/status/priority), respond to users, and manage message status independently. Role-based access with `isAdmin` database field and middleware protection. Secure authorization checks prevent cross-tenant access.
- **Category Request System**: User-driven feature allowing authenticated users to request new service categories or subcategories. Includes modal dialog with form validation (request type, name, parent category for subcategories, description), API endpoints with authentication protection, and admin review workflow. Services page displays category counter and request button.
- **Geographical Service Radius**: Optional preference (1-100 km) for both providers (service delivery range) and consumers (service reception range), validated on frontend and backend.
- **Provider Tools**: Availability Management (weekly schedules), Menu Management (items, document uploads), Multi-Category Registration.
- **Legal Documentation**: Comprehensive Terms & Conditions and Privacy Policy pages with ARCO rights and cookie policy, fully bilingual.
- **Disclaimer System**: Non-dismissible disclaimer dialog shown to authenticated users on first visit to key pages (how-it-works, providers) and after onboarding tour completion. Informs users about platform limitations, user responsibilities, and safety recommendations. Acceptance tracked in database (disclaimerAccepted, disclaimerAcceptedAt fields) and persists across sessions. Fully bilingual with detailed content including recommendations for verifying credentials, checking references, and establishing clear agreements.
- **Internationalization**: Full bilingual support (Spanish/English) with modular locale architecture, feature-based translation files, and persistent language preferences; locale-aware date formatting.
- **Invite/Share Feature**: Prominently styled button allowing users to share the platform via WhatsApp, Email, or link copy.

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