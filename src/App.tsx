import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Billing from "./pages/Billing";
import Properties from "./pages/Properties";
import PropertyDetails from "./pages/PropertyDetails";
import Condos from "./pages/Condos";
import Tenants from "./pages/Tenants";
import TenantDetails from "./pages/TenantDetails";
import Financial from "./pages/Financial";
import Reports from "./pages/Reports";
import Maintenance from "./pages/Maintenance";
import Settings from "./pages/Settings";
import Contracts from "./pages/Contracts";
import Calendar from "./pages/Calendar";
import Alerts from "./pages/Alerts";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner position="top-right" />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/billing" element={<Billing />} />
          <Route path="/properties" element={<Properties />} />
          <Route path="/properties/:id" element={<PropertyDetails />} />
          <Route path="/condos" element={<Condos />} />
          <Route path="/tenants" element={<Tenants />} />
          <Route path="/tenants/:id" element={<TenantDetails />} />
          <Route path="/maintenance" element={<Maintenance />} />
          <Route path="/financial" element={<Financial />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/contracts" element={<Contracts />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;