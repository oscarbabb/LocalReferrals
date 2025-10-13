import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, User, LogIn, LogOut, Sparkles, MessageCircle } from "lucide-react";
import { useOnboarding } from "@/hooks/use-onboarding";
import { LanguageToggle } from "@/components/language-toggle";
import InviteButton from "@/components/invite-button";
import { useLanguage } from "@/hooks/use-language";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Header() {
  const [location, setLocation] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const { startOnboarding } = useOnboarding();
  const { t } = useLanguage();
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await apiRequest("POST", "/api/auth/logout");
      // Clear all cached data
      queryClient.clear();
      toast({
        title: t('nav.logoutToastTitle'),
        description: t('nav.logoutToastSuccess'),
      });
      setLocation("/");
    } catch (error) {
      toast({
        title: t('nav.logoutToastError'),
        description: t('nav.logoutToastErrorDesc'),
        variant: "destructive",
      });
    }
  };

  const navItems = [
    { href: "/services", label: t('nav.services') },
    { href: "/como-funciona", label: t('nav.howItWorks') },
    { href: "/providers", label: t('nav.providers') },
    { href: "/bookings", label: t('nav.bookings') },
    { href: "/messages", label: t('nav.messages'), icon: MessageCircle },
    { href: "/testimonials", label: t('nav.testimonials') },
  ];

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-3 hover-scale group" data-testid="nav-logo">
            <img src="/logo.png" alt="Referencias Locales" className="w-12 h-12 transition-transform group-hover:rotate-6" />
            <span className="text-xl font-bold text-gray-900 transition-colors group-hover:text-primary">Referencias Locales</span>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-2">
            {navItems.map((item, index) => (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-tab nav-item-enter ${
                  location === item.href ? "active" : ""
                } px-2 py-2 relative text-xs font-medium whitespace-nowrap`}
                style={{
                  animationDelay: `${index * 0.1}s`
                }}
                data-testid={`nav-link-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <span className="nav-tab-text">
                  {item.label}
                </span>
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center space-x-2">
            <LanguageToggle />
            <InviteButton />
            
            {isAuthenticated ? (
              <>
                <Link href="/profile">
                  <Button variant="ghost" className="text-gray-700 hover:text-accent hover:bg-orange-50 btn-enhance transition-all duration-300" data-testid="button-profile">
                    <User className="w-4 h-4 mr-2" />
                    {(user as any)?.fullName || (user as any)?.username || 'Perfil'}
                  </Button>
                </Link>
                <Button 
                  variant="ghost" 
                  onClick={handleLogout}
                  className="text-gray-700 hover:text-red-600 hover:bg-red-50 btn-enhance transition-all duration-300" 
                  data-testid="button-logout"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  {t('nav.logout')}
                </Button>
              </>
            ) : (
              <>
                <Link href="/auth">
                  <Button variant="ghost" className="text-gray-700 hover:text-accent hover:bg-orange-50 btn-enhance transition-all duration-300" data-testid="button-login">
                    <LogIn className="w-4 h-4 mr-2 transition-transform hover:translate-x-1" />
                    {t('nav.login')}
                  </Button>
                </Link>
                <Link href="/auth">
                  <Button className="bg-gradient-to-r from-primary to-blue-600 text-white hover:from-blue-600 hover:to-primary shadow-md btn-enhance hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300" data-testid="button-register">
                    {t('auth.register')}
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px]">
              <div className="flex flex-col space-y-4 mt-8">
                {navItems.map((item, index) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`mobile-menu-item text-left p-3 rounded-lg transition-all duration-300 transform ${
                      location === item.href
                        ? "text-primary bg-gradient-to-r from-primary/10 to-accent/5 font-semibold border-l-4 border-primary shadow-sm scale-105"
                        : "text-gray-700 hover:text-primary hover:bg-gradient-to-r hover:from-gray-50 hover:to-orange-50 hover:scale-102 hover:shadow-sm"
                    }`}
                    style={{
                      animationDelay: `${index * 0.1}s`
                    }}
                  >
                    <span className="block transition-transform duration-200">
                      {item.label}
                    </span>
                  </Link>
                ))}
                <hr className="my-4" />
                <div className="flex items-center justify-center mb-4">
                  <LanguageToggle />
                </div>
                <div className="mb-2">
                  <InviteButton />
                </div>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-gray-600 hover:text-orange-600"
                  onClick={() => {
                    setIsOpen(false);
                    startOnboarding();
                  }}
                  data-testid="button-start-tour-mobile"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  {t('nav.tour')}
                </Button>
                
                {isAuthenticated ? (
                  <>
                    <Link href="/profile" onClick={() => setIsOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start" data-testid="button-profile-mobile">
                        <User className="w-4 h-4 mr-2" />
                        {(user as any)?.fullName || (user as any)?.username || 'Perfil'}
                      </Button>
                    </Link>
                    <Button 
                      variant="ghost" 
                      onClick={() => {
                        setIsOpen(false);
                        handleLogout();
                      }}
                      className="w-full justify-start text-red-600 hover:text-red-700" 
                      data-testid="button-logout-mobile"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      {t('nav.logout')}
                    </Button>
                  </>
                ) : (
                  <>
                    <Link href="/auth" onClick={() => setIsOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start">
                        <LogIn className="w-4 h-4 mr-2" />
                        {t('nav.login')}
                      </Button>
                    </Link>
                    <Link href="/auth" onClick={() => setIsOpen(false)}>
                      <Button className="w-full bg-primary text-white">
                        {t('auth.register')}
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
