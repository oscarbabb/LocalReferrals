import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/components/language-provider";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Services from "@/pages/services";
import Providers from "@/pages/providers";
import ProviderDetail from "@/pages/provider-detail";
import Profile from "@/pages/profile";
import Auth from "@/pages/auth";
import Bookings from "@/pages/bookings";
import Checkout from "@/pages/checkout";
import PaymentSuccess from "@/pages/payment-success";
import PaymentMethods from "@/pages/payment-methods";
import MenuManagement from "@/pages/menu-management";
import Testimonials from "@/pages/testimonials";
import HowItWorks from "@/pages/how-it-works";
import ProviderVerification from "@/pages/provider-verification";
import ProviderSetup from "@/pages/provider-setup";
import ReviewDemo from "@/pages/review-demo";
import EmergencyFix from "@/pages/emergency-fix";
import Header from "@/components/header";
import OnboardingTour from "@/components/onboarding-tour";
import { useOnboarding } from "@/hooks/use-onboarding";

function Router() {
  const { showOnboarding, completeOnboarding } = useOnboarding();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/services" component={Services} />
        <Route path="/providers" component={Providers} />
        <Route path="/providers/:id" component={ProviderDetail} />
        <Route path="/review-demo" component={ReviewDemo} />
        <Route path="/testimonials" component={Testimonials} />
        <Route path="/como-funciona" component={HowItWorks} />
        <Route path="/emergency-fix" component={EmergencyFix} />
        <Route path="/verification" component={ProviderVerification} />
        <Route path="/provider-setup" component={ProviderSetup} />
        <Route path="/bookings" component={Bookings} />
        <Route path="/checkout" component={Checkout} />
        <Route path="/payment-success" component={PaymentSuccess} />
        <Route path="/payment-methods" component={PaymentMethods} />
        <Route path="/menu-management" component={MenuManagement} />
        <Route path="/profile" component={Profile} />
        <Route path="/auth" component={Auth} />
        <Route component={NotFound} />
      </Switch>
      
      <OnboardingTour 
        isOpen={showOnboarding} 
        onClose={completeOnboarding} 
      />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
