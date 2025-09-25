import { useState, useEffect } from 'react';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { CreditCard, CheckCircle, XCircle, AlertTriangle, Clock, User, MapPin } from 'lucide-react';

// Initialize Stripe - fetch public key from backend to ensure correct environment
let stripePromise: Promise<any> | null = null;

const initializeStripe = async () => {
  try {
    console.log('🔑 Fetching Stripe public key from backend...');
    const response = await fetch('/api/stripe/public-key');
    
    if (!response.ok) {
      throw new Error(`Failed to fetch Stripe public key: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('🔍 Stripe key info:', {
      keyType: data.keyType,
      isTestMode: data.isTestMode,
      keyStart: data.publicKey?.substring(0, 12) + '...'
    });
    
    if (!data.publicKey) {
      throw new Error('No public key received from backend');
    }
    
    if (!data.publicKey.startsWith('pk_test_')) {
      throw new Error('Test payments page requires a test key (pk_test_...), received: ' + data.publicKey.substring(0, 12) + '...');
    }
    
    console.log('✅ Loading Stripe with TEST public key');
    return loadStripe(data.publicKey);
  } catch (error) {
    console.error('❌ Failed to initialize Stripe:', error);
    throw error;
  }
};

// Initialize Stripe promise
stripePromise = initializeStripe();

// Test scenarios for local services marketplace
const testScenarios = [
  {
    id: 'success',
    title: 'Limpieza Residencial - 2 Horas',
    description: 'Servicio de limpieza doméstica con María González',
    amount: 800, // 800 MXN
    duration: '2 horas',
    provider: 'María González',
    location: 'Colonia Roma Norte',
    cardNumber: '4242424242424242',
    expectedResult: 'Pago exitoso',
    resultType: 'success' as const,
    badge: 'Recomendado para pruebas básicas'
  },
  {
    id: 'declined',
    title: 'Plomería de Emergencia',
    description: 'Reparación de tubería rota - Servicio urgente',
    amount: 1500, // 1500 MXN
    duration: '1.5 horas',
    provider: 'Carlos Mendoza',
    location: 'Polanco',
    cardNumber: '4000000000000002',
    expectedResult: 'Pago declinado (tarjeta sin fondos)',
    resultType: 'error' as const,
    badge: 'Prueba manejo de errores'
  },
  {
    id: 'authentication',
    title: 'Clases de Piano',
    description: 'Sesión de piano de 1 hora con autenticación 3D Secure',
    amount: 600, // 600 MXN
    duration: '1 hora',
    provider: 'Ana López',
    location: 'Condesa',
    cardNumber: '4000002500003155',
    expectedResult: 'Requiere autenticación 3D Secure',
    resultType: 'warning' as const,
    badge: 'Prueba autenticación'
  },
  {
    id: 'processing',
    title: 'Masaje Terapéutico',
    description: 'Sesión de masaje relajante - Procesamiento lento',
    amount: 1200, // 1200 MXN
    duration: '90 minutos',
    provider: 'Sofía Herrera',
    location: 'Zona Rosa',
    cardNumber: '4000000000000259',
    expectedResult: 'Procesamiento lento (simula demoras)',
    resultType: 'processing' as const,
    badge: 'Prueba timeouts'
  }
];

interface PaymentFormProps {
  scenario: typeof testScenarios[0];
  onSuccess: () => void;
  onError: (error: string) => void;
}

function PaymentForm({ scenario, onSuccess, onError }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      console.log('❌ Stripe or elements not ready');
      return;
    }

    console.log('💳 Starting payment confirmation for scenario:', scenario.id);
    setIsLoading(true);

    try {
      const result = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/test-payments?success=true&scenario=${scenario.id}`,
        },
        redirect: 'if_required',
      });

      console.log('💳 Payment confirmation result:', result);

      if (result.error) {
        console.log('❌ Payment error:', result.error);
        onError(result.error.message || 'Error en el pago');
      } else {
        console.log('✅ Payment successful!');
        onSuccess();
      }
    } catch (err) {
      console.error('❌ Payment exception:', err);
      onError('Error inesperado durante el pago');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      <Button 
        type="submit" 
        disabled={!stripe || isLoading} 
        className="w-full"
        data-testid={`payment-submit-${scenario.id}`}
      >
        {isLoading ? (
          <>
            <Clock className="w-4 h-4 mr-2 animate-spin" />
            Procesando...
          </>
        ) : (
          <>
            <CreditCard className="w-4 h-4 mr-2" />
            Pagar MXN ${scenario.amount}
          </>
        )}
      </Button>
    </form>
  );
}

interface PaymentTestProps {
  scenario: typeof testScenarios[0];
}

function PaymentTest({ scenario }: PaymentTestProps) {
  const [clientSecret, setClientSecret] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'success' | 'error' | 'processing'>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    console.log('💳 Initializing payment for scenario:', scenario.id);
    // Create payment intent for this test scenario
    apiRequest('POST', '/api/create-payment-intent', {
      amount: scenario.amount,
      currency: 'mxn',
      metadata: {
        service_type: scenario.title,
        provider: scenario.provider,
        duration: scenario.duration,
        location: scenario.location,
        test_scenario: scenario.id
      }
    })
      .then((res) => res.json())
      .then((data) => {
        console.log('💳 Payment intent response:', data);
        if (data.clientSecret) {
          console.log('✅ Client secret received, setting up payment form');
          setClientSecret(data.clientSecret);
        } else {
          throw new Error('No client secret received');
        }
      })
      .catch((error) => {
        console.error('❌ Payment initialization error:', error);
        toast({
          title: 'Error',
          description: 'No se pudo inicializar el pago: ' + error.message,
          variant: 'destructive',
        });
      });
  }, [scenario]);

  const handleSuccess = () => {
    console.log('🎉 handleSuccess called - payment was successful!');
    setPaymentStatus('success');
    setStatusMessage('¡Pago exitoso! La reserva ha sido confirmada.');
    toast({
      title: 'Pago Exitoso',
      description: `Servicio reservado con ${scenario.provider}`,
    });
  };

  const handleError = (error: string) => {
    console.log('❌ handleError called with:', error);
    setPaymentStatus('error');
    setStatusMessage(error);
    toast({
      title: 'Error en el Pago',
      description: error,
      variant: 'destructive',
    });
  };

  const resetTest = () => {
    setPaymentStatus('idle');
    setStatusMessage('');
    // Reload to get a fresh payment intent
    window.location.reload();
  };

  const getStatusIcon = () => {
    switch (paymentStatus) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'processing':
        return <Clock className="w-5 h-5 text-yellow-600 animate-spin" />;
      default:
        return <CreditCard className="w-5 h-5 text-gray-400" />;
    }
  };

  const getBadgeVariant = () => {
    switch (scenario.resultType) {
      case 'success':
        return 'default';
      case 'error':
        return 'destructive';
      case 'warning':
        return 'secondary';
      case 'processing':
        return 'outline';
      default:
        return 'default';
    }
  };

  if (!clientSecret) {
    return (
      <Card className="opacity-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{scenario.title}</CardTitle>
            <Badge variant={getBadgeVariant()}>{scenario.badge}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Clock className="w-6 h-6 animate-spin mr-2" />
            Inicializando pago...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="relative" data-testid={`payment-test-${scenario.id}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{scenario.title}</CardTitle>
          <Badge variant={getBadgeVariant()}>{scenario.badge}</Badge>
        </div>
        <CardDescription>{scenario.description}</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Service Details */}
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <User className="w-4 h-4 mr-2 text-gray-500" />
              <span>Proveedor:</span>
            </div>
            <span className="font-medium">{scenario.provider}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-2 text-gray-500" />
              <span>Duración:</span>
            </div>
            <span className="font-medium">{scenario.duration}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <MapPin className="w-4 h-4 mr-2 text-gray-500" />
              <span>Ubicación:</span>
            </div>
            <span className="font-medium">{scenario.location}</span>
          </div>
          <div className="flex items-center justify-between text-lg font-bold">
            <span>Total:</span>
            <span className="text-orange-600">MXN ${scenario.amount}</span>
          </div>
        </div>

        <Separator />

        {/* Test Instructions */}
        <div className="bg-gray-50 p-3 rounded-lg text-sm">
          <div className="font-medium mb-1">Para probar:</div>
          <div>Usa la tarjeta: <code className="bg-white px-1 rounded">{scenario.cardNumber}</code></div>
          <div>Fecha: Cualquier fecha futura (ej: 12/34)</div>
          <div>CVC: Cualquier 3 dígitos (ej: 123)</div>
          <div className="mt-2 text-gray-600">
            <strong>Resultado esperado:</strong> {scenario.expectedResult}
          </div>
        </div>

        <Separator />

        {/* Payment Status */}
        {paymentStatus !== 'idle' && (
          <div className={`p-3 rounded-lg flex items-center ${
            paymentStatus === 'success' ? 'bg-green-50 text-green-800' :
            paymentStatus === 'error' ? 'bg-red-50 text-red-800' :
            'bg-yellow-50 text-yellow-800'
          }`}>
            {getStatusIcon()}
            <span className="ml-2">{statusMessage}</span>
          </div>
        )}

        {/* Payment Form or Reset Button */}
        {paymentStatus === 'idle' ? (
          <Elements stripe={stripePromise} options={{ 
            clientSecret,
            locale: 'es',
            appearance: {
              theme: 'stripe',
              variables: {
                colorPrimary: '#f97316',
              }
            }
          }}>
            <PaymentForm 
              scenario={scenario} 
              onSuccess={handleSuccess} 
              onError={handleError} 
            />
          </Elements>
        ) : (
          <Button 
            onClick={resetTest} 
            variant="outline" 
            className="w-full"
            data-testid={`payment-reset-${scenario.id}`}
          >
            Probar Nuevamente
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export default function TestPayments() {
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Sistema de Pruebas de Pagos
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Prueba diferentes escenarios de pago antes del lanzamiento. 
          Cada escenario simula situaciones reales que pueden ocurrir en producción.
        </p>
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-center mb-2">
            <AlertTriangle className="w-5 h-5 text-blue-600 mr-2" />
            <span className="font-medium text-blue-800">Modo de Prueba Activo</span>
          </div>
          <p className="text-sm text-blue-700">
            Todos los pagos son simulados. No se realizarán cargos reales.
          </p>
        </div>
      </div>

      {/* Scenario Selection */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Escenarios de Prueba</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {testScenarios.map((scenario) => (
            <Button
              key={scenario.id}
              variant={selectedScenario === scenario.id ? "default" : "outline"}
              className="h-auto p-4 flex flex-col items-start text-left"
              onClick={() => setSelectedScenario(scenario.id)}
              data-testid={`scenario-button-${scenario.id}`}
            >
              <div className="font-medium mb-1">{scenario.title}</div>
              <div className="text-xs opacity-75">{scenario.badge}</div>
            </Button>
          ))}
        </div>
      </div>

      {/* Selected Test */}
      {selectedScenario ? (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Prueba Seleccionada</h2>
          <PaymentTest 
            scenario={testScenarios.find(s => s.id === selectedScenario)!} 
          />
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Selecciona un escenario para comenzar las pruebas</p>
        </div>
      )}

      {/* All Scenarios */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Todos los Escenarios</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {testScenarios.map((scenario) => (
            <PaymentTest key={scenario.id} scenario={scenario} />
          ))}
        </div>
      </div>
    </div>
  );
}