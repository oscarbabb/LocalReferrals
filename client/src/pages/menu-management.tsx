import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useLanguage } from "@/hooks/use-language";
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
  ShoppingCart,
  FileText,
  Upload,
  Download,
  X
} from "lucide-react";
import type { MenuItem, InsertMenuItem } from "@shared/schema";
import { ObjectUploader } from "@/components/ObjectUploader";
import type { UploadResult } from "@uppy/core";

// Menu item form schema
const createMenuItemSchema = (t: (key: string) => string) => z.object({
  categoryName: z.string().min(1, t('menuManagement.validation.categoryRequired')),
  itemName: z.string().min(3, t('menuManagement.validation.nameMin')),
  description: z.string().min(10, t('menuManagement.validation.descriptionMin')),
  price: z.string().min(1, t('menuManagement.validation.priceRequired')).refine((val) => {
    const num = parseFloat(val);
    return !isNaN(num) && num > 0;
  }, t('menuManagement.validation.priceValid')),
  duration: z.string().optional(),
  isAvailable: z.boolean().default(true)
});

type MenuItemForm = {
  categoryName: string;
  itemName: string;
  description: string;
  price: string;
  duration?: string;
  isAvailable: boolean;
};

export default function MenuManagement() {
  const { toast } = useToast();
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isUploadingDocument, setIsUploadingDocument] = useState(false);

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
        title: t('menuManagement.toast.authRequired.title'),
        description: t('menuManagement.toast.authRequired.description'),
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 1000);
    }
  }, [providerError, toast, t]);

  const providerId = provider?.id;

  const { data: menuItems = [], isLoading } = useQuery<MenuItem[]>({
    queryKey: ["/api/providers", providerId, "menu-items"],
    enabled: !!providerId, // Only fetch when we have a provider ID
  });

  const form = useForm<MenuItemForm>({
    resolver: zodResolver(createMenuItemSchema(t)),
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
        title: t('menuManagement.toast.added.title'),
        description: t('menuManagement.toast.added.description'),
      });
      queryClient.invalidateQueries({ queryKey: ["/api/providers", providerId, "menu-items"] });
      setIsDialogOpen(false);
      form.reset();
      setEditingItem(null);
    },
    onError: (error: any) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: t('menuManagement.toast.authRequired.title'),
          description: t('menuManagement.toast.authRequired.descriptionAgain'),
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 1000);
        return;
      }
      toast({
        title: t('menuManagement.toast.addError.title'),
        description: error.message || t('menuManagement.toast.addError.description'),
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
        title: t('menuManagement.toast.updated.title'),
        description: t('menuManagement.toast.updated.description'),
      });
      queryClient.invalidateQueries({ queryKey: ["/api/providers", providerId, "menu-items"] });
      setIsDialogOpen(false);
      form.reset();
      setEditingItem(null);
    },
    onError: (error: any) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: t('menuManagement.toast.authRequired.title'),
          description: t('menuManagement.toast.authRequired.descriptionAgain'),
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 1000);
        return;
      }
      toast({
        title: t('menuManagement.toast.updateError.title'),
        description: error.message || t('menuManagement.toast.updateError.description'),
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
        title: t('menuManagement.toast.deleted.title'),
        description: t('menuManagement.toast.deleted.description'),
      });
      queryClient.invalidateQueries({ queryKey: ["/api/providers", providerId, "menu-items"] });
    },
    onError: (error: any) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: t('menuManagement.toast.authRequired.title'),
          description: t('menuManagement.toast.authRequired.descriptionAgain'),
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 1000);
        return;
      }
      toast({
        title: t('menuManagement.toast.deleteError.title'),
        description: error.message || t('menuManagement.toast.deleteError.description'),
        variant: "destructive",
      });
    },
  });

  // Menu document upload mutation
  const updateMenuDocumentMutation = useMutation({
    mutationFn: async (menuDocumentUrl: string | null) => {
      if (!providerId) throw new Error("Provider not found");
      const response = await apiRequest("PATCH", `/api/providers/${providerId}/menu-document`, {
        menuDocumentUrl
      });
      return await response.json();
    },
    onSuccess: (_, menuDocumentUrl) => {
      toast({
        title: menuDocumentUrl ? t('menuManagement.toast.documentUpdated') : t('menuManagement.toast.documentDeleted'),
        description: menuDocumentUrl 
          ? t('menuManagement.toast.documentUploaded')
          : t('menuManagement.toast.documentRemoved'),
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/provider"] });
    },
    onError: (error: any) => {
      toast({
        title: t('common.error'),
        description: error.message || t('menuManagement.toast.documentError'),
        variant: "destructive",
      });
    },
  });

  // Menu document upload handlers
  const handleMenuDocumentUpload = async () => {
    const response = await apiRequest("POST", "/api/objects/upload");
    const data = await response.json();
    return {
      method: "PUT" as const,
      url: data.uploadURL as string,
    };
  };

  const handleMenuDocumentComplete = async (result: UploadResult<Record<string, unknown>, Record<string, unknown>>) => {
    if (result.successful && result.successful.length > 0) {
      setIsUploadingDocument(true);
      try {
        const uploadedFile = result.successful[0];
        const documentURL = uploadedFile.uploadURL as string;
        
        // Make the uploaded document public
        const response = await apiRequest("PUT", "/api/menu-documents", {
          documentURL: documentURL
        });
        const data = await response.json();
        
        // Update provider with the document URL
        updateMenuDocumentMutation.mutate(data.objectPath);
      } catch (error) {
        console.error("Error uploading menu document:", error);
        toast({
          title: t('menuManagement.toast.uploadError.title'),
          description: t('menuManagement.toast.uploadError.description'),
          variant: "destructive",
        });
      } finally {
        setIsUploadingDocument(false);
      }
    }
  };

  const handleDeleteMenuDocument = () => {
    if (window.confirm(t('menuManagement.confirmDeleteDocument'))) {
      updateMenuDocumentMutation.mutate(null);
    }
  };

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
    if (window.confirm(t('menuManagement.confirmDeleteItem'))) {
      deleteMenuItemMutation.mutate(itemId);
    }
  };

  const categoryOptions = [
    { value: "Alimentos y Bebidas", label: t('menuManagement.categories.food') },
    { value: "Servicios de Belleza", label: t('menuManagement.categories.beauty') },
    { value: "Servicios de Limpieza", label: t('menuManagement.categories.cleaning') },
    { value: "Reparaciones", label: t('menuManagement.categories.repairs') },
    { value: "Tutorías y Clases", label: t('menuManagement.categories.tutoring') },
    { value: "Cuidado Personal", label: t('menuManagement.categories.personalCare') },
    { value: "Otros Servicios", label: t('menuManagement.categories.other') }
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
                  {t('menuManagement.title')}
                </h1>
              </div>
              <p className="text-gray-600">
                {t('menuManagement.subtitle')}
              </p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  className="bg-orange-600 hover:bg-orange-700"
                  data-testid="button-add-menu-item"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {t('menuManagement.addButton')}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingItem ? t('menuManagement.dialog.titleEdit') : t('menuManagement.dialog.titleAdd')}
                  </DialogTitle>
                  <DialogDescription>
                    {editingItem 
                      ? t('menuManagement.dialog.descriptionEdit')
                      : t('menuManagement.dialog.descriptionAdd')
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
                          <FormLabel>{t('menuManagement.form.categoryLabel')}</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-menu-category">
                                <SelectValue placeholder={t('menuManagement.form.categoryPlaceholder')} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {categoryOptions.map((category) => (
                                <SelectItem key={category.value} value={category.value}>
                                  {category.label}
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
                          <FormLabel>{t('menuManagement.form.nameLabel')}</FormLabel>
                          <FormControl>
                            <Input
                              placeholder={t('menuManagement.form.namePlaceholder')}
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
                          <FormLabel>{t('menuManagement.form.descriptionLabel')}</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder={t('menuManagement.form.descriptionPlaceholder')}
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
                            <FormLabel>{t('menuManagement.form.priceLabel')}</FormLabel>
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
                            <FormLabel>{t('menuManagement.form.durationLabel')}</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="60"
                                {...field}
                                data-testid="input-menu-duration"
                              />
                            </FormControl>
                            <p className="text-xs text-gray-500 mt-1">{t('menuManagement.form.durationHelp')}</p>
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
                        {t('menuManagement.form.cancelButton')}
                      </Button>
                      <Button
                        type="submit"
                        disabled={createMenuItemMutation.isPending}
                        className="bg-orange-600 hover:bg-orange-700"
                        data-testid="button-save-menu-item"
                      >
                        {createMenuItemMutation.isPending 
                          ? t('menuManagement.form.saving')
                          : editingItem ? t('menuManagement.form.updateButton') : t('menuManagement.form.addButton')
                        }
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Upload Full Menu Document Section */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 p-2 rounded-full">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <CardTitle>{t('menuManagement.document.title')}</CardTitle>
                <CardDescription>
                  {t('menuManagement.document.description')}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {provider?.menuDocumentUrl ? (
              <div className="space-y-4">
                <div className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {provider.menuDocumentUrl.toLowerCase().endsWith('.pdf') ? (
                        <>
                          <FileText className="w-8 h-8 text-red-600" />
                          <div>
                            <p className="font-medium text-gray-900">{t('menuManagement.document.pdfTitle')}</p>
                            <p className="text-sm text-gray-500">{t('menuManagement.document.pdfSubtitle')}</p>
                          </div>
                        </>
                      ) : (
                        <>
                          <Image className="w-8 h-8 text-blue-600" />
                          <div>
                            <p className="font-medium text-gray-900">{t('menuManagement.document.imageTitle')}</p>
                            <p className="text-sm text-gray-500">{t('menuManagement.document.imageSubtitle')}</p>
                          </div>
                        </>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(`/objects/${provider.menuDocumentUrl}`, '_blank')}
                        data-testid="button-view-menu-document"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        {t('menuManagement.document.viewButton')}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDeleteMenuDocument}
                        className="text-red-600 hover:text-red-700"
                        data-testid="button-delete-menu-document"
                      >
                        <X className="w-4 h-4 mr-2" />
                        {t('menuManagement.document.deleteButton')}
                      </Button>
                    </div>
                  </div>
                </div>
                {!provider.menuDocumentUrl.toLowerCase().endsWith('.pdf') && (
                  <div className="mt-4">
                    <img 
                      src={`/objects/${provider.menuDocumentUrl}`} 
                      alt="Menú" 
                      className="max-w-full h-auto rounded-lg border"
                      data-testid="img-menu-preview"
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-gray-600">
                  {t('menuManagement.document.uploadHelp')}
                </p>
                <ObjectUploader
                  onGetUploadParameters={handleMenuDocumentUpload}
                  onComplete={handleMenuDocumentComplete}
                  maxFileSize={10 * 1024 * 1024}
                  allowedFileTypes={['.jpg', '.jpeg', '.png', '.pdf']}
                  buttonClassName="bg-orange-600 hover:bg-orange-700"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {t('menuManagement.document.uploadButton')}
                </ObjectUploader>
                {isUploadingDocument && (
                  <p className="text-sm text-gray-500">{t('menuManagement.document.uploading')}</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Menu Items List */}
        <div className="space-y-6">
          {isLoading ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-gray-500">{t('menuManagement.list.loading')}</p>
              </CardContent>
            </Card>
          ) : menuItems.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {t('menuManagement.list.emptyTitle')}
                </h3>
                <p className="text-gray-500 mb-4">
                  {t('menuManagement.list.emptyDescription')}
                </p>
                <Button 
                  onClick={() => setIsDialogOpen(true)}
                  className="bg-orange-600 hover:bg-orange-700"
                  data-testid="button-add-first-item"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {t('menuManagement.list.emptyButton')}
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
                            {item.isAvailable ? t('menuManagement.list.available') : t('menuManagement.list.unavailable')}
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
                              {item.duration} {t('menuManagement.list.minutes')}
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