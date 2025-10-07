import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import AdvancedReviewForm from "@/components/advanced-review-form";
import EnhancedReviewCard from "@/components/enhanced-review-card";
import QuickBookingButton from "@/components/quick-booking-button";
import PayForServiceButton from "@/components/pay-for-service-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Star, MapPin, Phone, Mail, MessageCircle, Calendar, Shield, Plus, ChefHat, Edit } from "lucide-react";
import { Provider, User, Review, MenuItem, MenuItemVariation } from "@shared/schema";

// Extended types for API responses
interface ReviewWithReviewer extends Review {
  reviewer: User;
}

interface ProviderWithDetails extends Provider {
  user: User;
  reviews: ReviewWithReviewer[];
  reviewCount: number;
  averageRating: number;
}

interface MenuItemWithVariations extends MenuItem {
  variations?: MenuItemVariation[];
}

export default function ProviderDetail() {
  const [, params] = useRoute("/providers/:id");
  const [, setLocation] = useLocation();
  const providerId = params?.id;
  const [showReviewForm, setShowReviewForm] = useState(false);

  const { data: provider, isLoading } = useQuery<ProviderWithDetails>({
    queryKey: ["/api/providers", providerId],
    enabled: !!providerId,
  });

  const { data: menuItems = [] } = useQuery<MenuItemWithVariations[]>({
    queryKey: ["/api/menu-items", providerId],
    enabled: !!providerId,
  });

  const { data: user } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  // Check if the logged-in user is the owner of this provider profile
  const isOwnProfile = user?.id === provider?.userId;

  // Use the calculated average rating from the API
  const averageRating = provider?.averageRating || 0;
  const reviews = provider?.reviews || [];

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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Provider Header */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-start space-y-6 md:space-y-0 md:space-x-8">
              <Avatar className="w-24 h-24">
                {provider.user?.avatar && (
                  <AvatarImage 
                    src={provider.user.avatar} 
                    alt={provider.user?.fullName || "Proveedor"}
                    data-testid="img-provider-avatar"
                  />
                )}
                <AvatarFallback className="bg-primary text-white text-2xl">
                  {provider.user?.fullName ? getInitials(provider.user.fullName) : "P"}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2" data-testid="text-provider-name">
                      {provider.user?.fullName || 'Proveedor'}
                    </h1>
                    <h2 className="text-xl text-gray-700 mb-3" data-testid="text-provider-title">{provider.title}</h2>
                  </div>
                  {provider.isVerified && (
                    <Badge className="bg-green-100 text-green-800 mb-4 md:mb-0" data-testid="badge-verified">
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
                    <div className="flex items-center" data-testid="text-provider-location">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span>{provider.user?.building || 'Edificio Local'}</span>
                    </div>
                  </div>
                  
                  {provider.hourlyRate && (
                    <div className="text-right">
                      <div className="text-3xl font-bold text-gray-900">
                        MXN ${provider.hourlyRate}
                      </div>
                      <div className="text-gray-500">por hora</div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <Separator className="my-6" />
            
            <div className="flex flex-col md:flex-row gap-4">
              <QuickBookingButton 
                provider={provider} 
                size="lg" 
                className="flex-1"
              />
              <Button variant="outline" size="lg" className="flex-1">
                <MessageCircle className="w-5 h-5 mr-2" />
                Enviar Mensaje
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
                <p className="text-gray-700 leading-relaxed" data-testid="text-provider-description">{provider.description}</p>
                {provider.experience && (
                  <div className="mt-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Experiencia</h4>
                    <p className="text-gray-700" data-testid="text-provider-experience">{provider.experience}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Menu Items Section */}
            {menuItems && menuItems.length > 0 && (
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="flex items-center">
                      <ChefHat className="w-5 h-5 mr-2" />
                      Menú de Servicios ({menuItems.length})
                    </CardTitle>
                    {isOwnProfile && (
                      <Button 
                        onClick={() => setLocation('/menu-management')}
                        className="bg-orange-600 hover:bg-orange-700"
                        data-testid="button-manage-own-menu"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Gestionar Menú
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6">
                    {Object.entries(
                      menuItems.reduce((grouped, item) => {
                        const category = item.categoryName;
                        if (!grouped[category]) grouped[category] = [];
                        grouped[category].push(item);
                        return grouped;
                      }, {} as Record<string, MenuItemWithVariations[]>)
                    ).map(([categoryName, categoryItems]) => (
                      <div key={categoryName}>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
                          {categoryName}
                        </h3>
                        <div className="grid gap-4">
                          {categoryItems.map((item) => (
                            <div 
                              key={item.id} 
                              className="flex justify-between items-start p-4 bg-gray-50 rounded-lg"
                              data-testid={`card-menu-item-${item.id}`}
                            >
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900 mb-1" data-testid={`text-menu-name-${item.id}`}>
                                  {item.itemName}
                                </h4>
                                {item.description && (
                                  <p className="text-sm text-gray-600 mb-2" data-testid={`text-menu-desc-${item.id}`}>
                                    {item.description}
                                  </p>
                                )}
                                {item.duration && (
                                  <p className="text-xs text-gray-500">
                                    Duración: {item.duration} minutos
                                  </p>
                                )}
                                {!item.isAvailable && (
                                  <Badge variant="secondary" className="mt-2">No disponible</Badge>
                                )}
                              </div>
                              <div className="text-right ml-4">
                                <span className="text-lg font-semibold text-gray-900" data-testid={`text-menu-price-${item.id}`}>
                                  MXN ${item.price}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Empty Menu State - Only for own profile */}
            {menuItems && menuItems.length === 0 && isOwnProfile && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <ChefHat className="w-5 h-5 mr-2" />
                    Menú de Servicios
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <ChefHat className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      No tienes servicios en tu menú
                    </h3>
                    <p className="text-gray-500 mb-6">
                      Agrega servicios a tu menú para que los clientes puedan reservarlos y conocer tus precios.
                    </p>
                    <Button 
                      onClick={() => setLocation('/menu-management')}
                      className="bg-orange-600 hover:bg-orange-700"
                      data-testid="button-manage-own-menu"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Agregar Primer Servicio
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

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
                    {reviews.map((review) => (
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
                    <p className="font-medium" data-testid="text-contact-building">
                      {provider.user?.building || 'Edificio Local'}
                    </p>
                    <p className="text-sm text-gray-600">
                      {provider.user?.apartment && `Apartamento ${provider.user.apartment}, `}
                      {provider.user?.section || 'Comunidad Referencias Locales'}
                    </p>
                  </div>
                </div>
                {provider.user?.phone && (
                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <p data-testid="text-contact-phone">{provider.user.phone}</p>
                  </div>
                )}
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
                    {new Date(provider.createdAt || Date.now()).toLocaleDateString('es-ES')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Servicios completados</span>
                  <span className="font-medium" data-testid="text-stat-completed">{provider.reviewCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Calificación promedio</span>
                  <span className="font-medium" data-testid="text-stat-rating">
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

            {/* Payment and Booking Options */}
            <div className="space-y-4">
              <PayForServiceButton
                providerId={provider.id}
                providerName={provider.user?.fullName || 'Proveedor'}
                serviceName={provider.title}
                hourlyRate={provider.hourlyRate}
                description={provider.description}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}