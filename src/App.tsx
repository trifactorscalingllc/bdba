import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import ErrorBoundary from "@/components/ErrorBoundary";
import Index from "./pages/Index.tsx";
import Apply from "./pages/Apply.tsx";
import Intro from "./pages/Intro.tsx";
import ThankYouApply from "./pages/ThankYouApply.tsx";
import CaseStudies from "./pages/CaseStudies.tsx";
import NotFound from "./pages/NotFound.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import StudentDashboard from "./pages/StudentDashboard.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Marketing site — UNTOUCHED. */}
            <Route path="/" element={<Index />} />
            <Route path="/apply" element={<Apply />} />
            <Route path="/intro" element={<Intro />} />

            {/* Post-application flow. */}
            <Route path="/thank-you-apply" element={<ThankYouApply />} />
            <Route path="/case-studies" element={<CaseStudies />} />

            {/* Auth */}
            <Route path="/login" element={<Login />} />

            {/* Dashboard — auth-gated, noindex/nofollow. */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <ErrorBoundary scope="dashboard">
                    <Dashboard />
                  </ErrorBoundary>
                </ProtectedRoute>
              }
            />

            <Route
              path="/dashboard/student/:slug"
              element={
                <ProtectedRoute>
                  <ErrorBoundary scope="student-dashboard">
                    <StudentDashboard />
                  </ErrorBoundary>
                </ProtectedRoute>
              }
            />

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
