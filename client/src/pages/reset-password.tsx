import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { useLanguage } from "@/hooks/use-language";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle } from "lucide-react";

export default function ResetPassword() {
  const [, setLocation] = useLocation();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState(false);

  // Extract token from URL query parameter
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    setResetToken(token);

    if (!token) {
      toast({
        title: t('auth.resetPassword.invalidToken'),
        description: t('auth.resetPassword.invalidTokenDescription'),
        variant: "destructive",
      });
    }
  }, []);

  const resetPasswordMutation = useMutation({
    mutationFn: async ({ token, newPassword }: { token: string; newPassword: string }) => {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, newPassword }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Error resetting password");
      }

      return response.json();
    },
    onSuccess: () => {
      setResetSuccess(true);
      toast({
        title: t('auth.resetPassword.success'),
        description: t('auth.resetPassword.successDescription'),
      });
      // Redirect to login after 3 seconds
      setTimeout(() => {
        setLocation("/auth");
      }, 3000);
    },
    onError: (error: any) => {
      const isInvalidToken = error.message.includes("Invalid") || error.message.includes("expired");
      toast({
        title: isInvalidToken
          ? t('auth.resetPassword.invalidToken')
          : t('auth.resetPassword.error'),
        description: isInvalidToken
          ? t('auth.resetPassword.invalidTokenDescription')
          : t('auth.resetPassword.errorDescription'),
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!resetToken) {
      toast({
        title: t('auth.resetPassword.invalidToken'),
        description: t('auth.resetPassword.invalidTokenDescription'),
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 8) {
      toast({
        title: t('auth.resetPassword.error'),
        description: t('auth.resetPassword.passwordTooShort'),
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: t('auth.resetPassword.error'),
        description: t('auth.resetPassword.passwordMismatch'),
        variant: "destructive",
      });
      return;
    }

    resetPasswordMutation.mutate({ token: resetToken, newPassword });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link href="/" className="flex items-center justify-center space-x-3 mb-6">
            <img src="/logo.png" alt="Local References" className="w-14 h-14" />
            <span className="text-2xl font-bold text-gray-900">Referencias Locales</span>
          </Link>
          <h2 className="text-3xl font-bold text-gray-900">
            {t('auth.resetPassword.title')}
          </h2>
          <p className="mt-2 text-gray-600">
            {t('auth.resetPassword.description')}
          </p>
        </div>

        <Card>
          <CardContent className="p-6">
            {resetSuccess ? (
              <div className="text-center space-y-4" data-testid="reset-success-message">
                <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto" />
                <h3 className="text-xl font-semibold">{t('auth.resetPassword.success')}</h3>
                <p className="text-gray-600">{t('auth.resetPassword.successDescription')}</p>
                <p className="text-sm text-gray-500">Redirecting to login...</p>
              </div>
            ) : !resetToken ? (
              <div className="text-center space-y-4" data-testid="invalid-token-message">
                <AlertCircle className="w-16 h-16 text-red-500 mx-auto" />
                <h3 className="text-xl font-semibold">{t('auth.resetPassword.invalidToken')}</h3>
                <p className="text-gray-600">{t('auth.resetPassword.invalidTokenDescription')}</p>
                <Button onClick={() => setLocation("/auth")} data-testid="button-back-to-login">
                  {t('auth.forgotPassword.backToLogin')}
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-password">{t('auth.resetPassword.newPasswordLabel')}</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="new-password"
                      type={showNewPassword ? "text" : "password"}
                      placeholder={t('auth.resetPassword.newPasswordPlaceholder')}
                      className="pl-10 pr-10"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      minLength={8}
                      data-testid="input-new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                      data-testid="toggle-new-password-visibility"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">{t('auth.resetPassword.confirmPasswordLabel')}</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder={t('auth.resetPassword.confirmPasswordPlaceholder')}
                      className="pl-10 pr-10"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={8}
                      data-testid="input-confirm-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                      data-testid="toggle-confirm-password-visibility"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-primary text-white hover:bg-blue-700"
                  disabled={resetPasswordMutation.isPending}
                  data-testid="button-reset-password"
                >
                  {resetPasswordMutation.isPending
                    ? t('auth.resetPassword.resettingButton')
                    : t('auth.resetPassword.resetButton')}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        <div className="text-center">
          <Link href="/auth" className="text-primary hover:underline" data-testid="link-back-to-login">
            {t('auth.forgotPassword.backToLogin')}
          </Link>
        </div>
      </div>
    </div>
  );
}
