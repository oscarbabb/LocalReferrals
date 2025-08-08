import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { 
  Shield, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  FileText,
  Upload,
  User,
  MapPin,
  Briefcase,
  Star,
  Calendar,
  Eye
} from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import type { Provider, VerificationDocument, BackgroundCheck, VerificationReview } from "@shared/schema";

interface ProviderWithDetails extends Provider {
  user: {
    fullName: string;
    email: string;
    phone?: string;
    building?: string;
    apartment?: string;
  };
  averageRating: number;
  reviewCount: number;
}

export default function ProviderVerification() {
  const [selectedProviderId, setSelectedProviderId] = useState<string>("");
  const [verificationNotes, setVerificationNotes] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all providers
  const { data: providers = [], isLoading: providersLoading } = useQuery<Provider[]>({
    queryKey: ["/api/providers"],
  });

  // Fetch selected provider details
  const { data: selectedProvider, isLoading: providerLoading } = useQuery<ProviderWithDetails>({
    queryKey: ["/api/providers", selectedProviderId],
    enabled: !!selectedProviderId,
  });

  // Fetch verification documents for selected provider
  const { data: verificationDocuments = [], isLoading: documentsLoading } = useQuery<VerificationDocument[]>({
    queryKey: ["/api/providers", selectedProviderId, "verification-documents"],
    enabled: !!selectedProviderId,
  });

  // Fetch background checks for selected provider
  const { data: backgroundChecks = [], isLoading: checksLoading } = useQuery<BackgroundCheck[]>({
    queryKey: ["/api/providers", selectedProviderId, "background-checks"],
    enabled: !!selectedProviderId,
  });

  // Fetch verification reviews for selected provider
  const { data: verificationReviews = [], isLoading: reviewsLoading } = useQuery<VerificationReview[]>({
    queryKey: ["/api/providers", selectedProviderId, "verification-reviews"],
    enabled: !!selectedProviderId,
  });

  // Update verification status mutation
  const updateVerificationMutation = useMutation({
    mutationFn: async (data: {
      verificationStatus: string;
      verificationLevel?: string;
      backgroundCheckStatus?: string;
      verificationNotes?: string;
    }) => {
      const response = await fetch(`/api/providers/${selectedProviderId}/verification-status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update verification status');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Estado actualizado",
        description: "El estado de verificación se actualizó correctamente",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/providers", selectedProviderId] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado de verificación",
        variant: "destructive",
      });
    },
  });

  const getVerificationStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: "Pendiente", variant: "secondary" as const, icon: Clock },
      verified: { label: "Verificado", variant: "default" as const, icon: CheckCircle },
      rejected: { label: "Rechazado", variant: "destructive" as const, icon: XCircle },
      suspended: { label: "Suspendido", variant: "destructive" as const, icon: AlertTriangle },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon size={12} />
        {config.label}
      </Badge>
    );
  };

  const getBackgroundCheckBadge = (status: string) => {
    const statusConfig = {
      not_started: { label: "No iniciado", variant: "secondary" as const },
      in_progress: { label: "En progreso", variant: "secondary" as const },
      passed: { label: "Aprobado", variant: "default" as const },
      failed: { label: "Fallido", variant: "destructive" as const },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.not_started;
    
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const calculateVerificationProgress = (provider: Provider) => {
    let progress = 0;
    if (provider.documentsSubmitted) progress += 30;
    if (provider.backgroundCheckStatus === 'passed') progress += 40;
    if (provider.verificationStatus === 'verified') progress += 30;
    return progress;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Shield className="text-blue-600" size={32} />
            Sistema de Verificación de Proveedores
          </h1>
          <p className="text-gray-600 mt-2">
            Gestiona la verificación y antecedentes de proveedores de servicios
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Provider List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User size={20} />
                  Proveedores
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {providersLoading ? (
                    <div className="text-center py-4">Cargando proveedores...</div>
                  ) : (
                    providers.map((provider) => (
                      <div
                        key={provider.id}
                        className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                          selectedProviderId === provider.id
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        onClick={() => setSelectedProviderId(provider.id)}
                        data-testid={`provider-card-${provider.id}`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-medium text-sm">{provider.title}</h3>
                          {getVerificationStatusBadge(provider.verificationStatus || "pending")}
                        </div>
                        <div className="text-xs text-gray-500 mb-2">
                          Nivel: {provider.verificationLevel || "básico"}
                        </div>
                        <Progress 
                          value={calculateVerificationProgress(provider)} 
                          className="h-1.5"
                        />
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Provider Details */}
          <div className="lg:col-span-2">
            {selectedProviderId ? (
              <div className="space-y-6">
                {/* Provider Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User size={20} />
                      Información del Proveedor
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {providerLoading ? (
                      <div className="text-center py-4">Cargando detalles...</div>
                    ) : selectedProvider ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <h3 className="font-semibold text-lg">{selectedProvider.title}</h3>
                            <p className="text-gray-600">{selectedProvider.user?.fullName}</p>
                          </div>
                          
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <MapPin size={16} />
                            {selectedProvider.user?.building && selectedProvider.user?.apartment && 
                              `${selectedProvider.user.building} - Apto ${selectedProvider.user.apartment}`
                            }
                          </div>
                          
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Briefcase size={16} />
                            {selectedProvider.experience}
                          </div>
                          
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Star size={16} />
                            {selectedProvider.averageRating?.toFixed(1)} ({selectedProvider.reviewCount} reseñas)
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Estado de Verificación
                            </label>
                            {getVerificationStatusBadge(selectedProvider.verificationStatus || "pending")}
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Nivel de Verificación
                            </label>
                            <Badge variant="outline">
                              {selectedProvider.verificationLevel || "básico"}
                            </Badge>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Antecedentes
                            </label>
                            {getBackgroundCheckBadge(selectedProvider.backgroundCheckStatus || "not_started")}
                          </div>
                          
                          {selectedProvider.lastVerificationDate && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Calendar size={16} />
                              Verificado: {new Date(selectedProvider.lastVerificationDate).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>
                    ) : null}
                  </CardContent>
                </Card>

                {/* Verification Progress */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield size={20} />
                      Progreso de Verificación
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedProvider && (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Progreso Total</span>
                          <span className="text-sm text-gray-500">
                            {calculateVerificationProgress(selectedProvider)}%
                          </span>
                        </div>
                        <Progress value={calculateVerificationProgress(selectedProvider)} className="h-2" />
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                          <div className="text-center p-4 bg-gray-50 rounded-lg">
                            <FileText size={24} className="mx-auto mb-2 text-blue-600" />
                            <div className="text-sm font-medium">Documentos</div>
                            <div className="text-xs text-gray-500">
                              {selectedProvider.documentsSubmitted ? "Enviados" : "Pendientes"}
                            </div>
                          </div>
                          
                          <div className="text-center p-4 bg-gray-50 rounded-lg">
                            <Shield size={24} className="mx-auto mb-2 text-green-600" />
                            <div className="text-sm font-medium">Antecedentes</div>
                            <div className="text-xs text-gray-500">
                              {selectedProvider.backgroundCheckStatus === 'passed' ? "Aprobados" : 
                               selectedProvider.backgroundCheckStatus === 'in_progress' ? "En proceso" : "Pendientes"}
                            </div>
                          </div>
                          
                          <div className="text-center p-4 bg-gray-50 rounded-lg">
                            <CheckCircle size={24} className="mx-auto mb-2 text-purple-600" />
                            <div className="text-sm font-medium">Verificación</div>
                            <div className="text-xs text-gray-500">
                              {selectedProvider.verificationStatus === 'verified' ? "Completada" : "Pendiente"}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Verification Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Acciones de Verificación</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <Button
                          onClick={() => updateVerificationMutation.mutate({
                            verificationStatus: "verified",
                            verificationNotes
                          })}
                          disabled={updateVerificationMutation.isPending}
                          className="bg-green-600 hover:bg-green-700"
                          data-testid="button-approve-verification"
                        >
                          <CheckCircle size={16} className="mr-2" />
                          Aprobar
                        </Button>
                        
                        <Button
                          onClick={() => updateVerificationMutation.mutate({
                            verificationStatus: "rejected",
                            verificationNotes
                          })}
                          disabled={updateVerificationMutation.isPending}
                          variant="destructive"
                          data-testid="button-reject-verification"
                        >
                          <XCircle size={16} className="mr-2" />
                          Rechazar
                        </Button>
                        
                        <Button
                          onClick={() => updateVerificationMutation.mutate({
                            verificationStatus: "pending",
                            verificationNotes
                          })}
                          disabled={updateVerificationMutation.isPending}
                          variant="secondary"
                          data-testid="button-pending-verification"
                        >
                          <Clock size={16} className="mr-2" />
                          Pendiente
                        </Button>
                        
                        <Button
                          onClick={() => updateVerificationMutation.mutate({
                            verificationStatus: "suspended",
                            verificationNotes
                          })}
                          disabled={updateVerificationMutation.isPending}
                          variant="destructive"
                          data-testid="button-suspend-verification"
                        >
                          <AlertTriangle size={16} className="mr-2" />
                          Suspender
                        </Button>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Notas de Verificación
                        </label>
                        <Textarea
                          value={verificationNotes}
                          onChange={(e) => setVerificationNotes(e.target.value)}
                          placeholder="Agregar notas sobre la verificación..."
                          className="min-h-[100px]"
                          data-testid="textarea-verification-notes"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Provider Profile Link */}
                <Card>
                  <CardContent className="pt-6">
                    <Link href={`/provider/${selectedProviderId}`}>
                      <Button variant="outline" className="w-full" data-testid="button-view-profile">
                        <Eye size={16} className="mr-2" />
                        Ver Perfil Completo del Proveedor
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card className="h-96 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <User size={48} className="mx-auto mb-4 text-gray-300" />
                  <p>Selecciona un proveedor para ver sus detalles de verificación</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}