import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import ServiceCard from "@/components/service-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Search, Plus, Check, ChevronsUpDown } from "lucide-react";
import { useState, useMemo } from "react";
import type { ServiceCategory } from "@shared/schema";
import { useLanguage } from "@/hooks/use-language";
import { getCategoryLabel, getSubcategoryLabel, categoryMatchesSearch } from "@/lib/serviceTranslations";
import { RequestCategoryDialog } from "@/components/request-category-dialog";
import Footer from "@/components/footer";
import { cn } from "@/lib/utils";

export default function Services() {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<{ type: 'category' | 'subcategory', id: string } | null>(null);
  const [comboboxOpen, setComboboxOpen] = useState(false);
  const [requestDialogOpen, setRequestDialogOpen] = useState(false);
  const { t, language } = useLanguage();

  const { data: categories = [], isLoading } = useQuery<ServiceCategory[]>({
    queryKey: ["/api/categories"],
  });

  const { data: subcategories = [] } = useQuery<any[]>({
    queryKey: ["/api/subcategories"],
  });

  const { data: providers = [] } = useQuery<any[]>({
    queryKey: ["/api/providers"],
  });

  // Get provider counts by category
  const providerCounts = providers.reduce((acc: Record<string, number>, provider: any) => {
    acc[provider.categoryId] = (acc[provider.categoryId] || 0) + 1;
    return acc;
  }, {});

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

  const filteredCategories = categories.filter(category => {
    const matchesSearch = categoryMatchesSearch(category.id, searchTerm) ||
                         (category.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filter by selected category or subcategory
    let matchesFilter = true;
    if (selectedFilter) {
      if (selectedFilter.type === 'category') {
        matchesFilter = category.id === selectedFilter.id;
      } else if (selectedFilter.type === 'subcategory') {
        // Show category if it contains the selected subcategory
        const subcategory = subcategories.find(s => s.id === selectedFilter.id);
        matchesFilter = subcategory ? category.id === subcategory.categoryId : false;
      }
    }
    
    return matchesSearch && matchesFilter;
  });

  if (isLoading) {
    return (
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
    );
  }

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 animate-slide-up">
            {t('services.pageTitle')}
          </h1>
          <p className="text-xl text-gray-600 mb-4 animate-fade-in">
            {t('services.pageDescription')}
          </p>

          {/* Category & Subcategory Counters and Request Button */}
          <div className="flex items-center justify-center gap-4 mb-8 flex-wrap">
            <div className="text-sm font-medium text-gray-600 px-4 py-2 bg-gray-100 rounded-full" data-testid="text-category-count">
              {categories.length} {t('services.categoriesAvailable')}
            </div>
            <div className="text-sm font-medium text-gray-600 px-4 py-2 bg-gray-100 rounded-full" data-testid="text-subcategory-count">
              {subcategories.length} {t('services.subcategoriesAvailable')}
            </div>
            <Button
              onClick={() => setRequestDialogOpen(true)}
              variant="outline"
              size="sm"
              className="gap-2 hover:bg-primary hover:text-white transition-colors"
              data-testid="button-request-category"
            >
              <Plus className="w-4 h-4" />
              {t('services.requestCategory')}
            </Button>
          </div>

          {/* Search and Filter */}
          <div className="max-w-2xl mx-auto mb-8 space-y-4 animate-slide-up">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-primary transition-colors" />
              <Input
                type="text"
                placeholder={t('services.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 py-3 text-lg transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary hover:border-gray-300"
                data-testid="input-search-services"
              />
            </div>
            
            {/* Autocomplete Combobox for Categories and Subcategories */}
            <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={comboboxOpen}
                  className="w-full justify-between py-6 text-lg transition-all duration-300 hover:border-gray-300 focus:ring-2 focus:ring-primary/20"
                  data-testid="button-category-combobox"
                >
                  {selectedLabel || t('services.filterPlaceholder')}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full max-w-2xl p-0" align="center" sideOffset={8}>
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
          </div>
        </div>

        {filteredCategories.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600">
              {t('services.noResults')}
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

      <RequestCategoryDialog
        open={requestDialogOpen}
        onOpenChange={setRequestDialogOpen}
        categories={categories.map(cat => ({
          id: cat.id,
          name: getCategoryLabel(cat.id, language, cat.name)
        }))}
      />
      </div>
      
      {/* Footer */}
      <Footer />
    </>
  );
}
