import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/use-language";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ForgotPasswordDialog } from "@/components/forgot-password-dialog";
import { COUNTRY_CODES, COUNTRIES } from "@/lib/countries";

import { Mail, Lock, User, Phone, Briefcase, Eye, EyeOff } from "lucide-react";

export default function Auth() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [isProviderRegistration, setIsProviderRegistration] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [selectedCountryCode, setSelectedCountryCode] = useState("+52"); // Default to Mexico
  const [selectedCountry, setSelectedCountry] = useState("MX"); // Default to Mexico

  const registerMutation = useMutation({
    mutationFn: async (userData: any) => {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Error creating account");
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: t('auth.toast.registerSuccess.title'),
        description: t('auth.toast.registerSuccess.description'),
      });
      
      // Store provider setup token for secure provider creation
      if (data.user && isProviderRegistration && data.providerSetupToken) {
        sessionStorage.setItem('providerSetupToken', data.providerSetupToken);
        setLocation("/provider-setup");
      } else {
        setLocation("/");
      }
    },
    onError: (error: any) => {
      toast({
        title: t('auth.toast.registerError.title'),
        description: error.message || t('auth.toast.registerError.description'),
        variant: "destructive",
      });
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (loginData: { email: string; password: string }) => {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginData),
        credentials: "include",
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Error logging in");
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Invalidate auth queries to refresh user state
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      
      toast({
        title: t('auth.toast.loginSuccess.title'),
        description: t('auth.toast.loginSuccess.description'),
      });
      setLocation("/");
    },
    onError: (error: any) => {
      toast({
        title: t('auth.toast.loginError.title'),
        description: error.message || t('auth.toast.loginError.description'),
        variant: "destructive",
      });
    },
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    const loginData = {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    };

    loginMutation.mutate(loginData);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;
    
    if (password !== confirmPassword) {
      toast({
        title: t('auth.toast.passwordMismatch.title'),
        description: t('auth.toast.passwordMismatch.description'),
        variant: "destructive",
      });
      return;
    }

    const isProvider = formData.get("isProvider") === "on";
    setIsProviderRegistration(isProvider);

    // Combine country code with phone number for WhatsApp compatibility
    const phoneNumber = formData.get("phone") as string;
    const fullPhoneNumber = phoneNumber ? `${selectedCountryCode}${phoneNumber}` : "";

    const userData = {
      username: formData.get("username") as string,
      email: formData.get("email") as string,
      password: password,
      fullName: `${formData.get("firstName")} ${formData.get("lastName")}`,
      phone: fullPhoneNumber,
      country: selectedCountry,
      isProvider: isProvider,
      // Mexican Address Fields
      condominioMaestro: formData.get("condominioMaestro") as string,
      condominio: formData.get("condominio") as string,
      edificioOArea: formData.get("edificioOArea") as string,
      calle: formData.get("calle") as string,
      colonia: formData.get("colonia") as string,
      codigoPostal: formData.get("codigoPostal") as string,
      numeroExterior: formData.get("numeroExterior") as string,
      numeroInterior: formData.get("numeroInterior") as string,
      municipio: formData.get("municipio") as string,
      estado: formData.get("estado") as string,
      addressNotes: formData.get("addressNotes") as string,
    };

    registerMutation.mutate(userData);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link href="/" className="flex items-center justify-center space-x-3 mb-6">
            <img src="/logo.png" alt={t('auth.header.title')} className="w-14 h-14" />
            <span className="text-2xl font-bold text-gray-900">{t('auth.header.title')}</span>
          </Link>
          <h2 className="text-3xl font-bold text-gray-900">
            {t('auth.header.joinCommunity')}
          </h2>
          <p className="mt-2 text-gray-600">
            {t('auth.header.connectServices')}
          </p>
        </div>

        <Card>
          <CardContent className="p-6">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">{t('auth.login.tab')}</TabsTrigger>
                <TabsTrigger value="register">{t('auth.register.tab')}</TabsTrigger>
              </TabsList>

              {/* Login Tab */}
              <TabsContent value="login">
                <CardHeader>
                  <CardTitle>{t('auth.login.title')}</CardTitle>
                  <CardDescription>
                    {t('auth.login.description')}
                  </CardDescription>
                </CardHeader>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">{t('auth.login.email')}</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="login-email"
                        name="email"
                        type="email"
                        placeholder={t('auth.login.emailPlaceholder')}
                        className="pl-10"
                        required
                        data-testid="input-email"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">{t('auth.login.password')}</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="login-password"
                        name="password"
                        type={showLoginPassword ? "text" : "password"}
                        className="pl-10 pr-10"
                        required
                        data-testid="input-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                        data-testid="toggle-login-password-visibility"
                      >
                        {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="remember-me" />
                      <Label htmlFor="remember-me" className="text-sm">
                        {t('auth.login.rememberMe')}
                      </Label>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(true)}
                      className="text-sm text-primary hover:underline"
                      data-testid="link-forgot-password"
                    >
                      {t('auth.login.forgotPassword')}
                    </button>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-primary text-white hover:bg-blue-700"
                    disabled={loginMutation.isPending}
                    data-testid="button-login"
                  >
                    {loginMutation.isPending ? t('auth.login.buttonLoading') : t('auth.login.button')}
                  </Button>
                </form>
              </TabsContent>

              {/* Register Tab */}
              <TabsContent value="register">
                <CardHeader>
                  <CardTitle>{t('auth.register.title')}</CardTitle>
                  <CardDescription>
                    {t('auth.register.description')}
                  </CardDescription>
                </CardHeader>
                <form onSubmit={handleRegister} className="space-y-4" data-provider-form="true">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="first-name">{t('auth.register.firstName')}</Label>
                      <Input
                        id="first-name"
                        name="firstName"
                        type="text"
                        placeholder={t('auth.register.firstNamePlaceholder')}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="last-name">{t('auth.register.lastName')}</Label>
                      <Input
                        id="last-name"
                        name="lastName"
                        type="text"
                        placeholder={t('auth.register.lastNamePlaceholder')}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="username">{t('auth.register.username')}</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="username"
                        name="username"
                        type="text"
                        placeholder={t('auth.register.usernamePlaceholder')}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-email">{t('auth.register.email')}</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="register-email"
                        name="email"
                        type="email"
                        placeholder={t('auth.register.emailPlaceholder')}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">{t('auth.register.phone')}</Label>
                    <div className="flex gap-2">
                      <Select value={selectedCountryCode} onValueChange={setSelectedCountryCode}>
                        <SelectTrigger className="w-[140px]" data-testid="select-country-code">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {COUNTRY_CODES.map((country) => (
                            <SelectItem key={country.code} value={country.dialCode}>
                              <span className="flex items-center gap-2">
                                <span>{country.flag}</span>
                                <span>{country.dialCode}</span>
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className="relative flex-1">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          placeholder={t('auth.register.phonePlaceholder')}
                          className="pl-10"
                          data-testid="input-phone"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">{t('auth.register.country')}</Label>
                    <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                      <SelectTrigger data-testid="select-country">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {COUNTRIES.map((country) => (
                          <SelectItem key={country.code} value={country.code}>
                            <span className="flex items-center gap-2">
                              <span>{country.flag}</span>
                              <span>{country.nameEs}</span>
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {/* Mexican Address Structure */}
                  <div className="space-y-4 border-t pt-4">
                    <h3 className="font-semibold text-gray-700">{t('auth.register.addressSection')}</h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="condominio-maestro">{t('auth.register.condominioMaestro')}</Label>
                        <Input
                          id="condominio-maestro"
                          name="condominioMaestro"
                          type="text"
                          placeholder={t('auth.register.condominioMaestroPlaceholder')}
                          data-testid="input-condominio-maestro"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="condominio">{t('auth.register.condominio')}</Label>
                        <Input
                          id="condominio"
                          name="condominio"
                          type="text"
                          placeholder={t('auth.register.condominioPlaceholder')}
                          data-testid="input-condominio"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="edificio-area">{t('auth.register.edificioOArea')}</Label>
                      <Input
                        id="edificio-area"
                        name="edificioOArea"
                        type="text"
                        placeholder={t('auth.register.edificioOAreaPlaceholder')}
                        data-testid="input-edificio-area"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="calle">{t('auth.register.calle')}</Label>
                        <Input
                          id="calle"
                          name="calle"
                          type="text"
                          placeholder={t('auth.register.callePlaceholder')}
                          required
                          data-testid="input-calle"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="colonia">{t('auth.register.colonia')}</Label>
                        <Input
                          id="colonia"
                          name="colonia"
                          type="text"
                          placeholder={t('auth.register.coloniaPlaceholder')}
                          required
                          data-testid="input-colonia"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="codigo-postal">{t('auth.register.codigoPostal')}</Label>
                        <Input
                          id="codigo-postal"
                          name="codigoPostal"
                          type="text"
                          placeholder={t('auth.register.codigoPostalPlaceholder')}
                          required
                          data-testid="input-codigo-postal"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="numero-exterior">{t('auth.register.numeroExterior')}</Label>
                        <Input
                          id="numero-exterior"
                          name="numeroExterior"
                          type="text"
                          placeholder={t('auth.register.numeroExteriorPlaceholder')}
                          required
                          data-testid="input-numero-exterior"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="numero-interior">{t('auth.register.numeroInterior')}</Label>
                        <Input
                          id="numero-interior"
                          name="numeroInterior"
                          type="text"
                          placeholder={t('auth.register.numeroInteriorPlaceholder')}
                          data-testid="input-numero-interior"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="municipio">{t('auth.register.municipio')}</Label>
                        <Input
                          id="municipio"
                          name="municipio"
                          type="text"
                          placeholder={t('auth.register.municipioPlaceholder')}
                          required
                          data-testid="input-municipio"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="estado">{t('auth.register.estado')}</Label>
                        <Input
                          id="estado"
                          name="estado"
                          type="text"
                          placeholder={t('auth.register.estadoPlaceholder')}
                          required
                          data-testid="input-estado"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address-notes">{t('auth.register.addressNotes')}</Label>
                      <Input
                        id="address-notes"
                        name="addressNotes"
                        type="text"
                        placeholder={t('auth.register.addressNotesPlaceholder')}
                        data-testid="input-address-notes"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-password">{t('auth.register.password')}</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="register-password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        className="pl-10 pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                        data-testid="toggle-password-visibility"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">{t('auth.register.confirmPassword')}</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="confirm-password"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        className="pl-10 pr-10"
                        required
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
                  {/* Provider Option - Enhanced */}
                  <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-4 space-y-3 hover:border-orange-300 transition-colors">
                    <div className="flex items-center space-x-3">
                      <Checkbox id="provider-option" name="isProvider" className="w-5 h-5" />
                      <div className="flex items-center space-x-2">
                        <Briefcase className="w-5 h-5 text-orange-600" />
                        <Label htmlFor="provider-option" className="text-base font-semibold text-gray-800 cursor-pointer">
                          {t('auth.register.providerOption')}
                        </Label>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 ml-8">
                      {t('auth.register.providerDescription')}
                    </p>
                    <div className="flex items-center space-x-2 ml-8">
                      <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
                        {t('auth.register.providerBenefit1')}
                      </span>
                      <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
                        {t('auth.register.providerBenefit2')}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="terms" required />
                    <Label htmlFor="terms" className="text-sm">
                      {t('auth.register.termsPrefix')}{" "}
                      <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                        {t('auth.register.termsLink')}
                      </a>
                    </Label>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-primary text-white hover:bg-blue-700"
                    disabled={registerMutation.isPending}
                  >
                    {registerMutation.isPending ? t('auth.register.buttonLoading') : t('auth.register.button')}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="text-center">
          <Link href="/" className="text-primary hover:underline">
            {t('auth.header.backHome')}
          </Link>
        </div>
      </div>

      <ForgotPasswordDialog
        open={showForgotPassword}
        onOpenChange={setShowForgotPassword}
      />
    </div>
  );
}
