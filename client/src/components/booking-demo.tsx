import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Calendar, Clock, MapPin, User, DollarSign, Star } from "lucide-react";
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
    mutationFn: async () => {
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
      return apiRequest("/api/users", "POST", userData);
    },
    onSuccess: (user) => {
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
    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-lg">{provider.title}</h3>
              {provider.isVerified && (
                <Badge variant="default" className="bg-green-100 text-green-700">
                  <Star className="w-3 h-3 mr-1" />
                  Verificado
                </Badge>
              )}
            </div>
            <p className="text-gray-600 text-sm mb-3">{provider.description}</p>
            <div className="space-y-2">
              {provider.user && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <User className="w-4 h-4" />
                  {provider.user.fullName}
                </div>
              )}
              {provider.user?.address && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <MapPin className="w-4 h-4" />
                  {provider.user.address} - Sección {provider.user.section}
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-green-600">
                <DollarSign className="w-4 h-4" />
                <span className="font-semibold">${provider.hourlyRate}/hora</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedProvider(provider)}
            className="flex-1"
          >
            <Calendar className="w-4 h-4 mr-2" />
            Ver Disponibilidad
          </Button>
          <Button
            size="sm"
            className="flex-1 bg-orange-500 hover:bg-orange-600"
            onClick={() => {
              setSelectedProvider(provider);
              setShowBookingCalendar(true);
            }}
            disabled={!demoUser}
          >
            <Clock className="w-4 h-4 mr-2" />
            Reservar Ahora
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
        ) : providers.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {providers.map((provider: Provider) => (
              <ProviderCard key={provider.id} provider={provider} />
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
                provider={selectedProvider}
                userId={demoUser.id}
                onBookingComplete={handleBookingComplete}
              />
            </div>
          </div>
        </div>
      )}

      {/* Provider Availability Display */}
      {selectedProvider && !showBookingCalendar && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Disponibilidad de {selectedProvider.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="font-semibold mb-2">Información del Proveedor</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Tarifa:</strong> ${selectedProvider.hourlyRate}/hora</p>
                    <p><strong>Experiencia:</strong> {selectedProvider.experience}</p>
                    <p><strong>Estado:</strong> {selectedProvider.isVerified ? "Verificado" : "No verificado"}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Ubicación</h4>
                  <div className="space-y-2 text-sm">
                    {selectedProvider.user && (
                      <>
                        <p><strong>Proveedor:</strong> {selectedProvider.user.fullName}</p>
                        <p><strong>Dirección:</strong> {selectedProvider.user.address}</p>
                        <p><strong>Sección:</strong> {selectedProvider.user.section}</p>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <Button
                  onClick={() => setShowBookingCalendar(true)}
                  disabled={!demoUser}
                  className="bg-orange-500 hover:bg-orange-600"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Hacer Reserva
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setSelectedProvider(null)}
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