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

          {/* Post-application flow. /thank-you-apply is the Typeform redirect
              target and embeds Calendly. On successful booking it stores a
              sessionStorage token and forwards to /case-studies, which is
              token-gated (bounces to / without the token). Both pages are
              noindex/nofollow. */}
          <Route path="/thank-you-apply" element={<ThankYouApply />} />
          <Route path="/case-studies" element={<CaseStudies />} />

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

          {/* Per-student drill-down view, linked from the coach Health Bar
              cards. Same auth/RLS profile as /dashboard. */}
          <Route
            path="/dashboard/student/:slug"
            element={
              <ErrorBoundary scope="student-dashboard">
                <StudentDashboard />
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
