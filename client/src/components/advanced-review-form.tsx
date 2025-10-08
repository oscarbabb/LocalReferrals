import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { ObjectUploader } from "./ObjectUploader";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Star, Camera, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { UploadResult } from "@uppy/core";

const advancedReviewSchema = z.object({
  providerId: z.string(),
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
  photos: z.array(z.string()).default([]),
  serviceQuality: z.number().min(1).max(5).optional(),
  communication: z.number().min(1).max(5).optional(),
  punctuality: z.number().min(1).max(5).optional(),
  valueForMoney: z.number().min(1).max(5).optional(),
  wouldRecommend: z.boolean().default(true),
});

type AdvancedReviewData = z.infer<typeof advancedReviewSchema>;

interface AdvancedReviewFormProps {
  providerId: string;
  onSubmit?: () => void;
  onCancel?: () => void;
}

interface StarRatingProps {
  value: number;
  onChange: (value: number) => void;
  label: string;
}

function StarRating({ value, onChange, label }: StarRatingProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium min-w-[120px]">{label}</span>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="text-yellow-400 hover:text-yellow-500 transition-colors"
            data-testid={`star-${label.toLowerCase().replace(/\s+/g, '-')}-${star}`}
          >
            <Star 
              className={`w-5 h-5 ${star <= value ? 'fill-current' : ''}`} 
            />
          </button>
        ))}
      </div>
    </div>
  );
}

export default function AdvancedReviewForm({ 
  providerId, 
  onSubmit, 
  onCancel 
}: AdvancedReviewFormProps) {
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<AdvancedReviewData>({
    resolver: zodResolver(advancedReviewSchema),
    defaultValues: {
      providerId,
      rating: 5,
      comment: "",
      photos: [],
      serviceQuality: 5,
      communication: 5,
      punctuality: 5,
      valueForMoney: 5,
      wouldRecommend: true,
    },
  });

  const createReviewMutation = useMutation({
    mutationFn: async (data: AdvancedReviewData) => {
      const response = await apiRequest("POST", "/api/reviews", { ...data, photos: uploadedPhotos });
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "¡Reseña enviada!",
        description: "Gracias por tu reseña detallada.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/providers", providerId] });
      onSubmit?.();
    },
    onError: (error: Error) => {
      // Handle 401 authentication errors specifically
      if (error.message.includes("401")) {
        toast({
          title: "Autenticación requerida",
          description: "Por favor inicia sesión para dejar una reseña.",
          variant: "destructive",
        });
        return;
      }
      
      // Extract error message from the response (format: "status: message")
      const errorMessage = error.message.replace(/^\d+:\s*/, '') || "No se pudo enviar la reseña. Intenta nuevamente.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const handlePhotoUpload = async (): Promise<{ method: "PUT"; url: string }> => {
    const response = await apiRequest("POST", "/api/objects/upload");
    const data = await response.json();
    return {
      method: "PUT",
      url: data.uploadURL as string,
    };
  };

  const handlePhotoComplete = async (result: UploadResult<Record<string, unknown>, Record<string, unknown>>) => {
    if (result.successful && result.successful.length > 0) {
      const uploadedFile = result.successful[0];
      const photoURL = uploadedFile.uploadURL as string;
      
      try {
        // Set ACL policy for the photo and get the public objectPath
        const response = await apiRequest("PUT", "/api/review-photos", { photoURL });
        const data = await response.json();
        
        // Add the public objectPath to uploaded photos list for preview
        setUploadedPhotos(prev => [...prev, data.objectPath]);
      } catch (error) {
        console.error("Error setting photo ACL:", error);
        toast({
          title: "Error al subir foto",
          description: "No se pudo configurar la foto. Intenta nuevamente.",
          variant: "destructive",
        });
      }
    }
  };

  const removePhoto = (photoUrl: string) => {
    setUploadedPhotos(prev => prev.filter(photo => photo !== photoUrl));
  };

  const onFormSubmit = (data: AdvancedReviewData) => {
    createReviewMutation.mutate(data);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="w-5 h-5 text-yellow-400" />
          Escribir una Reseña Detallada
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onFormSubmit)} className="space-y-6">
            {/* Overall Rating */}
            <FormField
              control={form.control}
              name="rating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Calificación General</FormLabel>
                  <FormControl>
                    <StarRating
                      value={field.value}
                      onChange={field.onChange}
                      label="General"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Detailed Ratings */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">Calificaciones Detalladas</h4>
              
              <FormField
                control={form.control}
                name="serviceQuality"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <StarRating
                        value={field.value || 5}
                        onChange={field.onChange}
                        label="Calidad del Servicio"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="communication"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <StarRating
                        value={field.value || 5}
                        onChange={field.onChange}
                        label="Comunicación"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="punctuality"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <StarRating
                        value={field.value || 5}
                        onChange={field.onChange}
                        label="Puntualidad"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="valueForMoney"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <StarRating
                        value={field.value || 5}
                        onChange={field.onChange}
                        label="Relación Calidad-Precio"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            {/* Written Review */}
            <FormField
              control={form.control}
              name="comment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reseña Escrita</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Comparte tu experiencia con este proveedor de servicios..."
                      className="min-h-[120px]"
                      data-testid="textarea-review-comment"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Photo Upload */}
            <div className="space-y-4">
              <FormLabel>Fotos</FormLabel>
              
              {uploadedPhotos.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {uploadedPhotos.map((photo, index) => (
                    <div key={index} className="relative">
                      <img
                        src={photo}
                        alt={`Review photo ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                        data-testid={`img-review-photo-${index}`}
                      />
                      <button
                        type="button"
                        onClick={() => removePhoto(photo)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        data-testid={`button-remove-photo-${index}`}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              <ObjectUploader
                maxNumberOfFiles={5}
                maxFileSize={5242880} // 5MB
                onGetUploadParameters={handlePhotoUpload}
                onComplete={handlePhotoComplete}
                buttonClassName="bg-gray-100 hover:bg-gray-200 text-gray-700 border-2 border-dashed border-gray-300"
              >
                <Camera className="w-4 h-4 mr-2" />
                Agregar Fotos
              </ObjectUploader>
            </div>

            {/* Recommendation */}
            <FormField
              control={form.control}
              name="wouldRecommend"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <FormLabel>¿Recomendarías a este proveedor de servicios?</FormLabel>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      data-testid="switch-would-recommend"
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-4">
              <Button 
                type="submit" 
                disabled={createReviewMutation.isPending}
                className="flex-1"
                data-testid="button-submit-review"
              >
                {createReviewMutation.isPending ? "Enviando..." : "Enviar Reseña"}
              </Button>
              {onCancel && (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={onCancel}
                  data-testid="button-cancel-review"
                >
                  Cancelar
                </Button>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}