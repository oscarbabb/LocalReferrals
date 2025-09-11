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
import { Briefcase, DollarSign, Star, Clock, Camera, User } from "lucide-react";
import type { ServiceCategory } from "@shared/schema";
import type { UploadResult } from "@uppy/core";

// Provider setup form schema
const providerSetupSchema = z.object({
  categoryId: z.string().min(1, "Selecciona una categoría de servicio"),
  title: z.string().min(3, "El título debe tener al menos 3 caracteres"),
  description: z.string().min(20, "La descripción debe tener al menos 20 caracteres"),
  hourlyRate: z.string().min(1, "Ingresa tu tarifa por hora").refine((val) => {
    const num = parseFloat(val);
    return !isNaN(num) && num > 0;
  }, "La tarifa debe ser un número válido mayor a 0"),
  experience: z.string().min(10, "Describe tu experiencia (mínimo 10 caracteres)")
});

type ProviderSetupForm = z.infer<typeof providerSetupSchema>;

export default function ProviderSetup() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [isUploadingPicture, setIsUploadingPicture] = useState(false);

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
        
        // We'll get the userId after the provider is created
        // For now, just store the photoURL to update later
        setProfilePicture(photoURL);
        
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
      categoryId: "",
      title: "",
      description: "",
      hourlyRate: "",
      experience: ""
    }
  });

  const createProviderMutation = useMutation({
    mutationFn: async (providerData: ProviderSetupForm) => {
      const response = await apiRequest("POST", "/api/providers", {
        ...providerData,
        providerSetupToken: providerSetupToken
      });
      return await response.json();
    },
    onSuccess: async (createdProvider) => {
      // If a profile picture was uploaded, set it for the user
      if (profilePicture && providerSetupToken) {
        try {
          await apiRequest("PUT", "/api/profile-photos", { 
            photoURL: profilePicture, 
            providerSetupToken: providerSetupToken 
          });
        } catch (error) {
          console.error("Error setting profile picture:", error);
          // Don't fail the whole flow for profile picture errors
        }
      }
      
      toast({
        title: "¡Perfil de proveedor creado exitosamente!",
        description: "Ya puedes empezar a ofrecer tus servicios a la comunidad.",
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
                {/* Service Category */}
                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoría de Servicio</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-category">
                            <SelectValue placeholder="Selecciona el tipo de servicio que ofreces" />
                          </SelectTrigger>
                        </FormControl>
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
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
                          maxFileSize={5 * 1024 * 1024} // 5MB
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

                {/* Hourly Rate */}
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
                      <p className="text-sm text-gray-600">
                        Ingresa tu tarifa por hora en pesos mexicanos. Puedes cambiarla después.
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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

                <div className="border-t pt-6">
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white"
                    disabled={createProviderMutation.isPending}
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