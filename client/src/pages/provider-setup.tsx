import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/use-language";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ObjectUploader } from "@/components/ObjectUploader";
import { Briefcase, DollarSign, Star, Clock, Camera, User, Menu, FileText, Timer, Plus, X, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import type { ServiceCategory, ServiceSubcategory } from "@shared/schema";
import type { UploadResult } from "@uppy/core";
import { getCategoryLabel, getSubcategoryLabel } from "@/lib/serviceTranslations";

// Provider setup form schema with conditional payment method fields
const providerSetupSchema = (t: any) => z.object({
  title: z.string().min(3, t('providerSetup.validation.titleMin')),
  description: z.string().min(20, t('providerSetup.validation.descriptionMin')),
  experience: z.string().min(10, t('providerSetup.validation.experienceMin')),
  serviceRadiusKm: z.preprocess(
    (val) => {
      if (val === "" || val === null || val === undefined) return undefined;
      const num = Number(val);
      return isNaN(num) ? undefined : num;
    },
    z.number().int().min(1, t('providerSetup.validation.radiusMin')).max(100, t('providerSetup.validation.radiusMax')).optional()
  ),
  
  // Payment method selection
  paymentType: z.enum(["hourly", "fixed_job", "menu_based", "per_event"], {
    required_error: t('providerSetup.validation.paymentMethodRequired')
  }),
  
  // Hourly payment fields
  hourlyRate: z.coerce.number().positive(t('providerSetup.validation.ratePositive')).optional(),
  minimumHours: z.coerce.number().positive(t('providerSetup.validation.minimumHoursPositive')).optional(),
  
  // Fixed job payment fields
  fixedJobRate: z.coerce.number().positive(t('providerSetup.validation.pricePositive')).optional(),
  jobDescription: z.string().optional(),
  estimatedDuration: z.coerce.number().positive(t('providerSetup.validation.durationPositive')).optional(),
  
  // Per-event payment fields
  eventRate: z.coerce.number().positive(t('providerSetup.validation.eventPricePositive')).optional(),
  eventDescription: z.string().optional(),
}).refine((data) => {
  // Validate hourly payment fields when paymentType is hourly
  if (data.paymentType === "hourly") {
    return data.hourlyRate && data.hourlyRate > 0 && data.minimumHours && data.minimumHours > 0;
  }
  return true;
}, {
  message: t('providerSetup.validation.hourlyRequired'),
  path: ["hourlyRate"]
}).refine((data) => {
  // Validate fixed job payment fields when paymentType is fixed_job
  if (data.paymentType === "fixed_job") {
    return data.fixedJobRate && data.fixedJobRate > 0 && data.estimatedDuration && data.estimatedDuration > 0 && data.jobDescription && data.jobDescription.length >= 10;
  }
  return true;
}, {
  message: t('providerSetup.validation.fixedJobRequired'),
  path: ["fixedJobRate"]
}).refine((data) => {
  // Validate per-event payment fields when paymentType is per_event
  if (data.paymentType === "per_event") {
    return data.eventRate && data.eventRate > 0 && data.eventDescription && data.eventDescription.length >= 10 && data.estimatedDuration && data.estimatedDuration > 0;
  }
  return true;
}, {
  message: t('providerSetup.validation.eventRequired'),
  path: ["eventRate"]
});

type ProviderSetupForm = z.infer<ReturnType<typeof providerSetupSchema>>;

// Type for selected categories
type SelectedCategory = {
  categoryId: string;
  subcategoryId?: string;
  isPrimary: boolean;
};

export default function ProviderSetup() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { t, language } = useLanguage();
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [isUploadingPicture, setIsUploadingPicture] = useState(false);
  
  // State for managing selected categories
  const [selectedCategories, setSelectedCategories] = useState<SelectedCategory[]>([]);
  const [tempCategoryId, setTempCategoryId] = useState<string>("");
  const [tempSubcategoryIds, setTempSubcategoryIds] = useState<string[]>([]);

  // Get provider setup token from session storage (set during registration)
  const providerSetupToken = sessionStorage.getItem('providerSetupToken');

  // ALL HOOKS MUST BE CALLED BEFORE ANY EARLY RETURN (Rules of Hooks)
  const { data: categories = [] } = useQuery<ServiceCategory[]>({
    queryKey: ["/api/categories"],
    enabled: !!providerSetupToken, // Only fetch if we have a token
  });

  // Fetch subcategories for temporary selection
  const { data: tempSubcategories = [], isLoading: tempSubcategoriesLoading } = useQuery<ServiceSubcategory[]>({
    queryKey: [`/api/categories/${tempCategoryId}/subcategories`],
    enabled: !!tempCategoryId && !!providerSetupToken, // Only fetch if we have a token and categoryId
  });
  
  // Redirect to auth if no setup token (using useEffect to avoid render-time side effects)
  useEffect(() => {
    if (!providerSetupToken) {
      setLocation('/auth');
    }
  }, [providerSetupToken, setLocation]);
  
  // IMPORTANT: Early return must come AFTER all hooks are defined
  if (!providerSetupToken) {
    return null;
  }

  // Profile picture upload functions
  const handleProfilePictureUpload = async () => {
    const response = await apiRequest("POST", "/api/objects/upload");
    const data = await response.json();
    return {
      method: "PUT" as const,
      url: data.uploadURL as string,
    };
  };

  const handleProfilePictureComplete = async (result: UploadResult<Record<string, unknown>, Record<string, unknown>>) => {
    if (result.successful && result.successful.length > 0) {
      setIsUploadingPicture(true);
      try {
        const uploadedFile = result.successful[0];
        const photoURL = uploadedFile.uploadURL as string;
        
        // Make the uploaded photo public and get the display URL
        const response = await apiRequest("PUT", "/api/profile-photos", {
          photoURL: photoURL,
          providerSetupToken: providerSetupToken
        });
        const data = await response.json();
        
        // Use the public objectPath for display
        setProfilePicture(data.objectPath);
        
        toast({
          title: t('providerSetup.toast.photoSuccess.title'),
          description: t('providerSetup.toast.photoSuccess.description'),
        });
      } catch (error) {
        console.error("Error processing profile picture:", error);
        toast({
          title: t('providerSetup.toast.photoError.title'),
          description: t('providerSetup.toast.photoError.description'),
          variant: "destructive",
        });
      } finally {
        setIsUploadingPicture(false);
      }
    }
  };

  const form = useForm<ProviderSetupForm>({
    resolver: zodResolver(providerSetupSchema(t)),
    defaultValues: {
      title: "",
      description: "",
      experience: "",
      paymentType: "hourly",
      hourlyRate: undefined,
      minimumHours: undefined,
      fixedJobRate: undefined,
      jobDescription: "",
      estimatedDuration: undefined,
      eventRate: undefined,
      eventDescription: ""
    }
  });
  
  // Watch payment type
  const selectedPaymentType = form.watch("paymentType");

  // Add category to selected list
  const handleAddCategory = () => {
    if (!tempCategoryId) {
      toast({
        title: t('providerSetup.toast.categorySelectError.title'),
        description: t('providerSetup.toast.categorySelectError.description'),
        variant: "destructive",
      });
      return;
    }

    // If no subcategories selected, add category only
    if (tempSubcategoryIds.length === 0) {
      const exists = selectedCategories.some(
        cat => cat.categoryId === tempCategoryId && !cat.subcategoryId
      );

      if (exists) {
        toast({
          title: t('providerSetup.toast.categoryExists.title'),
          description: t('providerSetup.toast.categoryExists.description'),
          variant: "destructive",
        });
        return;
      }

      const newCategory: SelectedCategory = {
        categoryId: tempCategoryId,
        subcategoryId: undefined,
        isPrimary: selectedCategories.length === 0
      };

      setSelectedCategories([...selectedCategories, newCategory]);
    } else {
      // Add one entry for EACH selected subcategory
      const newCategories: SelectedCategory[] = [];
      
      for (const subcategoryId of tempSubcategoryIds) {
        // Check if this combination already exists
        const exists = selectedCategories.some(
          cat => cat.categoryId === tempCategoryId && cat.subcategoryId === subcategoryId
        );

        if (!exists) {
          newCategories.push({
            categoryId: tempCategoryId,
            subcategoryId: subcategoryId,
            isPrimary: selectedCategories.length === 0 && newCategories.length === 0
          });
        }
      }

      if (newCategories.length === 0) {
        toast({
          title: t('providerSetup.toast.categoryExists.title'),
          description: "Todas las subcategorías seleccionadas ya están agregadas.",
          variant: "destructive",
        });
        return;
      }

      setSelectedCategories([...selectedCategories, ...newCategories]);
    }

    // Reset temp selections
    setTempCategoryId("");
    setTempSubcategoryIds([]);
    
    toast({
      title: t('providerSetup.toast.categoryAdded.title'),
      description: tempSubcategoryIds.length > 0 
        ? `Se agregaron ${tempSubcategoryIds.length} subcategorías`
        : t('providerSetup.toast.categoryAdded.description'),
    });
  };

  // Remove category from selected list
  const handleRemoveCategory = (index: number) => {
    const newCategories = selectedCategories.filter((_, i) => i !== index);
    
    // If we removed the primary category, make the first remaining one primary
    if (selectedCategories[index].isPrimary && newCategories.length > 0) {
      newCategories[0].isPrimary = true;
    }
    
    setSelectedCategories(newCategories);
  };

  // Toggle primary status
  const handleTogglePrimary = (index: number) => {
    const newCategories = selectedCategories.map((cat, i) => ({
      ...cat,
      isPrimary: i === index // Only the selected one is primary
    }));
    setSelectedCategories(newCategories);
  };

  // Get category name by ID
  const getCategoryName = (categoryId: string) => {
    return categories.find(c => c.id === categoryId)?.name || t('providerSetup.categories.emptyState');
  };

  const createProviderMutation = useMutation({
    mutationFn: async (providerData: ProviderSetupForm) => {
      // Validate that at least one category is selected
      if (selectedCategories.length === 0) {
        console.error("Provider setup validation failed: No categories selected");
        throw new Error(t('providerSetup.validation.categoryRequired'));
      }

      // Find the primary category (for backwards compatibility with single category fields)
      const primaryCategory = selectedCategories.find(c => c.isPrimary) || selectedCategories[0];

      // Create provider with essential fields
      const response = await apiRequest("POST", "/api/providers", {
        categoryId: primaryCategory.categoryId,
        subcategoryId: primaryCategory.subcategoryId || null,
        title: providerData.title,
        description: providerData.description,
        experience: providerData.experience,
        profilePicture: profilePicture,
        providerSetupToken: providerSetupToken,
        categories: selectedCategories // Send all categories
      });
      const createdProvider = await response.json();
      
      // Create payment method based on selected type
      const paymentMethodData: any = {
        paymentType: providerData.paymentType,
        isActive: true,
        requiresDeposit: false,
        depositPercentage: 0
      };
      
      if (providerData.paymentType === "hourly") {
        paymentMethodData.hourlyRate = providerData.hourlyRate ? parseFloat(String(providerData.hourlyRate)) : undefined;
        paymentMethodData.minimumHours = providerData.minimumHours ? parseFloat(String(providerData.minimumHours)) : undefined;
      } else if (providerData.paymentType === "fixed_job") {
        paymentMethodData.fixedJobRate = providerData.fixedJobRate ? parseFloat(String(providerData.fixedJobRate)) : undefined;
        paymentMethodData.jobDescription = providerData.jobDescription;
        paymentMethodData.estimatedDuration = providerData.estimatedDuration ? parseFloat(String(providerData.estimatedDuration)) : undefined;
      } else if (providerData.paymentType === "per_event") {
        paymentMethodData.eventRate = providerData.eventRate ? parseFloat(String(providerData.eventRate)) : undefined;
        paymentMethodData.eventDescription = providerData.eventDescription;
        paymentMethodData.estimatedDuration = providerData.estimatedDuration ? parseFloat(String(providerData.estimatedDuration)) : undefined;
      }
      
      // Create payment method
      await apiRequest("POST", `/api/providers/${createdProvider.id}/payment-methods`, paymentMethodData);
      
      return createdProvider;
    },
    onSuccess: async (createdProvider) => {
      const paymentTypeKey = `providerSetup.paymentType.${form.getValues().paymentType.replace('_', '')}` as const;
      const descriptionKey = `providerSetup.toast.success.description${form.getValues().paymentType === 'hourly' ? 'Hourly' : form.getValues().paymentType === 'fixed_job' ? 'FixedJob' : form.getValues().paymentType === 'menu_based' ? 'Menu' : 'Event'}` as const;
      
      let description = t(descriptionKey);
      
      // Add confirmation if profile picture was uploaded
      if (profilePicture && createdProvider.profilePhotoPath) {
        description += " " + t('providerSetup.toast.success.photoConfirmation');
      }
      
      toast({
        title: t('providerSetup.toast.success.title'),
        description: description,
      });
      
      // Invalidate providers cache to refresh listings
      queryClient.invalidateQueries({ queryKey: ["/api/providers"] });
      
      // Clear the provider setup token from session storage
      sessionStorage.removeItem('providerSetupToken');
      
      // Redirect to home or provider dashboard
      setLocation("/");
    },
    onError: (error: any) => {
      console.error("Provider setup error:", error);
      toast({
        title: t('providerSetup.toast.error.title'),
        description: error.message || t('providerSetup.toast.error.description'),
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ProviderSetupForm) => {
    createProviderMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-orange-100 p-3 rounded-full">
              <Briefcase className="w-8 h-8 text-orange-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t('providerSetup.title')}
          </h1>
          <p className="text-gray-600">
            {t('providerSetup.subtitle')}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Star className="w-5 h-5 text-orange-600" />
              <span>{t('providerSetup.infoCard.title')}</span>
            </CardTitle>
            <CardDescription>
              {t('providerSetup.infoCard.subtitle')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Multiple Categories Section */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-base font-medium text-gray-900 mb-1">{t('providerSetup.categories.title')}</h3>
                    <p className="text-sm text-gray-600">
                      {t('providerSetup.categories.description')}
                    </p>
                  </div>

                  {/* Category Selection Form */}
                  <div className="border rounded-lg p-4 bg-gray-50 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="temp-category" className="text-sm font-medium">{t('providerSetup.categories.categoryLabel')}</Label>
                        <Select 
                          value={tempCategoryId}
                          onValueChange={(value) => {
                            setTempCategoryId(value);
                            setTempSubcategoryIds([]); // Reset subcategories array when category changes
                          }}
                        >
                          <SelectTrigger id="temp-category" data-testid="select-category">
                            <SelectValue placeholder={t('providerSetup.categories.selectCategory')} />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                <div className="flex items-center space-x-2">
                                  <span>{category.icon}</span>
                                  <span>{getCategoryLabel(category.id, language, category.name)}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {tempCategoryId && tempSubcategories.length > 0 && (
                        <div>
                          <Label className="text-sm font-medium">Subcategorías (selecciona todas las que apliquen)</Label>
                          <div className="space-y-2 max-h-[300px] overflow-y-auto border rounded-md p-3">
                            {tempSubcategoriesLoading ? (
                              <div className="p-4 text-center text-sm text-gray-500">
                                {t('providerSetup.categories.loadingSubcategories')}
                              </div>
                            ) : (
                              tempSubcategories.map((subcategory) => (
                                <div key={subcategory.id} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`subcategory-${subcategory.id}`}
                                    checked={tempSubcategoryIds.includes(subcategory.id)}
                                    onCheckedChange={(checked) => {
                                      if (checked) {
                                        setTempSubcategoryIds([...tempSubcategoryIds, subcategory.id]);
                                      } else {
                                        setTempSubcategoryIds(tempSubcategoryIds.filter(id => id !== subcategory.id));
                                      }
                                    }}
                                    data-testid={`checkbox-subcategory-${subcategory.id}`}
                                  />
                                  <Label htmlFor={`subcategory-${subcategory.id}`} className="cursor-pointer">
                                    {getSubcategoryLabel(subcategory.id, language, subcategory.name)}
                                  </Label>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <Button
                      type="button"
                      onClick={handleAddCategory}
                      variant="outline"
                      className="w-full"
                      data-testid="button-add-category"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      {t('providerSetup.categories.addButton')}
                    </Button>
                  </div>

                  {/* Selected Categories Display */}
                  {selectedCategories.length > 0 ? (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">{t('providerSetup.categories.selectedCount')} ({selectedCategories.length})</Label>
                      <div className="space-y-2">
                        {selectedCategories.map((category, index) => {
                          const categoryName = getCategoryName(category.categoryId);
                          const categoryObj = categories.find(c => c.id === category.categoryId);
                          
                          return (
                            <Card 
                              key={index} 
                              className="border-l-4 border-l-orange-500"
                              data-testid={`card-service-${index}`}
                            >
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1 space-y-2">
                                    <div className="flex items-center space-x-2">
                                      <span className="text-lg">{categoryObj?.icon}</span>
                                      <div>
                                        <p className="font-semibold text-gray-900">{categoryName}</p>
                                        {category.subcategoryId && (
                                          <p className="text-sm text-gray-600">
                                            {tempSubcategories.find(s => s.id === category.subcategoryId)?.name || "Subcategoría"}
                                          </p>
                                        )}
                                      </div>
                                      {category.isPrimary && (
                                        <Badge variant="default" className="bg-orange-600">
                                          <Check className="w-3 h-3 mr-1" />
                                          {t('providerSetup.categories.primaryBadge')}
                                        </Badge>
                                      )}
                                    </div>
                                    
                                    <div className="flex items-center space-x-2">
                                      <Checkbox
                                        id={`primary-${index}`}
                                        checked={category.isPrimary}
                                        onCheckedChange={() => handleTogglePrimary(index)}
                                        data-testid={`checkbox-primary-${index}`}
                                      />
                                      <Label 
                                        htmlFor={`primary-${index}`}
                                        className="text-sm text-gray-600 cursor-pointer"
                                      >
                                        {t('providerSetup.categories.markAsPrimary')}
                                      </Label>
                                    </div>
                                  </div>
                                  
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleRemoveCategory(index)}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                    data-testid={`button-remove-service-${index}`}
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">
                        {t('providerSetup.categories.emptyHelp')}
                      </p>
                    </div>
                  )}

                  {selectedCategories.length === 0 && (
                    <p className="text-sm text-red-600">
                      * {t('providerSetup.validation.categoryRequired')}
                    </p>
                  )}
                </div>

                {/* Profile Picture Upload */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">{t('providerSetup.photo.title')}</Label>
                  <div className="flex flex-col space-y-3">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        {profilePicture ? (
                          <div className="relative">
                            <img 
                              src={profilePicture} 
                              alt="Profile preview" 
                              className="w-16 h-16 rounded-full object-cover border-2 border-orange-200"
                              data-testid="img-profile-preview"
                            />
                            <div className="absolute -top-1 -right-1 bg-green-100 rounded-full p-1">
                              <User className="w-3 h-3 text-green-600" />
                            </div>
                          </div>
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
                            <Camera className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <ObjectUploader
                          maxNumberOfFiles={1}
                          maxFileSize={5 * 1024 * 1024}
                          allowedFileTypes={['.jpg', '.jpeg', '.png']}
                          onGetUploadParameters={handleProfilePictureUpload}
                          onComplete={handleProfilePictureComplete}
                          buttonClassName="bg-orange-600 hover:bg-orange-700 text-white"
                        >
                          <Camera className="w-4 h-4 mr-2" />
                          {t('providerSetup.photo.uploadButton')}
                        </ObjectUploader>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500">
                      {t('providerSetup.photo.description')}
                    </p>
                    {isUploadingPicture && (
                      <p className="text-sm text-orange-600">{t('providerSetup.photo.uploading')}</p>
                    )}
                  </div>
                </div>

                {/* Service Title */}
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('providerSetup.form.titleLabel')}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t('providerSetup.form.titlePlaceholder')}
                          {...field}
                          data-testid="input-title"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Description */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('providerSetup.form.descriptionLabel')}</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={t('providerSetup.form.descriptionPlaceholder')}
                          className="min-h-[120px]"
                          {...field}
                          data-testid="textarea-description"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Payment Method Selection */}
                <FormField
                  control={form.control}
                  name="paymentType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-medium">{t('providerSetup.form.paymentMethodLabel')}</FormLabel>
                      <FormControl>
                        <div className="grid grid-cols-1 gap-4 mt-3">
                          {/* Hourly Payment Option */}
                          <div className="relative">
                            <input
                              type="radio"
                              id="hourly"
                              value="hourly"
                              checked={field.value === "hourly"}
                              onChange={() => field.onChange("hourly")}
                              className="sr-only"
                              data-testid="radio-payment-hourly"
                            />
                            <label
                              htmlFor="hourly"
                              className={`block cursor-pointer rounded-lg border-2 p-4 transition-colors ${
                                field.value === "hourly"
                                  ? "border-orange-500 bg-orange-50"
                                  : "border-gray-200 hover:border-gray-300"
                              }`}
                            >
                              <div className="flex items-start space-x-3">
                                <div className={`flex-shrink-0 p-2 rounded-lg ${
                                  field.value === "hourly" ? "bg-orange-100" : "bg-gray-100"
                                }`}>
                                  <Clock className={`w-5 h-5 ${
                                    field.value === "hourly" ? "text-orange-600" : "text-gray-600"
                                  }`} />
                                </div>
                                <div className="flex-1">
                                  <h3 className="font-medium text-gray-900">{t('providerSetup.payment.hourly.title')}</h3>
                                  <p className="text-sm text-gray-600 mt-1">
                                    {t('providerSetup.payment.hourly.description')}
                                  </p>
                                </div>
                              </div>
                            </label>
                          </div>

                          {/* Fixed Job Payment Option */}
                          <div className="relative">
                            <input
                              type="radio"
                              id="fixed_job"
                              value="fixed_job"
                              checked={field.value === "fixed_job"}
                              onChange={() => field.onChange("fixed_job")}
                              className="sr-only"
                              data-testid="radio-payment-fixed"
                            />
                            <label
                              htmlFor="fixed_job"
                              className={`block cursor-pointer rounded-lg border-2 p-4 transition-colors ${
                                field.value === "fixed_job"
                                  ? "border-orange-500 bg-orange-50"
                                  : "border-gray-200 hover:border-gray-300"
                              }`}
                            >
                              <div className="flex items-start space-x-3">
                                <div className={`flex-shrink-0 p-2 rounded-lg ${
                                  field.value === "fixed_job" ? "bg-orange-100" : "bg-gray-100"
                                }`}>
                                  <FileText className={`w-5 h-5 ${
                                    field.value === "fixed_job" ? "text-orange-600" : "text-gray-600"
                                  }`} />
                                </div>
                                <div className="flex-1">
                                  <h3 className="font-medium text-gray-900">{t('providerSetup.payment.fixedJob.title')}</h3>
                                  <p className="text-sm text-gray-600 mt-1">
                                    {t('providerSetup.payment.fixedJob.description')}
                                  </p>
                                </div>
                              </div>
                            </label>
                          </div>

                          {/* Menu-based Payment Option */}
                          <div className="relative">
                            <input
                              type="radio"
                              id="menu_based"
                              value="menu_based"
                              checked={field.value === "menu_based"}
                              onChange={() => field.onChange("menu_based")}
                              className="sr-only"
                              data-testid="radio-payment-menu"
                            />
                            <label
                              htmlFor="menu_based"
                              className={`block cursor-pointer rounded-lg border-2 p-4 transition-colors ${
                                field.value === "menu_based"
                                  ? "border-orange-500 bg-orange-50"
                                  : "border-gray-200 hover:border-gray-300"
                              }`}
                            >
                              <div className="flex items-start space-x-3">
                                <div className={`flex-shrink-0 p-2 rounded-lg ${
                                  field.value === "menu_based" ? "bg-orange-100" : "bg-gray-100"
                                }`}>
                                  <Menu className={`w-5 h-5 ${
                                    field.value === "menu_based" ? "text-orange-600" : "text-gray-600"
                                  }`} />
                                </div>
                                <div className="flex-1">
                                  <h3 className="font-medium text-gray-900">{t('providerSetup.payment.menu.title')}</h3>
                                  <p className="text-sm text-gray-600 mt-1">
                                    {t('providerSetup.payment.menu.description')}
                                  </p>
                                </div>
                              </div>
                            </label>
                          </div>

                          {/* Per-Event Payment Option */}
                          <div className="relative">
                            <input
                              type="radio"
                              id="per_event"
                              value="per_event"
                              checked={field.value === "per_event"}
                              onChange={() => field.onChange("per_event")}
                              className="sr-only"
                              data-testid="radio-payment-event"
                            />
                            <label
                              htmlFor="per_event"
                              className={`block cursor-pointer rounded-lg border-2 p-4 transition-colors ${
                                field.value === "per_event"
                                  ? "border-orange-500 bg-orange-50"
                                  : "border-gray-200 hover:border-gray-300"
                              }`}
                            >
                              <div className="flex items-start space-x-3">
                                <div className={`flex-shrink-0 p-2 rounded-lg ${
                                  field.value === "per_event" ? "bg-orange-100" : "bg-gray-100"
                                }`}>
                                  <Star className={`w-5 h-5 ${
                                    field.value === "per_event" ? "text-orange-600" : "text-gray-600"
                                  }`} />
                                </div>
                                <div className="flex-1">
                                  <h3 className="font-medium text-gray-900">{t('providerSetup.payment.event.title')}</h3>
                                  <p className="text-sm text-gray-600 mt-1">
                                    {t('providerSetup.payment.event.description')}
                                  </p>
                                </div>
                              </div>
                            </label>
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Conditional Payment Method Fields */}
                {selectedPaymentType === "hourly" && (
                  <div className="space-y-4 border rounded-lg p-4 bg-orange-50">
                    <h3 className="font-medium text-gray-900 flex items-center space-x-2">
                      <Clock className="w-5 h-5 text-orange-600" />
                      <span>{t('providerSetup.payment.hourly.title')}</span>
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="hourlyRate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center space-x-2">
                              <DollarSign className="w-4 h-4" />
                              <span>{t('providerSetup.payment.hourly.rateLabel')}</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="250"
                                {...field}
                                data-testid="input-hourly-rate"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="minimumHours"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center space-x-2">
                              <Timer className="w-4 h-4" />
                              <span>{t('providerSetup.payment.hourly.minimumLabel')}</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="2"
                                {...field}
                                data-testid="input-minimum-hours"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                )}
                
                {selectedPaymentType === "fixed_job" && (
                  <div className="space-y-4 border rounded-lg p-4 bg-blue-50">
                    <h3 className="font-medium text-gray-900 flex items-center space-x-2">
                      <FileText className="w-5 h-5 text-blue-600" />
                      <span>{t('providerSetup.payment.fixedJob.title')}</span>
                    </h3>
                    
                    <FormField
                      control={form.control}
                      name="fixedJobRate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center space-x-2">
                            <DollarSign className="w-4 h-4" />
                            <span>{t('providerSetup.payment.fixedJob.priceLabel')}</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="500"
                              {...field}
                              data-testid="input-fixed-job-rate"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="jobDescription"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('providerSetup.payment.fixedJob.jobDescriptionLabel')}</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder={t('providerSetup.form.descriptionPlaceholder')}
                              className="min-h-[80px]"
                              {...field}
                              data-testid="textarea-job-description"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="estimatedDuration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center space-x-2">
                            <Timer className="w-4 h-4" />
                            <span>{t('providerSetup.payment.fixedJob.durationLabel')}</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="2"
                              {...field}
                              data-testid="input-fixed-job-duration"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {selectedPaymentType === "menu_based" && (
                  <div className="space-y-4 border rounded-lg p-4 bg-green-50">
                    <h3 className="font-medium text-gray-900 flex items-center space-x-2">
                      <Menu className="w-5 h-5 text-green-600" />
                      <span>{t('providerSetup.payment.menu.title')}</span>
                    </h3>
                    <p className="text-sm text-gray-600">
                      {t('providerSetup.payment.menu.description')}
                    </p>
                  </div>
                )}
                
                {selectedPaymentType === "per_event" && (
                  <div className="space-y-4 border rounded-lg p-4 bg-purple-50">
                    <h3 className="font-medium text-gray-900 flex items-center space-x-2">
                      <Star className="w-5 h-5 text-purple-600" />
                      <span>{t('providerSetup.payment.event.title')}</span>
                    </h3>
                    
                    <FormField
                      control={form.control}
                      name="eventRate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center space-x-2">
                            <DollarSign className="w-4 h-4" />
                            <span>{t('providerSetup.payment.event.priceLabel')}</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="1500"
                              {...field}
                              data-testid="input-event-rate"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="eventDescription"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('providerSetup.payment.event.descriptionLabel')}</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder={t('providerSetup.form.descriptionPlaceholder')}
                              className="min-h-[80px]"
                              {...field}
                              data-testid="textarea-event-description"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="estimatedDuration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center space-x-2">
                            <Timer className="w-4 h-4" />
                            <span>{t('providerSetup.payment.fixedJob.durationLabel')}</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="240"
                              {...field}
                              data-testid="input-event-duration"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {/* Experience */}
                <FormField
                  control={form.control}
                  name="experience"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center space-x-2">
                        <Clock className="w-4 h-4" />
                        <span>{t('providerSetup.form.experienceLabel')}</span>
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={t('providerSetup.form.experiencePlaceholder')}
                          className="min-h-[100px]"
                          {...field}
                          data-testid="textarea-experience"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Service Radius */}
                <FormField
                  control={form.control}
                  name="serviceRadiusKm"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center space-x-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
                        <span>{t('providerSetup.form.radiusLabel')}</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="10"
                          min="1"
                          max="100"
                          {...field}
                          data-testid="input-service-radius"
                        />
                      </FormControl>
                      <p className="text-sm text-gray-600">
                        {t('providerSetup.form.radiusHelp')}
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="border-t pt-6">
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white"
                    disabled={createProviderMutation.isPending || selectedCategories.length === 0}
                    data-testid="button-create-provider"
                  >
                    {createProviderMutation.isPending ? (
                      t('providerSetup.submitting')
                    ) : (
                      t('providerSetup.submitButton')
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
