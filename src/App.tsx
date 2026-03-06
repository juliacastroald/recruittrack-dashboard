import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ContactsProvider } from "@/contexts/ContactsContext";
import { QuickNotesProvider } from "@/contexts/QuickNotesContext";
import { CompaniesProvider } from "@/contexts/CompaniesContext";
import AppLayout from "./components/AppLayout";
import Dashboard from "./pages/Dashboard";
import Networking from "./pages/Networking";
import Companies from "./pages/Companies";
import CompanyDetail from "./pages/CompanyDetail";
import Analytics from "./pages/Analytics";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ContactsProvider>
          <QuickNotesProvider>
            <CompaniesProvider>
              <Routes>
            <Route element={<AppLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/networking" element={<Networking />} />
              <Route path="/companies" element={<Companies />} />
              <Route path="/company/:id" element={<CompanyDetail />} />
              <Route path="/analytics" element={<Analytics />} />
            </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </CompaniesProvider>
        </QuickNotesProvider>
        </ContactsProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
