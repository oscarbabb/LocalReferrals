import { bookings } from './bookings';
import { messages } from './messages';
import { profile } from './profile';

export const en = {
  // Navigation (existing)
  'nav.home': 'Home',
  'nav.services': 'Services',
  'nav.providers': 'Providers',
  'nav.testimonials': 'Testimonials',
  'nav.howItWorks': 'How It Works',
  'nav.profile': 'Profile',
  'nav.login': 'Sign In',
  'nav.logout': 'Sign Out',
  'nav.bookings': 'My Bookings',
  'nav.messages': 'Messages',
  'nav.tour': 'Take Platform Tour',
  'nav.logoutToastTitle': 'Logged out',
  'nav.logoutToastSuccess': 'You have successfully logged out.',
  'nav.logoutToastError': 'Logout error',
  'nav.logoutToastErrorDesc': 'There was a problem logging out.',
  
  // Home page (existing)
  'home.title': 'Local References',
  'home.slogan': 'Find and discover services near your condominium',
  'home.getStarted': 'Get Started',
  'home.howItWorks': 'How It Works',
  'home.viewServices': 'View Services',
  'home.findProviders': 'Find Providers',
  'home.heroTitle1': 'Find Trusted',
  'home.heroTitle2': 'Services',
  'home.heroTitle3': 'in Your Community',
  'home.exploreServices': 'Explore Services',
  'home.categoriesTitle': 'Service',
  'home.categoriesHighlight': 'Categories',
  'home.viewAllServices': 'View All Services',
  'home.searchFilterTitle': 'Search and Filter',
  'home.searchFilterDesc': 'Explore services by category, location and ratings. Find exactly what you need.',
  'home.trustSecurityTitle': 'Trust and Security',
  'home.verifiedProvidersTitle': 'Verified Providers',
  'home.verifiedProvidersDesc': 'All our providers go through a rigorous verification process.',
  'home.localCommunityTitle': 'Local Community',
  'home.localCommunityDesc': 'Meet your neighbors and build trusted relationships.',
  'home.ctaText': 'Join hundreds of neighbors who have already found trusted services on Local References',
  'home.footerServices': 'Services',
  'home.footerRights': '© 2025 Local References. All rights reserved.',
  
  // Services (existing)
  'services.title': 'Service Categories',
  'services.description': 'Find the service you need',
  'services.providers': 'providers',
  'services.viewAll': 'View All',
  
  // Services page
  'services.pageTitle': 'Service Categories',
  'services.pageDescription': 'Find exactly what you need',
  'services.searchPlaceholder': 'Search services...',
  'services.filterPlaceholder': 'Filter by category',
  'services.allCategories': 'All categories',
  'services.noResults': 'No services found matching your search.',
  
  // Auth (existing)
  'auth.register': 'Sign Up',
  'auth.login': 'Sign In',
  'auth.fullName': 'Full Name',
  'auth.email': 'Email',
  'auth.password': 'Password',
  'auth.confirmPassword': 'Confirm Password',
  'auth.building': 'Building/Condominium',
  'auth.apartment': 'Apartment Number',
  'auth.address': 'Address',
  'auth.phone': 'Phone',
  'auth.selectUserType': 'Select user type',
  'auth.userType.user': 'User',
  'auth.userType.provider': 'Service Provider',
  'auth.hasAccount': 'Already have an account?',
  'auth.noAccount': "Don't have an account?",
  'auth.switchToLogin': 'Sign in here',
  'auth.switchToRegister': 'Sign up here',
  
  // Providers (existing)
  'providers.title': 'Service Providers',
  'providers.searchPlaceholder': 'Search providers...',
  'providers.rating': 'Rating',
  'providers.reviews': 'reviews',
  'providers.hourlyRate': 'Hourly rate',
  'providers.viewProfile': 'View Profile',
  'providers.noResults': 'No providers found',
  
  // Common (existing)
  'common.search': 'Search',
  'common.filter': 'Filter',
  'common.loading': 'Loading...',
  'common.error': 'Error',
  'common.submit': 'Submit',
  'common.cancel': 'Cancel',
  'common.save': 'Save',
  'common.edit': 'Edit',
  'common.delete': 'Delete',
  'common.close': 'Close',
  
  // Import feature translations
  ...bookings,
  ...messages,
  ...profile,
};
