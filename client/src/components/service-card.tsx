import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import type { ServiceCategory } from "@shared/schema";

interface ServiceCardProps {
  category: ServiceCategory;
  providerCount?: number;
}

const iconMap: Record<string, string> = {
  "fas fa-broom": "🧹",
  "fas fa-tools": "🔧",
  "fas fa-graduation-cap": "🎓",
  "fas fa-baby": "👶",
  "fas fa-utensils": "🍽️",
  "fas fa-laptop": "💻",
  "fas fa-cut": "✂️",
  "fas fa-dumbbell": "💪",
};

const colorMap: Record<string, string> = {
  blue: "bg-blue-100 text-blue-600",
  green: "bg-green-100 text-green-600",
  amber: "bg-amber-100 text-amber-600",
  purple: "bg-purple-100 text-purple-600",
  red: "bg-red-100 text-red-600",
  indigo: "bg-indigo-100 text-indigo-600",
  pink: "bg-pink-100 text-pink-600",
  teal: "bg-teal-100 text-teal-600",
};

export default function ServiceCard({ category, providerCount = 0 }: ServiceCardProps) {
  const colorClass = colorMap[category.color] || "bg-gray-100 text-gray-600";
  const icon = iconMap[category.icon] || "🏠";

  return (
    <Link href={`/services?category=${category.id}`}>
      <Card className="h-full cursor-pointer hover:shadow-md transition-shadow">
        <CardContent className="p-6 text-center">
          <div className={`w-12 h-12 ${colorClass.split(' ')[0]} rounded-lg flex items-center justify-center mb-4 mx-auto`}>
            <span className="text-xl">{icon}</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{category.name}</h3>
          <p className="text-sm text-gray-600 mb-3">{category.description}</p>
          <Badge variant="secondary" className="text-xs">
            {providerCount} proveedores
          </Badge>
        </CardContent>
      </Card>
    </Link>
  );
}
