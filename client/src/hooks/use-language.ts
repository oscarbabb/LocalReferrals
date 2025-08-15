import { useState, useEffect, createContext, useContext } from 'react';

export type Language = 'es' | 'en';

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

// Translation dictionary
const translations = {
  es: {
    // Navigation
    'nav.home': 'Inicio',
    'nav.services': 'Servicios',
    'nav.providers': 'Proveedores',
    'nav.testimonials': 'Testimonios',
    'nav.howItWorks': 'Cómo Funciona',
    'nav.profile': 'Perfil',
    'nav.login': 'Iniciar Sesión',
    'nav.logout': 'Cerrar Sesión',
    
    // Home page
    'home.title': 'Referencias Locales',
    'home.slogan': 'Busca y encuentra servicios cercanos a tu condominio',
    'home.getStarted': 'Comenzar',
    'home.howItWorks': 'Cómo Funciona',
    'home.viewServices': 'Ver Servicios',
    'home.findProviders': 'Buscar Proveedores',
    
    // Services
    'services.title': 'Categorías de Servicios',
    'services.description': 'Encuentra el servicio que necesitas',
    'services.providers': 'proveedores',
    'services.viewAll': 'Ver Todos',
    
    // Auth
    'auth.register': 'Registrarse',
    'auth.login': 'Iniciar Sesión',
    'auth.fullName': 'Nombre Completo',
    'auth.email': 'Correo Electrónico',
    'auth.password': 'Contraseña',
    'auth.confirmPassword': 'Confirmar Contraseña',
    'auth.building': 'Edificio/Condominio',
    'auth.apartment': 'Número de Apartamento',
    'auth.address': 'Dirección',
    'auth.phone': 'Teléfono',
    'auth.selectUserType': 'Selecciona el tipo de usuario',
    'auth.userType.user': 'Usuario',
    'auth.userType.provider': 'Proveedor de Servicios',
    'auth.hasAccount': '¿Ya tienes una cuenta?',
    'auth.noAccount': '¿No tienes una cuenta?',
    'auth.switchToLogin': 'Inicia sesión aquí',
    'auth.switchToRegister': 'Regístrate aquí',
    
    // Providers
    'providers.title': 'Proveedores de Servicios',
    'providers.searchPlaceholder': 'Buscar proveedores...',
    'providers.rating': 'Calificación',
    'providers.reviews': 'reseñas',
    'providers.hourlyRate': 'Tarifa por hora',
    'providers.viewProfile': 'Ver Perfil',
    'providers.noResults': 'No se encontraron proveedores',
    
    // Common
    'common.search': 'Buscar',
    'common.filter': 'Filtrar',
    'common.loading': 'Cargando...',
    'common.error': 'Error',
    'common.submit': 'Enviar',
    'common.cancel': 'Cancelar',
    'common.save': 'Guardar',
    'common.edit': 'Editar',
    'common.delete': 'Eliminar',
    'common.close': 'Cerrar',
  },
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.services': 'Services',
    'nav.providers': 'Providers',
    'nav.testimonials': 'Testimonials',
    'nav.howItWorks': 'How It Works',
    'nav.profile': 'Profile',
    'nav.login': 'Sign In',
    'nav.logout': 'Sign Out',
    
    // Home page
    'home.title': 'Local References',
    'home.slogan': 'Find and discover services near your condominium',
    'home.getStarted': 'Get Started',
    'home.howItWorks': 'How It Works',
    'home.viewServices': 'View Services',
    'home.findProviders': 'Find Providers',
    
    // Services
    'services.title': 'Service Categories',
    'services.description': 'Find the service you need',
    'services.providers': 'providers',
    'services.viewAll': 'View All',
    
    // Auth
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
    
    // Providers
    'providers.title': 'Service Providers',
    'providers.searchPlaceholder': 'Search providers...',
    'providers.rating': 'Rating',
    'providers.reviews': 'reviews',
    'providers.hourlyRate': 'Hourly rate',
    'providers.viewProfile': 'View Profile',
    'providers.noResults': 'No providers found',
    
    // Common
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
  }
};

export function useLanguageManager(): LanguageContextType {
  const [language, setLanguage] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('language');
      return (saved as Language) || 'es'; // Default to Spanish
    }
    return 'es';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
    document.documentElement.lang = language;
  }, [language]);

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'es' ? 'en' : 'es');
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations[typeof language]] || key;
  };

  return {
    language,
    toggleLanguage,
    t
  };
}