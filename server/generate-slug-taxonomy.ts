import { db } from './db';
import { serviceCategories, serviceSubcategories } from '@shared/schema';
import { sql } from 'drizzle-orm';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Generates a new serviceTaxonomy.ts file with slug-based keys instead of UUID-based keys
 * This should be run once to convert the existing UUID-based translations to slug-based
 */
async function generateSlugBasedTaxonomy() {
  try {
    console.log('🔄 Fetching categories and subcategories from database...');
    
    // Fetch all categories with their current UUIDs and new slugs
    const categoriesResult = await db.execute(sql`
      SELECT id, slug, name FROM service_categories ORDER BY name
    `);
    const categories = categoriesResult.rows;
    console.log(`📊 Found ${categories.length} categories`);
    
    // Fetch all subcategories with their current UUIDs and new slugs
    const subcategoriesResult = await db.execute(sql`
      SELECT s.id, s.slug, s.name, c.slug as category_slug
      FROM service_subcategories s
      JOIN service_categories c ON s.category_id = c.id
      ORDER BY c.name, s.name
    `);
    const subcategories = subcategoriesResult.rows;
    console.log(`📊 Found ${subcategories.length} subcategories`);
    
    // Load the existing translations
    const existingTaxonomy = await import('../client/src/locales/data/serviceTaxonomy.ts');
    const { categoryTranslations, categoryDescriptionTranslations, subcategoryTranslations } = existingTaxonomy;
    
    // Build new translations with slug keys
    const newCategoryTranslations: Record<string, { es: string; en: string }> = {};
    const newCategoryDescriptions: Record<string, { es: string; en: string }> = {};
    
    for (const category of categories) {
      const id = category.id as string;
      const slug = category.slug as string;
      
      if (categoryTranslations[id]) {
        newCategoryTranslations[slug] = categoryTranslations[id];
      }
      
      if (categoryDescriptionTranslations[id]) {
        newCategoryDescriptions[slug] = categoryDescriptionTranslations[id];
      }
    }
    
    const newSubcategoryTranslations: Record<string, { es: string; en: string }> = {};
    
    for (const subcategory of subcategories) {
      const id = subcategory.id as string;
      const slug = subcategory.slug as string;
      
      if (subcategoryTranslations[id]) {
        newSubcategoryTranslations[slug] = subcategoryTranslations[id];
      }
    }
    
    // Generate the new file content
    let fileContent = `// Translation interface for service taxonomy
export interface TaxonomyTranslation {
  es: string;
  en: string;
}

export interface TaxonomyTranslations {
  [slug: string]: TaxonomyTranslation;
}

// Category translations - All ${categories.length} categories (slug-based keys)
export const categoryTranslations: TaxonomyTranslations = {\n`;
    
    for (const [slug, translation] of Object.entries(newCategoryTranslations)) {
      fileContent += `  "${slug}": {\n`;
      fileContent += `    es: "${translation.es}",\n`;
      fileContent += `    en: "${translation.en}"\n`;
      fileContent += `  },\n`;
    }
    
    fileContent += `};\n\n`;
    fileContent += `// Category description translations (slug-based keys)\n`;
    fileContent += `export const categoryDescriptionTranslations: TaxonomyTranslations = {\n`;
    
    for (const [slug, translation] of Object.entries(newCategoryDescriptions)) {
      fileContent += `  "${slug}": {\n`;
      fileContent += `    es: "${translation.es}",\n`;
      fileContent += `    en: "${translation.en}"\n`;
      fileContent += `  },\n`;
    }
    
    fileContent += `};\n\n`;
    fileContent += `// Subcategory translations - All ${subcategories.length} subcategories (slug-based keys)\n`;
    fileContent += `export const subcategoryTranslations: TaxonomyTranslations = {\n`;
    
    for (const [slug, translation] of Object.entries(newSubcategoryTranslations)) {
      fileContent += `  "${slug}": {\n`;
      fileContent += `    es: "${translation.es}",\n`;
      fileContent += `    en: "${translation.en}"\n`;
      fileContent += `  },\n`;
    }
    
    fileContent += `};\n`;
    
    // Write the new file
    const outputPath = path.join(__dirname, '../client/src/locales/data/serviceTaxonomy.ts');
    fs.writeFileSync(outputPath, fileContent, 'utf-8');
    
    console.log('✅ Successfully generated slug-based taxonomy file!');
    console.log(`📝 File written to: ${outputPath}`);
    console.log(`📊 Statistics:`);
    console.log(`   - ${Object.keys(newCategoryTranslations).length} category translations`);
    console.log(`   - ${Object.keys(newCategoryDescriptions).length} category descriptions`);
    console.log(`   - ${Object.keys(newSubcategoryTranslations).length} subcategory translations`);
    
    return {
      success: true,
      categoriesConverted: Object.keys(newCategoryTranslations).length,
      descriptionsConverted: Object.keys(newCategoryDescriptions).length,
      subcategoriesConverted: Object.keys(newSubcategoryTranslations).length
    };
    
  } catch (error: any) {
    console.error('❌ Failed to generate slug-based taxonomy:', error);
    console.error('Stack:', error.stack);
    return { success: false, error: error.message };
  }
}

export { generateSlugBasedTaxonomy };

// Run if called directly (ES module compatible)
if (import.meta.url === `file://${process.argv[1]}`) {
  generateSlugBasedTaxonomy().then((result) => {
    if (result.success) {
      console.log('\n✅ Conversion complete!');
      process.exit(0);
    } else {
      console.error('\n❌ Conversion failed!');
      process.exit(1);
    }
  });
}
