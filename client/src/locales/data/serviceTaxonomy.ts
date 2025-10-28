// Translation interface for service taxonomy
export interface TaxonomyTranslation {
  es: string;
  en: string;
}

export interface TaxonomyTranslations {
  [slug: string]: TaxonomyTranslation;
}

// Category translations - All 55 categories (slug-based keys)
export const categoryTranslations: TaxonomyTranslations = {
  "administracion-condominal": {
    es: "Administración Condominal",
    en: "Condominium Administration"
  },
  "agencias-de-viajes-y-tours": {
    es: "Agencias de Viajes y Tours",
    en: "Travel Agencies and Tours"
  },
  "agua-y-tratamiento": {
    es: "Agua y Tratamiento",
    en: "Water and Treatment"
  },
  "aire-acondicionado-y-refrigeracion": {
    es: "Aire Acondicionado y Refrigeración",
    en: "Air Conditioning and Refrigeration"
  },
  "albercas-y-jacuzzis": {
    es: "Albercas y Jacuzzis",
    en: "Pools and Jacuzzis"
  },
  "altas-de-servicios-y-gestoria-domiciliaria": {
    es: "Altas de Servicios y Gestoría Domiciliaria",
    en: "Service Registration and Home Management"
  },
  "automotriz-y-movilidad": {
    es: "Automotriz y Movilidad",
    en: "Automotive and Mobility"
  },
  "bienes-raices-y-property-management": {
    es: "Bienes Raíces y Property Management",
    en: "Real Estate and Property Management"
  },
  "bolsa-de-trabajo-y-talento": {
    es: "Bolsa de Trabajo y Talento",
    en: "Job Board and Talent"
  },
  "carpinteria-y-muebles": {
    es: "Carpintería y Muebles",
    en: "Carpentry and Furniture"
  },
  "clasificados-perdido-y-encontrado": {
    es: "Clasificados: Perdido y Encontrado",
    en: "Classifieds: Lost and Found"
  },
  "cocina-banquetes-y-eventos": {
    es: "Cocina, Banquetes y Eventos",
    en: "Catering, Banquets and Events"
  },
  "comercio-exterior-y-aduanas": {
    es: "Comercio Exterior y Aduanas",
    en: "Foreign Trade and Customs"
  },
  "construccion-y-remodelacion": {
    es: "Construcción y Remodelación",
    en: "Construction and Remodeling"
  },
  "control-de-plagas": {
    es: "Control de Plagas",
    en: "Pest Control"
  },
  "donativos-voluntariado-y-ong": {
    es: "Donativos, Voluntariado y ONG",
    en: "Donations, Volunteering and NGOs"
  },
  "drones-topografia-e-inspecciones": {
    es: "Drones, Topografía e Inspecciones",
    en: "Drones, Surveying and Inspections"
  },
  "educacion-y-tutorias": {
    es: "Educación y Tutorías",
    en: "Education and Tutoring"
  },
  "electricidad": {
    es: "Electricidad",
    en: "Electricity"
  },
  "electrodomesticos": {
    es: "Electrodomésticos",
    en: "Home Appliances"
  },
  "energia-y-sustentabilidad": {
    es: "Energía y Sustentabilidad",
    en: "Energy and Sustainability"
  },
  "eventos-corporativos-y-sociales": {
    es: "Eventos Corporativos y Sociales",
    en: "Corporate and Social Events"
  },
  "fitness-y-belleza": {
    es: "Fitness y Belleza",
    en: "Fitness and Beauty"
  },
  "fotografia-y-video": {
    es: "Fotografía y Video",
    en: "Photography and Video"
  },
  "gestion-de-residuos-y-reciclaje": {
    es: "Gestión de Residuos y Reciclaje",
    en: "Waste Management and Recycling"
  },
  "herreria-aluminio-y-vidrio": {
    es: "Herrería, Aluminio y Vidrio",
    en: "Ironwork, Aluminum and Glass"
  },
  "idiomas-y-certificaciones": {
    es: "Idiomas y Certificaciones",
    en: "Languages and Certifications"
  },
  "impresion-y-senalizacion": {
    es: "Impresión y Señalización",
    en: "Printing and Signage"
  },
  "inmigracion-y-servicios-migratorios": {
    es: "Inmigración y Servicios Migratorios",
    en: "Immigration and Migration Services"
  },
  "jardineria-y-paisajismo": {
    es: "Jardinería y Paisajismo",
    en: "Gardening and Landscaping"
  },
  "lavanderia-y-tintoreria": {
    es: "Lavandería y Tintorería",
    en: "Laundry and Dry Cleaning"
  },
  "limpieza": {
    es: "Limpieza",
    en: "Cleaning"
  },
  "marketplace": {
    es: "Marketplace",
    en: "Marketplace"
  },
  "mascotas-y-veterinaria": {
    es: "Mascotas y Veterinaria",
    en: "Pets and Veterinary"
  },
  "mensajeria-paqueteria-y-mandados": {
    es: "Mensajería, Paquetería y Mandados",
    en: "Courier, Parcel and Errands"
  },
  "mudanzas-y-logistica": {
    es: "Mudanzas y Logística",
    en: "Moving and Logistics"
  },
  "organizaciones-sociales-y-asistencia": {
    es: "Organizaciones Sociales y Asistencia",
    en: "Social Organizations and Assistance"
  },
  "pintura-e-impermeabilizacion": {
    es: "Pintura e Impermeabilización",
    en: "Painting and Waterproofing"
  },
  "plomeria": {
    es: "Plomería",
    en: "Plumbing"
  },
  "psicologia-y-bienestar": {
    es: "Psicología y Bienestar",
    en: "Psychology and Wellness"
  },
  "rentas": {
    es: "Rentas",
    en: "Rentals"
  },
  "rentas-vacacionales-y-co-hosting": {
    es: "Rentas Vacacionales y Co-Hosting",
    en: "Vacation Rentals and Co-Hosting"
  },
  "reparacion-de-dispositivos-y-electronica": {
    es: "Reparación de Dispositivos y Electrónica",
    en: "Device and Electronics Repair"
  },
  "restaurantes-y-comida-a-domicilio": {
    es: "Restaurantes y Comida a Domicilio",
    en: "Restaurants and Food Delivery"
  },
  "rifas-sorteos-y-promociones": {
    es: "Rifas, Sorteos y Promociones",
    en: "Raffles, Giveaways and Promotions"
  },
  "salud-medicina-y-enfermeria": {
    es: "Salud, Medicina y Enfermería",
    en: "Health, Medicine and Nursing"
  },
  "seguridad-cctv-y-accesos": {
    es: "Seguridad (CCTV y Accesos)",
    en: "Security (CCTV and Access)"
  },
  "servicios-funerarios": {
    es: "Servicios Funerarios",
    en: "Funeral Services"
  },
  "servicios-legales-y-notariales": {
    es: "Servicios Legales y Notariales",
    en: "Legal and Notary Services"
  },
  "servicios-nauticos-y-marina": {
    es: "Servicios Náuticos y Marina",
    en: "Nautical and Marina Services"
  },
  "servicios-para-comercios-y-oficinas": {
    es: "Servicios para Comercios y Oficinas",
    en: "Services for Businesses and Offices"
  },
  "tecnologia-redes-y-smart-home": {
    es: "Tecnología, Redes y Smart Home",
    en: "Technology, Networks and Smart Home"
  },
  "telecomunicaciones-e-internet": {
    es: "Telecomunicaciones e Internet",
    en: "Telecommunications and Internet"
  },
  "traduccion-e-interpretacion": {
    es: "Traducción e Interpretación",
    en: "Translation and Interpretation"
  },
  "transporte-terrestre-y-conductores": {
    es: "Transporte Terrestre y Conductores",
    en: "Ground Transportation and Drivers"
  },
};

// Category description translations (slug-based keys)
export const categoryDescriptionTranslations: TaxonomyTranslations = {
  "administracion-condominal": {
    es: "Servicios profesionales de administración de condominios",
    en: "Professional condominium administration services"
  },
  "agencias-de-viajes-y-tours": {
    es: "Servicios de viajes, tours y experiencias turísticas",
    en: "Travel services, tours and tourist experiences"
  },
  "agua-y-tratamiento": {
    es: "Servicios de tratamiento y purificación de agua",
    en: "Water treatment and purification services"
  },
  "aire-acondicionado-y-refrigeracion": {
    es: "Servicios profesionales de climatización y refrigeración",
    en: "Professional air conditioning and refrigeration services"
  },
  "albercas-y-jacuzzis": {
    es: "Mantenimiento y reparación de albercas",
    en: "Pool maintenance and repair"
  },
  "altas-de-servicios-y-gestoria-domiciliaria": {
    es: "Trámites y gestión de servicios del hogar",
    en: "Service registration and home management procedures"
  },
  "automotriz-y-movilidad": {
    es: "Servicios de lavado y detallado automotriz",
    en: "Automotive washing and detailing services"
  },
  "bienes-raices-y-property-management": {
    es: "Servicios inmobiliarios y administración de propiedades",
    en: "Real estate and property management services"
  },
  "bolsa-de-trabajo-y-talento": {
    es: "Búsqueda de empleo en servicios locales",
    en: "Local services job search"
  },
  "carpinteria-y-muebles": {
    es: "Servicios profesionales de carpintería y fabricación de muebles",
    en: "Professional carpentry and furniture manufacturing"
  },
  "clasificados-perdido-y-encontrado": {
    es: "Objetos perdidos y encontrados en la comunidad",
    en: "Lost and found items in the community"
  },
  "cocina-banquetes-y-eventos": {
    es: "Servicios de catering, chef a domicilio y eventos",
    en: "Catering, personal chef and event services"
  },
  "comercio-exterior-y-aduanas": {
    es: "Servicios de importación y exportación",
    en: "Import and export services"
  },
  "construccion-y-remodelacion": {
    es: "Servicios profesionales de construcción y remodelación",
    en: "Professional construction and remodeling services"
  },
  "control-de-plagas": {
    es: "Servicios profesionales de control y prevención de plagas",
    en: "Professional pest control and prevention services"
  },
  "donativos-voluntariado-y-ong": {
    es: "Organizaciones sin fines de lucro y voluntariado",
    en: "Non-profit organizations and volunteering"
  },
  "drones-topografia-e-inspecciones": {
    es: "Servicios de drones y topografía",
    en: "Drone and surveying services"
  },
  "educacion-y-tutorias": {
    es: "Clases particulares y apoyo educativo",
    en: "Private tutoring and educational support"
  },
  "electricidad": {
    es: "Servicios profesionales de electricidad e instalaciones eléctricas",
    en: "Professional electrical services and installations"
  },
  "electrodomesticos": {
    es: "Reparación y mantenimiento de electrodomésticos",
    en: "Home appliance repair and maintenance"
  },
  "energia-y-sustentabilidad": {
    es: "Soluciones de energía renovable y sustentabilidad",
    en: "Renewable energy and sustainability solutions"
  },
  "eventos-corporativos-y-sociales": {
    es: "Organización integral de eventos",
    en: "Comprehensive event planning"
  },
  "fitness-y-belleza": {
    es: "Servicios de belleza y acondicionamiento físico",
    en: "Beauty and fitness services"
  },
  "fotografia-y-video": {
    es: "Servicios profesionales de fotografía y video",
    en: "Professional photography and video services"
  },
  "gestion-de-residuos-y-reciclaje": {
    es: "Recolección y reciclaje de residuos",
    en: "Waste collection and recycling"
  },
  "herreria-aluminio-y-vidrio": {
    es: "Servicios profesionales de herrería y vidriería",
    en: "Professional ironwork and glass services"
  },
  "idiomas-y-certificaciones": {
    es: "Clases de idiomas y preparación para certificaciones",
    en: "Language classes and certification preparation"
  },
  "impresion-y-senalizacion": {
    es: "Servicios de impresión y señalética",
    en: "Printing and signage services"
  },
  "inmigracion-y-servicios-migratorios": {
    es: "Asesoría migratoria y gestión de visas",
    en: "Immigration consulting and visa management"
  },
  "jardineria-y-paisajismo": {
    es: "Servicios profesionales de jardinería y diseño de paisajes",
    en: "Professional gardening and landscape design"
  },
  "lavanderia-y-tintoreria": {
    es: "Servicios de lavandería y tintorería",
    en: "Laundry and dry cleaning services"
  },
  "limpieza": {
    es: "Servicios profesionales de limpieza para hogares y oficinas",
    en: "Professional cleaning services for homes and offices"
  },
  "marketplace": {
    es: "Compra, venta e intercambio de artículos",
    en: "Buying, selling and exchanging items"
  },
  "mascotas-y-veterinaria": {
    es: "Servicios veterinarios y cuidado de mascotas",
    en: "Veterinary and pet care services"
  },
  "mensajeria-paqueteria-y-mandados": {
    es: "Servicios de mensajería y mandados",
    en: "Courier and errand services"
  },
  "mudanzas-y-logistica": {
    es: "Servicios de mudanzas y transporte de muebles",
    en: "Moving and furniture transport services"
  },
  "organizaciones-sociales-y-asistencia": {
    es: "Organizaciones de asistencia social",
    en: "Social assistance organizations"
  },
  "pintura-e-impermeabilizacion": {
    es: "Servicios profesionales de pintura e impermeabilización",
    en: "Professional painting and waterproofing services"
  },
  "plomeria": {
    es: "Servicios profesionales de plomería e instalaciones",
    en: "Professional plumbing and installations"
  },
  "psicologia-y-bienestar": {
    es: "Servicios de psicología y bienestar emocional",
    en: "Psychology and emotional wellness services"
  },
  "rentas": {
    es: "Renta de espacios y equipos",
    en: "Space and equipment rental"
  },
  "rentas-vacacionales-y-co-hosting": {
    es: "Gestión de propiedades vacacionales",
    en: "Vacation property management"
  },
  "reparacion-de-dispositivos-y-electronica": {
    es: "Reparación de dispositivos electrónicos",
    en: "Electronic device repair"
  },
  "restaurantes-y-comida-a-domicilio": {
    es: "Servicios de comida a domicilio",
    en: "Food delivery services"
  },
  "rifas-sorteos-y-promociones": {
    es: "Organización de rifas y sorteos",
    en: "Raffle and sweepstakes organization"
  },
  "salud-medicina-y-enfermeria": {
    es: "Servicios médicos y de enfermería",
    en: "Medical and nursing services"
  },
  "seguridad-cctv-y-accesos": {
    es: "Sistemas de seguridad y vigilancia",
    en: "Security and surveillance systems"
  },
  "servicios-funerarios": {
    es: "Servicios funerarios y de previsión",
    en: "Funeral and pre-planning services"
  },
  "servicios-legales-y-notariales": {
    es: "Asesoría legal y servicios notariales",
    en: "Legal consulting and notary services"
  },
  "servicios-nauticos-y-marina": {
    es: "Servicios para embarcaciones y yates",
    en: "Boat and yacht services"
  },
  "servicios-para-comercios-y-oficinas": {
    es: "Servicios especializados para negocios",
    en: "Specialized business services"
  },
  "tecnologia-redes-y-smart-home": {
    es: "Instalación y configuración de redes y domótica",
    en: "Network installation and home automation"
  },
  "telecomunicaciones-e-internet": {
    es: "Servicios de internet y telecomunicaciones",
    en: "Internet and telecommunications services"
  },
  "traduccion-e-interpretacion": {
    es: "Servicios de traducción e interpretación",
    en: "Translation and interpretation services"
  },
  "transporte-terrestre-y-conductores": {
    es: "Servicios de transporte y choferes",
    en: "Transportation and driver services"
  },
};

// Subcategory translations - All 431 subcategories (slug-based keys)
export const subcategoryTranslations: TaxonomyTranslations = {
  "administracion-profesional-y-tesoreria": {
    es: "Administración profesional y tesorería",
    en: "Professional Administration and Treasury"
  },
  "asambleas-y-actas": {
    es: "Asambleas y actas",
    en: "Assemblies and Minutes"
  },
  "auditoria-y-transparencia": {
    es: "Auditoría y transparencia",
    en: "Audit and Transparency"
  },
  "contratacion-y-supervision-de-proveedores": {
    es: "Contratación y supervisión de proveedores",
    en: "Provider Contracting and Supervision"
  },
  "mantenimiento-integral-del-condominio": {
    es: "Mantenimiento integral del condominio",
    en: "Comprehensive Condominium Maintenance"
  },
  "protocolos-de-huracan-y-emergencias": {
    es: "Protocolos de huracán y emergencias",
    en: "Hurricane and Emergency Protocols"
  },
  "aire-acondicionado-y-refrigeracion-instalacion-de-minisplits": {
    es: "Instalación de minisplits",
    en: "Mini-Split Installation"
  },
  "aire-acondicionado-y-refrigeracion-limpieza-profunda": {
    es: "Limpieza profunda",
    en: "Deep Cleaning"
  },
  "aire-acondicionado-y-refrigeracion-mantenimiento-preventivo": {
    es: "Mantenimiento preventivo",
    en: "Preventive Maintenance"
  },
  "aire-acondicionado-y-refrigeracion-recarga-de-gas-refrigerante": {
    es: "Recarga de gas refrigerante",
    en: "Refrigerant Gas Recharge"
  },
  "aire-acondicionado-y-refrigeracion-refrigeracion-comercial": {
    es: "Refrigeración comercial",
    en: "Commercial Refrigeration"
  },
  "aire-acondicionado-y-refrigeracion-reparacion-de-equipos": {
    es: "Reparación de equipos",
    en: "Equipment Repair"
  },
  "bombas-y-filtros": {
    es: "Bombas y filtros",
    en: "Pumps and Filters"
  },
  "albercas-y-jacuzzis-calentamiento-solarelectrico": {
    es: "Calentamiento (solar/eléctrico)",
    en: "Heating (Solar/Electric)"
  },
  "cubiertas-y-seguridad-perimetral": {
    es: "Cubiertas y seguridad perimetral",
    en: "Covers and Perimeter Safety"
  },
  "limpieza-y-balance-quimico": {
    es: "Limpieza y balance químico",
    en: "Cleaning and Chemical Balance"
  },
  "rescate-de-agua-verde": {
    es: "Rescate de agua verde",
    en: "Green Water Recovery"
  },
  "revestimientos-e-iluminacion": {
    es: "Revestimientos e iluminación",
    en: "Coatings and Lighting"
  },
  "administracion-de-propiedades": {
    es: "Administración de propiedades",
    en: "Property Management"
  },
  "bienes-raices-y-property-management-arrendamiento-corporativo": {
    es: "Arrendamiento corporativo",
    en: "Corporate Leasing"
  },
  "avaluos-y-opinion-de-valor": {
    es: "Avalúos y opinión de valor",
    en: "Appraisals and Value Opinion"
  },
  "due-diligence-inmobiliario": {
    es: "Due diligence inmobiliario",
    en: "Real Estate Due Diligence"
  },
  "bienes-raices-y-property-management-home-staging": {
    es: "Home staging",
    en: "Home Staging"
  },
  "venta-y-renta": {
    es: "Venta y renta",
    en: "Sale and Rental"
  },
  "alberquero-tecnico-de-alberca": {
    es: "Alberquero (técnico de alberca)",
    en: "Pool Technician"
  },
  "carpintero-herrero-vidriero": {
    es: "Carpintero / Herrero / Vidriero",
    en: "Carpenter / Blacksmith / Glazier"
  },
  "compras-contabilidad-administracion": {
    es: "Compras / Contabilidad / Administración",
    en: "Purchasing / Accounting / Administration"
  },
  "bolsa-de-trabajo-y-talento-conductor-sprinterautobus": {
    es: "Conductor sprinter/autobús",
    en: "Sprinter/Bus Driver"
  },
  "carpinteria-a-medida": {
    es: "Carpintería a medida",
    en: "Custom Carpentry"
  },
  "carpinteria-y-muebles-cubiertas-maderacompuesto": {
    es: "Cubiertas (madera/compuesto)",
    en: "Decking (Wood/Composite)"
  },
  "carpinteria-y-muebles-muebles-exteriores": {
    es: "Muebles exteriores",
    en: "Outdoor Furniture"
  },
  "persianas-y-closets-inteligentes": {
    es: "Persianas y closets inteligentes",
    en: "Smart Blinds and Closets"
  },
  "puertas-closets-y-cocinas-integrales": {
    es: "Puertas, closets y cocinas integrales",
    en: "Doors, Closets and Kitchens"
  },
  "restauracion-y-barnices": {
    es: "Restauración y barnices",
    en: "Restoration and Varnishing"
  },
  "certificados-y-garantias": {
    es: "Certificados y garantías",
    en: "Certificates and Warranties"
  },
  "control-integrado-post-obra": {
    es: "Control integrado post-obra",
    en: "Integrated Post-Construction Control"
  },
  "control-de-plagas-desratizacion": {
    es: "Desratización",
    en: "Rodent Control"
  },
  "control-de-plagas-fumigacion-general": {
    es: "Fumigación general",
    en: "General Fumigation"
  },
  "mosquitos-y-vectores": {
    es: "Mosquitos y vectores",
    en: "Mosquitoes and Vectors"
  },
  "termitas-y-carcoma": {
    es: "Termitas y carcoma",
    en: "Termites and Woodworm"
  },
  "calentamiento-solar-de-agua": {
    es: "Calentamiento solar de agua",
    en: "Solar Water Heating"
  },
  "energia-y-sustentabilidad-certificaciones-verdes": {
    es: "Certificaciones verdes",
    en: "Green Certifications"
  },
  "eficiencia-energetica-y-auditorias": {
    es: "Eficiencia energética y auditorías",
    en: "Energy Efficiency and Audits"
  },
  "generadores-y-respaldo": {
    es: "Generadores y respaldo",
    en: "Generators and Backup"
  },
  "gestion-de-residuosreciclaje": {
    es: "Gestión de residuos/reciclaje",
    en: "Waste Management/Recycling"
  },
  "paneles-solares-y-almacenamiento": {
    es: "Paneles solares y almacenamiento",
    en: "Solar Panels and Storage"
  },
  "fotografia-y-video-dronfpv": {
    es: "Dron/FPV",
    en: "Drone/FPV"
  },
  "edicion-y-post": {
    es: "Edición y post",
    en: "Editing and Post-Production"
  },
  "eventos-y-social": {
    es: "Eventos y social",
    en: "Events and Social"
  },
  "inmobiliaria-y-arquitectura": {
    es: "Inmobiliaria y arquitectura",
    en: "Real Estate and Architecture"
  },
  "antecedentes-no-penales": {
    es: "Antecedentes no penales",
    en: "Criminal Background Check"
  },
  "apostilla-y-legalizacion": {
    es: "Apostilla y legalización",
    en: "Apostille and Legalization"
  },
  "asesoria-migratoria-integral": {
    es: "Asesoría migratoria integral",
    en: "Comprehensive Immigration Consulting"
  },
  "casos-legales-y-apelaciones": {
    es: "Casos legales y apelaciones",
    en: "Legal Cases and Appeals"
  },
  "citas-consulares-y-formularios": {
    es: "Citas consulares y formularios",
    en: "Consular Appointments and Forms"
  },
  "inmigracion-y-servicios-migratorios-cumplimiento-corporativo": {
    es: "Cumplimiento corporativo",
    en: "Corporate Compliance"
  },
  "inmigracion-y-servicios-migratorios-defensadeportacionasilo": {
    es: "Defensa/deportación/asilo",
    en: "Defense/Deportation/Asylum"
  },
  "extensiones-de-visa": {
    es: "Extensiones de visa",
    en: "Visa Extensions"
  },
  "naturalizacion-y-ciudadania": {
    es: "Naturalización y ciudadanía",
    en: "Naturalization and Citizenship"
  },
  "inmigracion-y-servicios-migratorios-notariafe-publica": {
    es: "Notaría/fe pública",
    en: "Notary/Public Faith"
  },
  "inmigracion-y-servicios-migratorios-regularizacion-canje": {
    es: "Regularización / canje",
    en: "Regularization / Exchange"
  },
  "relocalizacion-enlace-expat": {
    es: "Relocalización (enlace Expat)",
    en: "Relocation (Expat Link)"
  },
  "residencia-temporal-y-permanente": {
    es: "Residencia temporal y permanente",
    en: "Temporary and Permanent Residency"
  },
  "seguimiento-de-estatus": {
    es: "Seguimiento de estatus",
    en: "Status Tracking"
  },
  "traduccion-certificada-enlace": {
    es: "Traducción certificada (enlace)",
    en: "Certified Translation (Link)"
  },
  "visas-de-estudiante": {
    es: "Visas de estudiante",
    en: "Student Visas"
  },
  "visas-de-inversionista-y-nomada-digital": {
    es: "Visas de inversionista y nómada digital",
    en: "Investor and Digital Nomad Visas"
  },
  "visas-de-trabajo-y-permisos": {
    es: "Visas de trabajo y permisos",
    en: "Work Visas and Permits"
  },
  "visas-de-turistanegocios": {
    es: "Visas de turista/negocios",
    en: "Tourist/Business Visas"
  },
  "inmigracion-y-servicios-migratorios-visas-familiares": {
    es: "Visas familiares",
    en: "Family Visas"
  },
  "adopcion-y-rescate-darrecibir": {
    es: "Adopción y rescate (dar/recibir)",
    en: "Adoption and Rescue (Give/Receive)"
  },
  "alimentos-y-suplementos-delivery": {
    es: "Alimentos y suplementos (delivery)",
    en: "Food and Supplements (Delivery)"
  },
  "mascotas-y-veterinaria-asesoria-nutricional": {
    es: "Asesoría nutricional",
    en: "Nutritional Counseling"
  },
  "clinicas-moviles-esterilizacion": {
    es: "Clínicas móviles / esterilización",
    en: "Mobile Clinics / Sterilization"
  },
  "control-de-parasitos": {
    es: "Control de parásitos",
    en: "Parasite Control"
  },
  "documentacion-y-viajes": {
    es: "Documentación y viajes",
    en: "Documentation and Travel"
  },
  "entrenamiento-y-conducta": {
    es: "Entrenamiento y conducta",
    en: "Training and Behavior"
  },
  "mascotas-y-veterinaria-especialidades-veterinarias": {
    es: "Especialidades veterinarias",
    en: "Veterinary Specialties"
  },
  "mascotas-y-veterinaria-especies-exoticas": {
    es: "Especies exóticas",
    en: "Exotic Species"
  },
  "eutanasia-y-cremacion": {
    es: "Eutanasia y cremación",
    en: "Euthanasia and Cremation"
  },
  "fotografia-de-mascotas": {
    es: "Fotografía de mascotas",
    en: "Pet Photography"
  },
  "grooming-bano-a-domicilio-estetica": {
    es: "Grooming (baño a domicilio, estética)",
    en: "Grooming (Home Bath, Aesthetics)"
  },
  "guarderia-y-hotel-de-mascotas": {
    es: "Guardería y hotel de mascotas",
    en: "Pet Daycare and Hotel"
  },
  "microchip-e-identificacion": {
    es: "Microchip e identificación",
    en: "Microchip and Identification"
  },
  "paseos-y-pet-sitting": {
    es: "Paseos y pet sitting",
    en: "Walks and Pet Sitting"
  },
  "perdido-y-encontrado-enlace": {
    es: "Perdido y Encontrado (enlace)",
    en: "Lost and Found (Link)"
  },
  "refugios-y-asociaciones": {
    es: "Refugios y asociaciones",
    en: "Shelters and Associations"
  },
  "rehabilitacion-e-hidroterapia": {
    es: "Rehabilitación e hidroterapia",
    en: "Rehabilitation and Hydrotherapy"
  },
  "mascotas-y-veterinaria-reproduccion-responsable": {
    es: "Reproducción responsable",
    en: "Responsible Breeding"
  },
  "seguros-para-mascotas": {
    es: "Seguros para mascotas",
    en: "Pet Insurance"
  },
  "mascotas-y-veterinaria-tele-veterinaria": {
    es: "Tele-veterinaria",
    en: "Tele-Veterinary"
  },
  "tienda-y-accesorios": {
    es: "Tienda y accesorios",
    en: "Store and Accessories"
  },
  "transporte-de-mascotas-pet-taxi": {
    es: "Transporte de mascotas (pet taxi)",
    en: "Pet Transportation (Pet Taxi)"
  },
  "urgencias-247-y-hospitalizacion": {
    es: "Urgencias 24/7 y hospitalización",
    en: "24/7 Emergencies and Hospitalization"
  },
  "veterinaria-general-consulta-vacunas": {
    es: "Veterinaria general (consulta, vacunas)",
    en: "General Veterinary (Consultation, Vaccines)"
  },
  "entrega-local-ultima-milla": {
    es: "Entrega local (última milla)",
    en: "Local Delivery (Last Mile)"
  },
  "personal-shopper-superfarmacia": {
    es: "Personal shopper (super/farmacia)",
    en: "Personal Shopper (Grocery/Pharmacy)"
  },
  "mensajeria-paqueteria-y-mandados-tramitesgestoria-express": {
    es: "Trámites/gestoría express",
    en: "Express Errands/Management"
  },
  "rentas-bodegas-mini-bodegas": {
    es: "Bodegas / mini-bodegas",
    en: "Warehouses / Mini-storage"
  },
  "rentas-coworking-y-salas-por-hora": {
    es: "Coworking y salas por hora",
    en: "Coworking and Hourly Rooms"
  },
  "rentas-cuartoscolivingroommate": {
    es: "Cuartos/coliving/roommate",
    en: "Rooms/Coliving/Roommate"
  },
  "rentas-estacionamiento-cajon": {
    es: "Estacionamiento / cajón",
    en: "Parking / Space"
  },
  "rentas-oficinas-y-locales-comerciales": {
    es: "Oficinas y locales comerciales",
    en: "Offices and Commercial Spaces"
  },
  "rentas-renta-de-equipo-herramientas-eventos": {
    es: "Renta de equipo (herramientas, eventos)",
    en: "Equipment Rental (Tools, Events)"
  },
  "rentas-vivienda-casadepartamentoestudio": {
    es: "Vivienda: casa/departamento/estudio",
    en: "Housing: House/Apartment/Studio"
  },
  "restaurantes-y-comida-a-domicilio-bebidas-y-hielo-a-domicilio": {
    es: "Bebidas y hielo a domicilio",
    en: "Beverages and Ice Delivery"
  },
  "restaurantes-y-comida-a-domicilio-catering-express-hogaroficina": {
    es: "Catering express hogar/oficina",
    en: "Express Catering Home/Office"
  },
  "restaurantes-y-comida-a-domicilio-comida-casera-a-domicilio": {
    es: "Comida casera a domicilio",
    en: "Home-Cooked Food Delivery"
  },
  "restaurantes-y-comida-a-domicilio-dark-kitchens-ghost-kitchens": {
    es: "Dark kitchens / ghost kitchens",
    en: "Dark Kitchens / Ghost Kitchens"
  },
  "restaurantes-y-comida-a-domicilio-dietas-especiales-veganoketosin-gluten": {
    es: "Dietas especiales (vegano/keto/sin gluten)",
    en: "Special Diets (Vegan/Keto/Gluten-Free)"
  },
  "restaurantes-y-comida-a-domicilio-kits-de-cocina-ready-to-cook": {
    es: "Kits de cocina (ready-to-cook)",
    en: "Cooking Kits (Ready-to-Cook)"
  },
  "restaurantes-y-comida-a-domicilio-meal-prep-semanal": {
    es: "Meal-prep semanal",
    en: "Weekly Meal-Prep"
  },
  "restaurantes-y-comida-a-domicilio-reposteria-y-panaderia-a-domicilio": {
    es: "Repostería y panadería a domicilio",
    en: "Pastry and Bakery Delivery"
  },
  "restaurantes-y-comida-a-domicilio-restaurantes-locales-pedido-y-entrega": {
    es: "Restaurantes locales (pedido y entrega)",
    en: "Local Restaurants (Order and Delivery)"
  },
  "restaurantes-y-comida-a-domicilio-servicio-nocturno-247": {
    es: "Servicio nocturno / 24/7",
    en: "Night Service / 24/7"
  },
  "restaurantes-y-comida-a-domicilio-supermercado-abarrotes-a-domicilio": {
    es: "Supermercado / abarrotes a domicilio",
    en: "Supermarket / Groceries Delivery"
  },
  "restaurantes-y-comida-a-domicilio-suscripciones-de-comida": {
    es: "Suscripciones de comida",
    en: "Food Subscriptions"
  },
  "servicios-funerarios-acompanamiento-psicologico": {
    es: "Acompañamiento psicológico",
    en: "Psychological Support"
  },
  "servicios-funerarios-cremacioninhumacion-y-velatorios": {
    es: "Cremación/inhumación y velatorios",
    en: "Cremation/Burial and Wakes"
  },
  "servicios-funerarios-planes-de-prevision": {
    es: "Planes de previsión",
    en: "Pre-Need Plans"
  },
  "servicios-funerarios-traslado-y-repatriacion": {
    es: "Traslado y repatriación",
    en: "Transfer and Repatriation"
  },
  "servicios-funerarios-tramites-y-actas": {
    es: "Trámites y actas",
    en: "Procedures and Certificates"
  },
  "servicios-legales-y-notariales-civil-contratos-arrendamiento-sucesiones": {
    es: "Civil (contratos, arrendamiento, sucesiones)",
    en: "Civil (Contracts, Leases, Successions)"
  },
  "servicios-legales-y-notariales-familiar-divorcios-custodia": {
    es: "Familiar (divorcios, custodia)",
    en: "Family (Divorces, Custody)"
  },
  "servicios-legales-y-notariales-fiscal-defensa-sat-planeacion": {
    es: "Fiscal (defensa SAT, planeación)",
    en: "Tax (Tax Defense, Planning)"
  },
  "servicios-legales-y-notariales-inmobiliario-y-condominios": {
    es: "Inmobiliario y condominios",
    en: "Real Estate and Condominiums"
  },
  "servicios-legales-y-notariales-laboral-asesoriadefensa": {
    es: "Laboral (asesoría/defensa)",
    en: "Labor (Consulting/Defense)"
  },
  "servicios-legales-y-notariales-mediacion-y-arbitraje": {
    es: "Mediación y arbitraje",
    en: "Mediation and Arbitration"
  },
  "servicios-legales-y-notariales-mercantilcorporativo-constitucion-gobierno": {
    es: "Mercantil/Corporativo (constitución, gobierno)",
    en: "Commercial/Corporate (Incorporation, Governance)"
  },
  "servicios-legales-y-notariales-migratorio-enlace-a-categoria-34": {
    es: "Migratorio (enlace a categoría 34)",
    en: "Immigration (Link to Category 34)"
  },
  "servicios-legales-y-notariales-notaria-escrituras-poderes": {
    es: "Notaría (escrituras, poderes)",
    en: "Notary (Deeds, Powers of Attorney)"
  },
  "servicios-legales-y-notariales-penal-asesoriadefensa": {
    es: "Penal (asesoría/defensa)",
    en: "Criminal (Consulting/Defense)"
  },
  "servicios-legales-y-notariales-propiedad-intelectual-y-datos-personales": {
    es: "Propiedad intelectual y datos personales",
    en: "Intellectual Property and Personal Data"
  },
  "telecomunicaciones-e-internet-cableado-estructurado-y-racks": {
    es: "Cableado estructurado y racks",
    en: "Structured Cabling and Racks"
  },
  "telecomunicaciones-e-internet-instalacion-de-fibraisp-y-routers": {
    es: "Instalación de fibra/ISP y routers",
    en: "Fiber/ISP and Router Installation"
  },
  "telecomunicaciones-e-internet-optimizacion-wi-fi-site-survey": {
    es: "Optimización Wi-Fi (site survey)",
    en: "Wi-Fi Optimization (Site Survey)"
  },
  "telecomunicaciones-e-internet-tv-satelitalcable-y-streaming": {
    es: "TV satelital/cable y streaming",
    en: "Satellite/Cable TV and Streaming"
  },
  "telecomunicaciones-e-internet-telefonia-ipcentralitas-y-camaras-ip": {
    es: "Telefonía IP/centralitas y cámaras IP",
    en: "IP Telephony/PBX and IP Cameras"
  },
};
