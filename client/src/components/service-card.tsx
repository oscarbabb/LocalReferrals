import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { ArrowRight, ChevronDown, ChevronUp } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import type { ServiceCategory, ServiceSubcategory } from "@shared/schema";

interface ServiceCardProps {
  category: ServiceCategory;
  providerCount?: number;
  showSubcategories?: boolean;
}

const gradientMap: Record<string, string> = {
  // Original mappings
  "#3B82F6": "from-blue-500 via-blue-600 to-indigo-700",    // Blue
  "#10B981": "from-emerald-500 via-green-600 to-teal-700",  // Green
  "#F59E0B": "from-amber-500 via-orange-500 to-red-600",    // Amber
  "#8B5CF6": "from-purple-500 via-purple-600 to-indigo-700", // Purple
  "#EF4444": "from-red-500 via-rose-500 to-pink-600",       // Red
  "#6366F1": "from-indigo-500 via-purple-600 to-blue-700",  // Indigo
  "#EC4899": "from-pink-500 via-rose-500 to-red-600",       // Pink
  "#22C55E": "from-emerald-500 via-green-600 to-teal-700",  // Green variation
  
  // Add the missing gray color with a colorful gradient instead of gray!
  "#6B7280": "from-blue-500 via-purple-600 to-indigo-700",  // Default - make it colorful!
  
  // New comprehensive service category colors
  "#0369A1": "from-sky-600 via-blue-700 to-indigo-800",     // Sky blue
  "#059669": "from-emerald-600 via-green-700 to-teal-800",  // Emerald
  "#065F46": "from-green-800 via-emerald-900 to-teal-900",  // Dark green
  "#0891B2": "from-cyan-500 via-blue-600 to-indigo-700",    // Cyan
  "#166534": "from-green-700 via-emerald-800 to-green-900", // Forest green
  "#1E40AF": "from-blue-700 via-indigo-800 to-purple-900", // Navy blue
  "#1F2937": "from-purple-600 via-indigo-700 to-blue-800",  // Dark gray - make it colorful!
  "#374151": "from-emerald-500 via-teal-600 to-cyan-700",   // Slate - make it colorful!
  "#7C2D12": "from-orange-800 via-red-900 to-red-800",      // Dark orange
  "#7C3AED": "from-violet-600 via-purple-700 to-indigo-800", // Violet
  "#8B5A96": "from-purple-400 via-purple-500 to-purple-600", // Light purple
  "#92400E": "from-amber-700 via-orange-800 to-red-800",    // Brown
  "#BE185D": "from-pink-600 via-rose-700 to-pink-800",      // Rose
  "#DB2777": "from-pink-600 via-rose-600 to-red-700",       // Hot pink
  "#DC2626": "from-red-600 via-red-700 to-rose-800",        // Pure red
};

const hoverGradientMap: Record<string, string> = {
  // Original hover mappings
  "#3B82F6": "group-hover:from-blue-600 group-hover:via-blue-700 group-hover:to-indigo-800",
  "#10B981": "group-hover:from-emerald-600 group-hover:via-green-700 group-hover:to-teal-800",
  "#F59E0B": "group-hover:from-amber-600 group-hover:via-orange-600 group-hover:to-red-700", 
  "#8B5CF6": "group-hover:from-purple-600 group-hover:via-purple-700 group-hover:to-indigo-800",
  "#EF4444": "group-hover:from-red-600 group-hover:via-rose-600 group-hover:to-pink-700",
  "#6366F1": "group-hover:from-indigo-600 group-hover:via-purple-700 group-hover:to-blue-800",
  "#EC4899": "group-hover:from-pink-600 group-hover:via-rose-600 group-hover:to-red-700",
  "#22C55E": "group-hover:from-emerald-600 group-hover:via-green-700 group-hover:to-teal-800",
  
  // Add the missing gray color with a colorful hover gradient!
  "#6B7280": "group-hover:from-blue-600 group-hover:via-purple-700 group-hover:to-indigo-800",
  
  // New comprehensive hover mappings
  "#0369A1": "group-hover:from-sky-700 group-hover:via-blue-800 group-hover:to-indigo-900",
  "#059669": "group-hover:from-emerald-700 group-hover:via-green-800 group-hover:to-teal-900",
  "#065F46": "group-hover:from-green-900 group-hover:via-emerald-900 group-hover:to-teal-900",
  "#0891B2": "group-hover:from-cyan-600 group-hover:via-blue-700 group-hover:to-indigo-800",
  "#166534": "group-hover:from-green-800 group-hover:via-emerald-900 group-hover:to-green-900",
  "#1E40AF": "group-hover:from-blue-800 group-hover:via-indigo-900 group-hover:to-purple-900",
  "#1F2937": "group-hover:from-purple-700 group-hover:via-indigo-800 group-hover:to-blue-900",  // Dark gray - make it colorful!
  "#374151": "group-hover:from-emerald-600 group-hover:via-teal-700 group-hover:to-cyan-800",   // Slate - make it colorful!
  "#7C2D12": "group-hover:from-orange-900 group-hover:via-red-900 group-hover:to-red-900",
  "#7C3AED": "group-hover:from-violet-700 group-hover:via-purple-800 group-hover:to-indigo-900",
  "#8B5A96": "group-hover:from-purple-500 group-hover:via-purple-600 group-hover:to-purple-700",
  "#92400E": "group-hover:from-amber-800 group-hover:via-orange-900 group-hover:to-red-900",
  "#BE185D": "group-hover:from-pink-700 group-hover:via-rose-800 group-hover:to-pink-900",
  "#DB2777": "group-hover:from-pink-700 group-hover:via-rose-700 group-hover:to-red-800",
  "#DC2626": "group-hover:from-red-700 group-hover:via-red-800 group-hover:to-rose-900",
};

export default function ServiceCard({ category, providerCount = 0, showSubcategories = true }: ServiceCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const cardRef = useRef<HTMLDivElement>(null);
  const gradientClass = gradientMap[category.color || "#6B7280"] || "from-orange-500 via-pink-600 to-purple-700";
  const hoverGradientClass = hoverGradientMap[category.color || "#6B7280"] || "group-hover:from-orange-600 group-hover:via-pink-700 group-hover:to-purple-800";

  // Fetch subcategories for this category
  const { data: subcategories = [], isLoading: subcategoriesLoading } = useQuery<ServiceSubcategory[]>({
    queryKey: ['/api/categories', category.id, 'subcategories'],
    enabled: showSubcategories,
  });

  const handleCardClick = (e: React.MouseEvent) => {
    if (showSubcategories) {
      e.preventDefault();
      
      // Don't do anything while loading
      if (subcategoriesLoading) return;
      
      if (subcategories.length > 0) {
        // Show subcategories dropdown
        if (!isExpanded && cardRef.current) {
          // Calculate dropdown position relative to viewport (for fixed positioning)
          const rect = cardRef.current.getBoundingClientRect();
          setDropdownPosition({
            top: rect.bottom + 8,
            left: rect.left,
            width: rect.width
          });
        }
        setIsExpanded(!isExpanded);
      } else {
        // Navigate to providers page if no subcategories
        window.location.href = `/providers?category=${category.id}`;
      }
    } else {
      // Navigate to providers page if subcategories disabled
      window.location.href = `/providers?category=${category.id}`;
    }
  };

  const handleSubcategoryClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <>
      <div className="relative" ref={cardRef}>
        <Card 
          className="group h-full cursor-pointer card-animate hover-lift hover-shine border-0 shadow-lg bg-gradient-to-br from-white via-orange-50/30 to-blue-50/30 overflow-hidden relative backdrop-blur-sm"
          onClick={handleCardClick}
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
              {category.name}
            </h3>
            <p className="text-sm text-gray-600 mb-6 leading-relaxed min-h-[40px]">
              {category.description}
            </p>
            
            {/* Provider count badge and expand button */}
            <div className="flex items-center justify-center gap-3">
              <Badge 
                variant="secondary" 
                className="text-xs bg-gradient-to-r from-orange-50 to-orange-100 text-orange-700 border border-orange-200 group-hover:from-orange-100 group-hover:to-orange-200 transition-all duration-300 px-3 py-1"
              >
                {providerCount} proveedores
              </Badge>
              {showSubcategories && subcategories.length > 0 ? (
                <div className="flex items-center gap-2">
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-gray-400 group-hover:text-orange-500 transition-all duration-300" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-orange-500 transition-all duration-300" />
                  )}
                </div>
              ) : (
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-orange-500 group-hover:translate-x-2 transition-all duration-500" />
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Subcategories dropdown - fixed positioned to escape grid stacking context */}
      {showSubcategories && subcategories.length > 0 && (
        <div 
          className={`fixed z-50 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden transition-all duration-300 ${isExpanded ? 'opacity-100 visible transform translate-y-0' : 'opacity-0 invisible transform -translate-y-2 pointer-events-none'}`}
          style={{
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
            width: `${dropdownPosition.width}px`
          }}
        >
          <div className="p-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Subcategorías:</h4>
            <div className="grid grid-cols-1 gap-2">
              {subcategories.map((subcategory) => (
                <Link 
                  key={subcategory.id} 
                  href={`/providers?category=${category.id}&subcategory=${subcategory.id}`}
                  onClick={handleSubcategoryClick}
                >
                  <div 
                    className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50 transition-colors cursor-pointer"
                    data-testid={`subcategory-${subcategory.id}`}
                  >
                    <span className="text-sm text-gray-600 hover:text-gray-800">{subcategory.name}</span>
                    <ArrowRight className="w-3 h-3 text-gray-400" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
