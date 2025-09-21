import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle, Download, Upload } from "lucide-react";

export default function EmergencyFix() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [categoryCount, setCategoryCount] = useState(0);

  const comprehensiveCategories = {
    "totalCategories": 55,
    "totalSubcategories": 28,
    "data": [
      {
        "name": "Administración Condominal",
        "description": "Servicios de administración de condominios y gestión comunitaria",
        "icon": "🏢",
        "color": "#1f2937",
        "subcategories": [
          {"name": "Gestión de Cobranza", "order": 1},
          {"name": "Mantenimiento de Áreas Comunes", "order": 2},
          {"name": "Administración de Fondos", "order": 3},
          {"name": "Asambleas y Juntas", "order": 4}
        ]
      },
      {
        "name": "Agencias de Viajes y Tours",
        "description": "Servicios integrales de viajes, tours y experiencias turísticas",
        "icon": "✈️",
        "color": "#0ea5e9",
        "subcategories": [
          {"name": "Tours Locales", "order": 1},
          {"name": "Viajes Nacionales", "order": 2},
          {"name": "Viajes Internacionales", "order": 3},
          {"name": "Paquetes Familiares", "order": 4}
        ]
      },
      {
        "name": "Agua y Tratamiento",
        "description": "Servicios especializados en tratamiento y purificación de agua",
        "icon": "💧",
        "color": "#06b6d4",
        "subcategories": [
          {"name": "Filtros de Agua", "order": 1},
          {"name": "Purificación de Agua", "order": 2},
          {"name": "Análisis de Calidad", "order": 3},
          {"name": "Sistemas de Osmosis", "order": 4}
        ]
      },
      {
        "name": "Albercas y Jacuzzis",
        "description": "Mantenimiento, construcción y servicios para albercas y jacuzzis",
        "icon": "🏊",
        "color": "#0891b2"
      },
      {
        "name": "Altas de Servicios y Gestoría Domiciliaria",
        "description": "Trámites, gestorías y altas de servicios a domicilio",
        "icon": "📋",
        "color": "#7c3aed"
      },
      {
        "name": "Arte y Manualidades",
        "description": "Clases de arte, manualidades y talleres creativos",
        "icon": "🎨",
        "color": "#059669"
      },
      {
        "name": "Asesoría Legal",
        "description": "Servicios legales, consultoría jurídica y representación",
        "icon": "⚖️",
        "color": "#dc2626"
      },
      {
        "name": "Automotriz y Movilidad",
        "description": "Servicios automotrices, reparación y mantenimiento de vehículos",
        "icon": "🚗",
        "color": "#ea580c"
      },
      {
        "name": "Belleza y Cuidado Personal",
        "description": "Servicios de belleza, estética y cuidado personal",
        "icon": "💅",
        "color": "#db2777",
        "subcategories": [
          {"name": "Corte de Cabello", "order": 1},
          {"name": "Manicure y Pedicure", "order": 2},
          {"name": "Faciales y Tratamientos", "order": 3},
          {"name": "Maquillaje Profesional", "order": 4}
        ]
      },
      {
        "name": "Bienes Raíces y Property Management",
        "description": "Servicios inmobiliarios y administración de propiedades",
        "icon": "🏠",
        "color": "#1f2937"
      },
      {
        "name": "Capacitación Empresarial y Desarrollo Humano",
        "description": "Cursos, capacitaciones y desarrollo organizacional",
        "icon": "👥",
        "color": "#4338ca"
      },
      {
        "name": "Clases Particulares y Coaching Académico",
        "description": "Tutorías, clases particulares y apoyo académico",
        "icon": "📚",
        "color": "#0d9488"
      },
      {
        "name": "Cocina y Catering",
        "description": "Servicios de cocina y catering para eventos",
        "icon": "👨‍🍳",
        "color": "#dc2626"
      },
      {
        "name": "Construcción, Remodelación y Arquitectura",
        "description": "Servicios de construcción, remodelación y diseño arquitectónico",
        "icon": "🏗️",
        "color": "#ea580c",
        "subcategories": [
          {"name": "Remodelación de Cocinas", "order": 1},
          {"name": "Remodelación de Baños", "order": 2},
          {"name": "Pintura y Acabados", "order": 3},
          {"name": "Diseño Arquitectónico", "order": 4}
        ]
      },
      {
        "name": "Contabilidad e Impuestos",
        "description": "Servicios contables, fiscales y de gestión financiera",
        "icon": "📊",
        "color": "#0ea5e9"
      },
      {
        "name": "Cuidado de Niños, Niñeras y Estimulación",
        "description": "Servicios de cuidado infantil y estimulación temprana",
        "icon": "👶",
        "color": "#f59e0b"
      },
      {
        "name": "Cuidado de Plantas e Invernaderos",
        "description": "Jardinería, mantenimiento de plantas y espacios verdes",
        "icon": "🌱",
        "color": "#10b981"
      },
      {
        "name": "Decoración de Eventos y Wedding Planning",
        "description": "Organización y decoración de eventos y bodas",
        "icon": "🎉",
        "color": "#ec4899"
      },
      {
        "name": "Deportes y Acondicionamiento Físico",
        "description": "Entrenamiento personal, deportes y acondicionamiento físico",
        "icon": "💪",
        "color": "#7c3aed"
      },
      {
        "name": "Diseño Gráfico y Marketing Digital",
        "description": "Servicios de diseño, marketing digital y publicidad",
        "icon": "🎨",
        "color": "#8b5cf6"
      },
      {
        "name": "Electricidad y Sistemas Eléctricos",
        "description": "Instalaciones eléctricas, reparaciones y mantenimiento",
        "icon": "⚡",
        "color": "#f59e0b"
      },
      {
        "name": "Entretenimiento y Animación de Eventos",
        "description": "Servicios de entretenimiento, animación y espectáculos",
        "icon": "🎭",
        "color": "#06b6d4"
      },
      {
        "name": "Estética Facial y Tratamientos de Belleza",
        "description": "Tratamientos faciales, estética y cuidado de la piel",
        "icon": "✨",
        "color": "#ec4899"
      },
      {
        "name": "Fotografía y Video Profesional",
        "description": "Servicios profesionales de fotografía y videografía",
        "icon": "📸",
        "color": "#1f2937"
      },
      {
        "name": "Herrería, Soldadura y Estructuras Metálicas",
        "description": "Trabajos en metal, soldadura y estructuras metálicas",
        "icon": "🔨",
        "color": "#6b7280"
      },
      {
        "name": "Idiomas y Interpretación",
        "description": "Clases de idiomas, traducción e interpretación",
        "icon": "🌐",
        "color": "#3b82f6"
      },
      {
        "name": "Informática y Desarrollo de Software",
        "description": "Servicios de tecnología, programación y soporte técnico",
        "icon": "💻",
        "color": "#1e40af"
      },
      {
        "name": "Instrumentos Musicales y Audio",
        "description": "Servicios relacionados con música, instrumentos y audio",
        "icon": "🎵",
        "color": "#7c2d12"
      },
      {
        "name": "Limpieza y Sanitización",
        "description": "Servicios de limpieza para el hogar",
        "icon": "🧽",
        "color": "#0ea5e9",
        "subcategories": [
          {"name": "Limpieza Residencial", "order": 1},
          {"name": "Limpieza Profunda", "order": 2},
          {"name": "Sanitización COVID-19", "order": 3},
          {"name": "Limpieza de Oficinas", "order": 4}
        ]
      },
      {
        "name": "Mascotas y Veterinaria",
        "description": "Servicios veterinarios y cuidado de mascotas",
        "icon": "🐕",
        "color": "#059669"
      },
      {
        "name": "Medicina y Enfermería",
        "description": "Servicios médicos y de enfermería a domicilio",
        "icon": "🏥",
        "color": "#dc2626"
      },
      {
        "name": "Mudanzas y Logística",
        "description": "Servicios de mudanzas, transporte y logística",
        "icon": "📦",
        "color": "#ea580c"
      },
      {
        "name": "Música y Entretenimiento",
        "description": "Clases de música, DJ para eventos y entretenimiento en vivo",
        "icon": "🎵",
        "color": "#3b82f6"
      },
      {
        "name": "Nutrición y Medicina Alternativa",
        "description": "Servicios de nutrición, medicina alternativa y bienestar",
        "icon": "🥗",
        "color": "#10b981"
      },
      {
        "name": "Organización y Consultoría",
        "description": "Servicios de organización de espacios y consultoría",
        "icon": "📋",
        "color": "#6366f1"
      },
      {
        "name": "Peluquería y Barbería",
        "description": "Servicios de peluquería, barbería y cuidado capilar",
        "icon": "✂️",
        "color": "#be185d"
      },
      {
        "name": "Plomería y Sanitarios",
        "description": "Plomería, electricidad y reparaciones generales",
        "icon": "🔧",
        "color": "#0ea5e9"
      },
      {
        "name": "Psicología y Salud Mental",
        "description": "Servicios de psicología, terapia y salud mental",
        "icon": "🧠",
        "color": "#8b5cf6"
      },
      {
        "name": "Quiroprácticos, Fisioterapia y Rehabilitación",
        "description": "Servicios de fisioterapia, quiropráctica y rehabilitación",
        "icon": "🦴",
        "color": "#059669"
      },
      {
        "name": "Reparación de Electrodomésticos",
        "description": "Reparación y mantenimiento de electrodomésticos",
        "icon": "🔌",
        "color": "#f59e0b"
      },
      {
        "name": "Rentas Vacacionales y Co-Hosting",
        "description": "Servicios de gestión de rentas vacacionales y co-hosting",
        "icon": "🏖️",
        "color": "#06b6d4"
      },
      {
        "name": "Reparación de Dispositivos y Electrónica",
        "description": "Reparación de dispositivos electrónicos y tecnología",
        "icon": "📱",
        "color": "#374151"
      },
      {
        "name": "Restaurantes y Comida a Domicilio",
        "description": "Servicios de restaurantes y entrega de comida a domicilio",
        "icon": "🍕",
        "color": "#dc2626"
      },
      {
        "name": "Rifas, Sorteos y Promociones",
        "description": "Organización de rifas, sorteos y promociones",
        "icon": "🎰",
        "color": "#f59e0b"
      },
      {
        "name": "Salud, Medicina y Enfermería",
        "description": "Servicios médicos, de salud y enfermería",
        "icon": "⚕️",
        "color": "#dc2626"
      },
      {
        "name": "Seguridad (CCTV y Accesos)",
        "description": "Servicios de seguridad, CCTV y control de accesos",
        "icon": "🔒",
        "color": "#374151"
      },
      {
        "name": "Servicios Funerarios",
        "description": "Servicios funerarios y ceremoniales",
        "icon": "🕯️",
        "color": "#1f2937"
      },
      {
        "name": "Servicios Legales y Notariales",
        "description": "Servicios legales, notariales y jurídicos",
        "icon": "📜",
        "color": "#7c2d12"
      },
      {
        "name": "Servicios Náuticos y Marina",
        "description": "Servicios náuticos, marina y actividades acuáticas",
        "icon": "⛵",
        "color": "#0ea5e9"
      },
      {
        "name": "Servicios para Comercios y Oficinas",
        "description": "Servicios especializados para comercios y oficinas",
        "icon": "🏢",
        "color": "#374151"
      },
      {
        "name": "Tecnología, Redes y Smart Home",
        "description": "Servicios de tecnología, redes y domótica",
        "icon": "🏠",
        "color": "#1e40af",
        "subcategories": [
          {"name": "Instalación de WiFi", "order": 1},
          {"name": "Smart Home Setup", "order": 2},
          {"name": "Reparación de Computadoras", "order": 3},
          {"name": "Configuración de Redes", "order": 4}
        ]
      },
      {
        "name": "Telecomunicaciones e Internet",
        "description": "Servicios de telecomunicaciones, internet y conectividad",
        "icon": "📡",
        "color": "#7c3aed"
      },
      {
        "name": "Traducción e Interpretación",
        "description": "Servicios de traducción e interpretación profesional",
        "icon": "🗣️",
        "color": "#0891b2"
      },
      {
        "name": "Transporte Terrestre y Conductores",
        "description": "Servicios de transporte, conductores y logística terrestre",
        "icon": "🚐",
        "color": "#ea580c"
      },
      {
        "name": "Servicios de Entretenimiento y Recreación",
        "description": "Servicios de entretenimiento, recreación y actividades lúdicas",
        "icon": "🎪",
        "color": "#ec4899"
      }
    ]
  };

  const handleImportCategories = async () => {
    setStatus('loading');
    setMessage('Importando las 55 categorías integrales...');

    try {
      const response = await fetch('/api/admin/force-import-categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(comprehensiveCategories),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setStatus('success');
      setCategoryCount(result.totalCategories || 55);
      setMessage(`¡Éxito! Se importaron ${result.totalCategories || 55} categorías y ${result.totalSubcategories || 28} subcategorías.`);
    } catch (error) {
      setStatus('error');
      setMessage(`Error: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  };

  const handleCheckCurrentCategories = async () => {
    try {
      const response = await fetch('/api/admin/list-categories');
      const result = await response.json();
      setCategoryCount(result.count);
      setMessage(`Actualmente hay ${result.count} categorías en la base de datos.`);
    } catch (error) {
      setMessage('Error al verificar las categorías actuales.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-6 h-6 text-orange-500" />
            Reparación de Emergencia - Importar Categorías
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-semibold text-yellow-800 mb-2">Problema Identificado:</h3>
            <p className="text-yellow-700">
              Su sitio publicado está mostrando solo 8 categorías básicas en lugar de las 55 categorías 
              integrales de servicios mexicanos. Este botón importará todas las categorías correctas.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button 
              onClick={handleCheckCurrentCategories}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Verificar Categorías Actuales
            </Button>

            <Button 
              onClick={handleImportCategories}
              disabled={status === 'loading'}
              className="flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              {status === 'loading' ? 'Importando...' : 'Importar 55 Categorías'}
            </Button>
          </div>

          {message && (
            <div className={`p-4 rounded-lg flex items-start gap-2 ${
              status === 'success' ? 'bg-green-50 border border-green-200' :
              status === 'error' ? 'bg-red-50 border border-red-200' :
              'bg-blue-50 border border-blue-200'
            }`}>
              {status === 'success' && <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />}
              {status === 'error' && <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />}
              <div>
                <p className={`${
                  status === 'success' ? 'text-green-800' :
                  status === 'error' ? 'text-red-800' :
                  'text-blue-800'
                }`}>
                  {message}
                </p>
                {categoryCount > 0 && (
                  <p className="text-sm text-gray-600 mt-1">
                    Total de categorías: {categoryCount}
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-2">Categorías que se importarán:</h3>
            <div className="text-sm text-gray-600 grid grid-cols-2 gap-1">
              <span>• Administración Condominal</span>
              <span>• Agencias de Viajes y Tours</span>
              <span>• Agua y Tratamiento</span>
              <span>• Belleza y Cuidado Personal</span>
              <span>• Construcción y Remodelación</span>
              <span>• Tecnología y Smart Home</span>
              <span>• ...y 49 categorías más</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}