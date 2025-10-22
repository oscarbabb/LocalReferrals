import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/use-language";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";

const customerRatingSchema = z.object({
  rating: z.number().min(1).max(5),
  communication: z.number().min(1).max(5),
  punctuality: z.number().min(1).max(5),
  comment: z.string().optional(),
});

type CustomerRatingData = z.infer<typeof customerRatingSchema>;

interface CustomerRatingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  customerId: string;
  customerName: string;
  providerId: string;
}

export default function CustomerRatingDialog({
  isOpen,
  onClose,
  customerId,
  customerName,
  providerId,
}: CustomerRatingDialogProps) {
  const { toast } = useToast();
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [hoveredRating, setHoveredRating] = useState<{ [key: string]: number }>({});

  const form = useForm<CustomerRatingData>({
    resolver: zodResolver(customerRatingSchema),
    defaultValues: {
      rating: 5,
      communication: 5,
      punctuality: 5,
      comment: "",
    },
  });

  const createRatingMutation = useMutation({
    mutationFn: async (data: CustomerRatingData) => {
      const response = await apiRequest("POST", "/api/reviews", {
        ...data,
        providerId,
        reviewedUserId: customerId,
        reviewType: "customer_review",
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: t('bookings.toast.ratingSuccess'),
        description: t('bookings.toast.ratingSuccessDesc'),
      });
      form.reset();
      onClose();
      queryClient.invalidateQueries({ queryKey: ["/api/users", customerId, "reviews"] });
    },
    onError: (error: Error) => {
      toast({
        title: t('bookings.toast.error'),
        description: error.message || t('bookings.toast.ratingFailed'),
        variant: "destructive",
      });
    },
  });

  const renderStarRating = (fieldName: 'rating' | 'communication' | 'punctuality', label: string) => (
    <FormField
      control={form.control}
      name={fieldName}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-8 h-8 cursor-pointer transition-colors ${
                    star <= (hoveredRating[fieldName] || field.value)
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  }`}
                  onClick={() => field.onChange(star)}
                  onMouseEnter={() => setHoveredRating(prev => ({ ...prev, [fieldName]: star }))}
                  onMouseLeave={() => setHoveredRating(prev => ({ ...prev, [fieldName]: 0 }))}
                  data-testid={`star-${fieldName}-${star}`}
                />
              ))}
              <span className="ml-2 text-sm text-gray-600">{field.value}/5</span>
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );

  const onSubmit = (data: CustomerRatingData) => {
    createRatingMutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]" data-testid="dialog-customer-rating">
        <DialogHeader>
          <DialogTitle>{t('bookings.rateCustomer.title', { customerName })}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {renderStarRating('rating', t('bookings.rateCustomer.overall'))}
            {renderStarRating('communication', t('bookings.rateCustomer.communication'))}
            {renderStarRating('punctuality', t('bookings.rateCustomer.punctuality'))}
            
            <FormField
              control={form.control}
              name="comment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('bookings.rateCustomer.comment')}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t('bookings.rateCustomer.commentPlaceholder')}
                      className="min-h-[100px]"
                      {...field}
                      data-testid="textarea-customer-comment"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={createRatingMutation.isPending}
                data-testid="button-cancel-rating"
              >
                {t('common.cancel')}
              </Button>
              <Button
                type="submit"
                className="bg-orange-500 hover:bg-orange-600"
                disabled={createRatingMutation.isPending}
                data-testid="button-submit-rating"
              >
                {createRatingMutation.isPending ? t('common.submitting') : t('common.submit')}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
