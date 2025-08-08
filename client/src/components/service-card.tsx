import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { 
  Sparkles, 
  Wrench, 
  GraduationCap, 
  Baby, 
  Utensils, 
  Laptop, 
  Scissors, 
  Activity,
  Home,
  ArrowRight
} from "lucide-react";
import type { ServiceCategory } from "@shared/schema";

interface ServiceCardProps {
  category: ServiceCategory;
  providerCount?: number;
}

const iconMap: Record<string, any> = {
  "fas fa-broom": Sparkles,
  "fas fa-tools": Wrench,
  "fas fa-graduation-cap": GraduationCap,
  "fas fa-baby": Baby,
  "fas fa-utensils": Utensils,
  "fas fa-laptop": Laptop,
  "fas fa-cut": Scissors,
  "fas fa-dumbbell": Activity,
};

const gradientMap: Record<string, string> = {
  blue: "from-blue-400 to-blue-600",
  green: "from-green-400 to-green-600", 
  amber: "from-amber-400 to-amber-600",
  purple: "from-purple-400 to-purple-600",
  red: "from-red-400 to-red-600",
  indigo: "from-indigo-400 to-indigo-600",
  pink: "from-pink-400 to-pink-600",
  teal: "from-teal-400 to-teal-600",
};

const hoverGradientMap: Record<string, string> = {
  blue: "group-hover:from-blue-500 group-hover:to-blue-700",
  green: "group-hover:from-green-500 group-hover:to-green-700",
  amber: "group-hover:from-amber-500 group-hover:to-amber-700", 
  purple: "group-hover:from-purple-500 group-hover:to-purple-700",
  red: "group-hover:from-red-500 group-hover:to-red-700",
  indigo: "group-hover:from-indigo-500 group-hover:to-indigo-700",
  pink: "group-hover:from-pink-500 group-hover:to-pink-700",
  teal: "group-hover:from-teal-500 group-hover:to-teal-700",
};

export default function ServiceCard({ category, providerCount = 0 }: ServiceCardProps) {
  const gradientClass = gradientMap[category.color] || "from-gray-400 to-gray-600";
  const hoverGradientClass = hoverGradientMap[category.color] || "group-hover:from-gray-500 group-hover:to-gray-700";
  const IconComponent = iconMap[category.icon] || Home;

  return (
    <Link href={`/services?category=${category.id}`}>
      <Card className="group h-full cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-0 shadow-md bg-white overflow-hidden">
        <CardContent className="p-6 text-center relative">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-orange-100 to-transparent rounded-bl-full opacity-50"></div>
          
          {/* Icon container with improved design */}
          <div className={`w-16 h-16 bg-gradient-to-br ${gradientClass} ${hoverGradientClass} rounded-xl flex items-center justify-center mb-5 mx-auto shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110`}>
            <IconComponent className="w-8 h-8 text-white" />
          </div>
          
          {/* Content */}
          <h3 className="text-lg font-bold text-gray-900 mb-3 group-hover:text-gray-800 transition-colors">
            {category.name}
          </h3>
          <p className="text-sm text-gray-600 mb-4 leading-relaxed min-h-[40px]">
            {category.description}
          </p>
          
          {/* Provider count badge */}
          <div className="flex items-center justify-center gap-2">
            <Badge 
              variant="secondary" 
              className="text-xs bg-orange-50 text-orange-700 border border-orange-200 group-hover:bg-orange-100 transition-colors"
            >
              {providerCount} proveedores
            </Badge>
            <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-orange-500 group-hover:translate-x-1 transition-all duration-300" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
