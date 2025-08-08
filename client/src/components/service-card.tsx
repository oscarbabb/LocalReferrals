import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import type { ServiceCategory } from "@shared/schema";

interface ServiceCardProps {
  category: ServiceCategory;
  providerCount?: number;
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
  
  // New comprehensive service category colors
  "#0369A1": "from-sky-600 via-blue-700 to-indigo-800",     // Sky blue
  "#059669": "from-emerald-600 via-green-700 to-teal-800",  // Emerald
  "#065F46": "from-green-800 via-emerald-900 to-teal-900",  // Dark green
  "#0891B2": "from-cyan-500 via-blue-600 to-indigo-700",    // Cyan
  "#166534": "from-green-700 via-emerald-800 to-green-900", // Forest green
  "#1E40AF": "from-blue-700 via-indigo-800 to-purple-900", // Navy blue
  "#1F2937": "from-gray-700 via-gray-800 to-slate-900",     // Dark gray
  "#374151": "from-gray-600 via-slate-700 to-gray-800",     // Slate
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
  
  // New comprehensive hover mappings
  "#0369A1": "group-hover:from-sky-700 group-hover:via-blue-800 group-hover:to-indigo-900",
  "#059669": "group-hover:from-emerald-700 group-hover:via-green-800 group-hover:to-teal-900",
  "#065F46": "group-hover:from-green-900 group-hover:via-emerald-900 group-hover:to-teal-900",
  "#0891B2": "group-hover:from-cyan-600 group-hover:via-blue-700 group-hover:to-indigo-800",
  "#166534": "group-hover:from-green-800 group-hover:via-emerald-900 group-hover:to-green-900",
  "#1E40AF": "group-hover:from-blue-800 group-hover:via-indigo-900 group-hover:to-purple-900",
  "#1F2937": "group-hover:from-gray-800 group-hover:via-gray-900 group-hover:to-slate-900",
  "#374151": "group-hover:from-gray-700 group-hover:via-slate-800 group-hover:to-gray-900",
  "#7C2D12": "group-hover:from-orange-900 group-hover:via-red-900 group-hover:to-red-900",
  "#7C3AED": "group-hover:from-violet-700 group-hover:via-purple-800 group-hover:to-indigo-900",
  "#8B5A96": "group-hover:from-purple-500 group-hover:via-purple-600 group-hover:to-purple-700",
  "#92400E": "group-hover:from-amber-800 group-hover:via-orange-900 group-hover:to-red-900",
  "#BE185D": "group-hover:from-pink-700 group-hover:via-rose-800 group-hover:to-pink-900",
  "#DB2777": "group-hover:from-pink-700 group-hover:via-rose-700 group-hover:to-red-800",
  "#DC2626": "group-hover:from-red-700 group-hover:via-red-800 group-hover:to-rose-900",
};

export default function ServiceCard({ category, providerCount = 0 }: ServiceCardProps) {
  const gradientClass = gradientMap[category.color] || "from-gray-400 to-gray-600";
  const hoverGradientClass = hoverGradientMap[category.color] || "group-hover:from-gray-500 group-hover:to-gray-700";

  return (
    <Link href={`/providers?category=${category.id}`}>
      <Card className="group h-full cursor-pointer hover:shadow-2xl hover:shadow-orange-500/20 hover:-translate-y-3 transition-all duration-500 border-0 shadow-lg bg-gradient-to-br from-white via-orange-50/30 to-blue-50/30 overflow-hidden relative backdrop-blur-sm">
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
          
          {/* Provider count badge */}
          <div className="flex items-center justify-center gap-3">
            <Badge 
              variant="secondary" 
              className="text-xs bg-gradient-to-r from-orange-50 to-orange-100 text-orange-700 border border-orange-200 group-hover:from-orange-100 group-hover:to-orange-200 transition-all duration-300 px-3 py-1"
            >
              {providerCount} proveedores
            </Badge>
            <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-orange-500 group-hover:translate-x-2 transition-all duration-500" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
