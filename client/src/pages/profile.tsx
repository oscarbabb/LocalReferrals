import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { User, Settings, Star, Calendar, MessageCircle, Briefcase, Users } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import AppleMapsAddressInput from "@/components/apple-maps-address-input";

export default function Profile() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isUpdating, setIsUpdating] = useState(false);

  // Get current user data
  const { data: user, isLoading } = useQuery<any>({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

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
                        <AvatarFallback className="bg-primary text-white text-xl">
                          {getInitials(user?.fullName)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <Button variant="outline">Cambiar Foto</Button>
                        <p className="text-sm text-gray-500 mt-2">JPG, PNG. Máximo 2MB.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="fullName">Nombre Completo</Label>
                        <Input id="fullName" defaultValue={user?.fullName} />
                      </div>
                      <div>
                        <Label htmlFor="username">Nombre de Usuario</Label>
                        <Input id="username" defaultValue={user?.username} />
                      </div>
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" defaultValue={user?.email} />
                      </div>
                      <div>
                        <Label htmlFor="phone">Teléfono</Label>
                        <Input id="phone" defaultValue={user?.phone} />
                      </div>
                      <div>
                        <Label htmlFor="building">Edificio</Label>
                        <Input id="building" defaultValue={user?.building} />
                      </div>
                      <div>
                        <Label htmlFor="apartment">Apartamento</Label>
                        <Input id="apartment" defaultValue={user?.apartment} />
                      </div>
                      <div className="md:col-span-2">
                        <Label htmlFor="address">Dirección</Label>
                        <AppleMapsAddressInput
                          id="address"
                          value={user?.address}
                          onChange={() => {}} // In real app, this would update user state
                          placeholder="Dirección completa"
                        />
                      </div>
                    </div>

                    <Button className="bg-primary text-white hover:bg-blue-700">
                      Guardar Cambios
                    </Button>
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
            <Card>
              <CardHeader>
                <CardTitle>Configuración de Proveedor</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium">Modo Proveedor</h3>
                    <p className="text-sm text-gray-600">
                      Habilita esta opción para ofrecer servicios a otros residentes
                    </p>
                  </div>
                  <Switch defaultChecked={user?.isProvider} />
                </div>

                {user?.isProvider && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="serviceTitle">Título del Servicio</Label>
                        <Input id="serviceTitle" placeholder="ej. Limpieza profesional de apartamentos" />
                      </div>
                      <div>
                        <Label htmlFor="category">Categoría</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona una categoría" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="cleaning">Limpieza</SelectItem>
                            <SelectItem value="repairs">Reparaciones</SelectItem>
                            <SelectItem value="tutoring">Tutorías</SelectItem>
                            <SelectItem value="childcare">Cuidado</SelectItem>
                            <SelectItem value="cooking">Cocina</SelectItem>
                            <SelectItem value="tech">Tecnología</SelectItem>
                            <SelectItem value="beauty">Belleza</SelectItem>
                            <SelectItem value="fitness">Fitness</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="hourlyRate">Tarifa por Hora (MXN $)</Label>
                        <Input id="hourlyRate" type="number" placeholder="1500" />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="serviceDescription">Descripción del Servicio</Label>
                      <Textarea 
                        id="serviceDescription" 
                        placeholder="Describe tu servicio, experiencia y lo que incluye..."
                        className="min-h-[100px]"
                      />
                    </div>

                    <div>
                      <Label htmlFor="experience">Experiencia</Label>
                      <Textarea 
                        id="experience" 
                        placeholder="Describe tu experiencia, certificaciones o antecedentes relevantes..."
                        className="min-h-[80px]"
                      />
                    </div>

                    <Button className="bg-primary text-white hover:bg-blue-700">
                      Actualizar Servicio
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
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
