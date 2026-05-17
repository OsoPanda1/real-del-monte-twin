import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import ErrorBoundary from "./components/ErrorBoundary.tsx";
import Index from "./pages/Index.tsx";
import ExplorerView from "./pages/ExplorerView.tsx";
import AdminDashboard from "./pages/AdminDashboard.tsx";
import AuthPage from "./pages/AuthPage.tsx";
import IntegrationsPage from "./pages/IntegrationsPage.tsx";
import MerchantOnboardingPage from "./pages/MerchantOnboardingPage.tsx";
import NewsListPage from "./pages/NewsListPage.tsx";
import NewsDetailPage from "./pages/NewsDetailPage.tsx";
import EventsPage from "./pages/EventsPage.tsx";
import RoutesPage from "./pages/RoutesPage.tsx";
import ForumPage from "./pages/ForumPage.tsx";
import ForumThreadPage from "./pages/ForumThreadPage.tsx";
import CulturalPage from "./pages/CulturalPage.tsx";
import ProtectedRoute from "./components/ProtectedRoute.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ErrorBoundary>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/explorer" element={<ExplorerView />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/integraciones" element={<IntegrationsPage />} />
            <Route path="/comerciante" element={<MerchantOnboardingPage />} />
            <Route path="/noticias" element={<NewsListPage />} />
            <Route path="/noticias/:id" element={<NewsDetailPage />} />
            <Route path="/eventos" element={<EventsPage />} />
            <Route path="/rutas" element={<RoutesPage />} />
            <Route path="/foros" element={<ForumPage />} />
            <Route path="/foros/:id" element={<ForumThreadPage />} />
            <Route path="/cultural" element={<CulturalPage />} />
            <Route path="/cultural/:id" element={<CulturalPage />} />
            <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
    </ErrorBoundary>
  </QueryClientProvider>
);

export default App;
