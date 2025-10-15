import { useEffect, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useLanguage } from "@/hooks/use-language";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Calendar, MessageSquare, Home } from "lucide-react";

export default function PaymentSuccess() {
  const { t } = useLanguage();
  const [paymentStatus, setPaymentStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [paymentIntentId, setPaymentIntentId] = useState<string>('');
  const [bookingId, setBookingId] = useState<string>('');
  const [, setLocation] = useLocation();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentIntent = urlParams.get('payment_intent');
    const paymentIntentClientSecret = urlParams.get('payment_intent_client_secret');
    const redirectStatus = urlParams.get('redirect_status');

    if (redirectStatus === 'succeeded') {
      setPaymentStatus('success');
      
      // Extract payment intent ID for display
      if (paymentIntent) {
        setPaymentIntentId(paymentIntent);
        // The webhook will handle booking creation, email sending, and provider notification
        // The booking ID would be available from the webhook processing
        console.log('✅ Payment successful for payment intent:', paymentIntent);
      }
      
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
          <p className="text-lg text-gray-600" data-testid="text-loading">{t('paymentSuccess.loading')}</p>
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
            <CardTitle className="text-red-800" data-testid="text-error-title">{t('paymentSuccess.error.title')}</CardTitle>
            <CardDescription>
              {t('paymentSuccess.error.description')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center text-gray-600">
              {t('paymentSuccess.error.message')}
            </p>
            <div className="flex space-x-3">
              <Button variant="outline" className="flex-1" onClick={() => setLocation('/bookings')} data-testid="button-retry">
                {t('paymentSuccess.error.retryButton')}
              </Button>
              <Link href="/" className="flex-1">
                <Button className="w-full" data-testid="button-home">{t('paymentSuccess.error.homeButton')}</Button>
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
          <CardTitle className="text-2xl text-green-800" data-testid="text-success-title">{t('paymentSuccess.success.title')}</CardTitle>
          <CardDescription className="text-lg">
            {t('paymentSuccess.success.description')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-green-50 rounded-lg p-4 space-y-2">
            <h3 className="font-semibold text-green-800">{t('paymentSuccess.success.nextSteps')}</h3>
            <ul className="text-sm text-green-700 space-y-1">
              <li>{t('paymentSuccess.success.step1')}</li>
              <li>{t('paymentSuccess.success.step2')}</li>
              <li>{t('paymentSuccess.success.step3')}</li>
              <li>{t('paymentSuccess.success.step4')}</li>
            </ul>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Link href="/bookings">
              <Button variant="outline" className="w-full flex items-center justify-center space-x-2" data-testid="button-bookings">
                <Calendar className="w-4 h-4" />
                <span>{t('paymentSuccess.buttons.bookings')}</span>
              </Button>
            </Link>
            <Button variant="outline" className="w-full flex items-center justify-center space-x-2" data-testid="button-contact">
              <MessageSquare className="w-4 h-4" />
              <span>{t('paymentSuccess.buttons.contact')}</span>
            </Button>
            <Link href="/">
              <Button className="w-full flex items-center justify-center space-x-2" data-testid="button-home">
                <Home className="w-4 h-4" />
                <span>{t('paymentSuccess.buttons.home')}</span>
              </Button>
            </Link>
          </div>

          <div className="text-center text-sm text-gray-600 space-y-2" data-testid="confirmation-details">
            {paymentIntentId ? (
              <>
                <p className="font-mono text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded">
                  {t('paymentSuccess.confirmation.paymentId')} {paymentIntentId}
                </p>
                <p className="text-green-700 dark:text-green-400">
                  {t('paymentSuccess.confirmation.processing')}
                </p>
              </>
            ) : (
              <p>{t('paymentSuccess.confirmation.loading')}</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}