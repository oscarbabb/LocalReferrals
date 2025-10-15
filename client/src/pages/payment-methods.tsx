import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useLanguage } from "@/hooks/use-language";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { 
  Clock, 
  DollarSign, 
  FileText, 
  MenuIcon, 
  Plus, 
  Settings, 
  Shield, 
  Trash2,
  Edit3
} from "lucide-react";

interface PaymentMethod {
  id: string;
  providerId: string;
  paymentType: "hourly" | "fixed_job" | "menu_based";
  isActive: boolean;
  hourlyRate?: string | null;
  minimumHours?: string | null;
  fixedJobRate?: string | null;
  jobDescription?: string | null;
  estimatedDuration?: number | null;
  requiresDeposit: boolean;
  depositPercentage: number;
  cancellationPolicy?: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}

interface MenuItem {
  id: string;
  providerId: string;
  categoryName: string;
  itemName: string;
  description?: string | null;
  price: string;
  duration?: number | null;
  isAvailable: boolean;
  imageUrl?: string | null;
  hasVariations: boolean;
  minQuantity: number;
  maxQuantity?: number | null;
  sortOrder: number;
  createdAt: Date | null;
  updatedAt: Date | null;
}

const paymentMethodSchema = z.object({
  paymentType: z.enum(["hourly", "fixed_job", "menu_based"]),
  isActive: z.boolean(),
  hourlyRate: z.string().optional(),
  minimumHours: z.string().optional(),
  fixedJobRate: z.string().optional(),
  jobDescription: z.string().optional(),
  estimatedDuration: z.number().optional(),
  requiresDeposit: z.boolean(),
  depositPercentage: z.number().min(0).max(100),
  cancellationPolicy: z.string().optional(),
});

const menuItemSchema = (t: any) => z.object({
  categoryName: z.string().min(1, t('paymentMethods.validation.categoryNameRequired')),
  itemName: z.string().min(1, t('paymentMethods.validation.itemNameRequired')),
  description: z.string().optional(),
  price: z.string().min(1, t('paymentMethods.validation.priceRequired')),
  duration: z.number().optional(),
  isAvailable: z.boolean(),
  hasVariations: z.boolean(),
  minQuantity: z.number().min(1),
  maxQuantity: z.number().optional(),
  sortOrder: z.number(),
});

type PaymentMethodFormData = z.infer<typeof paymentMethodSchema>;
type MenuItemFormData = z.infer<ReturnType<typeof menuItemSchema>>;

// This would come from authentication in a real app
// For now using the first provider as example
const getProviderIdFromAuth = () => "57da14c6-07b1-4827-bf3e-8a3291096790";

export default function PaymentMethods() {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showMenuForm, setShowMenuForm] = useState(false);
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem | null>(null);

  // Fetch payment methods
  const { data: paymentMethods, isLoading: loadingPaymentMethods } = useQuery({
    queryKey: ["/api/providers", getProviderIdFromAuth(), "payment-methods"],
    queryFn: () => apiRequest("GET", `/api/providers/${getProviderIdFromAuth()}/payment-methods`),
  });

  // Fetch menu items
  const { data: menuItems, isLoading: loadingMenuItems } = useQuery({
    queryKey: ["/api/providers", getProviderIdFromAuth(), "menu-items"],
    queryFn: () => apiRequest("GET", `/api/providers/${getProviderIdFromAuth()}/menu-items`),
  });

  // Payment method form
  const paymentForm = useForm<PaymentMethodFormData>({
    resolver: zodResolver(paymentMethodSchema),
    defaultValues: {
      paymentType: "hourly",
      isActive: true,
      requiresDeposit: false,
      depositPercentage: 0,
    },
  });

  // Menu item form
  const menuForm = useForm<MenuItemFormData>({
    resolver: zodResolver(menuItemSchema(t)),
    defaultValues: {
      isAvailable: true,
      hasVariations: false,
      minQuantity: 1,
      sortOrder: 0,
    },
  });

  // Create payment method mutation
  const createPaymentMethodMutation = useMutation({
    mutationFn: async (data: PaymentMethodFormData) => {
      return await apiRequest("POST", `/api/providers/${getProviderIdFromAuth()}/payment-methods`, data);
    },
    onSuccess: () => {
      toast({
        title: t('paymentMethods.toast.created.title'),
        description: t('paymentMethods.toast.created.description'),
      });
      queryClient.invalidateQueries({
        queryKey: ["/api/providers", getProviderIdFromAuth(), "payment-methods"],
      });
      setShowPaymentForm(false);
      paymentForm.reset();
    },
    onError: (error) => {
      toast({
        title: t('paymentMethods.toast.createError.title'),
        description: t('paymentMethods.toast.createError.description'),
        variant: "destructive",
      });
    },
  });

  // Create menu item mutation
  const createMenuItemMutation = useMutation({
    mutationFn: async (data: MenuItemFormData) => {
      return await apiRequest("POST", `/api/providers/${getProviderIdFromAuth()}/menu-items`, data);
    },
    onSuccess: () => {
      toast({
        title: t('paymentMethods.toast.menuCreated.title'),
        description: t('paymentMethods.toast.menuCreated.description'),
      });
      queryClient.invalidateQueries({
        queryKey: ["/api/providers", getProviderIdFromAuth(), "menu-items"],
      });
      setShowMenuForm(false);
      menuForm.reset();
    },
    onError: (error) => {
      toast({
        title: t('paymentMethods.toast.menuCreateError.title'),
        description: t('paymentMethods.toast.menuCreateError.description'),
        variant: "destructive",
      });
    },
  });

  const watchedPaymentType = paymentForm.watch("paymentType");

  const getPaymentTypeIcon = (type: string) => {
    switch (type) {
      case "hourly":
        return <Clock className="w-5 h-5" />;
      case "fixed_job":
        return <FileText className="w-5 h-5" />;
      case "menu_based":
        return <MenuIcon className="w-5 h-5" />;
      default:
        return <DollarSign className="w-5 h-5" />;
    }
  };

  const getPaymentTypeLabel = (type: string) => {
    switch (type) {
      case "hourly":
        return t('paymentMethods.type.hourly');
      case "fixed_job":
        return t('paymentMethods.type.fixedJob');
      case "menu_based":
        return t('paymentMethods.type.menuBased');
      default:
        return type;
    }
  };

  const getPaymentTypeBadgeColor = (type: string) => {
    switch (type) {
      case "hourly":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "fixed_job":
        return "bg-green-100 text-green-700 border-green-200";
      case "menu_based":
        return "bg-purple-100 text-purple-700 border-purple-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  if (loadingPaymentMethods || loadingMenuItems) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-4 text-gray-600" data-testid="text-loading">{t('paymentMethods.loading')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50">
      <div className="max-w-6xl mx-auto p-4 space-y-8">
        
        {/* Header */}
        <div className="text-center py-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4" data-testid="text-page-title">
            {t('paymentMethods.title')}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {t('paymentMethods.description')}
          </p>
        </div>

        {/* Payment Methods Section */}
        <Card className="card-animate">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-6 h-6 text-orange-500" />
                {t('paymentMethods.title')}
              </CardTitle>
              <CardDescription>
                {t('paymentMethods.description')}
              </CardDescription>
            </div>
            <Button 
              onClick={() => setShowPaymentForm(true)}
              className="bg-orange-500 hover:bg-orange-600"
              data-testid="button-add-payment-method"
            >
              <Plus className="w-4 h-4 mr-2" />
              {t('paymentMethods.addButton')}
            </Button>
          </CardHeader>
          <CardContent>
            {(!Array.isArray(paymentMethods) || paymentMethods.length === 0) ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <DollarSign className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2" data-testid="text-empty-title">
                  {t('paymentMethods.empty.title')}
                </h3>
                <p className="text-gray-500 mb-6">
                  {t('paymentMethods.empty.description')}
                </p>
                <Button 
                  onClick={() => setShowPaymentForm(true)}
                  className="bg-orange-500 hover:bg-orange-600"
                  data-testid="button-add-first-method"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {t('paymentMethods.empty.button')}
                </Button>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {Array.isArray(paymentMethods) && paymentMethods.map((method: PaymentMethod) => (
                  <Card key={method.id} className="hover-lift transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          {getPaymentTypeIcon(method.paymentType)}
                          <div>
                            <h3 className="font-semibold text-lg">
                              {getPaymentTypeLabel(method.paymentType)}
                            </h3>
                            <Badge className={getPaymentTypeBadgeColor(method.paymentType)}>
                              {method.isActive ? t('paymentMethods.card.active') : t('paymentMethods.card.inactive')}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {method.paymentType === "hourly" && (
                          <>
                            {method.hourlyRate && (
                              <div className="p-3 bg-blue-50 rounded-lg">
                                <p className="text-sm font-medium text-blue-700">{t('paymentMethods.card.hourlyRate')}</p>
                                <p className="text-lg font-bold text-blue-900">MXN ${method.hourlyRate}</p>
                              </div>
                            )}
                            {method.minimumHours && (
                              <div className="p-3 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-600">{t('paymentMethods.card.minimumHours')}</p>
                                <p className="font-semibold">{method.minimumHours} {t('paymentMethods.card.hours')}</p>
                              </div>
                            )}
                          </>
                        )}

                        {method.paymentType === "fixed_job" && (
                          <>
                            {method.fixedJobRate && (
                              <div className="p-3 bg-green-50 rounded-lg">
                                <p className="text-sm font-medium text-green-700">{t('paymentMethods.card.fixedRate')}</p>
                                <p className="text-lg font-bold text-green-900">MXN ${method.fixedJobRate}</p>
                              </div>
                            )}
                            {method.jobDescription && (
                              <div className="p-3 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-600">{t('checkout.summary.description')}</p>
                                <p className="text-sm">{method.jobDescription}</p>
                              </div>
                            )}
                            {method.estimatedDuration && (
                              <div className="p-3 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-600">{t('paymentMethods.card.estimatedDuration')}</p>
                                <p className="font-semibold">{method.estimatedDuration} {t('paymentMethods.menu.minutes')}</p>
                              </div>
                            )}
                          </>
                        )}

                        {method.requiresDeposit && (
                          <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-lg">
                            <Shield className="w-4 h-4 text-amber-600" />
                            <span className="text-sm text-amber-700">
                              {t('paymentMethods.card.depositPercentage')} {method.depositPercentage}%
                            </span>
                          </div>
                        )}

                        {method.cancellationPolicy && (
                          <div className="p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-600">{t('paymentMethods.card.cancellationPolicy')}</p>
                            <p className="text-sm">{method.cancellationPolicy}</p>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 mt-4">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          data-testid={`button-edit-payment-${method.id}`}
                        >
                          <Edit3 className="w-4 h-4 mr-2" />
                          {t('paymentMethods.card.editButton')}
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          data-testid={`button-delete-payment-${method.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Menu Items Section */}
        {Array.isArray(paymentMethods) && paymentMethods.some((method: PaymentMethod) => method.paymentType === "menu_based" && method.isActive) && (
          <Card className="card-animate">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <MenuIcon className="w-6 h-6 text-purple-500" />
                  Menú de Servicios
                </CardTitle>
                <CardDescription>
                  Configura los servicios específicos que ofreces con precios individuales
                </CardDescription>
              </div>
              <Button 
                onClick={() => setShowMenuForm(true)}
                className="bg-purple-500 hover:bg-purple-600"
                data-testid="button-add-menu-item"
              >
                <Plus className="w-4 h-4 mr-2" />
                Agregar Servicio
              </Button>
            </CardHeader>
            <CardContent>
              {(!Array.isArray(menuItems) || menuItems.length === 0) ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <MenuIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No hay servicios en el menú
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Agrega servicios específicos con precios detallados
                  </p>
                  <Button 
                    onClick={() => setShowMenuForm(true)}
                    className="bg-purple-500 hover:bg-purple-600"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar Primer Servicio
                  </Button>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {Array.isArray(menuItems) && menuItems.map((item: MenuItem) => (
                    <Card key={item.id} className="hover-lift transition-all duration-300">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">{item.itemName}</h3>
                            <Badge variant="outline" className="text-xs">
                              {item.categoryName}
                            </Badge>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-purple-600">MXN ${item.price}</p>
                            {item.duration && (
                              <p className="text-xs text-gray-500">{item.duration} min</p>
                            )}
                          </div>
                        </div>
                        
                        {item.description && (
                          <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                        )}
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant={item.isAvailable ? "default" : "secondary"}>
                              {item.isAvailable ? "Disponible" : "No Disponible"}
                            </Badge>
                            {item.hasVariations && (
                              <Badge variant="outline">Con Variaciones</Badge>
                            )}
                          </div>
                          <div className="flex gap-1">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              data-testid={`button-edit-menu-${item.id}`}
                            >
                              <Edit3 className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              data-testid={`button-delete-menu-${item.id}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Payment Method Form Modal */}
        {showPaymentForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <CardTitle>Configurar Método de Pago</CardTitle>
                <CardDescription>
                  Define cómo quieres cobrar por tus servicios
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...paymentForm}>
                  <form 
                    onSubmit={paymentForm.handleSubmit((data) => createPaymentMethodMutation.mutate(data))}
                    className="space-y-6"
                  >
                    <FormField
                      control={paymentForm.control}
                      name="paymentType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo de Pago</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecciona el tipo de pago" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="hourly">Por Hora - Ideal para servicios como limpieza, cuidado de niños</SelectItem>
                              <SelectItem value="fixed_job">Trabajo Fijo - Para proyectos con precio fijo</SelectItem>
                              <SelectItem value="menu_based">Menú de Servicios - Para restaurantes, salones de belleza</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {watchedPaymentType === "hourly" && (
                      <>
                        <FormField
                          control={paymentForm.control}
                          name="hourlyRate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Tarifa por Hora (MXN $)</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="1500.00" 
                                  type="number" 
                                  step="0.01"
                                  {...field} 
                                />
                              </FormControl>
                              <FormDescription>
                                Precio que cobras por hora de trabajo
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={paymentForm.control}
                          name="minimumHours"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Horas Mínimas</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="2.0" 
                                  type="number" 
                                  step="0.5"
                                  {...field} 
                                />
                              </FormControl>
                              <FormDescription>
                                Cantidad mínima de horas por trabajo (opcional)
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </>
                    )}

                    {watchedPaymentType === "fixed_job" && (
                      <>
                        <FormField
                          control={paymentForm.control}
                          name="fixedJobRate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Precio del Trabajo (MXN $)</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="5000.00" 
                                  type="number" 
                                  step="0.01"
                                  {...field} 
                                />
                              </FormControl>
                              <FormDescription>
                                Precio fijo por completar el trabajo
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={paymentForm.control}
                          name="jobDescription"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Descripción del Trabajo</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Describe exactamente qué incluye este trabajo..."
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={paymentForm.control}
                          name="estimatedDuration"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Duración Estimada (minutos)</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="120" 
                                  type="number"
                                  {...field}
                                  onChange={(e) => field.onChange(Number(e.target.value) || undefined)}
                                />
                              </FormControl>
                              <FormDescription>
                                Tiempo estimado para completar el trabajo
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </>
                    )}

                    <FormField
                      control={paymentForm.control}
                      name="requiresDeposit"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              Requiere Depósito
                            </FormLabel>
                            <FormDescription>
                              Solicitar un depósito antes de comenzar el trabajo
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    {paymentForm.watch("requiresDeposit") && (
                      <FormField
                        control={paymentForm.control}
                        name="depositPercentage"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Porcentaje de Depósito (%)</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="20" 
                                type="number" 
                                min="0" 
                                max="100"
                                {...field}
                                onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormDescription>
                              Porcentaje del precio total a solicitar como depósito
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    <FormField
                      control={paymentForm.control}
                      name="cancellationPolicy"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Política de Cancelación</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Describe tu política de cancelación..."
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            Condiciones para cancelación y reembolsos
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={paymentForm.control}
                      name="isActive"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              Activar Método
                            </FormLabel>
                            <FormDescription>
                              Los clientes podrán ver y elegir este método de pago
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <div className="flex gap-3">
                      <Button 
                        type="button" 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => setShowPaymentForm(false)}
                      >
                        Cancelar
                      </Button>
                      <Button 
                        type="submit" 
                        className="flex-1 bg-orange-500 hover:bg-orange-600"
                        disabled={createPaymentMethodMutation.isPending}
                        data-testid="button-save-payment-method"
                      >
                        {createPaymentMethodMutation.isPending ? "Guardando..." : "Guardar Método"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Menu Item Form Modal */}
        {showMenuForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <CardTitle>Agregar Servicio al Menú</CardTitle>
                <CardDescription>
                  Configura un servicio específico con precio individual
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...menuForm}>
                  <form 
                    onSubmit={menuForm.handleSubmit((data) => createMenuItemMutation.mutate(data))}
                    className="space-y-6"
                  >
                    <FormField
                      control={menuForm.control}
                      name="categoryName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Categoría</FormLabel>
                          <FormControl>
                            <Input placeholder="Ejemplo: Manicures, Platos Principales, Masajes" {...field} />
                          </FormControl>
                          <FormDescription>
                            Agrupa servicios similares bajo una categoría
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={menuForm.control}
                      name="itemName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre del Servicio</FormLabel>
                          <FormControl>
                            <Input placeholder="Ejemplo: Manicure Clásico, Pasta Carbonara" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={menuForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Descripción</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Describe el servicio, qué incluye, materiales utilizados..."
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={menuForm.control}
                        name="price"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Precio (MXN $)</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="800.00" 
                                type="number" 
                                step="0.01"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={menuForm.control}
                        name="duration"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Duración (minutos)</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="60" 
                                type="number"
                                {...field}
                                onChange={(e) => field.onChange(Number(e.target.value) || undefined)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={menuForm.control}
                        name="minQuantity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cantidad Mínima</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="1" 
                                type="number" 
                                min="1"
                                {...field}
                                onChange={(e) => field.onChange(Number(e.target.value) || 1)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={menuForm.control}
                        name="maxQuantity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cantidad Máxima</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Sin límite" 
                                type="number" 
                                min="1"
                                {...field}
                                onChange={(e) => field.onChange(Number(e.target.value) || undefined)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={menuForm.control}
                      name="sortOrder"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Orden de Visualización</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="0" 
                              type="number"
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormDescription>
                            Número para controlar en qué orden aparece en el menú
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex flex-col gap-4">
                      <FormField
                        control={menuForm.control}
                        name="hasVariations"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">
                                Tiene Variaciones
                              </FormLabel>
                              <FormDescription>
                                El servicio tiene opciones adicionales (tamaños, extras, etc.)
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={menuForm.control}
                        name="isAvailable"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">
                                Disponible
                              </FormLabel>
                              <FormDescription>
                                Los clientes pueden solicitar este servicio actualmente
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="flex gap-3">
                      <Button 
                        type="button" 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => setShowMenuForm(false)}
                      >
                        Cancelar
                      </Button>
                      <Button 
                        type="submit" 
                        className="flex-1 bg-purple-500 hover:bg-purple-600"
                        disabled={createMenuItemMutation.isPending}
                        data-testid="button-save-menu-item"
                      >
                        {createMenuItemMutation.isPending ? "Guardando..." : "Agregar Servicio"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        )}

      </div>
    </div>
  );
}