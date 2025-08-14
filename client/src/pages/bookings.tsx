import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import Header from "@/components/header";
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

  // Get current user
  const { data: user } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  // Get user's service requests
  const { data: myRequests = [], isLoading: requestsLoading } = useQuery({
    queryKey: ["/api/service-requests/user", user?.id],
    enabled: !!user?.id,
  });

  // Get requests received (if user is a provider)
  const { data: receivedRequests = [], isLoading: receivedLoading } = useQuery({
    queryKey: ["/api/service-requests/provider", user?.id],
    enabled: !!user?.id,
  });

  // Get user's appointments
  const { data: myAppointments = [], isLoading: appointmentsLoading } = useQuery({
    queryKey: ["/api/appointments/user", user?.id],
    enabled: !!user?.id,
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
    <Card className="mb-4">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start space-x-4">
            <Avatar className="w-12 h-12">
              <AvatarFallback className="bg-orange-100 text-orange-700">
                {request.provider ? getInitials(request.provider.title) : "?"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{request.title}</h3>
              <p className="text-gray-600">{request.provider?.title || "Proveedor"}</p>
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
          {getStatusBadge(request.status)}
        </div>

        <div className="space-y-3">
          <p className="text-gray-700">{request.description}</p>
          
          {request.location && (
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin className="w-4 h-4" />
              <span className="text-sm">{request.location}</span>
            </div>
          )}

          {request.totalAmount && (
            <div className="flex items-center gap-2 text-green-600">
              <DollarSign className="w-4 h-4" />
              <span className="font-semibold">${request.totalAmount}</span>
            </div>
          )}

          {request.notes && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-700">{request.notes}</p>
            </div>
          )}
        </div>

        <Separator className="my-4" />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <MessageCircle className="w-4 h-4 mr-2" />
              Mensaje
            </Button>
            {request.status === "completed" && (
              <Button variant="outline" size="sm">
                <Star className="w-4 h-4 mr-2" />
                Calificar
              </Button>
            )}
          </div>
          
          {request.status === "pending" && (
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                Cancelar
              </Button>
              <Button size="sm" className="bg-orange-500 hover:bg-orange-600">
                Confirmar
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const AppointmentCard = ({ appointment }: { appointment: Appointment }) => (
    <Card className="mb-4">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start space-x-4">
            <Avatar className="w-12 h-12">
              <AvatarFallback className="bg-blue-100 text-blue-700">
                {appointment.provider ? getInitials(appointment.provider.title) : "?"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="font-semibold text-lg">Cita Programada</h3>
              <p className="text-gray-600">{appointment.provider?.title || "Proveedor"}</p>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {format(new Date(appointment.appointmentDate), "dd 'de' MMMM, yyyy", { locale: es })}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {appointment.startTime} - {appointment.endTime}
                </div>
              </div>
            </div>
          </div>
          {getStatusBadge(appointment.status)}
        </div>

        {appointment.notes && (
          <div className="bg-gray-50 p-3 rounded-lg mb-4">
            <p className="text-sm text-gray-700">{appointment.notes}</p>
          </div>
        )}

        <Separator className="my-4" />

        <div className="flex items-center justify-between">
          <Button variant="outline" size="sm">
            <MessageCircle className="w-4 h-4 mr-2" />
            Contactar
          </Button>
          
          {appointment.status === "scheduled" && (
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                Reprogramar
              </Button>
              <Button variant="destructive" size="sm">
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
      <div className="min-h-screen bg-gray-50">
        <Header />
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
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mis Reservas</h1>
          <p className="text-gray-600">
            Gestiona tus solicitudes de servicio y citas programadas
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="requests" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Mis Solicitudes
            </TabsTrigger>
            <TabsTrigger value="received" className="flex items-center gap-2">
              <Star className="w-4 h-4" />
              Solicitudes Recibidas
            </TabsTrigger>
            <TabsTrigger value="appointments" className="flex items-center gap-2">
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
    </div>
  );
}