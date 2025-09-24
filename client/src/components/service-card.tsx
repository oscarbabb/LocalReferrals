import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { ArrowRight, ChevronDown, ChevronUp } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { createPortal } from "react-dom";
import type { ServiceCategory, ServiceSubcategory } from "@shared/schema";

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
  const [isExpanded, setIsExpanded] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const cardRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const gradientClass = getColorForCategory(category.id);
  const hoverGradientClass = getHoverColorForCategory(category.id);

  // Calculate dropdown position when expanded
  useEffect(() => {
    if (isExpanded && cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 4, // Just 4px below the card
        left: rect.left,
        width: rect.width
      });
    }
  }, [isExpanded]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const isInCard = cardRef.current && cardRef.current.contains(target);
      const isInDropdown = dropdownRef.current && dropdownRef.current.contains(target);
      
      if (!isInCard && !isInDropdown) {
        setIsExpanded(false);
      }
    };

    const handleScroll = () => {
      if (isExpanded) {
        setIsExpanded(false);
      }
    };

    if (isExpanded) {
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('scroll', handleScroll, true);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        window.removeEventListener('scroll', handleScroll, true);
      };
    }
  }, [isExpanded]);

  // Fetch subcategories for this category
  const { data: subcategories = [], isLoading: subcategoriesLoading } = useQuery<ServiceSubcategory[]>({
    queryKey: [`/api/categories/${category.id}/subcategories`],
    enabled: showSubcategories,
  });

  const handleCardClick = (e: React.MouseEvent) => {
    if (showSubcategories) {
      e.preventDefault();
      
      // Don't do anything while loading
      if (subcategoriesLoading) return;
      
      if (subcategories.length > 0) {
        // Toggle subcategories dropdown
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

  const handleSubcategoryClick = (e: React.MouseEvent, subcategoryId: string) => {
    e.stopPropagation();
    setIsExpanded(false); // Close dropdown
    window.location.href = `/providers?category=${category.id}&subcategory=${subcategoryId}`;
  };

  // Portal dropdown component
  const PortalDropdown = () => {
    if (!showSubcategories || subcategories.length === 0 || !isExpanded) {
      return null;
    }

    return createPortal(
      <div 
        ref={dropdownRef}
        className="fixed z-[10000] bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden pointer-events-auto"
        style={{
          top: dropdownPosition.top,
          left: dropdownPosition.left,
          width: dropdownPosition.width,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Subcategorías:</h4>
          <div className="grid grid-cols-1 gap-2">
            {subcategories.map((subcategory) => (
              <div 
                key={subcategory.id}
                className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50 transition-colors cursor-pointer"
                data-testid={`subcategory-${subcategory.id}`}
                onClick={(e) => handleSubcategoryClick(e, subcategory.id)}
              >
                <span className="text-sm text-gray-600 hover:text-gray-800">{subcategory.name}</span>
                <ArrowRight className="w-3 h-3 text-gray-400" />
              </div>
            ))}
          </div>
        </div>
      </div>,
      document.body
    );
  };

  return (
    <div className="relative" ref={cardRef}>
      <Card 
        className="group h-full cursor-pointer card-animate hover-lift hover-shine border-0 shadow-lg bg-gradient-to-br from-white via-orange-50/30 to-blue-50/30 overflow-visible relative backdrop-blur-sm"
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

      {/* Portal dropdown component */}
      <PortalDropdown />
    </div>
  );
}
