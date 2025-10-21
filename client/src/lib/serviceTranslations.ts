import { categoryTranslations, categoryDescriptionTranslations, subcategoryTranslations } from '@/locales/data/serviceTaxonomy';

/**
 * Get the translated label for a category
 * @param id - The category ID
 * @param language - The language ('en' or 'es')
 * @param fallback - Optional fallback string if translation not found
 * @returns The translated category label
 */
export function getCategoryLabel(
  id: string, 
  language: 'en' | 'es', 
  fallback?: string
): string {
  const translation = categoryTranslations[id];
  
  if (!translation) {
    // If no translation found, return fallback or empty string
    return fallback || '';
  }
  
  // Return the requested language, with Spanish as fallback if English is missing
  return translation[language] || translation.es || fallback || '';
}

/**
 * Get the translated description for a category
 * @param id - The category ID
 * @param language - The language ('en' or 'es')
 * @param fallback - Optional fallback string if translation not found
 * @returns The translated category description
 */
export function getCategoryDescription(
  id: string, 
  language: 'en' | 'es', 
  fallback?: string
): string {
  const translation = categoryDescriptionTranslations[id];
  
  if (!translation) {
    // If no translation found, return fallback or empty string
    return fallback || '';
  }
  
  // Return the requested language, with Spanish as fallback if English is missing
  return translation[language] || translation.es || fallback || '';
}

/**
 * Get the translated label for a subcategory
 * @param id - The subcategory ID
 * @param language - The language ('en' or 'es')
 * @param fallback - Optional fallback string if translation not found
 * @returns The translated subcategory label
 */
export function getSubcategoryLabel(
  id: string, 
  language: 'en' | 'es', 
  fallback?: string
): string {
  const translation = subcategoryTranslations[id];
  
  if (!translation) {
    // If no translation found, return fallback or empty string
    return fallback || '';
  }
  
  // Return the requested language, with Spanish as fallback if English is missing
  return translation[language] || translation.es || fallback || '';
}

/**
 * Get both language versions of a category for search purposes
 * @param id - The category ID
 * @returns Object with both es and en labels
 */
export function getCategoryLabels(id: string): { es: string; en: string } {
  const translation = categoryTranslations[id];
  return {
    es: translation?.es || '',
    en: translation?.en || translation?.es || ''
  };
}

/**
 * Get both language versions of a subcategory for search purposes
 * @param id - The subcategory ID
 * @returns Object with both es and en labels
 */
export function getSubcategoryLabels(id: string): { es: string; en: string } {
  const translation = subcategoryTranslations[id];
  return {
    es: translation?.es || '',
    en: translation?.en || translation?.es || ''
  };
}

/**
 * Check if a search term matches either language version of a category
 * @param id - The category ID
 * @param searchTerm - The search term to match against
 * @returns true if the search term matches either language
 */
export function categoryMatchesSearch(id: string, searchTerm: string): boolean {
  const labels = getCategoryLabels(id);
  const lowerSearch = searchTerm.toLowerCase();
  return (
    labels.es.toLowerCase().includes(lowerSearch) ||
    labels.en.toLowerCase().includes(lowerSearch)
  );
}

/**
 * Check if a search term matches either language version of a subcategory
 * @param id - The subcategory ID
 * @param searchTerm - The search term to match against
 * @returns true if the search term matches either language
 */
export function subcategoryMatchesSearch(id: string, searchTerm: string): boolean {
  const labels = getSubcategoryLabels(id);
  const lowerSearch = searchTerm.toLowerCase();
  return (
    labels.es.toLowerCase().includes(lowerSearch) ||
    labels.en.toLowerCase().includes(lowerSearch)
  );
}
