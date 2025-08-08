import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar, Clock } from "lucide-react";
import BookingCalendar from "./booking-calendar";
import type { Provider } from "@shared/schema";

interface QuickBookingButtonProps {
  provider: Provider;
  className?: string;
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
}

export default function QuickBookingButton({ 
  provider, 
  className, 
  variant = "default", 
  size = "default" 
}: QuickBookingButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Get current user
  const { data: user } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  const handleBookingComplete = () => {
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant={variant} 
          size={size} 
          className={`${className} ${variant === "default" ? "bg-orange-500 hover:bg-orange-600" : ""}`}
          data-testid="button-quick-booking"
        >
          <Calendar className="w-4 h-4 mr-2" />
          Reservar Ahora
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-orange-500" />
            Reserva rápida - {provider.title}
          </DialogTitle>
        </DialogHeader>
        <BookingCalendar 
          provider={provider} 
          userId={user?.id}
          onBookingComplete={handleBookingComplete}
        />
      </DialogContent>
    </Dialog>
  );
}