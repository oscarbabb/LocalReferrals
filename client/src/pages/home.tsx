import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import Header from "@/components/header";
import ServiceCard from "@/components/service-card";
import ProviderCard from "@/components/provider-card";
import TestimonialCard from "@/components/testimonial-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, MessageCircle, Handshake, UserCheck, Home as HomeIcon, ArrowRight } from "lucide-react";
import type { ServiceCategory } from "@shared/schema";
import logoPath from "@assets/Logo 2 test_1754014544538.png";

export default function Home() {
  const { data: categories = [] } = useQuery<ServiceCategory[]>({
    queryKey: ["/api/categories"],
  });

  const { data: providers = [] } = useQuery({
    queryKey: ["/api/providers"],
  });

  const featuredProviders = (providers as any[]).slice(0, 3);

  const testimonials = [
    {
      rating: 5,
      comment: "María es increíble! Deja mi apartamento impecable y siempre es muy confiable. Es genial tener servicios de calidad tan cerca.",
      author: "Sofia M.",
      location: "Edificio A, Apt 304",
    },
    {
      rating: 5,
      comment: "Carlos arregló mi grifo en minutos. Súper profesional y precios justos. Definitivamente mi primera opción para reparaciones.",
      author: "Diego L.",
      location: "Edificio B, Apt 201",
    },
    {
      rating: 5,
      comment: "Mi hija mejoró muchísimo en matemáticas gracias a Ana. Es muy paciente y explica súper bien. ¡100% recomendada!",
      author: "Carmen R.",
      location: "Edificio C, Apt 405",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-white via-orange-50 to-blue-50 py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {/* Large Centered Logo */}
            <div className="mb-8">
              <img 
                src={logoPath} 
                alt="Referencias Locales Logo" 
                className="w-32 h-32 md:w-48 md:h-48 lg:w-64 lg:h-64 mx-auto object-contain drop-shadow-lg"
              />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Encuentra Servicios <br className="hidden sm:block" />
              <span className="text-primary">de Confianza</span> <span className="text-accent">en tu Comunidad</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Conecta con vecinos que ofrecen servicios verificados. Desde limpieza hasta tutorías, 
              encuentra profesionales recomendados por tu propia comunidad.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/services">
                <Button size="lg" className="bg-gradient-to-r from-primary to-blue-600 text-white hover:from-blue-600 hover:to-primary px-8 py-4 text-lg w-full sm:w-auto shadow-lg">
                  Explorar Servicios
                </Button>
              </Link>
              <Link href="/review-demo">
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="border-2 border-orange-500 text-orange-600 hover:bg-orange-50 hover:text-orange-700 px-8 py-4 text-lg w-full sm:w-auto shadow-lg"
                >
                  Ver Sistema de Reseñas
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Service Categories */}
      <section id="servicios" className="py-20 bg-gradient-to-b from-gray-50 via-orange-50 to-white relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 bg-grid-gray-100/50 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] pattern-dots"></div>
        <div className="absolute top-10 left-10 w-72 h-72 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-2000"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl mb-6 shadow-lg">
              <HomeIcon className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Categorías de <span className="text-orange-600">Servicios</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Descubre servicios de calidad verificados por tu propia comunidad. Cada categoría está diseñada para satisfacer tus necesidades específicas.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {categories.map((category) => (
              <ServiceCard 
                key={category.id} 
                category={category} 
                providerCount={Math.floor(Math.random() * 15) + 8} 
              />
            ))}
          </div>

          {/* Call to action */}
          <div className="text-center mt-16">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-orange-200/50">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                ¿No encuentras lo que buscas?
              </h3>
              <p className="text-gray-600 mb-6">
                Explora todas nuestras categorías o solicita un nuevo servicio
              </p>
              <Link href="/services">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-lg"
                >
                  Ver Todos los Servicios
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Providers */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Proveedores Destacados</h2>
            <p className="text-xl text-gray-600">Los más recomendados por tu comunidad</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProviders.map((provider: any) => (
              <ProviderCard key={provider.id} provider={provider} />
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/providers">
              <Button 
                variant="outline" 
                size="lg"
                className="border-2 border-accent text-accent hover:bg-gradient-to-r hover:from-accent hover:to-orange-500 hover:text-white px-8 py-3 text-lg shadow-md"
              >
                Ver Todos los Proveedores
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="como-funciona" className="py-16 bg-gradient-to-b from-orange-50 to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">¿Cómo Funciona?</h2>
            <p className="text-xl text-gray-600">Simple, seguro y confiable</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-primary to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-3xl font-bold text-white">1</span>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Busca y Filtra</h3>
              <p className="text-gray-600 text-lg">Explora servicios por categoría, ubicación y calificaciones. Encuentra exactamente lo que necesitas.</p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-accent to-orange-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-3xl font-bold text-white">2</span>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Conecta Directamente</h3>
              <p className="text-gray-600 text-lg">Envía mensajes directos a los proveedores. Coordina detalles, horarios y precios fácilmente.</p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-3xl font-bold text-white">3</span>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Califica y Recomienda</h3>
              <p className="text-gray-600 text-lg">Después del servicio, deja una reseña para ayudar a otros vecinos a tomar mejores decisiones.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-16 bg-white pattern-grid">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Confianza y Seguridad</h2>
            <p className="text-xl text-gray-600">Tu tranquilidad es nuestra prioridad</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-50 border-2 border-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Proveedores Verificados</h3>
              <p className="text-gray-600">Todos los proveedores son residentes verificados de tu comunidad</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-orange-50 border-2 border-accent rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Sistema de Reseñas</h3>
              <p className="text-gray-600">Calificaciones y comentarios reales de vecinos como tú</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Handshake className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Comunidad Local</h3>
              <p className="text-gray-600">Solo servicios dentro de tu edificio o complejo residencial</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-4">
                <UserCheck className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Perfiles Completos</h3>
              <p className="text-gray-600">Información detallada, experiencia y referencias de cada proveedor</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonios" className="py-16 bg-gradient-to-b from-gray-50 to-orange-50 pattern-dots">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Lo Que Dicen Nuestros Usuarios</h2>
            <p className="text-xl text-gray-600">Experiencias reales de nuestra comunidad</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <TestimonialCard key={index} {...testimonial} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary via-blue-600 to-accent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            ¿Listo para Conectar con tu Comunidad?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Únete a cientos de vecinos que ya encontraron servicios de confianza en Referencias Locales
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/auth">
              <Button size="lg" className="bg-white text-primary hover:bg-gray-100 shadow-lg px-8 py-4 text-lg w-full sm:w-auto">
                Comenzar Ahora
              </Button>
            </Link>
            <Link href="#como-funciona">
              <Button 
                variant="outline" 
                size="lg"
                className="border-2 border-white text-white bg-transparent hover:bg-white hover:text-primary shadow-lg px-8 py-4 text-lg w-full sm:w-auto"
              >
                Saber Más
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <img src="/logo.png" alt="Referencias Locales" className="w-10 h-10" />
                <span className="text-xl font-bold">Referencias Locales</span>
              </div>
              <p className="text-gray-300 mb-4">
                Conectamos vecinos con servicios de confianza dentro de sus propias comunidades residenciales.
              </p>
              <div className="flex space-x-4">
                <span className="text-2xl text-gray-400 hover:text-white cursor-pointer">📘</span>
                <span className="text-2xl text-gray-400 hover:text-white cursor-pointer">🐦</span>
                <span className="text-2xl text-gray-400 hover:text-white cursor-pointer">📷</span>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Enlaces</h3>
              <ul className="space-y-2">
                <li><Link href="/services" className="text-gray-300 hover:text-white">Servicios</Link></li>
                <li><Link href="/como-funciona" className="text-gray-300 hover:text-white">Cómo Funciona</Link></li>
                <li><Link href="/testimonials" className="text-gray-300 hover:text-white">Testimonios</Link></li>
                <li><Link href="/verification" className="text-gray-300 hover:text-white">Verificación</Link></li>
                <li><a href="#" className="text-gray-300 hover:text-white">Ayuda</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-300 hover:text-white">Términos de Uso</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white">Privacidad</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white">Cookies</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white">Contacto</a></li>
              </ul>
            </div>
          </div>

          <hr className="border-gray-800 my-8" />
          
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2024 Referencias Locales. Todos los derechos reservados.
            </p>
            <p className="text-gray-400 text-sm mt-2 md:mt-0">
              Hecho con ❤️ para tu comunidad
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
