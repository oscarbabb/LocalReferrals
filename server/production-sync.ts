import { db } from './db';
import { serviceCategories, serviceSubcategories, type ServiceCategory, type ServiceSubcategory } from '@shared/schema';
import { eq, and } from 'drizzle-orm';

// Production-safe category and subcategory sync
export async function syncCategoriesToProduction() {
  console.log('🚀 Starting production category sync...');
  
  try {
    // Get all current categories from this database (which has the comprehensive set)
    const currentCategories = await db.select().from(serviceCategories);
    const currentSubcategories = await db.select().from(serviceSubcategories);
    
    console.log(`📊 Found ${currentCategories.length} categories and ${currentSubcategories.length} subcategories to sync`);
    
    // Safely add categories that don't already exist (idempotent by checking names)
    for (const category of currentCategories) {
      // Check if category already exists by name
      const existingCategory = await db
        .select()
        .from(serviceCategories)
        .where(eq(serviceCategories.name, category.name))
        .limit(1);
      
      if (existingCategory.length === 0) {
        console.log(`➕ Adding new category: ${category.name}`);
        await db
          .insert(serviceCategories)
          .values({
            name: category.name,
            description: category.description,
            icon: category.icon,
            color: category.color
          });
      } else {
        console.log(`✅ Category already exists: ${category.name}`);
      }
    }
    
    // Sync subcategories (get fresh category IDs for foreign key references)
    const syncedCategories = await db.select().from(serviceCategories);
    const categoryMap = new Map(syncedCategories.map((c: ServiceCategory) => [c.name, c.id]));
    
    for (const subcategory of currentSubcategories) {
      // Find the category this subcategory belongs to
      const parentCategory = currentCategories.find((c: ServiceCategory) => c.id === subcategory.categoryId);
      if (parentCategory) {
        const newCategoryId = categoryMap.get(parentCategory.name);
        if (newCategoryId) {
          // Check if subcategory already exists
          const existingSubcategory = await db
            .select()
            .from(serviceSubcategories)
            .where(and(
              eq(serviceSubcategories.categoryId, newCategoryId),
              eq(serviceSubcategories.name, subcategory.name)
            ))
            .limit(1);
          
          if (existingSubcategory.length === 0) {
            console.log(`➕ Adding new subcategory: ${subcategory.name} to ${parentCategory.name}`);
            await db
              .insert(serviceSubcategories)
              .values({
                categoryId: newCategoryId,
                name: subcategory.name,
                order: subcategory.order
              });
          } else {
            console.log(`✅ Subcategory already exists: ${subcategory.name}`);
          }
        }
      }
    }
    
    // Verify sync results
    const finalCategories = await db.select().from(serviceCategories);
    const finalSubcategories = await db.select().from(serviceSubcategories);
    
    console.log(`✅ Sync complete: ${finalCategories.length} categories, ${finalSubcategories.length} subcategories`);
    
    return {
      success: true,
      categoriesCount: finalCategories.length,
      subcategoriesCount: finalSubcategories.length,
      message: 'Production sync completed successfully'
    };
    
  } catch (error) {
    console.error('❌ Production sync failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Production sync failed'
    };
  }
}