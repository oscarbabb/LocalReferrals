import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, ChevronDown, ChevronUp } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { ServiceCategory, ServiceSubcategory } from "@shared/schema";
import { useLanguage } from "@/hooks/use-language";
import { getCategoryLabel, getCategoryDescription, getSubcategoryLabel } from "@/lib/serviceTranslations";

interface ServiceCardProps {
  category: ServiceCategory;
  providerCount?: number;
  showSubcategories?: boolean;
}

// Define a variety of beautiful gradient combinations
const colorVariants = [
  "from-blue-500 via-blue-600 to-indigo-700",       // Blue
  "from-emerald-500 via-green-600 to-teal-700",     // Green
  "from-amber-500 via-orange-500 to-red-600",       // Orange
  "from-purple-500 via-purple-600 to-indigo-700",   // Purple
  "from-red-500 via-rose-500 to-pink-600",          // Red
  "from-cyan-500 via-blue-500 to-indigo-600",       // Cyan
  "from-pink-500 via-rose-500 to-red-600",          // Pink
  "from-violet-500 via-purple-500 to-indigo-600",   // Violet
  "from-emerald-600 via-green-700 to-teal-800",     // Dark Green
  "from-sky-500 via-blue-600 to-indigo-700",        // Sky
  "from-orange-500 via-amber-600 to-yellow-600",    // Amber
  "from-rose-500 via-pink-600 to-purple-600",       // Rose
];

// Function to get consistent color for category ID
const getColorForCategory = (categoryId: string): string => {
  // Create hash of category ID to get consistent index
  let hash = 0;
  for (let i = 0; i < categoryId.length; i++) {
    hash = categoryId.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colorVariants.length;
  return colorVariants[index];
};

// Define matching hover variants
const hoverVariants = [
  "group-hover:from-blue-600 group-hover:via-blue-700 group-hover:to-indigo-800",      // Blue
  "group-hover:from-emerald-600 group-hover:via-green-700 group-hover:to-teal-800",    // Green
  "group-hover:from-amber-600 group-hover:via-orange-600 group-hover:to-red-700",      // Orange
  "group-hover:from-purple-600 group-hover:via-purple-700 group-hover:to-indigo-800",  // Purple
  "group-hover:from-red-600 group-hover:via-rose-600 group-hover:to-pink-700",         // Red
  "group-hover:from-cyan-600 group-hover:via-blue-600 group-hover:to-indigo-700",      // Cyan
  "group-hover:from-pink-600 group-hover:via-rose-600 group-hover:to-red-700",         // Pink
  "group-hover:from-violet-600 group-hover:via-purple-600 group-hover:to-indigo-700",  // Violet
  "group-hover:from-emerald-700 group-hover:via-green-800 group-hover:to-teal-900",    // Dark Green
  "group-hover:from-sky-600 group-hover:via-blue-700 group-hover:to-indigo-800",       // Sky
  "group-hover:from-orange-600 group-hover:via-amber-700 group-hover:to-yellow-700",   // Amber
  "group-hover:from-rose-600 group-hover:via-pink-700 group-hover:to-purple-700",      // Rose
];

// Function to get consistent hover color for category ID
const getHoverColorForCategory = (categoryId: string): string => {
  let hash = 0;
  for (let i = 0; i < categoryId.length; i++) {
    hash = categoryId.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % hoverVariants.length;
  return hoverVariants[index];
};

export default function ServiceCard({ category, providerCount = 0, showSubcategories = true }: ServiceCardProps) {
  const { language, t } = useLanguage();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const gradientClass = getColorForCategory(category.id);
  const hoverGradientClass = getHoverColorForCategory(category.id);

  // Fetch subcategories for this category
  const { data: subcategories = [], isLoading: subcategoriesLoading } = useQuery<ServiceSubcategory[]>({
    queryKey: [`/api/categories/${category.id}/subcategories`],
    enabled: showSubcategories,
  });

  // Close dropdown when language changes
  useEffect(() => {
    setOpen(false);
  }, [language]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [open]);

  const handleCardClick = () => {
    if (subcategoriesLoading) return;
    
    if (subcategories.length > 0) {
      setOpen(!open);
    } else {
      window.location.href = `/providers?category=${category.id}`;
    }
  };

  const handleSubcategoryClick = (subcategoryId: string) => {
    setOpen(false);
    window.location.href = `/providers?category=${category.id}&subcategory=${subcategoryId}`;
  };

  return (
    <div className="relative" style={{ isolation: 'isolate' }} ref={dropdownRef}>
      <Card 
        className="group h-full cursor-pointer card-animate hover-lift hover-shine border-0 shadow-lg bg-gradient-to-br from-white via-orange-50/30 to-blue-50/30 overflow-visible relative backdrop-blur-sm"
        onClick={handleCardClick}
        data-testid={`category-card-${category.id}`}
      >
        <CardContent className="p-8 text-center relative">
          {/* Enhanced background decorations */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-orange-200/40 via-orange-100/30 to-transparent rounded-bl-full"></div>
          <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-tr from-blue-200/30 via-blue-100/20 to-transparent rounded-tr-full"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-orange-100/10 to-blue-100/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
          
          {/* Icon container with improved design */}
          <div className={`w-20 h-20 bg-gradient-to-br ${gradientClass} ${hoverGradientClass} rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-2xl group-hover:shadow-orange-500/25 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 relative overflow-hidden`}>
            {/* Shine effect */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <span className="text-4xl relative z-10 drop-shadow-sm" style={{ fontFamily: 'Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji, sans-serif' }}>{category.icon}</span>
          </div>
          
          {/* Content */}
          <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-gray-800 transition-colors">
            {getCategoryLabel(category.slug || category.id, language, category.name)}
          </h3>
          <p className="text-sm text-gray-600 mb-6 leading-relaxed min-h-[40px]">
            {getCategoryDescription(category.slug || category.id, language, category.description || undefined)}
          </p>
          
          {/* Provider count badge and expand button */}
          <div className="flex items-center justify-center gap-3">
            <Badge 
              variant="secondary" 
              className="text-xs bg-gradient-to-r from-orange-50 to-orange-100 text-orange-700 border border-orange-200 group-hover:from-orange-100 group-hover:to-orange-200 transition-all duration-300 px-3 py-1"
            >
              {providerCount} {t('components.serviceCard.providers')}
            </Badge>
            {showSubcategories && subcategories.length > 0 ? (
              <div className="flex items-center gap-2">
                {open ? (
                  <ChevronUp className="w-6 h-6 text-gray-500 group-hover:text-orange-500 transition-all duration-300 drop-shadow-sm" />
                ) : (
                  <ChevronDown className="w-6 h-6 text-gray-500 group-hover:text-orange-500 transition-all duration-300 drop-shadow-sm" />
                )}
              </div>
            ) : (
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-orange-500 group-hover:translate-x-2 transition-all duration-500" />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Dropdown menu - using isolation to fix z-index stacking */}
      {showSubcategories && open && subcategories.length > 0 && (
        <div 
          className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 animate-in fade-in slide-in-from-top-2 duration-200"
          style={{ isolation: 'isolate' }}
          data-testid={`subcategory-dropdown-${category.id}`}
        >
          <div className="p-4 border-b border-gray-100">
            <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <span>{t('components.serviceCard.subcategories')}:</span>
              <Badge variant="outline" className="text-xs bg-orange-50 text-orange-600 border-orange-200">
                {subcategories.length}
              </Badge>
            </h4>
          </div>
          <div className="max-h-[300px] overflow-y-auto p-2">
            <div className="grid grid-cols-1 gap-1">
              {subcategories.map((subcategory) => (
                <div 
                  key={subcategory.id}
                  className="flex items-center justify-between p-3 rounded-md hover:bg-gradient-to-r hover:from-orange-50 hover:to-orange-100 transition-all duration-200 cursor-pointer group border border-transparent hover:border-orange-200"
                  data-testid={`subcategory-${subcategory.id}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSubcategoryClick(subcategory.id);
                  }}
                >
                  <span className="text-sm text-gray-700 group-hover:text-gray-900 font-medium">
                    {getSubcategoryLabel(subcategory.slug || subcategory.id, language, subcategory.name)}
                  </span>
                  <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-orange-500 group-hover:translate-x-1 transition-all duration-200" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
