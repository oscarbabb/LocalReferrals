/**
 * Production seed data for service categories
 * Complete 54 categories with subcategories from CSV
 * This file is bundled with the deployment and guarantees data availability
 */

import { db } from "./db";
import { serviceCategories, serviceSubcategories } from "@shared/schema";
import { randomUUID } from "crypto";

export interface CategorySeed {
  name: string;
  description: string;
  icon: string;
  color: string;
  subcategories: string[];
}

export const categoriesSeed: CategorySeed[] = [
  {
    name: "Administración Condominal",
    description: "Servicios profesionales de administración de condominios",
    icon: "🏢",
    color: "blue",
    subcategories: ["Administración profesional y tesorería", "Asambleas y actas", "Auditoría y transparencia", "Contratación y supervisión de proveedores", "Mantenimiento integral del condominio", "Protocolos de huracán y emergencias"]
  },
  {
    name: "Agencias de Viajes y Tours",
    description: "Servicios de viajes, tours y experiencias turísticas",
    icon: "✈️",
    color: "blue",
    subcategories: ["Agencia integral (IATA/GDS)", "Boletos de avión y tren", "Cruceros", "Grupos y MICE", "Hoteles y estancias", "Paquetes (vuelo + hotel)", "Renta de auto y chofer", "Seguros de viaje y asistencia", "Tours y experiencias", "Transportación turística y traslados", "Viajes de bodas y romance", "Viajes sustentables", "Visas y asesoría de viaje", "Workations / Nómadas digitales"]
  },
  {
    name: "Agua y Tratamiento",
    description: "Servicios de tratamiento y purificación de agua",
    icon: "💧",
    color: "blue",
    subcategories: ["Análisis de calidad de agua", "Bombas e hidroneumáticos", "Captación de lluvia", "Cisternas/tinacos y sanitización", "Drenaje y aguas residuales", "Ósmosis y suavizadores"]
  },
  {
    name: "Albercas y Jacuzzis",
    description: "Mantenimiento y reparación de albercas",
    icon: "🏊",
    color: "blue",
    subcategories: ["Bombas y filtros", "Calentamiento (solar/eléctrico)", "Cubiertas y seguridad perimetral", "Limpieza y balance químico", "Rescate de agua verde", "Revestimientos e iluminación"]
  },
  {
    name: "Altas de Servicios y Gestoría Domiciliaria",
    description: "Trámites y gestión de servicios del hogar",
    icon: "📋",
    color: "blue",
    subcategories: ["Agua y drenaje (altas, medidores)", "Citas, pagos y aclaraciones con dependencias", "Electricidad (altas, medidores)", "Gas LP/Natural (contratos y seguridad)", "Recolección de basura y reciclaje"]
  },
  {
    name: "Automotriz y Movilidad",
    description: "Servicios de lavado y detallado automotriz",
    icon: "🚗",
    color: "blue",
    subcategories: ["Auxilio vial básico", "Detallado de motos, bicis y scooters", "Encerado/pulido y corrección de pintura", "Lavado de flotas y valet empresarial", "Lavado de motor (en seco/controlado)", "Lavado y detallado a domicilio", "Limpieza de interiores y sanitización", "Polarizado y estética", "Protección cerámica / PPF", "Tapicería y lavado de asientos"]
  },
  {
    name: "Bienes Raíces y Property Management",
    description: "Servicios inmobiliarios y administración de propiedades",
    icon: "🏠",
    color: "blue",
    subcategories: ["Administración de propiedades", "Arrendamiento corporativo", "Avalúos y opinión de valor", "Due diligence inmobiliario", "Home staging", "Venta y renta"]
  },
  {
    name: "Bolsa de Trabajo y Talento",
    description: "Búsqueda de empleo en servicios locales",
    icon: "💼",
    color: "blue",
    subcategories: ["Alberquero (técnico de alberca)", "Carpintero / Herrero / Vidriero", "Chofer / Conductor ejecutivo", "Cocinera / Cocinero", "Cocinero / Chef / Stewarding", "Compras / Contabilidad / Administración", "Conductor sprinter/autobús", "Coordinador de eventos / Montajista / Audio-Iluminación", "Guía de turistas / Ventas tours", "Housekeeping / Ama de llaves", "Jardinería y paisajismo (operativo)", "Mesero / Bartender / Barista", "Paseador / Groomer / Auxiliar veterinario", "Personal de servicio/limpieza (hogar/condominio)", "Pintor / Impermeabilizador", "Plomero / Electricista / Técnico A/A", "Recepcionista / Concierge", "Recursos Humanos / Atención a clientes", "Reservaciones / Front desk", "Tutorías / Maestros de idiomas", "Vigilancia / Guardia"]
  },
  {
    name: "Carpintería y Muebles",
    description: "Servicios profesionales de carpintería y fabricación de muebles",
    icon: "🔨",
    color: "blue",
    subcategories: ["Carpintería a medida", "Cubiertas (madera/compuesto)", "Muebles exteriores", "Persianas y closets inteligentes", "Puertas, closets y cocinas integrales", "Restauración y barnices"]
  },
  {
    name: "Clasificados: Perdido y Encontrado",
    description: "Objetos perdidos y encontrados en la comunidad",
    icon: "🔍",
    color: "blue",
    subcategories: ["Bicicletas / Scooters", "Documentos e identificaciones", "Electrónicos", "Joyas y relojes", "Llaves", "Mascotas", "Otros", "Ropa y accesorios"]
  },
  {
    name: "Cocina, Banquetes y Eventos",
    description: "Servicios de catering, chef a domicilio y eventos",
    icon: "🍽️",
    color: "blue",
    subcategories: ["Banquetes y catering", "Bares móviles y mixología", "Chef a domicilio y meal-prep", "DJ/Audio/Iluminación", "Planeación de bodas y eventos", "Renta de mobiliario y montaje"]
  },
  {
    name: "Comercio Exterior y Aduanas",
    description: "Servicios de importación y exportación",
    icon: "🌍",
    color: "blue",
    subcategories: ["Agente aduanal y regulaciones NOM", "Asesoría importación/exportación", "Clasificación arancelaria y pedimentos", "IMMEX y logística internacional", "Seguro de carga y embalaje"]
  },
  {
    name: "Construcción y Remodelación",
    description: "Servicios profesionales de construcción y remodelación",
    icon: "🏗️",
    color: "blue",
    subcategories: ["Cocinas y baños (remodelación)", "Obra gris y albañilería", "Pisos y recubrimientos", "Planificación de obra y presupuestos", "Tablaroca/drywall y plafones", "Techos y pérgolas"]
  },
  {
    name: "Control de Plagas",
    description: "Servicios profesionales de control y prevención de plagas",
    icon: "🦟",
    color: "blue",
    subcategories: ["Certificados y garantías", "Control integrado post-obra", "Desratización", "Fumigación general", "Mosquitos y vectores", "Termitas y carcoma"]
  },
  {
    name: "Donativos, Voluntariado y ONG",
    description: "Organizaciones sin fines de lucro y voluntariado",
    icon: "❤️",
    color: "blue",
    subcategories: ["Campañas y colectas (emergencias, regreso a clases, temporada fría)", "Certificaciones de ONG y cumplimiento", "Donaciones en especie (alimentos, ropa, higiene, mobiliario, equipo)", "Donaciones monetarias (únicas y recurrentes)", "Matching corporativo y patrocinios", "Recogida a domicilio de donaciones / puntos de acopio", "Transparencia y reportes de impacto", "Voluntariado individual y corporativo (incl. pro bono)"]
  },
  {
    name: "Drones, Topografía e Inspecciones",
    description: "Servicios de drones y topografía",
    icon: "🚁",
    color: "blue",
    subcategories: ["Cartografía y levantamientos", "Entrega de ortomosaicos", "Fotogrametría", "Gestión de permisos de vuelo", "Inspección de techos/fachadas", "Termografía"]
  },
  {
    name: "Educación y Tutorías",
    description: "Clases particulares y apoyo educativo",
    icon: "📚",
    color: "blue",
    subcategories: ["Apoyo escolar", "Educación especial y psicopedagogía", "Habilidades digitales y ofimática", "Lectura y redacción", "Preparación COMIPEMS/EXANI/SAT/GMAT/GRE", "Programación/robótica STEM", "Regularización por nivel", "Terapia de lenguaje", "Tutorías universitarias (mates/física/química)", "Técnicas de estudio y exámenes"]
  },
  {
    name: "Electricidad",
    description: "Servicios profesionales de electricidad e instalaciones eléctricas",
    icon: "⚡",
    color: "blue",
    subcategories: ["Diagnóstico de cortos/variación", "Iluminación LED y diseño", "Instalaciones y canalizaciones", "Pararrayos y puesta a tierra", "Tablero eléctrico y protecciones", "Tomas, contactos y USB"]
  },
  {
    name: "Electrodomésticos",
    description: "Reparación y mantenimiento de electrodomésticos",
    icon: "🔌",
    color: "blue",
    subcategories: ["Equipos comerciales ligeros", "Garantías y refacciones", "Instalación (hornos, lavavajillas)", "Mantenimiento preventivo", "Reparación de línea blanca"]
  },
  {
    name: "Energía y Sustentabilidad",
    description: "Soluciones de energía renovable y sustentabilidad",
    icon: "🌞",
    color: "blue",
    subcategories: ["Calentamiento solar de agua", "Certificaciones verdes", "Eficiencia energética y auditorías", "Generadores y respaldo", "Gestión de residuos/reciclaje", "Paneles solares y almacenamiento"]
  },
  {
    name: "Eventos Corporativos y Sociales",
    description: "Organización integral de eventos",
    icon: "🎉",
    color: "blue",
    subcategories: ["Audio, iluminación y video", "Bodas / Wedding planner", "Carpas, toldos y domos", "Catering y coffee breaks", "Convenciones y congresos", "Coordinación y gestión de proveedores", "Decoración y flores", "Entretenimiento", "Eventos sociales (XV, bautizos, aniversarios)", "Fotografía y video", "Generadores y UPS", "Limpieza post-evento", "Mobiliario y ambientación", "Permisos y Protección Civil", "Pirotecnia fría y efectos especiales", "Planeación y producción integral", "Registro y acreditaciones", "Seguridad y accesos", "Señalización y branding", "Tarimas, pistas y escenarios", "Transporte de invitados", "Venue scouting"]
  },
  {
    name: "Fitness y Belleza",
    description: "Servicios de belleza y acondicionamiento físico",
    icon: "💅",
    color: "blue",
    subcategories: ["Barbería y estilismo a domicilio", "Entrenamiento personal", "Manicure y pedicure", "Maquillaje y peinado para eventos", "Spa y masajes terapéuticos", "Tratamientos faciales y corporales"]
  },
  {
    name: "Fotografía y Video",
    description: "Servicios profesionales de fotografía y video",
    icon: "📸",
    color: "blue",
    subcategories: ["Dron/FPV", "Edición y post", "Eventos y social", "Inmobiliaria y arquitectura"]
  },
  {
    name: "Gestión de Residuos y Reciclaje",
    description: "Recolección y reciclaje de residuos",
    icon: "♻️",
    color: "blue",
    subcategories: ["Certificados de disposición", "Compostaje y puntos verdes", "Reciclaje de papel/cartón/plástico/vidrio/metal", "Recolección de voluminosos y escombro", "Residuos peligrosos domésticos"]
  },
  {
    name: "Herrería, Aluminio y Vidrio",
    description: "Servicios profesionales de herrería y vidriería",
    icon: "🔩",
    color: "blue",
    subcategories: ["Barandales y puertas", "Cortinas metálicas", "Cristales templados", "Mosquiteros y sellos", "Soldadura y estructuras ligeras", "Ventanas y cancelería"]
  },
  {
    name: "Idiomas y Certificaciones",
    description: "Clases de idiomas y preparación para certificaciones",
    icon: "🗣️",
    color: "blue",
    subcategories: ["CELPE-Bras", "Chino/Japonés", "Clases corporativas y coaching", "DELE/SIELE", "DELF/DALF", "Español para extranjeros", "Francés/Alemán/Italiano/Portugués", "Goethe/TestDaF", "Inglés general y académico", "Preparación TOEFL/IELTS/Cambridge"]
  },
  {
    name: "Impresión y Señalización",
    description: "Servicios de impresión y señalética",
    icon: "🖨️",
    color: "blue",
    subcategories: ["Lonas y vinil", "Papelería corporativa y personal", "Rotulación vehicular y vitrinas", "Señalética de seguridad", "Sublimación/serigrafía y promocionales"]
  },
  {
    name: "Inmigración y Servicios Migratorios",
    description: "Asesoría migratoria y gestión de visas",
    icon: "🛂",
    color: "blue",
    subcategories: ["Antecedentes no penales", "Apostilla y legalización", "Asesoría migratoria integral", "Casos legales y apelaciones", "Citas consulares y formularios", "Cumplimiento corporativo", "Defensa/deportación/asilo", "Extensiones de visa", "Naturalización y ciudadanía", "Notaría/fe pública", "Regularización / canje", "Relocalización (enlace Expat)", "Residencia temporal y permanente", "Seguimiento de estatus", "Traducción certificada (enlace)", "Visas de estudiante", "Visas de inversionista y nómada digital", "Visas de trabajo y permisos", "Visas de turista/negocios", "Visas familiares"]
  },
  {
    name: "Jardinería y Paisajismo",
    description: "Servicios profesionales de jardinería y diseño de paisajes",
    icon: "🌿",
    color: "blue",
    subcategories: ["Control de plagas de jardín", "Jardín vertical y huertos", "Mantenimiento de jardines", "Paisajismo y diseño", "Podas y tala controlada", "Riego automatizado"]
  },
  {
    name: "Lavandería y Tintorería",
    description: "Servicios de lavandería y tintorería",
    icon: "👕",
    color: "blue",
    subcategories: ["Alfombras y tapetes", "Lavado y planchado a domicilio", "Lavandería industrial", "Ropa delicada/edredones/cortinas", "Tintorería fina"]
  },
  {
    name: "Limpieza",
    description: "Servicios profesionales de limpieza para hogares y oficinas",
    icon: "🧹",
    color: "blue",
    subcategories: ["Cisternas y tinacos", "Desinfección y sanitización", "Limpieza post-obra", "Limpieza profunda", "Limpieza residencial", "Retiro de escombros", "Tapicerías y alfombras", "Vidrios y altura"]
  },
  {
    name: "Marketplace",
    description: "Compra, venta e intercambio de artículos",
    icon: "🛒",
    color: "blue",
    subcategories: ["Accesorios para mascotas", "Bebés y niños", "Deportes y ciclismo", "Donaciones / Regálalo", "Electrodomésticos y línea blanca", "Electrónica y cómputo", "Herramientas y ferretería", "Libros, música e instrumentos", "Moda y accesorios", "Muebles y decoración del hogar", "Trueque / Intercambio", "Vehículos y autopartes ligeras"]
  },
  {
    name: "Mascotas y Veterinaria",
    description: "Servicios veterinarios y cuidado de mascotas",
    icon: "🐾",
    color: "blue",
    subcategories: ["Adopción y rescate (dar/recibir)", "Alimentos y suplementos (delivery)", "Asesoría nutricional", "Clínicas móviles / esterilización", "Control de parásitos", "Documentación y viajes", "Entrenamiento y conducta", "Especialidades veterinarias", "Especies exóticas", "Eutanasia y cremación", "Fotografía de mascotas", "Grooming (baño a domicilio, estética)", "Guardería y hotel de mascotas", "Microchip e identificación", "Paseos y pet sitting", "Perdido y Encontrado (enlace)", "Refugios y asociaciones", "Rehabilitación e hidroterapia", "Reproducción responsable", "Seguros para mascotas", "Tele-veterinaria", "Tienda y accesorios", "Transporte de mascotas (pet taxi)", "Urgencias 24/7 y hospitalización", "Veterinaria general (consulta, vacunas)"]
  },
  {
    name: "Mensajería, Paquetería y Mandados",
    description: "Servicios de mensajería y mandados",
    icon: "📦",
    color: "blue",
    subcategories: ["Entrega local (última milla)", "Personal shopper (super/farmacia)", "Trámites/gestoría express"]
  },
  {
    name: "Mudanzas y Logística",
    description: "Servicios de mudanzas y transporte de muebles",
    icon: "📦",
    color: "blue",
    subcategories: ["Embalaje profesional", "Mini-bodegas/guardamuebles", "Mudanza local y nacional", "Recolección de voluminosos", "Servicios náuticos (moto/bote)", "Traslado de objetos frágiles"]
  },
  {
    name: "Organizaciones Sociales y Asistencia",
    description: "Organizaciones de asistencia social",
    icon: "🤝",
    color: "blue",
    subcategories: ["Bancos de alimentos y comedores", "Casas de adultos mayores / asilos", "Centros comunitarios y bibliotecas", "Centros de rehabilitación", "Fundaciones", "ONG ambientales y protección animal", "Orfanatos y casas hogar", "Programas de inclusión y discapacidad", "Refugios y albergues"]
  },
  {
    name: "Pintura e Impermeabilización",
    description: "Servicios profesionales de pintura e impermeabilización",
    icon: "🎨",
    color: "blue",
    subcategories: ["Fachadas y revocos", "Impermeabilización de azoteas", "Pintura interior/exterior", "Recubrimientos epóxicos", "Resanes y yeso", "Tratamiento de humedades/salitre"]
  },
  {
    name: "Plomería",
    description: "Servicios profesionales de plomería e instalaciones",
    icon: "🔧",
    color: "blue",
    subcategories: ["Bombas e hidroneumáticos", "Calentadores (gas/eléctrico)", "Fugas y desazolve", "Instalación y reparación de llaves y WC", "Purificación de agua / ósmosis", "Tuberías y drenaje"]
  },
  {
    name: "Psicología y Bienestar",
    description: "Servicios de psicología y bienestar emocional",
    icon: "🧠",
    color: "blue",
    subcategories: ["Coaching y bienestar emocional", "Grupos de apoyo", "Mindfulness y manejo de estrés", "Psicoterapia individual/pareja", "Terapias alternativas"]
  },
  {
    name: "Rentas",
    description: "Renta de espacios y equipos",
    icon: "🏘️",
    color: "blue",
    subcategories: ["Bodegas / mini-bodegas", "Coworking y salas por hora", "Cuartos/coliving/roommate", "Estacionamiento / cajón", "Oficinas y locales comerciales", "Renta de equipo (herramientas, eventos)", "Vivienda: casa/departamento/estudio"]
  },
  {
    name: "Rentas Vacacionales y Co-Hosting",
    description: "Gestión de propiedades vacacionales",
    icon: "🏖️",
    color: "blue",
    subcategories: ["Atención a huéspedes 24/7", "Check-in/out y llaves inteligentes", "Foto/Video inmobiliario", "Gestión de anuncios y pricing", "Inspecciones y reportes", "Limpieza turnover y lavandería"]
  },
  {
    name: "Reparación de Dispositivos y Electrónica",
    description: "Reparación de dispositivos electrónicos",
    icon: "🔧",
    color: "blue",
    subcategories: ["Celulares y tablets", "Consolas y periféricos", "Laptops/PC (hardware/software)", "Mantenimiento preventivo", "Respaldo y ciberseguridad doméstica"]
  },
  {
    name: "Restaurantes y Comida a Domicilio",
    description: "Servicios de comida a domicilio",
    icon: "🍕",
    color: "blue",
    subcategories: ["Bebidas y hielo a domicilio", "Catering express hogar/oficina", "Comida casera a domicilio", "Dark kitchens / ghost kitchens", "Dietas especiales (vegano/keto/sin gluten)", "Kits de cocina (ready-to-cook)", "Meal-prep semanal", "Repostería y panadería a domicilio", "Restaurantes locales (pedido y entrega)", "Servicio nocturno / 24/7", "Supermercado / abarrotes a domicilio", "Suscripciones de comida"]
  },
  {
    name: "Rifas, Sorteos y Promociones",
    description: "Organización de rifas y sorteos",
    icon: "🎲",
    color: "blue",
    subcategories: ["Certificación de ganador y publicación", "Concursos de habilidad (no azar)", "Giveaways digitales", "Rifas benéficas (ONG)", "Software de sorteo y auditoría", "Sorteos promocionales", "Tómbolas y eventos"]
  },
  {
    name: "Salud, Medicina y Enfermería",
    description: "Servicios médicos y de enfermería",
    icon: "⚕️",
    color: "blue",
    subcategories: ["Enfermería y curaciones", "Especialistas (odonto/oftalmo/etc.)", "Fisioterapia y rehabilitación", "Laboratorio a domicilio", "Médico general (domicilio/telemedicina)", "Nutrición clínica"]
  },
  {
    name: "Seguridad (CCTV y Accesos)",
    description: "Sistemas de seguridad y vigilancia",
    icon: "🔒",
    color: "blue",
    subcategories: ["Alarmas y sensores", "Cercas eléctricas", "Cerrajería urgente 24/7", "Control de acceso y videoporteros", "Cámaras y DVR/NVR", "Monitoreo y respuesta"]
  },
  {
    name: "Servicios Funerarios",
    description: "Servicios funerarios y de previsión",
    icon: "🕊️",
    color: "blue",
    subcategories: ["Acompañamiento psicológico", "Cremación/inhumación y velatorios", "Planes de previsión", "Traslado y repatriación", "Trámites y actas"]
  },
  {
    name: "Servicios Legales y Notariales",
    description: "Asesoría legal y servicios notariales",
    icon: "⚖️",
    color: "blue",
    subcategories: ["Civil (contratos, arrendamiento, sucesiones)", "Familiar (divorcios, custodia)", "Fiscal (defensa SAT, planeación)", "Inmobiliario y condominios", "Laboral (asesoría/defensa)", "Mediación y arbitraje", "Mercantil/Corporativo (constitución, gobierno)", "Migratorio (enlace a categoría 34)", "Notaría (escrituras, poderes)", "Penal (asesoría/defensa)", "Propiedad intelectual y datos personales"]
  },
  {
    name: "Servicios Náuticos y Marina",
    description: "Servicios para embarcaciones y yates",
    icon: "⛵",
    color: "blue",
    subcategories: ["Capitanes y tripulación", "Electrónica marina", "Limpieza de yates y muelles", "Mantenimiento de embarcaciones", "Permisos y seguros marítimos", "Varado y pintura antiincrustante"]
  },
  {
    name: "Servicios para Comercios y Oficinas",
    description: "Servicios especializados para negocios",
    icon: "🏪",
    color: "blue",
    subcategories: ["Cortinas metálicas y accesos", "Limpieza comercial y post-horario", "Mantenimiento integral (facility)", "Refrigeración/comercial y cocinas industriales", "Sanitización y control de inventarios"]
  },
  {
    name: "Tecnología, Redes y Smart Home",
    description: "Instalación y configuración de redes y domótica",
    icon: "🏡",
    color: "blue",
    subcategories: ["Asistentes de voz y escenas", "Ciberseguridad doméstica", "Domótica (iluminación/clima/cortinas)", "Routers y mallas (mesh)", "Servidores NAS/backup", "Wi-Fi y cableado estructurado"]
  },
  {
    name: "Telecomunicaciones e Internet",
    description: "Servicios de internet y telecomunicaciones",
    icon: "📡",
    color: "blue",
    subcategories: ["Cableado estructurado y racks", "Instalación de fibra/ISP y routers", "Optimización Wi-Fi (site survey)", "Telefonía IP/centralitas y cámaras IP", "TV satelital/cable y streaming"]
  },
  {
    name: "Traducción e Interpretación",
    description: "Servicios de traducción e interpretación",
    icon: "🌐",
    color: "blue",
    subcategories: ["Apostilla y legalización de traducciones", "Interpretación simultánea y consecutiva", "Localización de sitios y apps", "Subtitulaje y voice-over", "Traducción certificada / perito traductor", "Traducción legal y técnica", "Transcripción certificada"]
  },
  {
    name: "Transporte Terrestre y Conductores",
    description: "Servicios de transporte y choferes",
    icon: "🚕",
    color: "blue",
    subcategories: ["Chofer privado por hora (sedán/SUV/van)", "Interurbano (Cancún–Playa–Tulum, etc.)", "Limo/ejecutivo", "Paquetería rider (enlace)", "Transporte accesible (rampa)", "Transporte escolar", "Transporte para eventos", "Traslados aeropuerto (privado/compartido)", "Traslados punto a punto", "Vans/autobuses con operador"]
  },
  {
    name: "Aire Acondicionado y Refrigeración",
    description: "Servicios profesionales de climatización y refrigeración",
    icon: "❄️",
    color: "blue",
    subcategories: ["Instalación de minisplits", "Mantenimiento preventivo", "Reparación de equipos", "Recarga de gas refrigerante", "Limpieza profunda", "Refrigeración comercial"]
  }
];

/**
 * Seeds the database with initial categories and subcategories
 * This function is idempotent - safe to run multiple times
 */
export async function seedCategoriesFromJSON() {
  try {
    console.log("🌱 Seeding database from JSON...");
    
    let importedCategories = 0;
    let importedSubcategories = 0;

    for (const categorySeed of categoriesSeed) {
      const categoryId = randomUUID();
      
      await db.insert(serviceCategories).values({
        id: categoryId,
        name: categorySeed.name,
        description: categorySeed.description,
        icon: categorySeed.icon,
        color: categorySeed.color,
      }).onConflictDoNothing();
      
      importedCategories++;

      for (let i = 0; i < categorySeed.subcategories.length; i++) {
        await db.insert(serviceSubcategories).values({
          id: randomUUID(),
          categoryId: categoryId,
          name: categorySeed.subcategories[i],
          order: i,
        }).onConflictDoNothing();
        
        importedSubcategories++;
      }
    }

    console.log(`✅ Seeded ${importedCategories} categories and ${importedSubcategories} subcategories`);
    
    return {
      success: true,
      importedCategories,
      importedSubcategories
    };
  } catch (error: any) {
    console.error("❌ Seeding failed:", error);
    return {
      success: false,
      error: error.message
    };
  }
}
