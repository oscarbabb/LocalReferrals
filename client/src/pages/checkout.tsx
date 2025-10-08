import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CreditCard, Shield, Clock } from "lucide-react";

// Dynamically load Stripe with the correct public key based on environment
let stripePromise: Promise<any> | null = null;

const initializeStripe = async () => {
  try {
    const response = await fetch('/api/stripe/public-key');
    
    if (!response.ok) {
      throw new Error(`Failed to fetch Stripe public key: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.publicKey) {
      throw new Error('No public key received from backend');
    }
    
    console.log(`✅ Loading Stripe in ${data.isTestMode ? 'TEST' : 'LIVE'} mode`);
    return loadStripe(data.publicKey);
  } catch (error) {
    console.error('❌ Failed to initialize Stripe:', error);
    throw error;
  }
};

// Initialize Stripe promise
stripePromise = initializeStripe();

interface CheckoutFormProps {
  serviceDetails: {
    providerName: string;
    serviceName: string;
    amount: number;
    description: string;
  };
}

const CheckoutForm = ({ serviceDetails }: CheckoutFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements || isProcessing) {
      return;
    }

    setIsProcessing(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/payment-success`,
      },
    });

    if (error) {
      toast({
        title: "Error en el Pago",
        description: error.message || "Hubo un problema procesando tu pago. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "¡Pago Exitoso!",
        description: "Tu pago ha sido procesado correctamente. Te redirigiremos a los detalles de tu reserva.",
      });
    }
    
    setIsProcessing(false);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="flex items-center space-x-4 mb-6">
        <Button 
          variant="ghost" 
          onClick={() => setLocation('/bookings')}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver</span>
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">Completar Pago</h1>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Service Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-green-600" />
              <span>Resumen del Servicio</span>
            </CardTitle>
            <CardDescription>
              Detalles de tu reserva
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Proveedor:</span>
              <span className="font-medium">{serviceDetails.providerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Servicio:</span>
              <span className="font-medium">{serviceDetails.serviceName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Descripción:</span>
              <span className="text-sm text-gray-700">{serviceDetails.description}</span>
            </div>
            <hr />
            <div className="flex justify-between text-lg font-bold">
              <span>Total:</span>
              <span className="text-primary">MXN ${serviceDetails.amount.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>

        {/* Payment Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CreditCard className="w-5 h-5 text-blue-600" />
              <span>Información de Pago</span>
            </CardTitle>
            <CardDescription>
              Pago seguro procesado por Stripe
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <PaymentElement />
              
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Shield className="w-4 h-4" />
                <span>Tu información de pago está protegida con encriptación de nivel bancario</span>
              </div>

              <Button 
                type="submit" 
                disabled={!stripe || isProcessing} 
                className="w-full bg-primary hover:bg-blue-700 text-white py-3"
              >
                {isProcessing ? (
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 animate-spin" />
                    <span>Procesando...</span>
                  </div>
                ) : (
                  `Pagar MXN $${serviceDetails.amount.toLocaleString()}`
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default function Checkout() {
  const [clientSecret, setClientSecret] = useState("");
  const [serviceDetails, setServiceDetails] = useState({
    providerName: "Proveedor de Servicio",
    serviceName: "Servicio Profesional", 
    amount: 1500,
    description: "Servicio profesional de calidad"
  });

  useEffect(() => {
    // Get service details from URL params or state
    const params = new URLSearchParams(window.location.search);
    const amount = parseInt(params.get('amount') || '1500');
    const providerName = params.get('provider') || 'Proveedor de Servicio';
    const serviceName = params.get('service') || 'Servicio Profesional';
    const description = params.get('description') || 'Servicio profesional de calidad';

    setServiceDetails({
      providerName,
      serviceName,
      amount,
      description
    });

    // Create PaymentIntent
    apiRequest("POST", "/api/create-payment-intent", { 
      amount,
      description: `${serviceName} - ${providerName}`,
      metadata: {
        provider: providerName,
        service: serviceName
      }
    })
      .then((res) => res.json())
      .then((data) => {
        setClientSecret(data.clientSecret);
      })
      .catch((error) => {
        console.error("Error creating payment intent:", error);
      });
  }, []);

  if (!clientSecret) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
          <p className="text-gray-600">Preparando el pago seguro...</p>
        </div>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <CheckoutForm serviceDetails={serviceDetails} />
    </Elements>
  );
}