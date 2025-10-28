import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Menu, User, LogIn, LogOut, Sparkles, MessageCircle, HelpCircle, Shield, MoreHorizontal, Calendar, BookOpen } from "lucide-react";
import { useOnboarding } from "@/hooks/use-onboarding";
import { LanguageToggle } from "@/components/language-toggle";
import InviteButton from "@/components/invite-button";
import { useLanguage } from "@/hooks/use-language";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import NotificationBadge from "@/components/notification-badge";
import MessageAlertMonitor from "@/components/message-alert-monitor";

export default function Header() {
  const [location, setLocation] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const { startOnboarding } = useOnboarding();
  const { t } = useLanguage();
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const userId = (user as any)?.id;
  const isAdmin = (user as any)?.isAdmin;

  // Fetch unread message counts
  const { data: unreadMessagesData } = useQuery<{ count: number }>({
    queryKey: [`/api/messages/user/${userId}/unread-count`],
    enabled: !!userId && isAuthenticated,
    refetchInterval: 10000, // Poll every 10 seconds
  });

  const { data: unreadAdminMessagesData } = useQuery<{ count: number }>({
    queryKey: isAdmin 
      ? [`/api/admin-messages/admin-unread-count`]
      : [`/api/admin-messages/user/${userId}/unread-count`],
    enabled: !!userId && isAuthenticated,
    refetchInterval: 10000, // Poll every 10 seconds
  });

  const unreadMessagesCount = unreadMessagesData?.count || 0;
  const unreadAdminMessagesCount = unreadAdminMessagesData?.count || 0;

  const handleLogout = async () => {
    try {
      await apiRequest("POST", "/api/auth/logout");
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

  // Primary navigation - always visible
  const primaryNavItems = [
    { href: "/services", label: t('nav.services') },
    { href: "/como-funciona", label: t('nav.howItWorks') },
    { href: "/providers", label: t('nav.providers') },
    { href: "/testimonials", label: t('nav.testimonials') },
  ];
  
  // Secondary navigation - in "More" dropdown
  const secondaryNavItems = [
    { href: "/bookings", label: t('nav.bookings'), icon: Calendar },
    { href: "/messages", label: t('nav.messages'), icon: MessageCircle },
    { href: "/faq", label: t('nav.faq'), icon: BookOpen },
    { href: "/contact-admin", label: t('nav.contactAdmin'), icon: HelpCircle },
  ];
  
  // All nav items for mobile menu
  const allNavItems = [...primaryNavItems, ...secondaryNavItems];
  
  // Admin-only navigation item
  const adminNavItem = { href: "/admin-dashboard", label: t('nav.adminDashboard'), icon: Shield };

  return (
    <>
      {/* Message alert monitor - invisible component that shows toast notifications */}
      {isAuthenticated && <MessageAlertMonitor />}
      
      <header className="bg-white shadow-sm sticky top-0 z-50">
        {/* Utility Bar - Top Row (Desktop Only) */}
      <div className="hidden lg:block border-b border-gray-100 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-end items-center h-10 space-x-2">
            <LanguageToggle />
            <InviteButton />
            
            {isAuthenticated ? (
              <>
                <Link href="/profile">
                  <Button variant="ghost" size="sm" className="text-xs text-gray-700 hover:text-accent hover:bg-orange-50" data-testid="button-profile">
                    <User className="w-3.5 h-3.5 mr-1.5" />
                    {(user as any)?.fullName || (user as any)?.username || 'Perfil'}
                  </Button>
                </Link>
                <Button 
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="text-xs text-gray-700 hover:text-red-600 hover:bg-red-50" 
                  data-testid="button-logout"
                >
                  <LogOut className="w-3.5 h-3.5 mr-1.5" />
                  {t('nav.logout')}
                </Button>
              </>
            ) : (
              <>
                <Link href="/auth">
                  <Button variant="ghost" size="sm" className="text-xs text-gray-700 hover:text-accent hover:bg-orange-50" data-testid="button-login">
                    <LogIn className="w-3.5 h-3.5 mr-1.5" />
                    {t('nav.login')}
                  </Button>
                </Link>
                <Link href="/auth">
                  <Button size="sm" className="text-xs bg-blue-600 text-white hover:bg-blue-700" data-testid="button-register">
                    {t('auth.register.tab')}
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Navigation - Bottom Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 hover-scale group" data-testid="nav-logo">
            <img src="/logo.png" alt="Referencias Locales" className="w-12 h-12 transition-transform group-hover:rotate-6" />
            <span className="text-xl font-bold text-gray-900 transition-colors group-hover:text-primary">Referencias Locales</span>
          </Link>
          
          {/* Desktop Primary Navigation + More Dropdown */}
          <nav className="hidden lg:flex items-center space-x-3">
            {primaryNavItems.map((item, index) => (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-tab nav-item-enter ${
                  location === item.href ? "active" : ""
                } px-3 py-2 relative text-sm font-medium whitespace-nowrap`}
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
            
            {/* Messages Icon - Standalone and always visible */}
            {isAuthenticated && (
              <Link href="/messages">
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative text-gray-700 hover:text-primary hover:bg-orange-50"
                  data-testid="button-messages-desktop"
                >
                  <MessageCircle className="w-5 h-5" />
                  {unreadMessagesCount > 0 && (
                    <span 
                      className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold animate-pulse shadow-lg"
                      data-testid="badge-unread-messages"
                    >
                      {unreadMessagesCount > 9 ? '9+' : unreadMessagesCount}
                    </span>
                  )}
                </Button>
              </Link>
            )}
            
            {/* More Dropdown for Other Secondary Items */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="text-sm font-medium text-gray-700 hover:text-primary px-3"
                  data-testid="button-more-menu"
                >
                  <MoreHorizontal className="w-4 h-4 mr-1.5" />
                  {t('nav.more')}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {secondaryNavItems.filter(item => item.href !== "/messages").map((item) => (
                  <DropdownMenuItem key={item.href} asChild>
                    <Link 
                      href={item.href}
                      className="flex items-center cursor-pointer relative"
                      data-testid={`dropdown-link-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      {item.icon && <item.icon className="w-4 h-4 mr-2" />}
                      <span>{item.label}</span>
                      {item.href === "/contact-admin" && unreadAdminMessagesCount > 0 && !isAdmin && (
                        <NotificationBadge count={unreadAdminMessagesCount} className="-top-1 -right-1" />
                      )}
                    </Link>
                  </DropdownMenuItem>
                ))}
                {(user as any)?.isAdmin && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link 
                        href={adminNavItem.href}
                        className="flex items-center cursor-pointer relative"
                        data-testid="dropdown-link-admin-dashboard"
                      >
                        <Shield className="w-4 h-4 mr-2" />
                        <span>{adminNavItem.label}</span>
                        {unreadAdminMessagesCount > 0 && (
                          <NotificationBadge count={unreadAdminMessagesCount} className="-top-1 -right-1" />
                        )}
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>

          {/* Mobile Menu Button */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden relative" data-testid="button-mobile-menu">
                <Menu className="w-5 h-5" />
                {isAuthenticated && (unreadMessagesCount > 0 || unreadAdminMessagesCount > 0) && (
                  <span 
                    className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold animate-pulse shadow-lg"
                    data-testid="badge-mobile-menu-notification"
                  >
                    {(unreadMessagesCount + unreadAdminMessagesCount) > 9 ? '9+' : (unreadMessagesCount + unreadAdminMessagesCount)}
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px]">
              <div className="flex flex-col space-y-4 mt-8">
                {allNavItems.map((item, index) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`mobile-menu-item text-left p-3 rounded-lg transition-all duration-300 transform relative ${
                      location === item.href
                        ? "text-primary bg-gradient-to-r from-primary/10 to-accent/5 font-semibold border-l-4 border-primary shadow-sm scale-105"
                        : "text-gray-700 hover:text-primary hover:bg-gradient-to-r hover:from-gray-50 hover:to-orange-50 hover:scale-102 hover:shadow-sm"
                    }`}
                    style={{
                      animationDelay: `${index * 0.1}s`
                    }}
                    data-testid={`mobile-link-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="block transition-transform duration-200">
                        {item.label}
                      </span>
                      {item.href === "/messages" && unreadMessagesCount > 0 && (
                        <span 
                          className="bg-red-500 text-white text-xs rounded-full px-2 py-1 font-semibold animate-pulse shadow-lg"
                          data-testid="badge-unread-messages-mobile"
                        >
                          {unreadMessagesCount > 9 ? '9+' : unreadMessagesCount}
                        </span>
                      )}
                      {item.href === "/contact-admin" && unreadAdminMessagesCount > 0 && !isAdmin && (
                        <span 
                          className="bg-red-500 text-white text-xs rounded-full px-2 py-1 font-semibold animate-pulse shadow-lg"
                        >
                          {unreadAdminMessagesCount > 9 ? '9+' : unreadAdminMessagesCount}
                        </span>
                      )}
                    </div>
                  </Link>
                ))}
                {(user as any)?.isAdmin && (
                  <Link
                    href={adminNavItem.href}
                    onClick={() => setIsOpen(false)}
                    className={`mobile-menu-item text-left p-3 rounded-lg transition-all duration-300 transform flex items-center gap-2 relative ${
                      location === adminNavItem.href
                        ? "text-primary bg-gradient-to-r from-primary/10 to-accent/5 font-semibold border-l-4 border-primary shadow-sm scale-105"
                        : "text-gray-700 hover:text-primary hover:bg-gradient-to-r hover:from-gray-50 hover:to-orange-50 hover:scale-102 hover:shadow-sm"
                    }`}
                    data-testid="mobile-link-admin-dashboard"
                  >
                    <Shield className="w-4 h-4" />
                    <span className="block transition-transform duration-200">
                      {adminNavItem.label}
                    </span>
                    {unreadAdminMessagesCount > 0 && (
                      <NotificationBadge count={unreadAdminMessagesCount} className="top-2 right-2" />
                    )}
                  </Link>
                )}
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
                      className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                      data-testid="button-logout-mobile"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      {t('nav.logout')}
                    </Button>
                  </>
                ) : (
                  <>
                    <Link href="/auth" onClick={() => setIsOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start" data-testid="button-login-mobile">
                        <LogIn className="w-4 h-4 mr-2" />
                        {t('nav.login')}
                      </Button>
                    </Link>
                    <Link href="/auth" onClick={() => setIsOpen(false)}>
                      <Button className="w-full bg-gradient-to-r from-primary to-blue-600 text-white hover:from-blue-600 hover:to-primary shadow-md" data-testid="button-register-mobile">
                        {t('auth.register.tab')}
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
    </>
  );
}
