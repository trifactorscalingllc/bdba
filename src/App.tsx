import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useParams } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import ErrorBoundary from "@/components/ErrorBoundary";
import { AuthProvider } from "@/lib/auth";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index.tsx";
import Apply from "./pages/Apply.tsx";
import Intro from "./pages/Intro.tsx";
import ThankYouApply from "./pages/ThankYouApply.tsx";
import CaseStudies from "./pages/CaseStudies.tsx";
import NotFound from "./pages/NotFound.tsx";
import Login from "./pages/Login.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import StudentDashboard from "./pages/StudentDashboard.tsx";

const queryClient = new QueryClient();

// Wraps StudentDashboard with a ProtectedRoute that scopes by the :slug URL
// param. Coach passes through (sees any student); a student only passes if
// the URL slug matches their own profile.slug. Anyone else gets bounced to
// their own student page (or /login if not signed in).
function StudentDashboardGuarded() {
  const { slug } = useParams<{ slug: string }>();
  return (
    <ProtectedRoute requireSlug={slug}>
      <ErrorBoundary scope="student-dashboard">
        <StudentDashboard />
      </ErrorBoundary>
    </ProtectedRoute>
  );
}

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

            {/* Auth — direct-URL only, noindex/nofollow. */}
            <Route path="/login" element={<Login />} />

            {/* Coach-only main dashboard. Students who hit this get bounced
                to their own /dashboard/student/<slug> by ProtectedRoute. */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute requireRole="coach">
                  <ErrorBoundary scope="dashboard">
                    <Dashboard />
                  </ErrorBoundary>
                </ProtectedRoute>
              }
            />

            {/* Per-student page. Coach can open any slug; student can only
                open their own. Mismatch → bounced to their own page. */}
            <Route
              path="/dashboard/student/:slug"
              element={<StudentDashboardGuarded />}
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
