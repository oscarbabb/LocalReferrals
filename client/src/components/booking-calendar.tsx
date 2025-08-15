import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, isBefore, addMonths, subMonths, getDay } from "date-fns";
import { es } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight, Clock, Calendar, MapPin, DollarSign } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Provider } from "@shared/schema";
import AppleMapsAddressInput from "@/components/apple-maps-address-input";

interface BookingCalendarProps {
  provider: Provider;
  userId?: string;
  onBookingComplete?: () => void;
}

interface TimeSlot {
  time: string;
  available: boolean;
  label: string;
}

const timeSlots: TimeSlot[] = [
  { time: "09:00", available: true, label: "9:00 AM" },
  { time: "10:00", available: true, label: "10:00 AM" },
  { time: "11:00", available: true, label: "11:00 AM" },
  { time: "12:00", available: true, label: "12:00 PM" },
  { time: "13:00", available: true, label: "1:00 PM" },
  { time: "14:00", available: true, label: "2:00 PM" },
  { time: "15:00", available: true, label: "3:00 PM" },
  { time: "16:00", available: true, label: "4:00 PM" },
  { time: "17:00", available: true, label: "5:00 PM" },
];

const serviceDurations = [
  { value: 60, label: "1 hora" },
  { value: 120, label: "2 horas" },
  { value: 180, label: "3 horas" },
  { value: 240, label: "4 horas" },
];

export default function BookingCalendar({ provider, userId, onBookingComplete }: BookingCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [duration, setDuration] = useState<number>(120);
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [serviceTitle, setServiceTitle] = useState("");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get provider's availability
  const { data: availability = [] } = useQuery({
    queryKey: ["/api/providers", provider.id, "availability"],
    enabled: !!provider.id,
  });

  // Get existing appointments for the provider
  const { data: appointments = [] } = useQuery({
    queryKey: ["/api/appointments", provider.id],
    enabled: !!provider.id,
  });

  const createBookingMutation = useMutation({
    mutationFn: async (bookingData: any) => {
      return apiRequest("/api/service-requests", "POST", bookingData);
    },
    onSuccess: () => {
      toast({
        title: "¡Reserva creada!",
        description: "Tu solicitud de servicio ha sido enviada al proveedor.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/service-requests"] });
      onBookingComplete?.();
      // Reset form
      setSelectedDate(null);
      setSelectedTime("");
      setLocation("");
      setNotes("");
      setServiceTitle("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo crear la reserva. Intenta nuevamente.",
        variant: "destructive",
      });
    },
  });

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const isDateAvailable = (date: Date) => {
    // Don't allow booking in the past
    if (isBefore(date, new Date())) return false;
    
    const dayOfWeek = getDay(date);
    
    // Check if provider is available on this day of week
    const dayAvailability = (availability as any[]).find((a: any) => a.dayOfWeek === dayOfWeek && a.isAvailable);
    if (!dayAvailability) return false;

    return true;
  };

  const isTimeSlotAvailable = (time: string, date: Date) => {
    if (!selectedDate) return false;
    
    // Check against existing appointments
    const dateString = format(date, 'yyyy-MM-dd');
    const conflict = (appointments as any[]).some((apt: any) => {
      const aptDate = format(new Date(apt.appointmentDate), 'yyyy-MM-dd');
      return aptDate === dateString && apt.startTime === time;
    });
    
    return !conflict;
  };

  const calculateTotal = () => {
    if (!provider.hourlyRate || !duration) return 0;
    const hours = duration / 60;
    return Number(provider.hourlyRate) * hours;
  };

  const handleBooking = () => {
    if (!userId) {
      toast({
        title: "Inicia sesión",
        description: "Debes iniciar sesión para hacer una reserva.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedDate || !selectedTime || !serviceTitle.trim()) {
      toast({
        title: "Campos requeridos",
        description: "Por favor completa todos los campos obligatorios.",
        variant: "destructive",
      });
      return;
    }

    const bookingData = {
      requesterId: userId,
      providerId: provider.id,
      categoryId: provider.categoryId,
      title: serviceTitle,
      description: notes || `Servicio de ${provider.title}`,
      preferredDate: selectedDate,
      preferredTime: selectedTime,
      estimatedDuration: duration,
      location: location || "Por definir",
      notes: notes,
      totalAmount: calculateTotal(),
    };

    createBookingMutation.mutate(bookingData);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-orange-500" />
          Reservar Servicio con {provider.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Service Details Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="service-title">Título del Servicio *</Label>
            <Input
              id="service-title"
              placeholder="ej. Limpieza profunda del apartamento"
              value={serviceTitle}
              onChange={(e) => setServiceTitle(e.target.value)}
              data-testid="input-service-title"
            />
          </div>
          <div>
            <Label htmlFor="location">Ubicación</Label>
            <AppleMapsAddressInput
              id="location"
              value={location}
              onChange={setLocation}
              placeholder="ej. Apartamento 301, Edificio A"
              testId="input-location"
            />
          </div>
        </div>

        {/* Duration and Price */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="duration">Duración estimada</Label>
            <Select value={duration.toString()} onValueChange={(value) => setDuration(Number(value))}>
              <SelectTrigger data-testid="select-duration">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {serviceDurations.map((option) => (
                  <SelectItem key={option.value} value={option.value.toString()}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            <div>
              <Label>Total estimado</Label>
              <p className="text-2xl font-bold text-green-600">
                MXN ${calculateTotal().toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        {/* Calendar */}
        <div className="border rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentDate(subMonths(currentDate, 1))}
              data-testid="button-prev-month"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <h3 className="text-lg font-semibold">
              {format(currentDate, 'MMMM yyyy', { locale: es })}
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentDate(addMonths(currentDate, 1))}
              data-testid="button-next-month"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day) => (
              <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {monthDays.map((day) => {
              const isAvailable = isDateAvailable(day);
              const isSelected = selectedDate && isSameDay(day, selectedDate);
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isTodayDate = isToday(day);

              return (
                <button
                  key={day.toString()}
                  onClick={() => isAvailable ? setSelectedDate(day) : null}
                  disabled={!isAvailable}
                  className={`
                    p-2 text-sm rounded-lg transition-colors
                    ${!isCurrentMonth ? 'text-gray-300' : ''}
                    ${isTodayDate ? 'bg-blue-100 text-blue-600' : ''}
                    ${isSelected ? 'bg-orange-500 text-white' : ''}
                    ${isAvailable && !isSelected ? 'hover:bg-gray-100' : ''}
                    ${!isAvailable ? 'text-gray-300 cursor-not-allowed' : 'cursor-pointer'}
                  `}
                  data-testid={`button-date-${format(day, 'yyyy-MM-dd')}`}
                >
                  {format(day, 'd')}
                </button>
              );
            })}
          </div>
        </div>

        {/* Time Slots */}
        {selectedDate && (
          <div>
            <Label className="text-base font-medium mb-3 block">
              Horarios disponibles para {format(selectedDate, 'dd/MM/yyyy', { locale: es })}
            </Label>
            <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
              {timeSlots.map((slot) => {
                const available = isTimeSlotAvailable(slot.time, selectedDate);
                const isSelected = selectedTime === slot.time;

                return (
                  <Button
                    key={slot.time}
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    onClick={() => available ? setSelectedTime(slot.time) : null}
                    disabled={!available}
                    className={`
                      ${isSelected ? 'bg-orange-500 hover:bg-orange-600' : ''}
                      ${!available ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                    data-testid={`button-time-${slot.time}`}
                  >
                    <Clock className="w-3 h-3 mr-1" />
                    {slot.label}
                  </Button>
                );
              })}
            </div>
          </div>
        )}

        {/* Notes */}
        <div>
          <Label htmlFor="notes">Notas adicionales</Label>
          <Textarea
            id="notes"
            placeholder="Describe cualquier detalle específico del servicio..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            data-testid="textarea-notes"
          />
        </div>

        {/* Book Button */}
        <div className="flex justify-between items-center pt-4 border-t">
          <div className="text-sm text-gray-500">
            {selectedDate && selectedTime && (
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {format(selectedDate, 'dd/MM/yyyy', { locale: es })}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {timeSlots.find(s => s.time === selectedTime)?.label}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {location || "Por definir"}
                </span>
              </div>
            )}
          </div>
          <Button
            onClick={handleBooking}
            disabled={!selectedDate || !selectedTime || !serviceTitle.trim() || createBookingMutation.isPending}
            className="bg-orange-500 hover:bg-orange-600 text-white px-8"
            data-testid="button-confirm-booking"
          >
            {createBookingMutation.isPending ? "Procesando..." : "Confirmar Reserva"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}