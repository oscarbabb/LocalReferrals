import { db } from './db';
import { generateSlug } from './slug-utils';
import { sql } from 'drizzle-orm';

/**
 * One-time migration to add slugs to existing categories and subcategories
 * This will:
 * 1. Add slug columns if they don't exist
 * 2. Populate slugs for all existing records
 */
export async function migrateSlugsToExistingRecords() {
  try {
    console.log('🔄 Starting slug migration...');
    
    // Step 1: Add slug columns if they don't exist
    console.log('📝 Adding slug columns if needed...');
    await db.execute(sql`ALTER TABLE service_categories ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE`);
    await db.execute(sql`ALTER TABLE service_subcategories ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE`);
    console.log('✅ Slug columns ensured');
    
    // Step 2: Migrate categories
    const categoriesResult = await db.execute(sql`SELECT id, name, slug FROM service_categories`);
    const categories = categoriesResult.rows;
    console.log(`📊 Found ${categories.length} categories to migrate`);
    
    for (const category of categories) {
      if (!category.slug) {
        const slug = generateSlug(category.name as string);
        await db.execute(sql`
          UPDATE service_categories 
          SET slug = ${slug}
          WHERE id = ${category.id}
        `);
        console.log(`  ✅ Updated category: ${category.name} -> ${slug}`);
      }
    }
    
    // Step 3: Migrate subcategories with category context for uniqueness
    const subcategoriesResult = await db.execute(sql`
      SELECT s.id, s.name, s.slug, s.category_id, c.slug as category_slug 
      FROM service_subcategories s 
      JOIN service_categories c ON s.category_id = c.id
    `);
    const subcategories = subcategoriesResult.rows;
    console.log(`📊 Found ${subcategories.length} subcategories to migrate`);
    
    let subcatUpdated = 0;
    for (const subcategory of subcategories) {
      if (!subcategory.slug) {
        // Generate slug with category prefix to ensure uniqueness
        const baseSlug = generateSlug(subcategory.name as string);
        const categorySlug = subcategory.category_slug as string;
        const uniqueSlug = `${categorySlug}-${baseSlug}`;
        
        await db.execute(sql`
          UPDATE service_subcategories 
          SET slug = ${uniqueSlug}
          WHERE id = ${subcategory.id}
        `);
        subcatUpdated++;
      }
    }
    
    console.log('✅ Slug migration complete!');
    return { success: true, categoriesUpdated: categories.length, subcategoriesUpdated: subcatUpdated };
    
  } catch (error: any) {
    console.error('❌ Slug migration failed:', error);
    console.error('Stack:', error.stack);
    return { success: false, error: error.message };
  }
}
