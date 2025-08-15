import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import Header from "@/components/header";
import ServiceCard from "@/components/service-card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";
import { useState } from "react";
import type { ServiceCategory } from "@shared/schema";

export default function Services() {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  const { data: categories = [], isLoading } = useQuery<ServiceCategory[]>({
    queryKey: ["/api/categories"],
  });

  const { data: providers = [] } = useQuery<any[]>({
    queryKey: ["/api/providers"],
  });

  // Get provider counts by category
  const providerCounts = providers.reduce((acc: Record<string, number>, provider: any) => {
    acc[provider.categoryId] = (acc[provider.categoryId] || 0) + 1;
    return acc;
  }, {});

  const filteredCategories = categories.filter(category => {
    const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         category.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || selectedCategory === "all" || category.id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-6 pulse-gentle stagger-item">
                <div className="w-12 h-12 skeleton rounded-lg mx-auto mb-4"></div>
                <div className="h-4 skeleton rounded mb-2"></div>
                <div className="h-3 skeleton rounded mb-3"></div>
                <div className="h-3 skeleton rounded w-20 mx-auto"></div>
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
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 animate-slide-up">
            Categorías de Servicios
          </h1>
          <p className="text-xl text-gray-600 mb-8 animate-fade-in">
            Encuentra exactamente lo que necesitas
          </p>

          {/* Search and Filter */}
          <div className="max-w-2xl mx-auto mb-8 space-y-4 animate-slide-up">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-primary transition-colors" />
              <Input
                type="text"
                placeholder="Buscar servicios..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 py-3 text-lg transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary hover:border-gray-300"
                data-testid="input-search-services"
              />
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full transition-all duration-300 hover:border-gray-300 focus:ring-2 focus:ring-primary/20" data-testid="select-category-filter">
                <SelectValue placeholder="Filtrar por categoría" />
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
          </div>
        </div>

        {filteredCategories.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600">
              No se encontraron servicios que coincidan con tu búsqueda.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredCategories.map((category, index) => (
              <div key={category.id} className="stagger-item">
                <ServiceCard 
                  category={category} 
                  providerCount={providerCounts[category.id] || 0}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
