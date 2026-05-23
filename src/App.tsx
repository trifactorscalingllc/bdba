import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import ErrorBoundary from "@/components/ErrorBoundary";
import Index from "./pages/Index.tsx";
import Apply from "./pages/Apply.tsx";
import Intro from "./pages/Intro.tsx";
import NotFound from "./pages/NotFound.tsx";
import Dashboard from "./pages/Dashboard.tsx";

// D-061 (2026-05-23): Auth temporarily removed. /dashboard is now reachable
// by direct URL without sign-in. Re-enable by:
//   1. dropping the public_read_*_TEMPORARY_D061 policies (see
//      supabase/migrations/20260523200000_temporary_public_dashboard.sql)
//   2. restoring the AuthProvider + ProtectedRoute wrappers below
//   3. restoring the /login route (Login.tsx still exists in the repo)
//   4. restoring useAuth() in Dashboard.tsx (commit history has the pattern)

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Marketing site — UNTOUCHED. */}
          <Route path="/" element={<Index />} />
          <Route path="/apply" element={<Apply />} />
          <Route path="/intro" element={<Intro />} />

          {/* Dashboard — direct-URL only, unlinked from marketing site,
              noindex/nofollow. ErrorBoundary still wraps to capture any
              render errors into public.app_errors. */}
          <Route
            path="/dashboard"
            element={
              <ErrorBoundary scope="dashboard">
                <Dashboard />
              </ErrorBoundary>
            }
          />

          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
