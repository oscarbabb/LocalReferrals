import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  DollarSign, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Star,
  MessageCircle
} from "lucide-react";

interface User {
  id: string;
  email: string;
  username?: string;
  fullName?: string;
  role?: string;
}

interface ServiceRequest {
  id: string;
  providerId: string;
  requesterId: string;
  categoryId: string;
  title: string;
  description: string;
  location: string;
  notes?: string;
  status: string;
  totalAmount?: number;
  confirmedDate?: string;
  confirmedTime?: string;
  createdAt: string;
  provider?: any;
  requester?: any;
}

interface Appointment {
  id: string;
  serviceRequestId: string;
  providerId: string;
  requesterId: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  status: string;
  notes?: string;
  createdAt: string;
  provider?: any;
  requester?: any;
}

export default function Bookings() {
  const [activeTab, setActiveTab] = useState("requests");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Get current user
  const { data: user } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  // Get user's service requests
  const { data: myRequests = [], isLoading: requestsLoading } = useQuery<ServiceRequest[]>({
    queryKey: ["/api/service-requests/user", user?.id],
    enabled: !!user?.id,
  });

  // Get requests received (if user is a provider)
  const { data: receivedRequests = [], isLoading: receivedLoading } = useQuery<ServiceRequest[]>({
    queryKey: ["/api/service-requests/provider", user?.id],
    enabled: !!user?.id,
  });

  // Get user's appointments
  const { data: myAppointments = [], isLoading: appointmentsLoading } = useQuery<Appointment[]>({
    queryKey: ["/api/appointments/user", user?.id],
    enabled: !!user?.id,
  });

  // Mutation for updating service request status
  const updateStatusMutation = useMutation({
    mutationFn: async ({ requestId, status }: { requestId: string; status: string }) => {
      const response = await apiRequest("PATCH", `/api/service-requests/${requestId}`, { status });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Estado actualizado",
        description: "La solicitud ha sido actualizada exitosamente.",
      });
      // Invalidate queries to refetch data
      queryClient.invalidateQueries({ queryKey: ["/api/service-requests/user", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/service-requests/provider", user?.id] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo actualizar el estado.",
        variant: "destructive",
      });
    },
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: "Pendiente", variant: "secondary" as const, icon: AlertCircle },
      confirmed: { label: "Confirmado", variant: "default" as const, icon: CheckCircle },
      in_progress: { label: "En Progreso", variant: "default" as const, icon: Clock },
      completed: { label: "Completado", variant: "default" as const, icon: CheckCircle },
      cancelled: { label: "Cancelado", variant: "destructive" as const, icon: XCircle },
      scheduled: { label: "Programado", variant: "default" as const, icon: Calendar },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const ServiceRequestCard = ({ request }: { request: ServiceRequest }) => (
    <Card className="mb-4" data-testid={`card-service-request-${request.id}`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start space-x-4">
            <Avatar className="w-12 h-12">
              <AvatarFallback className="bg-orange-100 text-orange-700">
                {request.provider ? getInitials(request.provider.title) : "?"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="font-semibold text-lg" data-testid={`text-request-title-${request.id}`}>{request.title}</h3>
              <p className="text-gray-600" data-testid={`text-provider-name-${request.id}`}>{request.provider?.title || "Proveedor"}</p>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {format(new Date(request.createdAt), "dd 'de' MMMM, yyyy", { locale: es })}
                </div>
                {request.confirmedDate && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {request.confirmedTime}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div data-testid={`badge-status-${request.id}`}>
            {getStatusBadge(request.status)}
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-gray-700" data-testid={`text-description-${request.id}`}>{request.description}</p>
          
          {request.location && (
            <div className="flex items-center gap-2 text-gray-600" data-testid={`text-location-${request.id}`}>
              <MapPin className="w-4 h-4" />
              <span className="text-sm">{request.location}</span>
            </div>
          )}

          {request.totalAmount && (
            <div className="flex items-center gap-2 text-green-600" data-testid={`text-total-amount-${request.id}`}>
              <DollarSign className="w-4 h-4" />
              <span className="font-semibold">${request.totalAmount}</span>
            </div>
          )}

          {request.notes && (
            <div className="bg-gray-50 p-3 rounded-lg" data-testid={`text-notes-${request.id}`}>
              <p className="text-sm text-gray-700">{request.notes}</p>
            </div>
          )}
        </div>

        <Separator className="my-4" />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" data-testid={`button-message-${request.id}`}>
              <MessageCircle className="w-4 h-4 mr-2" />
              Mensaje
            </Button>
            {request.status === "completed" && (
              <Button variant="outline" size="sm" data-testid={`button-rate-${request.id}`}>
                <Star className="w-4 h-4 mr-2" />
                Calificar
              </Button>
            )}
          </div>
          
          {request.status === "pending" && (
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                data-testid={`button-cancel-${request.id}`}
                onClick={() => updateStatusMutation.mutate({ requestId: request.id, status: "cancelled" })}
                disabled={updateStatusMutation.isPending}
              >
                Cancelar
              </Button>
              <Button 
                size="sm" 
                className="bg-orange-500 hover:bg-orange-600" 
                data-testid={`button-confirm-${request.id}`}
                onClick={() => updateStatusMutation.mutate({ requestId: request.id, status: "confirmed" })}
                disabled={updateStatusMutation.isPending}
              >
                Confirmar
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const AppointmentCard = ({ appointment }: { appointment: Appointment }) => (
    <Card className="mb-4" data-testid={`card-appointment-${appointment.id}`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start space-x-4">
            <Avatar className="w-12 h-12">
              <AvatarFallback className="bg-blue-100 text-blue-700">
                {appointment.provider ? getInitials(appointment.provider.title) : "?"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="font-semibold text-lg" data-testid={`text-appointment-title-${appointment.id}`}>Cita Programada</h3>
              <p className="text-gray-600" data-testid={`text-appointment-provider-${appointment.id}`}>{appointment.provider?.title || "Proveedor"}</p>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                <div className="flex items-center gap-1" data-testid={`text-appointment-date-${appointment.id}`}>
                  <Calendar className="w-4 h-4" />
                  {format(new Date(appointment.appointmentDate), "dd 'de' MMMM, yyyy", { locale: es })}
                </div>
                <div className="flex items-center gap-1" data-testid={`text-appointment-time-${appointment.id}`}>
                  <Clock className="w-4 h-4" />
                  {appointment.startTime} - {appointment.endTime}
                </div>
              </div>
            </div>
          </div>
          <div data-testid={`badge-appointment-status-${appointment.id}`}>
            {getStatusBadge(appointment.status)}
          </div>
        </div>

        {appointment.notes && (
          <div className="bg-gray-50 p-3 rounded-lg mb-4" data-testid={`text-appointment-notes-${appointment.id}`}>
            <p className="text-sm text-gray-700">{appointment.notes}</p>
          </div>
        )}

        <Separator className="my-4" />

        <div className="flex items-center justify-between">
          <Button variant="outline" size="sm" data-testid={`button-contact-${appointment.id}`}>
            <MessageCircle className="w-4 h-4 mr-2" />
            Contactar
          </Button>
          
          {appointment.status === "scheduled" && (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" data-testid={`button-reschedule-${appointment.id}`}>
                Reprogramar
              </Button>
              <Button variant="destructive" size="sm" data-testid={`button-cancel-appointment-${appointment.id}`}>
                Cancelar
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Card>
            <CardContent className="text-center py-12">
              <h2 className="text-2xl font-semibold mb-4">Acceso Requerido</h2>
              <p className="text-gray-600 mb-6">
                Debes iniciar sesión para ver tus reservas y citas.
              </p>
              <Button onClick={() => window.location.href = "/auth"}>
                Iniciar Sesión
              </Button>
            </CardContent>
          </Card>
        </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mis Reservas</h1>
          <p className="text-gray-600">
            Gestiona tus solicitudes de servicio y citas programadas
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="requests" className="flex items-center gap-2" data-testid="tab-my-requests">
              <User className="w-4 h-4" />
              Mis Solicitudes
            </TabsTrigger>
            <TabsTrigger value="received" className="flex items-center gap-2" data-testid="tab-received-requests">
              <Star className="w-4 h-4" />
              Solicitudes Recibidas
            </TabsTrigger>
            <TabsTrigger value="appointments" className="flex items-center gap-2" data-testid="tab-appointments">
              <Calendar className="w-4 h-4" />
              Citas Programadas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="requests" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Mis Solicitudes de Servicio
                </CardTitle>
              </CardHeader>
              <CardContent>
                {requestsLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-32 bg-gray-200 rounded-lg"></div>
                      </div>
                    ))}
                  </div>
                ) : myRequests.length > 0 ? (
                  <div className="space-y-4">
                    {myRequests.map((request: ServiceRequest) => (
                      <ServiceRequestCard key={request.id} request={request} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">
                      No tienes solicitudes
                    </h3>
                    <p className="text-gray-500 mb-6">
                      Explora nuestros proveedores y solicita un servicio
                    </p>
                    <Button onClick={() => window.location.href = "/services"}>
                      Explorar Servicios
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="received" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5" />
                  Solicitudes Recibidas
                </CardTitle>
              </CardHeader>
              <CardContent>
                {receivedLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-32 bg-gray-200 rounded-lg"></div>
                      </div>
                    ))}
                  </div>
                ) : receivedRequests.length > 0 ? (
                  <div className="space-y-4">
                    {receivedRequests.map((request: ServiceRequest) => (
                      <ServiceRequestCard key={request.id} request={request} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">
                      No has recibido solicitudes
                    </h3>
                    <p className="text-gray-500 mb-6">
                      Cuando ofrezcas servicios, las solicitudes aparecerán aquí
                    </p>
                    <Button onClick={() => window.location.href = "/profile"}>
                      Configurar Perfil de Proveedor
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appointments" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Citas Programadas
                </CardTitle>
              </CardHeader>
              <CardContent>
                {appointmentsLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-32 bg-gray-200 rounded-lg"></div>
                      </div>
                    ))}
                  </div>
                ) : myAppointments.length > 0 ? (
                  <div className="space-y-4">
                    {myAppointments.map((appointment: Appointment) => (
                      <AppointmentCard key={appointment.id} appointment={appointment} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">
                      No tienes citas programadas
                    </h3>
                    <p className="text-gray-500 mb-6">
                      Tus citas confirmadas aparecerán aquí
                    </p>
                    <Button onClick={() => window.location.href = "/providers"}>
                      Buscar Proveedores
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
  );
}