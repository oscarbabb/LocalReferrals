import { db } from './db';
import { serviceCategories, serviceSubcategories } from '@shared/schema';
import { eq } from 'drizzle-orm';
import fs from 'fs';
import path from 'path';
import { generateSlug } from './slug-utils';

// Automatic CSV import for production database seeding
// This runs once on startup and is idempotent (safe to run multiple times)
export async function autoSeedFromCSV() {
  try {
    console.log('🌱 Checking if database needs seeding...');
    
    // Check current category count
    const existingCategories = await db.select().from(serviceCategories);
    const categoryCount = existingCategories.length;
    
    console.log(`📊 Found ${categoryCount} existing categories in database`);
    
    // If we already have comprehensive categories (50+), skip seeding
    if (categoryCount >= 50) {
      console.log('✅ Database already has comprehensive categories, skipping auto-seed');
      return { success: true, skipped: true, reason: 'Already seeded' };
    }
    
    console.log('📦 Database needs seeding, starting automatic CSV import...');
    
    // Read the CSV file
    const csvPath = path.join(process.cwd(), 'attached_assets/Categorias y subcategorias_referencias Locales v 1_1758391778764.csv');
    
    if (!fs.existsSync(csvPath)) {
      console.error(`❌ CSV file not found at: ${csvPath}`);
      return { success: false, error: 'CSV file not found' };
    }
    
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    
    // Parse CSV lines
    const lines = csvContent.split('\n').filter(line => line.trim());
    console.log(`📄 Found ${lines.length - 1} categories in CSV`);
    
    // Define category icons mapping
    const categoryIcons: Record<string, string> = {
      'Administración Condominal': '🏢',
      'Agencias de Viajes y Tours': '✈️',
      'Agua y Tratamiento': '💧',
      'Albercas y Jacuzzis': '🏊',
      'Altas de Servicios y Gestoría Domiciliaria': '📋',
      'Automotriz y Movilidad': '🚗',
      'Bienes Raíces y Property Management': '🏠',
      'Bolsa de Trabajo y Talento (Busco / Solicito)': '💼',
      'Carpintería y Muebles': '🔨',
      'Clasificados: Perdido y Encontrado': '🔍',
      'Cocina, Banquetes y Eventos': '🍽️',
      'Comercio Exterior y Aduanas': '📦',
      'Construcción y Remodelación': '🏗️',
      'Control de Plagas': '🐛',
      'Donativos, Voluntariado y ONG': '❤️',
      'Drones, Topografía e Inspecciones': '🚁',
      'Educación y Tutorías': '📚',
      'Electricidad': '⚡',
      'Electrodomésticos': '🔌',
      'Energía y Sustentabilidad': '🌱',
      'Eventos Corporativos y Sociales': '🎉',
      'Fitness y Belleza': '💪',
      'Fotografía y Video': '📸',
      'Gestión de Residuos y Reciclaje': '♻️',
      'Herrería, Aluminio y Vidrio': '🔧',
      'Idiomas y Certificaciones': '🗣️',
      'Impresión y Señalización': '🖨️',
      'Inmigración y Servicios Migratorios': '🛂',
      'Jardinería y Paisajismo': '🌿',
      'Lavandería y Tintorería': '👕',
      'Limpieza': '🧽',
      'Marketplace (Compra / Venta / Intercambio)': '🛒',
      'Mascotas y Veterinaria': '🐕',
      'Mensajería, Paquetería y Mandados': '📮',
      'Mudanzas y Logística': '📦',
      'Organizaciones Sociales y Asistencia': '🤝',
      'Pintura e Impermeabilización': '🎨',
      'Plomería': '🚿',
      'Psicología y Bienestar': '🧠',
      'Rentas (Corto, Mediano y Largo Plazo)': '🏠',
      'Rentas Vacacionales y Co-Hosting': '🏖️',
      'Reparación de Dispositivos y Electrónica': '💻',
      'Restaurantes y Comida a Domicilio': '🍕',
      'Rifas, Sorteos y Promociones': '🎲',
      'Salud, Medicina y Enfermería': '⚕️',
      'Seguridad (CCTV y Accesos)': '🔒',
      'Servicios Funerarios': '🕊️',
      'Servicios Legales y Notariales': '⚖️',
      'Servicios Náuticos y Marina': '⛵',
      'Servicios para Comercios y Oficinas': '🏢',
      'Tecnología, Redes y Smart Home': '💻',
      'Telecomunicaciones e Internet': '📡',
      'Traducción e Interpretación': '🌐',
      'Transporte Terrestre y Conductores': '🚌'
    };

    let importedCategories = 0;
    let importedSubcategories = 0;

    // Process each category row
    for (let i = 1; i < lines.length; i++) {
      const row = lines[i].split(',');
      const categoryName = row[0]?.trim();
      
      if (!categoryName) continue;

      // Check if category already exists
      const existing = await db
        .select()
        .from(serviceCategories)
        .where(eq(serviceCategories.name, categoryName))
        .limit(1);
      
      if (existing.length > 0) {
        console.log(`⏭️  Category already exists: ${categoryName}`);
        continue;
      }

      // Insert category
      const categoryIcon = categoryIcons[categoryName] || '🔧';
      const categorySlug = generateSlug(categoryName);
      const categoryResult = await db.insert(serviceCategories).values({
        slug: categorySlug,
        name: categoryName,
        description: `Servicios profesionales de ${categoryName.toLowerCase()}`,
        icon: categoryIcon,
        color: 'blue'
      }).returning();

      const category = categoryResult[0];
      importedCategories++;
      console.log(`✅ Imported category: ${categoryName}`);

      // Insert subcategories
      for (let j = 1; j < Math.min(row.length, 26); j++) {
        const subcategoryName = row[j]?.trim();
        if (subcategoryName && subcategoryName !== '') {
          // Generate slug with category prefix for uniqueness
          const baseSubcategorySlug = generateSlug(subcategoryName);
          const subcategorySlug = `${categorySlug}-${baseSubcategorySlug}`;
          await db.insert(serviceSubcategories).values({
            categoryId: category.id,
            slug: subcategorySlug,
            name: subcategoryName,
            order: j - 1
          });
          importedSubcategories++;
        }
      }
    }

    console.log(`✅ AUTO-SEED COMPLETE: ${importedCategories} categories, ${importedSubcategories} subcategories`);
    
    return {
      success: true,
      importedCategories,
      importedSubcategories,
      totalItems: importedCategories + importedSubcategories
    };

  } catch (error: any) {
    console.error('❌ Auto-seed failed:', error);
    console.error('Stack trace:', error.stack);
    return {
      success: false,
      error: error.message || 'Unknown error during auto-seed'
    };
  }
}
