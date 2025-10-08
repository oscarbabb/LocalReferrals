import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Calendar, Plus, Trash2, Clock, Edit2 } from "lucide-react";
import type { ProviderAvailability, InsertProviderAvailability } from "@shared/schema";

// Time slot form schema
const timeSlotSchema = z.object({
  dayOfWeek: z.string().min(1, "Selecciona un día"),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Formato inválido (HH:MM)"),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Formato inválido (HH:MM)"),
  isAvailable: z.boolean().default(true)
}).refine((data) => {
  const start = data.startTime.split(':').map(Number);
  const end = data.endTime.split(':').map(Number);
  const startMinutes = start[0] * 60 + start[1];
  const endMinutes = end[0] * 60 + end[1];
  return endMinutes > startMinutes;
}, {
  message: "La hora de fin debe ser posterior a la hora de inicio",
  path: ["endTime"]
});

type TimeSlotForm = z.infer<typeof timeSlotSchema>;

const DAYS_OF_WEEK = [
  { value: "0", label: "Domingo" },
  { value: "1", label: "Lunes" },
  { value: "2", label: "Martes" },
  { value: "3", label: "Miércoles" },
  { value: "4", label: "Jueves" },
  { value: "5", label: "Viernes" },
  { value: "6", label: "Sábado" }
];

export default function AvailabilityManagement() {
  const { toast } = useToast();
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<ProviderAvailability | null>(null);
  const [deletingSlotId, setDeletingSlotId] = useState<string | null>(null);

  // Get current user's provider profile
  const { data: provider, isLoading: providerLoading, error: providerError } = useQuery<any>({
    queryKey: ["/api/auth/provider"],
    enabled: isAuthenticated,
    retry: false
  });

  // Handle authentication errors - only redirect on 401/403
  useEffect(() => {
    if (providerError) {
      const errorMessage = (providerError as Error).message || '';
      const is401or403 = errorMessage.includes('401') || errorMessage.includes('403');
      
      if (is401or403) {
        toast({
          title: "Autenticación requerida",
          description: "Por favor inicia sesión para gestionar tu disponibilidad.",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 1000);
      }
    }
  }, [providerError, toast]);

  const providerId = provider?.id;

  // Fetch availability slots
  const { data: availabilitySlots = [], isLoading } = useQuery<ProviderAvailability[]>({
    queryKey: ["/api/providers", providerId, "availability"],
    enabled: !!providerId,
  });

  const form = useForm<TimeSlotForm>({
    resolver: zodResolver(timeSlotSchema),
    defaultValues: {
      dayOfWeek: "",
      startTime: "09:00",
      endTime: "17:00",
      isAvailable: true
    }
  });

  // Reset form when editing
  useEffect(() => {
    if (editingSlot) {
      form.reset({
        dayOfWeek: String(editingSlot.dayOfWeek),
        startTime: editingSlot.startTime,
        endTime: editingSlot.endTime,
        isAvailable: editingSlot.isAvailable ?? true
      });
    } else {
      form.reset({
        dayOfWeek: "",
        startTime: "09:00",
        endTime: "17:00",
        isAvailable: true
      });
    }
  }, [editingSlot, form]);

  // Create or update mutation
  const saveSlotMutation = useMutation({
    mutationFn: async (slotData: TimeSlotForm) => {
      if (!providerId) throw new Error("Provider not found");
      
      const data = {
        dayOfWeek: parseInt(slotData.dayOfWeek),
        startTime: slotData.startTime,
        endTime: slotData.endTime,
        isAvailable: slotData.isAvailable
      };

      if (editingSlot) {
        const response = await apiRequest("PATCH", `/api/providers/${providerId}/availability/${editingSlot.id}`, data);
        return await response.json();
      } else {
        const response = await apiRequest("POST", `/api/providers/${providerId}/availability`, data);
        return await response.json();
      }
    },
    onSuccess: () => {
      toast({
        title: editingSlot ? "¡Horario actualizado!" : "¡Horario agregado!",
        description: editingSlot ? "Tu horario se actualizó exitosamente." : "Tu nuevo horario ya está disponible.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/providers", providerId, "availability"] });
      setIsDialogOpen(false);
      setEditingSlot(null);
      form.reset();
    },
    onError: (error: Error) => {
      // Extract error message from the response (format: "status: message")
      const errorMessage = error.message.replace(/^\d+:\s*/, '') || "No se pudo guardar el horario.";
      toast({
        title: "Error al guardar",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  // Delete mutation
  const deleteSlotMutation = useMutation({
    mutationFn: async (slotId: string) => {
      if (!providerId) throw new Error("Provider not found");
      const response = await apiRequest("DELETE", `/api/providers/${providerId}/availability/${slotId}`);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "¡Horario eliminado!",
        description: "El horario se eliminó exitosamente.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/providers", providerId, "availability"] });
      setDeletingSlotId(null);
    },
    onError: (error: Error) => {
      // Extract error message from the response (format: "status: message")
      const errorMessage = error.message.replace(/^\d+:\s*/, '') || "No se pudo eliminar el horario.";
      toast({
        title: "Error al eliminar",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  // Toggle availability mutation
  const toggleAvailabilityMutation = useMutation({
    mutationFn: async ({ slotId, isAvailable }: { slotId: string; isAvailable: boolean }) => {
      if (!providerId) throw new Error("Provider not found");
      const response = await apiRequest("PATCH", `/api/providers/${providerId}/availability/${slotId}`, {
        isAvailable
      });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/providers", providerId, "availability"] });
    },
    onError: (error: Error) => {
      // Extract error message from the response (format: "status: message")
      const errorMessage = error.message.replace(/^\d+:\s*/, '') || "No se pudo actualizar la disponibilidad.";
      toast({
        title: "Error al actualizar",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: TimeSlotForm) => {
    saveSlotMutation.mutate(data);
  };

  const handleEdit = (slot: ProviderAvailability) => {
    setEditingSlot(slot);
    setIsDialogOpen(true);
  };

  const handleDelete = (slotId: string) => {
    setDeletingSlotId(slotId);
  };

  const confirmDelete = () => {
    if (deletingSlotId) {
      deleteSlotMutation.mutate(deletingSlotId);
    }
  };

  const handleToggleAvailability = (slotId: string, currentStatus: boolean | null) => {
    toggleAvailabilityMutation.mutate({ slotId, isAvailable: !(currentStatus ?? false) });
  };

  // Group slots by day of week
  const slotsByDay = DAYS_OF_WEEK.map(day => ({
    ...day,
    slots: availabilitySlots.filter(slot => slot.dayOfWeek === parseInt(day.value))
  }));

  if (authLoading || providerLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4 w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded mb-8 w-1/2"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6, 7].map(i => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!(user as any)?.isProvider || !provider) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Perfil de Proveedor Requerido
            </h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Para gestionar tu disponibilidad, primero necesitas crear un perfil de proveedor de servicios.
            </p>
            <Button 
              onClick={() => window.location.href = "/provider-setup"}
              data-testid="button-create-provider"
            >
              Crear Perfil de Proveedor
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2" data-testid="title-availability">
              <Calendar className="h-8 w-8 text-primary" />
              Gestionar Disponibilidad
            </h1>
            <p className="mt-2 text-gray-600" data-testid="subtitle-availability">
              Configura tus horarios semanales para que los clientes puedan agendar servicios
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) {
              setEditingSlot(null);
              form.reset();
            }
          }}>
            <DialogTrigger asChild>
              <Button className="gap-2" data-testid="button-add-slot">
                <Plus className="h-4 w-4" />
                Agregar Horario
              </Button>
            </DialogTrigger>
            <DialogContent data-testid="dialog-add-slot">
              <DialogHeader>
                <DialogTitle>{editingSlot ? "Editar Horario" : "Agregar Nuevo Horario"}</DialogTitle>
                <DialogDescription>
                  {editingSlot ? "Actualiza el horario seleccionado" : "Configura un nuevo horario de disponibilidad"}
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="dayOfWeek"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Día de la semana</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-day">
                              <SelectValue placeholder="Selecciona un día" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {DAYS_OF_WEEK.map(day => (
                              <SelectItem key={day.value} value={day.value} data-testid={`option-day-${day.value}`}>
                                {day.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="startTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Hora de inicio</FormLabel>
                          <FormControl>
                            <input
                              type="time"
                              {...field}
                              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                              data-testid="input-start-time"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="endTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Hora de fin</FormLabel>
                          <FormControl>
                            <input
                              type="time"
                              {...field}
                              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                              data-testid="input-end-time"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="isAvailable"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel>Disponible</FormLabel>
                          <div className="text-sm text-muted-foreground">
                            Activa este horario para recibir reservas
                          </div>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid="switch-available"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <div className="flex gap-2 justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsDialogOpen(false);
                        setEditingSlot(null);
                        form.reset();
                      }}
                      data-testid="button-cancel"
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      disabled={saveSlotMutation.isPending}
                      data-testid="button-save-slot"
                    >
                      {saveSlotMutation.isPending ? "Guardando..." : editingSlot ? "Actualizar" : "Guardar"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7].map(i => (
            <div key={i} className="h-48 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      ) : availabilitySlots.length === 0 ? (
        <Card data-testid="empty-state">
          <CardContent className="pt-6 text-center py-12">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay horarios configurados</h3>
            <p className="text-gray-500 mb-4">
              Agrega tus horarios de disponibilidad para que los clientes puedan agendar servicios
            </p>
            <Button onClick={() => setIsDialogOpen(true)} data-testid="button-add-first-slot">
              <Plus className="h-4 w-4 mr-2" />
              Agregar Primer Horario
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {slotsByDay.map(day => (
            <Card key={day.value} data-testid={`card-day-${day.value}`}>
              <CardHeader>
                <CardTitle className="text-lg">{day.label}</CardTitle>
                <CardDescription>
                  {day.slots.length === 0 ? "Sin horarios" : `${day.slots.length} horario${day.slots.length > 1 ? 's' : ''}`}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {day.slots.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">No disponible</p>
                ) : (
                  day.slots.map(slot => (
                    <div
                      key={slot.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      data-testid={`slot-${slot.id}`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span className="text-sm font-medium" data-testid={`time-${slot.id}`}>
                            {slot.startTime} - {slot.endTime}
                          </span>
                        </div>
                        <Badge
                          variant={slot.isAvailable ?? false ? "default" : "secondary"}
                          className="mt-1"
                          data-testid={`badge-${slot.id}`}
                        >
                          {slot.isAvailable ?? false ? "Disponible" : "No disponible"}
                        </Badge>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleToggleAvailability(slot.id, slot.isAvailable)}
                          data-testid={`button-toggle-${slot.id}`}
                        >
                          <Switch checked={slot.isAvailable ?? false} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(slot)}
                          data-testid={`button-edit-${slot.id}`}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(slot.id)}
                          data-testid={`button-delete-${slot.id}`}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog open={!!deletingSlotId} onOpenChange={(open) => !open && setDeletingSlotId(null)}>
        <AlertDialogContent data-testid="dialog-confirm-delete">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El horario se eliminará permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-500 hover:bg-red-600"
              data-testid="button-confirm-delete"
            >
              {deleteSlotMutation.isPending ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
