/**
 * Production seed data for service categories
 * This file is bundled with the deployment and guarantees data availability
 * 
 * IMPORTANT: This file is imported at build time, so it's always available in production
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
    name: "Limpieza",
    description: "Servicios profesionales de limpieza para hogares y oficinas",
    icon: "🧹",
    color: "blue",
    subcategories: [
      "Limpieza residencial",
      "Limpieza profunda",
      "Limpieza post-obra",
      "Desinfección y sanitización",
      "Vidrios y altura",
      "Tapicerías y alfombras",
      "Cisternas y tinacos",
      "Retiro de escombros"
    ]
  },
  {
    name: "Plomería",
    description: "Servicios profesionales de plomería e instalaciones",
    icon: "🔧",
    color: "blue",
    subcategories: [
      "Instalación y reparación de llaves y WC",
      "Fugas y desazolve",
      "Tuberías y drenaje",
      "Calentadores (gas/eléctrico)",
      "Bombas e hidroneumáticos",
      "Purificación de agua / ósmosis"
    ]
  },
  {
    name: "Electricidad",
    description: "Servicios profesionales de electricidad e instalaciones eléctricas",
    icon: "⚡",
    color: "blue",
    subcategories: [
      "Instalaciones y canalizaciones",
      "Tomas, contactos y USB",
      "Tablero eléctrico y protecciones",
      "Iluminación LED y diseño",
      "Diagnóstico de cortos/variación",
      "Pararrayos y puesta a tierra"
    ]
  },
  {
    name: "Jardinería y Paisajismo",
    description: "Servicios profesionales de jardinería y diseño de paisajes",
    icon: "🌿",
    color: "blue",
    subcategories: [
      "Mantenimiento de jardines",
      "Paisajismo y diseño",
      "Podas y tala controlada",
      "Riego automatizado",
      "Jardín vertical y huertos",
      "Control de plagas de jardín"
    ]
  },
  {
    name: "Construcción y Remodelación",
    description: "Servicios profesionales de construcción y remodelación",
    icon: "🏗️",
    color: "blue",
    subcategories: [
      "Obra gris y albañilería",
      "Cocinas y baños (remodelación)",
      "Pisos y recubrimientos",
      "Tablaroca/drywall y plafones",
      "Techos y pérgolas",
      "Planificación de obra y presupuestos"
    ]
  },
  {
    name: "Pintura e Impermeabilización",
    description: "Servicios profesionales de pintura e impermeabilización",
    icon: "🎨",
    color: "blue",
    subcategories: [
      "Pintura interior/exterior",
      "Impermeabilización de azoteas",
      "Fachadas y revocos",
      "Resanes y yeso",
      "Recubrimientos epóxicos",
      "Tratamiento de humedades/salitre"
    ]
  },
  {
    name: "Carpintería y Muebles",
    description: "Servicios profesionales de carpintería y fabricación de muebles",
    icon: "🔨",
    color: "blue",
    subcategories: [
      "Carpintería a medida",
      "Puertas, closets y cocinas integrales",
      "Muebles exteriores",
      "Persianas y closets inteligentes",
      "Restauración y barnices",
      "Cubiertas (madera/compuesto)"
    ]
  },
  {
    name: "Herrería, Aluminio y Vidrio",
    description: "Servicios profesionales de herrería y vidriería",
    icon: "🔩",
    color: "blue",
    subcategories: [
      "Barandales y puertas",
      "Ventanas y cancelería",
      "Cristales templados",
      "Cortinas metálicas",
      "Mosquiteros y sellos",
      "Soldadura y estructuras ligeras"
    ]
  },
  {
    name: "Control de Plagas",
    description: "Servicios profesionales de control y prevención de plagas",
    icon: "🦟",
    color: "blue",
    subcategories: [
      "Fumigación general",
      "Desratización",
      "Termitas y carcoma",
      "Mosquitos y vectores",
      "Control integrado post-obra",
      "Certificados y garantías"
    ]
  },
  {
    name: "Aire Acondicionado y Refrigeración",
    description: "Servicios profesionales de climatización y refrigeración",
    icon: "❄️",
    color: "blue",
    subcategories: [
      "Instalación de minisplits",
      "Mantenimiento preventivo",
      "Reparación de equipos",
      "Recarga de gas refrigerante",
      "Limpieza profunda",
      "Refrigeración comercial"
    ]
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
