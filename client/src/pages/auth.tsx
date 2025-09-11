import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";

import { Mail, Lock, User, Phone, Building, MapPin, Briefcase } from "lucide-react";
import AppleMapsAddressInput from "@/components/apple-maps-address-input";

export default function Auth() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [buildingValue, setBuildingValue] = useState("");
  const [addressValue, setAddressValue] = useState("");
  const [isProviderRegistration, setIsProviderRegistration] = useState(false);

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
        title: "¡Cuenta creada exitosamente!",
        description: "Bienvenido a Referencias Locales. Ya puedes empezar a explorar servicios.",
      });
      
      // Store user ID for provider setup if needed
      if (data.user && isProviderRegistration) {
        sessionStorage.setItem('newUserId', data.user.id);
        setLocation("/provider-setup");
      } else {
        setLocation("/");
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error al crear la cuenta",
        description: error.message || "Hubo un problema al crear tu cuenta. Inténtalo de nuevo.",
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
      toast({
        title: "¡Bienvenido de vuelta!",
        description: "Has iniciado sesión exitosamente.",
      });
      setLocation("/");
    },
    onError: (error: any) => {
      toast({
        title: "Error al iniciar sesión",
        description: error.message || "Credenciales incorrectas. Verifica tu email y contraseña.",
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
        title: "Error en contraseñas",
        description: "Las contraseñas no coinciden. Por favor verifica e inténtalo de nuevo.",
        variant: "destructive",
      });
      return;
    }

    const isProvider = formData.get("isProvider") === "on";
    setIsProviderRegistration(isProvider);

    const userData = {
      username: formData.get("username") as string,
      email: formData.get("email") as string,
      password: password,
      fullName: `${formData.get("firstName")} ${formData.get("lastName")}`,
      address: addressValue,
      section: formData.get("section") as string,
      phone: formData.get("phone") as string,
      building: buildingValue,
      apartment: formData.get("apartment") as string,
      isProvider: isProvider,
    };

    registerMutation.mutate(userData);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link href="/" className="flex items-center justify-center space-x-3 mb-6">
            <img src="/logo.png" alt="Referencias Locales" className="w-14 h-14" />
            <span className="text-2xl font-bold text-gray-900">Referencias Locales</span>
          </Link>
          <h2 className="text-3xl font-bold text-gray-900">
            Únete a tu comunidad
          </h2>
          <p className="mt-2 text-gray-600">
            Conecta con servicios de confianza en tu edificio
          </p>
        </div>

        <Card>
          <CardContent className="p-6">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Iniciar Sesión</TabsTrigger>
                <TabsTrigger value="register">Registrarse</TabsTrigger>
              </TabsList>

              {/* Login Tab */}
              <TabsContent value="login">
                <CardHeader>
                  <CardTitle>Iniciar Sesión</CardTitle>
                  <CardDescription>
                    Ingresa tus credenciales para acceder a tu cuenta
                  </CardDescription>
                </CardHeader>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="tu@email.com"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Contraseña</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="login-password"
                        type="password"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="remember-me" />
                      <Label htmlFor="remember-me" className="text-sm">
                        Recordarme
                      </Label>
                    </div>
                    <a href="#" className="text-sm text-primary hover:underline">
                      ¿Olvidaste tu contraseña?
                    </a>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-primary text-white hover:bg-blue-700"
                  >
                    Iniciar Sesión
                  </Button>
                </form>
              </TabsContent>

              {/* Register Tab */}
              <TabsContent value="register">
                <CardHeader>
                  <CardTitle>Crear Cuenta</CardTitle>
                  <CardDescription>
                    Únete a tu comunidad de servicios locales
                  </CardDescription>
                </CardHeader>
                <form onSubmit={handleRegister} className="space-y-4" data-provider-form="true">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="first-name">Nombre</Label>
                      <Input
                        id="first-name"
                        name="firstName"
                        type="text"
                        placeholder="Juan"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="last-name">Apellido</Label>
                      <Input
                        id="last-name"
                        name="lastName"
                        type="text"
                        placeholder="Pérez"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="username">Nombre de Usuario</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="username"
                        name="username"
                        type="text"
                        placeholder="juanperez"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="register-email"
                        name="email"
                        type="email"
                        placeholder="tu@email.com"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Teléfono</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="+1234567890"
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Dirección Completa / Nombre de tu Condominio</Label>
                    <AppleMapsAddressInput
                      id="address"
                      name="address"
                      value={addressValue}
                      onChange={setAddressValue}
                      placeholder="Ej: Condominio Las Flores, Av. Principal 123, Colonia Centro"
                      required
                      testId="input-address"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="section">Sección</Label>
                    <Input
                      id="section"
                      name="section"
                      type="text"
                      placeholder="Ej: Norte, Sur, A, B, Torre 1"
                      data-testid="input-section"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="building">Edificio</Label>
                      <div className="relative">
                        <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          id="building"
                          name="building"
                          type="text"
                          placeholder="Ej: Torre Norte, Edificio A, Casa 123"
                          className="pl-10"
                          value={buildingValue}
                          onChange={(e) => setBuildingValue(e.target.value)}
                          data-testid="input-building"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="apartment">Apartamento</Label>
                      <Input
                        id="apartment"
                        name="apartment"
                        type="text"
                        placeholder="305"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-password">Contraseña</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="register-password"
                        name="password"
                        type="password"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirmar Contraseña</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="confirm-password"
                        name="confirmPassword"
                        type="password"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  {/* Provider Option - Enhanced */}
                  <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-4 space-y-3 hover:border-orange-300 transition-colors">
                    <div className="flex items-center space-x-3">
                      <Checkbox id="provider-option" name="isProvider" className="w-5 h-5" />
                      <div className="flex items-center space-x-2">
                        <Briefcase className="w-5 h-5 text-orange-600" />
                        <Label htmlFor="provider-option" className="text-base font-semibold text-gray-800 cursor-pointer">
                          ¿Quieres ofrecer servicios profesionales?
                        </Label>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 ml-8">
                      Únete como proveedor de servicios y conecta con vecinos que necesitan tu trabajo. 
                      Perfectecto para limpieza, tutorías, mantenimiento, cuidado infantil y más.
                    </p>
                    <div className="flex items-center space-x-2 ml-8">
                      <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
                        💰 Gana dinero extra
                      </span>
                      <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
                        👥 Ayuda a tu comunidad
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="terms" required />
                    <Label htmlFor="terms" className="text-sm">
                      Acepto los{" "}
                      <a href="#" className="text-primary hover:underline">
                        términos y condiciones
                      </a>
                    </Label>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-primary text-white hover:bg-blue-700"
                    disabled={registerMutation.isPending}
                  >
                    {registerMutation.isPending ? "Creando cuenta..." : "Crear Cuenta"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="text-center">
          <Link href="/" className="text-primary hover:underline">
            ← Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
