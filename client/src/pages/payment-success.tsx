import { useEffect, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Calendar, MessageSquare, Home } from "lucide-react";

export default function PaymentSuccess() {
  const [paymentStatus, setPaymentStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [, setLocation] = useLocation();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentIntentId = urlParams.get('payment_intent');
    const paymentIntentClientSecret = urlParams.get('payment_intent_client_secret');
    const redirectStatus = urlParams.get('redirect_status');

    if (redirectStatus === 'succeeded') {
      setPaymentStatus('success');
      
      // TODO: Create booking record in database
      // TODO: Send confirmation email
      // TODO: Notify service provider
      
    } else if (redirectStatus === 'processing') {
      setPaymentStatus('loading');
    } else {
      setPaymentStatus('error');
    }
  }, []);

  if (paymentStatus === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto" />
          <p className="text-lg text-gray-600">Confirmando tu pago...</p>
        </div>
      </div>
    );
  }

  if (paymentStatus === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-6 h-6 text-red-600" />
            </div>
            <CardTitle className="text-red-800">Error en el Pago</CardTitle>
            <CardDescription>
              Hubo un problema procesando tu pago
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center text-gray-600">
              Por favor, inténtalo de nuevo o contacta a soporte si el problema persiste.
            </p>
            <div className="flex space-x-3">
              <Button variant="outline" className="flex-1" onClick={() => setLocation('/bookings')}>
                Reintentar
              </Button>
              <Link href="/" className="flex-1">
                <Button className="w-full">Ir al Inicio</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-6">
      <Card className="max-w-lg w-full">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl text-green-800">¡Pago Exitoso!</CardTitle>
          <CardDescription className="text-lg">
            Tu reserva ha sido confirmada
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-green-50 rounded-lg p-4 space-y-2">
            <h3 className="font-semibold text-green-800">¿Qué sigue?</h3>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Recibirás un email de confirmación</li>
              <li>• El proveedor será notificado de tu reserva</li>
              <li>• Puedes ver los detalles en "Mis Reservas"</li>
              <li>• El proveedor se comunicará contigo pronto</li>
            </ul>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Link href="/bookings">
              <Button variant="outline" className="w-full flex items-center justify-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>Mis Reservas</span>
              </Button>
            </Link>
            <Button variant="outline" className="w-full flex items-center justify-center space-x-2">
              <MessageSquare className="w-4 h-4" />
              <span>Contactar</span>
            </Button>
            <Link href="/">
              <Button className="w-full flex items-center justify-center space-x-2">
                <Home className="w-4 h-4" />
                <span>Inicio</span>
              </Button>
            </Link>
          </div>

          <div className="text-center text-sm text-gray-600">
            <p>Número de confirmación: #{Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}