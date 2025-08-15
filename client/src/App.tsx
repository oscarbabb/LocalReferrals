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
import ReviewDemo from "@/pages/review-demo";
import Profile from "@/pages/profile";
import Auth from "@/pages/auth";
import Bookings from "@/pages/bookings";
import BookingDemoPage from "@/pages/booking-demo";
import PaymentMethods from "@/pages/payment-methods";
import Testimonials from "@/pages/testimonials";
import HowItWorks from "@/pages/how-it-works";
import ProviderVerification from "@/pages/provider-verification";
import Header from "@/components/header";

function Router() {
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
        <Route path="/verification" component={ProviderVerification} />
        <Route path="/bookings" component={Bookings} />
        <Route path="/booking-demo" component={BookingDemoPage} />
        <Route path="/payment-methods" component={PaymentMethods} />
        <Route path="/profile" component={Profile} />
        <Route path="/auth" component={Auth} />
        <Route component={NotFound} />
      </Switch>
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
