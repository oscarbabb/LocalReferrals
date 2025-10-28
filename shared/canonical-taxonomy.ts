/**
 * CANONICAL SERVICE TAXONOMY
 * 
 * This is the single source of truth for all service categories and subcategories.
 * All category and subcategory UUIDs are fixed and must never change.
 * 
 * This file consolidates data from:
 * - client/src/locales/data/serviceTaxonomy.ts (UUIDs and translations)
 * - server/seed-data.ts (icons, colors, descriptions, and structure)
 * 
 * DO NOT modify UUIDs - they are permanent identifiers used across the database.
 * 
 * @module canonical-taxonomy
 */

/**
 * Represents a service subcategory with fixed UUID and bilingual names
 */
export interface CanonicalSubcategory {
  /** Fixed UUID - never changes */
  id: string;
  /** Spanish name */
  nameEs: string;
  /** English name */
  nameEn: string;
  /** Display order within the category */
  order: number;
}

/**
 * Represents a service category with fixed UUID, metadata, and subcategories
 */
export interface CanonicalCategory {
  /** Fixed UUID - never changes */
  id: string;
  /** Spanish name */
  nameEs: string;
  /** English name */
  nameEn: string;
  /** Spanish description */
  description: string;
  /** Emoji icon for visual representation */
  icon: string;
  /** Color theme (e.g., "blue") */
  color: string;
  /** Array of subcategories belonging to this category */
  subcategories: CanonicalSubcategory[];
}

/**
 * Complete taxonomy of all 55 service categories with their subcategories.
 * This is the canonical source - all other category data should derive from this.
 */
export const CANONICAL_CATEGORIES: CanonicalCategory[] = [
  {
    id: "5223d70e-6f88-4c5c-92b4-a30e909b6808",
    nameEs: "Administración Condominal",
    nameEn: "Condominium Administration",
    description: "Servicios profesionales de administración de condominios",
    icon: "🏢",
    color: "blue",
    subcategories: [
      { id: "f1f1125a-87fa-40f2-af36-fda337f84af0", nameEs: "Administración profesional y tesorería", nameEn: "Professional Administration and Treasury", order: 0 },
      { id: "b4647f82-0501-4beb-9ef7-b926e943282c", nameEs: "Asambleas y actas", nameEn: "Assemblies and Minutes", order: 1 },
      { id: "934d868d-e787-4502-97df-bd43776127f8", nameEs: "Auditoría y transparencia", nameEn: "Audit and Transparency", order: 2 },
      { id: "9e5da504-4d8f-4fe7-be01-241a43463be9", nameEs: "Contratación y supervisión de proveedores", nameEn: "Provider Contracting and Supervision", order: 3 },
      { id: "7ff59ed2-b168-4a98-b89c-13ea5f7906f5", nameEs: "Mantenimiento integral del condominio", nameEn: "Comprehensive Condominium Maintenance", order: 4 },
      { id: "442800fc-a09b-4b45-a92d-b669e2f2ece0", nameEs: "Protocolos de huracán y emergencias", nameEn: "Hurricane and Emergency Protocols", order: 5 }
    ]
  },
  {
    id: "cf46eb23-e0c5-4c81-9849-95923fd687ba",
    nameEs: "Agencias de Viajes y Tours",
    nameEn: "Travel Agencies and Tours",
    description: "Servicios de viajes, tours y experiencias turísticas",
    icon: "✈️",
    color: "blue",
    subcategories: [
      { id: "missing-1-0", nameEs: "Agencia integral (IATA/GDS)", nameEn: "Agencia integral (IATA/GDS)", order: 0 },
      { id: "missing-1-1", nameEs: "Boletos de avión y tren", nameEn: "Boletos de avión y tren", order: 1 },
      { id: "b0652b00-f1e5-477d-a5e2-3862d3d1cdbe", nameEs: "Cruceros", nameEn: "Cruises", order: 2 },
      { id: "missing-1-3", nameEs: "Grupos y MICE", nameEn: "Grupos y MICE", order: 3 },
      { id: "missing-1-4", nameEs: "Hoteles y estancias", nameEn: "Hoteles y estancias", order: 4 },
      { id: "missing-1-5", nameEs: "Paquetes (vuelo + hotel)", nameEn: "Paquetes (vuelo + hotel)", order: 5 },
      { id: "missing-1-6", nameEs: "Renta de auto y chofer", nameEn: "Renta de auto y chofer", order: 6 },
      { id: "missing-1-7", nameEs: "Seguros de viaje y asistencia", nameEn: "Seguros de viaje y asistencia", order: 7 },
      { id: "missing-1-8", nameEs: "Tours y experiencias", nameEn: "Tours y experiencias", order: 8 },
      { id: "missing-1-9", nameEs: "Transportación turística y traslados", nameEn: "Transportación turística y traslados", order: 9 },
      { id: "missing-1-10", nameEs: "Viajes de bodas y romance", nameEn: "Viajes de bodas y romance", order: 10 },
      { id: "missing-1-11", nameEs: "Viajes sustentables", nameEn: "Viajes sustentables", order: 11 },
      { id: "missing-1-12", nameEs: "Visas y asesoría de viaje", nameEn: "Visas y asesoría de viaje", order: 12 },
      { id: "missing-1-13", nameEs: "Workations / Nómadas digitales", nameEn: "Workations / Nómadas digitales", order: 13 }
    ]
  },
  {
    id: "61c026f7-4c63-4e16-b086-4b3f88a136f8",
    nameEs: "Agua y Tratamiento",
    nameEn: "Water and Treatment",
    description: "Servicios de tratamiento y purificación de agua",
    icon: "💧",
    color: "blue",
    subcategories: [
      { id: "64b5bdf9-30c4-45df-ab8a-10c62a9e5f1c", nameEs: "Análisis de calidad de agua", nameEn: "Water Quality Analysis", order: 0 },
      { id: "missing-2-1", nameEs: "Bombas e hidroneumáticos", nameEn: "Bombas e hidroneumáticos", order: 1 },
      { id: "missing-2-2", nameEs: "Captación de lluvia", nameEn: "Captación de lluvia", order: 2 },
      { id: "missing-2-3", nameEs: "Cisternas/tinacos y sanitización", nameEn: "Cisternas/tinacos y sanitización", order: 3 },
      { id: "missing-2-4", nameEs: "Drenaje y aguas residuales", nameEn: "Drenaje y aguas residuales", order: 4 },
      { id: "missing-2-5", nameEs: "Ósmosis y suavizadores", nameEn: "Ósmosis y suavizadores", order: 5 }
    ]
  },
  {
    id: "495da282-60d1-4cab-8195-6c0227f95e6b",
    nameEs: "Albercas y Jacuzzis",
    nameEn: "Pools and Jacuzzis",
    description: "Mantenimiento y reparación de albercas",
    icon: "🏊",
    color: "blue",
    subcategories: [
      { id: "391cee21-076d-448b-a459-fd795a0c8322", nameEs: "Bombas y filtros", nameEn: "Pumps and Filters", order: 0 },
      { id: "08c750b9-2af7-4163-aaab-c9e6c8e0279e", nameEs: "Calentamiento (solar/eléctrico)", nameEn: "Heating (Solar/Electric)", order: 1 },
      { id: "437372b1-0863-4970-996d-357f74ee49cf", nameEs: "Cubiertas y seguridad perimetral", nameEn: "Covers and Perimeter Safety", order: 2 },
      { id: "87699ea2-a52a-4669-8c6e-ad8f46c87e8a", nameEs: "Limpieza y balance químico", nameEn: "Cleaning and Chemical Balance", order: 3 },
      { id: "9be9ed84-07ec-4e98-9549-10f84fbd3f30", nameEs: "Rescate de agua verde", nameEn: "Green Water Recovery", order: 4 },
      { id: "6aad8889-cd14-4a23-8822-2d59ee1d8c07", nameEs: "Revestimientos e iluminación", nameEn: "Coatings and Lighting", order: 5 }
    ]
  },
  {
    id: "a172237d-4446-421e-acf8-94f3ad8c2f1e",
    nameEs: "Altas de Servicios y Gestoría Domiciliaria",
    nameEn: "Service Registration and Home Management",
    description: "Trámites y gestión de servicios del hogar",
    icon: "📋",
    color: "blue",
    subcategories: [
      { id: "missing-4-0", nameEs: "Agua y drenaje (altas, medidores)", nameEn: "Agua y drenaje (altas, medidores)", order: 0 },
      { id: "missing-4-1", nameEs: "Citas, pagos y aclaraciones con dependencias", nameEn: "Citas, pagos y aclaraciones con dependencias", order: 1 },
      { id: "missing-4-2", nameEs: "Electricidad (altas, medidores)", nameEn: "Electricidad (altas, medidores)", order: 2 },
      { id: "missing-4-3", nameEs: "Gas LP/Natural (contratos y seguridad)", nameEn: "Gas LP/Natural (contratos y seguridad)", order: 3 },
      { id: "missing-4-4", nameEs: "Recolección de basura y reciclaje", nameEn: "Recolección de basura y reciclaje", order: 4 }
    ]
  },
  {
    id: "89ba9434-cb52-4d94-bc62-4532b445b26f",
    nameEs: "Automotriz y Movilidad",
    nameEn: "Automotive and Mobility",
    description: "Servicios de lavado y detallado automotriz",
    icon: "🚗",
    color: "blue",
    subcategories: [
      { id: "missing-5-0", nameEs: "Auxilio vial básico", nameEn: "Auxilio vial básico", order: 0 },
      { id: "missing-5-1", nameEs: "Detallado de motos, bicis y scooters", nameEn: "Detallado de motos, bicis y scooters", order: 1 },
      { id: "missing-5-2", nameEs: "Encerado/pulido y corrección de pintura", nameEn: "Encerado/pulido y corrección de pintura", order: 2 },
      { id: "missing-5-3", nameEs: "Lavado de flotas y valet empresarial", nameEn: "Lavado de flotas y valet empresarial", order: 3 },
      { id: "missing-5-4", nameEs: "Lavado de motor (en seco/controlado)", nameEn: "Lavado de motor (en seco/controlado)", order: 4 },
      { id: "missing-5-5", nameEs: "Lavado y detallado a domicilio", nameEn: "Lavado y detallado a domicilio", order: 5 },
      { id: "missing-5-6", nameEs: "Limpieza de interiores y sanitización", nameEn: "Limpieza de interiores y sanitización", order: 6 },
      { id: "missing-5-7", nameEs: "Polarizado y estética", nameEn: "Polarizado y estética", order: 7 },
      { id: "missing-5-8", nameEs: "Protección cerámica / PPF", nameEn: "Protección cerámica / PPF", order: 8 },
      { id: "missing-5-9", nameEs: "Tapicería y lavado de asientos", nameEn: "Tapicería y lavado de asientos", order: 9 }
    ]
  },
  {
    id: "53dbffd4-cd06-4869-9887-8c66c8e2ae6a",
    nameEs: "Bienes Raíces y Property Management",
    nameEn: "Real Estate and Property Management",
    description: "Servicios inmobiliarios y administración de propiedades",
    icon: "🏠",
    color: "blue",
    subcategories: [
      { id: "d4acb2d8-64fb-4042-a066-eb33c776d083", nameEs: "Administración de propiedades", nameEn: "Property Management", order: 0 },
      { id: "de002e7b-01b2-4fd3-bc9b-e65570e6d29a", nameEs: "Arrendamiento corporativo", nameEn: "Corporate Leasing", order: 1 },
      { id: "c5e9019d-35ac-4d91-b264-b2a8397603d4", nameEs: "Avalúos y opinión de valor", nameEn: "Appraisals and Value Opinion", order: 2 },
      { id: "fd99a52a-3918-45b4-a0ee-8332a7260237", nameEs: "Due diligence inmobiliario", nameEn: "Real Estate Due Diligence", order: 3 },
      { id: "39124046-2840-42f4-8c7d-8ace5d26e92a", nameEs: "Home staging", nameEn: "Home Staging", order: 4 },
      { id: "382789e8-506f-47a5-b03b-cdfaa35bc229", nameEs: "Venta y renta", nameEn: "Sale and Rental", order: 5 }
    ]
  },
  {
    id: "548aac7f-9c0b-4342-bb90-b92992788188",
    nameEs: "Bolsa de Trabajo y Talento",
    nameEn: "Job Board and Talent",
    description: "Búsqueda de empleo en servicios locales",
    icon: "💼",
    color: "blue",
    subcategories: [
      { id: "b250a2ae-3a35-4d58-9e5c-e362b895d091", nameEs: "Alberquero (técnico de alberca)", nameEn: "Pool Technician", order: 0 },
      { id: "f1528c8b-366f-42b3-b36c-8857e863546d", nameEs: "Carpintero / Herrero / Vidriero", nameEn: "Carpenter / Blacksmith / Glazier", order: 1 },
      { id: "missing-7-2", nameEs: "Chofer / Conductor ejecutivo", nameEn: "Chofer / Conductor ejecutivo", order: 2 },
      { id: "missing-7-3", nameEs: "Cocinera / Cocinero", nameEn: "Cocinera / Cocinero", order: 3 },
      { id: "missing-7-4", nameEs: "Cocinero / Chef / Stewarding", nameEn: "Cocinero / Chef / Stewarding", order: 4 },
      { id: "7878eb74-756d-4aab-bc3e-9be7569d986c", nameEs: "Compras / Contabilidad / Administración", nameEn: "Purchasing / Accounting / Administration", order: 5 },
      { id: "46c94d8d-345d-4bdd-ad07-45d5b2fefce7", nameEs: "Conductor sprinter/autobús", nameEn: "Sprinter/Bus Driver", order: 6 },
      { id: "missing-7-7", nameEs: "Coordinador de eventos / Montajista / Audio-Iluminación", nameEn: "Coordinador de eventos / Montajista / Audio-Iluminación", order: 7 },
      { id: "missing-7-8", nameEs: "Guía de turistas / Ventas tours", nameEn: "Guía de turistas / Ventas tours", order: 8 },
      { id: "missing-7-9", nameEs: "Housekeeping / Ama de llaves", nameEn: "Housekeeping / Ama de llaves", order: 9 },
      { id: "missing-7-10", nameEs: "Jardinería y paisajismo (operativo)", nameEn: "Jardinería y paisajismo (operativo)", order: 10 },
      { id: "missing-7-11", nameEs: "Mesero / Bartender / Barista", nameEn: "Mesero / Bartender / Barista", order: 11 },
      { id: "missing-7-12", nameEs: "Paseador / Groomer / Auxiliar veterinario", nameEn: "Paseador / Groomer / Auxiliar veterinario", order: 12 },
      { id: "missing-7-13", nameEs: "Personal de servicio/limpieza (hogar/condominio)", nameEn: "Personal de servicio/limpieza (hogar/condominio)", order: 13 },
      { id: "missing-7-14", nameEs: "Pintor / Impermeabilizador", nameEn: "Pintor / Impermeabilizador", order: 14 },
      { id: "missing-7-15", nameEs: "Plomero / Electricista / Técnico A/A", nameEn: "Plomero / Electricista / Técnico A/A", order: 15 },
      { id: "missing-7-16", nameEs: "Recepcionista / Concierge", nameEn: "Recepcionista / Concierge", order: 16 },
      { id: "missing-7-17", nameEs: "Recursos Humanos / Atención a clientes", nameEn: "Recursos Humanos / Atención a clientes", order: 17 },
      { id: "missing-7-18", nameEs: "Reservaciones / Front desk", nameEn: "Reservaciones / Front desk", order: 18 },
      { id: "missing-7-19", nameEs: "Tutorías / Maestros de idiomas", nameEn: "Tutorías / Maestros de idiomas", order: 19 },
      { id: "missing-7-20", nameEs: "Vigilancia / Guardia", nameEn: "Vigilancia / Guardia", order: 20 }
    ]
  },
  {
    id: "448da561-e568-4e83-9466-d1ab6fc009dc",
    nameEs: "Carpintería y Muebles",
    nameEn: "Carpentry and Furniture",
    description: "Servicios profesionales de carpintería y fabricación de muebles",
    icon: "🔨",
    color: "blue",
    subcategories: [
      { id: "7e4a91b5-5eee-424b-8bb8-dd1f1bf62fa3", nameEs: "Carpintería a medida", nameEn: "Custom Carpentry", order: 0 },
      { id: "a79e6e53-b67c-4a29-883c-cd3ac8862d8e", nameEs: "Cubiertas (madera/compuesto)", nameEn: "Decking (Wood/Composite)", order: 1 },
      { id: "4bc1671c-7ccd-4975-a946-462705388de6", nameEs: "Muebles exteriores", nameEn: "Outdoor Furniture", order: 2 },
      { id: "5020ebc1-933f-4700-945b-b1e2536cc6d6", nameEs: "Persianas y closets inteligentes", nameEn: "Smart Blinds and Closets", order: 3 },
      { id: "2524f82e-aec2-4ad3-9faf-a2dca4d58313", nameEs: "Puertas, closets y cocinas integrales", nameEn: "Doors, Closets and Kitchens", order: 4 },
      { id: "55b78356-7201-4178-a551-c22a80184d65", nameEs: "Restauración y barnices", nameEn: "Restoration and Varnishing", order: 5 }
    ]
  },
  {
    id: "e95719bd-69d6-4d52-ad4e-86888da74905",
    nameEs: "Clasificados: Perdido y Encontrado",
    nameEn: "Classifieds: Lost and Found",
    description: "Objetos perdidos y encontrados en la comunidad",
    icon: "🔍",
    color: "blue",
    subcategories: [
      { id: "missing-9-0", nameEs: "Bicicletas / Scooters", nameEn: "Bicicletas / Scooters", order: 0 },
      { id: "missing-9-1", nameEs: "Documentos e identificaciones", nameEn: "Documentos e identificaciones", order: 1 },
      { id: "missing-9-2", nameEs: "Electrónicos", nameEn: "Electrónicos", order: 2 },
      { id: "missing-9-3", nameEs: "Joyas y relojes", nameEn: "Joyas y relojes", order: 3 },
      { id: "missing-9-4", nameEs: "Llaves", nameEn: "Llaves", order: 4 },
      { id: "missing-9-5", nameEs: "Mascotas", nameEn: "Mascotas", order: 5 },
      { id: "missing-9-6", nameEs: "Otros", nameEn: "Otros", order: 6 },
      { id: "missing-9-7", nameEs: "Ropa y accesorios", nameEn: "Ropa y accesorios", order: 7 }
    ]
  },
  {
    id: "c04a9249-dcf7-4959-9446-75b92d4f17b3",
    nameEs: "Cocina, Banquetes y Eventos",
    nameEn: "Catering, Banquets and Events",
    description: "Servicios de catering, chef a domicilio y eventos",
    icon: "🍽️",
    color: "blue",
    subcategories: [
      { id: "missing-10-0", nameEs: "Banquetes y catering", nameEn: "Banquetes y catering", order: 0 },
      { id: "missing-10-1", nameEs: "Bares móviles y mixología", nameEn: "Bares móviles y mixología", order: 1 },
      { id: "missing-10-2", nameEs: "Chef a domicilio y meal-prep", nameEn: "Chef a domicilio y meal-prep", order: 2 },
      { id: "missing-10-3", nameEs: "DJ/Audio/Iluminación", nameEn: "DJ/Audio/Iluminación", order: 3 },
      { id: "missing-10-4", nameEs: "Planeación de bodas y eventos", nameEn: "Planeación de bodas y eventos", order: 4 },
      { id: "missing-10-5", nameEs: "Renta de mobiliario y montaje", nameEn: "Renta de mobiliario y montaje", order: 5 }
    ]
  },
  {
    id: "ab13a458-4e9b-41ec-85ea-5cbdb0cdd2f9",
    nameEs: "Comercio Exterior y Aduanas",
    nameEn: "Foreign Trade and Customs",
    description: "Servicios de importación y exportación",
    icon: "🌍",
    color: "blue",
    subcategories: [
      { id: "missing-11-0", nameEs: "Agente aduanal y regulaciones NOM", nameEn: "Agente aduanal y regulaciones NOM", order: 0 },
      { id: "missing-11-1", nameEs: "Asesoría importación/exportación", nameEn: "Asesoría importación/exportación", order: 1 },
      { id: "missing-11-2", nameEs: "Clasificación arancelaria y pedimentos", nameEn: "Clasificación arancelaria y pedimentos", order: 2 },
      { id: "missing-11-3", nameEs: "IMMEX y logística internacional", nameEn: "IMMEX y logística internacional", order: 3 },
      { id: "missing-11-4", nameEs: "Seguro de carga y embalaje", nameEn: "Seguro de carga y embalaje", order: 4 }
    ]
  },
  {
    id: "f2bbfbb9-dc6e-4eec-ac2b-9f64de9a0476",
    nameEs: "Construcción y Remodelación",
    nameEn: "Construction and Remodeling",
    description: "Servicios profesionales de construcción y remodelación",
    icon: "🏗️",
    color: "blue",
    subcategories: [
      { id: "missing-12-0", nameEs: "Cocinas y baños (remodelación)", nameEn: "Cocinas y baños (remodelación)", order: 0 },
      { id: "missing-12-1", nameEs: "Obra gris y albañilería", nameEn: "Obra gris y albañilería", order: 1 },
      { id: "missing-12-2", nameEs: "Pisos y recubrimientos", nameEn: "Pisos y recubrimientos", order: 2 },
      { id: "missing-12-3", nameEs: "Planificación de obra y presupuestos", nameEn: "Planificación de obra y presupuestos", order: 3 },
      { id: "missing-12-4", nameEs: "Tablaroca/drywall y plafones", nameEn: "Tablaroca/drywall y plafones", order: 4 },
      { id: "missing-12-5", nameEs: "Techos y pérgolas", nameEn: "Techos y pérgolas", order: 5 }
    ]
  },
  {
    id: "0686abd8-6d3b-4e96-a971-679a40182eaf",
    nameEs: "Control de Plagas",
    nameEn: "Pest Control",
    description: "Servicios profesionales de control y prevención de plagas",
    icon: "🦟",
    color: "blue",
    subcategories: [
      { id: "607d465e-8922-413d-a5ff-df51202b472a", nameEs: "Certificados y garantías", nameEn: "Certificates and Warranties", order: 0 },
      { id: "1c5cd227-63a3-409c-942b-185350ad482f", nameEs: "Control integrado post-obra", nameEn: "Integrated Post-Construction Control", order: 1 },
      { id: "42a2dc42-b7c0-4e28-a4c4-dcdacf6d6b1f", nameEs: "Desratización", nameEn: "Rodent Control", order: 2 },
      { id: "6e60cbcd-66d8-4f81-a4c2-6c9c4332cbad", nameEs: "Fumigación general", nameEn: "General Fumigation", order: 3 },
      { id: "2f2d691f-88b9-4836-b212-024d1c93e8ca", nameEs: "Mosquitos y vectores", nameEn: "Mosquitoes and Vectors", order: 4 },
      { id: "48eb23b5-abcb-4e91-8045-eba5473ac000", nameEs: "Termitas y carcoma", nameEn: "Termites and Woodworm", order: 5 }
    ]
  },
  {
    id: "c678456b-6680-44ac-9652-a91f51a020dd",
    nameEs: "Donativos, Voluntariado y ONG",
    nameEn: "Donations, Volunteering and NGOs",
    description: "Organizaciones sin fines de lucro y voluntariado",
    icon: "❤️",
    color: "blue",
    subcategories: [
      { id: "missing-14-0", nameEs: "Campañas y colectas (emergencias, regreso a clases, temporada fría)", nameEn: "Campañas y colectas (emergencias, regreso a clases, temporada fría)", order: 0 },
      { id: "missing-14-1", nameEs: "Certificaciones de ONG y cumplimiento", nameEn: "Certificaciones de ONG y cumplimiento", order: 1 },
      { id: "missing-14-2", nameEs: "Donaciones en especie (alimentos, ropa, higiene, mobiliario, equipo)", nameEn: "Donaciones en especie (alimentos, ropa, higiene, mobiliario, equipo)", order: 2 },
      { id: "missing-14-3", nameEs: "Donaciones monetarias (únicas y recurrentes)", nameEn: "Donaciones monetarias (únicas y recurrentes)", order: 3 },
      { id: "missing-14-4", nameEs: "Matching corporativo y patrocinios", nameEn: "Matching corporativo y patrocinios", order: 4 },
      { id: "missing-14-5", nameEs: "Recogida a domicilio de donaciones / puntos de acopio", nameEn: "Recogida a domicilio de donaciones / puntos de acopio", order: 5 },
      { id: "missing-14-6", nameEs: "Transparencia y reportes de impacto", nameEn: "Transparencia y reportes de impacto", order: 6 },
      { id: "missing-14-7", nameEs: "Voluntariado individual y corporativo (incl. pro bono)", nameEn: "Voluntariado individual y corporativo (incl. pro bono)", order: 7 }
    ]
  },
  {
    id: "a2dccf02-2ca0-4542-8b7d-ed4fb232f521",
    nameEs: "Drones, Topografía e Inspecciones",
    nameEn: "Drones, Surveying and Inspections",
    description: "Servicios de drones y topografía",
    icon: "🚁",
    color: "blue",
    subcategories: [
      { id: "missing-15-0", nameEs: "Cartografía y levantamientos", nameEn: "Cartografía y levantamientos", order: 0 },
      { id: "missing-15-1", nameEs: "Entrega de ortomosaicos", nameEn: "Entrega de ortomosaicos", order: 1 },
      { id: "missing-15-2", nameEs: "Fotogrametría", nameEn: "Fotogrametría", order: 2 },
      { id: "missing-15-3", nameEs: "Gestión de permisos de vuelo", nameEn: "Gestión de permisos de vuelo", order: 3 },
      { id: "missing-15-4", nameEs: "Inspección de techos/fachadas", nameEn: "Inspección de techos/fachadas", order: 4 },
      { id: "missing-15-5", nameEs: "Termografía", nameEn: "Termografía", order: 5 }
    ]
  },
  {
    id: "88a001f0-24e0-4fe9-b6ea-2d77a5bd3487",
    nameEs: "Educación y Tutorías",
    nameEn: "Education and Tutoring",
    description: "Clases particulares y apoyo educativo",
    icon: "📚",
    color: "blue",
    subcategories: [
      { id: "missing-16-0", nameEs: "Apoyo escolar", nameEn: "Apoyo escolar", order: 0 },
      { id: "missing-16-1", nameEs: "Educación especial y psicopedagogía", nameEn: "Educación especial y psicopedagogía", order: 1 },
      { id: "missing-16-2", nameEs: "Habilidades digitales y ofimática", nameEn: "Habilidades digitales y ofimática", order: 2 },
      { id: "missing-16-3", nameEs: "Lectura y redacción", nameEn: "Lectura y redacción", order: 3 },
      { id: "missing-16-4", nameEs: "Preparación COMIPEMS/EXANI/SAT/GMAT/GRE", nameEn: "Preparación COMIPEMS/EXANI/SAT/GMAT/GRE", order: 4 },
      { id: "missing-16-5", nameEs: "Programación/robótica STEM", nameEn: "Programación/robótica STEM", order: 5 },
      { id: "missing-16-6", nameEs: "Regularización por nivel", nameEn: "Regularización por nivel", order: 6 },
      { id: "missing-16-7", nameEs: "Terapia de lenguaje", nameEn: "Terapia de lenguaje", order: 7 },
      { id: "missing-16-8", nameEs: "Tutorías universitarias (mates/física/química)", nameEn: "Tutorías universitarias (mates/física/química)", order: 8 },
      { id: "missing-16-9", nameEs: "Técnicas de estudio y exámenes", nameEn: "Técnicas de estudio y exámenes", order: 9 }
    ]
  },
  {
    id: "f1b54eb6-806b-40c7-aee7-a0619dc3da3e",
    nameEs: "Electricidad",
    nameEn: "Electricity",
    description: "Servicios profesionales de electricidad e instalaciones eléctricas",
    icon: "⚡",
    color: "blue",
    subcategories: [
      { id: "missing-17-0", nameEs: "Diagnóstico de cortos/variación", nameEn: "Diagnóstico de cortos/variación", order: 0 },
      { id: "missing-17-1", nameEs: "Iluminación LED y diseño", nameEn: "Iluminación LED y diseño", order: 1 },
      { id: "missing-17-2", nameEs: "Instalaciones y canalizaciones", nameEn: "Instalaciones y canalizaciones", order: 2 },
      { id: "missing-17-3", nameEs: "Pararrayos y puesta a tierra", nameEn: "Pararrayos y puesta a tierra", order: 3 },
      { id: "missing-17-4", nameEs: "Tablero eléctrico y protecciones", nameEn: "Tablero eléctrico y protecciones", order: 4 },
      { id: "missing-17-5", nameEs: "Tomas, contactos y USB", nameEn: "Tomas, contactos y USB", order: 5 }
    ]
  },
  {
    id: "79943511-571c-4a9c-ae75-33bf61739a3e",
    nameEs: "Electrodomésticos",
    nameEn: "Home Appliances",
    description: "Reparación y mantenimiento de electrodomésticos",
    icon: "🔌",
    color: "blue",
    subcategories: [
      { id: "missing-18-0", nameEs: "Equipos comerciales ligeros", nameEn: "Equipos comerciales ligeros", order: 0 },
      { id: "missing-18-1", nameEs: "Garantías y refacciones", nameEn: "Garantías y refacciones", order: 1 },
      { id: "missing-18-2", nameEs: "Instalación (hornos, lavavajillas)", nameEn: "Instalación (hornos, lavavajillas)", order: 2 },
      { id: "4b87f653-1d4f-4e0a-9f96-f52e4ad75f30", nameEs: "Mantenimiento preventivo", nameEn: "Preventive Maintenance", order: 3 },
      { id: "missing-18-4", nameEs: "Reparación de línea blanca", nameEn: "Reparación de línea blanca", order: 4 }
    ]
  },
  {
    id: "0e17bb9a-757a-441a-863a-92bacabd70fb",
    nameEs: "Energía y Sustentabilidad",
    nameEn: "Energy and Sustainability",
    description: "Soluciones de energía renovable y sustentabilidad",
    icon: "🌞",
    color: "blue",
    subcategories: [
      { id: "1b506c5e-6c43-42f7-bd9c-40cb8f21fdd8", nameEs: "Calentamiento solar de agua", nameEn: "Solar Water Heating", order: 0 },
      { id: "d26dd00a-98d7-4777-8953-37895a1172fa", nameEs: "Certificaciones verdes", nameEn: "Green Certifications", order: 1 },
      { id: "b16e61fd-9877-4078-b0fd-2210be395396", nameEs: "Eficiencia energética y auditorías", nameEn: "Energy Efficiency and Audits", order: 2 },
      { id: "a46c7d27-77a4-4c39-9015-6d2e730e26a0", nameEs: "Generadores y respaldo", nameEn: "Generators and Backup", order: 3 },
      { id: "4be87621-89f2-4244-adc0-aea296defb1d", nameEs: "Gestión de residuos/reciclaje", nameEn: "Waste Management/Recycling", order: 4 },
      { id: "5f009ba2-4832-4967-a05c-2236ffcc1bc6", nameEs: "Paneles solares y almacenamiento", nameEn: "Solar Panels and Storage", order: 5 }
    ]
  },
  {
    id: "af7b4f64-59f9-4132-8829-4da37c53b759",
    nameEs: "Eventos Corporativos y Sociales",
    nameEn: "Corporate and Social Events",
    description: "Organización integral de eventos",
    icon: "🎉",
    color: "blue",
    subcategories: [
      { id: "missing-20-0", nameEs: "Audio, iluminación y video", nameEn: "Audio, iluminación y video", order: 0 },
      { id: "missing-20-1", nameEs: "Bodas / Wedding planner", nameEn: "Bodas / Wedding planner", order: 1 },
      { id: "missing-20-2", nameEs: "Carpas, toldos y domos", nameEn: "Carpas, toldos y domos", order: 2 },
      { id: "missing-20-3", nameEs: "Catering y coffee breaks", nameEn: "Catering y coffee breaks", order: 3 },
      { id: "missing-20-4", nameEs: "Convenciones y congresos", nameEn: "Convenciones y congresos", order: 4 },
      { id: "missing-20-5", nameEs: "Coordinación y gestión de proveedores", nameEn: "Coordinación y gestión de proveedores", order: 5 },
      { id: "missing-20-6", nameEs: "Decoración y flores", nameEn: "Decoración y flores", order: 6 },
      { id: "missing-20-7", nameEs: "Entretenimiento", nameEn: "Entretenimiento", order: 7 },
      { id: "missing-20-8", nameEs: "Eventos sociales (XV, bautizos, aniversarios)", nameEn: "Eventos sociales (XV, bautizos, aniversarios)", order: 8 },
      { id: "missing-20-9", nameEs: "Fotografía y video", nameEn: "Fotografía y video", order: 9 },
      { id: "missing-20-10", nameEs: "Generadores y UPS", nameEn: "Generadores y UPS", order: 10 },
      { id: "missing-20-11", nameEs: "Limpieza post-evento", nameEn: "Limpieza post-evento", order: 11 },
      { id: "missing-20-12", nameEs: "Mobiliario y ambientación", nameEn: "Mobiliario y ambientación", order: 12 },
      { id: "missing-20-13", nameEs: "Permisos y Protección Civil", nameEn: "Permisos y Protección Civil", order: 13 },
      { id: "missing-20-14", nameEs: "Pirotecnia fría y efectos especiales", nameEn: "Pirotecnia fría y efectos especiales", order: 14 },
      { id: "missing-20-15", nameEs: "Planeación y producción integral", nameEn: "Planeación y producción integral", order: 15 },
      { id: "missing-20-16", nameEs: "Registro y acreditaciones", nameEn: "Registro y acreditaciones", order: 16 },
      { id: "missing-20-17", nameEs: "Seguridad y accesos", nameEn: "Seguridad y accesos", order: 17 },
      { id: "missing-20-18", nameEs: "Señalización y branding", nameEn: "Señalización y branding", order: 18 },
      { id: "missing-20-19", nameEs: "Tarimas, pistas y escenarios", nameEn: "Tarimas, pistas y escenarios", order: 19 },
      { id: "missing-20-20", nameEs: "Transporte de invitados", nameEn: "Transporte de invitados", order: 20 },
      { id: "missing-20-21", nameEs: "Venue scouting", nameEn: "Venue scouting", order: 21 }
    ]
  },
  {
    id: "86ed945b-d474-4019-8bb4-4066ddf0b35b",
    nameEs: "Fitness y Belleza",
    nameEn: "Fitness and Beauty",
    description: "Servicios de belleza y acondicionamiento físico",
    icon: "💅",
    color: "blue",
    subcategories: [
      { id: "missing-21-0", nameEs: "Barbería y estilismo a domicilio", nameEn: "Barbería y estilismo a domicilio", order: 0 },
      { id: "missing-21-1", nameEs: "Entrenamiento personal", nameEn: "Entrenamiento personal", order: 1 },
      { id: "missing-21-2", nameEs: "Manicure y pedicure", nameEn: "Manicure y pedicure", order: 2 },
      { id: "missing-21-3", nameEs: "Maquillaje y peinado para eventos", nameEn: "Maquillaje y peinado para eventos", order: 3 },
      { id: "missing-21-4", nameEs: "Spa y masajes terapéuticos", nameEn: "Spa y masajes terapéuticos", order: 4 },
      { id: "missing-21-5", nameEs: "Tratamientos faciales y corporales", nameEn: "Tratamientos faciales y corporales", order: 5 }
    ]
  },
  {
    id: "10dbcbe5-f005-4120-a94f-be17ce69dc8b",
    nameEs: "Fotografía y Video",
    nameEn: "Photography and Video",
    description: "Servicios profesionales de fotografía y video",
    icon: "📸",
    color: "blue",
    subcategories: [
      { id: "3e3308cc-2f27-4880-926d-1c0c9c994ca2", nameEs: "Dron/FPV", nameEn: "Drone/FPV", order: 0 },
      { id: "6bf37b14-25aa-4c0a-99da-664831b355f9", nameEs: "Edición y post", nameEn: "Editing and Post-Production", order: 1 },
      { id: "2844149e-ce7e-4365-bc00-9dd48395c66a", nameEs: "Eventos y social", nameEn: "Events and Social", order: 2 },
      { id: "36995986-6da3-4d6e-8179-c0d678ac9bae", nameEs: "Inmobiliaria y arquitectura", nameEn: "Real Estate and Architecture", order: 3 }
    ]
  },
  {
    id: "a21e027a-c813-4079-bfa6-be32218f608e",
    nameEs: "Gestión de Residuos y Reciclaje",
    nameEn: "Waste Management and Recycling",
    description: "Recolección y reciclaje de residuos",
    icon: "♻️",
    color: "blue",
    subcategories: [
      { id: "missing-23-0", nameEs: "Certificados de disposición", nameEn: "Certificados de disposición", order: 0 },
      { id: "missing-23-1", nameEs: "Compostaje y puntos verdes", nameEn: "Compostaje y puntos verdes", order: 1 },
      { id: "missing-23-2", nameEs: "Reciclaje de papel/cartón/plástico/vidrio/metal", nameEn: "Reciclaje de papel/cartón/plástico/vidrio/metal", order: 2 },
      { id: "missing-23-3", nameEs: "Recolección de voluminosos y escombro", nameEn: "Recolección de voluminosos y escombro", order: 3 },
      { id: "missing-23-4", nameEs: "Residuos peligrosos domésticos", nameEn: "Residuos peligrosos domésticos", order: 4 }
    ]
  },
  {
    id: "c951670f-f0a5-4efa-beb5-c3c3f998dd87",
    nameEs: "Herrería, Aluminio y Vidrio",
    nameEn: "Ironwork, Aluminum and Glass",
    description: "Servicios profesionales de herrería y vidriería",
    icon: "🔩",
    color: "blue",
    subcategories: [
      { id: "missing-24-0", nameEs: "Barandales y puertas", nameEn: "Barandales y puertas", order: 0 },
      { id: "missing-24-1", nameEs: "Cortinas metálicas", nameEn: "Cortinas metálicas", order: 1 },
      { id: "missing-24-2", nameEs: "Cristales templados", nameEn: "Cristales templados", order: 2 },
      { id: "missing-24-3", nameEs: "Mosquiteros y sellos", nameEn: "Mosquiteros y sellos", order: 3 },
      { id: "missing-24-4", nameEs: "Soldadura y estructuras ligeras", nameEn: "Soldadura y estructuras ligeras", order: 4 },
      { id: "missing-24-5", nameEs: "Ventanas y cancelería", nameEn: "Ventanas y cancelería", order: 5 }
    ]
  },
  {
    id: "6dd23cfe-8454-47d6-ba17-2252cd597c90",
    nameEs: "Idiomas y Certificaciones",
    nameEn: "Languages and Certifications",
    description: "Clases de idiomas y preparación para certificaciones",
    icon: "🗣️",
    color: "blue",
    subcategories: [
      { id: "missing-25-0", nameEs: "CELPE-Bras", nameEn: "CELPE-Bras", order: 0 },
      { id: "missing-25-1", nameEs: "Chino/Japonés", nameEn: "Chino/Japonés", order: 1 },
      { id: "missing-25-2", nameEs: "Clases corporativas y coaching", nameEn: "Clases corporativas y coaching", order: 2 },
      { id: "missing-25-3", nameEs: "DELE/SIELE", nameEn: "DELE/SIELE", order: 3 },
      { id: "missing-25-4", nameEs: "DELF/DALF", nameEn: "DELF/DALF", order: 4 },
      { id: "missing-25-5", nameEs: "Español para extranjeros", nameEn: "Español para extranjeros", order: 5 },
      { id: "missing-25-6", nameEs: "Francés/Alemán/Italiano/Portugués", nameEn: "Francés/Alemán/Italiano/Portugués", order: 6 },
      { id: "missing-25-7", nameEs: "Goethe/TestDaF", nameEn: "Goethe/TestDaF", order: 7 },
      { id: "missing-25-8", nameEs: "Inglés general y académico", nameEn: "Inglés general y académico", order: 8 },
      { id: "missing-25-9", nameEs: "Preparación TOEFL/IELTS/Cambridge", nameEn: "Preparación TOEFL/IELTS/Cambridge", order: 9 }
    ]
  },
  {
    id: "a555e22b-9fc8-4c88-a7a0-96ccd4f18e0d",
    nameEs: "Impresión y Señalización",
    nameEn: "Printing and Signage",
    description: "Servicios de impresión y señalética",
    icon: "🖨️",
    color: "blue",
    subcategories: [
      { id: "missing-26-0", nameEs: "Lonas y vinil", nameEn: "Lonas y vinil", order: 0 },
      { id: "missing-26-1", nameEs: "Papelería corporativa y personal", nameEn: "Papelería corporativa y personal", order: 1 },
      { id: "missing-26-2", nameEs: "Rotulación vehicular y vitrinas", nameEn: "Rotulación vehicular y vitrinas", order: 2 },
      { id: "missing-26-3", nameEs: "Señalética de seguridad", nameEn: "Señalética de seguridad", order: 3 },
      { id: "missing-26-4", nameEs: "Sublimación/serigrafía y promocionales", nameEn: "Sublimación/serigrafía y promocionales", order: 4 }
    ]
  },
  {
    id: "0dcac66d-94f1-4492-8766-2248a2623b4d",
    nameEs: "Inmigración y Servicios Migratorios",
    nameEn: "Immigration and Migration Services",
    description: "Asesoría migratoria y gestión de visas",
    icon: "🛂",
    color: "blue",
    subcategories: [
      { id: "6d90bba5-f53e-43eb-9751-d4553a2ee28c", nameEs: "Antecedentes no penales", nameEn: "Criminal Background Check", order: 0 },
      { id: "54174f3e-4fd1-46fc-b3d0-0c489b799da7", nameEs: "Apostilla y legalización", nameEn: "Apostille and Legalization", order: 1 },
      { id: "0e90faf4-01ff-4701-ab10-00cf28f9010c", nameEs: "Asesoría migratoria integral", nameEn: "Comprehensive Immigration Consulting", order: 2 },
      { id: "a5645345-89be-4bc5-99da-2f85c27195eb", nameEs: "Casos legales y apelaciones", nameEn: "Legal Cases and Appeals", order: 3 },
      { id: "7764e033-8275-4c06-9dab-b537b5977e72", nameEs: "Citas consulares y formularios", nameEn: "Consular Appointments and Forms", order: 4 },
      { id: "4af35b75-379e-4e7a-b30a-7e556635be5a", nameEs: "Cumplimiento corporativo", nameEn: "Corporate Compliance", order: 5 },
      { id: "d4ca9439-6bac-4610-b89f-50679d195ffc", nameEs: "Defensa/deportación/asilo", nameEn: "Defense/Deportation/Asylum", order: 6 },
      { id: "92187900-7276-4042-bd9c-1d4556be9ce4", nameEs: "Extensiones de visa", nameEn: "Visa Extensions", order: 7 },
      { id: "b43ad663-1903-4a98-ae45-2020ebee95b2", nameEs: "Naturalización y ciudadanía", nameEn: "Naturalization and Citizenship", order: 8 },
      { id: "89e10440-ef2e-4d3e-b880-a31c51fe8bdc", nameEs: "Notaría/fe pública", nameEn: "Notary/Public Faith", order: 9 },
      { id: "7b57b736-5729-4394-bfe4-bdd65462bcf4", nameEs: "Regularización / canje", nameEn: "Regularization / Exchange", order: 10 },
      { id: "930d91fc-2b2c-4a0d-8663-3f8dff55012c", nameEs: "Relocalización (enlace Expat)", nameEn: "Relocation (Expat Link)", order: 11 },
      { id: "b9014377-fb1b-420c-8b2a-4640c96264d1", nameEs: "Residencia temporal y permanente", nameEn: "Temporary and Permanent Residency", order: 12 },
      { id: "44936c40-4e8b-4e35-b8a0-bed3dd03457b", nameEs: "Seguimiento de estatus", nameEn: "Status Tracking", order: 13 },
      { id: "c721f07d-c581-4588-8b3b-faf6ba88ab23", nameEs: "Traducción certificada (enlace)", nameEn: "Certified Translation (Link)", order: 14 },
      { id: "15707f1f-ad13-40c4-a1b7-0b817490f21d", nameEs: "Visas de estudiante", nameEn: "Student Visas", order: 15 },
      { id: "a0d46ca4-c484-44dc-ad6a-d38639b8acbd", nameEs: "Visas de inversionista y nómada digital", nameEn: "Investor and Digital Nomad Visas", order: 16 },
      { id: "13fb5fe7-a409-4149-b287-88df44ff40f2", nameEs: "Visas de trabajo y permisos", nameEn: "Work Visas and Permits", order: 17 },
      { id: "6d03c40e-e9f0-4749-8ed7-68a4052d2e09", nameEs: "Visas de turista/negocios", nameEn: "Tourist/Business Visas", order: 18 },
      { id: "d058a295-3c7f-4291-bdb1-19d5248e80e9", nameEs: "Visas familiares", nameEn: "Family Visas", order: 19 }
    ]
  },
  {
    id: "758c0e99-b64a-4ff1-b5e5-2fd2fdcf9be5",
    nameEs: "Jardinería y Paisajismo",
    nameEn: "Gardening and Landscaping",
    description: "Servicios profesionales de jardinería y diseño de paisajes",
    icon: "🌿",
    color: "blue",
    subcategories: [
      { id: "missing-28-0", nameEs: "Control de plagas de jardín", nameEn: "Control de plagas de jardín", order: 0 },
      { id: "missing-28-1", nameEs: "Jardín vertical y huertos", nameEn: "Jardín vertical y huertos", order: 1 },
      { id: "missing-28-2", nameEs: "Mantenimiento de jardines", nameEn: "Mantenimiento de jardines", order: 2 },
      { id: "missing-28-3", nameEs: "Paisajismo y diseño", nameEn: "Paisajismo y diseño", order: 3 },
      { id: "missing-28-4", nameEs: "Podas y tala controlada", nameEn: "Podas y tala controlada", order: 4 },
      { id: "missing-28-5", nameEs: "Riego automatizado", nameEn: "Riego automatizado", order: 5 }
    ]
  },
  {
    id: "d32f73a9-f850-4d99-a96d-6cc3a0afa96d",
    nameEs: "Lavandería y Tintorería",
    nameEn: "Laundry and Dry Cleaning",
    description: "Servicios de lavandería y tintorería",
    icon: "👕",
    color: "blue",
    subcategories: [
      { id: "missing-29-0", nameEs: "Alfombras y tapetes", nameEn: "Alfombras y tapetes", order: 0 },
      { id: "missing-29-1", nameEs: "Lavado y planchado a domicilio", nameEn: "Lavado y planchado a domicilio", order: 1 },
      { id: "missing-29-2", nameEs: "Lavandería industrial", nameEn: "Lavandería industrial", order: 2 },
      { id: "missing-29-3", nameEs: "Ropa delicada/edredones/cortinas", nameEn: "Ropa delicada/edredones/cortinas", order: 3 },
      { id: "missing-29-4", nameEs: "Tintorería fina", nameEn: "Tintorería fina", order: 4 }
    ]
  },
  {
    id: "6776d67d-0f81-4ad4-8f9f-6cd4f579d559",
    nameEs: "Limpieza",
    nameEn: "Cleaning",
    description: "Servicios profesionales de limpieza para hogares y oficinas",
    icon: "🧹",
    color: "blue",
    subcategories: [
      { id: "7c40cd3b-d2a1-4b93-896b-39ef7f59a7bc", nameEs: "Cisternas y tinacos", nameEn: "Cisterns and Water Tanks", order: 0 },
      { id: "missing-30-1", nameEs: "Desinfección y sanitización", nameEn: "Desinfección y sanitización", order: 1 },
      { id: "missing-30-2", nameEs: "Limpieza post-obra", nameEn: "Limpieza post-obra", order: 2 },
      { id: "08ffc630-8b6e-4bd0-b228-de9f89f73668", nameEs: "Limpieza profunda", nameEn: "Deep Cleaning", order: 3 },
      { id: "missing-30-4", nameEs: "Limpieza residencial", nameEn: "Limpieza residencial", order: 4 },
      { id: "missing-30-5", nameEs: "Retiro de escombros", nameEn: "Retiro de escombros", order: 5 },
      { id: "missing-30-6", nameEs: "Tapicerías y alfombras", nameEn: "Tapicerías y alfombras", order: 6 },
      { id: "missing-30-7", nameEs: "Vidrios y altura", nameEn: "Vidrios y altura", order: 7 }
    ]
  },
  {
    id: "5c2c6a6b-2b3b-429f-9cc4-d5cc3511f172",
    nameEs: "Marketplace",
    nameEn: "Marketplace",
    description: "Compra, venta e intercambio de artículos",
    icon: "🛒",
    color: "blue",
    subcategories: [
      { id: "missing-31-0", nameEs: "Accesorios para mascotas", nameEn: "Accesorios para mascotas", order: 0 },
      { id: "missing-31-1", nameEs: "Bebés y niños", nameEn: "Bebés y niños", order: 1 },
      { id: "missing-31-2", nameEs: "Deportes y ciclismo", nameEn: "Deportes y ciclismo", order: 2 },
      { id: "missing-31-3", nameEs: "Donaciones / Regálalo", nameEn: "Donaciones / Regálalo", order: 3 },
      { id: "missing-31-4", nameEs: "Electrodomésticos y línea blanca", nameEn: "Electrodomésticos y línea blanca", order: 4 },
      { id: "missing-31-5", nameEs: "Electrónica y cómputo", nameEn: "Electrónica y cómputo", order: 5 },
      { id: "missing-31-6", nameEs: "Herramientas y ferretería", nameEn: "Herramientas y ferretería", order: 6 },
      { id: "missing-31-7", nameEs: "Libros, música e instrumentos", nameEn: "Libros, música e instrumentos", order: 7 },
      { id: "missing-31-8", nameEs: "Moda y accesorios", nameEn: "Moda y accesorios", order: 8 },
      { id: "missing-31-9", nameEs: "Muebles y decoración del hogar", nameEn: "Muebles y decoración del hogar", order: 9 },
      { id: "missing-31-10", nameEs: "Trueque / Intercambio", nameEn: "Trueque / Intercambio", order: 10 },
      { id: "missing-31-11", nameEs: "Vehículos y autopartes ligeras", nameEn: "Vehículos y autopartes ligeras", order: 11 }
    ]
  },
  {
    id: "0a882025-7e03-495d-8542-4e3872b4e2ea",
    nameEs: "Mascotas y Veterinaria",
    nameEn: "Pets and Veterinary",
    description: "Servicios veterinarios y cuidado de mascotas",
    icon: "🐾",
    color: "blue",
    subcategories: [
      { id: "83f8759b-4784-4f81-a9cc-d4150282e011", nameEs: "Adopción y rescate (dar/recibir)", nameEn: "Adoption and Rescue (Give/Receive)", order: 0 },
      { id: "0a21b914-03bf-4122-8cf0-876fa6697122", nameEs: "Alimentos y suplementos (delivery)", nameEn: "Food and Supplements (Delivery)", order: 1 },
      { id: "7acf2f5a-52a2-4564-8815-e1969834c3d4", nameEs: "Asesoría nutricional", nameEn: "Nutritional Counseling", order: 2 },
      { id: "37c3e8b8-19b8-45d1-b9cc-ff187c3aaa51", nameEs: "Clínicas móviles / esterilización", nameEn: "Mobile Clinics / Sterilization", order: 3 },
      { id: "0dda8798-d698-4ea2-9a97-4a09c1ba4e1f", nameEs: "Control de parásitos", nameEn: "Parasite Control", order: 4 },
      { id: "1662db3f-13c3-4a21-993b-2ecadb5860d2", nameEs: "Documentación y viajes", nameEn: "Documentation and Travel", order: 5 },
      { id: "2790f911-ae21-4fd5-861e-16bd5c5ecfa1", nameEs: "Entrenamiento y conducta", nameEn: "Training and Behavior", order: 6 },
      { id: "4c83c0f5-833f-48fa-b72b-b2ec29a88de8", nameEs: "Especialidades veterinarias", nameEn: "Veterinary Specialties", order: 7 },
      { id: "7ff20168-b440-4fc2-8a96-ce320cb2fde0", nameEs: "Especies exóticas", nameEn: "Exotic Species", order: 8 },
      { id: "fe1e7964-76b1-4b59-a49c-9b2ca89953d6", nameEs: "Eutanasia y cremación", nameEn: "Euthanasia and Cremation", order: 9 },
      { id: "b61ddc96-402f-43f0-b5a0-4332f464b707", nameEs: "Fotografía de mascotas", nameEn: "Pet Photography", order: 10 },
      { id: "ec487a5a-56cc-4b2e-bb4f-2b19569bc698", nameEs: "Grooming (baño a domicilio, estética)", nameEn: "Grooming (Home Bath, Aesthetics)", order: 11 },
      { id: "6587ed7b-fac3-4f8b-ae84-6e77da50dda7", nameEs: "Guardería y hotel de mascotas", nameEn: "Pet Daycare and Hotel", order: 12 },
      { id: "12322299-d46b-489a-ad58-bf8cf1b70635", nameEs: "Microchip e identificación", nameEn: "Microchip and Identification", order: 13 },
      { id: "93a1f9ff-bebe-4f1c-aeaa-baca5ecec5b3", nameEs: "Paseos y pet sitting", nameEn: "Walks and Pet Sitting", order: 14 },
      { id: "2ab27ba7-9e06-4a59-b670-20cf54042cf6", nameEs: "Perdido y Encontrado (enlace)", nameEn: "Lost and Found (Link)", order: 15 },
      { id: "c49a8c5f-0344-4d11-be5b-6d1330a7f324", nameEs: "Refugios y asociaciones", nameEn: "Shelters and Associations", order: 16 },
      { id: "7c7fb468-0d8b-46c9-af74-60c16f996527", nameEs: "Rehabilitación e hidroterapia", nameEn: "Rehabilitation and Hydrotherapy", order: 17 },
      { id: "489fca11-72c2-4bec-a340-ac3e7ec3d73b", nameEs: "Reproducción responsable", nameEn: "Responsible Breeding", order: 18 },
      { id: "ea37c3a3-6747-4903-accc-d31488939275", nameEs: "Seguros para mascotas", nameEn: "Pet Insurance", order: 19 },
      { id: "fb9e2609-4cec-41cf-9399-cbd348acf4c4", nameEs: "Tele-veterinaria", nameEn: "Tele-Veterinary", order: 20 },
      { id: "a1eb5e54-f0da-4342-8943-eeb42854fdea", nameEs: "Tienda y accesorios", nameEn: "Store and Accessories", order: 21 },
      { id: "f7e04ecb-30e9-41e4-81f4-dc0f504168be", nameEs: "Transporte de mascotas (pet taxi)", nameEn: "Pet Transportation (Pet Taxi)", order: 22 },
      { id: "c94279fe-7ca9-44e2-805f-1f84afe7e83e", nameEs: "Urgencias 24/7 y hospitalización", nameEn: "24/7 Emergencies and Hospitalization", order: 23 },
      { id: "f75946ef-1f0d-4b36-92f1-4075587bccf3", nameEs: "Veterinaria general (consulta, vacunas)", nameEn: "General Veterinary (Consultation, Vaccines)", order: 24 }
    ]
  },
  {
    id: "0aace69f-d60c-470f-b885-f4bdf7d3d9d6",
    nameEs: "Mensajería, Paquetería y Mandados",
    nameEn: "Courier, Parcel and Errands",
    description: "Servicios de mensajería y mandados",
    icon: "📦",
    color: "blue",
    subcategories: [
      { id: "d7498b90-8012-490e-bb3c-bcbc75a70b5d", nameEs: "Entrega local (última milla)", nameEn: "Local Delivery (Last Mile)", order: 0 },
      { id: "83f23189-7a47-478c-bac1-598ef37918a9", nameEs: "Personal shopper (super/farmacia)", nameEn: "Personal Shopper (Grocery/Pharmacy)", order: 1 },
      { id: "73ffda92-dc6a-4535-9d6c-705f03a0dd1a", nameEs: "Trámites/gestoría express", nameEn: "Express Errands/Management", order: 2 }
    ]
  },
  {
    id: "7637fb3b-0e03-4671-b9ae-d4362e769fce",
    nameEs: "Mudanzas y Logística",
    nameEn: "Moving and Logistics",
    description: "Servicios de mudanzas y transporte de muebles",
    icon: "📦",
    color: "blue",
    subcategories: [
      { id: "missing-34-0", nameEs: "Embalaje profesional", nameEn: "Embalaje profesional", order: 0 },
      { id: "missing-34-1", nameEs: "Mini-bodegas/guardamuebles", nameEn: "Mini-bodegas/guardamuebles", order: 1 },
      { id: "missing-34-2", nameEs: "Mudanza local y nacional", nameEn: "Mudanza local y nacional", order: 2 },
      { id: "missing-34-3", nameEs: "Recolección de voluminosos", nameEn: "Recolección de voluminosos", order: 3 },
      { id: "missing-34-4", nameEs: "Servicios náuticos (moto/bote)", nameEn: "Servicios náuticos (moto/bote)", order: 4 },
      { id: "missing-34-5", nameEs: "Traslado de objetos frágiles", nameEn: "Traslado de objetos frágiles", order: 5 }
    ]
  },
  {
    id: "db0a5312-16d3-4b3a-8a28-3ebec4329be3",
    nameEs: "Organizaciones Sociales y Asistencia",
    nameEn: "Social Organizations and Assistance",
    description: "Organizaciones de asistencia social",
    icon: "🤝",
    color: "blue",
    subcategories: [
      { id: "missing-35-0", nameEs: "Bancos de alimentos y comedores", nameEn: "Bancos de alimentos y comedores", order: 0 },
      { id: "missing-35-1", nameEs: "Casas de adultos mayores / asilos", nameEn: "Casas de adultos mayores / asilos", order: 1 },
      { id: "missing-35-2", nameEs: "Centros comunitarios y bibliotecas", nameEn: "Centros comunitarios y bibliotecas", order: 2 },
      { id: "missing-35-3", nameEs: "Centros de rehabilitación", nameEn: "Centros de rehabilitación", order: 3 },
      { id: "missing-35-4", nameEs: "Fundaciones", nameEn: "Fundaciones", order: 4 },
      { id: "missing-35-5", nameEs: "ONG ambientales y protección animal", nameEn: "ONG ambientales y protección animal", order: 5 },
      { id: "missing-35-6", nameEs: "Orfanatos y casas hogar", nameEn: "Orfanatos y casas hogar", order: 6 },
      { id: "missing-35-7", nameEs: "Programas de inclusión y discapacidad", nameEn: "Programas de inclusión y discapacidad", order: 7 },
      { id: "missing-35-8", nameEs: "Refugios y albergues", nameEn: "Refugios y albergues", order: 8 }
    ]
  },
  {
    id: "952884ff-caed-44e1-a03a-2c5d55f55db1",
    nameEs: "Pintura e Impermeabilización",
    nameEn: "Painting and Waterproofing",
    description: "Servicios profesionales de pintura e impermeabilización",
    icon: "🎨",
    color: "blue",
    subcategories: [
      { id: "missing-36-0", nameEs: "Fachadas y revocos", nameEn: "Fachadas y revocos", order: 0 },
      { id: "missing-36-1", nameEs: "Impermeabilización de azoteas", nameEn: "Impermeabilización de azoteas", order: 1 },
      { id: "missing-36-2", nameEs: "Pintura interior/exterior", nameEn: "Pintura interior/exterior", order: 2 },
      { id: "missing-36-3", nameEs: "Recubrimientos epóxicos", nameEn: "Recubrimientos epóxicos", order: 3 },
      { id: "missing-36-4", nameEs: "Resanes y yeso", nameEn: "Resanes y yeso", order: 4 },
      { id: "missing-36-5", nameEs: "Tratamiento de humedades/salitre", nameEn: "Tratamiento de humedades/salitre", order: 5 }
    ]
  },
  {
    id: "68c6d03b-667e-4b87-b217-335cf6fd9291",
    nameEs: "Plomería",
    nameEn: "Plumbing",
    description: "Servicios profesionales de plomería e instalaciones",
    icon: "🔧",
    color: "blue",
    subcategories: [
      { id: "missing-37-0", nameEs: "Bombas e hidroneumáticos", nameEn: "Bombas e hidroneumáticos", order: 0 },
      { id: "missing-37-1", nameEs: "Calentadores (gas/eléctrico)", nameEn: "Calentadores (gas/eléctrico)", order: 1 },
      { id: "missing-37-2", nameEs: "Fugas y desazolve", nameEn: "Fugas y desazolve", order: 2 },
      { id: "missing-37-3", nameEs: "Instalación y reparación de llaves y WC", nameEn: "Instalación y reparación de llaves y WC", order: 3 },
      { id: "missing-37-4", nameEs: "Purificación de agua / ósmosis", nameEn: "Purificación de agua / ósmosis", order: 4 },
      { id: "missing-37-5", nameEs: "Tuberías y drenaje", nameEn: "Tuberías y drenaje", order: 5 }
    ]
  },
  {
    id: "e4fe42a2-683a-4802-9785-b3753817af6c",
    nameEs: "Psicología y Bienestar",
    nameEn: "Psychology and Wellness",
    description: "Servicios de psicología y bienestar emocional",
    icon: "🧠",
    color: "blue",
    subcategories: [
      { id: "missing-38-0", nameEs: "Coaching y bienestar emocional", nameEn: "Coaching y bienestar emocional", order: 0 },
      { id: "missing-38-1", nameEs: "Grupos de apoyo", nameEn: "Grupos de apoyo", order: 1 },
      { id: "missing-38-2", nameEs: "Mindfulness y manejo de estrés", nameEn: "Mindfulness y manejo de estrés", order: 2 },
      { id: "missing-38-3", nameEs: "Psicoterapia individual/pareja", nameEn: "Psicoterapia individual/pareja", order: 3 },
      { id: "missing-38-4", nameEs: "Terapias alternativas", nameEn: "Terapias alternativas", order: 4 }
    ]
  },
  {
    id: "01dddc60-5c8e-4241-ae56-a4ef41e72503",
    nameEs: "Rentas",
    nameEn: "Rentals",
    description: "Renta de espacios y equipos",
    icon: "🏘️",
    color: "blue",
    subcategories: [
      { id: "2da9cde4-fc47-4533-bb8f-822eaabdcb12", nameEs: "Bodegas / mini-bodegas", nameEn: "Warehouses / Mini-storage", order: 0 },
      { id: "1cacc59a-626f-4295-9819-83b4434162dc", nameEs: "Coworking y salas por hora", nameEn: "Coworking and Hourly Rooms", order: 1 },
      { id: "28dd2cd8-4f15-4687-b799-6da4d1ae2e9d", nameEs: "Cuartos/coliving/roommate", nameEn: "Rooms/Coliving/Roommate", order: 2 },
      { id: "209da2bd-4a2e-4530-8680-a55339eb31c6", nameEs: "Estacionamiento / cajón", nameEn: "Parking / Space", order: 3 },
      { id: "ac9cfa48-2bf3-429a-bdc8-f4b8564bc0ad", nameEs: "Oficinas y locales comerciales", nameEn: "Offices and Commercial Spaces", order: 4 },
      { id: "115b572c-ee0b-4b11-a740-29fc57b949d7", nameEs: "Renta de equipo (herramientas, eventos)", nameEn: "Equipment Rental (Tools, Events)", order: 5 },
      { id: "8c18e1cd-4067-40be-9215-bb842b888fa2", nameEs: "Vivienda: casa/departamento/estudio", nameEn: "Housing: House/Apartment/Studio", order: 6 }
    ]
  },
  {
    id: "d7253195-0436-45c9-9f6b-7cecb37f24b2",
    nameEs: "Rentas Vacacionales y Co-Hosting",
    nameEn: "Vacation Rentals and Co-Hosting",
    description: "Gestión de propiedades vacacionales",
    icon: "🏖️",
    color: "blue",
    subcategories: [
      { id: "missing-40-0", nameEs: "Atención a huéspedes 24/7", nameEn: "Atención a huéspedes 24/7", order: 0 },
      { id: "missing-40-1", nameEs: "Check-in/out y llaves inteligentes", nameEn: "Check-in/out y llaves inteligentes", order: 1 },
      { id: "missing-40-2", nameEs: "Foto/Video inmobiliario", nameEn: "Foto/Video inmobiliario", order: 2 },
      { id: "missing-40-3", nameEs: "Gestión de anuncios y pricing", nameEn: "Gestión de anuncios y pricing", order: 3 },
      { id: "missing-40-4", nameEs: "Inspecciones y reportes", nameEn: "Inspecciones y reportes", order: 4 },
      { id: "missing-40-5", nameEs: "Limpieza turnover y lavandería", nameEn: "Limpieza turnover y lavandería", order: 5 }
    ]
  },
  {
    id: "c9b1133a-7021-4c6d-8c45-659396d13079",
    nameEs: "Reparación de Dispositivos y Electrónica",
    nameEn: "Device and Electronics Repair",
    description: "Reparación de dispositivos electrónicos",
    icon: "🔧",
    color: "blue",
    subcategories: [
      { id: "missing-41-0", nameEs: "Celulares y tablets", nameEn: "Celulares y tablets", order: 0 },
      { id: "missing-41-1", nameEs: "Consolas y periféricos", nameEn: "Consolas y periféricos", order: 1 },
      { id: "missing-41-2", nameEs: "Laptops/PC (hardware/software)", nameEn: "Laptops/PC (hardware/software)", order: 2 },
      { id: "4b87f653-1d4f-4e0a-9f96-f52e4ad75f30", nameEs: "Mantenimiento preventivo", nameEn: "Preventive Maintenance", order: 3 },
      { id: "missing-41-4", nameEs: "Respaldo y ciberseguridad doméstica", nameEn: "Respaldo y ciberseguridad doméstica", order: 4 }
    ]
  },
  {
    id: "0fb65ea3-ac5f-4bc7-bae3-482b2b9df377",
    nameEs: "Restaurantes y Comida a Domicilio",
    nameEn: "Restaurants and Food Delivery",
    description: "Servicios de comida a domicilio",
    icon: "🍕",
    color: "blue",
    subcategories: [
      { id: "4a0e71c5-ee96-473d-8f70-a8fe27fddb10", nameEs: "Bebidas y hielo a domicilio", nameEn: "Beverages and Ice Delivery", order: 0 },
      { id: "27b6dc13-d4fa-47d9-a847-cb8530abf3b0", nameEs: "Catering express hogar/oficina", nameEn: "Express Catering Home/Office", order: 1 },
      { id: "bf15e7b0-995f-4c3c-a301-7ab0b50bb8d7", nameEs: "Comida casera a domicilio", nameEn: "Home-Cooked Food Delivery", order: 2 },
      { id: "a98055bc-bd40-4629-a1e0-40f2b513e58d", nameEs: "Dark kitchens / ghost kitchens", nameEn: "Dark Kitchens / Ghost Kitchens", order: 3 },
      { id: "0fd74ee1-4629-4715-a40a-54ef3a3df2a6", nameEs: "Dietas especiales (vegano/keto/sin gluten)", nameEn: "Special Diets (Vegan/Keto/Gluten-Free)", order: 4 },
      { id: "f9a63410-f170-4301-833e-ca628c0267b3", nameEs: "Kits de cocina (ready-to-cook)", nameEn: "Cooking Kits (Ready-to-Cook)", order: 5 },
      { id: "1eef4ab9-abb4-4989-ba62-4490a0a26e93", nameEs: "Meal-prep semanal", nameEn: "Weekly Meal-Prep", order: 6 },
      { id: "b8409958-a760-4287-8ac0-f433c2b191f5", nameEs: "Repostería y panadería a domicilio", nameEn: "Pastry and Bakery Delivery", order: 7 },
      { id: "b2835ad1-6694-4780-978d-e4979b309cab", nameEs: "Restaurantes locales (pedido y entrega)", nameEn: "Local Restaurants (Order and Delivery)", order: 8 },
      { id: "7617035d-7563-49b5-aa23-c4e33792be4d", nameEs: "Servicio nocturno / 24/7", nameEn: "Night Service / 24/7", order: 9 },
      { id: "e22dc735-5550-40f6-a850-08e6a55f999f", nameEs: "Supermercado / abarrotes a domicilio", nameEn: "Supermarket / Groceries Delivery", order: 10 },
      { id: "a9a74df3-b5c2-4397-acd9-38c0e4102885", nameEs: "Suscripciones de comida", nameEn: "Food Subscriptions", order: 11 }
    ]
  },
  {
    id: "e2c7b267-d1fe-4a75-ba7d-5620a6bd017f",
    nameEs: "Rifas, Sorteos y Promociones",
    nameEn: "Raffles, Giveaways and Promotions",
    description: "Organización de rifas y sorteos",
    icon: "🎲",
    color: "blue",
    subcategories: [
      { id: "missing-43-0", nameEs: "Certificación de ganador y publicación", nameEn: "Certificación de ganador y publicación", order: 0 },
      { id: "missing-43-1", nameEs: "Concursos de habilidad (no azar)", nameEn: "Concursos de habilidad (no azar)", order: 1 },
      { id: "missing-43-2", nameEs: "Giveaways digitales", nameEn: "Giveaways digitales", order: 2 },
      { id: "missing-43-3", nameEs: "Rifas benéficas (ONG)", nameEn: "Rifas benéficas (ONG)", order: 3 },
      { id: "missing-43-4", nameEs: "Software de sorteo y auditoría", nameEn: "Software de sorteo y auditoría", order: 4 },
      { id: "missing-43-5", nameEs: "Sorteos promocionales", nameEn: "Sorteos promocionales", order: 5 },
      { id: "missing-43-6", nameEs: "Tómbolas y eventos", nameEn: "Tómbolas y eventos", order: 6 }
    ]
  },
  {
    id: "b9d82c24-47f0-4496-9452-4465361f8aa9",
    nameEs: "Salud, Medicina y Enfermería",
    nameEn: "Health, Medicine and Nursing",
    description: "Servicios médicos y de enfermería",
    icon: "⚕️",
    color: "blue",
    subcategories: [
      { id: "missing-44-0", nameEs: "Enfermería y curaciones", nameEn: "Enfermería y curaciones", order: 0 },
      { id: "missing-44-1", nameEs: "Especialistas (odonto/oftalmo/etc.)", nameEn: "Especialistas (odonto/oftalmo/etc.)", order: 1 },
      { id: "9e065d66-4e2c-461f-b8e3-df3285a97fba", nameEs: "Fisioterapia y rehabilitación", nameEn: "Physiotherapy and Rehabilitation", order: 2 },
      { id: "missing-44-3", nameEs: "Laboratorio a domicilio", nameEn: "Laboratorio a domicilio", order: 3 },
      { id: "missing-44-4", nameEs: "Médico general (domicilio/telemedicina)", nameEn: "Médico general (domicilio/telemedicina)", order: 4 },
      { id: "missing-44-5", nameEs: "Nutrición clínica", nameEn: "Nutrición clínica", order: 5 }
    ]
  },
  {
    id: "80b17f57-c87d-4fb3-87ea-21dc3e4f5ccc",
    nameEs: "Seguridad (CCTV y Accesos)",
    nameEn: "Security (CCTV and Access)",
    description: "Sistemas de seguridad y vigilancia",
    icon: "🔒",
    color: "blue",
    subcategories: [
      { id: "c1fcb8ad-6cbb-4d06-a54e-cae2d64a8b91", nameEs: "Alarmas y sensores", nameEn: "Alarms and Sensors", order: 0 },
      { id: "missing-45-1", nameEs: "Cercas eléctricas", nameEn: "Cercas eléctricas", order: 1 },
      { id: "missing-45-2", nameEs: "Cerrajería urgente 24/7", nameEn: "Cerrajería urgente 24/7", order: 2 },
      { id: "missing-45-3", nameEs: "Control de acceso y videoporteros", nameEn: "Control de acceso y videoporteros", order: 3 },
      { id: "missing-45-4", nameEs: "Cámaras y DVR/NVR", nameEn: "Cámaras y DVR/NVR", order: 4 },
      { id: "missing-45-5", nameEs: "Monitoreo y respuesta", nameEn: "Monitoreo y respuesta", order: 5 }
    ]
  },
  {
    id: "4545d452-49c5-49fe-9ec5-485a27c40204",
    nameEs: "Servicios Funerarios",
    nameEn: "Funeral Services",
    description: "Servicios funerarios y de previsión",
    icon: "🕊️",
    color: "blue",
    subcategories: [
      { id: "ecf0126b-57c6-43e4-8bb1-278376e7dfe5", nameEs: "Acompañamiento psicológico", nameEn: "Psychological Support", order: 0 },
      { id: "96ef0d99-ccfc-45d8-8d9e-618dadd6e167", nameEs: "Cremación/inhumación y velatorios", nameEn: "Cremation/Burial and Wakes", order: 1 },
      { id: "366bdc11-7c8f-43be-9801-285f707b57dd", nameEs: "Planes de previsión", nameEn: "Pre-Need Plans", order: 2 },
      { id: "594309b0-2c74-4be9-8bc9-6173f9102269", nameEs: "Traslado y repatriación", nameEn: "Transfer and Repatriation", order: 3 },
      { id: "bc34e5ca-3042-4654-8308-3662178ff768", nameEs: "Trámites y actas", nameEn: "Procedures and Certificates", order: 4 }
    ]
  },
  {
    id: "43c0cb46-953c-4880-8e5b-0801663287c8",
    nameEs: "Servicios Legales y Notariales",
    nameEn: "Legal and Notary Services",
    description: "Asesoría legal y servicios notariales",
    icon: "⚖️",
    color: "blue",
    subcategories: [
      { id: "2e7137f4-e9df-4256-8e44-af3ff7d16b29", nameEs: "Civil (contratos, arrendamiento, sucesiones)", nameEn: "Civil (Contracts, Leases, Successions)", order: 0 },
      { id: "9a738f3c-aece-429c-be66-84dbe7bc3b58", nameEs: "Familiar (divorcios, custodia)", nameEn: "Family (Divorces, Custody)", order: 1 },
      { id: "774b08b3-f734-4427-92bb-a821b4a8e8de", nameEs: "Fiscal (defensa SAT, planeación)", nameEn: "Tax (Tax Defense, Planning)", order: 2 },
      { id: "57e16bbd-8195-4a04-9756-082e07c8f2d6", nameEs: "Inmobiliario y condominios", nameEn: "Real Estate and Condominiums", order: 3 },
      { id: "7db466fa-c2cd-4a4a-ae09-bac415e19486", nameEs: "Laboral (asesoría/defensa)", nameEn: "Labor (Consulting/Defense)", order: 4 },
      { id: "fc1d5005-a5dc-42d0-b272-21bdcdfd3855", nameEs: "Mediación y arbitraje", nameEn: "Mediation and Arbitration", order: 5 },
      { id: "debbf567-02cb-42d3-a248-5c8bc26ba512", nameEs: "Mercantil/Corporativo (constitución, gobierno)", nameEn: "Commercial/Corporate (Incorporation, Governance)", order: 6 },
      { id: "4ebfb2bd-c723-4b89-8b50-617a45482ac1", nameEs: "Migratorio (enlace a categoría 34)", nameEn: "Immigration (Link to Category 34)", order: 7 },
      { id: "d9b901fe-f728-4dca-a584-707280c2b57c", nameEs: "Notaría (escrituras, poderes)", nameEn: "Notary (Deeds, Powers of Attorney)", order: 8 },
      { id: "c4bad9bd-572d-4a51-bb14-61f15476a5b0", nameEs: "Penal (asesoría/defensa)", nameEn: "Criminal (Consulting/Defense)", order: 9 },
      { id: "03616830-325b-46d7-9a3d-35303f6817f3", nameEs: "Propiedad intelectual y datos personales", nameEn: "Intellectual Property and Personal Data", order: 10 }
    ]
  },
  {
    id: "6e12f367-712b-4d12-91e1-c1b030782e72",
    nameEs: "Servicios Náuticos y Marina",
    nameEn: "Nautical and Marina Services",
    description: "Servicios para embarcaciones y yates",
    icon: "⛵",
    color: "blue",
    subcategories: [
      { id: "missing-48-0", nameEs: "Capitanes y tripulación", nameEn: "Capitanes y tripulación", order: 0 },
      { id: "missing-48-1", nameEs: "Electrónica marina", nameEn: "Electrónica marina", order: 1 },
      { id: "missing-48-2", nameEs: "Limpieza de yates y muelles", nameEn: "Limpieza de yates y muelles", order: 2 },
      { id: "missing-48-3", nameEs: "Mantenimiento de embarcaciones", nameEn: "Mantenimiento de embarcaciones", order: 3 },
      { id: "missing-48-4", nameEs: "Permisos y seguros marítimos", nameEn: "Permisos y seguros marítimos", order: 4 },
      { id: "missing-48-5", nameEs: "Varado y pintura antiincrustante", nameEn: "Varado y pintura antiincrustante", order: 5 }
    ]
  },
  {
    id: "f07195e4-8098-4d2d-a5bd-07873f35cb37",
    nameEs: "Servicios para Comercios y Oficinas",
    nameEn: "Services for Businesses and Offices",
    description: "Servicios especializados para negocios",
    icon: "🏪",
    color: "blue",
    subcategories: [
      { id: "missing-49-0", nameEs: "Cortinas metálicas y accesos", nameEn: "Cortinas metálicas y accesos", order: 0 },
      { id: "missing-49-1", nameEs: "Limpieza comercial y post-horario", nameEn: "Limpieza comercial y post-horario", order: 1 },
      { id: "missing-49-2", nameEs: "Mantenimiento integral (facility)", nameEn: "Mantenimiento integral (facility)", order: 2 },
      { id: "missing-49-3", nameEs: "Refrigeración/comercial y cocinas industriales", nameEn: "Refrigeración/comercial y cocinas industriales", order: 3 },
      { id: "missing-49-4", nameEs: "Sanitización y control de inventarios", nameEn: "Sanitización y control de inventarios", order: 4 }
    ]
  },
  {
    id: "ba533071-043e-416a-8868-3a50de73f932",
    nameEs: "Tecnología, Redes y Smart Home",
    nameEn: "Technology, Networks and Smart Home",
    description: "Instalación y configuración de redes y domótica",
    icon: "🏡",
    color: "blue",
    subcategories: [
      { id: "missing-50-0", nameEs: "Asistentes de voz y escenas", nameEn: "Asistentes de voz y escenas", order: 0 },
      { id: "missing-50-1", nameEs: "Ciberseguridad doméstica", nameEn: "Ciberseguridad doméstica", order: 1 },
      { id: "missing-50-2", nameEs: "Domótica (iluminación/clima/cortinas)", nameEn: "Domótica (iluminación/clima/cortinas)", order: 2 },
      { id: "missing-50-3", nameEs: "Routers y mallas (mesh)", nameEn: "Routers y mallas (mesh)", order: 3 },
      { id: "missing-50-4", nameEs: "Servidores NAS/backup", nameEn: "Servidores NAS/backup", order: 4 },
      { id: "missing-50-5", nameEs: "Wi-Fi y cableado estructurado", nameEn: "Wi-Fi y cableado estructurado", order: 5 }
    ]
  },
  {
    id: "36fb8e90-0f81-41ce-8d34-122f31c9e706",
    nameEs: "Telecomunicaciones e Internet",
    nameEn: "Telecommunications and Internet",
    description: "Servicios de internet y telecomunicaciones",
    icon: "📡",
    color: "blue",
    subcategories: [
      { id: "0b4648f1-bb7c-4dc5-9ee2-bcba4bb4e3c5", nameEs: "Cableado estructurado y racks", nameEn: "Structured Cabling and Racks", order: 0 },
      { id: "ab6dd0a1-3ad1-48b9-b311-7bb9e0bd414d", nameEs: "Instalación de fibra/ISP y routers", nameEn: "Fiber/ISP and Router Installation", order: 1 },
      { id: "f9099ee2-0b50-4223-9771-bc1a2463b658", nameEs: "Optimización Wi-Fi (site survey)", nameEn: "Wi-Fi Optimization (Site Survey)", order: 2 },
      { id: "497f0ad7-5ddf-4267-8e10-5d347a713513", nameEs: "Telefonía IP/centralitas y cámaras IP", nameEn: "IP Telephony/PBX and IP Cameras", order: 3 },
      { id: "37840d0f-768e-4bff-9b00-1c11129a39fc", nameEs: "TV satelital/cable y streaming", nameEn: "Satellite/Cable TV and Streaming", order: 4 }
    ]
  },
  {
    id: "c6509633-a2b6-4e47-be9e-9d874d572bf6",
    nameEs: "Traducción e Interpretación",
    nameEn: "Translation and Interpretation",
    description: "Servicios de traducción e interpretación",
    icon: "🌐",
    color: "blue",
    subcategories: [
      { id: "missing-52-0", nameEs: "Apostilla y legalización de traducciones", nameEn: "Apostilla y legalización de traducciones", order: 0 },
      { id: "missing-52-1", nameEs: "Interpretación simultánea y consecutiva", nameEn: "Interpretación simultánea y consecutiva", order: 1 },
      { id: "missing-52-2", nameEs: "Localización de sitios y apps", nameEn: "Localización de sitios y apps", order: 2 },
      { id: "missing-52-3", nameEs: "Subtitulaje y voice-over", nameEn: "Subtitulaje y voice-over", order: 3 },
      { id: "missing-52-4", nameEs: "Traducción certificada / perito traductor", nameEn: "Traducción certificada / perito traductor", order: 4 },
      { id: "missing-52-5", nameEs: "Traducción legal y técnica", nameEn: "Traducción legal y técnica", order: 5 },
      { id: "missing-52-6", nameEs: "Transcripción certificada", nameEn: "Transcripción certificada", order: 6 }
    ]
  },
  {
    id: "7a723f65-a775-4fce-a1fa-447e698e1848",
    nameEs: "Transporte Terrestre y Conductores",
    nameEn: "Ground Transportation and Drivers",
    description: "Servicios de transporte y choferes",
    icon: "🚕",
    color: "blue",
    subcategories: [
      { id: "missing-53-0", nameEs: "Chofer privado por hora (sedán/SUV/van)", nameEn: "Chofer privado por hora (sedán/SUV/van)", order: 0 },
      { id: "missing-53-1", nameEs: "Interurbano (Cancún–Playa–Tulum, etc.)", nameEn: "Interurbano (Cancún–Playa–Tulum, etc.)", order: 1 },
      { id: "missing-53-2", nameEs: "Limo/ejecutivo", nameEn: "Limo/ejecutivo", order: 2 },
      { id: "missing-53-3", nameEs: "Paquetería rider (enlace)", nameEn: "Paquetería rider (enlace)", order: 3 },
      { id: "missing-53-4", nameEs: "Transporte accesible (rampa)", nameEn: "Transporte accesible (rampa)", order: 4 },
      { id: "missing-53-5", nameEs: "Transporte escolar", nameEn: "Transporte escolar", order: 5 },
      { id: "missing-53-6", nameEs: "Transporte para eventos", nameEn: "Transporte para eventos", order: 6 },
      { id: "missing-53-7", nameEs: "Traslados aeropuerto (privado/compartido)", nameEn: "Traslados aeropuerto (privado/compartido)", order: 7 },
      { id: "missing-53-8", nameEs: "Traslados punto a punto", nameEn: "Traslados punto a punto", order: 8 },
      { id: "missing-53-9", nameEs: "Vans/autobuses con operador", nameEn: "Vans/autobuses con operador", order: 9 }
    ]
  },
  {
    id: "3f553e39-15ac-4203-a891-d657285619b6",
    nameEs: "Aire Acondicionado y Refrigeración",
    nameEn: "Air Conditioning and Refrigeration",
    description: "Servicios profesionales de climatización y refrigeración",
    icon: "❄️",
    color: "blue",
    subcategories: [
      { id: "424be7eb-2bf0-4270-aa0c-b12e91d928c3", nameEs: "Instalación de minisplits", nameEn: "Mini-Split Installation", order: 0 },
      { id: "4b87f653-1d4f-4e0a-9f96-f52e4ad75f30", nameEs: "Mantenimiento preventivo", nameEn: "Preventive Maintenance", order: 1 },
      { id: "3b1ce0c7-fb8f-42d5-b073-000f35138a06", nameEs: "Reparación de equipos", nameEn: "Equipment Repair", order: 2 },
      { id: "80ebbccb-2667-449a-bcd8-982807efc236", nameEs: "Recarga de gas refrigerante", nameEn: "Refrigerant Gas Recharge", order: 3 },
      { id: "08ffc630-8b6e-4bd0-b228-de9f89f73668", nameEs: "Limpieza profunda", nameEn: "Deep Cleaning", order: 4 },
      { id: "e6034795-5339-453e-b587-8bf4058efb84", nameEs: "Refrigeración comercial", nameEn: "Commercial Refrigeration", order: 5 }
    ]
  }
];