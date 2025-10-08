import { bookings } from './bookings';
import { messages } from './messages';
import { profile } from './profile';

export const es = {
  // Navigation (existing)
  'nav.home': 'Inicio',
  'nav.services': 'Servicios',
  'nav.providers': 'Proveedores',
  'nav.testimonials': 'Testimonios',
  'nav.howItWorks': 'Cómo Funciona',
  'nav.profile': 'Perfil',
  'nav.login': 'Iniciar Sesión',
  'nav.logout': 'Cerrar Sesión',
  'nav.bookings': 'Mis Reservas',
  'nav.messages': 'Mensajes',
  'nav.tour': 'Ver Tour de la Plataforma',
  'nav.logoutToastTitle': 'Sesión cerrada',
  'nav.logoutToastSuccess': 'Has cerrado sesión exitosamente.',
  'nav.logoutToastError': 'Error al cerrar sesión',
  'nav.logoutToastErrorDesc': 'Hubo un problema al cerrar tu sesión.',
  
  // Home page (existing)
  'home.title': 'Referencias Locales',
  'home.slogan': 'Busca y encuentra servicios cercanos a tu condominio',
  'home.getStarted': 'Comenzar',
  'home.howItWorks': 'Cómo Funciona',
  'home.viewServices': 'Ver Servicios',
  'home.findProviders': 'Buscar Proveedores',
  'home.heroTitle1': 'Encuentra Servicios',
  'home.heroTitle2': 'de Confianza',
  'home.heroTitle3': 'en tu Comunidad',
  'home.exploreServices': 'Explorar Servicios',
  'home.categoriesTitle': 'Categorías de',
  'home.categoriesHighlight': 'Servicios',
  'home.viewAllServices': 'Ver Todos los Servicios',
  'home.searchFilterTitle': 'Busca y Filtra',
  'home.searchFilterDesc': 'Explora servicios por categoría, ubicación y calificaciones. Encuentra exactamente lo que necesitas.',
  'home.trustSecurityTitle': 'Confianza y Seguridad',
  'home.verifiedProvidersTitle': 'Proveedores Verificados',
  'home.verifiedProvidersDesc': 'Todos nuestros proveedores pasan por un proceso de verificación riguroso.',
  'home.localCommunityTitle': 'Comunidad Local',
  'home.localCommunityDesc': 'Conoce a tus vecinos y construye relaciones de confianza.',
  'home.ctaText': 'Únete a cientos de vecinos que ya encontraron servicios de confianza en Referencias Locales',
  'home.footerServices': 'Servicios',
  'home.footerRights': '© 2025 Referencias Locales. Todos los derechos reservados.',
  
  // Services (existing)
  'services.title': 'Categorías de Servicios',
  'services.description': 'Encuentra el servicio que necesitas',
  'services.providers': 'proveedores',
  'services.viewAll': 'Ver Todos',
  
  // Services page
  'services.pageTitle': 'Categorías de Servicios',
  'services.pageDescription': 'Encuentra exactamente lo que necesitas',
  'services.searchPlaceholder': 'Buscar servicios...',
  'services.filterPlaceholder': 'Filtrar por categoría',
  'services.allCategories': 'Todas las categorías',
  'services.noResults': 'No se encontraron servicios que coincidan con tu búsqueda.',
  
  // Auth (existing)
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
  
  // Providers (existing)
  'providers.title': 'Proveedores de Servicios',
  'providers.searchPlaceholder': 'Buscar proveedores...',
  'providers.rating': 'Calificación',
  'providers.reviews': 'reseñas',
  'providers.hourlyRate': 'Tarifa por hora',
  'providers.viewProfile': 'Ver Perfil',
  'providers.noResults': 'No se encontraron proveedores',
  
  // Common (existing)
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
  
  // Import feature translations
  ...bookings,
  ...messages,
  ...profile,
};
