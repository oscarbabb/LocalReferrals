import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import Header from "@/components/header";
import ProviderCard from "@/components/provider-card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Filter } from "lucide-react";
import { useState, useMemo } from "react";
import type { ServiceCategory } from "@shared/schema";

export default function Providers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("rating");

  const { data: categories = [] } = useQuery<ServiceCategory[]>({
    queryKey: ["/api/categories"],
  });

  const { data: providers = [], isLoading } = useQuery({
    queryKey: ["/api/providers"],
  });

  const categoriesMap = useMemo(() => {
    return categories.reduce((acc, category) => {
      acc[category.id] = category.name;
      return acc;
    }, {} as Record<string, string>);
  }, [categories]);

  const filteredAndSortedProviders = useMemo(() => {
    let filtered = providers.filter((provider: any) => {
      const matchesSearch = 
        provider.user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        provider.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        provider.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !selectedCategory || selectedCategory === "all" || provider.categoryId === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    // Sort providers
    return filtered.sort((a: any, b: any) => {
      switch (sortBy) {
        case "rating":
          return (b.averageRating || 0) - (a.averageRating || 0);
        case "reviews":
          return (b.reviewCount || 0) - (a.reviewCount || 0);
        case "price-low":
          return parseFloat(a.hourlyRate || "0") - parseFloat(b.hourlyRate || "0");
        case "price-high":
          return parseFloat(b.hourlyRate || "0") - parseFloat(a.hourlyRate || "0");
        case "name":
          return a.user.fullName.localeCompare(b.user.fullName);
        default:
          return 0;
      }
    });
  }, [providers, searchTerm, selectedCategory, sortBy]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-6 animate-pulse">
                <div className="flex items-start space-x-4 mb-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-20"></div>
                  </div>
                </div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded mb-4"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Proveedores de Servicios
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Encuentra profesionales recomendados por tu comunidad
          </p>

          {/* Search and Filter Bar */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Buscar proveedores..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las categorías</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rating">Mejor calificación</SelectItem>
                  <SelectItem value="reviews">Más reseñas</SelectItem>
                  <SelectItem value="price-low">Precio: menor a mayor</SelectItem>
                  <SelectItem value="price-high">Precio: mayor a menor</SelectItem>
                  <SelectItem value="name">Nombre A-Z</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center space-x-2">
                <Filter className="w-5 h-5 text-gray-400" />
                <Badge variant="secondary">
                  {filteredAndSortedProviders.length} resultados
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {filteredAndSortedProviders.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600">
              No se encontraron proveedores que coincidan con tu búsqueda.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredAndSortedProviders.map((provider: any) => (
              <ProviderCard 
                key={provider.id} 
                provider={provider}
                categoryName={categoriesMap[provider.categoryId]}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
