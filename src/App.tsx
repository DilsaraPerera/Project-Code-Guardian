import { useState, useCallback } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { WelcomeLoader } from "@/components/WelcomeLoader";
import Dashboard from "./pages/Dashboard";
import Scan from "./pages/Scan";
import Dependencies from "./pages/Dependencies";
import Vulnerabilities from "./pages/Vulnerabilities";
import Graph from "./pages/Graph";
import History from "./pages/History";
import ScanDetail from "./pages/ScanDetail";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const [showLoader, setShowLoader] = useState(true);

  const handleLoaderComplete = useCallback(() => {
    setShowLoader(false);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        {showLoader && <WelcomeLoader onComplete={handleLoaderComplete} />}
        <BrowserRouter>
          <AppLayout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/scan" element={<Scan />} />
              <Route path="/dependencies" element={<Dependencies />} />
              <Route path="/vulnerabilities" element={<Vulnerabilities />} />
              <Route path="/graph" element={<Graph />} />
              <Route path="/history" element={<History />} />
              <Route path="/history/:scanId" element={<ScanDetail />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AppLayout>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
