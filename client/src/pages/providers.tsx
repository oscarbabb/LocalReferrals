import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import ProviderCard from "@/components/provider-card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Search, Filter, MapPin, Check, ChevronsUpDown } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import type { ServiceCategory } from "@shared/schema";
import { useLanguage } from "@/hooks/use-language";
import { getCategoryLabel, getSubcategoryLabel } from "@/lib/serviceTranslations";
import { useAuth } from "@/hooks/useAuth";
import DisclaimerDialog from "@/components/disclaimer-dialog";
import { cn } from "@/lib/utils";

export default function Providers() {
  const { t, language } = useLanguage();
  const { user, isAuthenticated } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<{ type: 'category' | 'subcategory', id: string } | null>(null);
  const [comboboxOpen, setComboboxOpen] = useState(false);
  const [sortBy, setSortBy] = useState<string>("rating");
  const [radiusKm, setRadiusKm] = useState<number>(100); // Default 100km (no filter)
  const [disclaimerOpen, setDisclaimerOpen] = useState(false);

  // Read URL query parameters on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const categoryParam = params.get('category');
    const subcategoryParam = params.get('subcategory');
    
    if (categoryParam) {
      setSelectedFilter({ type: 'category', id: categoryParam });
    } else if (subcategoryParam) {
      setSelectedFilter({ type: 'subcategory', id: subcategoryParam });
    }
  }, []);

  // Show disclaimer if user is authenticated and hasn't accepted it
  useEffect(() => {
    if (isAuthenticated && user && !(user as any).disclaimerAccepted) {
      setDisclaimerOpen(true);
    }
  }, [isAuthenticated, user]);

  const { data: categories = [] } = useQuery<ServiceCategory[]>({
    queryKey: ["/api/categories"],
  });

  const { data: subcategories = [] } = useQuery<any[]>({
    queryKey: ["/api/subcategories"],
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

  // Build searchable options list
  const searchableOptions = useMemo(() => {
    const options: Array<{ type: 'category' | 'subcategory', id: string, categoryId?: string, label: string, searchText: string }> = [];
    
    // Add all categories
    categories.forEach(cat => {
      const label = getCategoryLabel(cat.id, language, cat.name);
      options.push({
        type: 'category',
        id: cat.id,
        label,
        searchText: `${label} ${cat.description || ''}`.toLowerCase(),
      });
    });

    // Add all subcategories
    subcategories.forEach(sub => {
      const label = getSubcategoryLabel(sub.id, language, sub.name);
      const category = categories.find(c => c.id === sub.categoryId);
      const categoryLabel = category ? getCategoryLabel(category.id, language, category.name) : '';
      options.push({
        type: 'subcategory',
        id: sub.id,
        categoryId: sub.categoryId,
        label,
        searchText: `${label} ${categoryLabel}`.toLowerCase(),
      });
    });

    return options;
  }, [categories, subcategories, language]);

  // Get the selected label for display
  const selectedLabel = useMemo(() => {
    if (!selectedFilter) return null;
    const option = searchableOptions.find(opt => opt.type === selectedFilter.type && opt.id === selectedFilter.id);
    return option?.label || null;
  }, [selectedFilter, searchableOptions]);

  const filteredAndSortedProviders = useMemo(() => {
    let filtered = providers.filter((provider: any) => {
      const matchesSearch = 
        provider.user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        provider.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        provider.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Filter by selected category or subcategory
      let matchesFilter = true;
      if (selectedFilter) {
        if (selectedFilter.type === 'category') {
          matchesFilter = provider.categoryId === selectedFilter.id;
        } else if (selectedFilter.type === 'subcategory') {
          matchesFilter = provider.subcategoryId === selectedFilter.id;
        }
      }
      
      // Filter by radius: show providers whose service radius is >= selected radius
      // (they can deliver services at least that far)
      const matchesRadius = radiusKm === 100 || (provider.serviceRadiusKm && provider.serviceRadiusKm >= radiusKm);
      
      return matchesSearch && matchesFilter && matchesRadius;
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
  }, [providers, searchTerm, selectedFilter, sortBy, radiusKm]);

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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              <div className="relative md:col-span-2 lg:col-span-1">
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
              
              {/* Autocomplete Combobox for Categories and Subcategories */}
              <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={comboboxOpen}
                    className="w-full justify-between"
                    data-testid="button-category-combobox"
                  >
                    {selectedLabel || t('providers.filter.categoryPlaceholder')}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full max-w-md p-0" align="center" sideOffset={8}>
                  <Command className="rounded-lg border shadow-md">
                    <CommandInput 
                      placeholder={t('services.searchCategoryPlaceholder')} 
                      data-testid="input-category-search"
                    />
                    <CommandList>
                      <CommandEmpty>{t('services.noResultsFound')}</CommandEmpty>
                      
                      {/* All Categories option */}
                      <CommandGroup heading={t('services.allCategories')}>
                        <CommandItem
                          value="all-categories"
                          onSelect={() => {
                            setSelectedFilter(null);
                            setComboboxOpen(false);
                          }}
                          data-testid="option-all-categories"
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              !selectedFilter ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {t('services.allCategories')}
                        </CommandItem>
                      </CommandGroup>

                      {/* Categories */}
                      <CommandGroup heading={t('services.categories')}>
                        {searchableOptions
                          .filter(opt => opt.type === 'category')
                          .map((option) => (
                            <CommandItem
                              key={option.id}
                              value={option.searchText}
                              onSelect={() => {
                                setSelectedFilter({ type: 'category', id: option.id });
                                setComboboxOpen(false);
                              }}
                              data-testid={`option-category-${option.id}`}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedFilter?.type === 'category' && selectedFilter?.id === option.id
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              {option.label}
                            </CommandItem>
                          ))}
                      </CommandGroup>

                      {/* Subcategories */}
                      <CommandGroup heading={t('services.subcategories')}>
                        {searchableOptions
                          .filter(opt => opt.type === 'subcategory')
                          .map((option) => {
                            const category = categories.find(c => c.id === option.categoryId);
                            const categoryLabel = category ? getCategoryLabel(category.id, language, category.name) : '';
                            return (
                              <CommandItem
                                key={option.id}
                                value={option.searchText}
                                onSelect={() => {
                                  setSelectedFilter({ type: 'subcategory', id: option.id });
                                  setComboboxOpen(false);
                                }}
                                data-testid={`option-subcategory-${option.id}`}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    selectedFilter?.type === 'subcategory' && selectedFilter?.id === option.id
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                <div className="flex flex-col">
                                  <span>{option.label}</span>
                                  <span className="text-xs text-muted-foreground">{categoryLabel}</span>
                                </div>
                              </CommandItem>
                            );
                          })}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>

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
