import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useLanguage } from "@/hooks/use-language";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, CheckCircle } from "lucide-react";

interface ForgotPasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ForgotPasswordDialog({ open, onOpenChange }: ForgotPasswordDialogProps) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);

  const forgotPasswordMutation = useMutation({
    mutationFn: async (email: string) => {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Error sending reset email");
      }

      return response.json();
    },
    onSuccess: () => {
      setEmailSent(true);
      toast({
        title: t('auth.forgotPassword.emailSent'),
        description: t('auth.forgotPassword.emailSentDescription'),
      });
    },
    onError: (error: any) => {
      const isEmailNotFound = error.message.includes("not found");
      toast({
        title: isEmailNotFound
          ? t('auth.forgotPassword.emailNotFound')
          : t('auth.forgotPassword.errorSending'),
        description: isEmailNotFound
          ? t('auth.forgotPassword.emailNotFoundDescription')
          : t('auth.forgotPassword.errorSendingDescription'),
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      forgotPasswordMutation.mutate(email);
    }
  };

  const handleClose = () => {
    setEmail("");
    setEmailSent(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md" data-testid="dialog-forgot-password">
        {!emailSent ? (
          <>
            <DialogHeader>
              <DialogTitle>{t('auth.forgotPassword.title')}</DialogTitle>
              <DialogDescription>
                {t('auth.forgotPassword.description')}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reset-email">{t('auth.forgotPassword.emailLabel')}</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="reset-email"
                    type="email"
                    placeholder={t('auth.forgotPassword.emailPlaceholder')}
                    className="pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    data-testid="input-reset-email"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  data-testid="button-cancel-reset"
                >
                  {t('auth.forgotPassword.cancelButton')}
                </Button>
                <Button
                  type="submit"
                  disabled={forgotPasswordMutation.isPending}
                  data-testid="button-send-reset"
                >
                  {forgotPasswordMutation.isPending
                    ? t('auth.forgotPassword.sendingButton')
                    : t('auth.forgotPassword.sendButton')}
                </Button>
              </div>
            </form>
          </>
        ) : (
          <>
            <DialogHeader>
              <div className="flex justify-center mb-4">
                <CheckCircle className="w-16 h-16 text-green-500" />
              </div>
              <DialogTitle className="text-center">{t('auth.forgotPassword.emailSent')}</DialogTitle>
              <DialogDescription className="text-center">
                {t('auth.forgotPassword.emailSentDescription')}
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-center">
              <Button onClick={handleClose} data-testid="button-close-success">
                {t('auth.forgotPassword.backToLogin')}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
