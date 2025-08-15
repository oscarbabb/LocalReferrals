import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Calendar, Clock, MapPin, User, DollarSign, Star, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import BookingCalendar from "@/components/booking-calendar";

interface Provider {
  id: string;
  title: string;
  description: string;
  hourlyRate: string;
  experience: string;
  isVerified: boolean;
  userId: string;
  categoryId: string;
  user?: {
    fullName: string;
    address: string;
    section: string;
  };
}

interface DemoUser {
  id: string;
  fullName: string;
  email: string;
  address: string;
  section: string;
}

export default function BookingDemo() {
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [showBookingCalendar, setShowBookingCalendar] = useState(false);
  const [demoUser, setDemoUser] = useState<DemoUser | null>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get all providers
  const { data: providers = [], isLoading: providersLoading } = useQuery({
    queryKey: ["/api/providers"],
  });

  // Create demo user mutation
  const createDemoUserMutation = useMutation({
    mutationFn: async (): Promise<DemoUser> => {
      const userData = {
        username: `demo_user_${Date.now()}`,
        email: `demo${Date.now()}@example.com`,
        password: "demo123",
        fullName: "Usuario Demo",
        address: "Condominio Demo, Torre Este",
        section: "Este",
        apartment: "123",
        building: "Torre Demo",
        phone: "+1234567890",
        isProvider: false,
      };
      const response = await apiRequest("/api/users", "POST", userData);
      return response as DemoUser;
    },
    onSuccess: (user: DemoUser) => {
      setDemoUser(user);
      toast({
        title: "Usuario demo creado",
        description: "Ahora puedes hacer reservas como usuario demo.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo crear el usuario demo.",
        variant: "destructive",
      });
    },
  });

  const handleBookingComplete = () => {
    setShowBookingCalendar(false);
    setSelectedProvider(null);
    toast({
      title: "¡Reserva completada!",
      description: "Tu solicitud de servicio ha sido enviada exitosamente.",
    });
  };

  const ProviderCard = ({ provider }: { provider: Provider }) => (
    <Card className="card-animate hover-lift hover-glow transition-all duration-300 cursor-pointer h-full">
      <CardContent className="p-6 h-full flex flex-col">
        <div className="flex-1">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold text-lg text-gray-900">{provider.title}</h3>
                {provider.isVerified && (
                  <Badge variant="default" className="bg-green-100 text-green-700 border-green-200">
                    <Star className="w-3 h-3 mr-1" />
                    Verificado
                  </Badge>
                )}
              </div>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">{provider.description}</p>
              
              <div className="space-y-3">
                {provider.user && (
                  <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                    <User className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">{provider.user.fullName}</span>
                  </div>
                )}
                {provider.user?.address && (
                  <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
                    <MapPin className="w-4 h-4 text-blue-500" />
                    <div className="text-sm">
                      <div className="font-medium text-gray-700">{provider.user.address}</div>
                      <div className="text-gray-500">Sección {provider.user.section}</div>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
                  <DollarSign className="w-4 h-4 text-green-500" />
                  <div className="text-sm">
                    <span className="font-semibold text-green-700">${provider.hourlyRate}/hora</span>
                    <div className="text-gray-500">Tarifa estándar</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons - Always at bottom */}
        <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-gray-100">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedProvider(provider)}
            className="w-full btn-animate hover-scale transition-all duration-300 border-orange-200 text-orange-700 hover:bg-orange-50 hover:border-orange-300"
            data-testid={`button-view-availability-${provider.id}`}
          >
            <Calendar className="w-4 h-4 mr-2" />
            Ver Disponibilidad
          </Button>
          <Button
            size="sm"
            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white btn-animate hover-lift shadow-md"
            onClick={() => {
              setSelectedProvider(provider);
              setShowBookingCalendar(true);
            }}
            disabled={!demoUser}
            data-testid={`button-book-now-${provider.id}`}
          >
            <Clock className="w-4 h-4 mr-2" />
            {!demoUser ? "Crear Usuario Primero" : "Reservar Ahora"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Demo del Sistema de Reservas
        </h1>
        <p className="text-gray-600 mb-6">
          Explora cómo funciona nuestro sistema completo de reservas con proveedores reales.
        </p>
        
        {!demoUser ? (
          <Card className="mb-6 bg-blue-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-blue-900 mb-2">
                    Crear Usuario Demo
                  </h3>
                  <p className="text-blue-700 text-sm">
                    Crea un usuario demo para probar el sistema de reservas completo.
                  </p>
                </div>
                <Button
                  onClick={() => createDemoUserMutation.mutate()}
                  disabled={createDemoUserMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {createDemoUserMutation.isPending ? "Creando..." : "Crear Usuario Demo"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="mb-6 bg-green-50 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-green-900">
                    Usuario Demo Activo: {demoUser.fullName}
                  </h3>
                  <p className="text-green-700 text-sm">
                    {demoUser.address} - Sección {demoUser.section}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Providers List */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-6">Proveedores Disponibles</h2>
        {providersLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-48 bg-gray-200 rounded-lg"></div>
              </div>
            ))}
          </div>
        ) : (providers as Provider[]).length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
            {(providers as Provider[]).map((provider: Provider, index) => (
              <div key={provider.id} className="stagger-item">
                <ProviderCard provider={provider} />
              </div>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                No hay proveedores disponibles
              </h3>
              <p className="text-gray-500">
                Los proveedores aparecerán aquí cuando se registren en la plataforma.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Booking Calendar Modal */}
      {showBookingCalendar && selectedProvider && demoUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">
                    Reservar con {selectedProvider.title}
                  </h2>
                  <p className="text-gray-600">
                    Selecciona fecha y hora para tu servicio
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setShowBookingCalendar(false)}
                >
                  Cerrar
                </Button>
              </div>
            </div>
            <div className="p-6">
              <BookingCalendar
                provider={selectedProvider as any}
                userId={demoUser.id}
                onBookingComplete={handleBookingComplete}
              />
            </div>
          </div>
        </div>
      )}

      {/* Provider Availability Display */}
      {selectedProvider && !showBookingCalendar && (
        <Card className="mt-8 animate-slide-up">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-orange-500" />
              Disponibilidad de {selectedProvider.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Provider Info Grid */}
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <h4 className="font-semibold mb-3 text-gray-900">Información del Proveedor</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                      <DollarSign className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="font-medium">${selectedProvider.hourlyRate}/hora</p>
                        <p className="text-sm text-gray-600">Tarifa por servicio</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                      <Star className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="font-medium">{selectedProvider.experience}</p>
                        <p className="text-sm text-gray-600">Años de experiencia</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-orange-600" />
                      <div>
                        <p className="font-medium">{selectedProvider.isVerified ? "Verificado" : "No verificado"}</p>
                        <p className="text-sm text-gray-600">Estado de verificación</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-semibold mb-3 text-gray-900">Información de Contacto</h4>
                  <div className="space-y-3">
                    {selectedProvider.user && (
                      <>
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <User className="w-5 h-5 text-gray-600" />
                          <div>
                            <p className="font-medium">{selectedProvider.user.fullName}</p>
                            <p className="text-sm text-gray-600">Nombre del proveedor</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <MapPin className="w-5 h-5 text-gray-600" />
                          <div>
                            <p className="font-medium">{selectedProvider.user.address}</p>
                            <p className="text-sm text-gray-600">Sección {selectedProvider.user.section}</p>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Availability Time Slots */}
              <div className="border-t pt-6">
                <h4 className="font-semibold mb-4 text-gray-900">Horarios Disponibles</h4>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {[
                    { day: "Lunes", time: "9:00 AM - 5:00 PM", available: true },
                    { day: "Martes", time: "9:00 AM - 5:00 PM", available: true },
                    { day: "Miércoles", time: "10:00 AM - 4:00 PM", available: true },
                    { day: "Jueves", time: "9:00 AM - 5:00 PM", available: false },
                    { day: "Viernes", time: "9:00 AM - 3:00 PM", available: true },
                    { day: "Sábado", time: "10:00 AM - 2:00 PM", available: true },
                  ].map((slot) => (
                    <div
                      key={slot.day}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        slot.available
                          ? "border-green-200 bg-green-50 text-green-800"
                          : "border-gray-200 bg-gray-50 text-gray-500"
                      }`}
                    >
                      <div className="font-medium">{slot.day}</div>
                      <div className="text-sm">{slot.time}</div>
                      <div className="text-xs mt-1">
                        {slot.available ? "Disponible" : "No disponible"}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                <Button
                  onClick={() => setShowBookingCalendar(true)}
                  disabled={!demoUser}
                  className="bg-orange-500 hover:bg-orange-600 btn-animate hover-lift flex-1"
                  data-testid="button-make-booking"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Hacer Reserva
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setSelectedProvider(null)}
                  className="btn-animate hover-lift flex-1"
                  data-testid="button-back-to-providers"
                >
                  Volver a Proveedores
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}