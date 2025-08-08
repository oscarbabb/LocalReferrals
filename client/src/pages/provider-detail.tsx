import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import Header from "@/components/header";
import AdvancedReviewForm from "@/components/advanced-review-form";
import EnhancedReviewCard from "@/components/enhanced-review-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Star, MapPin, Phone, Mail, MessageCircle, Calendar, Shield, Plus } from "lucide-react";

export default function ProviderDetail() {
  const [, params] = useRoute("/providers/:id");
  const providerId = params?.id;
  const [showReviewForm, setShowReviewForm] = useState(false);

  const { data: provider, isLoading } = useQuery({
    queryKey: ["/api/providers", providerId],
    enabled: !!providerId,
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ["/api/reviews", providerId],
    enabled: !!providerId,
  });

  const { data: user } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  // Calculate average rating from reviews
  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / reviews.length
    : 0;

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse">
            <div className="bg-white rounded-xl p-8 mb-8">
              <div className="flex items-start space-x-6">
                <div className="w-24 h-24 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-8 bg-gray-200 rounded mb-4 w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2 w-1/3"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Proveedor no encontrado</h1>
            <p className="text-gray-600">El proveedor que buscas no existe o ha sido eliminado.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Provider Header */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-start space-y-6 md:space-y-0 md:space-x-8">
              <Avatar className="w-24 h-24">
                <AvatarFallback className="bg-primary text-white text-2xl">
                  {provider.title ? getInitials(provider.title) : "P"}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                      {provider.title}
                    </h1>
                    <h2 className="text-xl text-gray-700 mb-3">Proveedor de Servicios</h2>
                  </div>
                  {provider.isVerified && (
                    <Badge className="bg-green-100 text-green-800 mb-4 md:mb-0">
                      <Shield className="w-4 h-4 mr-1" />
                      Verificado
                    </Badge>
                  )}
                </div>

                {averageRating > 0 && (
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="flex items-center">
                      <Star className="w-5 h-5 fill-yellow-400 text-yellow-400 mr-1" />
                      <span className="text-lg font-semibold">{averageRating.toFixed(1)}</span>
                      <span className="text-gray-500 ml-2">({reviews.length} reseñas)</span>
                    </div>
                  </div>
                )}

                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center space-x-4 text-gray-600 mb-4 md:mb-0">
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span>Edificio Local</span>
                    </div>
                  </div>
                  
                  {provider.hourlyRate && (
                    <div className="text-right">
                      <div className="text-3xl font-bold text-gray-900">
                        ${provider.hourlyRate}
                      </div>
                      <div className="text-gray-500">por hora</div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <Separator className="my-6" />
            
            <div className="flex flex-col md:flex-row gap-4">
              <Button size="lg" className="bg-primary text-white hover:bg-blue-700 flex-1">
                <MessageCircle className="w-5 h-5 mr-2" />
                Enviar Mensaje
              </Button>
              <Button variant="outline" size="lg" className="flex-1">
                <Calendar className="w-5 h-5 mr-2" />
                Solicitar Servicio
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>Acerca del Servicio</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">{provider.description}</p>
                {provider.experience && (
                  <div className="mt-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Experiencia</h4>
                    <p className="text-gray-700">{provider.experience}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Advanced Reviews Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Reseñas ({reviews.length})</CardTitle>
                  {user && (
                    <Button
                      onClick={() => setShowReviewForm(true)}
                      className="bg-orange-500 hover:bg-orange-600 text-white"
                      data-testid="button-add-review"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Agregar Reseña
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {showReviewForm && user && (
                  <div className="mb-8">
                    <AdvancedReviewForm
                      providerId={provider.id}
                      reviewerId={user.id}
                      onSubmit={() => setShowReviewForm(false)}
                      onCancel={() => setShowReviewForm(false)}
                    />
                  </div>
                )}
                
                {reviews.length > 0 ? (
                  <div className="space-y-6">
                    {reviews.map((review: any) => (
                      <EnhancedReviewCard
                        key={review.id}
                        review={review}
                        data-testid={`card-review-${review.id}`}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      No hay reseñas aún
                    </h3>
                    <p className="text-gray-500 mb-6">
                      Se el primero en reseñar este proveedor y ayuda a otros usuarios.
                    </p>
                    {user && (
                      <Button
                        onClick={() => setShowReviewForm(true)}
                        className="bg-orange-500 hover:bg-orange-600 text-white"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Escribir Primera Reseña
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Contact Info */}
            <Card>
              <CardHeader>
                <CardTitle>Información de Contacto</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="font-medium">Edificio Local</p>
                    <p className="text-sm text-gray-600">Comunidad Referencias Locales</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <p>Contacto disponible</p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Estadísticas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Miembro desde</span>
                  <span className="font-medium">
                    {new Date(provider.createdAt).toLocaleDateString('es-ES')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Servicios completados</span>
                  <span className="font-medium">{reviews.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Calificación promedio</span>
                  <span className="font-medium">
                    {averageRating > 0 ? `${averageRating.toFixed(1)}/5` : "Sin calificar"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Estado</span>
                  <span className="font-medium">
                    {provider.isActive ? "Activo" : "Inactivo"}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
