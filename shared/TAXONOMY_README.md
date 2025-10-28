# Canonical Taxonomy

## Overview

`canonical-taxonomy.ts` is the single source of truth for all service categories and subcategories with fixed UUIDs.

## File Structure

- **55 categories** - All properly matched with UUIDs from serviceTaxonomy.ts
- **431 subcategories** total:
  - **146 subcategories** (34%) - Successfully matched with proper UUIDs
  - **285 subcategories** (66%) - Have placeholder IDs (format: `missing-X-Y`)

## Data Source Mismatch

The subcategory names in `server/seed-data.ts` and `client/src/locales/data/serviceTaxonomy.ts` do not match exactly. This file uses:

- **Categories**: Matched by Spanish name between both sources ✅
- **Subcategories**: Matched where Spanish names are identical ⚠️

### Examples of Mismatches:

**seed-data.ts has:**
- "Agencia integral (IATA/GDS)"
- "Bombas e hidroneumáticos"  
- "Auxilionvial básico"

**serviceTaxonomy.ts may have slightly different names or these may not exist as subcategories**

## Recommendations

To get all 431 subcategories with proper UUIDs, you need to either:

1. **Reconcile the naming**: Update seed-data.ts to use the exact Spanish names from serviceTaxonomy.ts
2. **Create mapping rules**: Add a manual mapping between the different naming conventions
3. **Use serviceTaxonomy.ts exclusively**: Extract category-subcategory relationships from the comment groupings in serviceTaxonomy.ts

## Usage

```typescript
import { CANONICAL_CATEGORIES } from '@shared/canonical-taxonomy';

// Get all categories
console.log(CANONICAL_CATEGORIES.length); // 55

// Get a specific category
const admin = CANONICAL_CATEGORIES.find(c => c.nameEs === 'Administración Condominal');

// Access subcategories  
console.log(admin?.subcategories.length); // 6
```

## File Details

- **Lines**: 983
- **Size**: ~70KB
- **TypeScript**: Fully typed with interfaces
- **JSDoc**: Comprehensive documentation
