import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Services from "@/pages/services";
import Providers from "@/pages/providers";
import ProviderDetail from "@/pages/provider-detail";
import ReviewDemo from "@/pages/review-demo";
import Profile from "@/pages/profile";
import Auth from "@/pages/auth";
import Testimonials from "@/pages/testimonials";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/services" component={Services} />
      <Route path="/providers" component={Providers} />
      <Route path="/providers/:id" component={ProviderDetail} />
      <Route path="/review-demo" component={ReviewDemo} />
      <Route path="/testimonials" component={Testimonials} />
      <Route path="/profile" component={Profile} />
      <Route path="/auth" component={Auth} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
