import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
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

// Provider setup form schema with conditional payment method fields
const providerSetupSchema = z.object({
  title: z.string().min(3, "El título debe tener al menos 3 caracteres"),
  description: z.string().min(20, "La descripción debe tener al menos 20 caracteres"),
  experience: z.string().min(10, "Describe tu experiencia (mínimo 10 caracteres)"),
  serviceRadiusKm: z.preprocess(
    (val) => {
      if (val === "" || val === null || val === undefined) return undefined;
      const num = Number(val);
      return isNaN(num) ? undefined : num;
    },
    z.number().int().min(1, "El radio debe ser al menos 1 km").max(100, "El radio no puede exceder 100 km").optional()
  ),
  
  // Payment method selection
  paymentType: z.enum(["hourly", "fixed_job", "menu_based", "per_event"], {
    required_error: "Selecciona un método de pago"
  }),
  
  // Hourly payment fields
  hourlyRate: z.coerce.number().positive("La tarifa debe ser mayor a 0").optional(),
  minimumHours: z.coerce.number().positive("Las horas mínimas deben ser mayor a 0").optional(),
  
  // Fixed job payment fields
  fixedJobRate: z.coerce.number().positive("El precio debe ser mayor a 0").optional(),
  jobDescription: z.string().optional(),
  estimatedDuration: z.coerce.number().positive("La duración debe ser mayor a 0").optional(),
  
  // Per-event payment fields
  eventRate: z.coerce.number().positive("El precio del evento debe ser mayor a 0").optional(),
  eventDescription: z.string().optional(),
}).refine((data) => {
  // Validate hourly payment fields when paymentType is hourly
  if (data.paymentType === "hourly") {
    return data.hourlyRate && data.hourlyRate > 0 && data.minimumHours && data.minimumHours > 0;
  }
  return true;
}, {
  message: "Para pago por hora, ingresa una tarifa válida y horas mínimas",
  path: ["hourlyRate"]
}).refine((data) => {
  // Validate fixed job payment fields when paymentType is fixed_job
  if (data.paymentType === "fixed_job") {
    return data.fixedJobRate && data.fixedJobRate > 0 && data.estimatedDuration && data.estimatedDuration > 0 && data.jobDescription && data.jobDescription.length >= 10;
  }
  return true;
}, {
  message: "Para trabajo fijo, completa todos los campos requeridos",
  path: ["fixedJobRate"]
}).refine((data) => {
  // Validate per-event payment fields when paymentType is per_event
  if (data.paymentType === "per_event") {
    return data.eventRate && data.eventRate > 0 && data.eventDescription && data.eventDescription.length >= 10 && data.estimatedDuration && data.estimatedDuration > 0;
  }
  return true;
}, {
  message: "Para pago por evento, completa todos los campos requeridos",
  path: ["eventRate"]
});

type ProviderSetupForm = z.infer<typeof providerSetupSchema>;

// Type for selected categories
type SelectedCategory = {
  categoryId: string;
  subcategoryId?: string;
  isPrimary: boolean;
};

export default function ProviderSetup() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [isUploadingPicture, setIsUploadingPicture] = useState(false);
  
  // State for managing selected categories
  const [selectedCategories, setSelectedCategories] = useState<SelectedCategory[]>([]);
  const [tempCategoryId, setTempCategoryId] = useState<string>("");
  const [tempSubcategoryId, setTempSubcategoryId] = useState<string>("");

  // Get provider setup token from session storage (set during registration)
  const providerSetupToken = sessionStorage.getItem('providerSetupToken');
  
  // Redirect to auth if no setup token (using useEffect to avoid render-time side effects)
  useEffect(() => {
    if (!providerSetupToken) {
      setLocation('/auth');
    }
  }, [providerSetupToken, setLocation]);
  
  if (!providerSetupToken) {
    return null;
  }

  const { data: categories = [] } = useQuery<ServiceCategory[]>({
    queryKey: ["/api/categories"],
  });

  // Fetch subcategories for temporary selection
  const { data: tempSubcategories = [], isLoading: tempSubcategoriesLoading } = useQuery<ServiceSubcategory[]>({
    queryKey: [`/api/categories/${tempCategoryId}/subcategories`],
    enabled: !!tempCategoryId,
  });

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
          title: "Foto de perfil subida exitosamente",
          description: "Tu foto de perfil se aplicará cuando complete el registro.",
        });
      } catch (error) {
        console.error("Error processing profile picture:", error);
        toast({
          title: "Error al procesar la foto",
          description: "Hubo un problema al procesar tu foto de perfil.",
          variant: "destructive",
        });
      } finally {
        setIsUploadingPicture(false);
      }
    }
  };

  const form = useForm<ProviderSetupForm>({
    resolver: zodResolver(providerSetupSchema),
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
        title: "Selecciona una categoría",
        description: "Debes seleccionar al menos una categoría para agregar.",
        variant: "destructive",
      });
      return;
    }

    // Check if category already exists
    const exists = selectedCategories.some(
      cat => cat.categoryId === tempCategoryId && 
             (cat.subcategoryId || "") === (tempSubcategoryId || "")
    );

    if (exists) {
      toast({
        title: "Categoría ya agregada",
        description: "Esta categoría ya está en tu lista de servicios.",
        variant: "destructive",
      });
      return;
    }

    // Add the category
    const newCategory: SelectedCategory = {
      categoryId: tempCategoryId,
      subcategoryId: tempSubcategoryId || undefined,
      isPrimary: selectedCategories.length === 0 // First one is primary by default
    };

    setSelectedCategories([...selectedCategories, newCategory]);
    
    // Reset temp selections
    setTempCategoryId("");
    setTempSubcategoryId("");
    
    toast({
      title: "Servicio agregado",
      description: "El servicio se agregó a tu lista.",
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
    return categories.find(c => c.id === categoryId)?.name || "Categoría desconocida";
  };

  // Get subcategory name by ID
  const getSubcategoryName = async (categoryId: string, subcategoryId: string) => {
    try {
      const response = await fetch(`/api/categories/${categoryId}/subcategories`);
      const subcategories = await response.json();
      return subcategories.find((s: ServiceSubcategory) => s.id === subcategoryId)?.name || "";
    } catch {
      return "";
    }
  };

  const createProviderMutation = useMutation({
    mutationFn: async (providerData: ProviderSetupForm) => {
      // Validate that at least one category is selected
      if (selectedCategories.length === 0) {
        throw new Error("Debes seleccionar al menos una categoría de servicio");
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
      const paymentTypeLabels = {
        hourly: "pago por hora",
        fixed_job: "trabajo fijo",
        menu_based: "menú de servicios",
        per_event: "pago por evento"
      };
      
      let description = `Tu perfil con ${paymentTypeLabels[form.getValues().paymentType]} está listo. Ya puedes empezar a ofrecer servicios.`;
      
      // Add confirmation if profile picture was uploaded
      if (profilePicture && createdProvider.profilePhotoPath) {
        description += " Tu foto de perfil también fue configurada correctamente.";
      }
      
      toast({
        title: "¡Perfil de proveedor creado exitosamente!",
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
      toast({
        title: "Error al crear perfil de proveedor",
        description: error.message || "Hubo un problema al crear tu perfil. Inténtalo de nuevo.",
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
            Configura tu Perfil de Proveedor
          </h1>
          <p className="text-gray-600">
            Completa tu perfil para empezar a ofrecer servicios profesionales a tu comunidad
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Star className="w-5 h-5 text-orange-600" />
              <span>Información de tu Servicio</span>
            </CardTitle>
            <CardDescription>
              Esta información ayudará a los vecinos a encontrar y confiar en tus servicios
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Multiple Categories Section */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-base font-medium text-gray-900 mb-1">Servicios que ofreces</h3>
                    <p className="text-sm text-gray-600">
                      Selecciona todas las categorías de servicios que ofreces. Puedes agregar varias.
                    </p>
                  </div>

                  {/* Category Selection Form */}
                  <div className="border rounded-lg p-4 bg-gray-50 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="temp-category" className="text-sm font-medium">Categoría</Label>
                        <Select 
                          value={tempCategoryId}
                          onValueChange={(value) => {
                            setTempCategoryId(value);
                            setTempSubcategoryId(""); // Reset subcategory when category changes
                          }}
                        >
                          <SelectTrigger id="temp-category" data-testid="select-category">
                            <SelectValue placeholder="Selecciona una categoría" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                <div className="flex items-center space-x-2">
                                  <span>{category.icon}</span>
                                  <span>{category.name}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {tempCategoryId && tempSubcategories.length > 0 && (
                        <div>
                          <Label htmlFor="temp-subcategory" className="text-sm font-medium">Subcategoría (Opcional)</Label>
                          <Select 
                            value={tempSubcategoryId}
                            onValueChange={setTempSubcategoryId}
                          >
                            <SelectTrigger id="temp-subcategory" data-testid="select-subcategory">
                              <SelectValue placeholder="Selecciona una subcategoría" />
                            </SelectTrigger>
                            <SelectContent className="max-h-[300px]">
                              {tempSubcategoriesLoading ? (
                                <div className="p-4 text-center text-sm text-gray-500">
                                  Cargando subcategorías...
                                </div>
                              ) : (
                                tempSubcategories.map((subcategory) => (
                                  <SelectItem key={subcategory.id} value={subcategory.id}>
                                    {subcategory.name}
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
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
                      Agregar Servicio
                    </Button>
                  </div>

                  {/* Selected Categories Display */}
                  {selectedCategories.length > 0 ? (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Servicios seleccionados ({selectedCategories.length})</Label>
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
                                          Principal
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
                                        Marcar como servicio principal
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
                        No has agregado servicios aún. Selecciona una categoría y haz clic en "Agregar Servicio".
                      </p>
                    </div>
                  )}

                  {selectedCategories.length === 0 && (
                    <p className="text-sm text-red-600">
                      * Debes seleccionar al menos una categoría de servicio
                    </p>
                  )}
                </div>

                {/* Profile Picture Upload */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Foto de Perfil (Opcional)</Label>
                  <div className="flex flex-col space-y-3">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        {profilePicture ? (
                          <div className="relative">
                            <img 
                              src={profilePicture} 
                              alt="Vista previa de foto de perfil" 
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
                          onGetUploadParameters={handleProfilePictureUpload}
                          onComplete={handleProfilePictureComplete}
                          buttonClassName="bg-orange-600 hover:bg-orange-700 text-white"
                        >
                          <Camera className="w-4 h-4 mr-2" />
                          {profilePicture ? 'Cambiar Foto' : 'Subir Foto de Perfil'}
                        </ObjectUploader>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500">
                      Una foto de perfil profesional ayuda a generar confianza con tus clientes. 
                      Tamaño máximo: 5MB. Formatos: JPG, PNG.
                    </p>
                    {isUploadingPicture && (
                      <p className="text-sm text-orange-600">Procesando foto...</p>
                    )}
                  </div>
                </div>

                {/* Service Title */}
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título de tu Servicio</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ej: Limpieza profesional de apartamentos, Clases de matemáticas personalizadas"
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
                      <FormLabel>Descripción de tu Servicio</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe detalladamente qué servicios ofreces, tu metodología, qué incluye el servicio, etc. Una buena descripción ayuda a generar confianza."
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
                      <FormLabel className="text-base font-medium">Método de Pago</FormLabel>
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
                                  <h3 className="font-medium text-gray-900">Pago por Hora</h3>
                                  <p className="text-sm text-gray-600 mt-1">
                                    Cobra por tiempo trabajado con una tarifa por hora y mínimo de horas.
                                  </p>
                                  <p className="text-sm text-orange-600 mt-1 font-medium">
                                    Ideal para: Limpieza, tutoring, cuidado de mascotas
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
                                  <h3 className="font-medium text-gray-900">Trabajo Fijo</h3>
                                  <p className="text-sm text-gray-600 mt-1">
                                    Precio fijo por un trabajo específico con descripción clara del servicio.
                                  </p>
                                  <p className="text-sm text-orange-600 mt-1 font-medium">
                                    Ideal para: Reparaciones, instalaciones, proyectos específicos
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
                                  <h3 className="font-medium text-gray-900">Menú de Servicios</h3>
                                  <p className="text-sm text-gray-600 mt-1">
                                    Ofrece múltiples servicios con precios individuales desde un menú.
                                  </p>
                                  <p className="text-sm text-orange-600 mt-1 font-medium">
                                    Ideal para: Salón de belleza, restaurant, servicios variados
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
                                  <h3 className="font-medium text-gray-900">Pago por Evento</h3>
                                  <p className="text-sm text-gray-600 mt-1">
                                    Precio fijo por evento específico con descripción detallada del servicio.
                                  </p>
                                  <p className="text-sm text-orange-600 mt-1 font-medium">
                                    Ideal para: Fiestas, eventos, servicios especiales, celebraciones
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
                      <span>Configuración de Pago por Hora</span>
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="hourlyRate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center space-x-2">
                              <DollarSign className="w-4 h-4" />
                              <span>Tarifa por Hora (MXN)</span>
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
                              <span>Horas Mínimas</span>
                            </FormLabel>
                            <FormControl>
                              <Select onValueChange={(value) => field.onChange(parseFloat(value))} defaultValue={field.value?.toString()}>
                                <SelectTrigger data-testid="select-minimum-hours">
                                  <SelectValue placeholder="Selecciona" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="0.5">0.5 horas (30 min)</SelectItem>
                                  <SelectItem value="1">1 hora</SelectItem>
                                  <SelectItem value="1.5">1.5 horas</SelectItem>
                                  <SelectItem value="2">2 horas</SelectItem>
                                  <SelectItem value="3">3 horas</SelectItem>
                                  <SelectItem value="4">4 horas</SelectItem>
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <p className="text-sm text-gray-600">
                      Define tu tarifa por hora y el mínimo de horas que cobrarás por servicio.
                    </p>
                  </div>
                )}
                
                {selectedPaymentType === "fixed_job" && (
                  <div className="space-y-4 border rounded-lg p-4 bg-blue-50">
                    <h3 className="font-medium text-gray-900 flex items-center space-x-2">
                      <FileText className="w-5 h-5 text-blue-600" />
                      <span>Configuración de Trabajo Fijo</span>
                    </h3>
                    
                    <FormField
                      control={form.control}
                      name="fixedJobRate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center space-x-2">
                            <DollarSign className="w-4 h-4" />
                            <span>Precio del Trabajo (MXN)</span>
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
                          <FormLabel>Descripción del Trabajo</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Ej: Limpieza completa de apartamento de 2 habitaciones, incluye cocina, baños y sala. No incluye limpieza de alfombras."
                              className="min-h-[80px]"
                              {...field}
                              data-testid="textarea-job-description"
                            />
                          </FormControl>
                          <p className="text-sm text-gray-600">
                            Describe exactamente qué incluye el trabajo y qué no.
                          </p>
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
                            <span>Duración Estimada (minutos)</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="120"
                              {...field}
                              data-testid="input-estimated-duration"
                            />
                          </FormControl>
                          <p className="text-sm text-gray-600">
                            ¿Cuánto tiempo tomará completar este trabajo?
                          </p>
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
                      <span>Menú de Servicios</span>
                    </h3>
                    <div className="bg-white rounded-lg p-4 border border-green-200">
                      <div className="flex items-start space-x-3">
                        <div className="bg-green-100 p-2 rounded-full">
                          <Menu className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">Configurarás tu menú después</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            Una vez que completes el registro, podrás acceder a la sección de 
                            "Gestión de Menú" donde podrás agregar tus servicios, precios, 
                            categorías y opciones.
                          </p>
                          <ul className="text-sm text-gray-600 mt-2 space-y-1">
                            <li>• Añade múltiples servicios</li>
                            <li>• Organiza por categorías</li>
                            <li>• Define precios individuales</li>
                            <li>• Añade descripciones e imágenes</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {selectedPaymentType === "per_event" && (
                  <div className="space-y-4 border rounded-lg p-4 bg-purple-50">
                    <h3 className="font-medium text-gray-900 flex items-center space-x-2">
                      <Star className="w-5 h-5 text-purple-600" />
                      <span>Configuración de Pago por Evento</span>
                    </h3>
                    
                    <FormField
                      control={form.control}
                      name="eventRate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center space-x-2">
                            <DollarSign className="w-4 h-4" />
                            <span>Precio por Evento (MXN)</span>
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
                          <FormLabel>Descripción del Evento</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Ej: Fiesta de cumpleaños para 20 personas, incluye decoración, música, animación por 4 horas. No incluye comida ni bebidas."
                              className="min-h-[80px]"
                              {...field}
                              data-testid="textarea-event-description"
                            />
                          </FormControl>
                          <p className="text-sm text-gray-600">
                            Describe exactamente qué incluye el evento y qué no.
                          </p>
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
                            <span>Duración Estimada (minutos)</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="240"
                              {...field}
                              data-testid="input-event-duration"
                            />
                          </FormControl>
                          <p className="text-sm text-gray-600">
                            ¿Cuánto tiempo durará el evento?
                          </p>
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
                        <span>Tu Experiencia</span>
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Ej: 5 años de experiencia en limpieza residencial, certificación en productos ecológicos, trabajé en hoteles de lujo..."
                          className="min-h-[100px]"
                          {...field}
                          data-testid="textarea-experience"
                        />
                      </FormControl>
                      <p className="text-sm text-gray-600">
                        Menciona tu experiencia, certificaciones, logros o cualquier detalle que demuestre tu profesionalismo.
                      </p>
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
                        <span>Radio de Servicio (km)</span>
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
                        Distancia máxima en kilómetros para entregar tus servicios. Esto ayuda a los clientes a saber si estás disponible en su área.
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
                      "Creando perfil..."
                    ) : (
                      "Crear Perfil de Proveedor"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Skip option */}
        <div className="text-center mt-6">
          <Button 
            variant="ghost" 
            onClick={() => {
              sessionStorage.removeItem('providerSetupToken');
              setLocation('/');
            }}
            className="text-gray-600 hover:text-gray-800"
            data-testid="button-skip-setup"
          >
            Configurar más tarde
          </Button>
        </div>
      </div>
    </div>
  );
}
