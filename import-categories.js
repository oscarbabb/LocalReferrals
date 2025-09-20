// Import script for new categories and subcategories from CSV
// This script will be executed once to populate the database for beta testing

import { neon } from '@neondatabase/serverless';
import fs from 'fs';
import path from 'path';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

const sql = neon(DATABASE_URL);

// Categories and subcategories from CSV
const categoriesData = [
  {
    name: "Administración Condominal",
    subcategories: [
      "Administración profesional y tesorería",
      "Asambleas y actas",
      "Auditoría y transparencia",
      "Contratación y supervisión de proveedores",
      "Mantenimiento integral del condominio",
      "Protocolos de huracán y emergencias"
    ]
  },
  {
    name: "Agencias de Viajes y Tours",
    subcategories: [
      "Agencia integral (IATA/GDS)",
      "Boletos de avión y tren",
      "Cruceros",
      "Grupos y MICE",
      "Hoteles y estancias",
      "Paquetes (vuelo + hotel)",
      "Renta de auto y chofer",
      "Seguros de viaje y asistencia",
      "Tours y experiencias",
      "Transportación turística y traslados",
      "Viajes de bodas y romance",
      "Viajes sustentables",
      "Visas y asesoría de viaje",
      "Workations / Nómadas digitales"
    ]
  },
  {
    name: "Agua y Tratamiento",
    subcategories: [
      "Análisis de calidad de agua",
      "Bombas e hidroneumáticos",
      "Captación de lluvia",
      "Cisternas/tinacos y sanitización",
      "Drenaje y aguas residuales",
      "Ósmosis y suavizadores"
    ]
  },
  {
    name: "Albercas y Jacuzzis",
    subcategories: [
      "Bombas y filtros",
      "Calentamiento (solar/eléctrico)",
      "Cubiertas y seguridad perimetral",
      "Limpieza y balance químico",
      "Rescate de agua verde",
      "Revestimientos e iluminación"
    ]
  },
  {
    name: "Altas de Servicios y Gestoría Domiciliaria",
    subcategories: [
      "Agua y drenaje (altas, medidores)",
      "Citas, pagos y aclaraciones con dependencias",
      "Electricidad (altas, medidores)",
      "Gas LP/Natural (contratos y seguridad)",
      "Recolección de basura y reciclaje"
    ]
  },
  {
    name: "Automotriz y Movilidad",
    subcategories: [
      "Auxilio vial básico",
      "Detallado de motos, bicis y scooters",
      "Encerado/pulido y corrección de pintura",
      "Lavado de flotas y valet empresarial",
      "Lavado de motor (en seco/controlado)",
      "Lavado y detallado a domicilio",
      "Limpieza de interiores y sanitización",
      "Polarizado y estética",
      "Protección cerámica / PPF",
      "Tapicería y lavado de asientos"
    ]
  },
  {
    name: "Bienes Raíces y Property Management",
    subcategories: [
      "Administración de propiedades",
      "Arrendamiento corporativo",
      "Avalúos y opinión de valor",
      "Due diligence inmobiliario",
      "Home staging",
      "Venta y renta"
    ]
  },
  {
    name: "Bolsa de Trabajo y Talento (Busco / Solicito)",
    subcategories: [
      "Alberquero (técnico de alberca)",
      "Carpintero / Herrero / Vidriero",
      "Chofer / Conductor ejecutivo",
      "Cocinera / Cocinero",
      "Cocinero / Chef / Stewarding",
      "Compras / Contabilidad / Administración",
      "Conductor sprinter/autobús",
      "Coordinador de eventos / Montajista / Audio-Iluminación",
      "Guía de turistas / Ventas tours",
      "Housekeeping / Ama de llaves",
      "Jardinería y paisajismo (operativo)",
      "Mesero / Bartender / Barista",
      "Paseador / Groomer / Auxiliar veterinario",
      "Personal de servicio/limpieza (hogar/condominio)",
      "Pintor / Impermeabilizador",
      "Plomero / Electricista / Técnico A/A",
      "Recepcionista / Concierge",
      "Recursos Humanos / Atención a clientes",
      "Reservaciones / Front desk",
      "Tutorías / Maestros de idiomas",
      "Vigilancia / Guardia"
    ]
  },
  {
    name: "Carpintería y Muebles",
    subcategories: [
      "Carpintería a medida",
      "Cubiertas (madera/compuesto)",
      "Muebles exteriores",
      "Persianas y closets inteligentes",
      "Puertas, closets y cocinas integrales",
      "Restauración y barnices"
    ]
  },
  {
    name: "Clasificados: Perdido y Encontrado",
    subcategories: [
      "Bicicletas / Scooters",
      "Documentos e identificaciones",
      "Electrónicos",
      "Joyas y relojes",
      "Llaves",
      "Mascotas",
      "Otros",
      "Ropa y accesorios"
    ]
  }
];

async function importCategories() {
  try {
    console.log('Starting categories import...');
    
    for (let i = 0; i < categoriesData.length; i++) {
      const category = categoriesData[i];
      
      // Insert main category
      const categoryResult = await sql`
        INSERT INTO service_categories (name, description, icon, color)
        VALUES (${category.name}, ${category.name}, '🏠', '#f97316')
        RETURNING id
      `;
      
      const categoryId = categoryResult[0].id;
      console.log(`Inserted category: ${category.name} (${categoryId})`);
      
      // Insert subcategories
      for (let j = 0; j < category.subcategories.length; j++) {
        const subcategory = category.subcategories[j];
        if (subcategory && subcategory.trim()) {
          await sql`
            INSERT INTO service_subcategories (category_id, name, "order")
            VALUES (${categoryId}, ${subcategory.trim()}, ${j + 1})
          `;
        }
      }
      
      console.log(`Inserted ${category.subcategories.filter(s => s && s.trim()).length} subcategories for ${category.name}`);
    }
    
    // Check results
    const categoryCount = await sql`SELECT COUNT(*) as count FROM service_categories`;
    const subcategoryCount = await sql`SELECT COUNT(*) as count FROM service_subcategories`;
    
    console.log(`\nImport completed successfully!`);
    console.log(`Total categories: ${categoryCount[0].count}`);
    console.log(`Total subcategories: ${subcategoryCount[0].count}`);
    
  } catch (error) {
    console.error('Error importing categories:', error);
    throw error;
  }
}

// Export for use in other scripts
export { importCategories };

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  importCategories()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}