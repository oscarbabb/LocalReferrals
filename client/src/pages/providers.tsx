import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import ProviderCard from "@/components/provider-card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Search, Filter, MapPin } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import type { ServiceCategory } from "@shared/schema";
import { useLanguage } from "@/hooks/use-language";
import { getCategoryLabel } from "@/lib/serviceTranslations";
import { useAuth } from "@/hooks/useAuth";
import DisclaimerDialog from "@/components/disclaimer-dialog";

export default function Providers() {
  const { t, language } = useLanguage();
  const { user, isAuthenticated } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("rating");
  const [radiusKm, setRadiusKm] = useState<number>(100); // Default 100km (no filter)
  const [disclaimerOpen, setDisclaimerOpen] = useState(false);

  // Show disclaimer if user is authenticated and hasn't accepted it
  useEffect(() => {
    if (isAuthenticated && user && !(user as any).disclaimerAccepted) {
      setDisclaimerOpen(true);
    }
  }, [isAuthenticated, user]);

  const { data: categories = [] } = useQuery<ServiceCategory[]>({
    queryKey: ["/api/categories"],
  });

  const { data: providers = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/providers"],
  });

  const categoriesMap = useMemo(() => {
    return categories.reduce((acc, category) => {
      acc[category.id] = getCategoryLabel(category.id, language, category.name);
      return acc;
    }, {} as Record<string, string>);
  }, [categories, language]);

  const filteredAndSortedProviders = useMemo(() => {
    let filtered = providers.filter((provider: any) => {
      const matchesSearch = 
        provider.user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        provider.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        provider.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !selectedCategory || selectedCategory === "all" || provider.categoryId === selectedCategory;
      
      // Filter by radius: show providers whose service radius is >= selected radius
      // (they can deliver services at least that far)
      const matchesRadius = radiusKm === 100 || (provider.serviceRadiusKm && provider.serviceRadiusKm >= radiusKm);
      
      return matchesSearch && matchesCategory && matchesRadius;
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
  }, [providers, searchTerm, selectedCategory, sortBy, radiusKm]);

  if (isLoading) {
    return (
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
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {t('providers.page.title')}
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            {t('providers.page.subtitle')}
          </p>

          {/* Search and Filter Bar */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder={t('providers.searchPlaceholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  data-testid="input-search-providers"
                />
              </div>
              
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger data-testid="select-category">
                  <SelectValue placeholder={t('providers.filter.categoryPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('providers.filter.allCategories')}</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {getCategoryLabel(category.id, language, category.name)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger data-testid="select-sort">
                  <SelectValue placeholder={t('providers.sort.placeholder')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rating">{t('providers.sort.byRating')}</SelectItem>
                  <SelectItem value="reviews">{t('providers.sort.byReviews')}</SelectItem>
                  <SelectItem value="price-low">{t('providers.sort.priceLowHigh')}</SelectItem>
                  <SelectItem value="price-high">{t('providers.sort.priceHighLow')}</SelectItem>
                  <SelectItem value="name">{t('providers.sort.byName')}</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center space-x-2">
                <Filter className="w-5 h-5 text-gray-400" />
                <Badge variant="secondary" data-testid="badge-results-count">
                  {filteredAndSortedProviders.length} {t('providers.results.available')}
                </Badge>
              </div>
            </div>

            {/* Radius Filter */}
            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-gray-600" />
                  <label className="text-sm font-medium text-gray-700">
                    {t('providers.filter.radiusLabel')}
                  </label>
                </div>
                <Badge variant="outline" data-testid="badge-radius-value">
                  {radiusKm === 100 ? t('providers.filter.anyDistance') : `${radiusKm} km`}
                </Badge>
              </div>
              <Slider
                value={[radiusKm]}
                onValueChange={(value) => setRadiusKm(value[0])}
                min={1}
                max={100}
                step={1}
                className="w-full"
                data-testid="slider-radius"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>1 km</span>
                <span>100 km ({t('providers.filter.anyDistance')})</span>
              </div>
            </div>
          </div>
        </div>

        {filteredAndSortedProviders.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600">
              {t('providers.noResults')}
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

        {/* Disclaimer Dialog */}
        {(isAuthenticated && user && (
          <DisclaimerDialog
            open={disclaimerOpen}
            onAccept={() => setDisclaimerOpen(false)}
            userId={(user as any).id}
          />
        )) as React.ReactNode}
      </div>
  );
}
