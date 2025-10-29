import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/use-language";
import { format } from "date-fns";
import { parseSafeDate } from "@/lib/date-utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import MessagingModal from "@/components/messaging-modal";
import CustomerRatingDialog from "@/components/customer-rating-dialog";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User as UserIcon, 
  DollarSign, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Star,
  MessageCircle
} from "lucide-react";
import { Provider, User as UserType } from "@shared/schema";

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
  const [showMessagingModal, setShowMessagingModal] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<{ id: string; name: string } | null>(null);
  const [showCustomerRatingDialog, setShowCustomerRatingDialog] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<{id: string, name: string, providerId: string} | null>(null);
  const [receivedFilter, setReceivedFilter] = useState<"all" | "pending" | "completed">("all");
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { t, dateLocale } = useLanguage();

  // Get current user
  const { data: user } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  // Get user's provider profile (if they are a provider)
  const { data: provider } = useQuery<Provider>({
    queryKey: ["/api/auth/provider"],
    enabled: !!user?.id,
    retry: false,
  });

  // Get user's service requests
  const { data: myRequests = [], isLoading: requestsLoading } = useQuery<ServiceRequest[]>({
    queryKey: ["/api/service-requests/user", user?.id],
    enabled: !!user?.id,
  });

  // Get requests received (if user is a provider)
  const { data: receivedRequests = [], isLoading: receivedLoading } = useQuery<ServiceRequest[]>({
    queryKey: ["/api/service-requests/provider", provider?.id],
    enabled: !!provider?.id,
  });

  // Get user's appointments
  const { data: myAppointments = [], isLoading: appointmentsLoading } = useQuery<Appointment[]>({
    queryKey: ["/api/appointments/user", user?.id],
    enabled: !!user?.id,
  });

  // Combine confirmed service requests with scheduled appointments
  // Exclude service requests that already have appointments created
  const appointmentServiceRequestIds = new Set(myAppointments.map(apt => apt.serviceRequestId));
  const confirmedRequestsWithoutAppointments = myRequests.filter(
    req => req.status === 'confirmed' && !appointmentServiceRequestIds.has(req.id)
  );
  const allScheduledItems = [...myAppointments, ...confirmedRequestsWithoutAppointments];

  // Mutation for updating service request status
  const updateStatusMutation = useMutation({
    mutationFn: async ({ requestId, status }: { requestId: string; status: string }) => {
      const response = await apiRequest("PATCH", `/api/service-requests/${requestId}`, { status });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: t('bookings.toast.statusUpdated'),
        description: t('bookings.toast.statusSuccess'),
      });
      // Invalidate queries to refetch data
      queryClient.invalidateQueries({ queryKey: ["/api/service-requests/user", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/service-requests/provider", provider?.id] });
    },
    onError: (error: Error) => {
      toast({
        title: t('bookings.toast.error'),
        description: error.message || t('bookings.toast.updateFailed'),
        variant: "destructive",
      });
    },
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: t('bookings.status.pending'), variant: "secondary" as const, icon: AlertCircle },
      confirmed: { label: t('bookings.status.confirmed'), variant: "default" as const, icon: CheckCircle },
      in_progress: { label: t('bookings.status.inProgress'), variant: "default" as const, icon: Clock },
      completed: { label: t('bookings.status.completed'), variant: "default" as const, icon: CheckCircle },
      cancelled: { label: t('bookings.status.cancelled'), variant: "destructive" as const, icon: XCircle },
      scheduled: { label: t('bookings.status.scheduled'), variant: "default" as const, icon: Calendar },
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

  const ServiceRequestCard = ({ request, currentUser }: { request: ServiceRequest; currentUser: User | undefined }) => {
    const getMessageRecipient = () => {
      if (!currentUser) return null;
      
      // If current user is the requester, message the provider
      if (request.requesterId === currentUser.id) {
        return {
          id: request.provider?.userId,
          name: request.provider?.title
        };
      }
      
      // If current user is the provider (check both provider.userId and providerId)
      if (request.provider?.userId === currentUser.id || (provider && request.providerId === provider.id)) {
        return {
          id: request.requesterId,
          name: request.requester?.fullName || request.requester?.username || "Usuario"
        };
      }
      
      return null;
    };

    return (
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
                    {format(parseSafeDate(request.createdAt), "PP", { locale: dateLocale })}
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
              <Button 
                variant="outline" 
                size="sm" 
                data-testid={`button-message-${request.id}`}
                onClick={() => {
                  const recipient = getMessageRecipient();
                  if (recipient && recipient.id) {
                    setSelectedProvider({
                      id: recipient.id,
                      name: recipient.name || "Usuario"
                    });
                    setShowMessagingModal(true);
                  } else {
                    toast({
                      title: t('bookings.toast.messageUnavailable'),
                      description: t('bookings.toast.cannotMessage'),
                      variant: "destructive",
                    });
                  }
                }}
                disabled={!getMessageRecipient()?.id}
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                {t('bookings.buttons.message')}
              </Button>
              {request.status === "completed" && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  data-testid={`button-rate-${request.id}`}
                  onClick={() => {
                    // Check if current user is the provider (same logic as messaging)
                    const isProvider = request.provider?.userId === currentUser?.id || 
                                      (provider && request.providerId === provider.id);
                    
                    if (isProvider) {
                      setSelectedCustomer({
                        id: request.requesterId,
                        name: request.requester?.fullName || request.requester?.username || 'Customer',
                        providerId: request.providerId
                      });
                      setShowCustomerRatingDialog(true);
                    } else {
                      toast({
                        title: t('bookings.toast.ratingInfo'),
                        description: t('bookings.toast.customerRatingOnly'),
                      });
                    }
                  }}
                >
                  <Star className="w-4 h-4 mr-2" />
                  {t('bookings.buttons.rate')}
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
                  {t('bookings.buttons.cancel')}
                </Button>
                <Button 
                  size="sm" 
                  className="bg-orange-500 hover:bg-orange-600" 
                  data-testid={`button-confirm-${request.id}`}
                  onClick={() => updateStatusMutation.mutate({ requestId: request.id, status: "confirmed" })}
                  disabled={updateStatusMutation.isPending}
                >
                  {t('bookings.buttons.confirm')}
                </Button>
              </div>
            )}
            
            {request.status === "confirmed" && (
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  className="bg-blue-500 hover:bg-blue-600" 
                  data-testid={`button-start-service-${request.id}`}
                  onClick={() => updateStatusMutation.mutate({ requestId: request.id, status: "in_progress" })}
                  disabled={updateStatusMutation.isPending}
                >
                  <Clock className="w-4 h-4 mr-2" />
                  {t('bookings.buttons.startService')}
                </Button>
              </div>
            )}
            
            {request.status === "in_progress" && (
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  className="bg-green-500 hover:bg-green-600" 
                  data-testid={`button-finish-service-${request.id}`}
                  onClick={() => updateStatusMutation.mutate({ requestId: request.id, status: "completed" })}
                  disabled={updateStatusMutation.isPending}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {t('bookings.buttons.finishService')}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const AppointmentCard = ({ appointment, currentUser }: { appointment: Appointment; currentUser: User | undefined }) => {
    const getMessageRecipient = () => {
      if (!currentUser) return null;
      
      if (appointment.requesterId === currentUser.id) {
        return {
          id: appointment.provider?.userId,
          name: appointment.provider?.title
        };
      }
      
      if (appointment.provider?.userId === currentUser.id) {
        return {
          id: appointment.requesterId,
          name: appointment.requester?.fullName || appointment.requester?.username || "Usuario"
        };
      }
      
      return null;
    };

    return (
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
                <h3 className="font-semibold text-lg" data-testid={`text-appointment-title-${appointment.id}`}>{t('bookings.appointments.scheduledTitle')}</h3>
                <p className="text-gray-600" data-testid={`text-appointment-provider-${appointment.id}`}>{appointment.provider?.title || "Proveedor"}</p>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                  <div className="flex items-center gap-1" data-testid={`text-appointment-date-${appointment.id}`}>
                    <Calendar className="w-4 h-4" />
                    {format(parseSafeDate(appointment.appointmentDate), "PP", { locale: dateLocale })}
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
            <Button 
              variant="outline" 
              size="sm" 
              data-testid={`button-contact-${appointment.id}`}
              onClick={() => {
                const recipient = getMessageRecipient();
                if (recipient && recipient.id) {
                  setSelectedProvider({
                    id: recipient.id,
                    name: recipient.name || "Usuario"
                  });
                  setShowMessagingModal(true);
                } else {
                  toast({
                    title: t('bookings.toast.messageUnavailable'),
                    description: t('bookings.toast.cannotMessage'),
                    variant: "destructive",
                  });
                }
              }}
              disabled={!getMessageRecipient()?.id}
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              {t('bookings.buttons.contact')}
            </Button>
            
            {appointment.status === "scheduled" && (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" data-testid={`button-reschedule-${appointment.id}`}>
                  {t('bookings.buttons.reschedule')}
                </Button>
                <Button variant="destructive" size="sm" data-testid={`button-cancel-appointment-${appointment.id}`}>
                  {t('bookings.buttons.cancel')}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Card>
            <CardContent className="text-center py-12">
              <h2 className="text-2xl font-semibold mb-4">{t('bookings.auth.required')}</h2>
              <p className="text-gray-600 mb-6">
                {t('bookings.auth.message')}
              </p>
              <Button onClick={() => window.location.href = "/auth"}>
                {t('bookings.auth.loginBtn')}
              </Button>
            </CardContent>
          </Card>
        </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('bookings.title')}</h1>
          <p className="text-gray-600">
            {t('bookings.description')}
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="requests" className="flex items-center gap-2" data-testid="tab-my-requests">
              <UserIcon className="w-4 h-4" />
              {t('bookings.tabs.myRequests')}
            </TabsTrigger>
            <TabsTrigger value="received" className="flex items-center gap-2" data-testid="tab-received-requests">
              <Star className="w-4 h-4" />
              {t('bookings.tabs.received')}
            </TabsTrigger>
            <TabsTrigger value="appointments" className="flex items-center gap-2" data-testid="tab-appointments">
              <Calendar className="w-4 h-4" />
              {t('bookings.tabs.appointments')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="requests" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserIcon className="w-5 h-5" />
                  {t('bookings.requests.title')}
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
                      <ServiceRequestCard key={request.id} request={request} currentUser={user} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">
                      {t('bookings.requests.noRequests')}
                    </h3>
                    <p className="text-gray-500 mb-6">
                      {t('bookings.requests.exploreServices')}
                    </p>
                    <Button onClick={() => window.location.href = "/services"}>
                      {t('bookings.requests.exploreServicesBtn')}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="received" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Star className="w-5 h-5" />
                    {t('bookings.requests.receivedTitle')}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant={receivedFilter === "all" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setReceivedFilter("all")}
                      data-testid="filter-all"
                    >
                      {t('bookings.filters.all')}
                    </Button>
                    <Button
                      variant={receivedFilter === "pending" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setReceivedFilter("pending")}
                      data-testid="filter-pending"
                    >
                      {t('bookings.filters.pending')}
                    </Button>
                    <Button
                      variant={receivedFilter === "completed" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setReceivedFilter("completed")}
                      className="bg-green-600 hover:bg-green-700"
                      data-testid="filter-completed"
                    >
                      {t('bookings.filters.completed')}
                    </Button>
                  </div>
                </div>
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
                ) : (() => {
                  const filteredRequests = receivedRequests.filter((request: ServiceRequest) => {
                    if (receivedFilter === "all") return true;
                    return request.status === receivedFilter;
                  });
                  
                  return filteredRequests.length > 0 ? (
                    <div className="space-y-4">
                      {filteredRequests.map((request: ServiceRequest) => (
                        <ServiceRequestCard key={request.id} request={request} currentUser={user} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-600 mb-2">
                        {receivedFilter === "completed" 
                          ? t('bookings.filters.noCompleted')
                          : receivedFilter === "pending"
                          ? t('bookings.filters.noPending')
                          : t('bookings.requests.noReceived')}
                      </h3>
                      <p className="text-gray-500">
                        {receivedFilter === "completed" && t('bookings.filters.completedHint')}
                      </p>
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appointments" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  {t('bookings.appointments.title')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {(appointmentsLoading || requestsLoading) ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-32 bg-gray-200 rounded-lg"></div>
                      </div>
                    ))}
                  </div>
                ) : allScheduledItems.length > 0 ? (
                  <div className="space-y-4">
                    {allScheduledItems.map((item: Appointment | ServiceRequest) => {
                      // Check if it's an appointment or a confirmed service request
                      if ('appointmentDate' in item) {
                        return <AppointmentCard key={item.id} appointment={item as Appointment} currentUser={user} />;
                      } else {
                        return <ServiceRequestCard key={item.id} request={item as ServiceRequest} currentUser={user} />;
                      }
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">
                      {t('bookings.requests.noReceived')}
                    </h3>
                    <p className="text-gray-500 mb-6">
                      {t('bookings.requests.setupProvider')}
                    </p>
                    <Button onClick={() => window.location.href = "/profile"}>
                      {t('bookings.requests.setupProviderBtn')}
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
                  {t('bookings.appointments.title')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {(appointmentsLoading || requestsLoading) ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-32 bg-gray-200 rounded-lg"></div>
                      </div>
                    ))}
                  </div>
                ) : allScheduledItems.length > 0 ? (
                  <div className="space-y-4">
                    {allScheduledItems.map((item: Appointment | ServiceRequest) => {
                      // Check if it's an appointment or a confirmed service request
                      if ('appointmentDate' in item) {
                        return <AppointmentCard key={item.id} appointment={item as Appointment} currentUser={user} />;
                      } else {
                        return <ServiceRequestCard key={item.id} request={item as ServiceRequest} currentUser={user} />;
                      }
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">
                      {t('bookings.appointments.noAppointments')}
                    </h3>
                    <p className="text-gray-500 mb-6">
                      {t('bookings.appointments.willAppearHere')}
                    </p>
                    <Button onClick={() => window.location.href = "/providers"}>
                      {t('bookings.appointments.findProvidersBtn')}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Messaging Modal */}
        {showMessagingModal && selectedProvider && (
          <MessagingModal
            open={showMessagingModal}
            onOpenChange={setShowMessagingModal}
            currentUserId={user?.id || ""}
            recipientUserId={selectedProvider.id}
            recipientName={selectedProvider.name}
          />
        )}

        {/* Customer Rating Dialog */}
        {showCustomerRatingDialog && selectedCustomer && (
          <CustomerRatingDialog
            isOpen={showCustomerRatingDialog}
            onClose={() => {
              setShowCustomerRatingDialog(false);
              setSelectedCustomer(null);
            }}
            customerId={selectedCustomer.id}
            customerName={selectedCustomer.name}
            providerId={selectedCustomer.providerId}
          />
        )}
      </div>
  );
}