import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { User, Settings, Star, Calendar, MessageCircle, Briefcase, Users, Camera, Menu as MenuIcon, Plus, FileText, Download, X } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { parseSafeDate } from "@/lib/date-utils";
import { ObjectUploader } from "@/components/ObjectUploader";
import AppleMapsAddressInput from "@/components/apple-maps-address-input";
import type { UploadResult } from "@uppy/core";
import type { MenuItem } from "@shared/schema";

// Profile form schema
const profileSchema = z.object({
  fullName: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  username: z.string().min(3, "El nombre de usuario debe tener al menos 3 caracteres"),
  email: z.string().email("Email inválido"),
  phone: z.string().min(10, "Teléfono debe tener al menos 10 dígitos"),
  building: z.string().min(1, "El edificio es requerido"),
  apartment: z.string().min(1, "El apartamento es requerido"),
  address: z.string().min(10, "La dirección debe ser más específica"),
  serviceRadiusKm: z.preprocess(
    (val) => {
      if (val === "" || val === null || val === undefined) return undefined;
      const num = Number(val);
      return isNaN(num) ? undefined : num;
    },
    z.number().int().min(1, "El radio debe ser al menos 1 km").max(100, "El radio no puede exceder 100 km").optional()
  ),
});

type ProfileForm = z.infer<typeof profileSchema>;

export default function Profile() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isUpdating, setIsUpdating] = useState(false);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [isUploadingPicture, setIsUploadingPicture] = useState(false);

  // Get current user data
  const { data: user, isLoading } = useQuery<any>({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  // Get provider data if user is a provider
  const { data: provider } = useQuery<any>({
    queryKey: ["/api/auth/provider"],
    enabled: !!user?.isProvider,
    retry: false,
  });

  // Get menu items for providers
  const { data: menuItems = [] } = useQuery<MenuItem[]>({
    queryKey: ["/api/providers", provider?.id, "menu-items"],
    enabled: !!provider?.id,
  });

  // Profile form
  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: user?.fullName || "",
      username: user?.username || "",
      email: user?.email || "",
      phone: user?.phone || "",
      building: user?.building || "",
      apartment: user?.apartment || "",
      address: user?.address || "",
      serviceRadiusKm: user?.serviceRadiusKm || undefined,
    }
  });

  // Update form when user data loads
  useEffect(() => {
    if (user) {
      profileForm.reset({
        fullName: user.fullName || "",
        username: user.username || "",
        email: user.email || "",
        phone: user.phone || "",
        building: user.building || "",
        apartment: user.apartment || "",
        address: user.address || "",
        serviceRadiusKm: user.serviceRadiusKm || undefined,
      });
      setProfilePicture(user.avatar || null);
    }
  }, [user, profileForm]);

  // Role switching mutation
  const roleSwitchMutation = useMutation({
    mutationFn: async (newRole: boolean) => {
      if (!user?.id) throw new Error("User not found");
      
      return await apiRequest("PATCH", `/api/users/${user.id}`, {
        isProvider: newRole
      });
    },
    onSuccess: async (response) => {
      const data = await response.json();
      
      toast({
        title: "Rol actualizado",
        description: data.user?.isProvider 
          ? "Ahora puedes ofrecer servicios como proveedor" 
          : "Has cambiado a modo consumidor",
      });
      
      // Refresh user data
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      
      // If switching to provider and setup token is provided, redirect to setup
      if (data.providerSetupToken) {
        sessionStorage.setItem('providerSetupToken', data.providerSetupToken);
        setLocation('/provider-setup');
      }
    },
    onError: (error) => {
      toast({
        title: "Error al cambiar rol",
        description: "No se pudo actualizar tu rol. Inténtalo de nuevo.",
        variant: "destructive",
      });
    },
  });

  const handleRoleSwitch = (isProvider: boolean) => {
    roleSwitchMutation.mutate(isProvider);
  };

  // Profile photo upload functions
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
        const response = await apiRequest("PUT", "/api/consumer-profile-photos", {
          photoURL: photoURL
        });
        const data = await response.json();
        
        // Use the public objectPath for display
        setProfilePicture(data.objectPath);
        queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
        
        toast({
          title: "Foto de perfil actualizada",
          description: "Tu foto de perfil se ha actualizado exitosamente.",
        });
      } catch (error) {
        console.error("Error updating profile picture:", error);
        toast({
          title: "Error al actualizar foto",
          description: "Hubo un problema al actualizar tu foto de perfil.",
          variant: "destructive",
        });
      } finally {
        setIsUploadingPicture(false);
      }
    }
  };

  // Profile update mutation  
  const updateProfileMutation = useMutation({
    mutationFn: async (profileData: ProfileForm) => {
      if (!user?.id) throw new Error("User not found");
      
      return await apiRequest("PATCH", `/api/users/${user.id}`, profileData);
    },
    onSuccess: () => {
      toast({
        title: "Perfil actualizado",
        description: "Tus cambios han sido guardados exitosamente.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error al actualizar perfil",
        description: error.message || "No se pudo actualizar tu perfil. Inténtalo de nuevo.",
        variant: "destructive",
      });
    },
  });

  const onSubmitProfile = (data: ProfileForm) => {
    updateProfileMutation.mutate(data);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4 w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded mb-8 w-1/2"></div>
          <div className="bg-white rounded-xl p-8">
            <div className="h-6 bg-gray-200 rounded mb-6 w-1/4"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Acceso Requerido</h1>
          <p className="text-gray-600 mb-6">Necesitas iniciar sesión para ver tu perfil.</p>
          <Button onClick={() => setLocation('/auth')} data-testid="button-login-redirect">
            Iniciar Sesión
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mi Perfil</h1>
          <p className="text-gray-600">Gestiona tu información personal y configuración</p>
        </div>

        {/* Role Status Card */}
        <Card className="mb-8 border-2 border-orange-100 bg-gradient-to-r from-orange-50 to-yellow-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-full ${
                  user?.isProvider 
                    ? 'bg-orange-100 text-orange-600' 
                    : 'bg-blue-100 text-blue-600'
                }`}>
                  {user?.isProvider ? (
                    <Briefcase className="w-6 h-6" />
                  ) : (
                    <Users className="w-6 h-6" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {user?.isProvider ? 'Modo Proveedor' : 'Modo Consumidor'}
                  </h3>
                  <p className="text-gray-600">
                    {user?.isProvider 
                      ? 'Puedes ofrecer servicios y gestionar tus clientes'
                      : 'Puedes buscar y contratar servicios locales'
                    }
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-sm font-medium text-gray-700">
                  {user?.isProvider ? 'Proveedor' : 'Consumidor'}
                </span>
                <Switch
                  checked={user?.isProvider}
                  onCheckedChange={handleRoleSwitch}
                  disabled={roleSwitchMutation.isPending}
                  data-testid="switch-role"
                />
                <span className="text-sm font-medium text-gray-700">
                  {user?.isProvider ? 'Consumidor' : 'Proveedor'}
                </span>
              </div>
            </div>
            {roleSwitchMutation.isPending && (
              <div className="mt-4 flex items-center space-x-2 text-sm text-gray-600">
                <div className="animate-spin w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full"></div>
                <span>Actualizando rol...</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Tabs defaultValue="profile" className="space-y-8">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">
              <User className="w-4 h-4 mr-2" />
              Perfil
            </TabsTrigger>
            <TabsTrigger value="provider">
              <Star className="w-4 h-4 mr-2" />
              Proveedor
            </TabsTrigger>
            <TabsTrigger value="requests">
              <Calendar className="w-4 h-4 mr-2" />
              Solicitudes
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="w-4 h-4 mr-2" />
              Configuración
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Información Personal</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center space-x-6">
                      <Avatar className="w-20 h-20">
                        {(profilePicture || user?.avatar) ? (
                          <AvatarImage src={profilePicture || user?.avatar} alt="Foto de perfil" />
                        ) : (
                          <AvatarFallback className="bg-primary text-white text-xl">
                            {getInitials(user?.fullName)}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div className="space-y-2">
                        <ObjectUploader
                          maxNumberOfFiles={1}
                          maxFileSize={2 * 1024 * 1024} // 2MB
                          onGetUploadParameters={handleProfilePictureUpload}
                          onComplete={handleProfilePictureComplete}
                          buttonClassName="border border-gray-300 bg-white hover:bg-gray-50 text-gray-700"
                        >
                          <Camera className="w-4 h-4 mr-2" />
                          {profilePicture ? 'Cambiar Foto' : 'Subir Foto'}
                        </ObjectUploader>
                        <p className="text-sm text-gray-500">JPG, PNG. Máximo 2MB.</p>
                        {isUploadingPicture && (
                          <p className="text-sm text-blue-600">Subiendo foto...</p>
                        )}
                      </div>
                    </div>

                    <Form {...profileForm}>
                      <form onSubmit={profileForm.handleSubmit(onSubmitProfile)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={profileForm.control}
                            name="fullName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Nombre Completo</FormLabel>
                                <FormControl>
                                  <Input {...field} data-testid="input-fullname" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={profileForm.control}
                            name="username"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Nombre de Usuario</FormLabel>
                                <FormControl>
                                  <Input {...field} data-testid="input-username" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={profileForm.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                  <Input type="email" {...field} data-testid="input-email" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={profileForm.control}
                            name="phone"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Teléfono</FormLabel>
                                <FormControl>
                                  <Input {...field} data-testid="input-phone" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={profileForm.control}
                            name="building"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Edificio</FormLabel>
                                <FormControl>
                                  <Input {...field} data-testid="input-building" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={profileForm.control}
                            name="apartment"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Apartamento</FormLabel>
                                <FormControl>
                                  <Input {...field} data-testid="input-apartment" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={profileForm.control}
                            name="address"
                            render={({ field }) => (
                              <FormItem className="md:col-span-2">
                                <FormLabel>Dirección</FormLabel>
                                <FormControl>
                                  <AppleMapsAddressInput
                                    value={field.value}
                                    onChange={field.onChange}
                                    placeholder="Dirección completa"
                                    data-testid="input-address"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={profileForm.control}
                            name="serviceRadiusKm"
                            render={({ field }) => (
                              <FormItem className="md:col-span-2">
                                <FormLabel>Radio de Servicio (km)</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    placeholder="Ej: 5"
                                    min="1"
                                    max="100"
                                    {...field}
                                    data-testid="input-user-service-radius"
                                  />
                                </FormControl>
                                <p className="text-sm text-gray-600">
                                  Distancia máxima para recibir servicios desde tu ubicación (opcional)
                                </p>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <Button 
                          type="submit" 
                          className="bg-primary text-white hover:bg-blue-700"
                          disabled={updateProfileMutation.isPending}
                          data-testid="button-save-profile"
                        >
                          {updateProfileMutation.isPending ? 'Guardando...' : 'Guardar Cambios'}
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Estado de Cuenta</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Miembro desde</span>
                        <span className="font-medium">Enero 2024</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Servicios solicitados</span>
                        <span className="font-medium">12</span>
                      </div>
                      {user?.isProvider && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Servicios ofrecidos</span>
                            <span className="font-medium">28</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Calificación promedio</span>
                            <div className="flex items-center">
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
                              <span className="font-medium">4.8</span>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Verificación</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Email verificado</span>
                        <Badge className="bg-green-100 text-green-800">✓</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Teléfono verificado</span>
                        <Badge className="bg-green-100 text-green-800">✓</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Dirección verificada</span>
                        <Badge className="bg-green-100 text-green-800">✓</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Provider Tab */}
          <TabsContent value="provider">
            {!user?.isProvider ? (
              <Card>
                <CardHeader>
                  <CardTitle>Configuración de Proveedor</CardTitle>
                </CardHeader>
                <CardContent className="text-center py-8">
                  <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No eres un proveedor actualmente
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Activa el modo proveedor en la parte superior para empezar a ofrecer servicios
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {/* Provider Profile Summary */}
                {provider && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>Tu Perfil de Proveedor</span>
                        <Badge className="bg-green-100 text-green-800">Activo</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-orange-100 rounded-lg flex items-center justify-center">
                          {provider.profilePicture ? (
                            <img 
                              src={provider.profilePicture} 
                              alt="Foto de proveedor" 
                              className="w-16 h-16 rounded-lg object-cover"
                            />
                          ) : (
                            <Briefcase className="w-8 h-8 text-orange-600" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{provider.title}</h3>
                          <p className="text-gray-600">{provider.description}</p>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                            <span>⭐ 4.9 (12 reseñas)</span>
                            <span>📍 {user.building}</span>
                            <span>🕒 Activo desde {parseSafeDate(provider.createdAt).getFullYear()}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Menu Document Section */}
                {provider?.menuDocumentUrl && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <FileText className="w-5 h-5" />
                        <span>Menú Completo</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {provider.menuDocumentUrl.toLowerCase().endsWith('.pdf') ? (
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <FileText className="w-8 h-8 text-red-600" />
                            <div>
                              <p className="font-medium text-gray-900">Menú en PDF</p>
                              <p className="text-sm text-gray-500">Documento del menú</p>
                            </div>
                          </div>
                          <Button
                            onClick={() => window.open(`/objects/${provider.menuDocumentUrl}`, '_blank')}
                            size="sm"
                            className="bg-orange-600 hover:bg-orange-700"
                            data-testid="button-view-menu-pdf"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Ver
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <img 
                            src={`/objects/${provider.menuDocumentUrl}`} 
                            alt="Menú Completo" 
                            className="w-full h-auto rounded-lg border"
                            data-testid="img-menu-document"
                          />
                          <Button
                            onClick={() => window.open(`/objects/${provider.menuDocumentUrl}`, '_blank')}
                            variant="outline"
                            size="sm"
                            className="w-full"
                            data-testid="button-view-menu-image"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Ver en tamaño completo
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Menu Management */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <MenuIcon className="w-5 h-5" />
                        <span>Menú de Servicios</span>
                      </div>
                      <Button 
                        onClick={() => setLocation('/menu-management')}
                        className="bg-orange-600 hover:bg-orange-700"
                        data-testid="button-manage-menu"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Gestionar Menú
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {menuItems.length === 0 ? (
                      <div className="text-center py-8">
                        <MenuIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h4 className="font-medium text-gray-900 mb-2">
                          No tienes servicios en tu menú
                        </h4>
                        <p className="text-gray-600 mb-4">
                          Agrega servicios para que los clientes puedan encontrarte
                        </p>
                        <Button 
                          onClick={() => setLocation('/menu-management')}
                          variant="outline"
                          data-testid="button-add-first-service"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Agregar Primer Servicio
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <p className="text-sm text-gray-600 mb-4">
                          Tienes {menuItems.length} servicio{menuItems.length !== 1 ? 's' : ''} en tu menú:
                        </p>
                        <div className="grid gap-3">
                          {menuItems.slice(0, 3).map((item) => (
                            <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                              <div className="flex-1">
                                <h5 className="font-medium">{item.itemName}</h5>
                                <div className="flex items-center space-x-3 text-sm text-gray-600">
                                  <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs">
                                    {item.categoryName}
                                  </span>
                                  <span>MXN ${item.price}</span>
                                  {item.duration && <span>{item.duration} min</span>}
                                </div>
                              </div>
                              <Badge variant={item.isAvailable ? "default" : "secondary"}>
                                {item.isAvailable ? 'Disponible' : 'No disponible'}
                              </Badge>
                            </div>
                          ))}
                        </div>
                        {menuItems.length > 3 && (
                          <p className="text-sm text-gray-500 text-center">
                            ... y {menuItems.length - 3} más
                          </p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Availability Management */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-5 h-5" />
                        <span>Disponibilidad</span>
                      </div>
                      <Button 
                        onClick={() => setLocation('/availability-management')}
                        className="bg-orange-600 hover:bg-orange-700"
                        data-testid="button-manage-availability"
                      >
                        <Calendar className="w-4 h-4 mr-2" />
                        Gestionar Disponibilidad
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-4">
                      <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-4">
                        Configura tus horarios semanales para que los clientes puedan agendar servicios
                      </p>
                      <Button 
                        onClick={() => setLocation('/availability-management')}
                        variant="outline"
                        data-testid="button-setup-availability"
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        Configurar Horarios
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Stats */}
                <Card>
                  <CardHeader>
                    <CardTitle>Estadísticas Rápidas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{menuItems.length}</div>
                        <div className="text-sm text-gray-600">Servicios</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">12</div>
                        <div className="text-sm text-gray-600">Completados</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">4.9</div>
                        <div className="text-sm text-gray-600">Calificación</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">MXN 2.4k</div>
                        <div className="text-sm text-gray-600">Este mes</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Requests Tab */}
          <TabsContent value="requests">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Mis Solicitudes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium">Limpieza Apartamento</h4>
                          <Badge variant="secondary">Pendiente</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">Solicitado a María García</p>
                        <p className="text-xs text-gray-500">Hace 2 días</p>
                      </div>
                      <div className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium">Reparación Grifo</h4>
                          <Badge className="bg-green-100 text-green-800">Completado</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">Solicitado a Carlos Mendoza</p>
                        <p className="text-xs text-gray-500">Hace 1 semana</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {user?.isProvider && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Solicitudes Recibidas</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-medium">Clases de Matemáticas</h4>
                            <Badge className="bg-blue-100 text-blue-800">Nueva</Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">De: Ana López</p>
                          <p className="text-xs text-gray-500">Hace 3 horas</p>
                          <div className="flex space-x-2 mt-3">
                            <Button size="sm" className="bg-primary text-white">Aceptar</Button>
                            <Button size="sm" variant="outline">Rechazar</Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Notificaciones</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Nuevas solicitudes</h4>
                      <p className="text-sm text-gray-600">Recibe notificaciones cuando alguien solicite tus servicios</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Mensajes</h4>
                      <p className="text-sm text-gray-600">Recibe notificaciones de nuevos mensajes</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Reseñas</h4>
                      <p className="text-sm text-gray-600">Recibe notificaciones de nuevas reseñas</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Privacidad</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Perfil público</h4>
                      <p className="text-sm text-gray-600">Permite que otros residentes vean tu perfil</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Mostrar teléfono</h4>
                      <p className="text-sm text-gray-600">Muestra tu número de teléfono en tu perfil</p>
                    </div>
                    <Switch />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Cuenta</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="outline">Cambiar Contraseña</Button>
                  <Button variant="outline">Descargar Mis Datos</Button>
                  <Button variant="destructive">Eliminar Cuenta</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
  );
}
