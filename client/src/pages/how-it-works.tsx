import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Users, 
  MessageCircle, 
  Star, 
  Shield, 
  Calendar, 
  CheckCircle, 
  ArrowRight, 
  Home, 
  UserCheck, 
  Clock, 
  Award,
  ArrowLeft,
  PlayCircle,
  Smartphone,
  MapPin,
  CreditCard,
  HeartHandshake
} from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";

interface Step {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  details: string[];
  color: string;
}

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
  benefits: string[];
}

const steps: Step[] = [
  {
    id: 1,
    title: "Explora Servicios",
    description: "Descubre servicios verificados en tu comunidad",
    icon: <Search className="w-8 h-8" />,
    details: [
      "Navega por categorías de servicios organizadas",
      "Usa filtros para encontrar exactamente lo que necesitas",
      "Ve perfiles detallados de cada proveedor",
      "Revisa calificaciones y reseñas de otros vecinos"
    ],
    color: "from-blue-500 to-blue-600"
  },
  {
    id: 2,
    title: "Conecta con Proveedores",
    description: "Contacta directamente con profesionales de tu edificio",
    icon: <Users className="w-8 h-8" />,
    details: [
      "Ve información verificada de cada proveedor",
      "Revisa sus especialidades y experiencia",
      "Consulta disponibilidad en tiempo real",
      "Lee testimonios de vecinos que ya usaron sus servicios"
    ],
    color: "from-green-500 to-green-600"
  },
  {
    id: 3,
    title: "Agenda tu Servicio",
    description: "Reserva citas de manera fácil y rápida",
    icon: <Calendar className="w-8 h-8" />,
    details: [
      "Selecciona fecha y hora que te convenga",
      "Confirma detalles del servicio",
      "Recibe confirmación instantánea",
      "Gestiona tus citas desde un solo lugar"
    ],
    color: "from-orange-500 to-orange-600"
  },
  {
    id: 4,
    title: "Disfruta y Califica",
    description: "Recibe el servicio y comparte tu experiencia",
    icon: <Star className="w-8 h-8" />,
    details: [
      "Disfruta de un servicio de calidad",
      "Deja tu reseña detallada con fotos",
      "Califica diferentes aspectos del servicio",
      "Ayuda a otros vecinos con tu experiencia"
    ],
    color: "from-purple-500 to-purple-600"
  }
];

const features: Feature[] = [
  {
    icon: <Shield className="w-6 h-6" />,
    title: "Seguridad Verificada",
    description: "Todos los proveedores son verificados y validados por la comunidad",
    benefits: [
      "Identidad confirmada",
      "Referencias de vecinos", 
      "Historial de servicios",
      "Sistema de calificaciones"
    ]
  },
  {
    icon: <MapPin className="w-6 h-6" />,
    title: "Servicios Locales",
    description: "Encuentra proveedores en tu mismo edificio o vecindario",
    benefits: [
      "Disponibilidad inmediata",
      "Conocimiento local",
      "Confianza comunitaria",
      "Precios justos"
    ]
  },
  {
    icon: <Clock className="w-6 h-6" />,
    title: "Reservas Instantáneas",
    description: "Agenda servicios en tiempo real con confirmación inmediata",
    benefits: [
      "Calendario integrado",
      "Disponibilidad en vivo",
      "Confirmación automática",
      "Recordatorios incluidos"
    ]
  },
  {
    icon: <Award className="w-6 h-6" />,
    title: "Calidad Garantizada",
    description: "Sistema avanzado de reseñas con fotos y calificaciones detalladas",
    benefits: [
      "Reseñas con evidencia",
      "Múltiples criterios",
      "Comentarios verificados",
      "Transparencia total"
    ]
  }
];

function StepCard({ step, isActive, onClick }: { step: Step; isActive: boolean; onClick: () => void }) {
  return (
    <Card 
      className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
        isActive ? 'ring-2 ring-orange-500 shadow-lg scale-105' : 'hover:scale-102'
      }`}
      onClick={onClick}
      data-testid={`card-step-${step.id}`}
    >
      <CardContent className="p-6">
        <div className="flex items-center mb-4">
          <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${step.color} flex items-center justify-center text-white mr-4`}>
            {step.icon}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="text-xs">
                Paso {step.id}
              </Badge>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">{step.title}</h3>
          </div>
        </div>
        
        <p className="text-gray-600 mb-4">{step.description}</p>
        
        {isActive && (
          <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
            {step.details.map((detail, index) => (
              <div key={index} className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-700">{detail}</span>
              </div>
            ))}
          </div>
        )}
        
        {!isActive && (
          <Button variant="ghost" size="sm" className="text-orange-600 hover:text-orange-700 p-0">
            Ver detalles <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

function FeatureCard({ feature }: { feature: Feature }) {
  return (
    <Card className="h-full hover:shadow-lg transition-shadow duration-300" data-testid="card-feature">
      <CardContent className="p-6">
        <div className="flex items-center mb-4">
          <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600 mr-4">
            {feature.icon}
          </div>
          <h3 className="text-lg font-semibold text-gray-900">{feature.title}</h3>
        </div>
        
        <p className="text-gray-600 mb-4">{feature.description}</p>
        
        <div className="space-y-2">
          {feature.benefits.map((benefit, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-orange-500" />
              <span className="text-sm text-gray-700">{benefit}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function HowItWorks() {
  const [activeStep, setActiveStep] = useState(1);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-600 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <Link href="/" className="inline-flex items-center text-white/80 hover:text-white mb-6 transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al Inicio
            </Link>
            
            <div className="flex justify-center items-center mb-6">
              <PlayCircle className="w-8 h-8 mr-3" />
              <h1 className="text-4xl font-bold">
                Cómo Funciona Referencias Locales
              </h1>
            </div>
            
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Descubre lo fácil que es conectar con servicios de confianza en tu comunidad. 
              Desde encontrar el proveedor perfecto hasta recibir un servicio excepcional.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-8">
              <div className="text-center">
                <div className="text-3xl font-bold mb-1">4</div>
                <div className="text-sm text-blue-200">Pasos Simples</div>
              </div>
              
              <div className="hidden sm:block w-px h-12 bg-blue-300"></div>
              
              <div className="text-center">
                <div className="text-3xl font-bold mb-1">100%</div>
                <div className="text-sm text-blue-200">Verificado</div>
              </div>
              
              <div className="hidden sm:block w-px h-12 bg-blue-300"></div>
              
              <div className="text-center">
                <div className="text-3xl font-bold mb-1">24/7</div>
                <div className="text-sm text-blue-200">Disponible</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Steps Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Proceso Paso a Paso
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Haz clic en cada paso para ver los detalles y descubrir lo fácil que es usar nuestra plataforma
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {steps.map((step) => (
            <StepCard
              key={step.id}
              step={step}
              isActive={activeStep === step.id}
              onClick={() => setActiveStep(step.id)}
            />
          ))}
        </div>

        {/* Process Flow Visualization */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-16">
          <h3 className="text-2xl font-bold text-center text-gray-900 mb-8">
            Flujo del Proceso
          </h3>
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0 md:space-x-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex flex-col items-center text-center">
                <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${step.color} flex items-center justify-center text-white mb-3 shadow-lg`}>
                  {step.icon}
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">{step.title}</h4>
                <p className="text-sm text-gray-600 max-w-32">{step.description}</p>
                {index < steps.length - 1 && (
                  <ArrowRight className="w-6 h-6 text-gray-400 mt-4 hidden md:block" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl mb-6 shadow-lg">
              <HeartHandshake className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              ¿Por Qué Elegir Referencias Locales?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Nuestra plataforma está diseñada para brindarte la mejor experiencia al conectar con servicios de confianza
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <FeatureCard key={index} feature={feature} />
            ))}
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="bg-gradient-to-br from-orange-50 to-blue-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Beneficios para Toda la Comunidad
              </h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Home className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Para Residentes</h3>
                    <p className="text-gray-600">
                      Accede a servicios de calidad sin salir de tu edificio. Encuentra proveedores verificados 
                      y recomendados por tus propios vecinos.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                    <UserCheck className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Para Proveedores</h3>
                    <p className="text-gray-600">
                      Conecta con clientes en tu propio edificio o vecindario. Construye tu reputación 
                      y haz crecer tu negocio dentro de la comunidad.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Para la Comunidad</h3>
                    <p className="text-gray-600">
                      Fortalece los lazos vecinales y crea una red de confianza. Comparte experiencias 
                      y ayuda a otros a tomar mejores decisiones.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <Card className="bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6 text-center">
                  <Smartphone className="w-8 h-8 text-orange-600 mx-auto mb-3" />
                  <h4 className="font-semibold text-gray-900 mb-2">Fácil de Usar</h4>
                  <p className="text-sm text-gray-600">
                    Interfaz intuitiva diseñada para todos los usuarios
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6 text-center">
                  <CreditCard className="w-8 h-8 text-green-600 mx-auto mb-3" />
                  <h4 className="font-semibold text-gray-900 mb-2">Sin Comisiones</h4>
                  <p className="text-sm text-gray-600">
                    Contacta directamente sin costos adicionales
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6 text-center">
                  <Shield className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                  <h4 className="font-semibold text-gray-900 mb-2">100% Seguro</h4>
                  <p className="text-sm text-gray-600">
                    Proveedores verificados por la comunidad
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6 text-center">
                  <Clock className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                  <h4 className="font-semibold text-gray-900 mb-2">Disponibilidad</h4>
                  <p className="text-sm text-gray-600">
                    Servicios disponibles cuando los necesites
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-700 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            ¿Listo para Comenzar?
          </h2>
          <p className="text-xl text-indigo-100 mb-8">
            Únete a la comunidad de Referencias Locales y descubre una nueva forma de conectar con servicios de confianza
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/services">
              <Button size="lg" className="bg-white text-indigo-600 hover:bg-gray-100 px-8 py-4 text-lg w-full sm:w-auto shadow-lg" data-testid="button-explore-services">
                Explorar Servicios
              </Button>
            </Link>
            <Link href="/providers">
              <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-indigo-600 px-8 py-4 text-lg w-full sm:w-auto shadow-lg" data-testid="button-become-provider">
                Ser Proveedor
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}