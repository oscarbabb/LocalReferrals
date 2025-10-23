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
import { useLanguage } from "@/hooks/use-language";
import { useLocation } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { parseSafeDate } from "@/lib/date-utils";
import { ObjectUploader } from "@/components/ObjectUploader";
import AppleMapsAddressInput from "@/components/apple-maps-address-input";
import EnhancedReviewCard from "@/components/enhanced-review-card";
import type { UploadResult } from "@uppy/core";
import type { MenuItem, Review } from "@shared/schema";

// Profile form schema - accepts translation function
const profileSchema = (t: any) => z.object({
  fullName: z.string().min(2, t('profile.validation.nameMin')),
  username: z.string().min(3, t('profile.validation.usernameMin')),
  email: z.string().email(t('profile.validation.emailInvalid')),
  phone: z.string().min(10, t('profile.validation.phoneMin')),
  building: z.string().optional(),
  apartment: z.string().optional(),
  address: z.string().optional(),
  // Detailed Mexican Address Fields
  condominioMaestro: z.string().optional(),
  condominio: z.string().optional(),
  edificioOArea: z.string().optional(),
  calle: z.string().optional(),
  colonia: z.string().optional(),
  codigoPostal: z.string().optional(),
  numeroExterior: z.string().optional(),
  numeroInterior: z.string().optional(),
  municipio: z.string().optional(),
  estado: z.string().optional(),
  addressNotes: z.string().optional(),
  serviceRadiusKm: z.preprocess(
    (val) => {
      if (val === "" || val === null || val === undefined) return undefined;
      const num = Number(val);
      return isNaN(num) ? undefined : num;
    },
    z.number().int().min(1, t('profile.validation.radiusMin')).max(100, t('profile.validation.radiusMax')).optional()
  ),
});

type ProfileForm = z.infer<ReturnType<typeof profileSchema>>;

export default function Profile() {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [, setLocation] = useLocation();
  const [isUpdating, setIsUpdating] = useState(false);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [isUploadingPicture, setIsUploadingPicture] = useState(false);
  const [isUploadingMenuDocument, setIsUploadingMenuDocument] = useState(false);
  const [isDeletingMenuDocument, setIsDeletingMenuDocument] = useState(false);

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

  // Get customer reviews (reviews written by providers about this user)
  const { data: customerReviews = [] } = useQuery<Review[]>({
    queryKey: ["/api/users", user?.id, "reviews"],
    enabled: !!user?.id,
  });

  // Profile form
  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema(t)),
    defaultValues: {
      fullName: user?.fullName || "",
      username: user?.username || "",
      email: user?.email || "",
      phone: user?.phone || "",
      building: user?.building || "",
      apartment: user?.apartment || "",
      address: user?.address || "",
      // Mexican address fields
      condominioMaestro: user?.condominioMaestro || "",
      condominio: user?.condominio || "",
      edificioOArea: user?.edificioOArea || "",
      calle: user?.calle || "",
      colonia: user?.colonia || "",
      codigoPostal: user?.codigoPostal || "",
      numeroExterior: user?.numeroExterior || "",
      numeroInterior: user?.numeroInterior || "",
      municipio: user?.municipio || "",
      estado: user?.estado || "",
      addressNotes: user?.addressNotes || "",
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
        // Mexican address fields
        condominioMaestro: user.condominioMaestro || "",
        condominio: user.condominio || "",
        edificioOArea: user.edificioOArea || "",
        calle: user.calle || "",
        colonia: user.colonia || "",
        codigoPostal: user.codigoPostal || "",
        numeroExterior: user.numeroExterior || "",
        numeroInterior: user.numeroInterior || "",
        municipio: user.municipio || "",
        estado: user.estado || "",
        addressNotes: user.addressNotes || "",
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
        title: t('profile.toast.roleUpdated.title'),
        description: data.user?.isProvider 
          ? t('profile.toast.roleUpdated.provider')
          : t('profile.toast.roleUpdated.consumer'),
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
        title: t('profile.toast.roleError.title'),
        description: t('profile.toast.roleError.description'),
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
          title: t('profile.toast.photoUpdated.title'),
          description: t('profile.toast.photoUpdated.description'),
        });
      } catch (error) {
        console.error("Error updating profile picture:", error);
        toast({
          title: t('profile.toast.photoError.title'),
          description: t('profile.toast.photoError.description'),
          variant: "destructive",
        });
      } finally {
        setIsUploadingPicture(false);
      }
    }
  };

  // Menu document upload functions
  const handleMenuDocumentUpload = async () => {
    const response = await apiRequest("POST", "/api/objects/upload");
    const data = await response.json();
    return {
      method: "PUT" as const,
      url: data.uploadURL as string,
    };
  };

  const handleMenuDocumentComplete = async (result: UploadResult<Record<string, unknown>, Record<string, unknown>>) => {
    if (result.successful && result.successful.length > 0) {
      // Guard: ensure provider is loaded
      if (!provider?.id) {
        toast({
          title: "Error al subir menú",
          description: "No se pudo cargar la información del proveedor. Por favor recarga la página.",
          variant: "destructive",
        });
        return;
      }

      setIsUploadingMenuDocument(true);
      try {
        const uploadedFile = result.successful[0];
        const documentURL = uploadedFile.uploadURL as string;
        
        // Make the uploaded document public and get the display URL
        const response = await apiRequest("PUT", "/api/menu-documents", {
          documentURL: documentURL
        });
        const data = await response.json();
        
        // Update the provider with the menu document URL
        await apiRequest("PATCH", `/api/providers/${provider.id}/menu-document`, {
          menuDocumentUrl: data.objectPath
        });
        
        queryClient.invalidateQueries({ queryKey: ["/api/auth/provider"] });
        
        toast({
          title: "Menú actualizado",
          description: "Tu documento de menú ha sido subido exitosamente.",
        });
      } catch (error) {
        console.error("Error uploading menu document:", error);
        toast({
          title: "Error al subir menú",
          description: "Hubo un problema al subir tu documento. Por favor intenta de nuevo.",
          variant: "destructive",
        });
      } finally {
        setIsUploadingMenuDocument(false);
      }
    }
  };

  // Menu document delete function
  const handleDeleteMenuDocument = async () => {
    if (!provider?.id) return;
    
    setIsDeletingMenuDocument(true);
    try {
      await apiRequest("PATCH", `/api/providers/${provider.id}/menu-document`, {
        menuDocumentUrl: null
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/auth/provider"] });
      
      toast({
        title: "Menú eliminado",
        description: "Tu documento de menú ha sido eliminado.",
      });
    } catch (error) {
      console.error("Error deleting menu document:", error);
      toast({
        title: "Error al eliminar menú",
        description: "Hubo un problema al eliminar tu documento. Por favor intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsDeletingMenuDocument(false);
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
        title: t('profile.toast.profileUpdated.title'),
        description: t('profile.toast.profileUpdated.description'),
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
    onError: (error: any) => {
      toast({
        title: t('profile.toast.profileError.title'),
        description: error.message || t('profile.toast.profileError.description'),
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
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{t('profile.access.title')}</h1>
          <p className="text-gray-600 mb-6">{t('profile.access.message')}</p>
          <Button onClick={() => setLocation('/auth')} data-testid="button-login-redirect">
            {t('profile.access.button')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('profile.header.title')}</h1>
          <p className="text-gray-600">{t('profile.header.description')}</p>
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
                    {user?.isProvider ? t('profile.role.providerMode') : t('profile.role.consumerMode')}
                  </h3>
                  <p className="text-gray-600">
                    {user?.isProvider 
                      ? t('profile.role.providerDescription')
                      : t('profile.role.consumerDescription')
                    }
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-sm font-medium text-gray-700">
                  {user?.isProvider ? t('profile.role.provider') : t('profile.role.consumer')}
                </span>
                <Switch
                  checked={user?.isProvider}
                  onCheckedChange={handleRoleSwitch}
                  disabled={roleSwitchMutation.isPending}
                  data-testid="switch-role"
                />
                <span className="text-sm font-medium text-gray-700">
                  {user?.isProvider ? t('profile.role.consumer') : t('profile.role.provider')}
                </span>
              </div>
            </div>
            {roleSwitchMutation.isPending && (
              <div className="mt-4 flex items-center space-x-2 text-sm text-gray-600">
                <div className="animate-spin w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full"></div>
                <span>{t('profile.role.updating')}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Tabs defaultValue="profile" className="space-y-8">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">
              <User className="w-4 h-4 mr-2" />
              {t('profile.tab.profile')}
            </TabsTrigger>
            <TabsTrigger value="provider">
              <Star className="w-4 h-4 mr-2" />
              {t('profile.tab.provider')}
            </TabsTrigger>
            <TabsTrigger value="requests">
              <Calendar className="w-4 h-4 mr-2" />
              {t('profile.tab.requests')}
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="w-4 h-4 mr-2" />
              {t('profile.tab.settings')}
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>{t('profile.personal.title')}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center space-x-6">
                      <Avatar className="w-20 h-20">
                        {(profilePicture || user?.avatar) ? (
                          <AvatarImage src={profilePicture || user?.avatar} alt={t('profile.provider.profile.photo')} />
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
                          {profilePicture ? t('profile.personal.changePhoto') : t('profile.personal.uploadPhoto')}
                        </ObjectUploader>
                        <p className="text-sm text-gray-500">{t('profile.personal.photoRequirements')}</p>
                        {isUploadingPicture && (
                          <p className="text-sm text-blue-600">{t('profile.personal.uploadingPhoto')}</p>
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
                                <FormLabel>{t('profile.personal.fullName')}</FormLabel>
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
                                <FormLabel>{t('profile.personal.username')}</FormLabel>
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
                                <FormLabel>{t('profile.personal.email')}</FormLabel>
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
                                <FormLabel>{t('profile.personal.phone')}</FormLabel>
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
                                <FormLabel>{t('profile.personal.building')}</FormLabel>
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
                                <FormLabel>{t('profile.personal.apartment')}</FormLabel>
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
                                <FormLabel>{t('profile.personal.address')}</FormLabel>
                                <FormControl>
                                  <AppleMapsAddressInput
                                    value={field.value || ""}
                                    onChange={field.onChange}
                                    placeholder={t('profile.personal.addressPlaceholder')}
                                    data-testid="input-address"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {/* Detailed Mexican Address Fields */}
                          <FormField
                            control={profileForm.control}
                            name="condominioMaestro"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Condominio Maestro</FormLabel>
                                <FormControl>
                                  <Input {...field} data-testid="input-condominio-maestro" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={profileForm.control}
                            name="condominio"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Condominio</FormLabel>
                                <FormControl>
                                  <Input {...field} data-testid="input-condominio" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={profileForm.control}
                            name="edificioOArea"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Edificio o Área</FormLabel>
                                <FormControl>
                                  <Input {...field} data-testid="input-edificio-area" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={profileForm.control}
                            name="calle"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Calle</FormLabel>
                                <FormControl>
                                  <Input {...field} data-testid="input-calle" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={profileForm.control}
                            name="colonia"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Colonia</FormLabel>
                                <FormControl>
                                  <Input {...field} data-testid="input-colonia" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={profileForm.control}
                            name="codigoPostal"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Código Postal</FormLabel>
                                <FormControl>
                                  <Input {...field} data-testid="input-codigo-postal" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={profileForm.control}
                            name="numeroExterior"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Número Exterior</FormLabel>
                                <FormControl>
                                  <Input {...field} data-testid="input-numero-exterior" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={profileForm.control}
                            name="numeroInterior"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Número Interior</FormLabel>
                                <FormControl>
                                  <Input {...field} data-testid="input-numero-interior" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={profileForm.control}
                            name="municipio"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Municipio</FormLabel>
                                <FormControl>
                                  <Input {...field} data-testid="input-municipio" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={profileForm.control}
                            name="estado"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Estado</FormLabel>
                                <FormControl>
                                  <Input {...field} data-testid="input-estado" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={profileForm.control}
                            name="addressNotes"
                            render={({ field }) => (
                              <FormItem className="md:col-span-2">
                                <FormLabel>Notas de Dirección</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="Información adicional sobre tu dirección" data-testid="input-address-notes" />
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
                                <FormLabel>{t('profile.personal.serviceRadius')}</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    placeholder={t('profile.personal.serviceRadiusPlaceholder')}
                                    min="1"
                                    max="100"
                                    {...field}
                                    data-testid="input-user-service-radius"
                                  />
                                </FormControl>
                                <p className="text-sm text-gray-600">
                                  {t('profile.personal.serviceRadiusHelp')}
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
                          {updateProfileMutation.isPending ? t('profile.personal.saving') : t('profile.personal.saveButton')}
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>{t('profile.account.title')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-gray-600">{t('profile.account.memberSince')}</span>
                        <span className="font-medium">{t('profile.account.memberSinceValue')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">{t('profile.account.servicesRequested')}</span>
                        <span className="font-medium">12</span>
                      </div>
                      {user?.isProvider && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-gray-600">{t('profile.account.servicesOffered')}</span>
                            <span className="font-medium">28</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">{t('profile.account.averageRating')}</span>
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
                    <CardTitle>{t('profile.verification.title')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">{t('profile.verification.emailVerified')}</span>
                        <Badge className="bg-green-100 text-green-800">✓</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">{t('profile.verification.phoneVerified')}</span>
                        <Badge className="bg-green-100 text-green-800">✓</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">{t('profile.verification.addressVerified')}</span>
                        <Badge className="bg-green-100 text-green-800">✓</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Customer Reviews Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Star className="w-5 h-5 text-yellow-400" />
                      {t('profile.reviews.customerTitle')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {customerReviews.length > 0 ? (
                      <div className="space-y-4">
                        <p className="text-sm text-gray-600 mb-4">
                          {t('profile.reviews.customerDescription')}
                        </p>
                        {customerReviews.map((review: any) => (
                          <EnhancedReviewCard key={review.id} review={review} />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Star className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <h4 className="font-medium text-gray-900 mb-2">
                          {t('profile.reviews.noCustomerReviews')}
                        </h4>
                        <p className="text-gray-600">
                          {t('profile.reviews.noCustomerReviewsDesc')}
                        </p>
                      </div>
                    )}
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
                  <CardTitle>{t('profile.provider.notProvider.title')}</CardTitle>
                </CardHeader>
                <CardContent className="text-center py-8">
                  <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {t('profile.provider.notProvider.message')}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {t('profile.provider.notProvider.description')}
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
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <FileText className="w-5 h-5" />
                      <span>Menú Completo</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {provider?.menuDocumentUrl ? (
                      /* Display existing menu document */
                      <div className="space-y-4">
                        {provider.menuDocumentUrl.toLowerCase().endsWith('.pdf') ? (
                          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-blue-100">
                            <div className="flex items-center space-x-3">
                              <FileText className="w-8 h-8 text-red-600" />
                              <div>
                                <p className="font-medium text-gray-900">Menú en PDF</p>
                                <p className="text-sm text-gray-500">Documento del menú</p>
                              </div>
                            </div>
                            <Button
                              onClick={() => provider.menuDocumentUrl && window.open(provider.menuDocumentUrl, '_blank')}
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
                              src={provider.menuDocumentUrl} 
                              alt="Menú Completo" 
                              className="w-full h-auto rounded-lg border shadow-sm"
                              data-testid="img-menu-document"
                            />
                            <Button
                              onClick={() => provider.menuDocumentUrl && window.open(provider.menuDocumentUrl, '_blank')}
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
                        
                        {/* Replace and Delete Actions */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                          <ObjectUploader
                            maxNumberOfFiles={1}
                            maxFileSize={10 * 1024 * 1024} // 10MB
                            onGetUploadParameters={handleMenuDocumentUpload}
                            onComplete={handleMenuDocumentComplete}
                            buttonClassName="w-full border border-blue-600 bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Reemplazar Menú
                          </ObjectUploader>
                          <Button
                            onClick={handleDeleteMenuDocument}
                            disabled={isDeletingMenuDocument}
                            variant="outline"
                            className="w-full border-red-600 text-red-600 hover:bg-red-50"
                            data-testid="button-delete-menu"
                          >
                            <X className="w-4 h-4 mr-2" />
                            {isDeletingMenuDocument ? 'Eliminando...' : 'Eliminar Menú'}
                          </Button>
                        </div>
                        {isUploadingMenuDocument && (
                          <p className="text-sm text-blue-600 text-center">Subiendo documento...</p>
                        )}
                      </div>
                    ) : (
                      /* Upload new menu document */
                      <div className="space-y-4">
                        <div className="border-2 border-dashed border-blue-200 rounded-lg p-8 text-center bg-gradient-to-b from-white to-blue-50">
                          <FileText className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                          <h4 className="text-lg font-semibold text-gray-900 mb-2">
                            Sube tu menú completo
                          </h4>
                          <p className="text-sm text-gray-600 mb-4">
                            Comparte un documento PDF o imagen de tu menú para que los clientes puedan ver todos tus servicios
                          </p>
                          <ObjectUploader
                            maxNumberOfFiles={1}
                            maxFileSize={10 * 1024 * 1024} // 10MB
                            onGetUploadParameters={handleMenuDocumentUpload}
                            onComplete={handleMenuDocumentComplete}
                            buttonClassName="bg-orange-600 hover:bg-orange-700 text-white"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Seleccionar Archivo
                          </ObjectUploader>
                          <p className="text-xs text-gray-500 mt-3">
                            PDF, JPG, PNG (máximo 10MB)
                          </p>
                          {isUploadingMenuDocument && (
                            <p className="text-sm text-blue-600 mt-3">Subiendo documento...</p>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

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
                  <CardTitle>{t('profile.settings.notifications.title')}</CardTitle>
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
                  <CardTitle>{t('profile.settings.privacy.title')}</CardTitle>
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
                  <CardTitle>{t('profile.settings.account.title')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="outline">{t('profile.settings.account.changePassword')}</Button>
                  <Button variant="outline">{t('profile.settings.account.downloadData')}</Button>
                  <Button variant="destructive">{t('profile.settings.account.deleteAccount')}</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
  );
}
