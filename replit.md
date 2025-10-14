# Overview

"Referencias Locales" is a full-stack TypeScript application functioning as a local services marketplace. It connects residents within communities with verified local service providers (cleaners, tutors, handymen, etc.), enabling users to discover, rate, and request services. The platform aims to foster trust and facilitate local commerce within residential areas.

## Recent Changes (October 14, 2025)

**Geographical Service Radius Feature Implementation:**
- Added optional service radius field (1-100 km) for both providers and consumers
- Database: Added `serviceRadiusKm` integer nullable field to both `users` and `providers` tables
- Backend API: Updated PATCH /api/users/:id, PATCH /api/providers/:id, and POST /api/providers routes with radius validation (.nullable().optional())
- Frontend Forms: Provider setup and user profile pages include radius input fields with proper validation
- Frontend Display: Service radius shown on provider cards and detail pages with Globe icon (Lucide React)
- Validation: Frontend uses z.preprocess to convert empty strings to undefined, backend accepts null/missing values
- Optional field: Users and providers can leave radius blank or set 1-100 km range
- Full bilingual support (Spanish/English) with translation keys in profile.ts and index.ts locale files
- Proper data-testid attributes for testing (input-service-radius, input-user-service-radius, text-service-radius)
- Architect-verified: Validation correctly handles empty values, valid integers (1-100), and rejects invalid inputs (0, negatives, >100, decimals)
- Use cases: Providers set maximum service delivery radius, consumers set maximum service reception radius

**Admin Communication System Implementation:**
- Created comprehensive admin messaging feature for lost & found, questions, and community support
- Database: Added `admin_messages` table with userId, subject, category, message, status, priority, adminResponse fields
- Backend API: POST /api/admin-messages (create), GET /api/admin-messages/user/:userId (list user's messages)
- Security: Routes properly secured with authentication and authorization - users can only view/create their own messages
- Frontend: Contact Admin page (`/contact-admin`) with form (category, priority, subject, message) and message history
- Navigation: Added "Contact Admin" link to header with HelpCircle icon for easy access
- Categories: lost_and_found, question, complaint, suggestion, general
- Priority levels: low, medium, high, urgent
- Status tracking: open, in_progress, resolved
- Full bilingual support (Spanish/English) with 20+ translation keys in dedicated admin.ts locale files
- All user-facing text uses translation system - no hard-coded strings
- Proper data-testid attributes throughout for future testing
- Admin response capability built-in (awaiting admin role implementation for full functionality)
- Architect-verified as secure - no cross-tenant data exposure or unauthorized access possible

**Previous Changes (October 13, 2025):**

**Legal Documentation Pages Implementation:**
- Created Terms & Conditions page (`/terms`) with full legal content extracted from official PDF
- Created Privacy Policy page (`/privacy`) including ARCO rights and cookie policy
- Both pages feature complete bilingual support (Spanish/English) with 60+ translation keys
- Professional layout with white card on gray background, proper typography, and semantic HTML
- Back-to-home navigation button with arrow icon for easy return to main site
- Footer links updated to route to legal pages instead of placeholder links
- Routes registered in App.tsx for proper navigation flow
- All interactive elements include data-testid attributes for testing
- Legal content includes: Terms of Use, Service Scope, Obligations, Verification Process, Liability Disclaimers, ARCO Rights, Cookie Policy
- Architect-verified as production-ready; awaiting legal counsel sign-off on content accuracy

**Header Layout Optimization:**
- Removed tour button from desktop header to save horizontal space (still available in mobile menu)
- Reduced spacing throughout header for better space efficiency (space-x-2)
- All navigation items now fit properly without overflow at standard desktop widths
- Maintains all 6 core navigation links (Services, Como Funciona, Providers, Bookings, Messages, Testimonials)

**Invite/Share Feature Implementation:**
- Created InviteButton component (`client/src/components/invite-button.tsx`) for easy platform sharing
- Integrated invite button into header on both desktop and mobile views
- Button shows icon + text ("Invitar Amigos"/"Invite Friends") for clarity - highly visible and obvious
- **Prominent orange styling** using `bg-accent` color (hsl(15, 90%, 60%)) to stand out as primary call-to-action
- Multiple sharing methods: WhatsApp (wa.me URL scheme), Email (mailto links), Copy Link (clipboard API)
- Fully bilingual with complete Spanish and English translations (10+ translation keys)
- All user-facing text uses translation system - no hard-coded strings
- Success/error toasts for clipboard operations with proper localization
- Designed to help platform growth by enabling users to invite neighbors and friends
- Clean dialog UI with Lucide React icons (Share2, MessageCircle, Mail, Copy)
- Proper test IDs for all interactive elements for future testing

**Safari Browser Compatibility Fixed:**
- Created `client/src/lib/date-utils.ts` with `parseSafeDate()` utility function for Safari-compatible date parsing
- Fixed Safari's strict date parsing by normalizing PostgreSQL timestamps ("YYYY-MM-DD HH:mm:ss") to ISO 8601 format
- Updated 8 components to use Safari-safe date parsing: booking-calendar, messages, bookings, provider-detail, messaging-modal, profile, provider-verification, enhanced-review-card
- Fixed localStorage access for Safari private browsing mode with try-catch blocks in `use-language.ts`
- Language preference now persists correctly even in Safari private browsing
- Comprehensive testing verified no "Invalid Date" errors across all pages
- Platform now fully functional on Safari browser

**Previous Changes (October 8, 2025):**

**Full Platform Internationalization (Spanish/English):**
- Implemented modular locale architecture with feature-based translation files in `client/src/locales/{en,es}/`
- Created comprehensive translations for all user-facing pages: home (37 keys), services, bookings, messages, navigation
- Updated all pages to use `t()` translation function from `useLanguage` hook
- Language toggle in header switches entire platform between Spanish and English
- Language preference persists in localStorage and survives page navigation/refresh
- Translation system uses dot-notation naming convention (e.g., `bookings.title`, `messages.modal.send`)
- Modular structure allows easy addition of new translations and languages
- Default language: Spanish (es), supported languages: Spanish (es), English (en)
- **Dynamic Date Formatting**: Implemented locale-aware date-fns formatting - all dates and timestamps (messages, bookings, calendar) dynamically switch between English/Spanish based on selected language
- **Translation Coverage**: 80+ translation keys covering navigation, home page, services, bookings, messages, authentication, and common UI elements

**Messages/Inbox Page Implementation:**
- Created comprehensive Messages page (`/messages`) for viewing all user conversations
- Added backend API endpoint `GET /api/messages/user/:userId` with authentication and authorization
- Implemented conversation list showing participant names, last message preview, and relative timestamps
- Integrated with existing MessagingModal for seamless conversation viewing and sending
- Added navigation link with MessageCircle icon in header
- Fixed critical bug in queryKey to properly fetch user conversations
- Both providers and consumers can now access their complete message history in one place

**Review Photo Upload Bug Fix:**
- Fixed critical bug where clicking "Agregar Fotos" button in review form was prematurely submitting the review
- Added `type="button"` to ObjectUploader component to prevent default form submission behavior
- Photo upload button now correctly opens the upload modal without triggering form submission
- Users can now properly attach multiple photos before submitting their review
- All form buttons verified to have correct type attributes to prevent future submission issues

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
- **Messaging System**: Complete inbox page for viewing all conversations, MessagingModal for direct communication between providers and consumers, message history with timestamps.
- **Admin Communication System**: Contact Admin page for lost & found, questions, complaints, suggestions, and general inquiries. Category and priority selection, message history, admin response tracking, status management (open/in_progress/resolved). Secure user isolation with authorization checks.
- **Geographical Service Radius**: Optional radius preference (1-100 km) for both providers (service delivery range) and consumers (service reception range). Displayed on provider cards and detail pages with Globe icon. Fully validated on both frontend and backend with proper handling of optional values.
- **Provider Tools**: Availability Management (weekly schedules, CRUD operations), Menu Management (items, document uploads), Multi-Category Registration (many-to-many relationship).
- **Legal Documentation**: Comprehensive Terms & Conditions and Privacy Policy pages with ARCO rights, cookie policy, and full bilingual support. Accessible via footer navigation.
- **Internationalization**: Full bilingual support (Spanish/English) with modular locale architecture, feature-based translation files, and persistent language preferences.

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