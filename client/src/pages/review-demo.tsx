import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StarIcon, HeartIcon, ShieldCheckIcon, CameraIcon } from "lucide-react";
import { Link } from "wouter";

export default function ReviewDemo() {
  // Sample review data for demonstration
  const sampleReviews = [
    {
      id: "1",
      reviewer: "María González",
      rating: 5,
      serviceQuality: 5,
      communication: 5,
      punctuality: 4,
      valueForMoney: 5,
      comment: "Excelente servicio de limpieza. Muy profesional y detallista. Mi apartamento quedó impecable y el precio fue muy justo.",
      providerName: "Ana Cleaning Services",
      serviceType: "Limpieza de hogar",
      date: "Hace 2 días",
      wouldRecommend: true,
      isVerified: true,
      photos: 2
    },
    {
      id: "2", 
      reviewer: "Carlos Ruiz",
      rating: 5,
      serviceQuality: 5,
      communication: 5,
      punctuality: 5,
      valueForMoney: 4,
      comment: "Miguel es un excelente tutor de matemáticas. Mi hijo mejoró sus calificaciones significativamente. Muy recomendado para familias en el edificio.",
      providerName: "Miguel Tutorías",
      serviceType: "Clases particulares",
      date: "Hace 1 semana",
      wouldRecommend: true,
      isVerified: true,
      photos: 0
    },
    {
      id: "3",
      reviewer: "Elena Morales", 
      rating: 4,
      serviceQuality: 4,
      communication: 5,
      punctuality: 3,
      valueForMoney: 4,
      comment: "Buen trabajo en la reparación del lavabo. Llegó un poco tarde pero resolvió el problema rápidamente y a buen precio.",
      providerName: "Plomería Express",
      serviceType: "Plomería",
      date: "Hace 3 días",
      wouldRecommend: true,
      isVerified: true,
      photos: 1
    }
  ];

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <StarIcon
        key={i}
        className={`w-4 h-4 ${
          i < rating ? "text-yellow-400 fill-current" : "text-gray-300"
        }`}
      />
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl mb-6 shadow-lg">
            <StarIcon className="w-8 h-8 text-white fill-current" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Sistema de <span className="text-orange-600">Reseñas</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Descubre cómo nuestro sistema de reseñas avanzado garantiza confianza y transparencia en cada servicio.
          </p>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="border-orange-200 shadow-lg">
            <CardHeader className="text-center">
              <ShieldCheckIcon className="w-12 h-12 text-orange-600 mx-auto mb-4" />
              <CardTitle className="text-orange-900">Reseñas Verificadas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-center">
                Solo usuarios que han contratado el servicio pueden dejar reseñas, garantizando autenticidad.
              </p>
            </CardContent>
          </Card>

          <Card className="border-blue-200 shadow-lg">
            <CardHeader className="text-center">
              <StarIcon className="w-12 h-12 text-blue-600 mx-auto mb-4 fill-current" />
              <CardTitle className="text-blue-900">Evaluación Detallada</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-center">
                Calificaciones específicas: calidad, comunicación, puntualidad y relación calidad-precio.
              </p>
            </CardContent>
          </Card>

          <Card className="border-green-200 shadow-lg">
            <CardHeader className="text-center">
              <CameraIcon className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <CardTitle className="text-green-900">Fotos Incluidas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-center">
                Los usuarios pueden subir fotos del trabajo realizado para mayor transparencia.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Sample Reviews */}
        <div className="space-y-6 mb-12">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
            Ejemplos de Reseñas Reales
          </h2>

          {sampleReviews.map((review) => (
            <Card key={review.id} className="shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-lg">{review.reviewer}</h3>
                      {review.isVerified && (
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          <ShieldCheckIcon className="w-3 h-3 mr-1" />
                          Verificado
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">{review.serviceType} • {review.date}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 mb-1">
                      {renderStars(review.rating)}
                    </div>
                    <p className="text-sm font-medium text-gray-700">{review.rating}/5</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4">{review.comment}</p>
                
                {/* Detailed Ratings */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <p className="text-xs text-gray-500 mb-1">Calidad</p>
                    <div className="flex justify-center">
                      {renderStars(review.serviceQuality)}
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500 mb-1">Comunicación</p>
                    <div className="flex justify-center">
                      {renderStars(review.communication)}
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500 mb-1">Puntualidad</p>
                    <div className="flex justify-center">
                      {renderStars(review.punctuality)}
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500 mb-1">Valor</p>
                    <div className="flex justify-center">
                      {renderStars(review.valueForMoney)}
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-600 font-medium">{review.providerName}</p>
                  <div className="flex items-center gap-4">
                    {review.photos > 0 && (
                      <Badge variant="outline" className="text-blue-600">
                        <CameraIcon className="w-3 h-3 mr-1" />
                        {review.photos} foto{review.photos > 1 ? 's' : ''}
                      </Badge>
                    )}
                    {review.wouldRecommend && (
                      <Badge variant="outline" className="text-green-600">
                        <HeartIcon className="w-3 h-3 mr-1" />
                        Recomendado
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <Card className="bg-gradient-to-r from-orange-500 to-blue-600 text-white shadow-xl">
            <CardContent className="py-8">
              <h3 className="text-2xl font-bold mb-4">¿Listo para encontrar tu proveedor ideal?</h3>
              <p className="text-lg mb-6 opacity-90">
                Explora servicios verificados y lee reseñas reales de tu comunidad
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/providers">
                  <Button size="lg" variant="secondary" className="bg-white text-gray-900 hover:bg-gray-100">
                    Ver Proveedores
                  </Button>
                </Link>
                <Link href="/services">
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-gray-900">
                    Explorar Servicios
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}