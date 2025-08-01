import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Star, MapPin, Phone, Mail, MessageCircle, Calendar, Shield } from "lucide-react";

export default function ProviderDetail() {
  const [, params] = useRoute("/providers/:id");
  const providerId = params?.id;

  const { data: provider, isLoading } = useQuery({
    queryKey: ["/api/providers", providerId],
    enabled: !!providerId,
  });

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
                  {getInitials(provider.user.fullName)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                      {provider.user.fullName}
                    </h1>
                    <h2 className="text-xl text-gray-700 mb-3">{provider.title}</h2>
                  </div>
                  {provider.isVerified && (
                    <Badge className="bg-green-100 text-green-800 mb-4 md:mb-0">
                      <Shield className="w-4 h-4 mr-1" />
                      Verificado
                    </Badge>
                  )}
                </div>

                {provider.averageRating > 0 && (
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="flex items-center">
                      <Star className="w-5 h-5 fill-yellow-400 text-yellow-400 mr-1" />
                      <span className="text-lg font-semibold">{provider.averageRating}</span>
                      <span className="text-gray-500 ml-2">({provider.reviewCount} reseñas)</span>
                    </div>
                  </div>
                )}

                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center space-x-4 text-gray-600 mb-4 md:mb-0">
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span>{provider.user.building}, Apt {provider.user.apartment}</span>
                    </div>
                    {provider.user.phone && (
                      <div className="flex items-center">
                        <Phone className="w-4 h-4 mr-1" />
                        <span>{provider.user.phone}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="text-right">
                    <div className="text-3xl font-bold text-gray-900">
                      ${provider.hourlyRate}
                    </div>
                    <div className="text-gray-500">por hora</div>
                  </div>
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

            {/* Reviews */}
            <Card>
              <CardHeader>
                <CardTitle>Reseñas ({provider.reviewCount})</CardTitle>
              </CardHeader>
              <CardContent>
                {provider.reviews && provider.reviews.length > 0 ? (
                  <div className="space-y-6">
                    {provider.reviews.map((review: any) => (
                      <div key={review.id} className="border-b border-gray-200 last:border-b-0 pb-6 last:pb-0">
                        <div className="flex items-start space-x-4">
                          <Avatar className="w-10 h-10">
                            <AvatarFallback className="bg-gray-300 text-gray-600">
                              {getInitials(review.reviewer.fullName)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h5 className="font-semibold text-gray-900">
                                {review.reviewer.fullName}
                              </h5>
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-4 h-4 ${
                                      i < review.rating
                                        ? "fill-yellow-400 text-yellow-400"
                                        : "text-gray-300"
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                            <p className="text-gray-700">{review.comment}</p>
                            <p className="text-sm text-gray-500 mt-2">
                              {new Date(review.createdAt).toLocaleDateString('es-ES')}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    Este proveedor aún no tiene reseñas.
                  </p>
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
                    <p className="font-medium">{provider.user.building}</p>
                    <p className="text-sm text-gray-600">Apartamento {provider.user.apartment}</p>
                  </div>
                </div>
                {provider.user.phone && (
                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <p>{provider.user.phone}</p>
                  </div>
                )}
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <p>{provider.user.email}</p>
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
                    {new Date(provider.user.createdAt).toLocaleDateString('es-ES')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Servicios completados</span>
                  <span className="font-medium">{provider.reviewCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Calificación promedio</span>
                  <span className="font-medium">
                    {provider.averageRating > 0 ? `${provider.averageRating}/5` : "Sin calificar"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tiempo de respuesta</span>
                  <span className="font-medium">~2 horas</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
