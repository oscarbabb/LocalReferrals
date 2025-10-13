/**
 * Safari-compatible date parsing utilities
 * Safari requires ISO 8601 format dates and is very strict about date parsing
 */

/**
 * Safely parse a date string or Date object
 * Handles multiple formats and ensures Safari compatibility
 */
export function parseSafeDate(date: Date | string | null | undefined): Date {
  if (!date) {
    return new Date();
  }

  if (date instanceof Date) {
    return date;
  }

  try {
    // If it's already a valid ISO string, use it directly
    if (typeof date === 'string') {
      // Replace space with 'T' for Safari compatibility (e.g., "2024-01-15 10:00:00" -> "2024-01-15T10:00:00")
      const isoDate = date.replace(' ', 'T');
      const parsed = new Date(isoDate);
      
      // Check if the date is valid
      if (!isNaN(parsed.getTime())) {
        return parsed;
      }
    }

    // Fallback to current date if parsing fails
    console.warn('Invalid date format:', date);
    return new Date();
  } catch (error) {
    console.warn('Date parsing error:', error);
    return new Date();
  }
}

/**
 * Format a date string for Safari-compatible parsing
 * Converts "YYYY-MM-DD HH:mm:ss" to "YYYY-MM-DDTHH:mm:ss"
 */
export function normalizeDateString(dateString: string): string {
  if (!dateString) return '';
  
  // Replace the first space with 'T' for ISO 8601 compliance
  return dateString.replace(' ', 'T');
}
