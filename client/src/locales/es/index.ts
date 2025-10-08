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
  
  // Home page (existing)
  'home.title': 'Referencias Locales',
  'home.slogan': 'Busca y encuentra servicios cercanos a tu condominio',
  'home.getStarted': 'Comenzar',
  'home.howItWorks': 'Cómo Funciona',
  'home.viewServices': 'Ver Servicios',
  'home.findProviders': 'Buscar Proveedores',
  
  // Services (existing)
  'services.title': 'Categorías de Servicios',
  'services.description': 'Encuentra el servicio que necesitas',
  'services.providers': 'proveedores',
  'services.viewAll': 'Ver Todos',
  
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
