import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import Dashboard from "@/pages/Dashboard";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import CookieNotice from "@/pages/CookieNotice";
import TermsOfUse from "@/pages/TermsOfUse";
import Disclaimer from "@/pages/Disclaimer";
import About from "@/pages/About";
import NotFound from "@/pages/not-found";

import { ErrorBoundary } from "@/components/ErrorBoundary";

function Router() {
  return (
    <Switch>
      <Route path="/" component={() => (
        <ErrorBoundary>
          <Dashboard />
        </ErrorBoundary>
      )} />
      <Route path="/privacy-policy" component={PrivacyPolicy} />
      <Route path="/cookie-notice" component={CookieNotice} />
      <Route path="/terms-of-use" component={TermsOfUse} />
      <Route path="/disclaimer" component={Disclaimer} />
      <Route path="/about" component={About} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
