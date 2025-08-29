import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
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
  const [isLoading, setIsLoading] = useState(false);

  const handlePayForService = async () => {
    if (!hourlyRate) {
      toast({
        title: "Precio no disponible",
        description: "Este proveedor no ha configurado sus precios. Contacta directamente.",
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
        title: "Error",
        description: "No se pudo iniciar el proceso de pago. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const displayRate = hourlyRate ? `MXN $${parseFloat(hourlyRate.replace(/[^0-9.-]+/g, "")).toLocaleString()}` : "Precio por consultar";

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border">
        <div className="flex items-center space-x-2">
          <Shield className="w-4 h-4 text-green-600" />
          <span className="text-sm font-medium text-gray-700">Pago seguro con Stripe</span>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-600">Desde</div>
          <div className="text-lg font-bold text-primary">{displayRate}/hora</div>
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
            <span>Cargando...</span>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <CreditCard className="w-4 h-4" />
            <span>Reservar y Pagar</span>
          </div>
        )}
      </Button>

      <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
        <div className="flex items-center space-x-1">
          <Shield className="w-3 h-3" />
          <span>Pago 100% seguro</span>
        </div>
        <div>•</div>
        <div>Procesado por Stripe</div>
        <div>•</div>
        <div>Garantía de satisfacción</div>
      </div>
    </div>
  );
}