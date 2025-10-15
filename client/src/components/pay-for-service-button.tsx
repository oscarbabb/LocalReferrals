import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/use-language";
import { CreditCard, Clock, Shield } from "lucide-react";

interface PayForServiceButtonProps {
  providerId: string;
  providerName: string;
  serviceName: string;
  hourlyRate: string | null;
  description: string;
  className?: string;
}

export default function PayForServiceButton({
  providerId,
  providerName,
  serviceName,
  hourlyRate,
  description,
  className = ""
}: PayForServiceButtonProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);

  const handlePayForService = async () => {
    if (!hourlyRate) {
      toast({
        title: t('components.payForService.priceUnavailable'),
        description: t('components.payForService.priceUnavailableDesc'),
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Calculate service amount (assuming 1 hour minimum)
      const amount = parseFloat(hourlyRate.replace(/[^0-9.-]+/g, "")) || 1500;
      
      // Navigate to checkout with service details
      const checkoutParams = new URLSearchParams({
        amount: amount.toString(),
        provider: providerName,
        service: serviceName,
        description: description
      });

      setLocation(`/checkout?${checkoutParams.toString()}`);
    } catch (error) {
      console.error("Error initiating payment:", error);
      toast({
        title: t('components.payForService.error'),
        description: t('components.payForService.errorDesc'),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const displayRate = hourlyRate ? `MXN $${parseFloat(hourlyRate.replace(/[^0-9.-]+/g, "")).toLocaleString()}` : t('components.payForService.priceOnRequest');

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border">
        <div className="flex items-center space-x-2">
          <Shield className="w-4 h-4 text-green-600" />
          <span className="text-sm font-medium text-gray-700">{t('components.payForService.securePayment')}</span>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-600">{t('components.payForService.from')}</div>
          <div className="text-lg font-bold text-primary">{displayRate}{t('components.payForService.perHour')}</div>
        </div>
      </div>

      <Button
        onClick={handlePayForService}
        disabled={isLoading || !hourlyRate}
        className={`w-full bg-gradient-to-r from-primary to-blue-600 hover:from-blue-600 hover:to-primary text-white shadow-md hover:shadow-lg transition-all duration-300 ${className}`}
      >
        {isLoading ? (
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 animate-spin" />
            <span>{t('components.payForService.loading')}</span>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <CreditCard className="w-4 h-4" />
            <span>{t('components.payForService.bookAndPay')}</span>
          </div>
        )}
      </Button>

      <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
        <div className="flex items-center space-x-1">
          <Shield className="w-3 h-3" />
          <span>{t('components.payForService.securePayment100')}</span>
        </div>
        <div>•</div>
        <div>{t('components.payForService.processedByStripe')}</div>
        <div>•</div>
        <div>{t('components.payForService.satisfactionGuarantee')}</div>
      </div>
    </div>
  );
}