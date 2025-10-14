import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, Quote, CheckCircle, Heart, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

interface Testimonial {
  id: string;
  name: string;
  apartment: string;
  building: string;
  rating: number;
  service: string;
  testimonial: string;
  date: string;
  verified: boolean;
  avatar: string;
  providerName: string;
}

const testimonials: Testimonial[] = [];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-4 h-4 ${
            star <= rating 
              ? 'text-yellow-400 fill-current' 
              : 'text-gray-300'
          }`}
        />
      ))}
    </div>
  );
}

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <Card className="h-full hover:shadow-lg transition-shadow duration-300" data-testid={`card-testimonial-${testimonial.id}`}>
      <CardContent className="p-6">
        <div className="flex items-start gap-4 mb-4">
          <Avatar className="w-12 h-12">
            <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
            <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h4 className="font-semibold text-gray-900" data-testid="text-testimonial-name">
                  {testimonial.name}
                </h4>
                <p className="text-sm text-gray-500" data-testid="text-testimonial-location">
                  {testimonial.building}, {testimonial.apartment}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {testimonial.verified && (
                  <Badge variant="secondary" className="text-green-600 bg-green-50">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Verificado
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2 mb-2">
              <StarRating rating={testimonial.rating} />
              <span className="text-sm text-gray-500">•</span>
              <Badge variant="outline" className="text-xs">
                {testimonial.service}
              </Badge>
            </div>
          </div>
        </div>

        <div className="relative">
          <Quote className="absolute -top-2 -left-2 w-8 h-8 text-orange-200" />
          <blockquote className="text-gray-700 leading-relaxed pl-6 italic" data-testid="text-testimonial-content">
            "{testimonial.testimonial}"
          </blockquote>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">
              Proveedor: <span className="font-medium text-gray-900">{testimonial.providerName}</span>
            </span>
            <span className="text-gray-400" data-testid="text-testimonial-date">
              {testimonial.date}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Testimonials() {
  const averageRating = testimonials.reduce((sum, t) => sum + t.rating, 0) / testimonials.length;
  const totalTestimonials = testimonials.length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <Link href="/" className="inline-flex items-center text-white/80 hover:text-white mb-6 transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al Inicio
            </Link>
            
            <div className="flex justify-center items-center mb-6">
              <Heart className="w-8 h-8 mr-3" />
              <h1 className="text-4xl font-bold">
                Testimonios de Vecinos
              </h1>
            </div>
            
            <p className="text-xl text-orange-100 mb-8 max-w-3xl mx-auto">
              Descubre las experiencias reales de nuestros vecinos con los servicios locales de confianza
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-8">
              <div className="text-center">
                <div className="text-3xl font-bold mb-1">{averageRating.toFixed(1)}</div>
                <div className="flex justify-center mb-1">
                  <StarRating rating={Math.round(averageRating)} />
                </div>
                <div className="text-sm text-orange-200">Calificación Promedio</div>
              </div>
              
              <div className="hidden sm:block w-px h-12 bg-orange-300"></div>
              
              <div className="text-center">
                <div className="text-3xl font-bold mb-1">{totalTestimonials}</div>
                <div className="text-sm text-orange-200">Testimonios Reales</div>
              </div>
              
              <div className="hidden sm:block w-px h-12 bg-orange-300"></div>
              
              <div className="text-center">
                <div className="text-3xl font-bold mb-1">100%</div>
                <div className="text-sm text-orange-200">Satisfacción</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial) => (
            <TestimonialCard key={testimonial.id} testimonial={testimonial} />
          ))}
        </div>

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                ¿Quieres ser parte de nuestra comunidad?
              </h3>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                Únete a cientos de vecinos que ya disfrutan de servicios de confianza. 
                Encuentra el servicio que necesitas o comparte tu talento con la comunidad.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/services">
                  <Button className="bg-orange-500 hover:bg-orange-600 text-white px-8" data-testid="button-find-services">
                    Buscar Servicios
                  </Button>
                </Link>
                <Link href="/providers">
                  <Button variant="outline" className="border-orange-500 text-orange-600 hover:bg-orange-50 px-8" data-testid="button-become-provider">
                    Ser Proveedor
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