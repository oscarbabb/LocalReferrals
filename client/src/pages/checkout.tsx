import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/use-language";
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
  const { t } = useLanguage();
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
        title: t('checkout.toast.errorTitle'),
        description: error.message || t('checkout.toast.errorDescription'),
        variant: "destructive",
      });
    } else {
      toast({
        title: t('checkout.toast.successTitle'),
        description: t('checkout.toast.successDescription'),
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
          data-testid="button-back"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('checkout.back')}</span>
        </Button>
        <h1 className="text-2xl font-bold text-gray-900" data-testid="text-page-title">{t('checkout.title')}</h1>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Service Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-green-600" />
              <span>{t('checkout.summary.title')}</span>
            </CardTitle>
            <CardDescription>
              {t('checkout.summary.subtitle')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600">{t('checkout.summary.provider')}</span>
              <span className="font-medium" data-testid="text-provider-name">{serviceDetails.providerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">{t('checkout.summary.service')}</span>
              <span className="font-medium" data-testid="text-service-name">{serviceDetails.serviceName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">{t('checkout.summary.description')}</span>
              <span className="text-sm text-gray-700" data-testid="text-service-description">{serviceDetails.description}</span>
            </div>
            <hr />
            <div className="flex justify-between text-lg font-bold">
              <span>{t('checkout.summary.total')}</span>
              <span className="text-primary" data-testid="text-total-amount">MXN ${serviceDetails.amount.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>

        {/* Payment Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CreditCard className="w-5 h-5 text-blue-600" />
              <span>{t('checkout.payment.title')}</span>
            </CardTitle>
            <CardDescription>
              {t('checkout.payment.description')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <PaymentElement />
              
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Shield className="w-4 h-4" />
                <span>{t('checkout.payment.security')}</span>
              </div>

              <Button 
                type="submit" 
                disabled={!stripe || isProcessing} 
                className="w-full bg-primary hover:bg-blue-700 text-white py-3"
                data-testid="button-submit-payment"
              >
                {isProcessing ? (
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 animate-spin" />
                    <span>{t('checkout.button.processing')}</span>
                  </div>
                ) : (
                  `${t('checkout.button.pay')}${serviceDetails.amount.toLocaleString()}`
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
  const { t } = useLanguage();
  const [clientSecret, setClientSecret] = useState("");
  const [serviceDetails, setServiceDetails] = useState({
    providerName: t('checkout.defaults.provider'),
    serviceName: t('checkout.defaults.service'), 
    amount: 1500,
    description: t('checkout.defaults.description')
  });

  useEffect(() => {
    // Get service details from URL params or state
    const params = new URLSearchParams(window.location.search);
    const amount = parseInt(params.get('amount') || '1500');
    const providerName = params.get('provider') || t('checkout.defaults.provider');
    const serviceName = params.get('service') || t('checkout.defaults.service');
    const description = params.get('description') || t('checkout.defaults.description');

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
  }, [t]);

  if (!clientSecret) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
          <p className="text-gray-600" data-testid="text-loading">{t('checkout.loading')}</p>
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