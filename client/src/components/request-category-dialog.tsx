import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { useLanguage } from "@/hooks/use-language";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const requestCategorySchema = z.object({
  requestType: z.enum(["category", "subcategory"]),
  categoryName: z.string().min(1, "Category name is required"),
  subcategoryName: z.string().optional(),
  parentCategoryId: z.string().optional(),
  description: z.string().min(10, "Description must be at least 10 characters"),
});

type RequestCategoryFormData = z.infer<typeof requestCategorySchema>;

interface RequestCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: { id: string; name: string }[];
}

export function RequestCategoryDialog({
  open,
  onOpenChange,
  categories,
}: RequestCategoryDialogProps) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [requestType, setRequestType] = useState<"category" | "subcategory">("category");

  const form = useForm<RequestCategoryFormData>({
    resolver: zodResolver(requestCategorySchema),
    defaultValues: {
      requestType: "category",
      categoryName: "",
      subcategoryName: "",
      parentCategoryId: "",
      description: "",
    },
  });

  const createRequestMutation = useMutation({
    mutationFn: async (data: RequestCategoryFormData) => {
      return await apiRequest("POST", "/api/category-requests", data);
    },
    onSuccess: () => {
      toast({
        title: t("services.requestSuccess"),
        variant: "default",
      });
      form.reset();
      onOpenChange(false);
    },
    onError: () => {
      toast({
        title: t("services.requestError"),
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: RequestCategoryFormData) => {
    createRequestMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]" data-testid="dialog-request-category">
        <DialogHeader>
          <DialogTitle data-testid="text-dialog-title">{t("services.requestCategoryTitle")}</DialogTitle>
          <DialogDescription data-testid="text-dialog-description">
            {t("services.requestCategoryDescription")}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="requestType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("services.requestType")}</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      setRequestType(value as "category" | "subcategory");
                    }}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger data-testid="select-request-type">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="category" data-testid="option-category">
                        {t("services.requestTypeCategory")}
                      </SelectItem>
                      <SelectItem value="subcategory" data-testid="option-subcategory">
                        {t("services.requestTypeSubcategory")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="categoryName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {requestType === "category"
                      ? t("services.categoryName")
                      : t("services.subcategoryName")}
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder={
                        requestType === "category"
                          ? t("services.categoryNamePlaceholder")
                          : t("services.subcategoryNamePlaceholder")
                      }
                      data-testid="input-category-name"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {requestType === "subcategory" && (
              <FormField
                control={form.control}
                name="parentCategoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("services.parentCategory")}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-parent-category">
                          <SelectValue placeholder={t("services.parentCategoryPlaceholder")} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id} data-testid={`option-parent-${category.id}`}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("services.requestDescription")}</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder={t("services.requestDescriptionPlaceholder")}
                      rows={4}
                      data-testid="textarea-description"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full"
              disabled={createRequestMutation.isPending}
              data-testid="button-submit-request"
            >
              {createRequestMutation.isPending
                ? t("services.submittingRequest")
                : t("services.submitRequest")}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
