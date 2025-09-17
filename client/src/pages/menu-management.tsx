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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { 
  Menu, 
  Plus, 
  Edit2, 
  Trash2, 
  DollarSign, 
  Clock,
  Image,
  ShoppingCart
} from "lucide-react";
import type { MenuItem, InsertMenuItem } from "@shared/schema";

// Menu item form schema
const menuItemSchema = z.object({
  categoryName: z.string().min(1, "Selecciona una categoría"),
  itemName: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  description: z.string().min(10, "La descripción debe tener al menos 10 caracteres"),
  price: z.string().min(1, "Ingresa el precio").refine((val) => {
    const num = parseFloat(val);
    return !isNaN(num) && num > 0;
  }, "El precio debe ser un número válido mayor a 0"),
  duration: z.string().optional(),
  isAvailable: z.boolean().default(true)
});

type MenuItemForm = z.infer<typeof menuItemSchema>;

export default function MenuManagement() {
  const { toast } = useToast();
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  // Get current user's provider profile - CRITICAL SECURITY FIX
  const { data: provider, isLoading: providerLoading, error: providerError } = useQuery<any>({
    queryKey: ["/api/auth/provider"],
    enabled: isAuthenticated,
    retry: false
  });

  // Handle authentication errors in useEffect to avoid side effects during render
  useEffect(() => {
    if (providerError && isUnauthorizedError(providerError)) {
      toast({
        title: "Authentication Required",
        description: "Please log in to manage your menu.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 1000);
    }
  }, [providerError, toast]);

  const providerId = provider?.id;

  const { data: menuItems = [], isLoading } = useQuery<MenuItem[]>({
    queryKey: ["/api/providers", providerId, "menu-items"],
    enabled: !!providerId, // Only fetch when we have a provider ID
  });

  const form = useForm<MenuItemForm>({
    resolver: zodResolver(menuItemSchema),
    defaultValues: {
      categoryName: "",
      itemName: "",
      description: "",
      price: "",
      duration: "",
      isAvailable: true
    }
  });

  const createMenuItemMutation = useMutation({
    mutationFn: async (itemData: MenuItemForm) => {
      if (!providerId) throw new Error("Provider not found - authentication required");
      const response = await apiRequest("POST", `/api/providers/${providerId}/menu-items`, {
        ...itemData,
        price: itemData.price, // Keep as string - server expects string
        duration: itemData.duration ? parseInt(itemData.duration) : null
      });
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "¡Artículo agregado exitosamente!",
        description: "Tu nuevo servicio/producto ya está disponible en tu menú.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/providers", providerId, "menu-items"] });
      setIsDialogOpen(false);
      form.reset();
      setEditingItem(null);
    },
    onError: (error: any) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Authentication Required",
          description: "Please log in again to manage your menu.",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 1000);
        return;
      }
      toast({
        title: "Error al agregar artículo",
        description: error.message || "Hubo un problema al agregar el artículo.",
        variant: "destructive",
      });
    },
  });

  // MISSING FUNCTIONALITY FIX: Add update mutation
  const updateMenuItemMutation = useMutation({
    mutationFn: async ({ id, itemData }: { id: string; itemData: MenuItemForm }) => {
      if (!providerId) throw new Error("Provider not found - authentication required");
      const response = await apiRequest("PUT", `/api/providers/${providerId}/menu-items/${id}`, {
        ...itemData,
        price: itemData.price,
        duration: itemData.duration ? parseInt(itemData.duration) : null
      });
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "¡Artículo actualizado exitosamente!",
        description: "Los cambios se han guardado correctamente.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/providers", providerId, "menu-items"] });
      setIsDialogOpen(false);
      form.reset();
      setEditingItem(null);
    },
    onError: (error: any) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Authentication Required",
          description: "Please log in again to manage your menu.",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 1000);
        return;
      }
      toast({
        title: "Error al actualizar artículo",
        description: error.message || "Hubo un problema al actualizar el artículo.",
        variant: "destructive",
      });
    },
  });

  const deleteMenuItemMutation = useMutation({
    mutationFn: async (itemId: string) => {
      if (!providerId) throw new Error("Provider not found - authentication required");
      await apiRequest("DELETE", `/api/providers/${providerId}/menu-items/${itemId}`);
    },
    onSuccess: () => {
      toast({
        title: "Artículo eliminado",
        description: "El artículo ha sido eliminado de tu menú.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/providers", providerId, "menu-items"] });
    },
    onError: (error: any) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Authentication Required",
          description: "Please log in again to manage your menu.",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 1000);
        return;
      }
      toast({
        title: "Error al eliminar artículo",
        description: error.message || "Hubo un problema al eliminar el artículo.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: MenuItemForm) => {
    if (editingItem) {
      // CRITICAL FIX: Use update mutation when editing
      updateMenuItemMutation.mutate({ id: editingItem.id, itemData: data });
    } else {
      // Create new item
      createMenuItemMutation.mutate(data);
    }
  };

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
    form.reset({
      categoryName: item.categoryName,
      itemName: item.itemName,
      description: item.description || "",
      price: item.price.toString(),
      duration: item.duration?.toString() || "",
      isAvailable: item.isAvailable ?? true
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (itemId: string) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este artículo?")) {
      deleteMenuItemMutation.mutate(itemId);
    }
  };

  const categoryOptions = [
    "Alimentos y Bebidas",
    "Servicios de Belleza",
    "Servicios de Limpieza",
    "Reparaciones",
    "Tutorías y Clases",
    "Cuidado Personal",
    "Otros Servicios"
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <div className="bg-orange-100 p-2 rounded-full">
                  <Menu className="w-6 h-6 text-orange-600" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Gestión de Menú
                </h1>
              </div>
              <p className="text-gray-600">
                Administra los servicios y productos que ofreces a tus clientes
              </p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  className="bg-orange-600 hover:bg-orange-700"
                  data-testid="button-add-menu-item"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Artículo
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingItem ? 'Editar Artículo' : 'Agregar Nuevo Artículo'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingItem 
                      ? 'Modifica los detalles de tu artículo' 
                      : 'Agrega un nuevo servicio o producto a tu menú'
                    }
                  </DialogDescription>
                </DialogHeader>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    {/* Category */}
                    <FormField
                      control={form.control}
                      name="categoryName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Categoría</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-menu-category">
                                <SelectValue placeholder="Selecciona una categoría" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {categoryOptions.map((category) => (
                                <SelectItem key={category} value={category}>
                                  {category}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Item Name */}
                    <FormField
                      control={form.control}
                      name="itemName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre del Servicio/Producto</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Ej: Corte de cabello, Limpieza profunda, Clases de inglés"
                              {...field}
                              data-testid="input-menu-item-name"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Description */}
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Descripción</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Describe los detalles del servicio o producto..."
                              {...field}
                              data-testid="textarea-menu-description"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      {/* Price */}
                      <FormField
                        control={form.control}
                        name="price"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Precio (MXN)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="150"
                                {...field}
                                data-testid="input-menu-price"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Duration */}
                      <FormField
                        control={form.control}
                        name="duration"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Duración (minutos)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="60"
                                {...field}
                                data-testid="input-menu-duration"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setIsDialogOpen(false);
                          setEditingItem(null);
                          form.reset();
                        }}
                      >
                        Cancelar
                      </Button>
                      <Button
                        type="submit"
                        disabled={createMenuItemMutation.isPending}
                        className="bg-orange-600 hover:bg-orange-700"
                        data-testid="button-save-menu-item"
                      >
                        {createMenuItemMutation.isPending 
                          ? 'Guardando...' 
                          : editingItem ? 'Actualizar' : 'Agregar'
                        }
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Menu Items List */}
        <div className="space-y-6">
          {isLoading ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-gray-500">Cargando tu menú...</p>
              </CardContent>
            </Card>
          ) : menuItems.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No tienes artículos en tu menú
                </h3>
                <p className="text-gray-500 mb-4">
                  Comienza agregando tus primeros servicios o productos
                </p>
                <Button 
                  onClick={() => setIsDialogOpen(true)}
                  className="bg-orange-600 hover:bg-orange-700"
                  data-testid="button-add-first-item"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Primer Artículo
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {menuItems.map((item) => (
                <Card key={item.id} data-testid={`menu-item-${item.id}`}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <CardTitle className="text-lg">{item.itemName}</CardTitle>
                          <Badge variant={item.isAvailable ? "default" : "secondary"}>
                            {item.isAvailable ? 'Disponible' : 'No disponible'}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded">
                            {item.categoryName}
                          </span>
                          <div className="flex items-center">
                            <DollarSign className="w-4 h-4 mr-1" />
                            MXN ${item.price}
                          </div>
                          {item.duration && (
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              {item.duration} min
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(item)}
                          data-testid={`button-edit-${item.id}`}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(item.id)}
                          className="text-red-600 hover:text-red-700"
                          data-testid={`button-delete-${item.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  {item.description && (
                    <CardContent>
                      <p className="text-gray-600">{item.description}</p>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}